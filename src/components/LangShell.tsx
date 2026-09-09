import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DirectionProvider } from "@radix-ui/react-direction";
import { LANGUAGE_DIR, type Language } from "@/i18n";

/**
 * Wraps one language's route tree and keeps i18next and the <html> element in
 * step with it.
 *
 * Radix reads direction from React context and from nowhere else — not from
 * CSS, not from the html element's dir attribute — so the primitives need the
 * provider here or their arrow keys, typeahead and menu placement stay
 * left-to-right on a right-to-left page. Nothing looks wrong; it just behaves
 * backwards for anyone using a keyboard.
 *
 * `dir` and `lang` are also set by an inline script in index.html before React
 * mounts — without that the first paint is LTR and visibly snaps into place on
 * an English deep link. This effect is what keeps them right afterwards, when
 * the user switches language client-side.
 */
const LangShell = ({ lang }: { lang: Language }) => {
  const { i18n } = useTranslation();

  /*
   * Switched during render, not in the effect below.
   *
   * An effect runs AFTER the commit, so every /en page used to paint once in
   * Hebrew — Hebrew headings, Hebrew statement copy, Hebrew club form, in an
   * LTR layout — and swap a frame later. Both catalogues are bundled and
   * loaded, so changeLanguage resolves synchronously here and the children
   * below read the right one in this same pass. Idempotent, so a double render
   * costs nothing.
   */
  if (i18n.resolvedLanguage !== lang) i18n.changeLanguage(lang);

  useEffect(() => {
    if (i18n.resolvedLanguage !== lang) i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGE_DIR[lang];
  }, [lang, i18n]);

  return (
    <DirectionProvider dir={LANGUAGE_DIR[lang]}>
      <Outlet />
    </DirectionProvider>
  );
};

export default LangShell;
