// pages/dashboard.js

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { auth } from "../lib/firebase";

GlobalWorkerOptions.workerSrc = workerSrc;

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [zoom, setZoom] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef();
  const router = useRouter();

  // ✅ Check if user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch("/api/list")
      .then((res) => res.json())
      .then(setFiles);
  }, []);

  useEffect(() => {
    if (!selectedFile) return;

    const loadPdf = async () => {
      const res = await fetch(`/uploads/${selectedFile}`);
      const data = await res.arrayBuffer();
      const loadedPdf = await getDocument({ data }).promise;
      setPdf(loadedPdf);
      setPageNum(1);
    };

    loadPdf();
  }, [selectedFile]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf) return;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;

      viewerRef.current.innerHTML = "";
      viewerRef.current.appendChild(canvas);
    };

    renderPage();
  }, [pdf, pageNum, zoom]);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const logout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  if (loading) return <p className="text-center mt-20">Checking login...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded mb-6 shadow">
        <div className="space-x-4">
          <button onClick={() => router.push("/dashboard")}>🏠 Home</button>
          <button onClick={() => router.push("/profile")}>👤 Profile</button>
          <button onClick={() => router.push("/dashboard")}>
            📁 Your Uploads
          </button>
          <button onClick={() => router.push("/new-upload")}>
            ➕ New Upload
          </button>
        </div>
        <button onClick={logout} className="text-red-500 font-semibold">
          Logout
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {/* PDF File List */}
      <ul className="space-y-2">
        {filteredFiles.map((f) => (
          <li key={f.name}>
            <button
              onClick={() => setSelectedFile(f.name)}
              className="w-full text-left p-2 border rounded hover:bg-gray-100"
            >
              {f.name} <br />
              <small className="text-gray-500">
                {new Date(f.createdAt).toLocaleString()}
              </small>
            </button>
          </li>
        ))}
      </ul>

      {/* PDF Viewer Controls */}
      {pdf && (
        <div className="mt-6">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => setPageNum((p) => Math.max(p - 1, 1))}>
              ⬅ Prev
            </button>
            <span>
              Page {pageNum} of {pdf.numPages}
            </span>
            <button
              onClick={() => setPageNum((p) => (p < pdf.numPages ? p + 1 : p))}
            >
              Next ➡
            </button>

            <button onClick={() => setZoom((z) => z - 0.2)}>➖ Zoom Out</button>
            <button onClick={() => setZoom((z) => z + 0.2)}>➕ Zoom In</button>
          </div>

          <div
            ref={viewerRef}
            className="border p-2 bg-white max-h-[75vh] overflow-auto"
          />
        </div>
      )}
    </div>
  );
}
