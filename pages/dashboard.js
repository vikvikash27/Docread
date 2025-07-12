import { useState, useEffect, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [zoom, setZoom] = useState(1.5);
  const viewerRef = useRef();

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
      setPageNum(1); // reset to page 1
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

  return (
    <div className="container">
      <h1>📘 RouteReader Dashboard</h1>

      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {filteredFiles.map((f) => (
          <li key={f.name}>
            <button onClick={() => setSelectedFile(f.name)}>
              {f.name} <br />
              <small>{new Date(f.createdAt).toLocaleString()}</small>
            </button>
          </li>
        ))}
      </ul>

      {pdf && (
        <div className="controls">
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
      )}

      <div ref={viewerRef} className="viewer" />

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 800px;
          margin: auto;
        }
        ul {
          list-style: none;
          padding-left: 0;
        }
        li {
          margin-bottom: 10px;
        }
        button {
          margin: 5px;
          padding: 8px 12px;
          cursor: pointer;
        }
        .controls {
          margin-top: 10px;
        }
        .viewer {
          margin-top: 20px;
          border: 1px solid #ddd;
          padding: 10px;
          max-height: 80vh;
          overflow-y: auto;
          background: #fff;
        }
        canvas {
          display: block;
          margin: auto;
        }
      `}</style>
    </div>
  );
}
