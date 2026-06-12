import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SELLERS } from "./sellers";

export const SESSION_COOKIE = "cc_admin";
const SESSION_HOURS = 24 * 7;

// Per-seller credentials come from ADMIN_USERS, formatted as
// "name:password,name:password,...". When it's unset, every seller can log
// in with ADMIN_PASSWORD (default "closet123") so demo mode works out of
// the box.
function credentialMap(): Map<string, string> {
  const map = new Map<string, string>();
  const raw = process.env.ADMIN_USERS;
  if (raw) {
    for (const pair of raw.split(",")) {
      const [name, ...rest] = pair.split(":");
      if (name && rest.length) {
        map.set(name.trim().toLowerCase(), rest.join(":").trim());
      }
    }
  } else {
    const shared = process.env.ADMIN_PASSWORD || "closet123";
    for (const seller of SELLERS) map.set(seller.slug, shared);
  }
  return map;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// Sessions are signed with the owner's password, so changing a password in
// ADMIN_USERS immediately invalidates that seller's existing sessions.
function sign(payload: string, password: string): string {
  return createHmac("sha256", `cc-session:${password}`)
    .update(payload)
    .digest("hex");
}

export function checkCredentials(name: string, password: string): boolean {
  const expected = credentialMap().get(name.trim().toLowerCase());
  return Boolean(expected && safeEqual(expected, password));
}

export function createSessionToken(name: string): string {
  const slug = name.trim().toLowerCase();
  const password = credentialMap().get(slug) ?? "";
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  return `${slug}.${expires}.${sign(`${slug}.${expires}`, password)}`;
}

// Returns the logged-in seller's slug, or null when the token is missing,
// malformed, expired, or signed for a user that no longer exists.
export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [slug, expires, signature] = token.split(".");
  if (!slug || !expires || !signature) return null;
  if (Number(expires) < Date.now()) return null;
  const password = credentialMap().get(slug);
  if (!password) return null;
  return safeEqual(sign(`${slug}.${expires}`, password), signature)
    ? slug
    : null;
}

export async function currentAdmin(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function isAdmin(): Promise<boolean> {
  return (await currentAdmin()) !== null;
}
