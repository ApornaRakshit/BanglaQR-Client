import { useState, useEffect } from "react";
import {
  X,
  Download,
  FileText,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Eye,
} from "lucide-react";
import Button from "../ui/Button";
import { merchantApi } from "../../services/merchantApi";

export default function DocumentPreviewModal({ doc, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [blobType, setBlobType] = useState("");

  useEffect(() => {
    let activeUrl = null;

    async function loadDocumentBlob() {
      if (!isOpen || !doc?.id) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          setObjectUrl(null);
        }

        const response = await merchantApi.getDocumentBlob(doc.id);
        const blob = response.data;
        const contentType = blob.type || doc.mimeType || "application/octet-stream";
        setBlobType(contentType);

        const url = URL.createObjectURL(blob);
        activeUrl = url;
        setObjectUrl(url);
      } catch (err) {
        console.error("Document preview error:", err);
        setError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again to view this document."
            : err.response?.status === 404
            ? "Document file not found in secure storage."
            : "Failed to load document preview. Please check your connection or try downloading the file."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocumentBlob();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [isOpen, doc?.id]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleClose() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    setError(null);
    onClose();
  }

  if (!isOpen || !doc) return null;

  const docTitle = doc.customLabel || doc.documentName || "Verification Document";
  const isPdf =
    blobType.includes("pdf") ||
    doc.mimeType?.includes("pdf") ||
    doc.originalFilename?.toLowerCase().endsWith(".pdf") ||
    doc.documentName?.toLowerCase().endsWith(".pdf");

  const isImage =
    blobType.startsWith("image/") ||
    doc.mimeType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.originalFilename || doc.documentName || "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-preview-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3
                id="document-preview-title"
                className="truncate text-base font-bold text-slate-900"
              >
                {docTitle}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  {doc.documentType || "KYC Document"}
                </span>
                {doc.fileSize && (
                  <span>
                    {(Number(doc.fileSize) / 1024).toFixed(1)} KB
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  Encrypted Vault
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {objectUrl && (
              <a
                href={objectUrl}
                download={doc.originalFilename || doc.documentName || "document"}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950 transition"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 overflow-auto bg-slate-900/5 p-4 sm:p-6 flex items-center justify-center min-h-[350px]">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
              <Loader2 size={36} className="animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Fetching secure document stream...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center max-w-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertCircle size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Preview Unavailable</h4>
              <p className="text-xs text-slate-500">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  merchantApi.getDocumentBlob(doc.id)
                    .then(res => {
                      const url = URL.createObjectURL(res.data);
                      setObjectUrl(url);
                      setBlobType(res.data.type || doc.mimeType);
                    })
                    .catch(() => setError("Failed to reload document."))
                    .finally(() => setLoading(false));
                }}
              >
                Retry Loading
              </Button>
            </div>
          )}

          {!loading && !error && objectUrl && (
            <>
              {isImage && (
                <div className="flex items-center justify-center w-full h-full">
                  <img
                    src={objectUrl}
                    alt={docTitle}
                    className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-md bg-white border border-slate-200"
                  />
                </div>
              )}

              {isPdf && (
                <iframe
                  src={objectUrl}
                  title={docTitle}
                  className="h-[65vh] w-full rounded-xl border border-slate-200 shadow-md bg-white"
                />
              )}

              {!isImage && !isPdf && (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{docTitle}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Direct in-browser preview is not supported for this file format ({blobType || "Binary"}). You can download the file to inspect it.
                    </p>
                  </div>
                  <a
                    href={objectUrl}
                    download={doc.originalFilename || doc.documentName || "document"}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Download size={16} />
                    <span>Download File</span>
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3 text-xs text-slate-500">
          <span>Status: <strong className="text-slate-800 font-semibold">{doc.status || "Uploaded"}</strong></span>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

