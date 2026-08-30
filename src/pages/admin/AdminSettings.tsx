import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, MailCheck, Clock, Shield } from "lucide-react";

type Contact = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  hours?: string;
};

type AdminMember = {
  user_id: string;
  full_name: string | null;
  email: string | null;
};

type Invitation = {
  id: string;
  email: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
};

const AdminSettings = () => {
  const [contact, setContact] = useState<Contact>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "contact")
        .maybeSingle();
      setContact((data?.value as Contact) || {});
      setLoading(false);
    })();
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
    loadTeam();
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
          email: null,
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

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "contact", value: contact as any });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("נשמר");
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

  const fields: {
    key: keyof Contact;
    label: string;
    hint?: string;
    placeholder?: string;
    dir?: "ltr" | "rtl";
  }[] = [
    { key: "phone", label: "טלפון", hint: "כמו שהייתם כותבים אותו — עם מקפים או בלי", dir: "ltr" },
    { key: "whatsapp", label: "WhatsApp", hint: "רק אם הוא שונה מהטלפון. אם ריק, נשתמש במספר הטלפון", dir: "ltr" },
    { key: "email", label: "אימייל", dir: "ltr" },
    { key: "address", label: "כתובת", hint: "רחוב, עיר", placeholder: "התמר 78, יציץ" },
    { key: "instagram", label: "Instagram URL", dir: "ltr" },
    { key: "facebook", label: "Facebook URL", dir: "ltr" },
    // The weekly table itself is in the code; this line is the exception to it.
    {
      key: "hours",
      label: "הערה על שעות הפעילות",
      hint: "מופיע מעל שעות הפתיחה באתר. לדוגמה: סגור בין 10 ל-15 באוגוסט. השאירו ריק אם אין מה להודיע.",
    },
  ];

  return (
    <AdminLayout>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-primary">הגדרות אתר</h1>
        <p className="text-muted-foreground mt-1">
          פרטי יצירת קשר ורשתות חברתיות. מה שתשנו כאן מתעדכן בכל מקום באתר —
          בתחתית העמוד, בעמוד יצירת הקשר ובכפתור הוואטסאפ.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>פרטי קשר</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.hint && <p className="text-xs text-muted-foreground mt-1">{f.hint}</p>}
              <Input
                dir={f.dir}
                placeholder={f.placeholder}
                value={contact[f.key] || ""}
                onChange={(e) => setContact({ ...contact, [f.key]: e.target.value })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? "שומר…" : "שמירה"}
        </Button>
      </div>

      {/* Team management */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            ניהול צוות – מנהלי האתר
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            הוסיפו אנשים לצוות הניהול. הם יקבלו מייל הזמנה, יאשרו אותו, ויקבלו גישה מלאה לניהול האתר בדיוק כמו שלכם.
          </p>
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

          {/* Active admins */}
          <div>
            <h3 className="font-medium mb-3">מנהלים פעילים ({admins.length})</h3>
            <div className="space-y-2">
              {admins.map((a) => (
                <div
                  key={a.user_id}
                  className="flex items-center justify-between bg-muted/40 border border-border rounded-md px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {(a.full_name || "?").slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {a.full_name || "ללא שם"}
                        {a.user_id === me && (
                          <Badge variant="secondary" className="mr-2">אתה</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {a.user_id.slice(0, 8)}…
                      </div>
                    </div>
                  </div>
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
              ))}
              {admins.length === 0 && (
                <p className="text-sm text-muted-foreground">אין מנהלים רשומים</p>
              )}
            </div>
          </div>

          {/* Invitations */}
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

export default AdminSettings;
