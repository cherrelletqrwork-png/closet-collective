"use client";

import { FormEvent, useState } from "react";

interface BuyNowButtonProps {
  listingId: string;
  listingName: string;
  price: number;
  deliveryOptions: string[];
  demoMode: boolean;
}

export function BuyNowButton({
  listingId,
  listingName,
  price,
  deliveryOptions,
  demoMode,
}: BuyNowButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [delivery, setDelivery] = useState(deliveryOptions[0] ?? "");
  const [notes, setNotes] = useState("");

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: listingId,
        buyer_name: name,
        buyer_email: email,
        delivery_method: delivery,
        notes,
      }),
    }).catch(() => null);

    const data = (await response?.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;

    if (!response?.ok || !data?.url) {
      setBusy(false);
      setError(data?.error ?? "Checkout did not start. Please try again.");
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-shine inline-flex w-full items-center justify-center rounded-full bg-rose px-6 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-soft transition hover:bg-rose-deep sm:w-auto"
      >
        Buy now · ${price}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa/45 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-blush-deep bg-white p-6 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="font-script text-3xl text-rose">almost yours</p>
            <h2 className="text-3xl font-bold text-cocoa">Secure checkout</h2>
            <p className="mt-2 text-sm leading-6 text-cocoa-light">
              {listingName} · ${price} SGD
            </p>
            {demoMode && (
              <p className="mt-3 rounded-md bg-status-reserved-bg p-3 text-xs font-bold text-status-reserved">
                Test mode — no real payment will be taken. Connect Stripe to
                accept live PayNow and card payments.
              </p>
            )}

            <form onSubmit={checkout} className="mt-5 space-y-4">
              <label className="block text-sm font-extrabold text-cocoa">
                Your name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
                />
              </label>
              <label className="block text-sm font-extrabold text-cocoa">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
                />
              </label>
              <label className="block text-sm font-extrabold text-cocoa">
                Delivery preference
                <select
                  value={delivery}
                  onChange={(event) => setDelivery(event.target.value)}
                  className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
                >
                  {deliveryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value="Discuss with seller">
                    Discuss with seller
                  </option>
                </select>
              </label>
              <label className="block text-sm font-extrabold text-cocoa">
                Notes for the seller (optional)
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
                />
              </label>

              {error && (
                <p className="rounded-md bg-status-sold-bg p-3 text-sm font-bold text-status-sold">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  disabled={busy}
                  className="flex-1 rounded-full bg-rose px-5 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-rose-deep disabled:opacity-60"
                >
                  {busy ? "Redirecting..." : "Pay securely"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-rose/40 px-5 py-3 text-sm font-extrabold text-rose-deep"
                >
                  Cancel
                </button>
              </div>
              <p className="text-center text-xs text-cocoa-light">
                First payment = first served. All sales final ♡
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
