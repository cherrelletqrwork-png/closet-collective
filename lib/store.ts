import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import type {
  Listing,
  ListingInput,
  Order,
  OrderInput,
  SiteContent,
} from "./types";
import { DEFAULT_SITE_CONTENT } from "./content";
import { SEED_LISTINGS } from "./seed";
import { getSupabase, isSupabaseConfigured } from "./supabase";

// Data access layer. When Supabase env vars are present all reads/writes go
// to the `listings` table and photos go to the `listing-photos` storage
// bucket. Without them the site runs in demo mode against an in-memory copy
// of the seed data (changes reset when the server restarts).

const globalStore = globalThis as unknown as {
  __ccListings?: Listing[];
  __ccOrders?: Order[];
  __ccSiteContent?: SiteContent;
};

function demoListings(): Listing[] {
  if (!globalStore.__ccListings) {
    globalStore.__ccListings = SEED_LISTINGS.map((l) => ({ ...l }));
  }
  return globalStore.__ccListings;
}

function demoOrders(): Order[] {
  if (!globalStore.__ccOrders) globalStore.__ccOrders = [];
  return globalStore.__ccOrders;
}

function demoSiteContent(): SiteContent {
  if (!globalStore.__ccSiteContent) {
    globalStore.__ccSiteContent = { ...DEFAULT_SITE_CONTENT };
  }
  return globalStore.__ccSiteContent;
}

function sortNewest(listings: Listing[]): Listing[] {
  return [...listings].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// Accept any image subtype (jpeg/png/webp/…). The admin form converts
// uploads to JPEG before sending, but we stay liberal in what we accept.
const DATA_URL_RE = /^data:image\/([a-z0-9.+-]+);base64,/i;

// Photos arrive from the admin form as base64 data URLs. In Supabase mode
// they are uploaded to storage and swapped for a public URL; in demo mode
// the data URL is kept as-is.
async function resolveImage(image: string): Promise<string> {
  const match = image.match(DATA_URL_RE);
  if (!match || !isSupabaseConfigured()) return image;

  const subtype = match[1].toLowerCase();
  const ext = subtype === "jpeg" ? "jpg" : subtype;
  const path = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(image.slice(match[0].length), "base64");

  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from("listing-photos")
    .upload(path, buffer, { contentType: `image/${subtype}` });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  return supabase.storage.from("listing-photos").getPublicUrl(path).data
    .publicUrl;
}

// True when a write failed only because the `images` column is missing
// (multi-photo migration not run yet). Used to retry with cover-only.
// Covers both the raw Postgres error and PostgREST's schema-cache wording.
function isMissingImagesColumn(error: { message?: string }): boolean {
  const message = error.message ?? "";
  return (
    /column .*images.* does not exist/i.test(message) ||
    /find the 'images' column/i.test(message)
  );
}

async function resolveImages(images: string[]): Promise<string[]> {
  const resolved: string[] = [];
  for (const image of images) resolved.push(await resolveImage(image));
  return resolved;
}

// Older rows (and the cover-only code paths) may carry just `image`. Make
// sure every listing handed out has a populated `images` array with the
// cover first.
function withImages(listing: Listing): Listing {
  const images =
    Array.isArray(listing.images) && listing.images.length > 0
      ? listing.images
      : listing.image
        ? [listing.image]
        : [];
  return { ...listing, images, image: images[0] ?? listing.image };
}

// Build the {image, images} pair to persist from whatever the form sent.
function imageFields(input: { image?: string; images?: string[] }): {
  image: string;
  images: string[];
} {
  const images = (input.images?.length ? input.images : input.image ? [input.image] : []).filter(
    Boolean
  );
  return { image: images[0] ?? input.image ?? "", images };
}

// ── First-come-first-served checkout holds ────────────────
// Every piece is one-of-one, so Buy Now "claims" the listing (available →
// reserved) before Stripe checkout opens. The hold matches the checkout
// session lifetime; if payment doesn't arrive in time the listing is
// released back to available by the lazy sweep below.
export const HOLD_MINUTES = 30;

function holdCutoffIso(): string {
  return new Date(Date.now() - HOLD_MINUTES * 60 * 1000).toISOString();
}

// Atomically claim an available listing for checkout. Returns false when
// somebody else got there first.
export async function claimListing(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const listing = demoListings().find((l) => l.id === id);
    if (!listing || listing.status !== "available") return false;
    listing.status = "reserved";
    return true;
  }

  // The status filter makes this a compare-and-swap: only one of two
  // simultaneous buyers can move the row from available to reserved.
  const { data, error } = await getSupabase()
    .from("listings")
    .update({ status: "reserved" })
    .eq("id", id)
    .eq("status", "available")
    .select("id");
  if (error) throw new Error(`Failed to reserve listing: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

// Cancel a pending web order (buyer backed out of checkout, or the session
// expired) and free its listing unless another checkout is still active.
export async function cancelOrder(orderId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const order = demoOrders().find(
      (o) => o.id === orderId && o.status === "pending"
    );
    if (!order) return;
    order.status = "cancelled";
    const stillHeld = demoOrders().some(
      (o) => o.listing_id === order.listing_id && o.status === "pending"
    );
    const listing = demoListings().find((l) => l.id === order.listing_id);
    if (listing && listing.status === "reserved" && !stillHeld) {
      listing.status = "available";
    }
    return;
  }

  const supabase = getSupabase();
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("listing_id")
    .maybeSingle();
  if (error) throw new Error(`Failed to cancel order: ${error.message}`);
  if (!order?.listing_id) return;

  const { data: active, error: activeError } = await supabase
    .from("orders")
    .select("id")
    .eq("listing_id", order.listing_id)
    .eq("status", "pending")
    .limit(1);
  if (activeError) {
    throw new Error(`Failed to check holds: ${activeError.message}`);
  }
  if (active && active.length > 0) return;

  const { error: releaseError } = await supabase
    .from("listings")
    .update({ status: "available" })
    .eq("id", order.listing_id)
    .eq("status", "reserved");
  if (releaseError) {
    throw new Error(`Failed to release listing: ${releaseError.message}`);
  }
}

// Lazy sweep run on listing reads: cancel checkout holds that outlived the
// payment window and put their pieces back up for grabs. Listings a seller
// reserved by hand (no web order behind them) are left alone.
async function releaseExpiredHolds(): Promise<void> {
  if (!isSupabaseConfigured()) {
    const cutoff = holdCutoffIso();
    const expired = demoOrders().filter(
      (o) => o.status === "pending" && o.created_at < cutoff
    );
    for (const order of expired) {
      await cancelOrder(order.id);
    }
    return;
  }

  const supabase = getSupabase();
  const { data: expired, error } = await supabase
    .from("orders")
    .select("id")
    .eq("status", "pending")
    .lt("created_at", holdCutoffIso());
  if (error) throw new Error(`Failed to find expired holds: ${error.message}`);
  for (const order of expired ?? []) {
    await cancelOrder(order.id);
  }
}

export async function getListings(): Promise<Listing[]> {
  // Listings change at runtime, so never bake them into prerendered HTML.
  await connection();
  await releaseExpiredHolds();
  if (!isSupabaseConfigured()) return sortNewest(demoListings()).map(withImages);

  const { data, error } = await getSupabase()
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load listings: ${error.message}`);
  return (data as Listing[]).map(withImages);
}

