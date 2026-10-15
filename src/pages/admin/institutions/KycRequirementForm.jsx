import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  FileCheck,
  ArrowLeft,
  Save,
  Loader2,
  Landmark,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  UploadCloud,
  Trash2,
  RefreshCw,
  HelpCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  FileText,
  Clock,
  ExternalLink,
  Check,
  Info,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import FormField from "../../../components/forms/FormField";

const DOCUMENT_TYPES = [
  { value: "trade_license", label: "Trade License (ব্যবসায় লাইসেন্স)" },
  { value: "tin_certificate", label: "e-TIN Certificate (ট্যাক্স সনদ)" },
  { value: "bin_certificate", label: "BIN / VAT Certificate (ভ্যাট নিবন্ধন)" },
  { value: "nid", label: "National ID Card (জাতীয় পরিচয়পত্র)" },
  { value: "bank_statement", label: "Bank Account Statement / Solvency (ব্যাংক স্টেটমেন্ট)" },
  { value: "cancelled_cheque", label: "Cancelled Bank Cheque Leaf (বাতিল চেক পাতা)" },
  { value: "utility_bill", label: "Commercial Utility Bill (বিদ্যুৎ/গ্যাস বিল)" },
  { value: "memorandum", label: "Memorandum & Articles of Association (মেমোরেন্ডাম)" },
  { value: "board_resolution", label: "Board Resolution / Power of Attorney" },
  { value: "partnership_deed", label: "Partnership Deed (অংশীদারি চুক্তি)" },
  { value: "other", label: "Other Supporting Document (অন্যান্য নথি)" },
];

const REQUIREMENT_CATEGORIES = [
  { value: "business_identity", label: "Business Identity (ব্যবসার পরিচিতি)" },
  { value: "legal_entity", label: "Legal Entity Verification (আইনি অস্তিত্ব)" },
  { value: "tax_regulatory", label: "Tax & Regulatory Compliance (কর ও নিয়মাবলী)" },
  { value: "financial_standing", label: "Financial Standing & Banking (আর্থিক সক্ষমতা)" },
  { value: "signatory_identity", label: "Authorized Signatory & Ownership (মালিকানা)" },
  { value: "operational", label: "Operational & Premises Proof (কার্যক্রম প্রমাণ)" },
  { value: "other", label: "Other Regulatory Requirement" },
];

const COMMON_REJECTION_REASONS = [
  {
    title: "Blurry or Unreadable Scan",
    desc: "Text, seal, or QR code is illegible or obstructed by glare.",
  },
  {
    title: "Business Name Mismatch",
    desc: "Entity title does not exactly match applicant company registration.",
  },
  {
    title: "Expired Document",
    desc: "Validity date has lapsed or has fewer than 30 days remaining.",
  },
  {
    title: "Missing Front or Back Side",
    desc: "Both sides required for cards, but only single side was provided.",
  },
  {
    title: "Unsupported File Format",
    desc: "Uploaded file extension does not match allowed format rules.",
  },
  {
    title: "File Exceeding Size Limit",
    desc: "Document exceeds the maximum allowed file size constraint.",
  },
  {
    title: "Altered or Unverifiable",
    desc: "Visible image tampering, digital manipulation, or invalid watermark.",
  },
];

