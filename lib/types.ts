export type ListingStatus = "available" | "reserved" | "sold";

export type Category = "tops" | "bottoms" | "dresses" | "accessories";

export interface Listing {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: string;
  size: string;
  category: Category;
  seller: string; // seller slug, see lib/sellers.ts
  status: ListingStatus;
  image: string; // public URL, /items/*.svg placeholder, or data URL
  created_at: string;
}

export type ListingInput = Omit<Listing, "id" | "created_at">;

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface Order {
  id: string;
  listing_id: string;
  listing_name: string;
  amount: number;
  buyer_name: string;
  buyer_email: string;
  delivery_method: string;
  notes: string;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  paid_at: string | null;
}

export type OrderInput = Omit<
  Order,
  "id" | "created_at" | "paid_at" | "status" | "stripe_session_id" | "stripe_payment_intent"
>;

export interface SiteContent {
  hero_tagline: string;
  hero_heading: string;
  hero_body: string;
  about_heading: string;
  about_body: string;
  how_to_order_intro: string;
  payment_terms: string[];
  delivery_intro: string;
  footer_note: string;
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "accessories", label: "Accessories" },
];

export const STATUSES: { value: ListingStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export const CONDITIONS = [
  "Brand new with tag",
  "Brand new without tag",
  "Like new",
  "Lightly worn",
  "Well loved",
];
