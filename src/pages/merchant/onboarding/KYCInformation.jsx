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

const POPULAR_BANKS = [
  { value: "", label: "Select Bank" },
  { value: "BRAC Bank PLC", label: "BRAC Bank PLC" },
  { value: "The City Bank Limited", label: "The City Bank Limited" },
  { value: "Eastern Bank PLC (EBL)", label: "Eastern Bank PLC (EBL)" },
  { value: "Dutch-Bangla Bank Limited (DBBL)", label: "Dutch-Bangla Bank Limited (DBBL)" },
  { value: "Islami Bank Bangladesh PLC", label: "Islami Bank Bangladesh PLC" },
  { value: "Mutual Trust Bank PLC (MTB)", label: "Mutual Trust Bank PLC (MTB)" },
  { value: "United Commercial Bank PLC (UCB)", label: "United Commercial Bank PLC (UCB)" },
  { value: "Prime Bank PLC", label: "Prime Bank PLC" },
  { value: "Standard Chartered Bank", label: "Standard Chartered Bank" },
  { value: "HSBC Bangladesh", label: "HSBC Bangladesh" },
  { value: "Sonali Bank PLC", label: "Sonali Bank PLC" },
  { value: "Other", label: "Other Commercial Bank" },
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
    bankName: "",
    branchName: "",
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "Current",
  });

  const [showMasked, setShowMasked] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (merchantData?.kyc) {
      setFormData({
        legalBusinessName: merchantData.kyc.legalBusinessName || "",
        businessEntityType: merchantData.kyc.businessEntityType || merchantData.profile?.businessType || "Private Limited Company",
        tradeLicenseNumber: merchantData.kyc.tradeLicenseNumber || "",
        registrationNumber: merchantData.kyc.registrationNumber || "",
        tin: merchantData.kyc.tin || "",
        bin: merchantData.kyc.bin || "",
        authorizedPersonName: merchantData.kyc.authorizedPersonName || merchantData.contact?.name || "",
        designation: merchantData.kyc.designation || merchantData.contact?.designation || "",
        nidNumber: merchantData.kyc.nidNumber || "",
        nidIssueDate: merchantData.kyc.nidIssueDate || "",
        nidExpiryDate: merchantData.kyc.nidExpiryDate || "",
        bankName: merchantData.kyc.bankName || "",
        branchName: merchantData.kyc.branchName || "",
        accountHolderName: merchantData.kyc.accountHolderName || merchantData.kyc.legalBusinessName || merchantData.profile?.companyName || "",
        accountNumber: merchantData.kyc.accountNumber || "",
        routingNumber: merchantData.kyc.routingNumber || "",
        accountType: merchantData.kyc.accountType || "Current",
      });
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
  }, [merchantData]);

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

      await merchantApi.updateKyc(formData);
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

  return (
    <div className="space-y-6" ref={formTopRef}>
      {/* ====================================================
          TOP STEP TITLE & CONTROLS
      ===================================================== */}
      <div className="rounded-md py-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                04
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                KYC & Compliance Information
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Provide your business registration details, identification numbers, and bank profile for regulatory compliance.
            </p>
          </div>

          {/* <button
            type="button"
            onClick={() => setShowMasked((prev) => !prev)}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
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

      {/* Notifications */}
      {apiError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 animate-fadeIn">
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
                <p className="text-xs text-slate-400">
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
                <p className="text-xs text-slate-400">
                  Commercial bank account profile for payment gateway disbursements
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

              <FormField
                label="Bank Name"
                name="bankName"
                type="select"
                value={formData.bankName}
                onChange={handleChange}
                onBlur={handleBlur}
                options={POPULAR_BANKS}
                required
                error={errors.bankName}
                disabled={saving}
                icon={Landmark}
              />

              <FormField
                label="Branch Name"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Gulshan Branch / Principal Branch"
                required
                error={errors.branchName}
                disabled={saving}
              />

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
                disabled={saving}
                hint="9-digit electronic numeric code (e.g. 060271234)"
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

            <p className="mt-2 text-xs leading-5 text-emerald-950/80">
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

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Ensure you have scanned or clear photos of the following files ready for Step 5:
            </p>

            <ul className="space-y-2.5 text-xs">
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

            <p className="text-xs text-slate-500 leading-relaxed">
              Having trouble with your KYC information or required document verification?
            </p>

            <button
              type="button"
              onClick={() => navigate("/merchant/support")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition cursor-pointer"
            >
              <span>Contact Support</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 4: Regulatory Compliance */}
          <div className="rounded-md border border-slate-200/80 bg-slate-50/60 p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Regulatory Compliance
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
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
