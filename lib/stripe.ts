import Stripe from "stripe";

// Stripe powers the website checkout (cards + PayNow for SGD once enabled
// in the Stripe dashboard). Without STRIPE_SECRET_KEY the checkout runs in
// demo mode: orders are recorded and marked paid without a real charge.
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
