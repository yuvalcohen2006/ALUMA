import Reveal from "@/components/Reveal";
import { useSiteText } from "@/hooks/useSiteText";

/**
 * The warm-up the client said was missing: *"אין סיקרון של הלקוח, צריך לשים
 * בהתחלה אודות החברה במשפט או שניים"*.
 *
 * Every reference brand does this and none of them does it loudly. Tribù runs
 * the same 40–70 words as its closing paragraph; Hem opens on one line of it
 * before anything is for sale. It is a paragraph on an empty background —
 * no image, no button, no rule, no icons. Restraint is the whole point: this
 * section earns the right to show product by not selling anything itself.
 */
const BrandStatement = () => {
  const t = useSiteText();
  return (
  <section className="bg-background">
    <div className="mx-auto max-w-[860px] px-6 py-20 md:py-28 lg:py-36">
      <Reveal>
        <p className="max-w-[46ch] text-start text-heading font-normal tracking-normal text-foreground">
          {t("home.statement.lead", "אלומה נולדה מתוך חיבור בין חומר לאור.")}
        </p>
        <p className="mt-6 max-w-[58ch] text-start text-body tracking-normal text-foreground-soft">
          {t(
"home.statement.body",
"אנחנו מתכננים ומייצרים ריהוט חוץ בהתאמה אישית — שלדת אלומיניום, בדי Sunbrella ומשטחי אבן שנבחרו כדי לעמוד בשמש, במלח ובגשם של ישראל. כל פריט נמדד למרחב שהוא נכנס אליו, ונשאר בחוץ כל השנה.",
          )}
        </p>
      </Reveal>
    </div>
  </section>
  );
};

export default BrandStatement;
