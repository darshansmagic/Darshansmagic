const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

async function fetchApprovedTestimonials(limit = 12) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 12;
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/testimonials?select=customer_name,event_type,testimonial,rating,featured,approved_at,submitted_at&status=eq.approved&order=featured.desc.nullslast,approved_at.desc.nullslast,submitted_at.desc&limit=${safeLimit}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

async function createPendingTestimonial(body) {
  const customerName = String(body.customerName || "").trim();
  const customerEmail = String(body.customerEmail || "").trim();
  const eventType = String(body.eventType || "").trim();
  const testimonial = String(body.testimonial || "").trim();
  const ratingRaw = String(body.rating || "").trim();
  const rating = ratingRaw ? Number(ratingRaw) : null;

  if (!customerName || !testimonial) {
    return { status: 400, body: { error: "Please complete the required fields." } };
  }

  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return { status: 400, body: { error: "Rating must be between 1 and 5." } };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/testimonials`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      customer_name: customerName,
      customer_email: customerEmail || null,
      event_type: eventType || null,
      testimonial,
      rating,
      status: "pending"
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return { status: 200, body: { ok: true } };
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Missing Supabase environment variables." });
  }

  if (req.method === "GET") {
    try {
      const requestUrl = new URL(req.url, "http://localhost");
      const all = requestUrl.searchParams.get("all") === "true";
      const limit = all ? 100 : Number(requestUrl.searchParams.get("limit")) || 12;
      const testimonials = await fetchApprovedTestimonials(limit);
      return res.status(200).json({ testimonials });
    } catch (error) {
      return res.status(502).json({ error: `Supabase error: ${error.message}` });
    }
  }

  if (req.method === "POST") {
    try {
      const result = await createPendingTestimonial(readJsonBody(req));
      return res.status(result.status).json(result.body);
    } catch (error) {
      return res.status(502).json({ error: `Supabase error: ${error.message}` });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed." });
};
