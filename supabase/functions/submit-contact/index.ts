// Edge function: submit-contact
// Server-side validation, IP-based rate limiting, and lead persistence.
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const phoneRegex = /^(\+?972|0)[\s-]?[23489567][\s-]?\d{3}[\s-]?\d{4}$/;

const BodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .refine((v) => !/<[^>]*>|https?:\/\//i.test(v)),
  phone: z.string().trim().min(9).max(20).regex(phoneRegex),
  email: z.string().trim().max(255).email().optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  source: z.string().trim().max(50).optional(),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 3; // max 3 submissions per IP per hour

const hashIp = async (ip: string, salt: string) => {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const getClientIp = (req: Request) => {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const raw = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "ולידציה נכשלה", details: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = parsed.data;

    // Honeypot — pretend success without writing
    if (data.website) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const ip = getClientIp(req);
    const ipHash = await hashIp(ip, supabaseUrl); // SUPABASE_URL as a stable per-project salt

    // Server-side rate limit by IP
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count, error: countErr } = await admin
      .from("contact_leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if (countErr) {
      console.error("rate count error", countErr);
    } else if ((count ?? 0) >= RATE_MAX) {
      return new Response(
        JSON.stringify({ error: "נשלחו יותר מדי פניות מהכתובת שלך. נסו שוב מאוחר יותר." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;

    const { error: insertErr } = await admin.from("contact_leads").insert({
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      message: data.message || null,
      source: data.source || "website",
      ip_hash: ipHash,
      user_agent: userAgent,
    });

    if (insertErr) {
      console.error("insert error", insertErr);
      return new Response(JSON.stringify({ error: "שגיאה בשמירת הפנייה" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("submit-contact unhandled", err);
    return new Response(JSON.stringify({ error: "שגיאה לא צפויה" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
