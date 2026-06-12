"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order } from "@/lib/types";

const STATUS_STYLES: Record<Order["status"], string> = {
  paid: "bg-status-available-bg text-status-available",
  pending: "bg-status-reserved-bg text-status-reserved",
  cancelled: "bg-status-sold-bg text-status-sold",
};

export function OrdersPanel({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    const response = await fetch("/api/orders").catch(() => null);
    setBusy(false);
    if (response?.ok) setOrders((await response.json()) as Order[]);
  }, []);

  // The server only sends orders to already-authenticated sessions, so pull
  // a fresh copy whenever the tab is opened.
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section className="rounded-lg border border-blush-deep bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-script text-4xl text-rose">cha-ching</p>
          <h2 className="text-4xl font-bold text-cocoa">Orders</h2>
        </div>
        <button
          onClick={refresh}
          disabled={busy}
          className="rounded-full border border-rose/40 px-4 py-2 text-sm font-extrabold text-rose-deep disabled:opacity-60"
        >
          {busy ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 rounded-md bg-ivory p-6 text-center font-bold text-cocoa-light">
          No orders yet — share the shop link in the Telegram channel!
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-lg border border-blush-deep/60 bg-ivory p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-cocoa">
                    {order.listing_name}
                  </h3>
                  <p className="text-sm font-bold text-cocoa-light">
                    ${order.amount} · {order.buyer_name} ({order.buyer_email})
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              <dl className="mt-3 grid gap-2 text-sm text-cocoa-light sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-extrabold uppercase tracking-[0.18em]">
                    Delivery
                  </dt>
                  <dd className="font-bold text-cocoa">
                    {order.delivery_method || "Discuss with seller"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-extrabold uppercase tracking-[0.18em]">
                    Placed
                  </dt>
                  <dd className="font-bold text-cocoa">
                    {new Date(order.created_at).toLocaleString("en-SG")}
                  </dd>
                </div>
                {order.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-extrabold uppercase tracking-[0.18em]">
                      Notes
                    </dt>
                    <dd>{order.notes}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
