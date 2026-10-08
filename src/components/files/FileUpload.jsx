import { useState, useRef } from "react";
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import Button from "../ui/Button";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];

export default function FileUpload({
  onUpload,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxSizeMB = 5,
  title = "Upload Document",
  description = "PDF, JPEG, PNG or WEBP up to 5MB",
  uploading = false,
  disabled = false,
  className = "",
}) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  function validateFile(file) {
    if (!file) return false;
    setValidationError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("Invalid file type. Only PDF, JPG, PNG, and WEBP files are allowed.");
      return false;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File size exceeds ${maxSizeMB}MB limit.`);
      return false;
    }

    return true;
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }

  function handleUploadClick() {
    if (!selectedFile || !onUpload) return;
    onUpload(selectedFile, () => {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function clearSelected() {
    setSelectedFile(null);
    setValidationError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isPdf = selectedFile?.type === "application/pdf";

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !uploading && !selectedFile) fileInputRef.current?.click();
        }}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          dragOver
            ? "border-emerald-500 bg-emerald-50/50"
            : disabled
            ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
            : selectedFile
            ? "border-slate-300 bg-white"
            : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/20 cursor-pointer"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={disabled || uploading}
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-4 ring-emerald-50/50">
              <UploadCloud size={24} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800">{title}</p>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
            <div className="mt-4">
              <span className="inline-flex items-center rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  {isPdf ? <FileText size={20} /> : <ImageIcon size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelected();
                  }}
                  disabled={uploading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelected}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadClick}
                loading={uploading}
                icon={UploadCloud}
              >
                Upload Document
              </Button>
            </div>
          </div>
        )}
      </div>

      {validationError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
          <AlertCircle size={16} className="shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}

