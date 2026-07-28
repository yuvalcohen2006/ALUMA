// Thin wrapper over the Resend REST API.
//
// Deliberately a plain fetch rather than the Resend SDK — this is the only call
// we make, and one fewer npm dependency inside an edge function means faster
// cold starts and nothing to keep up to date.

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

/**
 * Mail goes out from a subdomain, not the root domain. That keeps the sending
 * reputation isolated from alumaoutdoor.com (which serves the website and may
 * later carry Google Workspace mailboxes), and keeps the email DNS records off
 * the root zone entirely.
 */
const FROM_ADDRESS = Deno.env.get('RESEND_FROM') ?? 'Aluma <noreply@notify.alumaoutdoor.com>'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

/**
 * Sends one email. Throws on any non-2xx so callers can log a failure and
 * decide whether it should surface to the user.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.text ? { text: options.text } : {}),
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    }),
  })

  if (!response.ok) {
    // Resend returns a JSON body describing the problem; fall back to the raw
    // text if it isn't JSON so the log never swallows the reason.
    const detail = await response.text()
    throw new Error(`Resend responded ${response.status}: ${detail}`)
  }

  return (await response.json()) as { id: string }
}
