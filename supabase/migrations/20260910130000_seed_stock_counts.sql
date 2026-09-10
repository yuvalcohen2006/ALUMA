-- Made-up stock counts, so the "only a few left" line has something to show.
--
-- These are placeholders. Every one of them is a number nobody counted, and
-- the owner overwrites any of them from the product form — which is the point
-- of running this: it puts the feature on the screen so it can be judged.
--
-- Deliberately NOT random. A number that changes every time the script runs
-- makes "why does it say 4 today and 11 yesterday" a support question.

-- Everything gets a healthy number first: 8 to 32, fixed per product because
-- it is derived from the slug rather than drawn.
update public.site_collection_products
   set stock = 8 + (length(slug) * 7 + ascii(slug)) % 25
 where stock is null;

-- Then six pieces are pulled down into the warning band, spread across
-- different collections so the line is not all in one row. `cotta` is one of
-- the three on the home page strip, which is where this will be looked at
-- first.
update public.site_collection_products set stock = 2 where slug = 'cotta';
update public.site_collection_products set stock = 4 where slug = 'siena';
update public.site_collection_products set stock = 5 where slug = 'aria';
update public.site_collection_products set stock = 3 where slug = 'terra';
update public.site_collection_products set stock = 1 where slug = 'luz';
update public.site_collection_products set stock = 5 where slug = 'vela';

-- Nothing is set to 0. "Sold out" on a live catalogue is a claim about the
-- business, not a demo, and it is one keystroke away in the admin when it is
-- true.
