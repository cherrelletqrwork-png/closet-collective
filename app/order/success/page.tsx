import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { TELEGRAM_CHANNEL } from "@/lib/sellers";
import { markOrderPaid } from "@/lib/store";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; demo?: string; item?: string }>;
}) {
  const params = await searchParams;
  let itemName = params.item ?? "";
  let paid = Boolean(params.demo);

  if (params.session_id && isStripeConfigured()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(
        params.session_id
      );
      itemName = session.metadata?.listing_name ?? itemName;
      if (session.payment_status === "paid" && session.metadata?.order_id) {
        paid = true;
        // Fallback for setups without a webhook: confirm the order and mark
        // the listing sold when the buyer lands back here.
        await markOrderPaid({
          orderId: session.metadata.order_id,
          stripeSessionId: session.id,
          stripePaymentIntent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
        });
      }
    } catch {
      // Unknown or expired session — fall through to the pending state.
    }
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-cream py-20">
        <span className="absolute left-10 top-12 text-3xl text-rose/40 sparkle">
          ✦
        </span>
        <span className="absolute right-12 top-24 text-4xl text-rose/30 sparkle sparkle-delay-1">
          ♡
        </span>
        <span className="absolute bottom-12 left-1/4 text-3xl text-rose/30 sparkle sparkle-delay-2">
          ✧
        </span>
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blush text-4xl shadow-soft">
            {paid ? "🎀" : "⏳"}
          </div>
          <p className="mt-6 font-script text-4xl text-rose">
            {paid ? "it's officially yours" : "almost there"}
          </p>
          <h1 className="mt-2 text-5xl font-bold text-cocoa">
            {paid ? "Payment received!" : "Confirming your payment"}
          </h1>
          <p className="mt-5 leading-7 text-cocoa-light">
            {paid ? (
              <>
                {itemName ? (
                  <>
                    <span className="font-bold text-cocoa">{itemName}</span> is
                    coming home with you.{" "}
                  </>
                ) : null}
                We&apos;ve emailed your receipt, and the seller will reach out
                about meetup or mailing details. Thank you for giving a
                preloved piece another story ♡
              </>
            ) : (
              <>
                Your payment is still being confirmed. If you completed
                checkout, this usually takes just a moment — check back soon or
                message us on Telegram.
              </>
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-rose px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-soft transition hover:bg-rose-deep"
            >
              Keep browsing
            </Link>
            <a
              href={TELEGRAM_CHANNEL}
              className="rounded-full border border-rose/40 bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-rose-deep transition hover:bg-blush-light"
            >
              Telegram channel
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
