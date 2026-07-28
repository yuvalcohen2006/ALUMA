// Supabase "Send Email Hook" — renders Aluma's branded auth emails and sends
// them through Resend.
//
// Supabase calls this function whenever it would otherwise send one of its
// built-in auth emails (signup confirmation, password reset, magic link, …).
// The request is signed with the Standard Webhooks scheme; the shared secret is
// generated in the dashboard under Authentication → Hooks and stored here as
// SEND_EMAIL_HOOK_SECRET.
//
// Emails are sent immediately rather than queued: auth emails are time-critical
// (nobody wants a password reset arriving two minutes late) and Resend handles
// its own delivery retries. `email_send_log` still records every attempt.

import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { Webhook } from 'npm:standardwebhooks@1.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'
import { sendEmail } from '../_shared/resend.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature',
}

const SITE_NAME = 'Aluma'
const ROOT_DOMAIN = 'alumaoutdoor.com'
// Where studio notifications land. Overridable so testing can point them at a
// developer's inbox while the real sending domain is still unverified.
const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL') ?? 'outdooraluma@gmail.com'

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'ברוכים הבאים למועדון Aluma — אימות כתובת המייל',
  invite: 'הוזמנת להצטרף למועדון Aluma',
  magiclink: 'קישור הכניסה שלך ל־Aluma',
  recovery: 'איפוס סיסמה — Aluma',
  email_change: 'אישור שינוי כתובת מייל — Aluma',
  reauthentication: 'קוד האימות שלך — Aluma',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

/** Shape Supabase posts to a Send Email Hook. */
interface AuthHookPayload {
  user: { id: string; email: string; new_email?: string }
  email_data: {
    token: string
    token_hash: string
    token_new?: string
    token_hash_new?: string
    redirect_to: string
    email_action_type: string
    site_url: string
  }
}

/**
 * Supabase hands us the raw token rather than a finished link, so the
 * verification URL has to be assembled here. Hitting /auth/v1/verify is what
 * consumes the token and then bounces the user on to `redirect_to`.
 */
function buildConfirmationUrl(
  supabaseUrl: string,
  tokenHash: string,
  actionType: string,
  redirectTo: string
): string {
  const params = new URLSearchParams({
    token: tokenHash,
    type: actionType,
    redirect_to: redirectTo,
  })
  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!hookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment configuration', {
      hasHookSecret: !!hookSecret,
      hasUrl: !!supabaseUrl,
      hasServiceRole: !!serviceRoleKey,
    })
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  // Verify the request really came from Supabase Auth before trusting a word of
  // it — this endpoint is public, and it sends mail to whatever address it's
  // handed. The dashboard stores the secret as "v1,whsec_<base64>"; the library
  // wants just the base64 part.
  let payload: AuthHookPayload
  const rawBody = await req.text()
  try {
    const webhook = new Webhook(hookSecret.replace('v1,whsec_', ''))
    payload = webhook.verify(rawBody, Object.fromEntries(req.headers)) as AuthHookPayload
  } catch (error) {
    console.error('Webhook signature verification failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return jsonResponse({ error: 'Invalid signature' }, 401)
  }

  const actionType = payload.email_data?.email_action_type
  const recipient = payload.user?.email

  if (!actionType || !recipient) {
    console.error('Malformed hook payload', { actionType, hasUser: !!payload.user })
    return jsonResponse({ error: 'Invalid payload' }, 400)
  }

  const EmailTemplate = EMAIL_TEMPLATES[actionType]
  if (!EmailTemplate) {
    console.error('Unknown email action type', { actionType })
    return jsonResponse({ error: `Unknown email type: ${actionType}` }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const messageId = crypto.randomUUID()

  try {
    // An email change confirms against the NEW address, so it carries its own
    // token; everything else uses the primary one.
    const isEmailChange = actionType === 'email_change'
    const tokenHash =
      isEmailChange && payload.email_data.token_hash_new
        ? payload.email_data.token_hash_new
        : payload.email_data.token_hash

    const templateProps = {
      siteName: SITE_NAME,
      siteUrl: `https://${ROOT_DOMAIN}`,
      recipient,
      confirmationUrl: buildConfirmationUrl(
        supabaseUrl,
        tokenHash,
        actionType,
        payload.email_data.redirect_to || `https://${ROOT_DOMAIN}`
      ),
      // reauthentication shows the 6-digit code itself rather than a link
      token: payload.email_data.token,
      email: recipient,
      oldEmail: recipient,
      newEmail: payload.user.new_email,
    }

    const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
    const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
      plainText: true,
    })

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: actionType,
      recipient_email: recipient,
      status: 'pending',
    })

    await sendEmail({
      to: recipient,
      subject: EMAIL_SUBJECTS[actionType] || `${SITE_NAME} — עדכון`,
      html,
      text,
      replyTo: OWNER_EMAIL,
    })

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: actionType,
      recipient_email: recipient,
      status: 'sent',
    })

    console.log('Auth email sent', { actionType, recipient })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Failed to send auth email', { actionType, recipient, error: message })

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: actionType,
      recipient_email: recipient,
      status: 'failed',
      error_message: message,
    })

    // Returning non-2xx makes Supabase surface the failure to the user rather
    // than silently reporting success on an email that never left.
    return jsonResponse({ error: 'Failed to send email' }, 500)
  }

  // Let the studio know someone joined. Deliberately after the main send and
  // fully swallowed — a failure here must never break a customer's signup.
  if (actionType === 'signup') {
    try {
      const ownerMessageId = crypto.randomUUID()
      const ownerHtml = `
        <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;color:#2F2F2F;max-width:520px;margin:0 auto;padding:24px;background:#F8F6F2;border-radius:14px">
          <h2 style="margin:0 0 12px;color:#2F2F2F">הרשמה חדשה למועדון Aluma</h2>
          <p style="margin:0 0 8px">משתמש חדש נרשם זה עתה:</p>
          <p style="margin:0 0 4px"><strong>מייל:</strong> ${recipient}</p>
          <p style="margin:16px 0 0;font-size:14px;color:#5A5A5A">ניתן לצפות בפרטים המלאים בלוח האדמין באתר.</p>
        </div>`

      await sendEmail({
        to: OWNER_EMAIL,
        subject: `הרשמה חדשה למועדון Aluma — ${recipient}`,
        html: ownerHtml,
        text: `הרשמה חדשה למועדון Aluma\n\nמייל: ${recipient}`,
        replyTo: OWNER_EMAIL,
      })

      await supabase.from('email_send_log').insert({
        message_id: ownerMessageId,
        template_name: 'owner-new-signup',
        recipient_email: OWNER_EMAIL,
        status: 'sent',
      })
    } catch (notifyError) {
      console.error('Owner signup notification failed (ignored)', notifyError)
    }
  }

  return jsonResponse({ success: true }, 200)
})
