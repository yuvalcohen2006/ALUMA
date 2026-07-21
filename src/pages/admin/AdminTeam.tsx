import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, MailCheck, Clock, Shield, Pencil, Check, X } from "lucide-react";

type AdminMember = {
  user_id: string;
  full_name: string | null;
};

type Invitation = {
  id: string;
  email: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
};

const AdminTeam = () => {
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const startEdit = (a: AdminMember) => {
    setEditingId(a.user_id);
    setEditingName(a.full_name || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveName = async (userId: string) => {
    const name = editingName.trim();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name || null })
      .eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success("השם עודכן");
    cancelEdit();
    loadTeam();
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
    loadTeam().finally(() => setLoading(false));
  }, []);

  const loadTeam = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      setAdmins(
        ids.map((id) => ({
          user_id: id,
          full_name: profs?.find((p) => p.id === id)?.full_name ?? null,
        }))
      );
    } else {
      setAdmins([]);
    }

    const { data: inv } = await supabase
      .from("admin_invitations")
      .select("id, email, status, created_at, accepted_at")
      .order("created_at", { ascending: false });
    setInvites(inv ?? []);
  };

  const invite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("כתובת אימייל לא תקינה");
      return;
    }
    setInviting(true);
    const { data, error } = await supabase.functions.invoke("invite-admin", {
      body: { email },
    });
    setInviting(false);
    if (error) {
      toast.error(error.message || "שגיאה בשליחת הזמנה");
      return;
    }
    if (data?.mode === "promoted") {
      toast.success("המשתמש כבר קיים באתר – שודרג למנהל מיידית");
    } else {
      toast.success("הזמנה נשלחה לאימייל");
    }
    setInviteEmail("");
    loadTeam();
  };

  const removeAdmin = async (userId: string) => {
    if (userId === me) {
      toast.error("אי אפשר להסיר את עצמך");
      return;
    }
    if (!confirm("להסיר הרשאות ניהול למשתמש זה?")) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    if (error) return toast.error(error.message);
    toast.success("ההרשאה הוסרה");
    loadTeam();
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from("admin_invitations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("ההזמנה בוטלה");
    loadTeam();
  };

  if (loading) return <AdminLayout>טוען…</AdminLayout>;

  return (
    <AdminLayout>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-primary">חברי צוות</h1>
        <p className="text-muted-foreground mt-1">
          הוסיפו אנשים לצוות הניהול. הם יקבלו מייל הזמנה, יאשרו אותו, ויקבלו גישה מלאה לניהול האתר.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            ניהול צוות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <Label>אימייל להזמנה</Label>
              <Input
                type="email"
                dir="ltr"
                placeholder="teammate@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && invite()}
              />
            </div>
            <Button onClick={invite} disabled={inviting || !inviteEmail} size="lg">
              <UserPlus className="w-4 h-4 ml-2" />
              {inviting ? "שולח…" : "שלח הזמנה"}
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-3">מנהלים פעילים ({admins.length})</h3>
            <div className="space-y-2">
              {admins.map((a) => (
                <div
                  key={a.user_id}
                  className="flex items-center justify-between bg-muted/40 border border-border rounded-md px-4 py-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {(a.full_name || "?").slice(0, 1)}
                    </div>
                    {editingId === a.user_id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveName(a.user_id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="max-w-xs"
                          placeholder="שם מלא"
                        />
                        <Button variant="ghost" size="sm" onClick={() => saveName(a.user_id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm font-medium flex items-center">
                        {a.full_name || "ללא שם"}
                        {a.user_id === me && (
                          <Badge variant="secondary" className="mr-2">אתה</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {editingId !== a.user_id && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(a)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {a.user_id !== me && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdmin(a.user_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {admins.length === 0 && (
                <p className="text-sm text-muted-foreground">אין מנהלים רשומים</p>
              )}
            </div>
          </div>

          {invites.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">הזמנות</h3>
              <div className="space-y-2">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between bg-muted/40 border border-border rounded-md px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {inv.status === "accepted" ? (
                        <MailCheck className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="text-sm font-medium" dir="ltr">{inv.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {inv.status === "accepted" ? "התקבל" : "ממתין לאישור"} ·{" "}
                          {new Date(inv.created_at).toLocaleDateString("he-IL")}
                        </div>
                      </div>
                    </div>
                    {inv.status !== "accepted" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeInvite(inv.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTeam;
