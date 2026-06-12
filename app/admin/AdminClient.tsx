"use client";

import { FormEvent, useMemo, useState } from "react";
import type {
  Category,
  Listing,
  ListingInput,
  ListingStatus,
  Order,
  SiteContent,
} from "@/lib/types";
import { CATEGORIES, CONDITIONS, STATUSES } from "@/lib/types";
import { SELLERS } from "@/lib/sellers";
import { StatusBadge } from "@/components/StatusBadge";
import { OrdersPanel } from "./OrdersPanel";
import { SiteContentForm } from "./SiteContentForm";

type AdminTab = "listings" | "content" | "orders";

const TABS: { value: AdminTab; label: string }[] = [
  { value: "listings", label: "Listings" },
  { value: "content", label: "Site content" },
  { value: "orders", label: "Orders" },
];

const emptyForm: ListingInput = {
  name: "",
  description: "",
  price: 0,
  condition: "Like new",
  size: "",
  category: "tops",
  seller: "cherrelle",
  status: "available",
  image: "/items/top-1.svg",
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AdminClient({
  initialListings,
  initialContent,
  initialOrders,
  loggedIn,
}: {
  initialListings: Listing[];
  initialContent: SiteContent;
  initialOrders: Order[];
  loggedIn: boolean;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn);
  const [tab, setTab] = useState<AdminTab>("listings");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [listings, setListings] = useState(initialListings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ListingInput>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const editingListing = useMemo(
    () => listings.find((listing) => listing.id === editingId),
    [editingId, listings]
  );

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!response.ok) {
      setLoginError("That password did not work.");
      return;
    }
    setIsLoggedIn(true);
    setPassword("");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
  }

  function updateField<K extends keyof ListingInput>(
    key: K,
    value: ListingInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(listing: Listing) {
    setEditingId(listing.id);
    setForm({
      name: listing.name,
      description: listing.description,
      price: listing.price,
      condition: listing.condition,
      size: listing.size,
      category: listing.category,
      seller: listing.seller,
      status: listing.status,
      image: listing.image,
    });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const url = editingId ? `/api/listings/${editingId}` : "/api/listings";
    const response = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);

    if (!response.ok) {
      setNotice("Something went wrong while saving. Check the fields and try again.");
      return;
    }

    const saved = (await response.json()) as Listing;
    setListings((current) =>
      editingId
        ? current.map((listing) => (listing.id === saved.id ? saved : listing))
        : [saved, ...current]
    );
    setNotice(editingId ? "Listing updated." : "Listing added.");
    resetForm();
  }

  async function removeListing(id: string) {
    if (!confirm("Remove this listing?")) return;
    setBusy(true);
    const response = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) {
      setNotice("Could not delete that listing.");
      return;
    }
    setListings((current) => current.filter((listing) => listing.id !== id));
    if (editingId === id) resetForm();
    setNotice("Listing removed.");
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-blush-deep bg-white p-6 shadow-soft">
        <p className="font-script text-4xl text-rose">seller login</p>
        <h1 className="text-4xl font-bold text-cocoa">Admin Panel</h1>
        <p className="mt-3 text-sm leading-6 text-cocoa-light">
          Enter the shared seller password to add, edit, or remove Closet
          Collective listings.
        </p>
        <form onSubmit={login} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            className="w-full rounded-md border border-blush-deep bg-ivory px-4 py-3 outline-none focus:border-rose"
          />
          {loginError && (
            <p className="rounded-md bg-status-sold-bg p-3 text-sm font-bold text-status-sold">
              {loginError}
            </p>
          )}
          <button
            disabled={busy}
            className="w-full rounded-full bg-rose px-5 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            {busy ? "Checking..." : "Log in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTab(option.value)}
              className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
                tab === option.value
                  ? "bg-rose text-white shadow-card"
                  : "border border-rose/40 bg-white text-rose-deep hover:bg-blush-light"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          onClick={logout}
          className="rounded-full border border-rose/40 px-4 py-2 text-sm font-extrabold text-rose-deep"
        >
          Log out
        </button>
      </div>

      {tab === "content" && <SiteContentForm initialContent={initialContent} />}
      {tab === "orders" && <OrdersPanel initialOrders={initialOrders} />}

      {tab === "listings" && (
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-lg border border-blush-deep bg-white p-5 shadow-soft">
            <div>
              <p className="font-script text-4xl text-rose">
                {editingListing ? "polish this piece" : "new closet find"}
              </p>
              <h1 className="text-4xl font-bold text-cocoa">
                {editingListing ? "Edit Listing" : "Add Listing"}
              </h1>
            </div>

        {notice && (
          <p className="mt-4 rounded-md bg-blush-light p-3 text-sm font-bold text-rose-deep">
            {notice}
          </p>
        )}

        <form onSubmit={saveListing} className="mt-5 space-y-4">
          <label className="block text-sm font-extrabold text-cocoa">
            Photo
            <input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) updateField("image", await fileToDataUrl(file));
              }}
              className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 text-sm"
            />
          </label>
          <img
            src={form.image}
            alt="Listing preview"
            className="aspect-[4/5] w-full rounded-md border border-blush-deep object-cover"
          />
          <label className="block text-sm font-extrabold text-cocoa">
            Item name
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
            />
          </label>
          <label className="block text-sm font-extrabold text-cocoa">
            Description and flaws
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-extrabold text-cocoa">
              Price
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  updateField("price", Number(event.target.value))
                }
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
              />
            </label>
            <label className="block text-sm font-extrabold text-cocoa">
              Size
              <input
                required
                value={form.size}
                onChange={(event) => updateField("size", event.target.value)}
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
              />
            </label>
            <label className="block text-sm font-extrabold text-cocoa">
              Seller
              <select
                value={form.seller}
                onChange={(event) => updateField("seller", event.target.value)}
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
              >
                {SELLERS.map((seller) => (
                  <option value={seller.slug} key={seller.slug}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-extrabold text-cocoa">
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value as Category)
                }
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
              >
                {CATEGORIES.map((category) => (
                  <option value={category.value} key={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-extrabold text-cocoa">
              Condition
              <select
                value={form.condition}
                onChange={(event) => updateField("condition", event.target.value)}
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
              >
                {CONDITIONS.map((condition) => (
                  <option value={condition} key={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-extrabold text-cocoa">
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as ListingStatus)
                }
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
              >
                {STATUSES.map((status) => (
                  <option value={status.value} key={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              disabled={busy}
              className="rounded-full bg-rose px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60"
            >
              {busy ? "Saving..." : editingId ? "Save changes" : "Add listing"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-rose/40 px-6 py-3 text-sm font-extrabold text-rose-deep"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-cocoa">Current Listings</h2>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-cocoa-light">
            {listings.length} total
          </p>
        </div>
        <div className="space-y-3">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="grid gap-4 rounded-lg border border-blush-deep/60 bg-white p-3 shadow-card sm:grid-cols-[96px_1fr]"
            >
              <img
                src={listing.image}
                alt={listing.name}
                className="aspect-square w-full rounded-md object-cover sm:w-24"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-cocoa">
                      {listing.name}
                    </h3>
                    <p className="text-sm font-bold text-cocoa-light">
                      ${listing.price} · {listing.size} · {listing.seller}
                    </p>
                  </div>
                  <StatusBadge status={listing.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(listing)}
                    className="rounded-full bg-blush px-4 py-2 text-sm font-extrabold text-rose-deep"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeListing(listing.id)}
                    className="rounded-full border border-status-sold/30 px-4 py-2 text-sm font-extrabold text-status-sold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
        </div>
      )}
    </div>
  );
}
