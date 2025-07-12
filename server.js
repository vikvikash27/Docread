const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Set up multer storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Serve static files
app.use("/uploads", express.static("uploads"));
app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Route to main page
app.get("/", (req, res) => {
  const files = fs.readdirSync("./uploads").filter((f) => f.endsWith(".pdf"));
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// API to get uploaded files list
app.get("/list", (req, res) => {
  const files = fs.readdirSync("./uploads").filter((f) => f.endsWith(".pdf"));
  res.json(files);
});

// Upload route
app.post("/upload", upload.single("pdf"), (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () =>
  console.log(`✅ RouteReader running on http://localhost:${PORT}`)
);
