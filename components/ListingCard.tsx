import Link from "next/link";
import type { Listing } from "@/lib/types";
import { getSeller, telegramLink } from "@/lib/sellers";
import { StatusBadge } from "./StatusBadge";
import { TiltCard } from "./TiltCard";

export function ListingCard({ listing }: { listing: Listing }) {
  const seller = getSeller(listing.seller);
  const message = `Hi ${seller?.name ?? "there"}! I'm interested in ${listing.name} from Closet Collective.`;

  return (
    <TiltCard className="h-full">
    <article className="group h-full overflow-hidden rounded-lg border border-blush-deep/50 bg-white shadow-card transition hover:shadow-card-hover">
      <Link href={`/shop/${listing.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-blush-light">
          <img
            src={listing.image}
            alt={listing.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <StatusBadge status={listing.status} />
          </div>
          {listing.images.length > 1 && (
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-extrabold text-rose-deep shadow-card">
              ⊞ {listing.images.length}
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link
            href={`/shop/${listing.id}`}
            className="font-serif text-xl font-bold leading-tight text-cocoa hover:text-rose-deep"
          >
            {listing.name}
          </Link>
          <p className="mt-1 text-sm font-bold text-cocoa-light">
            {seller?.name ?? listing.seller} · {listing.size} · {listing.condition}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-2xl font-extrabold text-rose-deep">
            ${listing.price}
          </p>
          <a
            href={telegramLink(seller?.telegram ?? "", message)}
            className="rounded-full bg-blush px-4 py-2 text-sm font-extrabold text-rose-deep transition hover:bg-rose hover:text-white"
          >
            Order
          </a>
        </div>
      </div>
    </article>
    </TiltCard>
  );
}
