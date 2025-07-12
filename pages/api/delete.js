import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ error: "Filename is required" });
  }

  const filePath = path.join(process.cwd(), "public/uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.unlinkSync(filePath);
  res.status(200).json({ message: "File deleted" });
}
