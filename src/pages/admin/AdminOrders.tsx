import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";

type Status = "lead" | "design" | "production" | "installation" | "completed" | "on_hold";

type Order = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: Status;
  progress: number;
  next_milestone: string | null;
  next_milestone_date: string | null;
  updated_at: string;
};

type Customer = { id: string; full_name: string | null; phone: string | null };

const statusOptions: { value: Status; label: string }[] = [
  { value: "lead", label: "פנייה ראשונית" },
  { value: "design", label: "תכנון ועיצוב" },
  { value: "production", label: "ייצור" },
  { value: "installation", label: "התקנה" },
  { value: "completed", label: "הושלם" },
  { value: "on_hold", label: "בהמתנה" },
];

const empty: Partial<Order> = {
  title: "",
  description: "",
  location: "",
  status: "lead",
  progress: 0,
  next_milestone: "",
  next_milestone_date: "",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Order> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: ord }, { data: cust }] = await Promise.all([
      supabase.from("customer_projects").select("*").order("updated_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, phone").order("full_name"),
    ]);
    setOrders((ord as Order[]) ?? []);
    setCustomers((cust as Customer[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const nameFor = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c?.full_name || c?.phone || id.slice(0, 8);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.user_id) return toast.error("בחר לקוח");
    if (!editing.title) return toast.error("חובה כותרת");
    setSaving(true);
    const payload = {
      user_id: editing.user_id,
      title: editing.title!,
      description: editing.description || null,
      location: editing.location || null,
      status: (editing.status ?? "lead") as Status,
      progress: Math.max(0, Math.min(100, Number(editing.progress ?? 0))),
      next_milestone: editing.next_milestone || null,
      next_milestone_date: editing.next_milestone_date || null,
    };
    const { error } = editing.id
      ? await supabase.from("customer_projects").update(payload).eq("id", editing.id)
      : await supabase.from("customer_projects").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("נשמר");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק הזמנה זו?")) return;
    const { error } = await supabase.from("customer_projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    load();
  };

  return (
    <AdminLayout>
      <header className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-foreground uppercase mb-1">Orders</p>
          <h1 className="font-display text-3xl">הזמנות לקוחות</h1>
          <p className="text-sm text-muted-foreground mt-1">כאן הלקוח רואה את סטטוס ההזמנה שלו באזור האישי</p>
        </div>
        <Button onClick={() => setEditing(empty)} className="gap-2">
          <Plus className="w-4 h-4" />
          הזמנה חדשה
        </Button>
      </header>

      {loading ? (
        <p className="text-muted-foreground">טוען…</p>
      ) : orders.length === 0 ? (
        <div className="bg-card border border-border rounded-sm p-10 text-center text-muted-foreground">
          אין הזמנות עדיין. לחץ "הזמנה חדשה" כדי להוסיף.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <article key={o.id} className="bg-card border border-border rounded-sm p-5">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <h3 className="font-display text-xl">{o.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    לקוח: <strong>{nameFor(o.user_id)}</strong>
                    {o.location && ` · ${o.location}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded-sm bg-accent/10 text-accent">
                    {statusOptions.find((s) => s.value === o.status)?.label}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(o)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(o.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>התקדמות</span>
                  <span>{o.progress}%</span>
                </div>
                <Progress value={o.progress} />
              </div>
              {o.next_milestone && (
                <p className="mt-3 text-sm flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent" />
                  אבן דרך: <strong className="text-foreground">{o.next_milestone}</strong>
                  {o.next_milestone_date && (
                    <span className="text-xs">({new Date(o.next_milestone_date).toLocaleDateString("he-IL")})</span>
                  )}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent dir="rtl" className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "עריכת הזמנה" : "הזמנה חדשה"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>לקוח</Label>
                <Select
                  value={editing.user_id}
                  onValueChange={(v) => setEditing((s) => ({ ...s!, user_id: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name || "ללא שם"} {c.phone && `· ${c.phone}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>כותרת</Label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>תיאור</Label>
                <Textarea value={editing.description ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>מיקום</Label>
                  <Input value={editing.location ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, location: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>סטטוס</Label>
                  <Select
                    value={editing.status ?? "lead"}
                    onValueChange={(v) => setEditing((s) => ({ ...s!, status: v as Status }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>התקדמות (%)</Label>
                <Input type="number" min={0} max={100} value={editing.progress ?? 0} onChange={(e) => setEditing((s) => ({ ...s!, progress: Number(e.target.value) }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>אבן דרך הבאה</Label>
                  <Input value={editing.next_milestone ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, next_milestone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>תאריך יעד</Label>
                  <Input type="date" value={editing.next_milestone_date ?? ""} onChange={(e) => setEditing((s) => ({ ...s!, next_milestone_date: e.target.value }))} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>ביטול</Button>
            <Button onClick={save} disabled={saving}>{saving ? "שומר..." : "שמור"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
