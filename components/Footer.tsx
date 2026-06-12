import Link from "next/link";
import { TELEGRAM_CHANNEL } from "@/lib/sellers";
import { getSiteContent } from "@/lib/store";

export async function Footer() {
  const content = await getSiteContent();

  return (
    <footer className="border-t border-blush-deep/40 bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-cocoa-light sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-serif text-2xl font-bold text-rose-deep">
            Closet Collective
          </p>
          <p className="mt-2 max-w-xl">{content.footer_note}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-bold">
          <Link href="/shop" className="hover:text-rose-deep">
            Shop
          </Link>
          <Link href="/how-to-order" className="hover:text-rose-deep">
            Terms
          </Link>
          <a href={TELEGRAM_CHANNEL} className="hover:text-rose-deep">
            t.me/closetcollective
          </a>
        </div>
      </div>
      <p className="pb-6 text-center text-xs font-bold uppercase tracking-[0.3em] text-rose/60">
        sustainable · stylish · preloved
      </p>
    </footer>
  );
}
