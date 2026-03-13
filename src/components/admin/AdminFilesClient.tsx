"use client";

import { useMemo, useState } from "react";
import { DownloadCloud, FileText, Trash2 } from "lucide-react";

type AdminFileRow = {
  id: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
  orderId: string;
  studentName: string | null;
};

export function AdminFilesClient({ initialFiles }: { initialFiles: AdminFileRow[] }) {
  const [files, setFiles] = useState<AdminFileRow[]>(initialFiles);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const totalSize = useMemo(() => files.reduce((acc, f) => acc + (f.fileSize || 0), 0), [files]);
  const sizeInMB = useMemo(() => (totalSize / (1024 * 1024)).toFixed(2), [totalSize]);
  const avgKB = useMemo(() => (totalSize / (files.length || 1) / 1024).toFixed(0), [files.length, totalSize]);

  const deleteFile = async (fileId: string) => {
    setError("");
    setDeletingId(fileId);
    try {
      const res = await fetch("/api/admin/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.error || "Failed to delete file");
        return;
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="reveal-up active">
      <header style={{ marginBottom: "2rem" }}>
        <h2 className="fraunces text-ink" style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>Storage & Assets</h2>
        <p className="lora italic opacity-60">Manage uploaded order files and reclaim storage.</p>
      </header>

      {error ? <div className="paper-sheet" style={{ color: "var(--wax-red)", marginBottom: "12px", fontSize: "12px" }}>{error}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <section className="paper-sheet" style={{ padding: "1rem" }}><div className="label">Total Storage</div><div className="fraunces text-ink" style={{ fontSize: "1.3rem", fontWeight: 800 }}>{sizeInMB} MB</div></section>
        <section className="paper-sheet" style={{ padding: "1rem" }}><div className="label">Total Files</div><div className="fraunces text-ink" style={{ fontSize: "1.3rem", fontWeight: 800 }}>{files.length}</div></section>
        <section className="paper-sheet" style={{ padding: "1rem" }}><div className="label">Avg File Size</div><div className="fraunces text-ink" style={{ fontSize: "1.3rem", fontWeight: 800 }}>{avgKB} KB</div></section>
      </div>

      <section className="paper-sheet" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(62,32,40,0.1)", textAlign: "left" }}>
                <th style={{ padding: "14px 12px" }} className="label">File Name</th>
                <th style={{ padding: "14px 12px" }} className="label">Owner & Order</th>
                <th style={{ padding: "14px 12px" }} className="label">Size</th>
                <th style={{ padding: "14px 12px" }} className="label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", opacity: 0.5 }}>No files found.</td></tr>
              ) : files.map((file) => (
                <tr key={file.id} style={{ borderBottom: "1px solid rgba(62,32,40,0.05)" }}>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={14} className="text-ink" opacity={0.4} />
                      <span style={{ fontWeight: 700 }} className="text-ink">{file.fileName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ fontSize: "10px" }}>{file.studentName || "Student"}</div>
                    <div style={{ fontSize: "9px", opacity: 0.6 }}>Order #{file.orderId.slice(0, 8)}</div>
                  </td>
                  <td style={{ padding: "14px 12px" }}>{(file.fileSize / 1024).toFixed(1)} KB</td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ padding: "6px", borderRadius: "4px", background: "var(--ink-primary)", color: "white" }} title="View/Download">
                        <DownloadCloud size={14} />
                      </a>
                      <button
                        style={{ padding: "6px", border: "1px solid rgba(62,32,40,0.1)", borderRadius: "4px", background: "white" }}
                        onClick={() => deleteFile(file.id)}
                        disabled={deletingId === file.id}
                        title="Delete file"
                      >
                        <Trash2 size={14} color="var(--wax-red)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
