import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { PageShell } from "@/components/PageShell";
import { ShareButton } from "@/components/ShareButton";
import { StatusBadge } from "@/components/StatusBadge";
import { getListing } from "@/lib/store";
import { getSeller, telegramLink } from "@/lib/sellers";

// Rich preview when an item link is shared on Instagram, Telegram, WhatsApp,
// etc. — shows the photo, name, and price instead of just the logo.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Closet Collective" };

  const title = `${listing.name} · $${listing.price}`;
  const description =
    listing.description?.slice(0, 160) ||
    "A preloved piece from Closet Collective.";
  // Only use absolute (http) photos for the preview; the SVG placeholder
  // doesn't render well as a social card.
  const image = listing.image.startsWith("http") ? listing.image : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const seller = getSeller(listing.seller);
  const message = `Hi ${seller?.name ?? "there"}! I'm interested in ${listing.name} from Closet Collective. Is it still available?`;

  return (
    <PageShell>
      <section className="bg-cream py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link href="/shop" className="text-sm font-extrabold text-rose-deep">
            ← Back to shop
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <Gallery images={listing.images} alt={listing.name} />
            <div className="rounded-lg border border-blush-deep/60 bg-white p-6 shadow-card">
              <StatusBadge status={listing.status} />
              <p className="mt-5 font-script text-4xl text-rose">
                {seller?.name ?? listing.seller}&apos;s closet
              </p>
              <h1 className="mt-1 text-4xl font-bold leading-tight text-cocoa sm:text-5xl">
                {listing.name}
              </h1>
              <p className="mt-4 text-4xl font-extrabold text-rose-deep">
                ${listing.price}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Condition", listing.condition],
                  ["Size", listing.size],
                  ["Category", listing.category],
                  ["Seller", seller?.name ?? listing.seller],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-blush-deep/40 bg-ivory p-4"
                  >
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cocoa-light">
                      {label}
                    </p>
                    <p className="mt-1 font-bold capitalize text-cocoa">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-cocoa">Description</h2>
                <p className="mt-2 leading-7 text-cocoa-light">
                  {listing.description}
                </p>
              </div>

              <div className="mt-6 rounded-lg bg-blush-light p-5">
                <h2 className="text-2xl font-bold text-cocoa">How to order</h2>
                <p className="mt-2 text-sm leading-6 text-cocoa-light">
                  Message the seller on Telegram to buy. They&apos;ll confirm
                  it&apos;s still available, share PayNow / PayLah / bank
                  transfer details, and arrange meetup or mailing. First to
                  pay gets the piece.
                </p>
                {seller && (
                  <ul className="mt-3 space-y-1 text-sm font-bold text-cocoa">
                    {seller.delivery.map((line) => (
                      <li key={line}>♡ {line}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {listing.status === "available" ? (
                  <a
                    href={telegramLink(seller?.telegram ?? "", message)}
                    className="btn-shine inline-flex w-full items-center justify-center rounded-full bg-rose px-6 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-soft transition hover:bg-rose-deep sm:w-auto"
                  >
                    Order via Telegram
                  </a>
                ) : (
                  <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-blush px-6 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-rose-deep/60 sm:w-auto">
                    {listing.status === "sold" ? "Sold" : "Reserved"}
                  </span>
                )}
                <ShareButton title={listing.name} />
              </div>
              {listing.status === "reserved" && (
                <p className="mt-3 text-sm font-bold leading-6 text-cocoa-light">
                  This piece is on hold right now — message the seller on
                  Telegram and they&apos;ll let you know if it frees up ♡
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
