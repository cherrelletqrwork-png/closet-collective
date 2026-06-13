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
    // TODO: paste your Carousell profile URL here.
    label: "Carousell",
    href: "",
    emoji: "🧺",
    note: "Find us on Carousell",
  },
  {
    // TODO: paste your Instagram URL here, e.g. https://instagram.com/yourhandle
    label: "Instagram",
    href: "",
    emoji: "📸",
    note: "Styling & behind the scenes",
  },
  {
    // TODO: paste your TikTok URL here.
    label: "TikTok",
    href: "",
    emoji: "🎀",
    note: "Outfit videos & hauls",
  },
];
