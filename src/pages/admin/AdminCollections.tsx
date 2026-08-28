import { useEffect, useState, useRef } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import ProductFinishes from "./ProductFinishes";

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
  sort_order: 0,
  published: true,
};

/* ---- Sortable row components ---- */
function SortableCollectionCard({
  collection: c,
  open,
  productsCount,
  onToggle,
  onEdit,
  onDelete,
  children,
}: {
  collection: Collection;
  open: boolean;
  productsCount: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: c.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto" as const,
  };
  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 p-4">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 -ml-1 text-muted-foreground hover:text-primary touch-none"
            aria-label="גרור לסידור מחדש"
            title="גרור כדי לסדר"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-muted rounded"
            aria-label="פתח/סגור"
          >
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {c.image_url ? (
            <img src={c.image_url} alt={c.name_he} className="w-16 h-16 object-cover rounded" />
          ) : (
            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{c.name_he}</h3>
              {!c.published && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">טיוטה</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              /{c.slug} • {productsCount} מוצרים
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
        {children}
      </CardContent>
    </Card>
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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editCol, setEditCol] = useState<Partial<Collection> | null>(null);
  const [editProd, setEditProd] = useState<Partial<Product> | null>(null);
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
  const saveProduct = async () => {
    if (!editProd) return;
    if (!editProd.name) return toast.error("חובה להזין שם מוצר");
    if (!editProd.collection_id) return toast.error("חסרה קולקציה");
    setSaving(true);
    const finalSlug = editProd.id ? editProd.slug! : slugify(editProd.name!);
    const list = products[editProd.collection_id] || [];
    const nextSort = editProd.id
      ? editProd.sort_order ?? 0
      : (list[list.length - 1]?.sort_order ?? -1) + 1;
    const payload = {
      collection_id: editProd.collection_id,
      slug: finalSlug,
      name: editProd.name,
      tag: editProd.tag || null,
      tagline: editProd.tagline || null,
      description: editProd.description || [],
      highlights: editProd.highlights || [],
      materials: editProd.materials || [],
      dimensions: editProd.dimensions || null,
      cover_url: editProd.cover_url || null,
      gallery: editProd.gallery || [],
      sort_order: nextSort,
      published: editProd.published ?? true,
    };
    const { error } = editProd.id
      ? await supabase.from("site_collection_products").update(payload).eq("id", editProd.id)
      : await supabase.from("site_collection_products").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("נשמר");
    setEditProd(null);
    load();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("למחוק מוצר זה?")) return;
    const { error } = await supabase.from("site_collection_products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    load();
  };

  /* ---- Uploads ---- */
  const uploadCover = async (file: File, target: "col" | "prod") => {
    setUploading(true);
    try {
      const { url } = await uploadFile("site-collections", file);
      if (target === "col") setEditCol((e) => ({ ...e!, image_url: url }));
      else setEditProd((e) => ({ ...e!, cover_url: url }));
      toast.success("הועלה");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const uploadGallery = async (files: FileList) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const { url } = await uploadFile("site-collections", f);
        urls.push(url);
      }
      setEditProd((e) => ({ ...e!, gallery: [...((e?.gallery as string[]) || []), ...urls] }));
      toast.success(`${urls.length} תמונות נוספו`);
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
          <p className="text-muted-foreground mt-1">
            גררו בעזרת החצים כדי לשנות סדר. כתובת ה-URL נוצרת אוטומטית מהשם.
          </p>
        </div>
        <Button onClick={() => setEditCol({ ...emptyCollection })}>
          <Plus className="w-4 h-4 ml-2" />
          קולקציה חדשה
        </Button>
      </header>

      {loading ? (
        <p className="text-muted-foreground">טוען…</p>
      ) : collections.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            עדיין אין קולקציות. הוסיפו קולקציה ראשונה.
          </CardContent>
        </Card>
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
            <div className="space-y-4">
              {collections.map((c) => {
                const open = openId === c.id;
                const list = products[c.id] || [];
                return (
                  <SortableCollectionCard
                    key={c.id}
                    collection={c}
                    open={open}
                    productsCount={list.length}
                    onToggle={() => setOpenId(open ? null : c.id)}
                    onEdit={() => setEditCol(c)}
                    onDelete={() => deleteCollection(c.id)}
                  >
                    {open && (
                      <div className="border-t border-border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            מוצרים בקולקציה
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditProd({ ...emptyProduct, collection_id: c.id })
                            }
                          >
                            <Plus className="w-4 h-4 ml-1" />
                            מוצר חדש
                          </Button>
                        </div>
                        {list.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            אין עדיין מוצרים בקולקציה הזו.
                          </p>
                        ) : (
                          <DndContext
                            sensors={dndSensors}
                            collisionDetection={closestCenter}
                            onDragEnd={onProductDragEnd(c.id)}
                          >
                            <SortableContext
                              items={list.map((p) => p.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2">
                                {list.map((p) => (
                                  <SortableProductRow
                                    key={p.id}
                                    product={p}
                                    onEdit={() => setEditProd(p)}
                                    onDelete={() => deleteProduct(p.id)}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        )}
                      </div>
                    )}
                  </SortableCollectionCard>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
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
                <Label>שם הקולקציה *</Label>
                <Input
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
                <Label>תיאור קצר</Label>
                <Textarea
                  rows={3}
                  value={editCol.intro || ""}
                  onChange={(e) => setEditCol({ ...editCol, intro: e.target.value })}
                />
              </div>
              <div>
                <Label>תמונת קולקציה</Label>
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
                        e.target.files?.[0] && uploadCover(e.target.files[0], "col")
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Finishes live in their own table keyed by product_id, so they
                  can only be attached once the product row exists. */}
              {editProd.id ? (
                <ProductFinishes productId={editProd.id as string} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  שמרו את המוצר כדי להוסיף לו גימורים וצבעים.
                </p>
              )}

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
      <Dialog open={!!editProd} onOpenChange={(o) => !o && setEditProd(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editProd?.id ? "עריכת מוצר" : "מוצר חדש"}</DialogTitle>
          </DialogHeader>
          {editProd && (
            <div className="space-y-4">
              <div>
                <Label>שם מוצר *</Label>
                <Input
                  value={editProd.name || ""}
                  onChange={(e) => setEditProd({ ...editProd, name: e.target.value })}
                />
                {!editProd.id && editProd.name && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    כתובת אוטומטית: <span dir="ltr">/collections/{slugify(editProd.name)}</span>
                  </p>
                )}
              </div>
              <div>
                <Label>משפט פתיחה (Tagline)</Label>
                <Input
                  value={editProd.tagline || ""}
                  onChange={(e) => setEditProd({ ...editProd, tagline: e.target.value })}
                />
              </div>
              <div>
                <Label>על המוצר (פסקה לכל שורה ריקה)</Label>
                <BufferedTextarea
                  rows={5}
                  initial={((editProd.description as string[]) || []).join("\n\n")}
                  placeholder={"פסקה ראשונה...\n\nפסקה שנייה..."}
                  onCommit={(raw) =>
                    setEditProd({
                      ...editProd,
                      description: raw
                        .split(/\n\s*\n/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div>
                <Label>נקודות עיצוב (שורה לכל נקודה, בפורמט: כותרת | תיאור)</Label>
                <BufferedTextarea
                  rows={4}
                  initial={((editProd.highlights as any[]) || [])
                    .map((h) => `${h.title} | ${h.desc}`)
                    .join("\n")}
                  placeholder="עץ אקליפטוס FSC | מעובד וחתום, מתאים לחוץ קבוע"
                  onCommit={(raw) =>
                    setEditProd({
                      ...editProd,
                      highlights: raw
                        .split("\n")
                        .map((line) => {
                          const [title, ...rest] = line.split("|");
                          return { title: (title || "").trim(), desc: rest.join("|").trim() };
                        })
                        .filter((h) => h.title),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>חומרים (שורה לכל חומר)</Label>
                  <BufferedTextarea
                    rows={3}
                    initial={((editProd.materials as string[]) || []).join("\n")}
                    placeholder="עץ אקליפטוס FSC&#10;אלומיניום אלחוש 6061&#10;בדים נושמים לחוץ"
                    onCommit={(raw) =>
                      setEditProd({
                        ...editProd,
                        materials: raw
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>מידות בסיס</Label>
                  <Input
                    value={editProd.dimensions || ""}
                    onChange={(e) =>
                      setEditProd({ ...editProd, dimensions: e.target.value })
                    }
                    placeholder="אורך 240 ס״מ · עומק 92 ס״מ"
                  />
                </div>
              </div>
              <div>
                <Label>תמונת כיסוי</Label>
                <div className="flex items-center gap-3 mt-2">
                  {editProd.cover_url && (
                    <img
                      src={editProd.cover_url}
                      alt=""
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded cursor-pointer hover:bg-muted text-sm">
                    <Upload className="w-4 h-4" />
                    {editProd.cover_url ? "החלפה" : "העלאה"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && uploadCover(e.target.files[0], "prod")
                      }
                    />
                  </label>
                </div>
              </div>
              <div>
                <Label>גלריה</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {((editProd.gallery as string[]) || []).map((url, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover rounded" />
                      <button
                        onClick={() =>
                          setEditProd({
                            ...editProd,
                            gallery: (editProd.gallery as string[]).filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-sm p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:bg-muted">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && uploadGallery(e.target.files)}
                    />
                  </label>
                </div>
              </div>

              {/* Finishes live in their own table keyed by product_id, so they
                  can only be attached once the product row exists. */}
              {editProd.id ? (
                <ProductFinishes productId={editProd.id as string} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  שמרו את המוצר כדי להוסיף לו גימורים וצבעים.
                </p>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={editProd.published ?? true}
                  onCheckedChange={(v) => setEditProd({ ...editProd, published: v })}
                />
                <Label className="!mt-0">פורסם</Label>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditProd(null)}>ביטול</Button>
            <Button onClick={saveProduct} disabled={saving || uploading}>
              {saving ? "שומר…" : "שמירה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCollections;
