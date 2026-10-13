"use server";

import { formatBrief, parseBrief, sender } from "./brief";

/**
 * Sends a commission brief to the studio inbox through Resend's API. Returns
 * nothing when it went, or a reason the visitor can act on. A returned reason
 * survives production, where thrown messages are redacted.
 */
export async function sendBrief(input: unknown): Promise<string | undefined> {
  const brief = parseBrief(input);
  if (typeof brief === "string") return brief;
  const { subject, text } = formatBrief(brief);

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    // Local development without a key: show the brief instead of failing.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[brief] ${subject}\n${text}`);
      return;
    }
    return "The inbox isn’t connected yet.";
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender(process.env.CONTACT_FROM),
      to,
      reply_to: brief.email,
      subject,
      text,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    console.error(`[brief] Resend ${res.status}: ${await res.text()}`);
    return "The brief didn’t send.";
  }
}
