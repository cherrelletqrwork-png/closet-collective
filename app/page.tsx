import Link from "next/link";
import { HeroDecor } from "@/components/HeroDecor";
import { ListingCard } from "@/components/ListingCard";
import { Marquee } from "@/components/Marquee";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/TiltCard";
import { getListings, getSiteContent } from "@/lib/store";
import { SELLERS, TELEGRAM_CHANNEL } from "@/lib/sellers";

export default async function Home() {
  const [listings, content] = await Promise.all([
    getListings(),
    getSiteContent(),
  ]);
  const featured = listings.slice(0, 6);

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-cream">
        <HeroDecor />
        <div className="mx-auto grid min-h-[76vh] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10">
            <p className="rise-in rise-1 font-script text-4xl text-rose">
              {content.hero_tagline}
            </p>
            <h1 className="rise-in rise-2 mt-3 max-w-3xl text-5xl font-bold leading-[1.05] text-cocoa sm:text-7xl">
              {content.hero_heading}
            </h1>
            <p className="rise-in rise-3 mt-6 max-w-xl text-lg leading-8 text-cocoa-light">
              {content.hero_body}
            </p>
            <div className="rise-in rise-4 mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="btn-shine rounded-full bg-rose px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-soft transition hover:bg-rose-deep"
              >
                Shop listings
              </Link>
              <a
                href={TELEGRAM_CHANNEL}
                className="btn-shine rounded-full border border-rose/40 bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-rose-deep transition hover:bg-blush-light"
              >
                Join channel
              </a>
            </div>
          </div>

          <div className="rise-in rise-5 relative mx-auto w-full max-w-md">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full border border-rose/25 bg-blush/50" />
            <div className="absolute -bottom-5 -right-5 h-28 w-28 rounded-full border border-rose/25 bg-white/70" />
            <TiltCard maxTilt={5}>
              <div className="relative overflow-hidden rounded-lg border border-blush-deep bg-white p-3 shadow-soft">
                <div className="grid grid-cols-2 gap-3">
                  {featured.slice(0, 4).map((item) => (
                    <Link
                      href={`/shop/${item.id}`}
                      key={item.id}
                      className="group overflow-hidden rounded-md bg-blush-light"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </TiltCard>
            <img
              src="/brand/logo.jpg"
              alt="Closet Collective logo"
              className="float-gentle absolute -bottom-7 -left-7 z-10 h-28 w-28 -rotate-6 rounded-full border-4 border-white object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      <Marquee />

      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-script text-3xl text-rose">freshly listed</p>
                <h2 className="text-4xl font-bold text-cocoa">Featured Finds</h2>
              </div>
              <Link
                href="/shop"
                className="w-fit rounded-full border border-rose/40 px-5 py-3 text-sm font-extrabold text-rose-deep transition hover:bg-blush-light"
              >
                View all pieces
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing, index) => (
              <Reveal key={listing.id} delay={(index % 3) * 110}>
                <ListingCard listing={listing} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blush-light py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="font-script text-3xl text-rose">about us</p>
            <h2 className="text-4xl font-bold text-cocoa">
              {content.about_heading}
            </h2>
            <p className="mt-4 leading-7 text-cocoa-light">
              {content.about_body}
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {SELLERS.map((seller, index) => (
              <Reveal key={seller.slug} delay={(index % 2) * 120}>
                <div className="h-full rounded-lg border border-white/70 bg-white/75 p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
                  <p className="text-2xl">{seller.emoji}</p>
                  <h3 className="mt-2 text-2xl font-bold text-rose-deep">
                    {seller.name}
                  </h3>
                  <p className="font-bold text-cocoa-light">
                    @{seller.telegram}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-cocoa-light">
                    {seller.blurb}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
