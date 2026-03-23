const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const GALLERY_PREFIX = process.env.CLOUDINARY_GALLERY_PREFIX || "darshan-magic/";
const NORMALIZED_GALLERY_PREFIX = GALLERY_PREFIX.replace(/^\/+|\/+$/g, "");

function matchesGalleryFolder(item) {
  const publicId = String(item?.public_id || "");
  const folder = String(item?.folder || "");
  const assetFolder = String(item?.asset_folder || "");
  const tags = Array.isArray(item?.tags) ? item.tags.map((tag) => String(tag || "").trim().replace(/^\/+|\/+$/g, "")) : [];

  return (
    publicId.startsWith(`${NORMALIZED_GALLERY_PREFIX}/`) ||
    publicId.startsWith(GALLERY_PREFIX) ||
    folder === NORMALIZED_GALLERY_PREFIX ||
    folder.startsWith(`${NORMALIZED_GALLERY_PREFIX}/`) ||
    assetFolder === NORMALIZED_GALLERY_PREFIX ||
    assetFolder.startsWith(`${NORMALIZED_GALLERY_PREFIX}/`) ||
    tags.includes(NORMALIZED_GALLERY_PREFIX)
  );
}
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Missing Cloudinary gallery environment variables." });
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
      return res.status(502).json({ error: payload.error?.message || "Cloudinary gallery request failed." });
    }

    const resources = Array.isArray(payload.resources)
      ? payload.resources.filter((item) => item?.secure_url)
      : [];

    const matchingResources = resources.filter(matchesGalleryFolder);
    const selectedResources = matchingResources.length ? matchingResources : resources;
    const images = selectedResources
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((item) => ({
        secure_url: item.secure_url,
        public_id: item.public_id
      }));

    return res.status(200).json({
      images
    });
  } catch (error) {
    return res.status(502).json({ error: error.message || "Cloudinary gallery request failed." });
  }
};
