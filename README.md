# Closet Collective 🎀

A full-stack Next.js marketplace for five friends selling preloved clothes in
Singapore. Shoppers browse listings, pay securely through website checkout
(Stripe — cards and PayNow), or DM the seller on Telegram. Sellers use a
password-protected admin panel to manage listings, edit the site's wording,
and view orders.

**Stack:** Next.js (App Router) · Tailwind CSS · Supabase (database + photo
storage) · Stripe Checkout · Vercel

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

With no env vars set, the app runs in **demo mode**:

- Seed listings live in memory (admin edits reset when the server restarts).
- Checkout simulates a successful payment without charging anything.

## Admin panel

Visit `/admin`, pick your name, and log in with your own password.
Per-seller credentials live in the `ADMIN_USERS` env var as comma-separated
`name:password` pairs (see `.env.example`). If `ADMIN_USERS` is unset, every
seller can log in with the shared `ADMIN_PASSWORD` (defaults to `closet123`
in demo). Three tabs:

- **Listings** — add, edit, or remove pieces with photo upload, price,
  condition, size, category, seller, and status (Available / Reserved / Sold).
- **Site content** — edit the homepage hero, about text, how-to-order copy,
  payment terms, and footer.
- **Orders** — see website checkout orders with buyer contact and delivery
  preference.

## Going live

### 1. Supabase (database + photos)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
   This creates the `listings`, `orders`, and `site_content` tables plus the
   public `listing-photos` storage bucket.
3. Copy the project URL, anon key, and service-role key from
   **Project Settings → API** into your env vars (see `.env.example`).

### 2. Stripe (website checkout)

1. Create an account at [stripe.com](https://stripe.com) and copy the secret
   key from **Developers → API keys** into `STRIPE_SECRET_KEY`.
2. To accept **PayNow**, enable it under **Settings → Payment methods**
   (available for Singapore accounts, SGD only).
3. Add a webhook endpoint pointing to
   `https://YOUR-SITE/api/webhooks/stripe` listening for
   `checkout.session.completed`, and copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.

The success page also confirms payment when the buyer returns from Stripe, so
checkout works even before the webhook is configured — the webhook just makes
it bulletproof (e.g. if the buyer closes the tab).

When an order is paid, the listing is automatically marked **Sold**.

### 3. Vercel

1. Push this folder to a GitHub repo and import it at
   [vercel.com/new](https://vercel.com/new). If the repo contains more than
   this app, set **Root Directory** to `closet-collective`.
2. Add the environment variables from `.env.example` in
   **Project Settings → Environment Variables**.
3. Deploy. Set `NEXT_PUBLIC_SITE_URL` to your live URL once you know it.

## Customising

- **Logo** — replace `public/brand/logo.jpg`.
- **Sellers, Telegram handles, delivery options** — edit
  [`lib/sellers.ts`](lib/sellers.ts).
- **Colours and fonts** — edit the theme block in
  [`app/globals.css`](app/globals.css) and the font imports in
  [`app/layout.tsx`](app/layout.tsx).
- **Everything wordy** (hero, about, terms, footer) — editable live from the
  admin panel's **Site content** tab.

## House rules shown on the site

- PayNow / PayLah / bank transfer for Telegram orders; secure checkout on the
  website. First payment = first served.
- All sales final, no refunds or exchanges.
- Minor flaws are always stated in the listing description.
- Reserved items are held for 24 hours after payment confirmation.
