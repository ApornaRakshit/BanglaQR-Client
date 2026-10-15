import { useEffect, useState, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Building2,
  Phone,
  BarChart3,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Lock,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

const ONBOARDING_STEPS = [
  {
    id: 1,
    key: "company",
    label: "Company",
    path: "/merchant/onboarding/company",
    icon: Building2,
    description: "Business profile & location",
  },
  {
    id: 2,
    key: "contact",
    label: "Contact",
    path: "/merchant/onboarding/contact",
    icon: Phone,
    description: "Authorized contact person",
  },
  {
    id: 3,
    key: "commercial",
    label: "Commercial",
    path: "/merchant/onboarding/commercial",
    icon: BarChart3,
    description: "Volume & technical endpoints",
  },
  {
    id: 4,
    key: "kyc",
    label: "KYC",
    path: "/merchant/onboarding/kyc",
    icon: ShieldCheck,
    description: "Registration & bank details",
  },
  {
    id: 5,
    key: "documents",
    label: "Documents",
    path: "/merchant/onboarding/documents",
    icon: FileCheck2,
    description: "Identity & proof uploads",
  },
  {
    id: 6,
    key: "verification",
    label: "Verification",
    path: "/merchant/onboarding/verification",
    icon: CheckCircle2,
    description: "Email & mobile OTP",
  },
  {
    id: 7,
    key: "review",
    label: "Review",
    path: "/merchant/onboarding/review",
    icon: FileText,
    description: "Final verification & submit",
  },
];

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [merchantData, setMerchantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMerchantData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getMe();
      if (res.success) {
        setMerchantData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch merchant onboarding details:", err);
      setError(err.response?.data?.message || "Failed to load onboarding information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchantData();
  }, [fetchMerchantData]);

  // Current step index based on location pathname
  const currentStepIndex = ONBOARDING_STEPS.findIndex((s) =>
    location.pathname.startsWith(s.path)
  );

  const activeStep = ONBOARDING_STEPS[currentStepIndex] || ONBOARDING_STEPS[0];
  const isSubmitted =
    merchantData?.merchant?.accountStatus === "submitted" ||
    merchantData?.merchant?.accountStatus === "under_review" ||
    merchantData?.merchant?.accountStatus === "approved" ||
    merchantData?.merchant?.accountStatus === "active";

  // Enforce sequential step completion: Cannot jump ahead to later steps without completing previous requirements
  useEffect(() => {
    if (!merchantData || isSubmitted) return;

    const steps = merchantData?.onboarding?.steps || {};
    // Step prerequisites mapping
    // Step 2 (contact) requires Step 1 (company)
    // Step 3 (commercial) requires Step 2 (contact)
    // Step 4 (kyc) requires Step 2 (contact)
    // Step 5 (documents) requires Step 4 (kyc)
    // Step 7 (review) requires Step 5 (documents)
    const pathname = location.pathname;

    if (pathname.includes("/onboarding/contact") && !steps.company) {
      navigate("/merchant/onboarding/company", { replace: true });
    } else if (pathname.includes("/onboarding/commercial") && (!steps.company || !steps.contact)) {
      navigate(!steps.company ? "/merchant/onboarding/company" : "/merchant/onboarding/contact", { replace: true });
    } else if (pathname.includes("/onboarding/kyc") && (!steps.company || !steps.contact)) {
      navigate(!steps.company ? "/merchant/onboarding/company" : "/merchant/onboarding/contact", { replace: true });
    } else if (pathname.includes("/onboarding/documents") && (!steps.company || !steps.contact || !steps.kyc)) {
      if (!steps.company) navigate("/merchant/onboarding/company", { replace: true });
      else if (!steps.contact) navigate("/merchant/onboarding/contact", { replace: true });
      else if (!steps.kyc) navigate("/merchant/onboarding/kyc", { replace: true });
    } else if (pathname.includes("/onboarding/review") && (!steps.company || !steps.contact || !steps.kyc || !steps.documents)) {
      if (!steps.company) navigate("/merchant/onboarding/company", { replace: true });
      else if (!steps.contact) navigate("/merchant/onboarding/contact", { replace: true });
      else if (!steps.kyc) navigate("/merchant/onboarding/kyc", { replace: true });
      else if (!steps.documents) navigate("/merchant/onboarding/documents", { replace: true });
    }
  }, [location.pathname, merchantData, isSubmitted, navigate]);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* ====================================================
          ONBOARDING HEADER
      ===================================================== */}
     

      {/* ====================================================
          BANNER IF APPLICATION IS ALREADY SUBMITTED
      ===================================================== */}
      {isSubmitted && (
        <div className="rounded-md border border-blue-200 bg-blue-50/70 p-4 sm:p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Lock size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-blue-900">
              Application Under Review
            </h3>
            <p className="mt-1 text-sm leading-5 text-blue-700 sm:text-sm">
              Your merchant onboarding application was submitted on{" "}
              <span className="font-semibold">
                {merchantData?.merchant?.submittedAt
                  ? new Date(merchantData.merchant.submittedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "recently"}
              </span>
              . Our compliance team is currently reviewing your application. You can view all information below.
            </p>
          </div>
        </div>
      )}

      {/* ====================================================
          CURRENT STEP CONTENT (OUTLET)
      ===================================================== */}
      {loading && !merchantData ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-slate-200 bg-white p-12 text-center">
          <Loader2 className="animate-spin text-emerald-600 mb-4" size={36} />
          <h3 className="text-base font-bold text-slate-800">Loading your application details...</h3>
          <p className="text-sm text-slate-400 mt-1">Please wait a moment while we retrieve your progress.</p>
        </div>
      ) : error ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md border border-red-200 bg-red-50/50 p-8 text-center">
          <AlertCircle className="text-red-500 mb-3" size={32} />
          <h3 className="text-sm font-bold text-red-800">Unable to load merchant data</h3>
          <p className="text-sm text-red-600 mt-1 max-w-md">{error}</p>
          <button
            onClick={fetchMerchantData}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <Outlet
          context={{
            merchantData,
            loading,
            reload: fetchMerchantData,
            isSubmitted,
          }}
        />
      )}
    </div>
  );
}

