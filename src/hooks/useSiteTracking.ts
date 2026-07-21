import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";
import { loadPixel, trackPixel } from "@/lib/pixel";

const SID_KEY = "aluma_sid";

function getSessionId() {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return crypto.randomUUID();
  }
}

export function useSiteTracking() {
  const location = useLocation();
  const [consented, setConsented] = useState(hasAnalyticsConsent);

  // Re-run tracking as soon as the visitor accepts, without a page reload.
  useEffect(() => onConsentChange((v) => setConsented(v === "accepted")), []);

  useEffect(() => {
    if (!consented) return;
    if (location.pathname.startsWith("/admin")) return;

    // Consent given: activate the pixel (idempotent) and fire this route's PageView.
    loadPixel();
    trackPixel("PageView");

    const sid = getSessionId();
    const path = location.pathname;
    const projectMatch = path.match(/^\/projects\/([^/]+)/);
    const projectSlug = projectMatch ? projectMatch[1] : null;

    // record page view via controlled server-side function
    supabase
      .rpc("record_page_view", {
        _session_id: sid,
        _path: path,
        _referrer: document.referrer || null,
        _user_agent: navigator.userAgent.slice(0, 300),
        _project_slug: projectSlug,
      })
      .then(() => {});

    // heartbeat for live visitors (server-side controlled function)
    const beat = () => {
      supabase
        .rpc("record_heartbeat", { _session_id: sid, _path: path })
        .then(() => {});
    };
    beat();
    const id = window.setInterval(beat, 45_000);
    return () => window.clearInterval(id);
  }, [location.pathname, consented]);
}
