import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { canonicalRedirect } from "./lib/canonical-host";
import { SITE } from "./config/site";
import "./index.css";

/**
 * Go home before rendering anything.
 *
 * A `*.vercel.app` address serves the same site at the wrong name. Supabase
 * still lists one as its Site URL, so a Google sign-in started on
 * alumaoutdoor.com can land back on the preview — same site, wrong address,
 * session attached to the wrong host.
 *
 * Done here rather than inside React so nothing paints at the wrong address
 * first, and the hash survives: Supabase returns the session tokens in it.
 */
const home = canonicalRedirect(window.location.href, new URL(SITE.domain).hostname);
if (home) {
  window.location.replace(home);
} else {
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  );
}
