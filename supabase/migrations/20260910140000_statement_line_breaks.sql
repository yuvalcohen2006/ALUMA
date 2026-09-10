-- The opening paragraph, broken where the client wants it broken.
--
-- Three deliberate lines, not three sentences: the first break falls mid
-- sentence, after "שלדת אלומיניום,". So the breaks cannot be derived from the
-- text — they have to BE the text.
--
-- This field is already `multiline`, so the admin renders it as a textarea and
-- the owner keeps control of the breaks by pressing Enter. The page renders it
-- with `white-space: pre-line`, which honours those newlines and still wraps
-- normally when the column is too narrow for a line — so a phone is not forced
-- into a horizontal scroll to satisfy a desktop composition.
update public.site_texts
   set value = E'אנחנו מתכננים ומייצרים ריהוט חוץ בהתאמה אישית - שלדת אלומיניום,\nבדי Sunbrella ומשטחי אבן שנבחרו כדי לעמוד בשמש, במלח ובגשם של ישראל.\nכל פריט נמדד למרחב שהוא נכנס אליו, ונשאר בחוץ כל השנה.'
 where key = 'home.statement.body';

-- The hint under the field, so the next person to edit it knows the newlines
-- are load-bearing rather than an accident.
update public.site_texts
   set hint = 'כל שורה חדשה כאן היא שורה חדשה באתר. שלוש שורות.'
 where key = 'home.statement.body';
