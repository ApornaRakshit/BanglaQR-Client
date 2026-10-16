import { useState, useEffect } from "react";
import { FileText, X, Download, AlertTriangle, Loader2 } from "lucide-react";

export default function SecureDocumentViewerModal({ doc, viewUrl, blobFetcher, onClose, onFlagCorrection }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const docName = doc?.document_name || doc?.documentName || doc?.custom_label || doc?.document_type || doc?.documentType || "Document";
  const docType = doc?.document_type || doc?.documentType || "File";
  const mimeType = doc?.mime_type || doc?.mimeType || "";
  const originalFilename = doc?.original_filename || doc?.originalFilename || docName;

  useEffect(() => {
    let active = true;

    if (blobFetcher) {
      setLoading(true);
      setError("");
      blobFetcher()
        .then((res) => {
          if (!active) return;
          const mime = res.headers?.["content-type"] || mimeType || "application/octet-stream";
          const blob = new Blob([res.data], { type: mime });
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        })
        .catch((err) => {
          if (!active) return;
          console.error("Secure document view error:", err);
          setError(err?.response?.data?.message || "Could not retrieve document from secure storage.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [doc]);

  const activeSrc = blobUrl || viewUrl;
  const isPdf = mimeType.toLowerCase().includes("pdf") || String(activeSrc).toLowerCase().includes(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText size={18} className="text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate text-white">{docName}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {docType} • {originalFilename}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <a
                href={blobUrl}
                download={originalFilename || "document.bin"}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Download file"
              >
                <Download size={15} />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 p-4 bg-slate-900/60 overflow-auto flex items-center justify-center">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <Loader2 size={32} className="animate-spin mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-semibold">Decrypting & fetching document securely...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center max-w-sm">
              <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
              <p className="text-xs font-bold text-red-400">{error}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                The requested file could not be rendered from authenticated storage.
              </p>
            </div>
          ) : activeSrc ? (
            isPdf ? (
              <iframe
                src={activeSrc}
                title={docName}
                className="w-full h-full rounded-xl border border-slate-800 bg-white"
              />
            ) : (
              <img
                src={activeSrc}
                alt={docName}
                className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
              />
            )
          ) : (
            <p className="text-xs text-slate-500">No preview source available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-400 flex items-center justify-between">
          <span className="truncate">
            Status: <span className="font-bold text-white uppercase">{doc?.status || "Uploaded"}</span>
          </span>
          <div className="flex items-center gap-2">
            {onFlagCorrection && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFlagCorrection(doc);
                }}
                className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold hover:bg-amber-500/20 transition cursor-pointer"
              >
                Flag for Correction
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