export async function getListing(id: string): Promise<Listing | null> {
  await connection();
  await releaseExpiredHolds();
  if (!isSupabaseConfigured()) {
    const listing = demoListings().find((l) => l.id === id);
    return listing ? withImages(listing) : null;
  }

  const { data, error } = await getSupabase()
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load listing: ${error.message}`);
  return data ? withImages(data as Listing) : null;
}

export async function createListing(input: ListingInput): Promise<Listing> {
  const { images, image } = imageFields(input);
  const resolved = await resolveImages(images);
  const fields = imageFields({ images: resolved, image });

  if (!isSupabaseConfigured()) {
    const listing: Listing = {
      ...input,
      ...fields,
      id: randomUUID(),
      created_at: new Date().toISOString(),
    };
    demoListings().push(listing);
    return withImages(listing);
  }

  const supabase = getSupabase();
  let { data, error } = await supabase
    .from("listings")
    .insert({ ...input, ...fields })
    .select()
    .single();
  // Safety net for databases that haven't run the multi-photo migration yet:
  // retry storing just the cover so adding a listing never hard-fails.
  if (error && isMissingImagesColumn(error)) {
    const { images: _drop, ...rest } = { ...input, ...fields };
    void _drop;
    ({ data, error } = await supabase
      .from("listings")
      .insert(rest)
      .select()
      .single());
  }
  if (error) throw new Error(`Failed to create listing: ${error.message}`);
  return withImages(data as Listing);
}

export async function updateListing(
  id: string,
  input: Partial<ListingInput>
): Promise<Listing | null> {
  const patch: Partial<ListingInput> = { ...input };
  // Only touch photo fields when the form actually sent them.
  if (input.images !== undefined || input.image !== undefined) {
    const { images, image } = imageFields(input);
    const resolved = await resolveImages(images);
    Object.assign(patch, imageFields({ images: resolved, image }));
  }

  if (!isSupabaseConfigured()) {
    const listing = demoListings().find((l) => l.id === id);
    if (!listing) return null;
    Object.assign(listing, patch);
    return withImages(listing);
  }

  const supabase = getSupabase();
  let { data, error } = await supabase
    .from("listings")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error && isMissingImagesColumn(error)) {
    const { images: _drop, ...rest } = patch;
    void _drop;
    ({ data, error } = await supabase
      .from("listings")
      .update(rest)
      .eq("id", id)
      .select()
      .maybeSingle());
  }
  if (error) throw new Error(`Failed to update listing: ${error.message}`);
  return data ? withImages(data as Listing) : null;
}

export async function deleteListing(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const listings = demoListings();
    const index = listings.findIndex((l) => l.id === id);
    if (index === -1) return false;
    listings.splice(index, 1);
    return true;
  }

  const { error } = await getSupabase().from("listings").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete listing: ${error.message}`);
  return true;
}

