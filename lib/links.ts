// Links shown on the /links "link in bio" page. Leave an href empty ("")
// to hide that button — fill them in as you create the accounts.
export interface BioLink {
  label: string;
  href: string;
  emoji: string;
  note?: string;
}

export const BIO_LINKS: BioLink[] = [
  {
    label: "Shop the closet",
    href: "/shop",
    emoji: "🛍️",
    note: "Browse every piece & pay securely",
  },
  {
    label: "Telegram channel",
    href: "https://t.me/closetcollective",
    emoji: "💬",
    note: "New drops & restock alerts",
  },
  {
    label: "Carousell",
    href: "https://carousell.app.link/EUri23krW3b",
    emoji: "🧺",
    note: "Find us on Carousell",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@closetcollectivesg",
    emoji: "🎀",
    note: "Outfit videos & hauls",
  },
  {
    // TODO: add your Instagram URL once you make an account,
    // e.g. https://instagram.com/yourhandle
    label: "Instagram",
    href: "",
    emoji: "📸",
    note: "Styling & behind the scenes",
  },
];
