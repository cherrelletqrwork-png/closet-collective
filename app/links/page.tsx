import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { BIO_LINKS } from "@/lib/links";

export const metadata: Metadata = {
  title: "Closet Collective — links",
  description: "Shop, Telegram, Carousell, and socials in one place.",
};

// Standalone "link in bio" landing page (no nav/footer) for use in
// Instagram/TikTok bios. Edit the buttons in lib/links.ts.
export default function LinksPage() {
  const links = BIO_LINKS.filter((link) => link.href.trim() !== "");

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-cream px-5 py-12">
      <span className="sparkle pointer-events-none absolute left-8 top-16 text-2xl text-rose/40">
        ✦
      </span>
      <span className="sparkle sparkle-delay-1 pointer-events-none absolute right-10 top-28 text-3xl text-rose/30">
        ♡
      </span>
      <span className="sparkle sparkle-delay-2 pointer-events-none absolute bottom-20 left-12 text-2xl text-rose/35">
        ✧
      </span>

      <div className="w-full max-w-md text-center">
        <img
          src="/brand/logo.jpg"
          alt="Closet Collective"
          className="float-gentle mx-auto h-28 w-28 rounded-full border-4 border-white object-cover shadow-soft"
        />
        <h1 className="mt-5 font-script text-5xl text-rose-deep">
          Closet Collective
        </h1>
        <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.3em] text-cocoa-light">
          Our preloved · Singapore
        </p>

        <div className="mt-8 space-y-3">
          {links.map((link, index) => {
            const external = link.href.startsWith("http");
            const className =
              "btn-shine block rounded-2xl border border-blush-deep bg-white px-5 py-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover";
            const inner = (
              <span className="flex items-center gap-4">
                <span className="text-2xl">{link.emoji}</span>
                <span>
                  <span className="block font-extrabold text-cocoa">
                    {link.label}
                  </span>
                  {link.note && (
                    <span className="block text-sm font-bold text-cocoa-light">
                      {link.note}
                    </span>
                  )}
                </span>
              </span>
            );
            return (
              <Reveal key={link.label} delay={index * 80}>
                {external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link href={link.href} className={className}>
                    {inner}
                  </Link>
                )}
              </Reveal>
            );
          })}
        </div>

        <p className="mt-10 text-xs font-bold text-cocoa-light">
          preloved pieces, loved again ♡
        </p>
      </div>
    </main>
  );
}
