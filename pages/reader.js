import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Reader() {
  const router = useRouter();
  const viewerRef = useRef();
  const [user, setUser] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("docreadUser"));
    if (!userData) {
      router.push("/login");
    } else {
      setUser(userData);
      fetchFiles();
    }
  }, []);

  const fetchFiles = async () => {
    const res = await fetch("/api/list");
    const data = await res.json();
    setFiles(data);
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!fileInput?.files?.length) return alert("No file selected");

    const formData = new FormData();
    formData.append("pdf", fileInput.files[0]);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    fetchFiles();
    e.target.reset();
    viewerRef.current.innerHTML = "";
  };

  const deleteFile = async (fileName) => {
    if (!confirm("Are you sure to delete this file?")) return;
    await fetch(`/api/delete?file=${fileName}`, { method: "DELETE" });
    fetchFiles();
    viewerRef.current.innerHTML = "";
  };

  const previewFile = async (file) => {
    const { getDocument } = await import("pdfjs-dist/build/pdf");
    const url = `/uploads/${file.name}`;
    const res = await fetch(url);
    const data = await res.arrayBuffer();

    viewerRef.current.innerHTML = "";
    const pdf = await getDocument({ data }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 1.3;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;

      viewerRef.current.appendChild(canvas);
    }
  };

  const logout = () => {
    localStorage.removeItem("docreadUser");
    router.push("/login");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📘 Welcome, {user?.name}</h2>
        <button
          onClick={logout}
          style={{ background: "#c62828", color: "#fff" }}
        >
          Logout
        </button>
      </div>
      <p>📱 Phone: {user?.phone}</p>

      <form onSubmit={uploadFile} style={{ marginTop: "20px" }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFileInput(e.target)}
          required
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          Upload PDF
        </button>
      </form>

      <h3 style={{ marginTop: "30px" }}>📚 Your Library</h3>
      <ul>
        {files.map((f) => (
          <li key={f.name} style={{ marginBottom: "10px" }}>
            <span>
              <b>{f.name}</b>{" "}
              <small>({new Date(f.createdAt).toLocaleString()})</small>
            </span>
            <div style={{ marginTop: "5px" }}>
              <button
                onClick={() => previewFile(f)}
                style={{ marginRight: "10px" }}
              >
                View
              </button>
              <button
                onClick={() => deleteFile(f.name)}
                style={{ color: "red" }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div ref={viewerRef} style={{ marginTop: "20px" }} />
    </div>
  );
}
