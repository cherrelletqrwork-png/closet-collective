"use client";

import { useState } from "react";

// Share the current listing: native share sheet on phones, copy-link
// fallback with a brief confirmation everywhere else.
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} · Closet Collective`, url });
        return;
      } catch {
        // user dismissed the share sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — nothing else to do
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose/40 bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-rose-deep transition hover:bg-blush-light sm:w-auto"
    >
      {copied ? "Link copied ♡" : "Share ✦"}
    </button>
  );
}
