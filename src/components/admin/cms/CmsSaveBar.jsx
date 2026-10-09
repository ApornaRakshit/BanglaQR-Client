import { useState } from "react";
import {
  Save,
  Send,
  RotateCcw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function CmsSaveBar({
  isDirty = false,
  isPublished = true,
  lastSavedAt = null,
  lastPublishedAt = null,
  lastSavedBy = null,
  lastPublishedBy = null,
  savingDraft = false,
  publishing = false,
  previewViewport = "desktop",
  onViewportChange,
  onSaveDraft,
  onPublish,
  onDiscard,
}) {
  const [showPublishModal, setShowPublishModal] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "কখনও নয়";
    const date = new Date(dateStr);
    return date.toLocaleString("bn-BD", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const handleConfirmPublish = () => {
    setShowPublishModal(false);
    onPublish();
  };

  return (
    <>
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-md shadow-xs">
        {/* Left: Status & Meta */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                অসংরক্ষিত ড্রাফট পরিবর্তন
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-600" />
                ড্রাফট সংরক্ষিত
              </span>
            )}

            {isPublished && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                পাবলিশড: {formatDate(lastPublishedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Center: Live Preview Viewport Switcher */}
        <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => onViewportChange("desktop")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              previewViewport === "desktop"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="ডেস্কটপ ভিউ (১০০%)"
          >
            <Monitor size={14} />
            <span>ডেস্কটপ</span>
          </button>
          <button
            type="button"
            onClick={() => onViewportChange("tablet")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              previewViewport === "tablet"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="ট্যাবলেট ভিউ (৭৬৮px)"
          >
            <Tablet size={14} />
            <span>ট্যাবলেট</span>
          </button>
          <button
            type="button"
            onClick={() => onViewportChange("mobile")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              previewViewport === "mobile"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="মোবাইল ভিউ (৩৭৫px)"
          >
            <Smartphone size={14} />
            <span>মোবাইল</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* View Live Public Site */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ExternalLink size={13} />
            <span>লাইভ ওয়েবসাইট</span>
          </a>

          {/* Discard / Revert */}
          {isDirty && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={savingDraft || publishing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-red-600 transition disabled:opacity-50"
            >
              <RotateCcw size={13} />
              <span>বাতিল</span>
            </button>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={savingDraft || publishing || !isDirty}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition disabled:opacity-50"
          >
            {savingDraft ? (
              <Loader2 size={13} className="animate-spin text-slate-600" />
            ) : (
              <Save size={13} className="text-slate-600" />
            )}
            <span>ড্রাফট সেভ</span>
          </button>

          {/* Publish to Public Site */}
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            disabled={savingDraft || publishing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00875a] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#00704a] transition disabled:opacity-50"
          >
            {publishing ? (
              <Loader2 size={13} className="animate-spin text-white" />
            ) : (
              <Send size={13} />
            )}
            <span>পাবলিশ করুন</span>
          </button>
        </div>
      </div>

      {/* Confirmation Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4">
              <Sparkles size={24} />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              আপনি কি পাবলিক ওয়েবসাইটে পাবলিশ করতে চান?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              আপনার সংরক্ষিত ড্রাফটের সকল পরিবর্তন সাথে সাথে বাংলা কিউআর-এর মূল হোমপেজে লাইভ হয়ে যাবে। সকল সাধারণ ভিজিটর এবং মার্চেন্টরা নতুন কন্টেন্ট দেখতে পাবেন।
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200/80">
              <p className="font-semibold text-slate-700">পাবলিশের পূর্বে নিশ্চিত করুন:</p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                <li>বানান ও বাক্য গঠন সঠিকভাবে যাচাই করা হয়েছে।</li>
                <li>ছবিগুলোর রেজ্যুলেশন ও লিংক কার্যকর আছে।</li>
                <li>প্যাকেজ ও চার্জের তথ্য বাংলাদেশ ব্যাংকের নিয়মানুযায়ী সঠিক আছে।</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#00704a]"
              >
                <Send size={13} />
                হ্যাঁ, এখনই পাবলিশ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

