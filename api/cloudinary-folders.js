const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const ROOT_PREFIX = "darshan-magic/";

function normalizeFolder(value = "") {
  return String(value).trim().replace(/^\/+|\/+$/g, "");
}

function extractFoldersFromResource(item) {
  const folders = new Set();
  const publicId = String(item?.public_id || "");
  const assetFolder = normalizeFolder(item?.asset_folder || "");
  const itemFolder = normalizeFolder(item?.folder || "");
  const tags = Array.isArray(item?.tags) ? item.tags.map((tag) => normalizeFolder(tag)) : [];

  if (publicId.startsWith(ROOT_PREFIX)) {
    const parts = publicId.split("/");
    if (parts.length > 1) {
      folders.add(parts.slice(0, -1).join("/"));
    }
  }

  if (assetFolder.startsWith("darshan-magic")) {
    folders.add(assetFolder);
  }

  if (itemFolder.startsWith("darshan-magic")) {
    folders.add(itemFolder);
  }

  tags.forEach((tag) => {
    if (tag.startsWith("darshan-magic")) {
      folders.add(tag);
    }
  });

  return Array.from(folders);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Missing Cloudinary folder environment variables." });
  }

  const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload?max_results=100`;

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

    const folders = Array.from(new Set(
      (payload.resources || []).flatMap((item) => extractFoldersFromResource(item))
    )).sort((a, b) => a.localeCompare(b));

    if (!folders.includes("darshan-magic/gallery")) {
      folders.unshift("darshan-magic/gallery");
    }

    return res.status(200).json({ folders });
  } catch (error) {
    return res.status(502).json({ error: error.message || "Cloudinary folder request failed." });
  }
};
