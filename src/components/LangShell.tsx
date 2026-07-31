import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGUAGE_DIR, type Language } from "@/i18n";

/**
 * Wraps one language's route tree and keeps i18next and the <html> element in
 * step with it.
 *
 * `dir` and `lang` are also set by an inline script in index.html before React
 * mounts — without that the first paint is LTR and visibly snaps into place on
 * an English deep link. This effect is what keeps them right afterwards, when
 * the user switches language client-side.
 */
const LangShell = ({ lang }: { lang: Language }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.resolvedLanguage !== lang) i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGE_DIR[lang];
  }, [lang, i18n]);

  return <Outlet />;
};

export default LangShell;
