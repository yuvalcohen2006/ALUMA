/**
 * Directions to the showroom, as links a phone hands straight to its app.
 *
 * Both are the providers' own universal links rather than app schemes:
 * `waze.com/ul` opens the Waze app when it is installed and Waze's web page
 * when it is not, where a `waze://` link simply does nothing on a phone
 * without the app. Google Maps' search URL does the same for its own app.
 */
export const mapLinks = (street: string, city: string) => {
  const q = encodeURIComponent(`${street} ${city}`);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    waze: `https://waze.com/ul?q=${q}&navigate=yes`,
  };
};

/**
 * Whether to open a map link in a new tab.
 *
 * Only on a computer. On a phone the link is followed in the same tab, as a
 * plain tap: that is the navigation iOS and Android reliably intercept to open
 * the installed app, and a new tab is one more hop for the handoff to fail on.
 * On a computer there is no app to open, and the visitor keeps this page.
 */
export const mapLinkTarget = (): { target?: string; rel?: string } => {
  const touch =
    typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;
  return touch ? {} : { target: "_blank", rel: "noopener noreferrer" };
};
