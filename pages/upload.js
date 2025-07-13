// pages/upload.js
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [tag, setTag] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file");

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("tag", tag);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Upload successful");
      setFile(null);
      setTag("");
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">📤 Upload a PDF</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Enter tag or category"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="block w-full border border-gray-300 rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
