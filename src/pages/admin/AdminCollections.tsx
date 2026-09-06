import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AddNewTile from "@/components/admin/AddNewTile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatPrice, parsePriceInput } from "@/lib/price";
// A product may be "ספה מודולרית" or "Sunbrella Lounge" — the field cannot know.
import { contentDirection } from "@/lib/field-direction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  ChevronDown,
  ChevronLeft,
  Package,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { uploadFile } from "@/lib/admin-storage";
import ProductFinishes, { DEFAULT_VARIANT } from "./ProductFinishes";
import { planVariantSync, type DraftVariant } from "@/lib/variant-sync";
import PhotoSpec from "@/components/admin/PhotoSpec";

type Collection = {
  id: string;
  slug: string;
  name_he: string;
  name_en: string | null;
  intro: string | null;
  image_url: string | null;
  sort_order: number;
  published: boolean;
};

type Product = {
  id: string;
  collection_id: string;
  slug: string;
  name: string;
  tag: string | null;
  tagline: string | null;
  description: any;
  highlights: any;
  materials: any;
  dimensions: string | null;
  cover_url: string | null;
  gallery: any;
  price: number | null;
  price_note: string | null;
  sort_order: number;
  published: boolean;
};

/**
 * Buffered text field: keeps raw typing (spaces, empty lines) in local state
 * and only calls onCommit(parsed) on blur, so parsing/trimming never
 * clobbers the user's in-progress input.
 */
