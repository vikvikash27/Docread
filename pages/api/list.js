import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const uploadsDir = path.join(process.cwd(), "public/uploads");

  if (!fs.existsSync(uploadsDir)) {
    return res.status(200).json([]);
  }

  const files = fs
    .readdirSync(uploadsDir)
    .filter((file) => file.endsWith(".pdf"))
    .map((file) => ({
      name: file,
      createdAt: fs.statSync(path.join(uploadsDir, file)).birthtime,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)); // alphabetical

  res.status(200).json(files);
}
