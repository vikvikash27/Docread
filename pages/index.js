// pages/index.js
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [fileInput, setFileInput] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFile, setCurrentFile] = useState(null);
  const [pdfInstance, setPdfInstance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.3);
  const viewerRef = useRef();
  const pdfjsRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjsLib) => {
        import("pdfjs-dist/build/pdf.worker.min.mjs?url").then((workerSrc) => {
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default;
          pdfjsRef.current = pdfjsLib;
        });
      });
      updateList();
    }
  }, []);

  const updateList = async () => {
    const res = await fetch("/api/list");
    const data = await res.json();
    setFiles(data);
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!fileInput?.files?.length) return;

    const formData = new FormData();
    formData.append("pdf", fileInput.files[0]);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    updateList();
    e.target.reset();
    viewerRef.current.innerHTML = "";
    setCurrentFile(null);
  };

  const previewFile = async (file) => {
    const pdfjsLib = pdfjsRef.current;
    if (!pdfjsLib) return;

    const url = `/uploads/${file.name}`;
    const res = await fetch(url);
    const data = await res.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data }).promise;
    setPdfInstance(pdf);
    setNumPages(pdf.numPages);
    setCurrentPage(1);
    setCurrentFile(file);
    renderPage(pdf, 1);
  };

  const renderPage = async (pdf, pageNumber) => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;

    viewerRef.current.innerHTML = "";
    viewerRef.current.appendChild(canvas);
  };

  const nextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => {
        const newPage = prev + 1;
        renderPage(pdfInstance, newPage);
        return newPage;
      });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => {
        const newPage = prev - 1;
        renderPage(pdfInstance, newPage);
        return newPage;
      });
    }
  };

  const zoomIn = () => {
    const newScale = scale + 0.2;
    setScale(newScale);
    renderPage(pdfInstance, currentPage);
  };

  const zoomOut = () => {
    const newScale = scale - 0.2;
    setScale(newScale);
    renderPage(pdfInstance, currentPage);
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <h1>📘 RouteReader</h1>

      <form onSubmit={uploadFile}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFileInput(e.target)}
          required
        />
        <button type="submit">Upload PDF</button>
      </form>

      <input
        type="text"
        placeholder="Search books..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginTop: "10px", padding: "8px", width: "100%" }}
      />

      <hr />

      <h2>📚 My Library</h2>
      <ul>
        {filteredFiles.map((f) => (
          <li key={f.name}>
            <button onClick={() => previewFile(f)}>
              {f.name}
              <br />
              <small>{new Date(f.createdAt).toLocaleString()}</small>
            </button>
          </li>
        ))}
      </ul>

      <div>
        {currentFile && (
          <div style={{ marginTop: "20px" }}>
            <h3>{currentFile.name}</h3>
            <div>
              <button onClick={prevPage}>⬅ Prev</button>
              <span>
                Page {currentPage} / {numPages}
              </span>
              <button onClick={nextPage}>Next ➡</button>
              <button onClick={zoomOut}>➖ Zoom</button>
              <button onClick={zoomIn}>➕ Zoom</button>
            </div>
          </div>
        )}
      </div>

      <div ref={viewerRef} className="viewer" />

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: auto;
          padding: 20px;
        }
        form {
          margin-bottom: 20px;
        }
        input[type="file"] {
          margin-right: 10px;
        }
        button {
          padding: 8px 12px;
          margin-right: 10px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background: #125ea6;
        }
        ul {
          list-style: none;
          padding-left: 0;
        }
        ul li {
          margin: 10px 0;
        }
        .viewer {
          margin-top: 20px;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
          background: #fff;
        }
        canvas {
          display: block;
          margin: 10px auto;
          max-width: 100%;
        }

        @media (max-width: 600px) {
          .container {
            padding: 10px;
          }
          button {
            width: 100%;
            margin-top: 10px;
          }
        }
      `}</style>
    </div>
  );
}
