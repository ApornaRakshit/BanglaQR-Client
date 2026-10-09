import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, Check, Edit2 } from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function CmsImageUpload({
  label = "ছবি আপলোড করুন",
  value = "",
  onChange,
  hint = "PNG, JPG, WEBP (সর্বোচ্চ 5MB)",
  className = "",
  compact = false,
  fallbackImage = null,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [customUrlMode, setCustomUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await adminApi.uploadCmsMedia(formData);
      if (res.success && res.data?.url) {
        onChange(res.data.url);
      } else {
        throw new Error(res.message || "ছবি আপলোড ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "ছবি আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e) => {
    e?.stopPropagation();
    onChange("");
    setUrlInput("");
    setError(null);
  };

  const handleUrlApply = () => {
    onChange(urlInput.trim());
    setCustomUrlMode(false);
  };

  // Convert relative url to full url for preview if needed
  const getPreviewUrl = (url) => {
    if (!url) return fallbackImage || "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    const backendBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api/v1", "")
      : "http://localhost:5000";
    return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const previewSrc = getPreviewUrl(value);

  if (compact) {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex h-10 w-16 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-1 hover:border-emerald-500 hover:bg-emerald-50/40 transition shadow-2xs"
          title="ছবি পরিবর্তন করতে ক্লিক করুন"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin text-emerald-600" />
          ) : previewSrc ? (
            <img
              src={previewSrc}
              alt="Thumbnail"
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex items-center justify-center text-slate-400 group-hover:text-emerald-600">
              <Upload size={14} />
            </div>
          )}

          <span className="absolute -top-1.5 -right-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white group-hover:flex shadow-xs">
            <Edit2 size={9} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">{label}</label>
          <button
            type="button"
            onClick={() => setCustomUrlMode(!customUrlMode)}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            <LinkIcon size={12} />
            {customUrlMode ? "ফাইল আপলোড" : "সরাসরি URL"}
          </button>
        </div>
      )}

      {customUrlMode ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.png বা /uploads/cms/..."
            className="h-10 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="inline-flex h-10 items-center gap-1 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Check size={13} />
            প্রয়োগ
          </button>
        </div>
      ) : (
        <div>
          {value || fallbackImage ? (
            <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />

              <div className="flex items-center gap-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center p-1">
                  {uploading ? (
                    <Loader2 size={20} className="animate-spin text-emerald-600" />
                  ) : previewSrc ? (
                    <img
                      src={previewSrc}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon size={20} className="text-slate-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800" title={value || "Default Image"}>
                    {value ? value.split("/").pop() : "ডিফল্ট ছবি সক্রিয়"}
                  </p>
                  <p className="text-[11px] text-slate-500">ছবি সক্রিয় আছে</p>

                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      {uploading ? "আপলোড হচ্ছে..." : "ছবি পরিবর্তন"}
                    </button>
                    {value && (
                      <>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={handleRemove}
                          className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                        >
                          মুছে ফেলুন
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3.5 text-center transition hover:border-emerald-500 hover:bg-emerald-50/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <Loader2 size={20} className="animate-spin text-emerald-600" />
                  <p className="text-xs font-semibold text-slate-600">ছবি আপলোড হচ্ছে...</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-2xs text-emerald-600 border border-slate-200">
                    <Upload size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">ছবি আপলোড করতে ক্লিক করুন</p>
                    <p className="text-[10px] text-slate-500">{hint}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}
