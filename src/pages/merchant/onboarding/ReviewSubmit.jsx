import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  BarChart3,
  ShieldCheck,
  FileCheck2,
  Check,
  Edit3,
  Send,
  ArrowLeft,
  Eye,
  HelpCircle,
  Phone,
  Mail,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/status/StatusBadge";
import DocumentPreviewModal from "../../../components/documents/DocumentPreviewModal";
import { merchantApi } from "../../../services/merchantApi";

function maskSensitive(val, visibleDigits = 4) {
  if (!val) return "—";
  const str = String(val).trim();
  if (str.length <= visibleDigits) return str;
  const maskedLength = str.length - visibleDigits;
  return "•".repeat(Math.min(maskedLength, 8)) + str.slice(-visibleDigits);
}

export default function ReviewSubmit() {
  const navigate = useNavigate();
  const { merchantData, reload, isSubmitted } = useOutletContext();

  const [showSensitive, setShowSensitive] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const merchant = merchantData?.merchant || {};
  const profile = merchantData?.profile || {};
  const contact = merchantData?.contact || {};
  const commercial = merchantData?.commercial || {};
  const kyc = merchantData?.kyc || {};
  const documents = merchantData?.documents || [];
  const verification = merchantData?.verification || {};
  const onboarding = merchantData?.onboarding || {};
  const docChecklist = onboarding?.docChecklist || {};

  // Check mandatory document existence
  const uploadedDocTypes = documents.map((d) => d.documentType);
  const hasNidFront = uploadedDocTypes.includes("NID_FRONT");
  const hasNidBack = uploadedDocTypes.includes("NID_BACK");
  const hasTin = uploadedDocTypes.includes("TIN_CERTIFICATE");
  const hasCheque = uploadedDocTypes.includes("CANCELLED_BANK_CHEQUE");
  const hasBin = uploadedDocTypes.includes("BIN_CERTIFICATE");

  const requiredDocsCount = [hasNidFront, hasNidBack, hasTin, hasCheque].filter(Boolean).length;
  const isRequiredDocsComplete = requiredDocsCount === 4;

  const isCompanyComplete = Boolean(profile.companyName && profile.companyName.trim().length >= 2);
  const isContactComplete = Boolean(contact.name && contact.email && contact.phone);
  const isCommercialComplete = Boolean(commercial.transactionsPerDay !== undefined || commercial.returnUrl !== undefined);
  const isKycComplete = Boolean(
    kyc.legalBusinessName &&
    kyc.tradeLicenseNumber &&
    kyc.tin &&
    kyc.authorizedPersonName &&
    kyc.nidNumber &&
    kyc.bankName &&
    kyc.accountNumber &&
    kyc.routingNumber
  );
  const isEmailVerified = Boolean(verification.emailVerified);
  const isPhoneVerified = Boolean(verification.phoneVerified);

  // Application Readiness Checklist Items
  const checklist = [
    {
      id: "company",
      label: "Company Information",
      completed: isCompanyComplete,
      path: "/merchant/onboarding/company",
      detail: profile.companyName ? profile.companyName : "Missing company name",
    },
    {
      id: "contact",
      label: "Contact Information",
      completed: isContactComplete,
      path: "/merchant/onboarding/contact",
      detail: contact.name ? `${contact.name} (${contact.phone})` : "Missing contact details",
    },
    {
      id: "commercial",
      label: "Commercial Details",
      completed: isCommercialComplete,
      path: "/merchant/onboarding/commercial",
      detail: `Max ticket: ৳${(commercial.maximumTicketSize || 0).toLocaleString()}`,
    },
    {
      id: "kyc",
      label: "KYC & Compliance",
      completed: isKycComplete,
      path: "/merchant/onboarding/kyc",
      detail: kyc.legalBusinessName ? `Lic: ${kyc.tradeLicenseNumber || "—"}` : "Missing KYC registration",
    },
    {
      id: "documents",
      label: "Required Documents",
      completed: isRequiredDocsComplete,
      path: "/merchant/onboarding/documents",
      detail: `${requiredDocsCount} / 4 Mandatory Uploaded`,
    },
    {
      id: "email_ver",
      label: "Email Verification (Optional)",
      completed: true,
      path: "/merchant/onboarding/verification",
      detail: isEmailVerified ? "Verified" : "Optional for submission",
    },
    {
      id: "phone_ver",
      label: "Mobile Verification (Optional)",
      completed: true,
      path: "/merchant/onboarding/verification",
      detail: isPhoneVerified ? "Verified" : "Optional for submission",
    },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const readinessPercentage = Math.round((completedCount / totalCount) * 100);
  const isApplicationReady = completedCount === totalCount;

  async function handleFinalSubmit() {
    if (!declarationChecked) {
      setSubmitError("Please confirm the accuracy declaration before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      await merchantApi.submitApplication();
      await reload();

      setSubmitSuccess(true);
      setConfirmModalOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError(
        err.response?.data?.message || "Failed to submit merchant application. Please ensure all steps are completed."
      );
      setConfirmModalOpen(false);
      window.scrollTo({ top: 100, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  const isAlreadySubmitted = isSubmitted || submitSuccess || merchant.accountStatus === "submitted" || merchant.accountStatus === "under_review";

  return (
    <div className="space-y-6">
      {/* ====================================================
          TOP STEP TITLE & SENSITIVE DATA TOGGLE
      ===================================================== */}
      <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                07
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Review your merchant application
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 sm:text-sm">
              Please review your information carefully before submitting your application for verification.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* <button
              type="button"
              onClick={() => setShowSensitive((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              {showSensitive ? (
                <>
                  <EyeOff size={15} className="text-slate-500" />
                  <span>Mask Sensitive Data</span>
                </>
              ) : (
                <>
                  <Eye size={15} className="text-emerald-600" />
                  <span>Reveal Sensitive Data</span>
                </>
              )}
            </button> */}

            <StatusBadge
              status={
                isAlreadySubmitted
                  ? "Under Review"
                  : isApplicationReady
                  ? "Ready to Submit"
                  : "Application Incomplete"
              }
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {submitError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* ====================================================
          SUBMITTED / SUCCESS STATE BANNER
      ===================================================== */}
      {isAlreadySubmitted && (
        <div className="rounded-md border border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-white p-6 sm:p-8 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <CheckCircle2 size={30} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-950 sm:text-xl">
                Application Submitted Successfully
              </h3>
              <p className="mt-1 text-sm sm:text-sm text-slate-600 leading-relaxed">
                Your merchant application has been submitted successfully and is now awaiting review. Our compliance and verification team will inspect your documentation.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-emerald-200/80 bg-white/80 p-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Application Status
                  </p>
                  <p className="font-bold text-emerald-800 mt-0.5">Submitted / Under Review</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    KYC Status
                  </p>
                  <p className="font-bold text-amber-700 mt-0.5">Pending Review</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Merchant Code / App ID
                  </p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    {merchant.merchantCode || "MRC-PENDING"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Submitted At
                  </p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {merchant.submittedAt
                      ? new Date(merchant.submittedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Today"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate("/merchant/dashboard")}
                >
                  Go to Merchant Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TWO-COLUMN MAIN CONTENT
      ===================================================== */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: DETAILED SUMMARY CARDS (8 Cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card 1: Company Information Summary */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Building2 size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    01. Company Information
                  </h3>
                  <p className="text-sm text-slate-400">Official business profile & location</p>
                </div>
              </div>

              {!isAlreadySubmitted && (
                <button
                  type="button"
                  onClick={() => navigate("/merchant/onboarding/company")}
                  className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Company Name
                </p>
                <p className="font-bold text-slate-900 mt-1">{profile.companyName || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Business Entity Type
                </p>
                <p className="font-medium text-slate-800 mt-1">{profile.businessType || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Industry / Category
                </p>
                <p className="font-medium text-slate-800 mt-1">{profile.industry || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Official Website
                </p>
                <p className="font-medium text-slate-800 mt-1 truncate">
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  City / State
                </p>
                <p className="font-medium text-slate-800 mt-1">
                  {profile.city || "—"}, {profile.state || ""}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Postal Code & Country
                </p>
                <p className="font-medium text-slate-800 mt-1">
                  {profile.postalCode || "—"} ({profile.country || "Bangladesh"})
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Registered Address
                </p>
                <p className="font-medium text-slate-800 mt-1">{profile.address || "—"}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Contact Information Summary */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <User size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    02. Contact Information
                  </h3>
                  <p className="text-sm text-slate-400">Authorized contact person</p>
                </div>
              </div>

              {!isAlreadySubmitted && (
                <button
                  type="button"
                  onClick={() => navigate("/merchant/onboarding/contact")}
                  className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Contact Person
                </p>
                <p className="font-bold text-slate-900 mt-1">{contact.name || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Designation
                </p>
                <p className="font-medium text-slate-800 mt-1">{contact.designation || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </p>
                <p className="font-medium text-slate-800 mt-1 truncate">{contact.email || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Phone Number
                </p>
                <p className="font-medium text-slate-800 mt-1">{contact.phone || "—"}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Commercial Details Summary */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <BarChart3 size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    03. Commercial & Technical Details
                  </h3>
                  <p className="text-sm text-slate-400">Volume expectations & API parameters</p>
                </div>
              </div>

              {!isAlreadySubmitted && (
                <button
                  type="button"
                  onClick={() => navigate("/merchant/onboarding/commercial")}
                  className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Transactions / Day
                </p>
                <p className="font-bold text-slate-900 mt-1">
                  {(commercial.transactionsPerDay || 0).toLocaleString()} txns
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Transactions / Month
                </p>
                <p className="font-bold text-slate-900 mt-1">
                  {(commercial.transactionsPerMonth || 0).toLocaleString()} txns
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Max Ticket Size
                </p>
                <p className="font-bold text-emerald-700 mt-1">
                  ৳{(commercial.maximumTicketSize || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Volume / Month
                </p>
                <p className="font-bold text-slate-900 mt-1">
                  ৳{(commercial.volumePerMonth || 0).toLocaleString()}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Payment Return URL
                </p>
                <p className="font-medium text-slate-800 mt-1 truncate">
                  {commercial.returnUrl || "Not configured"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Merchant Domain
                </p>
                <p className="font-medium text-slate-800 mt-1 truncate">
                  {commercial.merchantDomain || "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Server IP Whitelist
                </p>
                <p className="font-mono font-medium text-slate-800 mt-1">
                  {commercial.merchantIpAddress || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: KYC & Compliance Summary */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    04. KYC & Settlement Bank Profile
                  </h3>
                  <p className="text-sm text-slate-400">Business registration & bank account profile</p>
                </div>
              </div>

              {!isAlreadySubmitted && (
                <button
                  type="button"
                  onClick={() => navigate("/merchant/onboarding/kyc")}
                  className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Legal Entity Name
                </p>
                <p className="font-bold text-slate-900 mt-1">{kyc.legalBusinessName || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Business Entity Type
                </p>
                <p className="font-medium text-slate-800 mt-1">{kyc.businessEntityType || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Trade License Number
                </p>
                <p className="font-mono font-medium text-slate-800 mt-1">
                  {kyc.tradeLicenseNumber || "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tax ID (TIN)
                </p>
                <p className="font-mono font-bold text-slate-900 mt-1">
                  {showSensitive ? kyc.tin || "—" : maskSensitive(kyc.tin, 3)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  BIN / VAT Number
                </p>
                <p className="font-mono font-medium text-slate-800 mt-1">
                  {kyc.bin ? (showSensitive ? kyc.bin : maskSensitive(kyc.bin, 3)) : "Optional (None)"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  RJSC Reg Number
                </p>
                <p className="font-mono font-medium text-slate-800 mt-1">
                  {kyc.registrationNumber || "Optional"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Authorized Person
                </p>
                <p className="font-bold text-slate-900 mt-1">
                  {kyc.authorizedPersonName || "—"} ({kyc.designation || "Signatory"})
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  National ID (NID)
                </p>
                <p className="font-mono font-bold text-slate-900 mt-1">
                  {showSensitive ? kyc.nidNumber || "—" : maskSensitive(kyc.nidNumber, 4)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Settlement Bank
                </p>
                <p className="font-bold text-slate-900 mt-1">{kyc.bankName || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Branch Name
                </p>
                <p className="font-medium text-slate-800 mt-1">{kyc.branchName || "—"}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bank Account Number
                </p>
                <p className="font-mono font-bold text-slate-900 mt-1">
                  {showSensitive ? kyc.accountNumber || "—" : maskSensitive(kyc.accountNumber, 4)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Routing Code & Type
                </p>
                <p className="font-mono font-medium text-slate-800 mt-1">
                  {kyc.routingNumber || "—"} ({kyc.accountType || "Current"})
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Verification Documents Summary */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FileCheck2 size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    05. Verification Documents
                  </h3>
                  <p className="text-sm text-slate-400">Mandatory and optional uploaded certificates</p>
                </div>
              </div>

              {!isAlreadySubmitted && (
                <button
                  type="button"
                  onClick={() => navigate("/merchant/onboarding/documents")}
                  className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {[
                { type: "NID_FRONT", title: "NID Front Side", required: true },
                { type: "NID_BACK", title: "NID Back Side", required: true },
                { type: "TIN_CERTIFICATE", title: "e-TIN Certificate", required: true },
                { type: "CANCELLED_BANK_CHEQUE", title: "Cancelled Bank Cheque", required: true },
                { type: "BIN_CERTIFICATE", title: "BIN / VAT Certificate", required: false },
              ].map((docItem) => {
                const uploaded = documents.find((d) => d.documentType === docItem.type);
                const downloadUrl = uploaded ? `/api/v1/merchants/me/documents/${uploaded.id}/view` : null;

                return (
                  <div
                    key={docItem.type}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          uploaded ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {uploaded ? <Check size={14} /> : "○"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 truncate">{docItem.title}</p>
                          {docItem.required ? (
                            <span className="text-[10px] font-bold text-emerald-700">Required</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Optional</span>
                          )}
                        </div>

                        {uploaded && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {uploaded.originalFilename || uploaded.documentName} ·{" "}
                            {(uploaded.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(uploaded)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Preview</span>
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-amber-600">
                          {docItem.required ? "Missing" : "Not Provided"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 6: Contact Verification Summary */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    06. Contact Verification
                  </h3>
                  <p className="text-sm text-slate-400">Two-channel confirmation status</p>
                </div>
              </div>

              {!isAlreadySubmitted && (
                <button
                  type="button"
                  onClick={() => navigate("/merchant/onboarding/verification")}
                  className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail size={16} className="text-slate-500" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{verification.email || contact.email || "Email"}</p>
                    <p className="text-[11px] text-slate-400">Primary contact channel</p>
                  </div>
                </div>
                <StatusBadge status={isEmailVerified ? "Verified" : "Unverified"} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Phone size={16} className="text-slate-500" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{verification.phone || contact.phone || "Phone"}</p>
                    <p className="text-[11px] text-slate-400">Two-factor & SMS alerts</p>
                  </div>
                </div>
                <StatusBadge status={isPhoneVerified ? "Verified" : "Unverified"} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: READINESS SUMMARY & SUBMISSION (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Application Readiness Summary */}
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Application Readiness
                </p>
                <h4 className="text-base font-bold text-slate-950 mt-0.5">
                  {isApplicationReady ? "100% Application Ready" : `${readinessPercentage}% Complete`}
                </h4>
              </div>

              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold ${
                  isApplicationReady
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {readinessPercentage}%
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-5">
              <div
                className={`h-full transition-all duration-300 ${
                  isApplicationReady ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${readinessPercentage}%` }}
              />
            </div>

            <ul className="space-y-3 text-sm">
              {checklist.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{item.label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.detail}</p>
                  </div>

                  {item.completed ? (
                    <span className="flex items-center gap-1 font-bold text-emerald-600 shrink-0">
                      <Check size={14} /> Ready
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline shrink-0"
                    >
                      Complete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Regulatory Review Notice */}
          <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white mb-3 shadow-md shadow-emerald-600/20">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-950">
              Compliance & Audit Review
            </h4>
            <p className="mt-1.5 text-sm leading-5 text-emerald-950/80">
              Upon submission, your application will be queued for compliance review. No payment processing credentials will be activated until official verification is finalized.
            </p>
          </div>

          {/* Card 3: Need Help? */}
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={18} className="text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Questions?</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              If you have any doubts about required KYC documentation, reach out to our merchant support team.
            </p>
            <button
              type="button"
              onClick={() => navigate("/merchant/support")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-600 transition cursor-pointer"
            >
              <span>Contact Support</span>
              <ArrowLeft size={14} className="rotate-180" />
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
              onClick={() => navigate("/merchant/onboarding/verification")}
              icon={ArrowLeft}
            >
              Previous
            </Button>

            {!isAlreadySubmitted ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={!isApplicationReady}
                onClick={() => setConfirmModalOpen(true)}
                icon={Send}
              >
                Submit Merchant Application
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={() => navigate("/merchant/dashboard")}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================
          CONFIRMATION MODAL WITH MANDATORY DECLARATION CHECKBOX
      ===================================================== */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4">
              <Send size={24} />
            </div>

            <h3 className="text-lg font-bold text-slate-950 sm:text-xl">
              Submit Merchant Application?
            </h3>

            <p className="mt-2 text-sm leading-5 text-slate-500 sm:text-sm">
              Please confirm that the information and documents you provided are accurate and complete. After submission, your application will be sent to the BanglaQR review team.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-800 leading-relaxed">
                  I confirm that the information provided is accurate and belongs to my business.
                </span>
              </label>
            </div>

            {submitError && (
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600">
                <AlertCircle size={15} />
                <span>{submitError}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmModalOpen(false);
                  setDeclarationChecked(false);
                  setSubmitError("");
                }}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                loading={submitting}
                disabled={!declarationChecked}
                onClick={handleFinalSubmit}
                icon={Send}
              >
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SECURE DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        doc={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
