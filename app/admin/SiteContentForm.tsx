"use client";

import { FormEvent, useState } from "react";
import type { SiteContent } from "@/lib/types";

const FIELDS: {
  key: keyof SiteContent;
  label: string;
  hint?: string;
  rows?: number;
}[] = [
  {
    key: "hero_tagline",
    label: "Hero tagline (cursive line)",
    hint: "The handwritten-style line above the big homepage heading.",
  },
  { key: "hero_heading", label: "Hero heading" },
  { key: "hero_body", label: "Hero paragraph", rows: 3 },
  { key: "about_heading", label: "About heading" },
  { key: "about_body", label: "About paragraph", rows: 3 },
  {
    key: "how_to_order_intro",
    label: "How to Order intro",
    rows: 3,
  },
  {
    key: "payment_terms",
    label: "Payment & terms (one per line)",
    rows: 6,
  },
  {
    key: "delivery_intro",
    label: "Delivery intro",
    rows: 2,
  },
  { key: "footer_note", label: "Footer note", rows: 2 },
];

export function SiteContentForm({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  function fieldValue(key: keyof SiteContent): string {
    const value = content[key];
    return Array.isArray(value) ? value.join("\n") : value;
  }

  function updateField(key: keyof SiteContent, raw: string) {
    setContent((current) => ({
      ...current,
      [key]: key === "payment_terms" ? raw.split("\n") : raw,
    }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");

    const payload: SiteContent = {
      ...content,
      payment_terms: fieldValue("payment_terms")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    setBusy(false);
    if (!response?.ok) {
      setNotice("Could not save the content. Please try again.");
      return;
    }
    setContent((await response.json()) as SiteContent);
    setNotice("Site content saved. Refresh any page to see it live ♡");
  }

  return (
    <section className="rounded-lg border border-blush-deep bg-white p-5 shadow-soft">
      <p className="font-script text-4xl text-rose">make it yours</p>
      <h2 className="text-4xl font-bold text-cocoa">Edit Site Content</h2>
      <p className="mt-3 text-sm leading-6 text-cocoa-light">
        These words appear across the homepage, about page, how-to-order page,
        and footer. Edit anything and hit save.
      </p>

      {notice && (
        <p className="mt-4 rounded-md bg-blush-light p-3 text-sm font-bold text-rose-deep">
          {notice}
        </p>
      )}

      <form onSubmit={save} className="mt-5 space-y-4">
        {FIELDS.map((field) => (
          <label
            key={field.key}
            className="block text-sm font-extrabold text-cocoa"
          >
            {field.label}
            {field.hint && (
              <span className="block text-xs font-bold text-cocoa-light">
                {field.hint}
              </span>
            )}
            {field.rows ? (
              <textarea
                rows={field.rows}
                value={fieldValue(field.key)}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 font-normal outline-none focus:border-rose"
              />
            ) : (
              <input
                value={fieldValue(field.key)}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="mt-2 w-full rounded-md border border-blush-deep bg-ivory px-3 py-3 font-normal outline-none focus:border-rose"
              />
            )}
          </label>
        ))}
        <button
          disabled={busy}
          className="rounded-full bg-rose px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save site content"}
        </button>
      </form>
    </section>
  );
}
