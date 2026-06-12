import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { SELLERS, TELEGRAM_CHANNEL } from "@/lib/sellers";
import { getSiteContent } from "@/lib/store";

const steps = [
  {
    title: "Find your piece",
    body: "Browse the shop and check the photos, sizing, and any flaws noted in the description.",
  },
  {
    title: "Pay securely",
    body: "Tap Buy Now to check out on the website, or DM the seller on Telegram for PayNow, PayLah, or bank transfer.",
  },
  {
    title: "Collect the cute",
    body: "The seller confirms your meetup MRT station or mails it out. Enjoy your new-to-you piece!",
  },
];

export default async function HowToOrderPage() {
  const content = await getSiteContent();

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-blush-light py-14">
        <span className="absolute right-10 top-10 text-3xl text-rose/35 sparkle">
          ✦
        </span>
        <span className="absolute bottom-8 left-1/3 text-3xl text-rose/30 sparkle sparkle-delay-1">
          ♡
        </span>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-script text-4xl text-rose">easy little checkout</p>
          <h1 className="text-5xl font-bold text-cocoa">How to Order</h1>
          <p className="mt-4 max-w-2xl leading-7 text-cocoa-light">
            {content.how_to_order_intro}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex rounded-full bg-rose px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-soft transition hover:bg-rose-deep"
            >
              Shop listings
            </Link>
            <a
              href={TELEGRAM_CHANNEL}
              className="inline-flex rounded-full border border-rose/40 bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-rose-deep transition hover:bg-blush-light"
            >
              Open Telegram channel
            </a>
          </div>
        </div>
      </section>

      <section className="bg-cream py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 120}>
                <div className="h-full rounded-lg border border-blush-deep/60 bg-white p-6 shadow-card">
                  <p className="font-script text-3xl text-rose">
                    step {index + 1}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-cocoa">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-cocoa-light">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="h-full rounded-lg border border-blush-deep bg-white p-6 shadow-card">
                <h2 className="text-3xl font-bold text-cocoa">
                  Payment &amp; Terms
                </h2>
                <ul className="mt-5 space-y-3">
                  {content.payment_terms.map((term) => (
                    <li
                      key={term}
                      className="rounded-md bg-ivory p-4 font-bold text-cocoa-light"
                    >
                      ♡ {term}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-lg border border-blush-deep bg-white p-6 shadow-card">
                <h2 className="text-3xl font-bold text-cocoa">
                  Delivery Options
                </h2>
                <p className="mt-3 text-sm leading-6 text-cocoa-light">
                  {content.delivery_intro}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {SELLERS.map((seller) => (
                    <div key={seller.slug} className="rounded-md bg-ivory p-4">
                      <p className="font-serif text-xl font-bold text-rose-deep">
                        {seller.name}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm font-bold text-cocoa-light">
                        {seller.delivery.map((line) => (
                          <li key={line}>♡ {line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
