-- Closet Collective — demo seed listings
-- Run this once in the Supabase SQL editor after schema.sql to populate the
-- shop with the same placeholder pieces shown in demo mode.
-- Safe to skip if you'd rather start with an empty shop and add real pieces
-- via the admin panel.

insert into public.listings
  (name, description, price, condition, size, category, seller, status, image, created_at)
values
  ('Milkmaid Puff-Sleeve Top',
   'Cream square-neck milkmaid top with puff sleeves. Worn twice, no flaws. So soft and pinterest-coded.',
   12, 'Like new', 'S', 'tops', 'cherrelle', 'available', '/items/top-1.svg', '2026-06-01T10:00:00Z'),

  ('Floral Tiered Midi Dress',
   'Dusty pink floral midi with tiered skirt and smocked back. Tiny pull near hem (pictured) — barely noticeable.',
   22, 'Lightly worn', 'M', 'dresses', 'karina', 'available', '/items/dress-1.svg', '2026-06-02T10:00:00Z'),

  ('Ribbon-Tie Cardigan',
   'Blush knit cardigan with ribbon ties. Brand new, bought the wrong size. Original tag attached.',
   18, 'Brand new with tag', 'M', 'tops', 'anthea', 'reserved', '/items/top-2.svg', '2026-06-03T10:00:00Z'),

  ('High-Waist Wide-Leg Trousers',
   'Ivory wide-leg trousers, high waisted with side zip. Hemmed for ~158cm. No flaws.',
   15, 'Lightly worn', 'S', 'bottoms', 'selena', 'available', '/items/bottom-1.svg', '2026-06-04T10:00:00Z'),

  ('Pearl Bow Hair Clips (Set of 3)',
   'Set of three pearl and ribbon bow clips. Worn once for a shoot. Comes with organza pouch.',
   6, 'Like new', 'Free size', 'accessories', 'charlotte', 'available', '/items/acc-1.svg', '2026-06-05T10:00:00Z'),

  ('Linen A-Line Mini Skirt',
   'Soft white linen-blend mini with built-in shorts. Belt loop slightly loose — stated as-is.',
   10, 'Well loved', 'S', 'bottoms', 'cherrelle', 'sold', '/items/bottom-2.svg', '2026-06-05T12:00:00Z'),

  ('Satin Slip Dress in Rose',
   'Dusty rose satin slip dress with adjustable straps. Dry-cleaned, ready for a new home.',
   25, 'Like new', 'M', 'dresses', 'selena', 'available', '/items/dress-2.svg', '2026-06-06T10:00:00Z'),

  ('Quilted Mini Shoulder Bag',
   'Cream quilted bag with gold-tone chain. Light scuff on base (pictured). Fits phone + cardholder + lip balm.',
   14, 'Lightly worn', 'Free size', 'accessories', 'karina', 'available', '/items/acc-2.svg', '2026-06-07T10:00:00Z'),

  ('Lace-Trim Camisole',
   'White lace-trim cami, double lined. Bought from a local boutique, worn once.',
   9, 'Like new', 'XS', 'tops', 'charlotte', 'reserved', '/items/top-3.svg', '2026-06-08T10:00:00Z'),

  ('Coquette Ribbon Belt',
   'Skinny blush ribbon belt with heart buckle. New without tag — never found an outfit for it.',
   5, 'Brand new without tag', 'Free size', 'accessories', 'anthea', 'available', '/items/acc-3.svg', '2026-06-09T10:00:00Z');
