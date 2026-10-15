import { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Landmark,
  UserCheck,
  HelpCircle,
  FileCheck,
  Calendar,
  MapPin,
  RefreshCw,
  ExternalLink,
  Check,
  Hash,
} from "lucide-react";
import FormField from "../../../components/forms/FormField";
import Button from "../../../components/ui/Button";
import { merchantApi } from "../../../services/merchantApi";

const BUSINESS_ENTITY_TYPES = [
  { value: "", label: "Select Business Entity Type" },
  { value: "Sole Proprietorship", label: "Sole Proprietorship" },
  { value: "Partnership", label: "Partnership" },
  { value: "Private Limited Company", label: "Private Limited Company (Ltd)" },
  { value: "Public Limited Company", label: "Public Limited Company (PLC)" },
  { value: "NGO", label: "NGO / Non-Profit" },
  { value: "Trust", label: "Trust" },
  { value: "Other", label: "Other" },
];

const ACCOUNT_TYPES = [
  { value: "Current", label: "Current Account" },
  { value: "Savings", label: "Savings Account" },
  { value: "Business", label: "Business / Corporate Account" },
];

export default function KYCInformation() {
  const navigate = useNavigate();
  const { merchantData, reload, isSubmitted } = useOutletContext();
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    legalBusinessName: "",
    businessEntityType: "Private Limited Company",
    tradeLicenseNumber: "",
    registrationNumber: "",
    tin: "",
    bin: "",
    authorizedPersonName: "",
    designation: "",
    nidNumber: "",
    nidIssueDate: "",
    nidExpiryDate: "",
    institutionId: null,
    branchId: null,
    bankName: "",
    branchName: "",
    branchCode: "",
    division: "",
    district: "",
    upazila: "",
    branchAddress: "",
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "Current",
  });

  // Dynamic Institutions & Branches from Database
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [isManualBank, setIsManualBank] = useState(false);
  const [isManualBranch, setIsManualBranch] = useState(false);
  const [selectedBranchInfo, setSelectedBranchInfo] = useState(null);

  const [showMasked, setShowMasked] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1. Fetch Active Institutions on Mount
  useEffect(() => {
    let isMounted = true;
    setLoadingInstitutions(true);
    merchantApi
      .getActiveInstitutions()
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data || res || [];
        setInstitutions(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Failed to load active institutions:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingInstitutions(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Branches when institutionId changes
  const loadBranches = async (instId, targetBranchId = null) => {
    if (!instId) {
      setBranches([]);
      setSelectedBranchInfo(null);
      return;
    }
    setLoadingBranches(true);
    try {
      const res = await merchantApi.getInstitutionBranches(instId);
      const list = res?.data || res || [];
      const branchList = Array.isArray(list) ? list : [];
      setBranches(branchList);

      if (targetBranchId) {
        const found = branchList.find((b) => Number(b.id) === Number(targetBranchId));
        if (found) {
          setSelectedBranchInfo(found);
        }
      }
    } catch (err) {
      console.error("Failed to fetch branches for institution:", err);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  // 3. Populate Form from Existing Merchant KYC
  useEffect(() => {
    if (merchantData?.kyc) {
      const k = merchantData.kyc;
      const initialInstId = k.institutionId || null;
      const initialBranchId = k.branchId || null;

      setFormData({
        legalBusinessName: k.legalBusinessName || "",
        businessEntityType: k.businessEntityType || merchantData.profile?.businessType || "Private Limited Company",
        tradeLicenseNumber: k.tradeLicenseNumber || "",
        registrationNumber: k.registrationNumber || "",
        tin: k.tin || "",
        bin: k.bin || "",
        authorizedPersonName: k.authorizedPersonName || merchantData.contact?.name || "",
        designation: k.designation || merchantData.contact?.designation || "",
        nidNumber: k.nidNumber || "",
        nidIssueDate: k.nidIssueDate || "",
        nidExpiryDate: k.nidExpiryDate || "",
        institutionId: initialInstId,
        branchId: initialBranchId,
        bankName: k.bankName || "",
        branchName: k.branchName || "",
        branchCode: k.branchCode || "",
        division: k.division || "",
        district: k.district || "",
        upazila: k.upazila || "",
        branchAddress: k.branchAddress || "",
        accountHolderName: k.accountHolderName || k.legalBusinessName || merchantData.profile?.companyName || "",
        accountNumber: k.accountNumber || "",
        routingNumber: k.routingNumber || "",
        accountType: k.accountType || "Current",
      });

      if (initialInstId) {
        loadBranches(initialInstId, initialBranchId);
      } else if (k.bankName) {
        // If institutionId was not set, try to match by bankName once institutions load
        if (institutions.length > 0) {
          const matched = institutions.find(
            (i) => i.name.toLowerCase() === k.bankName.toLowerCase()
          );
          if (matched) {
            setFormData((prev) => ({ ...prev, institutionId: matched.id }));
            loadBranches(matched.id, initialBranchId);
          } else {
            setIsManualBank(true);
            setIsManualBranch(true);
          }
        }
      }
    } else if (merchantData?.profile) {
      setFormData((prev) => ({
        ...prev,
        legalBusinessName: prev.legalBusinessName || merchantData.profile.companyName || "",
        businessEntityType: prev.businessEntityType || merchantData.profile.businessType || "Private Limited Company",
        authorizedPersonName: prev.authorizedPersonName || merchantData.contact?.name || "",
        designation: prev.designation || merchantData.contact?.designation || "",
        accountHolderName: prev.accountHolderName || merchantData.profile.companyName || "",
      }));
    }
  }, [merchantData, institutions]);

  function validateField(name, value) {
    const val = String(value || "").trim();

    switch (name) {
      case "legalBusinessName":
        if (!val) return "Legal entity business name is required";
        if (val.length < 2) return "Business name must be at least 2 characters";
        return "";

      case "businessEntityType":
        if (!val) return "Please select a business entity type";
        return "";

      case "tradeLicenseNumber":
        if (!val) return "Trade license number is required";
        if (val.length < 3) return "Please enter a valid trade license number";
        return "";

      case "tin":
        if (!val) return "Tax Identification Number (TIN) is required";
        if (!/^\d{12}$/.test(val)) return "e-TIN must be exactly 12 numeric digits (e.g. 123456789012)";
        return "";

      case "bin":
        if (val && !/^\d{9,13}$/.test(val.replace(/[-\s]/g, ""))) {
          return "BIN / VAT number must be 9 to 13 digits";
        }
        return "";

      case "authorizedPersonName":
        if (!val) return "Authorized person name is required";
        if (val.length < 3) return "Name must be at least 3 characters";
        if (!/^[a-zA-Z\s.-]+$/.test(val)) return "Name can only contain letters, spaces, dots, and hyphens";
        return "";

      case "designation":
        if (!val) return "Official designation is required";
        if (val.length < 2) return "Designation must be at least 2 characters";
        return "";

      case "nidNumber":
        if (!val) return "National ID (NID) number is required";
        const cleanNid = val.replace(/[\s-]/g, "");
        if (!/^\d+$/.test(cleanNid)) return "NID must contain numbers only";
        if (![10, 13, 17].includes(cleanNid.length)) {
          return "National ID must be 10 digits (Smart Card), 13 digits, or 17 digits";
        }
        return "";

      case "accountHolderName":
        if (!val) return "Account holder name is required";
        if (val.length < 2) return "Account holder title must be at least 2 characters";
        return "";

      case "bankName":
        if (!val) return "Please select a commercial bank";
        return "";

      case "branchName":
        if (!val) return "Branch name is required";
        if (val.length < 2) return "Branch name must be at least 2 characters";
        return "";

      case "accountNumber":
        if (!val) return "Bank account number is required";
        if (val.length < 8) return "Account number must be at least 8 digits";
        if (!/^[0-9A-Za-z-]+$/.test(val)) return "Account number can only contain digits, letters, or hyphens";
        return "";

      case "routingNumber":
        if (!val) return "Bank routing number is required";
        if (!/^\d{9}$/.test(val)) {
          return "Routing number must be exactly 9 numeric digits (e.g. 060271234)";
        }
        return "";

      default:
        return "";
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If field was previously touched, update or clear inline error in real time
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  }

  function validateAll() {
    const newErrors = {};
    const allFields = [
      "legalBusinessName",
      "businessEntityType",
      "tradeLicenseNumber",
      "tin",
      "bin",
      "authorizedPersonName",
      "designation",
      "nidNumber",
      "accountHolderName",
      "bankName",
      "branchName",
      "accountNumber",
      "routingNumber",
    ];

    allFields.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setTouched(allFields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    return Object.keys(newErrors).length === 0;
  }

  function handleBankSelect(e) {
    const val = e.target.value;
    if (!val) {
      setFormData((prev) => ({
        ...prev,
        institutionId: null,
        bankName: "",
        branchId: null,
        branchName: "",
        branchCode: "",
        routingNumber: "",
        division: "",
        district: "",
        upazila: "",
        branchAddress: "",
      }));
      setIsManualBank(false);
      setIsManualBranch(false);
      setBranches([]);
      setSelectedBranchInfo(null);
      if (touched.bankName) {
        setErrors((prev) => ({ ...prev, bankName: "Please select a bank" }));
      }
      return;
    }

    if (val === "other") {
      setIsManualBank(true);
      setIsManualBranch(true);
      setFormData((prev) => ({
        ...prev,
        institutionId: null,
        bankName: "",
        branchId: null,
        branchName: "",
        branchCode: "",
        routingNumber: "",
        division: "",
        district: "",
        upazila: "",
        branchAddress: "",
      }));
      setBranches([]);
      setSelectedBranchInfo(null);
      return;
    }

    setIsManualBank(false);
    setIsManualBranch(false);
    const selectedInst = institutions.find((i) => String(i.id) === String(val));
    if (selectedInst) {
      setFormData((prev) => ({
        ...prev,
        institutionId: selectedInst.id,
        bankName: selectedInst.name,
        branchId: null,
        branchName: "",
        branchCode: "",
        routingNumber: "",
        division: "",
        district: "",
        upazila: "",
        branchAddress: "",
      }));
      setErrors((prev) => ({ ...prev, bankName: "" }));
      setSelectedBranchInfo(null);
      loadBranches(selectedInst.id);
    }
  }

  function handleBranchSelect(e) {
    const val = e.target.value;
    if (!val) {
      setFormData((prev) => ({
        ...prev,
        branchId: null,
        branchName: "",
        branchCode: "",
        routingNumber: "",
        division: "",
        district: "",
        upazila: "",
        branchAddress: "",
      }));
      setSelectedBranchInfo(null);
      if (touched.branchName) {
        setErrors((prev) => ({ ...prev, branchName: "Please select a branch" }));
      }
      return;
    }

    if (val === "manual") {
      setIsManualBranch(true);
      setFormData((prev) => ({
        ...prev,
        branchId: null,
        branchName: "",
        branchCode: "",
        routingNumber: "",
        division: "",
        district: "",
        upazila: "",
        branchAddress: "",
      }));
      setSelectedBranchInfo(null);
      return;
    }

    const selectedBr = branches.find((b) => String(b.id) === String(val));
    if (selectedBr) {
      setIsManualBranch(false);
      setSelectedBranchInfo(selectedBr);
      setFormData((prev) => ({
        ...prev,
        branchId: selectedBr.id,
        branchName: selectedBr.branch_name,
        branchCode: selectedBr.branch_code || "",
        routingNumber: selectedBr.routing_number || "",
        division: selectedBr.division || "",
        district: selectedBr.district || "",
        upazila: selectedBr.upazila || "",
        branchAddress: selectedBr.address || "",
      }));
      setErrors((prev) => ({ ...prev, branchName: "", routingNumber: "" }));
    }
  }

  async function handleSave(navigateNext = false) {
    if (!validateAll()) {
      setApiError("Please correct the invalid fields highlighted below before proceeding.");
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setApiError("");
      setSuccessMessage("");

      const payload = {
        ...formData,
        institutionId: formData.institutionId ? Number(formData.institutionId) : null,
        branchId: formData.branchId ? Number(formData.branchId) : null,
      };

      await merchantApi.updateKyc(payload);
      await reload();

      setSuccessMessage("KYC information verified and saved successfully.");

      if (navigateNext) {
        navigate("/merchant/onboarding/documents");
      }
    } catch (err) {
      console.error("Failed to save KYC details:", err);
      setApiError(
        err.response?.data?.message || "Failed to save KYC information. Please verify your data and try again."
      );
      window.scrollTo({ top: 180, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  const openIssues = (merchantData?.kycFieldIssues || []).filter((i) => i.status === "open");

  async function handleResubmitCorrection() {
    if (!validateAll()) {
      setApiError("Please correct the invalid fields highlighted below before resubmitting.");
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setApiError("");
      setSuccessMessage("");

      // 1. Save updated KYC data
      const payload = {
        ...formData,
        institutionId: formData.institutionId ? Number(formData.institutionId) : null,
        branchId: formData.branchId ? Number(formData.branchId) : null,
      };
      await merchantApi.updateKyc(payload);

      // 2. Submit correction to notify bank & admin
      await merchantApi.submitCorrection({
        note: "Updated KYC details corrected and resubmitted by merchant.",
      });

      setSuccessMessage("Corrections saved and resubmitted successfully! Your designated bank and compliance team have been notified.");
      if (reload) await reload();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Correction resubmission failed:", err);
      setApiError(err.response?.data?.message || "Failed to resubmit corrections. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6" ref={formTopRef}>
      {/* ====================================================
          TOP STEP TITLE & CONTROLS
      ===================================================== */}
      <div className="rounded-md py-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                04
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                KYC & Compliance Information
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 sm:text-sm">
              Provide your business registration details, identification numbers, and bank profile for regulatory compliance.
            </p>
          </div>

          {/* <button
            type="button"
            onClick={() => setShowMasked((prev) => !prev)}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
          >
            {showMasked ? (
              <>
                <Eye size={15} className="text-emerald-600" />
                <span>Reveal Sensitive Data</span>
              </>
            ) : (
              <>
                <EyeOff size={15} className="text-slate-500" />
                <span>Mask Sensitive Data</span>
              </>
            )}
          </button> */}
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
                  Correction Requested by Compliance / Bank Reviewer
                </h3>
                <p className="mt-0.5 text-sm text-amber-800">
                  Please update the flagged fields below and click "Save & Resubmit Correction". This will immediately notify your designated bank and administrator.
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
              loading={saving}
              onClick={handleResubmitCorrection}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              Save & Resubmit Correction
            </Button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {apiError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ====================================================
          TWO-COLUMN MAIN CONTENT (FORM + RIGHT SIDEBAR)
      ===================================================== */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: MAIN KYC FORM CARDS (8 Cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card 1: Business Registration Details */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Business Registration Details
                </h3>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField
                  label="Legal Entity Business Name"
                  name="legalBusinessName"
                  value={formData.legalBusinessName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Official business name on Trade License"
                  required
                  error={errors.legalBusinessName}
                  disabled={saving}
                  icon={Building2}
                />
              </div>

              <FormField
                label="Business Entity Type"
                name="businessEntityType"
                type="select"
                value={formData.businessEntityType}
                onChange={handleChange}
                onBlur={handleBlur}
                options={BUSINESS_ENTITY_TYPES}
                required
                error={errors.businessEntityType}
                disabled={saving}
              />

              <FormField
                label="Trade License Number"
                name="tradeLicenseNumber"
                value={formData.tradeLicenseNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. TRAD/DNCC/012345/2026"
                required
                error={errors.tradeLicenseNumber}
                disabled={saving}
                icon={FileText}
                
              />

              <FormField
                label="Company Registration Number / RJSC"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. C-123456/2020"
                disabled={saving}
                icon={FileText}
              />

              <FormField
                label="Tax Identification Number (TIN)"
                name="tin"
                type={showMasked ? "password" : "text"}
                inputMode="numeric"
                value={formData.tin}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="12-digit e-TIN number"
                required
                maxLength={12}
                error={errors.tin}
                disabled={saving}
                icon={FileText}
              />

              <div className="sm:col-span-2">
                <FormField
                  label="Business Identification Number (BIN / VAT)"
                  name="bin"
                  type={showMasked ? "password" : "text"}
                  inputMode="numeric"
                  value={formData.bin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9 to 13-digit BIN / VAT number (optional)"
                  error={errors.bin}
                  disabled={saving}
                  icon={FileText}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Authorized Person Information */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Authorized Person Information
                </h3>
                <p className="text-sm text-slate-400">
                  Managing director, partner, or legal signatory
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Authorized Person Name"
                name="authorizedPersonName"
                value={formData.authorizedPersonName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Mohammad Rahat Khan"
                required
                error={errors.authorizedPersonName}
                disabled={saving}
                icon={UserCheck}
                hint="Full name as printed on National ID"
              />

              <FormField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Managing Director / Proprietor / CEO"
                required
                error={errors.designation}
                disabled={saving}
              />

              <div className="sm:col-span-2">
                <FormField
                  label="National ID (NID) Number"
                  name="nidNumber"
                  type={showMasked ? "password" : "text"}
                  inputMode="numeric"
                  value={formData.nidNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10, 13 or 17 digit NID number"
                  required
                  error={errors.nidNumber}
                  disabled={saving}
                  icon={UserCheck}
                  hint="Must be exactly 10 digits (Smart Card), 13 digits, or 17 digits"
                />
              </div>

              <FormField
                label="NID Issue Date (Optional)"
                name="nidIssueDate"
                type="date"
                value={formData.nidIssueDate}
                onChange={handleChange}
                disabled={saving}
                icon={Calendar}
              />

              <FormField
                label="NID Expiry Date (Optional)"
                name="nidExpiryDate"
                type="date"
                value={formData.nidExpiryDate}
                onChange={handleChange}
                disabled={saving}
                icon={Calendar}
              />
            </div>
          </div>

          {/* Card 3: Settlement Bank Information */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Landmark size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Settlement Bank Information
                </h3>
                <p className="text-sm text-slate-400">
                  Real database-linked commercial bank account profile for payment disbursements
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField
                  label="Account Holder Name / Title"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Official registered company / business account title"
                  required
                  error={errors.accountHolderName}
                  disabled={saving}
                  icon={CreditCard}
                  hint="Must match legal entity name or registered proprietor"
                />
              </div>

              {/* Dynamic Bank Selector */}
              <div className="sm:col-span-2">
                {!isManualBank ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold uppercase tracking-wider text-slate-700">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualBank(true);
                          setIsManualBranch(true);
                          setFormData((p) => ({
                            ...p,
                            institutionId: null,
                            bankName: "",
                            branchId: null,
                            branchName: "",
                            branchCode: "",
                            routingNumber: "",
                          }));
                          setBranches([]);
                          setSelectedBranchInfo(null);
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        Bank not listed? Enter manually
                      </button>
                    </div>

                    <div className="relative">
                      <select
                        name="bankSelect"
                        value={formData.institutionId ? String(formData.institutionId) : ""}
                        onChange={handleBankSelect}
                        disabled={saving || loadingInstitutions}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
                          errors.bankName ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
                        }`}
                      >
                        <option value="">
                          {loadingInstitutions
                            ? "Loading verified banks..."
                            : "-- Select Commercial Bank / Institution --"}
                        </option>
                        {institutions.map((inst) => (
                          <option key={inst.id} value={String(inst.id)}>
                            {inst.name} ({inst.institution_type?.toUpperCase() || "BANK"})
                            {inst.branches_count ? ` — ${inst.branches_count} branches` : ""}
                          </option>
                        ))}
                        <option value="other">+ Other Commercial Bank (Manual Entry)</option>
                      </select>
                    </div>
                    {errors.bankName && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.bankName}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold uppercase tracking-wider text-slate-700">
                        Custom Bank Name <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualBank(false);
                          setIsManualBranch(false);
                          setFormData((p) => ({ ...p, bankName: "", institutionId: null }));
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        ← Choose from registered banks
                      </button>
                    </div>
                    <FormField
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Standard Chartered Bank"
                      required
                      error={errors.bankName}
                      disabled={saving}
                      icon={Landmark}
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Branch Selector */}
              <div className="sm:col-span-2">
                {!isManualBranch && formData.institutionId ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold uppercase tracking-wider text-slate-700">
                        Branch Name <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualBranch(true);
                          setFormData((p) => ({
                            ...p,
                            branchId: null,
                            branchName: "",
                            branchCode: "",
                            routingNumber: "",
                          }));
                          setSelectedBranchInfo(null);
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        Branch not found? Enter manually
                      </button>
                    </div>

                    <div className="relative">
                      <select
                        name="branchSelect"
                        value={formData.branchId ? String(formData.branchId) : ""}
                        onChange={handleBranchSelect}
                        disabled={saving || loadingBranches}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
                          errors.branchName ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
                        }`}
                      >
                        <option value="">
                          {loadingBranches
                            ? "Loading verified branches..."
                            : branches.length === 0
                            ? "No branches registered yet for this bank"
                            : "-- Select Branch from Verified List --"}
                        </option>
                        {branches.map((b) => (
                          <option key={b.id} value={String(b.id)}>
                            {b.branch_name} ({b.district || "Branch"}) — Routing: {b.routing_number}
                          </option>
                        ))}
                        <option value="manual">+ Other / Enter Branch Manually</option>
                      </select>
                    </div>
                    {errors.branchName && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.branchName}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold uppercase tracking-wider text-slate-700">
                        Branch Name <span className="text-red-500">*</span>
                      </label>
                      {formData.institutionId && branches.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualBranch(false);
                          }}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          ← Choose from bank branches
                        </button>
                      )}
                    </div>
                    <FormField
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Gulshan Corporate Branch / Principal Branch"
                      required
                      error={errors.branchName}
                      disabled={saving}
                      icon={Building2}
                    />
                  </div>
                )}
              </div>

              {/* Verified Branch Card Preview (Auto-filled Details) */}
              {(formData.branchId || selectedBranchInfo) && (
                <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">
                        ✓
                      </span>
                      <span>Verified Institution Branch Linkage</span>
                    </div>
                    {formData.branchCode && (
                      <span className="font-mono text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                        CODE: {formData.branchCode}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 text-slate-700">
                    <div>
                      <span className="text-slate-400 font-medium">9-Digit Routing:</span>{" "}
                      <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {formData.routingNumber || "Auto-detected"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Location:</span>{" "}
                      <span className="font-semibold text-slate-800">
                        {[formData.upazila, formData.district, formData.division]
                          .filter(Boolean)
                          .join(", ") || "Bangladesh"}
                      </span>
                    </div>
                    {formData.branchAddress && (
                      <div className="sm:col-span-2 text-slate-600">
                        <span className="text-slate-400 font-medium">Address:</span>{" "}
                        {formData.branchAddress}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <FormField
                label="Account Number"
                name="accountNumber"
                type={showMasked ? "password" : "text"}
                value={formData.accountNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 1501203456789001"
                required
                error={errors.accountNumber}
                disabled={saving}
                icon={CreditCard}
                hint="Bank account number (at least 8 digits)"
              />

              <FormField
                label="Routing Number"
                name="routingNumber"
                type="text"
                maxLength={9}
                value={formData.routingNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 060271234"
                required
                error={errors.routingNumber}
                disabled={saving || (!!formData.branchId && !isManualBranch)}
                hint={
                  formData.branchId
                    ? "Auto-filled and verified from branch master database"
                    : "9-digit electronic numeric code (e.g. 060271234)"
                }
              />

              <div className="sm:col-span-2">
                <FormField
                  label="Account Type"
                  name="accountType"
                  type="select"
                  value={formData.accountType}
                  onChange={handleChange}
                  options={ACCOUNT_TYPES}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUPPORT & COMPLIANCE CARDS (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Your Information is Secure (Green Security Card) */}
          <div className="rounded-md border border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-4">
              <ShieldCheck size={22} />
            </div>

            <h4 className="text-base font-bold text-slate-950">
              Your Information is Secure
            </h4>

            <p className="mt-2 text-sm leading-5 text-emerald-950/80">
              All personal and business information is encrypted and stored securely according to regulatory compliance standards. We never share your data with unauthorized third parties.
            </p>
          </div>

          {/* Card 2: Required Documents Checklist */}
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck size={18} className="text-emerald-600" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Required Documents
              </h4>
            </div>

            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Ensure you have scanned or clear photos of the following files ready for Step 5:
            </p>

            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-slate-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-semibold">NID Front Side</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-semibold">NID Back Side</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-semibold">TIN Certificate</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-500">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold">
                  ○
                </span>
                <span>BIN Certificate — <span className="text-[11px] font-medium text-slate-400">Optional</span></span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-semibold">Cancelled Bank Cheque</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  ✓
                </span>
                <span>Trade License</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  ✓
                </span>
                <span>Company Registration (if Ltd/PLC)</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Need Help? */}
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={18} className="text-blue-500" />
              <h4 className="text-sm font-bold text-slate-900">Need Help?</h4>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Having trouble with your KYC information or required document verification?
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

          {/* Card 4: Regulatory Compliance */}
          <div className="rounded-md border border-slate-200/80 bg-slate-50/60 p-6 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Regulatory Compliance
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              We securely manage submitted KYC information according to applicable compliance and data-protection requirements.
            </p>
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
            disabled={saving}
          >
            Save & Exit
          </Button>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/merchant/onboarding/commercial")}
              icon={ArrowLeft}
              disabled={saving}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(false)}
              loading={saving}
              icon={Save}
            >
              Save Draft
            </Button>

            <Button
              type="button"
              variant="primary"
              loading={saving}
              onClick={() => handleSave(true)}
              icon={ArrowRight}
              iconPosition="right"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
