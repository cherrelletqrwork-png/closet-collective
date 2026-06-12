import Link from "next/link";
const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Sellers" },
  { href: "/how-to-order", label: "How to order" },
  { href: "/admin", label: "Admin login" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-blush-deep/50 bg-ivory/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <img
            src="/brand/logo.jpg"
            alt="Closet Collective logo"
            className="h-12 w-12 rounded-full border border-rose/30 object-cover shadow-card"
          />
          <span>
            <span className="block font-serif text-xl font-bold leading-none text-rose-deep">
              Closet Collective
            </span>
            <span className="hidden text-xs font-bold uppercase tracking-[0.22em] text-cocoa-light sm:block">
              Singapore preloved
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-bold text-cocoa transition hover:bg-blush-light hover:text-rose-deep"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/shop"
          className="rounded-full bg-rose px-4 py-2 text-sm font-extrabold text-white shadow-card transition hover:bg-rose-deep"
        >
          Buy now
        </Link>
      </nav>
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-blush-deep/60 bg-white px-3 py-2 text-xs font-extrabold text-cocoa"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
