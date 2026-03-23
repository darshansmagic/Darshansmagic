const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Missing Cloudinary gallery environment variables." });
  }

  const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload?max_results=30`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(502).json({ error: payload.error?.message || "Cloudinary gallery request failed." });
    }

    const images = Array.isArray(payload.resources)
      ? payload.resources
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((item) => ({
            secure_url: item.secure_url,
            public_id: item.public_id
          }))
      : [];

    return res.status(200).json({
      images
    });
  } catch (error) {
    return res.status(502).json({ error: error.message || "Cloudinary gallery request failed." });
  }
};
