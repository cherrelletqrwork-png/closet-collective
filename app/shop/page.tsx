import { ListingCard } from "@/components/ListingCard";
import { PageShell } from "@/components/PageShell";
import { CATEGORIES, STATUSES, type Category, type ListingStatus } from "@/lib/types";
import { SELLERS } from "@/lib/sellers";
import { getListings } from "@/lib/store";
import Link from "next/link";

type ShopSearch = {
  q?: string;
  seller?: string;
  category?: string;
  status?: string;
  min?: string;
  max?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<ShopSearch>;
}) {
  const params = (await searchParams) ?? {};
  const listings = await getListings();
  const q = params.q?.trim().toLowerCase() ?? "";
  const min = params.min ? Number(params.min) : undefined;
  const max = params.max ? Number(params.max) : undefined;

  const filtered = listings.filter((listing) => {
    const matchesSearch =
      !q ||
      [listing.name, listing.description, listing.condition, listing.size]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const matchesSeller = !params.seller || listing.seller === params.seller;
    const matchesCategory =
      !params.category || listing.category === params.category;
    const matchesStatus = !params.status || listing.status === params.status;
    const matchesMin = min === undefined || listing.price >= min;
    const matchesMax = max === undefined || listing.price <= max;
    return (
      matchesSearch &&
      matchesSeller &&
      matchesCategory &&
      matchesStatus &&
      matchesMin &&
      matchesMax
    );
  });

  return (
    <PageShell>
      <section className="bg-blush-light py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-script text-4xl text-rose">browse the drop</p>
          <h1 className="text-5xl font-bold text-cocoa">Shop Closet Collective</h1>
          <p className="mt-4 max-w-2xl text-cocoa-light">
            Filter by seller, category, status, or budget. Found something you
            love? Message the seller on Telegram to make it yours.
          </p>
        </div>
      </section>

      <section className="bg-cream py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <form className="grid gap-3 rounded-lg border border-blush-deep/50 bg-white p-4 shadow-card md:grid-cols-6">
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search pieces"
              className="rounded-md border border-blush-deep bg-ivory px-3 py-3 text-sm outline-none focus:border-rose md:col-span-2"
            />
            <select
              name="seller"
              defaultValue={params.seller ?? ""}
              className="rounded-md border border-blush-deep bg-ivory px-3 py-3 text-sm outline-none focus:border-rose"
            >
              <option value="">All sellers</option>
              {SELLERS.map((seller) => (
                <option key={seller.slug} value={seller.slug}>
                  {seller.name}
                </option>
              ))}
            </select>
            <select
              name="category"
              defaultValue={(params.category as Category) ?? ""}
              className="rounded-md border border-blush-deep bg-ivory px-3 py-3 text-sm outline-none focus:border-rose"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={(params.status as ListingStatus) ?? ""}
              className="rounded-md border border-blush-deep bg-ivory px-3 py-3 text-sm outline-none focus:border-rose"
            >
              <option value="">Any status</option>
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="min"
                defaultValue={params.min}
                placeholder="$ min"
                inputMode="numeric"
                className="min-w-0 rounded-md border border-blush-deep bg-ivory px-3 py-3 text-sm outline-none focus:border-rose"
              />
              <input
                name="max"
                defaultValue={params.max}
                placeholder="$ max"
                inputMode="numeric"
                className="min-w-0 rounded-md border border-blush-deep bg-ivory px-3 py-3 text-sm outline-none focus:border-rose"
              />
            </div>
            <button className="rounded-md bg-rose px-4 py-3 text-sm font-extrabold text-white transition hover:bg-rose-deep md:col-start-6">
              Filter
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa-light">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            </p>
            <Link href="/shop" className="text-sm font-extrabold text-rose-deep">
              Clear filters
            </Link>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <ListingCard listing={listing} key={listing.id} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="mt-8 rounded-lg border border-blush-deep bg-white p-8 text-center shadow-card">
              <p className="font-serif text-2xl font-bold text-cocoa">
                No pieces match those filters yet.
              </p>
              <p className="mt-2 text-cocoa-light">
                Try a wider price range or browse all listings.
              </p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
