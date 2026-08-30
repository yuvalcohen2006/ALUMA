import { useEffect, useState } from "react";
import AdminLayout, { markLeadsSeen } from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const toCsv = (rows: any[]) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
};

const download = (content: string, filename: string) => {
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const AdminLeads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([
        supabase.from("contact_leads").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("questionnaire_responses").select("*").order("created_at", { ascending: false }).limit(500),
      ]);
      if (a.error) toast.error(a.error.message);
      if (b.error) toast.error(b.error.message);
      setLeads(a.data || []);
      setQuiz(b.data || []);
      markLeadsSeen();
    })();
  }, []);

  return (
    <AdminLayout>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-foreground">פניות מהאתר</h1>
        <p className="text-muted-foreground mt-1">פניות מטופס יצירת קשר ומשאלון התאמה</p>
      </header>

      <Tabs defaultValue="contact" dir="rtl">
        <TabsList>
          <TabsTrigger value="contact">צור קשר ({leads.length})</TabsTrigger>
          <TabsTrigger value="quiz">שאלון ({quiz.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="contact">
          <Card>
            <CardContent className="p-0">
              <div className="flex justify-end p-3 border-b border-border">
                <Button size="sm" variant="outline" onClick={() => download(toCsv(leads), "contact-leads.csv")}>
                  <Download className="w-4 h-4 ml-2" /> ייצוא CSV
                </Button>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-right p-3">תאריך</th>
                      <th className="text-right p-3">שם</th>
                      <th className="text-right p-3">טלפון</th>
                      <th className="text-right p-3">אימייל</th>
                      <th className="text-right p-3">הודעה</th>
                      <th className="text-right p-3">מקור</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-t border-border">
                        <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(l.created_at).toLocaleString("he-IL")}
                        </td>
                        <td className="p-3">{l.name}</td>
                        <td className="p-3">{l.phone}</td>
                        <td className="p-3">{l.email || "—"}</td>
                        <td className="p-3 max-w-md truncate">{l.message || "—"}</td>
                        <td className="p-3 text-xs text-muted-foreground">{l.source || "—"}</td>
                      </tr>
                    ))}
                    {!leads.length && (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-muted-foreground">אין לידים</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quiz">
          <Card>
            <CardContent className="p-0">
              <div className="flex justify-end p-3 border-b border-border">
                <Button size="sm" variant="outline" onClick={() => download(toCsv(quiz), "questionnaire.csv")}>
                  <Download className="w-4 h-4 ml-2" /> ייצוא CSV
                </Button>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-right p-3">תאריך</th>
                      <th className="text-right p-3">שם</th>
                      <th className="text-right p-3">טלפון</th>
                      <th className="text-right p-3">סוג מרחב</th>
                      <th className="text-right p-3">תקציב</th>
                      <th className="text-right p-3">סגנון</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quiz.map((l) => (
                      <tr key={l.id} className="border-t border-border">
                        <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(l.created_at).toLocaleString("he-IL")}
                        </td>
                        <td className="p-3">{l.contact_name}</td>
                        <td className="p-3">{l.contact_phone}</td>
                        <td className="p-3">{l.space_type || "—"}</td>
                        <td className="p-3">{l.budget || "—"}</td>
                        <td className="p-3">{l.style || "—"}</td>
                      </tr>
                    ))}
                    {!quiz.length && (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-muted-foreground">אין רשומות</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminLeads;