export async function getSiteContent(): Promise<SiteContent> {
  await connection();
  if (!isSupabaseConfigured()) return demoSiteContent();

  const { data, error } = await getSupabase()
    .from("site_content")
    .select("content")
    .eq("id", "main")
    .maybeSingle();
  if (error) throw new Error(`Failed to load site content: ${error.message}`);
  return (data?.content as SiteContent | null) ?? DEFAULT_SITE_CONTENT;
}

export async function updateSiteContent(
  content: SiteContent
): Promise<SiteContent> {
  if (!isSupabaseConfigured()) {
    globalStore.__ccSiteContent = { ...content };
    return demoSiteContent();
  }

  const { data, error } = await getSupabase()
    .from("site_content")
    .upsert({ id: "main", content, updated_at: new Date().toISOString() })
    .select("content")
    .single();
  if (error) throw new Error(`Failed to update site content: ${error.message}`);
  return data.content as SiteContent;
}

export async function getOrders(): Promise<Order[]> {
  await connection();
  if (!isSupabaseConfigured()) {
    return [...demoOrders()].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  return data as Order[];
}

export async function createOrder(input: OrderInput): Promise<Order> {
  if (!isSupabaseConfigured()) {
    const order: Order = {
      ...input,
      id: randomUUID(),
      status: "pending",
      stripe_session_id: null,
      stripe_payment_intent: null,
      created_at: new Date().toISOString(),
      paid_at: null,
    };
    demoOrders().push(order);
    return order;
  }

  const { data, error } = await getSupabase()
    .from("orders")
    .insert({ ...input, status: "pending" })
    .select()
    .single();
  if (error) throw new Error(`Failed to create order: ${error.message}`);
  return data as Order;
}

export async function attachStripeSession(
  orderId: string,
  stripeSessionId: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    const order = demoOrders().find((o) => o.id === orderId);
    if (order) order.stripe_session_id = stripeSessionId;
    return;
  }

  const { error } = await getSupabase()
    .from("orders")
    .update({ stripe_session_id: stripeSessionId })
    .eq("id", orderId);
  if (error) throw new Error(`Failed to update order session: ${error.message}`);
}

export async function markOrderPaid({
  orderId,
  stripeSessionId,
  stripePaymentIntent,
}: {
  orderId: string;
  stripeSessionId: string;
  stripePaymentIntent: string | null;
}): Promise<void> {
  const paidAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const order = demoOrders().find((o) => o.id === orderId);
    if (order) {
      order.status = "paid";
      order.stripe_session_id = stripeSessionId;
      order.stripe_payment_intent = stripePaymentIntent;
      order.paid_at = paidAt;
      const listing = demoListings().find((l) => l.id === order.listing_id);
      if (listing) listing.status = "sold";
    }
    return;
  }

  const supabase = getSupabase();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      stripe_session_id: stripeSessionId,
      stripe_payment_intent: stripePaymentIntent,
      paid_at: paidAt,
    })
    .eq("id", orderId)
    .select("listing_id")
    .maybeSingle();
  if (orderError) throw new Error(`Failed to mark order paid: ${orderError.message}`);
  if (!order?.listing_id) return;

  const { error: listingError } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", order.listing_id);
  if (listingError) {
    throw new Error(`Failed to mark listing sold: ${listingError.message}`);
  }
}