function BufferedTextarea({
  initial,
  onCommit,
  rows = 4,
  placeholder,
}: {
  initial: string;
  onCommit: (raw: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [val, setVal] = useState(initial);
  const lastInitial = useRef(initial);
  useEffect(() => {
    if (initial !== lastInitial.current) {
      lastInitial.current = initial;
      setVal(initial);
    }
  }, [initial]);
  return (
    <Textarea
      rows={rows}
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onCommit(val)}
    />
  );
}

function BufferedInput({
  initial,
  onCommit,
  placeholder,
}: {
  initial: string;
  onCommit: (raw: string) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState(initial);
  const lastInitial = useRef(initial);
  useEffect(() => {
    if (initial !== lastInitial.current) {
      lastInitial.current = initial;
      setVal(initial);
    }
  }, [initial]);
  return (
    <Input
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onCommit(val)}
    />
  );
}

/* ---- Hebrew → Latin transliteration for clean URLs ---- */
const HE_MAP: Record<string, string> = {
  א: "a", ב: "b", ג: "g", ד: "d", ה: "h", ו: "v", ז: "z", ח: "ch",
  ט: "t", י: "y", כ: "k", ך: "k", ל: "l", מ: "m", ם: "m", נ: "n",
  ן: "n", ס: "s", ע: "a", פ: "p", ף: "f", צ: "tz", ץ: "tz", ק: "k",
  ר: "r", ש: "sh", ת: "t",
};

const transliterate = (input: string) =>
  Array.from(input)
    .map((ch) => HE_MAP[ch] ?? ch)
    .join("");

const slugify = (s: string) => {
  const base = transliterate((s || "").trim().toLowerCase());
  return base
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
};

const emptyCollection: Partial<Collection> = {
  name_he: "",
  name_en: "",
  intro: "",
  image_url: "",
  sort_order: 0,
  published: true,
};

const emptyProduct: Partial<Product> = {
  name: "",
  tag: "",
  tagline: "",
  description: [],
  highlights: [],
  materials: [],
  dimensions: "",
  cover_url: "",
  gallery: [],
  price: null,
  price_note: "",
  sort_order: 0,
  published: true,
};

/* ---- Sortable row components ---- */
/**
 * One collection, as a row you click.
 *
 * The row is a container, not a link: a link cannot legally wrap the edit and
 * delete buttons, and doing it anyway gives a screen reader a link containing
 * buttons and a keyboard user a tab stop that does the wrong thing. Instead
 * the name is the link and its ::after is stretched over the whole row, so
 * the pointer gets the big target while the accessibility tree stays honest —
 * one link, two buttons, in that order.
 *
 * Padding is a quarter of what it was. Nine collections at 64px of chrome each
 * pushed the ninth below the fold for no reason; the photograph is what
 * identifies a collection and it needs no help.
 */
function SortableCollectionCard({
  collection: c,
  productsCount,
  href,
  onEdit,
  onDelete,
}: {
  collection: Collection;
  productsCount: number;
  href: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: c.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : ("auto" as const),
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-3 border-b border-border bg-card px-3 py-2 transition-colors last:border-b-0 hover:bg-secondary focus-within:bg-secondary"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`שינוי הסדר של ${c.name_he}`}
        className="relative z-10 shrink-0 cursor-grab touch-none rounded-sm p-1 text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {c.image_url ? (
        <img
          src={c.image_url}
          alt=""
          className="h-11 w-11 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-secondary">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Link
          to={href}
          /* The stretched pseudo-element is the whole-row target. */
          className="text-[15px] font-medium text-foreground after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-ring"
        >
          {c.name_he}
        </Link>
        <p className="truncate text-sm text-muted-foreground">
          {productsCount} · {c.published ? "" : "מוסתר"}
        </p>
      </div>

      {/* Above the stretched link, so they stay clickable and keep their own
          hit area. Revealed on hover, always present for the keyboard. */}
      <div className="relative z-10 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`עריכת ${c.name_he}`}
          className="grid h-9 w-9 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`מחיקת ${c.name_he}`}
          className="grid h-9 w-9 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function SortableProductRow({
  product: p,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: p.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-background rounded p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:text-primary touch-none"
        aria-label="גרור לסידור מחדש"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {p.cover_url ? (
        <img src={p.cover_url} alt={p.name} className="w-12 h-12 object-cover rounded" />
      ) : (
        <div className="w-12 h-12 bg-muted rounded" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{p.name}</span>
          {!p.published && (
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">טיוטה</span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">{p.tag || "—"}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </Button>
    </div>
  );
}



const AdminCollections = () => {
  const nav = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  const [editCol, setEditCol] = useState<Partial<Collection> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = async () => {
    setLoading(true);
    const [{ data: cols }, { data: prods }] = await Promise.all([
      supabase.from("site_collections").select("*").order("sort_order"),
      supabase.from("site_collection_products").select("*").order("sort_order"),
    ]);
    setCollections((cols as Collection[]) || []);
    const grouped: Record<string, Product[]> = {};
    (prods as Product[] | null)?.forEach((p) => {
      grouped[p.collection_id] = grouped[p.collection_id] || [];
      grouped[p.collection_id].push(p);
    });
    setProducts(grouped);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ---- Reordering via drag-and-drop ---- */
  const persistCollectionOrder = async (ordered: Collection[]) => {
    setCollections(ordered.map((c, i) => ({ ...c, sort_order: i })));
    await Promise.all(
      ordered.map((c, i) =>
        supabase.from("site_collections").update({ sort_order: i }).eq("id", c.id)
      )
    );
  };

  const persistProductOrder = async (collectionId: string, ordered: Product[]) => {
    setProducts({
      ...products,
      [collectionId]: ordered.map((p, i) => ({ ...p, sort_order: i })),
    });
    await Promise.all(
      ordered.map((p, i) =>
        supabase.from("site_collection_products").update({ sort_order: i }).eq("id", p.id)
      )
    );
  };

  const onCollectionDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = collections.findIndex((c) => c.id === active.id);
    const to = collections.findIndex((c) => c.id === over.id);
    if (from < 0 || to < 0) return;
    persistCollectionOrder(arrayMove(collections, from, to));
  };

  const onProductDragEnd = (collectionId: string) => (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const list = products[collectionId] || [];
    const from = list.findIndex((p) => p.id === active.id);
    const to = list.findIndex((p) => p.id === over.id);
    if (from < 0 || to < 0) return;
    persistProductOrder(collectionId, arrayMove(list, from, to));
  };

  /* ---- Collection CRUD ---- */
  const saveCollection = async () => {
    if (!editCol) return;
    if (!editCol.name_he) return toast.error("חובה להזין שם");
    setSaving(true);
    const finalSlug = editCol.id ? editCol.slug! : slugify(editCol.name_he!);
    const nextSort = editCol.id
      ? editCol.sort_order ?? 0
      : (collections[collections.length - 1]?.sort_order ?? -1) + 1;
    const payload = {
      slug: finalSlug,
      name_he: editCol.name_he,
      name_en: editCol.name_en || null,
      intro: editCol.intro || null,
      image_url: editCol.image_url || null,
      sort_order: nextSort,
      published: editCol.published ?? true,
    };
    const { error } = editCol.id
      ? await supabase.from("site_collections").update(payload).eq("id", editCol.id)
      : await supabase.from("site_collections").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("נשמר");
    setEditCol(null);
    load();
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("למחוק קטגוריית קולקציה זו? (גם כל המוצרים שלה יימחקו)")) return;
    const { error } = await supabase.from("site_collections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    load();
  };

  /* ---- Product CRUD ---- */
  const deleteProduct = async (id: string) => {
    if (!confirm("למחוק מוצר זה?")) return;
    const { error } = await supabase.from("site_collection_products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    load();
  };

  /* ---- Uploads ---- */
  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadFile("site-collections", file);
      setEditCol((e) => ({ ...e!, image_url: url }));
      toast.success("הועלה");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };


  return (
    <AdminLayout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">קולקציות ומוצרים</h1>
        </div>
      </header>

      {loading ? (
        <p className="text-muted-foreground">טוען…</p>
      ) : collections.length === 0 ? (
        <div className="max-w-sm">
          <AddNewTile label="הקולקציה הראשונה" onClick={() => setEditCol({ ...emptyCollection })} />
        </div>
      ) : (
        <DndContext
          sensors={dndSensors}
          collisionDetection={closestCenter}
          onDragEnd={onCollectionDragEnd}
        >
          <SortableContext
            items={collections.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="overflow-hidden rounded-sm border border-border">
              {collections.map((c) => (
                <SortableCollectionCard
                  key={c.id}
                  collection={c}
                  productsCount={(products[c.id] || []).length}
                  href={`/admin/collections/${c.id}`}
                  onEdit={() => setEditCol(c)}
                  onDelete={() => deleteCollection(c.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {collections.length > 0 && (
        <div className="mt-6 max-w-sm">
          <AddNewTile label="קולקציה חדשה" onClick={() => setEditCol({ ...emptyCollection })} />
        </div>
      )}

      {/* ===== COLLECTION DIALOG ===== */}
      <Dialog open={!!editCol} onOpenChange={(o) => !o && setEditCol(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editCol?.id ? "עריכת קולקציה" : "קולקציה חדשה"}</DialogTitle>
          </DialogHeader>
          {editCol && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="col-name">שם הקולקציה *</Label>
                <Input
                  id="col-name"
                  dir={contentDirection(editCol.name_he || "")}
                  value={editCol.name_he || ""}
                  onChange={(e) => setEditCol({ ...editCol, name_he: e.target.value })}
                  placeholder="למשל: סלוני חוץ"
                />
                {!editCol.id && editCol.name_he && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    כתובת אוטומטית: <span dir="ltr">/collections#{slugify(editCol.name_he)}</span>
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="col-intro">תיאור קצר</Label>
                <Textarea
                  id="col-intro"
                  dir={contentDirection(editCol.intro || "")}
                  rows={3}
                  value={editCol.intro || ""}
                  onChange={(e) => setEditCol({ ...editCol, intro: e.target.value })}
                />
              </div>
              <div>
                <Label>תמונת קולקציה</Label>
                <div className="mt-2">
                  <PhotoSpec spec="collection" />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {editCol.image_url && (
                    <img
                      src={editCol.image_url}
                      alt=""
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded cursor-pointer hover:bg-muted text-sm">
                    <Upload className="w-4 h-4" />
                    {editCol.image_url ? "החלפה" : "העלאה"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && uploadCover(e.target.files[0])
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editCol.published ?? true}
                  onCheckedChange={(v) => setEditCol({ ...editCol, published: v })}
                />
                <Label className="!mt-0">פורסם</Label>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditCol(null)}>ביטול</Button>
            <Button onClick={saveCollection} disabled={saving || uploading}>
              {saving ? "שומר…" : "שמירה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PRODUCT DIALOG ===== */}
    </AdminLayout>
  );
};

export default AdminCollections;
