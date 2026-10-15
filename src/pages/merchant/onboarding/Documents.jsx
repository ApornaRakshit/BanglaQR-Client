import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  FileText,
  UploadCloud,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  Eye,
  Plus,
  Lock,
  HelpCircle,
  Clock,
  XCircle,
  CreditCard,
  Building2,
  UserCheck,
  Check,
} from "lucide-react";
import FormField from "../../../components/forms/FormField";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/status/StatusBadge";
import DocumentPreviewModal from "../../../components/documents/DocumentPreviewModal";
import { merchantApi } from "../../../services/merchantApi";

const CORE_DOCUMENT_CONFIGS = [
  {
    type: "NID_FRONT",
    title: "NID Front Side",
    category: "Identity Proof",
    description: "Clear photo or scan of front side showing full name, photo, and NID number",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png,.webp",
  },
  {
    type: "NID_BACK",
    title: "NID Back Side",
    category: "Identity Proof",
    description: "Clear scan of back side showing registered permanent address and barcode",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png,.webp",
  },
  {
    type: "TIN_CERTIFICATE",
    title: "e-TIN Certificate",
    category: "Tax Identifier",
    description: "Official 12-digit Tax Identification Number certificate issued by NBR",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png,.webp",
  },
  {
    type: "CANCELLED_BANK_CHEQUE",
    title: "Cancelled Bank Cheque Leaf",
    category: "Bank Verification",
    description: "Original cancelled cheque showing Account Name, Number, and MICR/Routing code",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png,.webp",
  },
  {
    type: "BIN_CERTIFICATE",
    title: "BIN / VAT Certificate",
    category: "Tax Identifier (Optional)",
    description: "13-digit Business Identification Number certificate (if VAT registered)",
    required: false,
    accept: ".pdf,.jpg,.jpeg,.png,.webp",
  },
];

const ADDITIONAL_CATEGORIES = [
  { value: "TRADE_LICENSE", label: "Trade License" },
  { value: "COMPANY_REGISTRATION", label: "Company Registration Certificate (RJSC / MoA / AoA)" },
  { value: "OTHER", label: "Other Supporting Document" },
];

