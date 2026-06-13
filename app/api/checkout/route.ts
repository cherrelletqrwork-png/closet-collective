import { NextResponse } from "next/server";
import {
  HOLD_MINUTES,
  attachStripeSession,
  cancelOrder,
  claimListing,
  createOrder,
  getListing,
  markOrderPaid,
} from "@/lib/store";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSeller } from "@/lib/sellers";

interface CheckoutBody {
  listing_id?: string;
  buyer_name?: string;
  buyer_email?: string;
  delivery_method?: string;
  notes?: string;
}

const RESERVED_MESSAGE = `Someone else is checking out this piece right now. If they don't complete payment within ${HOLD_MINUTES} minutes it'll be back up for grabs — check back soon ♡`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutBody | null;
  const listingId = body?.listing_id?.trim();
  const buyerName = body?.buyer_name?.trim();
  const buyerEmail = body?.buyer_email?.trim();

  if (!listingId || !buyerName || !buyerEmail) {
    return NextResponse.json(
      { error: "Please fill in your name and email." },
      { status: 400 }
    );
  }

  // getListing also releases any expired holds, so a lapsed checkout frees
  // the piece before this buyer is judged against it.
  const listing = await getListing(listingId);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.status === "reserved") {
    return NextResponse.json({ error: RESERVED_MESSAGE }, { status: 409 });
  }
  if (listing.status !== "available") {
    return NextResponse.json(
      { error: "Sorry, this piece has already been sold." },
      { status: 409 }
    );
  }

  // One piece per listing: claim it first so only one buyer can ever reach
  // payment. If two people click Buy Now together, the second gets a 409.
  const claimed = await claimListing(listing.id);
  if (!claimed) {
    return NextResponse.json({ error: RESERVED_MESSAGE }, { status: 409 });
  }

  const order = await createOrder({
    listing_id: listing.id,
    listing_name: listing.name,
    amount: listing.price,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    delivery_method: body?.delivery_method?.trim() ?? "",
    notes: body?.notes?.trim() ?? "",
  });

  // Demo mode: no Stripe keys, so simulate a successful payment.
  if (!isStripeConfigured()) {
    await markOrderPaid({
      orderId: order.id,
      stripeSessionId: `demo-${order.id}`,
      stripePaymentIntent: null,
    });
    return NextResponse.json({
      url: `/order/success?demo=1&item=${encodeURIComponent(listing.name)}`,
    });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const seller = getSeller(listing.seller);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: buyerEmail,
      // The session dies when the hold does, so a payment can never land on
      // a listing that has already been released.
      expires_at: Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "sgd",
            unit_amount: Math.round(listing.price * 100),
            product_data: {
              name: listing.name,
              description: `Size ${listing.size} · ${listing.condition} · from ${
                seller?.name ?? listing.seller
              }'s closet`,
              // Stripe only accepts absolute image URLs (max 8).
              ...(() => {
                const urls = listing.images
                  .filter((img) => img.startsWith("http"))
                  .slice(0, 8);
                return urls.length ? { images: urls } : {};
              })(),
            },
          },
        },
      ],
      metadata: {
        order_id: order.id,
        listing_id: listing.id,
        listing_name: listing.name,
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/${listing.id}?cancelled=1&order=${order.id}`,
    });

    await attachStripeSession(order.id, session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Stripe refused the session — release the claim so the piece isn't
    // stuck reserved with nobody in checkout.
    await cancelOrder(order.id);
    throw error;
  }
}
