const crypto = require("crypto");

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

async function destroyImage(publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");
  const formData = new URLSearchParams({
    public_id: publicId,
    api_key: CLOUDINARY_API_KEY,
    timestamp: String(timestamp),
    signature
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.result !== "ok") {
    throw new Error(payload.error?.message || payload.result || "Cloudinary delete failed.");
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Missing Cloudinary delete environment variables." });
  }

  const publicIds = Array.isArray(req.body?.publicIds)
    ? req.body.publicIds.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  if (!publicIds.length) {
    return res.status(400).json({ error: "No photos selected." });
  }

  try {
    for (const publicId of publicIds) {
      await destroyImage(publicId);
    }

    return res.status(200).json({ deleted: publicIds });
  } catch (error) {
    return res.status(502).json({ error: error.message || "Cloudinary delete failed." });
  }
};
