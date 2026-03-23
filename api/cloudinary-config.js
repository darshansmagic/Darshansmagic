module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    return res.status(500).json({ error: "Missing Cloudinary environment variables." });
  }

  return res.status(200).json({
    cloudName,
    apiKey
  });
};
