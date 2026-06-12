import { NextResponse } from "next/server";
import {
  attachStripeSession,
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

  const listing = await getListing(listingId);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.status !== "available") {
    return NextResponse.json(
      { error: "Sorry, this piece is no longer available." },
      { status: 409 }
    );
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

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: buyerEmail,
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
            // Stripe only accepts absolute image URLs.
            ...(listing.image.startsWith("http")
              ? { images: [listing.image] }
              : {}),
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
    cancel_url: `${origin}/shop/${listing.id}?cancelled=1`,
  });

  await attachStripeSession(order.id, session.id);
  return NextResponse.json({ url: session.url });
}
