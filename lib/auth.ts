import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Shared-password admin auth. Set ADMIN_PASSWORD in .env.local / Vercel —
// the default below only exists so the demo works out of the box.
const DEFAULT_PASSWORD = "closet123";

export const SESSION_COOKIE = "cc_admin";
const SESSION_HOURS = 24 * 7;

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

function sign(payload: string): string {
  return createHmac("sha256", `cc-session:${adminPassword()}`)
    .update(payload)
    .digest("hex");
}

export function checkPassword(password: string): boolean {
  const expected = Buffer.from(adminPassword());
  const given = Buffer.from(password);
  return (
    expected.length === given.length && timingSafeEqual(expected, given)
  );
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  return `${expires}.${sign(String(expires))}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sign(expires));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
