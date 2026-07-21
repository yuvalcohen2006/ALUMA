import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    // Verify caller
    const anonClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: jsonHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const rawEmail: string = (body?.email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail) || rawEmail.length > 255) {
      return new Response(JSON.stringify({ error: "invalid_email" }), { status: 400, headers: jsonHeaders });
    }

    const origin = req.headers.get("origin") || new URL(req.url).origin;

    // Check if a user already exists with this email
    let existingUserId: string | null = null;
    // list users and search (small projects); fallback approach
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = list?.users?.find((u) => (u.email || "").toLowerCase() === rawEmail);
    if (found) existingUserId = found.id;

    // Record invitation
    await admin
      .from("admin_invitations")
      .upsert(
        {
          email: rawEmail,
          invited_by: userData.user.id,
          status: existingUserId ? "accepted" : "pending",
          accepted_at: existingUserId ? new Date().toISOString() : null,
        },
        { onConflict: "email" }
      );

    if (existingUserId) {
      // Promote existing user to admin immediately
      await admin.from("user_roles").insert({ user_id: existingUserId, role: "admin" }).select();
      return new Response(
        JSON.stringify({ ok: true, mode: "promoted" }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // Send Supabase invite email (goes through our auth-email-hook -> invite template)
    const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(rawEmail, {
      redirectTo: `${origin}/auth`,
    });
    if (inviteErr) {
      return new Response(JSON.stringify({ error: inviteErr.message }), { status: 400, headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ ok: true, mode: "invited" }), { status: 200, headers: jsonHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: jsonHeaders });
  }
});
