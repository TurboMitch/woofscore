// WoofScore outreach sender — Vercel serverless function.
// Sends ONE personalized email via Resend. Protected by a shared secret.
// Required Vercel env vars: RESEND_API_KEY, OUTREACH_SECRET
// Optional: OUTREACH_FROM (e.g. "Mitchell at WoofScore <mitchell@woofscore.com>")

module.exports = async function handler(req, res) {
  // CORS / method
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }
  const KEY = process.env.RESEND_API_KEY;
  const SECRET = process.env.OUTREACH_SECRET;
  if (!SECRET) { res.status(500).json({ ok: false, error: "OUTREACH_SECRET not configured in Vercel" }); return; }
  if (!KEY)    { res.status(500).json({ ok: false, error: "RESEND_API_KEY not configured in Vercel" }); return; }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  if (body.secret !== SECRET) { res.status(401).json({ ok: false, error: "Invalid passphrase" }); return; }

  const to = (body.to || "").trim();
  const subject = (body.subject || "").trim();
  const html = body.html || "";
  const text = body.text || "";
  const fromName = (body.fromName || "WoofScore").trim();
  const fromEmail = (body.fromEmail || "").trim();
  const replyTo = (body.replyTo || fromEmail).trim();

  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) { res.status(400).json({ ok: false, error: "Invalid 'to' address" }); return; }
  if (!subject) { res.status(400).json({ ok: false, error: "Missing subject" }); return; }
  if (!fromEmail) { res.status(400).json({ ok: false, error: "Missing from address" }); return; }

  const from = process.env.OUTREACH_FROM || `${fromName} <${fromEmail}>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text, reply_to: replyTo || undefined }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      res.status(502).json({ ok: false, error: (data && (data.message || data.name)) || ("Resend error " + r.status), detail: data });
      return;
    }
    res.status(200).json({ ok: true, id: data.id || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Send failed: " + (e && e.message || String(e)) });
  }
}