export default function Documents() {
  const navigate = useNavigate();
  const { merchantData, reload, isSubmitted } = useOutletContext();

  const [activeUploadType, setActiveUploadType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  // Additional document state
  const [showAdditionalUpload, setShowAdditionalUpload] = useState(false);
  const [additionalType, setAdditionalType] = useState("TRADE_LICENSE");
  const [customDocLabel, setCustomDocLabel] = useState("");

  const documents = merchantData?.documents || [];

  function getDocByType(type) {
    return documents.find((d) => d.documentType === type);
  }

  // Calculate live completion
  const hasNidFront = Boolean(getDocByType("NID_FRONT"));
  const hasNidBack = Boolean(getDocByType("NID_BACK"));
  const hasTin = Boolean(getDocByType("TIN_CERTIFICATE"));
  const hasCheque = Boolean(getDocByType("CANCELLED_BANK_CHEQUE"));
  const hasBin = Boolean(getDocByType("BIN_CERTIFICATE"));

  const requiredCount = [hasNidFront, hasNidBack, hasTin, hasCheque].filter(Boolean).length;
  const isAllRequiredUploaded = requiredCount === 4;

  async function handleFileUpload(file, documentType, customLabel = null) {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setApiError("File exceeds the maximum limit of 10MB. Please choose a smaller file.");
      return;
    }

    try {
      setUploading(true);
      setActiveUploadType(documentType);
      setApiError("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const label = customLabel || CORE_DOCUMENT_CONFIGS.find((c) => c.type === documentType)?.title || file.name;
      formData.append("documentName", label);
      formData.append("customLabel", label);

      await merchantApi.uploadDocument(formData);
      await reload();

      setSuccessMessage(`${label} uploaded successfully.`);
      setShowAdditionalUpload(false);
      setCustomDocLabel("");
    } catch (err) {
      console.error("Upload error:", err);
      setApiError(
        err.response?.data?.message || "Failed to upload document. Please check the file format and try again."
      );
    } finally {
      setUploading(false);
      setActiveUploadType(null);
    }
  }

  async function handleDelete(docId, docTitle) {
    if (!window.confirm(`Are you sure you want to delete ${docTitle}?`)) return;

    try {
      setDeletingId(docId);
      setApiError("");
      await merchantApi.deleteDocument(docId);
      setSuccessMessage(`${docTitle} deleted successfully.`);
      await reload();
    } catch (err) {
      console.error("Delete error:", err);
      setApiError(
        err.response?.data?.message || "Failed to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const openIssues = (merchantData?.kycFieldIssues || []).filter((i) => i.status === "open");

  async function handleResubmitCorrection() {
    try {
      setUploading(true);
      setApiError("");
      setSuccessMessage("");

      await merchantApi.submitCorrection({
        note: "Updated documents re-uploaded and resubmitted by merchant.",
      });

      setSuccessMessage("Updated documents resubmitted successfully! Your designated bank and compliance team have been notified.");
      if (reload) await reload();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to resubmit corrections:", err);
      setApiError(err.response?.data?.message || "Failed to resubmit corrections. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleContinue() {
    if (!isAllRequiredUploaded) {
      const missing = [];
      if (!hasNidFront) missing.push("NID Front");
      if (!hasNidBack) missing.push("NID Back");
      if (!hasTin) missing.push("TIN Certificate");
      if (!hasCheque) missing.push("Cancelled Bank Cheque");

      setApiError(`Please upload all 4 required documents before continuing. Missing: ${missing.join(", ")}`);
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    navigate("/merchant/onboarding/verification");
  }

  return (
    <div className="space-y-6">
      {/* ====================================================
          TOP STEP TITLE & HEADER
      ===================================================== */}
      <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                05
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Verification Documents
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 sm:text-sm">
              Upload official government and financial verification certificates.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-sm font-semibold text-slate-700">
            <Lock size={15} className="text-emerald-600" />
            <span>Encrypted Vault Storage</span>
          </div>
        </div>
      </div>

      {/* Targeted KYC Correction Alert Banner */}
      {openIssues.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-800">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  Document / KYC Correction Requested
                </h3>
                <p className="mt-0.5 text-sm text-amber-800">
                  The compliance reviewer or your designated bank requested updates on the following items. Re-upload the required documents and click "Resubmit to Bank & Admin".
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {openIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs"
                    >
                      <span className="font-bold capitalize">{issue.field_key.replace(/_/g, " ")}:</span>
                      <span className="text-slate-600">{issue.issue_reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              loading={uploading}
              onClick={handleResubmitCorrection}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              Resubmit to Bank & Admin
            </Button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {apiError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ====================================================
          TWO-COLUMN MAIN CONTENT
      ===================================================== */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: CORE DOCUMENT UPLOAD CARDS (8 Cols) */}
        <div className="space-y-5 lg:col-span-8">
          {CORE_DOCUMENT_CONFIGS.map((config) => {
            const uploadedDoc = getDocByType(config.type);
            const isCurrentlyUploading = uploading && activeUploadType === config.type;
            const isDeleting = deletingId === uploadedDoc?.id;
            const downloadUrl = uploadedDoc ? `/api/v1/merchants/me/documents/${uploadedDoc.id}/view` : null;

            return (
              <div
                key={config.type}
                className={`rounded-md border transition-all duration-200 p-5 sm:p-6 ${
                  uploadedDoc
                    ? "border-emerald-200/90 bg-emerald-50/20"
                    : "border-slate-200/80 bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        uploadedDoc
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <FileText size={22} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-950 sm:text-base">
                          {config.title}
                        </h3>

                        {config.required ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Required
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            Optional
                          </span>
                        )}

                        {uploadedDoc && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 size={13} />
                            Uploaded
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                        {config.description}
                      </p>

                      {uploadedDoc && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                            {uploadedDoc.originalFilename || uploadedDoc.documentName}
                          </span>
                          <span>•</span>
                          <span>{(uploadedDoc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{new Date(uploadedDoc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex shrink-0 items-center gap-2">
                    {uploadedDoc ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(uploadedDoc)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Preview</span>
                        </button>

                        <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition cursor-pointer">
                          <RefreshCw size={13} className={isCurrentlyUploading ? "animate-spin" : ""} />
                          <span>Replace</span>
                          <input
                            type="file"
                            accept={config.accept}
                            disabled={uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, config.type);
                              e.target.value = "";
                            }}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          disabled={isDeleting || uploading}
                          onClick={() => handleDelete(uploadedDoc.id, config.title)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                          title="Delete document"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer">
                        <UploadCloud size={16} className={isCurrentlyUploading ? "animate-bounce" : ""} />
                        <span>{isCurrentlyUploading ? "Uploading..." : `Upload ${config.required ? "Side" : "File"}`}</span>
                        <input
                          type="file"
                          accept={config.accept}
                          disabled={uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, config.type);
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Additional Supporting Documents Section */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Additional Supporting Documents
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  Upload Trade License, RJSC incorporation certificates, or other supporting files
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdditionalUpload((prev) => !prev)}
                icon={Plus}
              >
                {showAdditionalUpload ? "Cancel" : "Add Document"}
              </Button>
            </div>

            {/* Additional Upload Drawer/Form */}
            {showAdditionalUpload && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 mb-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Document Category"
                    name="additionalType"
                    type="select"
                    value={additionalType}
                    onChange={(e) => setAdditionalType(e.target.value)}
                    options={ADDITIONAL_CATEGORIES}
                    disabled={uploading}
                  />

                  <FormField
                    label="Document Custom Label (Optional)"
                    name="customDocLabel"
                    value={customDocLabel}
                    onChange={(e) => setCustomDocLabel(e.target.value)}
                    placeholder="e.g. Trade License 2026 Renewal"
                    disabled={uploading}
                  />
                </div>

                <div className="flex justify-end">
                  <label className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer">
                    <UploadCloud size={16} />
                    <span>Choose File & Upload</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, additionalType, customDocLabel);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* List of Additional Uploads */}
            {documents.filter(
              (d) => !["NID_FRONT", "NID_BACK", "TIN_CERTIFICATE", "CANCELLED_BANK_CHEQUE", "BIN_CERTIFICATE"].includes(d.documentType)
            ).length === 0 ? (
              <p className="text-sm text-slate-400 italic">No additional documents uploaded.</p>
            ) : (
              <div className="space-y-3">
                {documents
                  .filter(
                    (d) =>
                      !["NID_FRONT", "NID_BACK", "TIN_CERTIFICATE", "CANCELLED_BANK_CHEQUE", "BIN_CERTIFICATE"].includes(
                        d.documentType
                      )
                  )
                  .map((doc) => {
                    const downloadUrl = `/api/v1/merchants/me/documents/${doc.id}/view`;
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {doc.customLabel || doc.documentName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB · {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id, doc.customLabel || doc.documentName)}
                            className="text-sm font-semibold text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REQUIRED DOCUMENT CHECKLIST & SUPPORT CARDS (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Document Completion Checklist */}
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Document Completion
                </p>
                <h4 className="text-base font-bold text-slate-950 mt-0.5">
                  {requiredCount} / 4 Required Documents
                </h4>
              </div>

              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold ${
                  isAllRequiredUploaded
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {Math.round((requiredCount / 4) * 100)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-5">
              <div
                className={`h-full transition-all duration-300 ${
                  isAllRequiredUploaded ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${(requiredCount / 4) * 100}%` }}
              />
            </div>

            {/* Items */}
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="font-semibold text-slate-800">NID Front Side</span>
                {hasNidFront ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <Check size={14} /> Uploaded
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-600">Required</span>
                )}
              </li>

              <li className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="font-semibold text-slate-800">NID Back Side</span>
                {hasNidBack ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <Check size={14} /> Uploaded
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-600">Required</span>
                )}
              </li>

              <li className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="font-semibold text-slate-800">TIN Certificate</span>
                {hasTin ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <Check size={14} /> Uploaded
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-600">Required</span>
                )}
              </li>

              <li className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="font-semibold text-slate-800">Cancelled Bank Cheque</span>
                {hasCheque ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <Check size={14} /> Uploaded
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-600">Required</span>
                )}
              </li>

              <li className="flex items-center justify-between pt-1">
                <span className="text-slate-500">BIN Certificate</span>
                {hasBin ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <Check size={14} /> Uploaded
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Optional</span>
                )}
              </li>
            </ul>
          </div>

          {/* Card 2: Vault Security Info */}
          <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white mb-3">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-950">
              Encrypted Document Storage
            </h4>
            <p className="mt-1.5 text-sm leading-5 text-emerald-950/80">
              Uploaded files are stored in isolated encrypted storage partitions. Direct URL access without active merchant credentials is strictly prevented.
            </p>
          </div>

          {/* Card 3: Need Help? */}
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={18} className="text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Need Assistance?</h4>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              If your document file is rejected due to size or readability issues, contact our support team.
            </p>

            <button
              type="button"
              onClick={() => navigate("/merchant/support")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-600 transition cursor-pointer"
            >
              <span>Contact Support</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================
          STICKY BOTTOM ACTION BAR
      ===================================================== */}
      <div className="sticky bottom-0 z-20 mt-8 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 sm:px-8 shadow-lg shadow-slate-900/5">
        <div className="mx-auto flex max-w-[1440px] flex-col-reverse items-center justify-between gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/merchant/dashboard")}
          >
            Save & Exit
          </Button>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/merchant/onboarding/kyc")}
              icon={ArrowLeft}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleContinue}
              icon={ArrowRight}
              iconPosition="right"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </div>

      {/* SECURE DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        doc={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
