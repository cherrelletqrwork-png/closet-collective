import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { SELLERS, telegramLink } from "@/lib/sellers";
import { getSiteContent } from "@/lib/store";

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-blush-light py-14">
        <span className="absolute right-10 top-10 text-3xl text-rose/35 sparkle">
          ✦
        </span>
        <span className="absolute bottom-8 left-8 text-3xl text-rose/30 sparkle sparkle-delay-1">
          ♡
        </span>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <img
              src="/brand/logo.jpg"
              alt="Closet Collective logo"
              className="float-gentle h-24 w-24 rounded-full border-4 border-white object-cover shadow-soft"
            />
            <p className="font-script text-4xl text-rose">meet the girls</p>
          </div>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold text-cocoa">
            {content.about_heading}
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-cocoa-light">
            {content.about_body}
          </p>
        </div>
      </section>
      <section className="bg-cream py-12">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
          {SELLERS.map((seller, index) => (
            <Reveal key={seller.slug} delay={(index % 3) * 110}>
              <article className="h-full rounded-lg border border-blush-deep/60 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-4xl">{seller.emoji}</p>
                    <h2 className="mt-3 text-3xl font-bold text-rose-deep">
                      {seller.name}
                    </h2>
                  </div>
                  <a
                    href={telegramLink(seller.telegram)}
                    className="rounded-full bg-blush px-4 py-2 text-sm font-extrabold text-rose-deep transition hover:bg-rose hover:text-white"
                  >
                    @{seller.telegram}
                  </a>
                </div>
                <p className="mt-4 leading-7 text-cocoa-light">{seller.blurb}</p>
                <div className="mt-5 rounded-md bg-ivory p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cocoa-light">
                    Delivery
                  </p>
                  <ul className="mt-2 space-y-1 text-sm font-bold text-cocoa">
                    {seller.delivery.map((line) => (
                      <li key={line}>♡ {line}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
