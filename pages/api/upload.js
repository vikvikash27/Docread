import { createRouter } from "next-connect";
import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

const handler = createRouter({
  onError(error, req, res) {
    res.status(500).json({ error: `Upload error: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' not allowed` });
  },
});

handler.use(upload.single("pdf")); // middleware for handling PDF upload

handler.post((req, res) => {
  res.status(200).json({ message: "File uploaded successfully!" });
});

export default handler.handler(); // ✅ MUST include .handler() for next-connect

export const config = {
  api: {
    bodyParser: false, // ✅ needed for multer to work
  },
};
