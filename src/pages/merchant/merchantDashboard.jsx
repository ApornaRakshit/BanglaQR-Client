import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Code2,
  CreditCard,
  FileCheck2,
  FileWarning,
  Package,
  ShieldCheck,
  UserRoundCheck,
  Clock,
  Send,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { merchantApi } from "../../services/merchantApi";
import StatusBadge from "../../components/status/StatusBadge";

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await merchantApi.getMe();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to load merchant dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const merchant = data?.merchant;
  const onboarding = data?.onboarding || {};
  const percentage = onboarding.percentage || 0;
  const steps = onboarding.steps || {};
  const isSubmitted =
    merchant?.accountStatus === "submitted" ||
    merchant?.accountStatus === "under_review";
  const isApproved =
    merchant?.accountStatus === "approved" ||
    merchant?.accountStatus === "active";

  const nextOnboardingPath = !steps.company
    ? "/merchant/onboarding/company"
    : !steps.contact
    ? "/merchant/onboarding/contact"
    : !steps.commercial
    ? "/merchant/onboarding/commercial"
    : !steps.kyc
    ? "/merchant/onboarding/kyc"
    : !steps.documents
    ? "/merchant/onboarding/documents"
    : !steps.verification
    ? "/merchant/onboarding/verification"
    : "/merchant/onboarding/review";

  const summaryCards = [
    {
      title: "Account Status",
      value: merchant ? formatStatus(merchant.accountStatus) : "Draft",
      description: isApproved
        ? "Your merchant account is active and verified"
        : isSubmitted
        ? "Application submitted & under compliance review"
        : "Account onboarding in draft mode",
      icon: ShieldCheck,
      iconBox: isApproved
        ? "bg-emerald-50 text-emerald-600"
        : isSubmitted
        ? "bg-blue-50 text-blue-600"
        : "bg-amber-50 text-amber-600",
      valueClass: isApproved
        ? "text-emerald-600"
        : isSubmitted
        ? "text-blue-600"
        : "text-amber-600",
    },
    {
      title: "KYC Status",
      value: merchant ? formatStatus(merchant.kycStatus) : "Pending",
      description:
        merchant?.kycStatus === "approved"
          ? "KYC documents verified successfully"
          : isSubmitted
          ? "KYC documents pending admin verification"
          : "Complete KYC information to submit",
      icon: UserRoundCheck,
      iconBox:
        merchant?.kycStatus === "approved"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-blue-50 text-blue-600",
      valueClass:
        merchant?.kycStatus === "approved"
          ? "text-emerald-600"
          : "text-blue-600",
    },
    {
      title: "Onboarding Progress",
      value: `${percentage}%`,
      description: `${Object.values(steps).filter(Boolean).length} of 6 onboarding sections complete`,
      icon: FileCheck2,
      iconBox: "bg-violet-50 text-violet-600",
      valueClass: "text-slate-950",
    },
    {
      title: "Attached Documents",
      value: `${data?.documents?.length || 0}`,
      description: `${data?.documents?.length || 0} compliance files saved securely`,
      icon: FileText,
      iconBox: "bg-amber-50 text-amber-600",
      valueClass: "text-slate-950",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1480px]">
      {/* =========================================
          HEADER
      ========================================== */}
      <section>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 sm:text-sm">
              <span>Merchant Portal</span>
              <ChevronRight size={14} />
              <span className="text-slate-700 font-semibold">Dashboard</span>
            </div>

            <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              Welcome to your merchant dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your merchant onboarding, KYC status, documents, and payment gateway configuration from one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button
              type="button"
              onClick={() => navigate("/merchant/onboarding/kyc")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:text-sm"
            >
              <FileCheck2 size={17} />
              <span>View KYC</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(nextOnboardingPath)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:text-sm"
            >
              <span>{isSubmitted ? "View Application" : "Continue Onboarding"}</span>
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          SUMMARY CARDS
      ========================================== */}
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:mt-8 2xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      {/* =========================================
          ACTION REQUIRED / ONBOARDING BANNER
      ========================================== */}
      {!isApproved && (
        <section
          className={`mt-5 rounded-md border p-5 shadow-sm sm:mt-6 sm:p-7 transition-all ${
            isSubmitted
              ? "border-blue-200 bg-gradient-to-r from-blue-50 via-white to-white"
              : "border-amber-200 bg-gradient-to-r from-amber-50 via-white to-white"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  isSubmitted
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isSubmitted ? <Clock size={22} /> : <FileWarning size={22} />}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-xs font-bold uppercase tracking-wide ${
                      isSubmitted ? "text-blue-800" : "text-amber-800"
                    }`}
                  >
                    {isSubmitted ? "Application Status" : "Action Required"}
                  </p>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isSubmitted
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isSubmitted ? "Under Review" : `${100 - percentage}% remaining`}
                  </span>
                </div>

                <h2 className="mt-1 text-base font-bold text-slate-950 sm:text-lg">
                  {isSubmitted
                    ? "Your merchant application is under administrative review"
                    : "Complete your merchant onboarding application"}
                </h2>

                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                  {isSubmitted
                    ? "Your submission has been received and is currently being audited by compliance. We will notify you once review is finalized."
                    : "Complete your company profile, authorized contact details, KYC, and required documents to submit your application for review."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(isSubmitted ? "/merchant/onboarding/review" : nextOnboardingPath)}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              <span>{isSubmitted ? "Review Submission" : "Complete Profile"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* =========================================
          MAIN GRID
      ========================================== */}
      <section className="mt-5 grid gap-5 xl:mt-6 xl:grid-cols-3">
        {/* Merchant Setup Step List */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-950 sm:text-lg">
                Merchant Setup
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Your onboarding progress
              </p>
            </div>

            <span className="text-lg font-bold text-emerald-600">
              {percentage}%
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="mt-6 space-y-4">
            <SetupStep
              number="01"
              title="Company Information"
              description="Business registration & physical address"
              completed={Boolean(steps.company)}
              onClick={() => navigate("/merchant/onboarding/company")}
            />

            <SetupStep
              number="02"
              title="Contact Information"
              description="Authorized contact representative details"
              completed={Boolean(steps.contact)}
              onClick={() => navigate("/merchant/onboarding/contact")}
            />

            <SetupStep
              number="03"
              title="Commercial Details"
              description="Volume projections & return URLs"
              completed={Boolean(steps.commercial)}
              onClick={() => navigate("/merchant/onboarding/commercial")}
            />

            <SetupStep
              number="04"
              title="KYC & Compliance"
              description="National ID, TIN, BIN & bank account"
              completed={Boolean(steps.kyc)}
              onClick={() => navigate("/merchant/onboarding/kyc")}
            />

            <SetupStep
              number="05"
              title="Document Upload"
              description="Verification licenses & cheques"
              completed={Boolean(steps.documents)}
              onClick={() => navigate("/merchant/onboarding/documents")}
            />

            <SetupStep
              number="06"
              title="Channel Verification"
              description="Email & mobile OTP verification"
              completed={Boolean(steps.verification)}
              onClick={() => navigate("/merchant/onboarding/verification")}
            />

            <SetupStep
              number="07"
              title="Review & Submission"
              description="Final compliance submission"
              completed={isSubmitted}
              warning={!isSubmitted && percentage >= 85}
              onClick={() => navigate("/merchant/onboarding/review")}
            />
          </div>
        </div>

        {/* Security and Quick Overview */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-950 sm:text-lg">
                Merchant Profile Overview
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Identity details currently on record for this merchant account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/merchant/onboarding/company")}
              className="shrink-0 text-xs font-semibold text-emerald-600 hover:text-emerald-700 sm:text-sm"
            >
              Update info
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Company Name
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {data?.profile?.companyName || "Not configured yet"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {data?.profile?.businessType || "Entity Type Pending"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Authorized Contact
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {data?.contact?.name || "Not configured yet"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {data?.contact?.email || data?.verification?.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Settlement Bank
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {data?.kyc?.bankName || "Not configured yet"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {data?.kyc?.bankAccountName || "Account Title Pending"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Merchant Code
              </p>
              <p className="mt-1 text-sm font-bold font-mono text-emerald-700">
                {merchant?.merchantCode || "BQR-PENDING"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Created on {new Date(merchant?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-emerald-950">
                  BanglaQR Multi-Gateway Architecture
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  BanglaQR connects your merchant profile to authorized external payment gateways without holding customer funds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          QUICK ACTIONS
      ========================================== */}
      <section className="mt-6 pb-8">
        <div>
          <h2 className="text-base font-bold text-slate-950 sm:text-lg">
            Quick Actions
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Direct shortcuts to merchant onboarding sections.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            icon={Building2}
            title="Company Profile"
            description="Update registered business details"
            onClick={() => navigate("/merchant/onboarding/company")}
          />

          <QuickAction
            icon={FileCheck2}
            title="KYC & Compliance"
            description="Manage legal entity & bank credentials"
            onClick={() => navigate("/merchant/onboarding/kyc")}
          />

          <QuickAction
            icon={FileText}
            title="Documents Vault"
            description="Upload & replace verification documents"
            onClick={() => navigate("/merchant/onboarding/documents")}
          />

          <QuickAction
            icon={ShieldCheck}
            title="Review & Submit"
            description="Check completeness & submit for approval"
            onClick={() => navigate("/merchant/onboarding/review")}
          />
        </div>
      </section>
    </div>
  );
}

function formatStatus(status) {
  if (!status) return "Draft";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function SummaryCard({ title, value, description, icon: Icon, iconBox, valueClass }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h2 className={`mt-3 text-2xl font-bold tracking-tight sm:text-[26px] ${valueClass}`}>
            {value}
          </h2>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBox}`}>
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
          <Icon size={19} />
        </div>
        <ArrowUpRight
          size={17}
          className="text-slate-400 transition group-hover:text-emerald-600"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </button>
  );
}

function SetupStep({ number, title, description, completed = false, warning = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
          completed
            ? "bg-emerald-100 text-emerald-700"
            : warning
            ? "bg-amber-100 text-amber-800"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {completed ? <CheckCircle2 size={16} /> : number}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          {completed && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Completed
            </span>
          )}
          {warning && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Ready
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500 truncate">{description}</p>
      </div>
    </div>
  );
}