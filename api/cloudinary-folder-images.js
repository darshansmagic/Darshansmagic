const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

function normalizeFolder(value = "") {
  return String(value).trim().replace(/^\/+|\/+$/g, "");
}

function matchesFolder(item, folder) {
  const normalizedFolder = normalizeFolder(folder);
  const publicId = String(item?.public_id || "");
  const assetFolder = normalizeFolder(item?.asset_folder || "");
  const itemFolder = normalizeFolder(item?.folder || "");
  const tags = Array.isArray(item?.tags) ? item.tags.map((tag) => normalizeFolder(tag)) : [];

  return (
    publicId.startsWith(`${normalizedFolder}/`) ||
    assetFolder === normalizedFolder ||
    assetFolder.startsWith(`${normalizedFolder}/`) ||
    itemFolder === normalizedFolder ||
    itemFolder.startsWith(`${normalizedFolder}/`) ||
    tags.includes(normalizedFolder)
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Missing Cloudinary folder environment variables." });
  }

  const folder = normalizeFolder(req.query?.folder || "");
  if (!folder) {
    return res.status(400).json({ error: "Missing folder parameter." });
  }

  const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");
  const query = new URLSearchParams({
    max_results: "100"
  });
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload?${query.toString()}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(502).json({ error: payload.error?.message || "Cloudinary folder request failed." });
    }

    const resources = Array.isArray(payload.resources) ? payload.resources : [];
    const matchingResources = resources.filter((item) => item?.secure_url && matchesFolder(item, folder));
    const images = matchingResources
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((item) => ({
        secure_url: item.secure_url,
        public_id: item.public_id
      }));

    return res.status(200).json({ folder, images });
  } catch (error) {
    return res.status(502).json({ error: error.message || "Cloudinary folder request failed." });
  }
};