export default function KycRequirementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Core Form State
  const [formData, setFormData] = useState({
    institutionId: "",
    applicableServiceId: "",
    name: "",
    requirementCode: "",
    documentType: "trade_license",
    requirementCategory: "business_identity",
    isMandatory: true,
    displayOrder: 1,
    status: "active",
    // Section 2: Upload Settings
    allowedFormats: ["pdf", "jpg", "png", "webp"],
    maxFileSizeMb: 5,
    maxPdfPages: 5,
    documentSides: "single",
    // Section 3: Instructions & Guidelines
    instructions: "",
    adminNotes: "",
    // Section 4: Verification & Validation
    autoVerifyOcr: false,
    checkExpiry: false,
    requireMatchingName: false,
    expiryFieldName: "expiry_date",
    minValidityDays: 30,
    referenceApiUrl: "",
    // Sample Document
    sampleDocumentUrl: "",
    sampleDocumentUrls: [],
  });

  // Reference Data
  const [institutions, setInstitutions] = useState([]);
  const [services, setServices] = useState([]);
  const [relatedRequirements, setRelatedRequirements] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSample, setUploadingSample] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);

  // Load Institutions & Requirement Data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const instRes = await adminApi.getInstitutions({ limit: 100 });
        const bankList = instRes?.institutions || instRes?.data || [];
        if (isMounted) setInstitutions(Array.isArray(bankList) ? bankList : []);

        if (isEditMode) {
          const reqRes = await adminApi.getInstitutionKycRequirementById(id);
          const req = reqRes?.data || reqRes;
          if (req && isMounted) {
            // Parse allowed formats
            let formats = ["pdf", "jpg", "png", "webp"];
            if (req.allowed_extensions) {
              formats = req.allowed_extensions.split(",").map((s) => s.trim().toLowerCase());
            }

            // Parse sample URLs
            let samples = [];
            if (req.sample_document_url) samples.push(req.sample_document_url);
            if (req.sample_document_urls) {
              try {
                const parsed = typeof req.sample_document_urls === "string" 
                  ? JSON.parse(req.sample_document_urls) 
                  : req.sample_document_urls;
                if (Array.isArray(parsed)) {
                  parsed.forEach((url) => {
                    if (url && !samples.includes(url)) samples.push(url);
                  });
                }
              } catch (_) {}
            }

            setFormData({
              institutionId: String(req.institution_id || ""),
              applicableServiceId: req.applicable_service_id ? String(req.applicable_service_id) : "",
              name: req.name || "",
              requirementCode: req.requirement_code || "",
              documentType: req.document_type || "trade_license",
              requirementCategory: req.requirement_category || "business_identity",
              isMandatory: Boolean(req.is_mandatory),
              displayOrder: req.display_order ?? 1,
              status: req.status || "active",
              allowedFormats: formats,
              maxFileSizeMb: req.max_file_size_mb || 5,
              maxPdfPages: req.max_pdf_pages || 5,
              documentSides: req.document_sides || "single",
              instructions: req.instructions || "",
              adminNotes: req.admin_notes || req.review_instructions || "",
              autoVerifyOcr: Boolean(req.auto_verify_ocr),
              checkExpiry: Boolean(req.check_expiry),
              requireMatchingName: Boolean(req.require_matching_name),
              expiryFieldName: req.expiry_field_name || "expiry_date",
              minValidityDays: req.min_validity_days || 30,
              referenceApiUrl: req.reference_api_url || "",
              sampleDocumentUrl: samples[0] || "",
              sampleDocumentUrls: samples,
            });
          }
        } else {
          // New requirement: select first institution default if available
          if (bankList.length > 0 && isMounted) {
            setFormData((prev) => ({
              ...prev,
              institutionId: prev.institutionId || String(bankList[0].id),
            }));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load requirement details.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  // Load Services when Institution Changes
  useEffect(() => {
    let isMounted = true;
    async function loadServices() {
      if (!formData.institutionId) {
        setServices([]);
        return;
      }
      try {
        const res = await adminApi.getInstitutionServices({
          institutionId: formData.institutionId,
          limit: 100,
        });
        const svcList = res?.services || res?.data || [];
        if (isMounted) {
          setServices(Array.isArray(svcList) ? svcList : []);
          // Reset applicableServiceId if selected service is incompatible with the new partner
          if (formData.applicableServiceId) {
            const exists = svcList.some((s) => String(s.id) === String(formData.applicableServiceId));
            if (!exists) {
              setFormData((prev) => ({ ...prev, applicableServiceId: "" }));
            }
          }
        }
      } catch (_) {
        if (isMounted) setServices([]);
      }
    }

    loadServices();
    return () => {
      isMounted = false;
    };
  }, [formData.institutionId]);

  // Load Related Requirements for this Banking Partner & Service
  useEffect(() => {
    let isMounted = true;
    async function loadRelated() {
      if (!formData.institutionId) {
        setRelatedRequirements([]);
        return;
      }
      try {
        const res = await adminApi.getRelatedInstitutionKycRequirements({
          institutionId: formData.institutionId,
          serviceId: formData.applicableServiceId || undefined,
          excludeId: id || undefined,
        });
        if (isMounted) {
          setRelatedRequirements(Array.isArray(res?.data) ? res.data : []);
        }
      } catch (_) {
        if (isMounted) setRelatedRequirements([]);
      }
    }

    loadRelated();
    return () => {
      isMounted = false;
    };
  }, [formData.institutionId, formData.applicableServiceId, id]);

  // Auto-generate requirement code from title if not set
  const handleTitleChange = (val) => {
    setFormData((prev) => {
      const updated = { ...prev, name: val };
      if (!isEditMode && (!prev.requirementCode || prev.requirementCode === prev.name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 50))) {
        updated.requirementCode = val.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 50);
      }
      return updated;
    });
  };

  // Toggle Allowed Formats
  const handleToggleFormat = (fmt) => {
    setFormData((prev) => {
      const exists = prev.allowedFormats.includes(fmt);
      let updated;
      if (exists) {
        if (prev.allowedFormats.length <= 1) return prev; // Keep at least one
        updated = prev.allowedFormats.filter((f) => f !== fmt);
      } else {
        updated = [...prev.allowedFormats, fmt];
      }
      return { ...prev, allowedFormats: updated };
    });
  };

  // Upload Sample Document
  const handleSampleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSample(true);
    setError("");
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const res = await adminApi.uploadKycSampleDocument(uploadFormData);
      const fileUrl = res?.data?.url || res?.url;
      if (fileUrl) {
        setFormData((prev) => {
          const updatedList = [fileUrl, ...prev.sampleDocumentUrls.filter((u) => u !== fileUrl)];
          return {
            ...prev,
            sampleDocumentUrl: fileUrl,
            sampleDocumentUrls: updatedList,
          };
        });
        setActiveSampleIndex(0);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload sample document.");
    } finally {
      setUploadingSample(false);
      e.target.value = "";
    }
  };

  // Remove Sample Document
  const handleRemoveSample = (indexToRemove) => {
    setFormData((prev) => {
      const updatedList = prev.sampleDocumentUrls.filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        sampleDocumentUrl: updatedList[0] || "",
        sampleDocumentUrls: updatedList,
      };
    });
    setActiveSampleIndex(0);
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.institutionId) {
      setError("Please select a Banking Partner.");
      return;
    }
    if (!formData.name.trim()) {
      setError("Requirement Title is required.");
      return;
    }
    if (!formData.requirementCode.trim()) {
      setError("Requirement Code is required.");
      return;
    }
    if (!formData.instructions.trim()) {
      setError("Instructions for Merchant is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        institutionId: Number(formData.institutionId),
        applicableServiceId: formData.applicableServiceId ? Number(formData.applicableServiceId) : null,
        name: formData.name.trim(),
        title: formData.name.trim(),
        requirementCode: formData.requirementCode.trim().toUpperCase(),
        code: formData.requirementCode.trim().toUpperCase(),
        documentType: formData.documentType,
        requirementCategory: formData.requirementCategory,
        isMandatory: formData.isMandatory,
        displayOrder: Number(formData.displayOrder) || 0,
        status: formData.status,
        allowedFormats: formData.allowedFormats,
        allowedExtensions: formData.allowedFormats.join(","),
        maxFileSizeMb: Number(formData.maxFileSizeMb) || 5,
        maxPdfPages: Number(formData.maxPdfPages) || 5,
        documentSides: formData.documentSides,
        instructions: formData.instructions.trim(),
        merchantInstructions: formData.instructions.trim(),
        adminNotes: formData.adminNotes.trim() || null,
        reviewInstructions: formData.adminNotes.trim() || null,
        autoVerifyOcr: Boolean(formData.autoVerifyOcr),
        checkExpiry: Boolean(formData.checkExpiry),
        requireMatchingName: Boolean(formData.requireMatchingName),
        expiryFieldName: formData.expiryFieldName.trim() || "expiry_date",
        minValidityDays: Number(formData.minValidityDays) || 30,
        referenceApiUrl: formData.referenceApiUrl.trim() || null,
        sampleDocumentUrl: formData.sampleDocumentUrls[0] || formData.sampleDocumentUrl || null,
        sampleDocumentUrls: formData.sampleDocumentUrls,
      };

      if (isEditMode) {
        await adminApi.updateInstitutionKycRequirement(id, payload);
        setSuccessMessage("KYC requirement updated successfully.");
      } else {
        await adminApi.createInstitutionKycRequirement(payload);
        setSuccessMessage("KYC requirement created successfully.");
      }

      setTimeout(() => {
        navigate(`/admin/institutions/kyc-requirements?institutionId=${formData.institutionId}`);
      }, 1200);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.map((e) => `${e.path?.join(".") || "field"}: ${e.message}`).join(", ") ||
        "Failed to save KYC requirement.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBank = institutions.find((i) => String(i.id) === String(formData.institutionId));
  const selectedService = services.find((s) => String(s.id) === String(formData.applicableServiceId));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <Loader2 size={36} className="text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading KYC requirement configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <Link to="/admin/dashboard" className="hover:text-slate-600 dark:hover:text-slate-300">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/admin/institutions" className="hover:text-slate-600 dark:hover:text-slate-300">
              Bank Management
            </Link>
            <span>/</span>
            <Link
              to={`/admin/institutions/kyc-requirements${formData.institutionId ? `?institutionId=${formData.institutionId}` : ""}`}
              className="hover:text-slate-600 dark:hover:text-slate-300"
            >
              KYC Requirements
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              {isEditMode ? "Edit Requirement" : "Add KYC Requirement"}
            </span>
          </nav>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <FileCheck size={24} />
            </div>
            {isEditMode ? "Edit KYC Requirement" : "Add KYC Requirement"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure mandatory or optional document requirements for banking partners and payment services
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/25 transition disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isEditMode ? "Update Requirement" : "Save Requirement"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-800 dark:text-red-300 text-xs animate-in fade-in">
          <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Please correct the following errors:</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout (~72% Left Form, ~28% Right Supporting) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: 4 NUMBERED SECTIONS (~72% / 8 of 12 cols on desktop) */}
        {/* ==================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  1
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Basic Information</h2>
                  <p className="text-[11px] text-slate-400">
                    Define banking partner association, titles, categories, and codes
                  </p>
                </div>
              </div>

              {/* Status Toggle (Active / Inactive) */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {formData.status === "active" ? "Active" : "Inactive"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: prev.status === "active" ? "inactive" : "active",
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    formData.status === "active" ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formData.status === "active" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Banking Partner */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Banking Partner <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.institutionId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, institutionId: e.target.value }))}
                  required
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                >
                  <option value="" disabled>
                    Select Banking Institution...
                  </option>
                  {institutions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.institution_code || b.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Bank or MFS provider that requires this verification</p>
              </div>

              {/* Applicable Service */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Applicable Service
                </label>
                <select
                  value={formData.applicableServiceId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, applicableServiceId: e.target.value }))}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                >
                  <option value="">All Services (Institution-wide)</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.service_type || "Gateway"})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Optional. Select a specific service or apply to all services under this partner
                </p>
              </div>

              {/* Requirement Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Requirement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Valid Trade License (City Corporation / Municipality)"
                  required
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                />
              </div>

              {/* Requirement Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Requirement Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.requirementCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirementCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
                    }))
                  }
                  placeholder="e.g. TRADE_LICENSE_2026"
                  required
                  className="w-full font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Unique uppercase key used by APIs and system audits</p>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, documentType: e.target.value }))}
                  required
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirement Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Requirement Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.requirementCategory}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requirementCategory: e.target.value }))}
                  required
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                >
                  {REQUIREMENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: e.target.value }))}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Lower numbers appear first on the merchant KYC page</p>
              </div>

              {/* Mandatory / Optional Pill Selector */}
              <div className="md:col-span-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Obligation Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, isMandatory: true }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      formData.isMandatory
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        formData.isMandatory ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400"
                      }`}
                    >
                      {formData.isMandatory && <Check size={11} strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">Mandatory Document</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Merchant onboarding cannot be approved without this verified document
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, isMandatory: false }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      !formData.isMandatory
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        !formData.isMandatory ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400"
                      }`}
                    >
                      {!formData.isMandatory && <Check size={11} strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">Optional Supporting Document</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Recommended but not strictly blocking merchant submission
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DOCUMENT & UPLOAD SETTINGS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                2
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Document & Upload Settings</h2>
                <p className="text-[11px] text-slate-400">
                  Enforce file format, payload limits, page restrictions, and side requirements
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Allowed Formats Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Allowed Document Formats <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "pdf", label: "PDF Document (.pdf)", mime: "application/pdf" },
                    { id: "jpg", label: "JPG / JPEG Image", mime: "image/jpeg" },
                    { id: "png", label: "PNG Image (.png)", mime: "image/png" },
                    { id: "webp", label: "WebP Image (.webp)", mime: "image/webp" },
                  ].map((fmt) => {
                    const isChecked = formData.allowedFormats.includes(fmt.id);
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => handleToggleFormat(fmt.id)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
                          isChecked
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                            : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span>{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Merchants will only be allowed to submit files with these verified MIME types
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Max File Size (MB) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Maximum File Size (MB) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxFileSizeMb}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxFileSizeMb: e.target.value }))}
                      required
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 pr-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">MB</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Recommended: 5 MB (Maximum upload limit: 100 MB)</p>
                </div>

                {/* Max PDF Page Count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Maximum PDF Pages
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.maxPdfPages}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxPdfPages: e.target.value }))}
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 pr-14 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">Pages</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Prevents excessively bulky PDF attachments</p>
                </div>
              </div>

              {/* Document Sides Requirement */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Document Sides Requirement <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "single",
                      label: "Single Side",
                      desc: "One front page or scan (e.g. Trade License, Cheque, Certificate)",
                    },
                    {
                      id: "both",
                      label: "Both Sides",
                      desc: "Separate Front & Back scans required (e.g. NID, Smart Card, Driving License)",
                    },
                    {
                      id: "multiple",
                      label: "Multiple Pages",
                      desc: "Multi-page booklet or scan (e.g. Memorandum, Financial Audit, Deed)",
                    },
                  ].map((side) => {
                    const isSelected = formData.documentSides === side.id;
                    return (
                      <button
                        key={side.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, documentSides: side.id }))}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400"
                            }`}
                          >
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span className="text-xs font-bold">{side.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight">{side.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: INSTRUCTIONS & GUIDELINES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                3
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Instructions & Guidelines</h2>
                <p className="text-[11px] text-slate-400">
                  Write public guidance for applicants and private review notes for compliance reviewers
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Instructions for Merchant (Required) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Instructions for Merchant <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formData.instructions.length} / 1000 characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formData.instructions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                  required
                  placeholder="Provide clear, concise steps for the merchant. E.g.: Upload a clean color copy of your updated trade license (valid for current financial year). Ensure the issuing municipality stamp, authorized signature, and license number are clearly visible."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs leading-relaxed"
                />
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <Info size={12} />
                  <span>This text is directly displayed on the merchant document upload portal.</span>
                </p>
              </div>

              {/* Admin Notes (Internal - Strictly Private) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Admin Notes (Internal Review Instructions)
                    </label>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      🔒 Strictly Private
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formData.adminNotes.length} / 1000 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={formData.adminNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Internal review criteria for BanglaQR / Bank KYC reviewers. E.g.: Cross-check registration number against City Corporation portal; reject if issuance date exceeds 12 months."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 p-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs leading-relaxed"
                />
                <div className="mt-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[10px] text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-1.5">
                  <ShieldAlert size={13} className="shrink-0 text-amber-600" />
                  <span>
                    Confidential: Internal notes are never sent over public/merchant APIs or notification payloads.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: VERIFICATION & VALIDATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                4
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Verification & Validation</h2>
                <p className="text-[11px] text-slate-400">
                  Configure automated document inspection, validity window checks, and reference APIs
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Automated Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Auto-validation / OCR Switch */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-OCR Parsing</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Automated text & field extraction</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, autoVerifyOcr: !prev.autoVerifyOcr }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        formData.autoVerifyOcr ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          formData.autoVerifyOcr ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      formData.autoVerifyOcr
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {formData.autoVerifyOcr ? "OCR Enabled" : "Manual Review"}
                  </span>
                </div>

                {/* Check Expiry Date Switch */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Check Expiry Date</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Enforce unexpired validity window</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, checkExpiry: !prev.checkExpiry }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        formData.checkExpiry ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          formData.checkExpiry ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      formData.checkExpiry
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {formData.checkExpiry ? "Expiry Enforced" : "No Expiry Check"}
                  </span>
                </div>

                {/* Match Business Name Switch */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Match Business Name</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Compare name with merchant profile</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          requireMatchingName: !prev.requireMatchingName,
                        }))
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        formData.requireMatchingName ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          formData.requireMatchingName ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      formData.requireMatchingName
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {formData.requireMatchingName ? "Exact Match Required" : "Fuzzy / Manual Check"}
                  </span>
                </div>
              </div>

              {/* Expiry & Validity Detail Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Expiry Date Field Key
                  </label>
                  <input
                    type="text"
                    value={formData.expiryFieldName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expiryFieldName: e.target.value }))}
                    placeholder="e.g. expiry_date, valid_until"
                    className="w-full font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Field name expected in parsed document metadata</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Minimum Remaining Validity (Days)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="3650"
                      value={formData.minValidityDays}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minValidityDays: e.target.value }))}
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 pr-14 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">Days</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Documents expiring sooner than this window will be flagged as invalid
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    External Verification API / Registry Lookup URL
                  </label>
                  <input
                    type="url"
                    value={formData.referenceApiUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, referenceApiUrl: e.target.value }))}
                    placeholder="https://registry.gov.bd/api/v1/license/verify"
                    className="w-full font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Optional reference endpoint for automated external registry validation. Secrets are never exposed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT SUPPORTING COLUMN (~28% / 4 of 12 cols on desktop) */}
        {/* ==================================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* PANEL 1: SAMPLE DOCUMENT PREVIEW */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Sample Document Preview</span>
              </h3>
              {formData.sampleDocumentUrls.length > 1 && (
                <span className="text-[10px] font-semibold text-slate-400">
                  {activeSampleIndex + 1} of {formData.sampleDocumentUrls.length}
                </span>
              )}
            </div>

            {/* Sample Viewer Area */}
            {formData.sampleDocumentUrls.length > 0 ? (
              <div className="space-y-3">
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-4/3 flex items-center justify-center">
                  <img
                    src={formData.sampleDocumentUrls[activeSampleIndex] || formData.sampleDocumentUrl}
                    alt="Sample Document"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x300?text=Sample+Preview";
                    }}
                  />

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFullPreviewOpen(true)}
                      className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                    >
                      <Maximize2 size={14} />
                      <span>Full Size</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSample(activeSampleIndex)}
                      className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-600 text-xs font-bold shadow-md transition flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Previous / Next buttons for multiple samples */}
                  {formData.sampleDocumentUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSampleIndex((prev) =>
                            prev === 0 ? formData.sampleDocumentUrls.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSampleIndex((prev) =>
                            prev === formData.sampleDocumentUrls.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </>
                  )}
                </div>

                {/* Upload or Replace Sample */}
                <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer transition">
                  {uploadingSample ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-emerald-600" />
                      <span>Uploading sample...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} className="text-emerald-600" />
                      <span>Add / Replace Sample Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleSampleUpload}
                    disabled={uploadingSample}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No Sample Document</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload an exemplar image so merchants understand exactly what document to upload
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-xs transition">
                  {uploadingSample ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={13} />
                      <span>Upload Sample File</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleSampleUpload}
                    disabled={uploadingSample}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* PANEL 2: MERCHANT VIEW GUIDELINES (LIVE PREVIEW) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye size={15} className="text-blue-500" />
                <span>Merchant View Guidelines</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Live Preview
              </span>
            </div>

            {/* Merchant Card Simulation */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {formData.name || "Requirement Title"}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {selectedBank ? selectedBank.name : "Banking Partner"} •{" "}
                    {selectedService ? selectedService.name : "All Services"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                    formData.isMandatory
                      ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {formData.isMandatory ? "Required" : "Optional"}
                </span>
              </div>

              {/* Upload Specifications Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                  {formData.allowedFormats.map((f) => f.toUpperCase()).join(", ")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                  Max {formData.maxFileSizeMb} MB
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium capitalize">
                  {formData.documentSides === "both"
                    ? "Both Sides"
                    : formData.documentSides === "multiple"
                    ? "Multiple Pages"
                    : "Single Side"}
                </span>
              </div>

              {/* Live Instruction Paragraph */}
              <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{formData.instructions || "Merchant instructions will appear here in real-time as you type..."}"
                </p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Note: Internal Admin Notes are strictly omitted from this applicant view.
            </p>
          </div>

          {/* PANEL 3: COMMON REJECTION REASONS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert size={15} className="text-amber-500" />
              <span>Common Rejection Reasons</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Guidance reference for document review teams when assessing applicant submissions:
            </p>

            <div className="space-y-2">
              {COMMON_REJECTION_REASONS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px]"
                >
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{item.title}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL 4: RELATED REQUIREMENTS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={15} className="text-indigo-500" />
                <span>Related Requirements</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">
                {relatedRequirements.length} Linked
              </span>
            </div>

            {relatedRequirements.length > 0 ? (
              <div className="space-y-2">
                {relatedRequirements.map((rel) => (
                  <div
                    key={rel.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {rel.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {rel.service_name ? `${rel.service_name} • ` : "All Services • "}
                        {rel.requirement_code}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          rel.is_mandatory
                            ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                        }`}
                      >
                        {rel.is_mandatory ? "Req" : "Opt"}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          rel.status === "active"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}
                      >
                        {rel.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400">
                No other requirements configured for this partner yet.
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Full-size Sample Document Modal Viewer */}
      {isFullPreviewOpen && formData.sampleDocumentUrls[activeSampleIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" />
                <span>Sample Document: {formData.name}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsFullPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950/50">
              <img
                src={formData.sampleDocumentUrls[activeSampleIndex]}
                alt="Full Size Sample"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

