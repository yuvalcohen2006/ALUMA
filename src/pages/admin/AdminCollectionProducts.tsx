import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, GripVertical, Package, Pencil, Trash2 } from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { dragAnnouncements, dragInstructions, sortableHandleAttributes } from "./dnd-a11y";
import AddNewTile from "@/components/admin/AddNewTile";
import { supabase } from "@/integrations/supabase/client";
import Ltr from "@/components/Ltr";
import { formatPrice } from "@/lib/price";

type Row = {
  id: string;
  name: string;
  cover_url: string | null;
  price: number | null;
  published: boolean;
  sort_order: number;
};

/**
 * The pieces inside one collection.
 *
 * Same row as the collections list one level up: the name is the link, its
 * ::after covers the row, and the two actions sit above it. A list that
 * behaves identically at both levels is one thing to learn instead of two.
 */
function ProductRow({
  product: p,
  onDelete,
}: {
  product: Row;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: p.id , attributes: sortableHandleAttributes });
  const price = formatPrice(p.price);

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="group relative flex items-center gap-3 border-b border-border bg-card px-3 py-2 transition-colors last:border-b-0 hover:bg-secondary focus-within:bg-secondary"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`שינוי הסדר של ${p.name}`}
        className="relative z-10 grid h-11 w-8 shrink-0 cursor-grab touch-none place-items-center rounded-sm text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {p.cover_url ? (
        <img src={p.cover_url} alt="" className="h-[60px] w-[60px] shrink-0 rounded-sm bg-secondary object-contain" />
      ) : (
        <div className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-sm bg-secondary">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Link
          to={`/admin/products/${p.id}`}
          className="text-base font-medium text-foreground after:absolute after:inset-y-0 after:start-0 after:end-[112px] after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-ring"
        >
          {p.name}
        </Link>
        {(price || !p.published) && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {price && <Ltr>{price}</Ltr>}
            {price && !p.published && " · "}
            {!p.published && "מוסתר"}
          </p>
        )}
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <Link
          to={`/admin/products/${p.id}`}
          aria-label={`עריכת ${p.name}`}
          className="grid h-11 w-11 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`מחיקת ${p.name}`}
          className="grid h-11 w-11 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

const AdminCollectionProducts = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: col }, { data: prods }] = await Promise.all([
      supabase.from("site_collections").select("name_he").eq("id", id!).maybeSingle(),
      supabase
        .from("site_collection_products")
        .select("id, name, cover_url, price, published, sort_order")
        .eq("collection_id", id!)
        .order("sort_order"),
    ]);
    setName(col?.name_he ?? "");
    setRows((prods as Row[]) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((r) => r.id === active.id);
    const to = rows.findIndex((r) => r.id === over.id);
    const next = [...rows];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setRows(next);
    await Promise.all(
      next.map((r, i) =>
        supabase.from("site_collection_products").update({ sort_order: i }).eq("id", r.id),
      ),
    );
  };

  const remove = async (row: Row) => {
    if (!confirm(`למחוק את "${row.name}"?`)) return;
    const { error } = await supabase.from("site_collection_products").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    load();
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <Link
          to="/admin/collections"
          className="mb-6 inline-flex h-10 items-center gap-2 -ms-3 rounded-sm px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          קולקציות
        </Link>

        <h1 className="font-display text-3xl text-foreground">{name}</h1>

        {loading ? (
          <p className="mt-8 text-muted-foreground">טוען…</p>
        ) : (
          <>
            {rows.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
                accessibility={{
                  announcements: dragAnnouncements(
                    (id) => rows.find((r) => r.id === id)?.name ?? "פריט",
                  ),
                  screenReaderInstructions: dragInstructions,
                }}
              >
                <SortableContext
                  items={rows.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul role="list" className="mt-8 overflow-hidden rounded-sm border border-border">
                    {rows.map((r) => (
                      <ProductRow key={r.id} product={r} onDelete={() => remove(r)} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}

            <div className="mt-6 max-w-[15rem]">
              <AddNewTile
                to={`/admin/products/new?collection=${id}`}
                label={rows.length ? "מוצר חדש" : "המוצר הראשון"}
              />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCollectionProducts;
