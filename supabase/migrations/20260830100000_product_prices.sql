-- Optional prices on products.
--
-- Aluma's own copy says there is no price list and every piece is made to
-- order, so this is nullable and stays nullable: a product without a price is
-- the normal case, and the site shows nothing rather than "₪0".
--
-- `price_note` is the short line beside it — "החל מ-", "כולל הובלה" — so the
-- owner can qualify a number without us guessing which qualifier they meant.
--
-- Safe to run twice.

alter table public.site_collection_products
  add column if not exists price numeric(10, 2),
  add column if not exists price_note text;

comment on column public.site_collection_products.price is
  'Optional. Null or 0 means the product is not priced and the site shows no price.';
comment on column public.site_collection_products.price_note is
  'Optional short qualifier shown next to the price, e.g. "החל מ-".';

-- Nothing to change on the policies: both columns live on a table that already
-- has "public read" for published rows and "admin write".
