export interface Seller {
  slug: string;
  name: string;
  telegram: string; // handle without @
  delivery: string[];
  blurb: string;
  emoji: string;
}

export const SELLERS: Seller[] = [
  {
    slug: "cherrelle",
    name: "Cherrelle",
    telegram: "blueballs96",
    delivery: ["Meetup along North East line MRT", "Mailing +$1.50"],
    blurb: "Closet full of pieces that deserve a second spin.",
    emoji: "🎀",
  },
  {
    slug: "karina",
    name: "Karina",
    telegram: "kkarrinaalwt",
    delivery: ["Meetup along North East line", "AMK / YCK MRT"],
    blurb: "Letting go of lovely things so they can be loved again.",
    emoji: "🌷",
  },
  {
    slug: "anthea",
    name: "Anthea",
    telegram: "aehtna",
    delivery: ["Delivery options to be confirmed — message me!"],
    blurb: "Decluttering one pretty piece at a time.",
    emoji: "🩰",
  },
  {
    slug: "selena",
    name: "Selena",
    telegram: "pan0daa",
    delivery: ["Meetup along North East line MRT", "Mailing +$1.50"],
    blurb: "Good clothes, good homes, good vibes.",
    emoji: "🤍",
  },
  {
    slug: "charlotte",
    name: "Charlotte",
    telegram: "sendhelpasapplslah",
    delivery: ["Meetup at Harbourfront MRT", "Meetup at Tiong Bahru MRT"],
    blurb: "My closet's loss is your wardrobe's gain.",
    emoji: "🫶",
  },
];

export const TELEGRAM_CHANNEL = "https://t.me/closetcollective";

export function getSeller(slug: string): Seller | undefined {
  return SELLERS.find((s) => s.slug === slug);
}

export function telegramLink(handle: string, message?: string): string {
  const base = `https://t.me/${handle}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
