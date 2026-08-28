import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import loungeSet from "@/assets/categories/lounge-set.jpg";
import sunbed from "@/assets/categories/sunbed.jpg";
import diningSet from "@/assets/categories/dining-set.jpg";
import coffeeTable from "@/assets/categories/coffee-table.jpg";
import fireTable from "@/assets/categories/fire-table.jpg";
import barChair from "@/assets/categories/bar-chair.jpg";
import diningChair from "@/assets/categories/dining-chair.jpg";
import umbrella from "@/assets/categories/umbrella.jpg";

type Tile = { id: string; img: string; collection?: string };

const tiles: Tile[] = [
  { id: "lounge", img: loungeSet, collection: "salons" },
  { id: "fire", img: fireTable, collection: "fire-tables" },
  { id: "sunbed", img: sunbed },
  { id: "coffee", img: coffeeTable },
  { id: "bar", img: barChair },
  { id: "dining", img: diningSet },
  { id: "chairs", img: diningChair },
  { id: "accessories", img: umbrella },
];

/**
 * The eight categories — on the catalogue page, which is where a catalogue
 * belongs.
 *
 * These used to open the home page as full-bleed tiles with headlines and
 * buttons laid over the photographs, which is what the client meant by "all
 * the categories immediately, with no seduction". Here they are a quiet grid:
 * the photograph, the name beneath it, nothing over it. Four across rather
 * than two full-bleed rows, no scrim, no overlaid type, no CTA per tile —
 * the tile IS the link.
 */
const CategoryGrid = () => {
  const { to } = useLocalizedPath();
  const { t } = useTranslation("home");

  return (
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
      {tiles.map((tile, i) => (
        <li key={tile.id}>
          <Link
            to={tile.collection ? to(`/collections/${tile.collection}`) : to("/collections")}
            className="group block text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={tile.img}
                alt={t(`tiles.${tile.id}.label`)}
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
              />
            </div>
            <h3 className="mt-4 text-small text-foreground">{t(`tiles.${tile.id}.label`)}</h3>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default CategoryGrid;
