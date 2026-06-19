"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Order } from "@/lib/types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyEntry = () => ({
  item: "",
  buyer: "",
  amount: "",
  soldOn: today(),
  notes: "",
});

// A simple manual log of sales arranged over Telegram. Entries are stored in
// the orders table (status "paid") so they persist and sync across sellers.
export function SoldLogPanel({
  initialEntries,
  listingNames,
}: {
  initialEntries: Order[];
  listingNames: string[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState(emptyEntry());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/orders").catch(() => null);
    if (response?.ok) setEntries((await response.json()) as Order[]);
  }, []);

  // Sold-log data is only sent to authenticated sessions, so pull a fresh
  // copy when the tab opens.
  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.item.trim()) {
      setNotice("Please enter the item name.");
      return;
    }
    setBusy(true);
    setNotice("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item: form.item,
        buyer: form.buyer,
        amount: Number(form.amount) || 0,
        soldOn: form.soldOn,
        notes: form.notes,
      }),
    });
    setBusy(false);
    if (!response.ok) {
      setNotice("Couldn't save that entry. Please try again.");
      return;
    }
    const saved = (await response.json()) as Order;
    setEntries((current) => [saved, ...current]);
    setForm(emptyEntry());
    setNotice("Logged ✓");
  }

  async function removeEntry(id: string) {
    if (!confirm("Delete this sold-log entry?")) return;
    const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (response.ok) {
      setEntries((current) => current.filter((e) => e.id !== id));
    }
  }

  const total = entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  function update<K extends keyof ReturnType<typeof emptyEntry>>(
    key: K,
    value: string
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-blush-deep bg-white p-5 shadow-soft">
        <p className="font-script text-4xl text-rose">cha-ching</p>
        <h2 className="text-4xl font-bold text-cocoa">Log a sale</h2>
        <p className="mt-2 text-sm leading-6 text-cocoa-light">
          Jot down sales you arranged on Telegram so the team has one shared
          record.
        </p>

        {notice && (
          <p className="mt-4 rounded-md bg-blush-light p-3 text-sm font-bold text-rose-deep">
            {notice}
          </p>
        )}

        <form onSubmit={addEntry} className="mt-5 space-y-4">
          <label className="block text-sm font-extrabold text-cocoa">
            Item
            <input
              required
              list="sold-log-items"
              value={form.item}
              onChange={(e) => update("item", e.target.value)}
              placeholder="e.g. Satin slip dress"
              className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
            />
            <datalist id="sold-log-items">
              {listingNames.map((name) => (
                <option value={name} key={name} />
              ))}
            </datalist>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-extrabold text-cocoa">
              Buyer
              <input
                value={form.buyer}
                onChange={(e) => update("buyer", e.target.value)}
                placeholder="Name or @handle"
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
              />
            </label>
            <label className="block text-sm font-extrabold text-cocoa">
              Price ($)
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
              />
            </label>
          </div>
          <label className="block text-sm font-extrabold text-cocoa">
            Sold on
            <input
              type="date"
              value={form.soldOn}
              onChange={(e) => update("soldOn", e.target.value)}
              className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
            />
          </label>
          <label className="block text-sm font-extrabold text-cocoa">
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Meetup / mailing, payment method, etc."
              className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 outline-none focus:border-rose"
            />
          </label>
          <button
            disabled={busy}
            className="rounded-full bg-rose px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : "Add to log"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-cocoa">Sold log</h2>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-cocoa-light">
            {entries.length} sold · ${total}
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="rounded-md bg-ivory p-6 text-center font-bold text-cocoa-light">
            No sales logged yet — add your first one on the left ♡
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-lg border border-blush-deep/60 bg-white p-4 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-cocoa">
                      {entry.listing_name}
                    </h3>
                    <p className="text-sm font-bold text-cocoa-light">
                      ${entry.amount}
                      {entry.buyer_name ? ` · ${entry.buyer_name}` : ""} ·{" "}
                      {new Date(entry.paid_at ?? entry.created_at).toLocaleDateString(
                        "en-SG"
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="rounded-full border border-status-sold/30 px-3 py-1.5 text-xs font-extrabold text-status-sold"
                  >
                    Delete
                  </button>
                </div>
                {entry.notes && (
                  <p className="mt-2 text-sm text-cocoa-light">{entry.notes}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
