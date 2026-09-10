import { useTranslation } from "react-i18next";

/**
 * "Only 3 left", under the photograph.
 *
 * Says nothing at all unless the owner is counting this piece AND the count
 * has fallen to five or fewer. `null` is not zero: 47 products have never been
 * counted, and a stock line on every one of them would say nothing about any
 * of them.
 *
 * `text-end` puts it on the LEFT of a right-to-left page, opposite the name,
 * which is where the client asked for it — and it follows the language rather
 * than the pixel, so it lands on the correct side of /en too.
 */
const LOW_STOCK_AT = 5;

const StockNote = ({ stock }: { stock: number | null }) => {
  const { t } = useTranslation("home");
  if (stock === null || stock > LOW_STOCK_AT) return null;

  const message =
    stock <= 0
      ? t("products.soldOut")
      : stock === 1
        ? t("products.lastOne")
        : t("products.lastFew", { count: stock });

  return (
    <p className="mt-1.5 text-end text-label font-medium text-warning">{message}</p>
  );
};

export default StockNote;
