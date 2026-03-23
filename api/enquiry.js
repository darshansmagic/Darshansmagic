const RESEND_API_URL = "https://api.resend.com/emails";
const RECIPIENT_EMAIL = "darsaranya@gmail.com";
const CC_EMAIL = "emaildarshan@gmail.com";
const DEFAULT_FROM_EMAIL = "Darshan's Magic <onboarding@resend.dev>";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readJsonBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body || {};
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY." });
  }

  const body = readJsonBody(req);
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const eventType = String(body.eventType || "").trim();
  const eventDate = String(body.eventDate || "").trim();
  const location = String(body.location || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !phone || !eventType) {
    return res.status(400).json({ error: "Please complete the required fields." });
  }

  const subject = `New enquiry from ${name}`;
  const safeMessage = message ? escapeHtml(message).replace(/\n/g, "<br>") : "No message provided.";

  const resendResponse = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [RECIPIENT_EMAIL],
      cc: [CC_EMAIL],
      reply_to: email,
      subject,
      html: `
        <div style="font-family: Georgia, serif; line-height: 1.6; color: #24171e;">
          <h2 style="margin-bottom: 16px;">New enquiry received</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Event type:</strong> ${escapeHtml(eventType)}</p>
          <p><strong>Event date:</strong> ${escapeHtml(eventDate || "Not provided")}</p>
          <p><strong>Location:</strong> ${escapeHtml(location || "Not provided")}</p>
          <p><strong>Message:</strong><br>${safeMessage}</p>
        </div>
      `,
      text: [
        "New enquiry received",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Event type: ${eventType}`,
        `Event date: ${eventDate || "Not provided"}`,
        `Location: ${location || "Not provided"}`,
        `Message: ${message || "No message provided."}`
      ].join("\n")
    })
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return res.status(502).json({ error: `Resend error: ${errorText}` });
  }

  return res.status(200).json({ ok: true });
};
