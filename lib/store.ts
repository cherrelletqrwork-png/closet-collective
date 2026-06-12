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

const DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/;

// Photos arrive from the admin form as base64 data URLs. In Supabase mode
// they are uploaded to storage and swapped for a public URL; in demo mode
// the data URL is kept as-is.
async function resolveImage(image: string): Promise<string> {
  const match = image.match(DATA_URL_RE);
  if (!match || !isSupabaseConfigured()) return image;

  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const path = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(image.slice(match[0].length), "base64");

  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from("listing-photos")
    .upload(path, buffer, { contentType: `image/${match[1]}` });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  return supabase.storage.from("listing-photos").getPublicUrl(path).data
    .publicUrl;
}

export async function getListings(): Promise<Listing[]> {
  // Listings change at runtime, so never bake them into prerendered HTML.
  await connection();
  if (!isSupabaseConfigured()) return sortNewest(demoListings());

  const { data, error } = await getSupabase()
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load listings: ${error.message}`);
  return data as Listing[];
}

export async function getListing(id: string): Promise<Listing | null> {
  await connection();
  if (!isSupabaseConfigured()) {
    return demoListings().find((l) => l.id === id) ?? null;
  }

  const { data, error } = await getSupabase()
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load listing: ${error.message}`);
  return data as Listing | null;
}

export async function createListing(input: ListingInput): Promise<Listing> {
  const image = await resolveImage(input.image);

  if (!isSupabaseConfigured()) {
    const listing: Listing = {
      ...input,
      image,
      id: randomUUID(),
      created_at: new Date().toISOString(),
    };
    demoListings().push(listing);
    return listing;
  }

  const { data, error } = await getSupabase()
    .from("listings")
    .insert({ ...input, image })
    .select()
    .single();
  if (error) throw new Error(`Failed to create listing: ${error.message}`);
  return data as Listing;
}

export async function updateListing(
  id: string,
  input: Partial<ListingInput>
): Promise<Listing | null> {
  const patch = { ...input };
  if (patch.image) patch.image = await resolveImage(patch.image);

  if (!isSupabaseConfigured()) {
    const listing = demoListings().find((l) => l.id === id);
    if (!listing) return null;
    Object.assign(listing, patch);
    return listing;
  }

  const { data, error } = await getSupabase()
    .from("listings")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Failed to update listing: ${error.message}`);
  return data as Listing | null;
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
