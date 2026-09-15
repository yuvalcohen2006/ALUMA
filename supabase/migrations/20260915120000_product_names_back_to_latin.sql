-- Product names back to the owner's own spelling.
--
-- 20260910120000 transliterated the 47 product names into Hebrew (milo → מילו)
-- and kept each original in name_en. The owner wants the originals on the
-- Hebrew site as well, spelled and capitalised exactly as they were typed.
--
-- The site already shows them without this script: it reads name_en back
-- whenever name is a Hebrew transliteration. This only makes the admin match,
-- so the "שם" field shows "milo" again rather than מילו.
--
-- Only rows whose name contains Hebrew letters and whose name_en is filled in
-- are touched, so a piece the owner has renamed since is left alone. Safe to
-- run twice: the second run finds nothing left to change.

update public.site_collection_products
   set name = btrim(name_en)
 where name ~ '[א-ת]'
   and name_en is not null
   and btrim(name_en) <> '';
