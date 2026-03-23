const crypto = require("crypto");

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

function normalizeFolder(value = "") {
  return String(value).trim().replace(/^\/+|\/+$/g, "");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Missing Cloudinary signing environment variables." });
  }

  const folderName = normalizeFolder(req.body?.folderName || "");
  if (!folderName) {
    return res.status(400).json({ error: "Missing folder name." });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const assetFolder = folderName;
  const publicIdPrefix = folderName;
  const tags = folderName.toLowerCase().replace(/[^\w/-]+/g, "-");

  const paramsToSign = {
    asset_folder: assetFolder,
    public_id_prefix: publicIdPrefix,
    tags,
    timestamp
  };

  const signaturePayload = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(`${signaturePayload}${CLOUDINARY_API_SECRET}`)
    .digest("hex");

  return res.status(200).json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    signature,
    assetFolder,
    publicIdPrefix,
    tags
  });
};
