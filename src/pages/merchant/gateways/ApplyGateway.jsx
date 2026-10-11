import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  CreditCard,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  FileText,
  AlertCircle,
  Loader2,
  Building2,
  Send,
  HelpCircle,
  Check,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/forms/FormField";
import { merchantApi } from "../../../services/merchantApi";

export default function ApplyGateway() {
  const { gatewayId } = useParams();
  const navigate = useNavigate();

  const [gateway, setGateway] = useState(null);
  const [merchantData, setMerchantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Form Fields
  const [expectedMonthlyVolume, setExpectedMonthlyVolume] = useState("100000");
  const [expectedDailyTxns, setExpectedDailyTxns] = useState("50");
  const [purposeOfUse, setPurposeOfUse] = useState("E-commerce & Retail QR Acceptance");
  const [integrationTimeline, setIntegrationTimeline] = useState("Immediate");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setApiError("");
        const [gRes, mRes] = await Promise.all([
          merchantApi.getGatewayById(gatewayId),
          merchantApi.getMe(),
        ]);

        if (gRes.success) setGateway(gRes.data);
        if (mRes.success) setMerchantData(mRes.data);
      } catch (err) {
        console.error("Failed to load gateway application data:", err);
        setApiError("Unable to load gateway application form.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [gatewayId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!termsAgreed) {
      setApiError("Please acknowledge and agree to the gateway compliance terms before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setApiError("");
      const res = await merchantApi.applyGateway(gatewayId, {
        expectedMonthlyVolume,
        expectedDailyTxns,
        purposeOfUse,
        integrationTimeline,
        notes,
      });

      if (res.success) {
        navigate("/merchant/applications", {
          state: { successMessage: `Application for ${gateway.name} submitted successfully!` },
        });
      }
    } catch (err) {
      console.error("Apply gateway error:", err);
      setApiError(
        err.response?.data?.message ||
          "Failed to submit gateway application. Please check your data and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-200 bg-white">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="mt-3 text-sm font-medium text-slate-500">Preparing application form...</p>
      </div>
    );
  }

  if (!gateway) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/merchant/gateways")} icon={ArrowLeft}>
          Back to Catalogue
        </Button>
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <AlertCircle size={22} className="shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Service Unavailable</h4>
            <p className="text-xs mt-0.5">Could not load the requested gateway service.</p>
          </div>
        </div>
      </div>
    );
  }

  const profile = merchantData?.profile || {};
  const merchant = merchantData?.merchant || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/merchant/gateways/${gatewayId}`)}
          icon={ArrowLeft}
          className="mb-4"
        >
          Back to Details
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200/80 p-2 text-slate-700">
            {gateway.logoUrl ? (
              <img src={gateway.logoUrl} alt={gateway.name} className="h-full w-full object-contain" />
            ) : (
              <CreditCard size={28} />
            )}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Gateway Service Application
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl mt-0.5">
              Apply for {gateway.name}
            </h1>
            <p className="text-xs text-slate-500">
              Submit your merchant commercial details for gateway compliance onboarding & credential issuance.
            </p>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Merchant Summary Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 size={16} className="text-emerald-600" />
            Merchant Profile Information
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <span className="text-slate-400">Business / Company Name:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{profile.companyName || "N/A"}</p>
            </div>
            <div>
              <span className="text-slate-400">Merchant Code:</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{merchant.merchantCode || "N/A"}</p>
            </div>
            <div>
              <span className="text-slate-400">Business Type:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{profile.businessType || "Retail / Services"}</p>
            </div>
            <div>
              <span className="text-slate-400">KYC Status:</span>
              <p className="font-semibold text-emerald-600 mt-0.5 capitalize">{merchant.kycStatus || "Verified"}</p>
            </div>
          </div>
        </div>

        {/* Commercial & Projections */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
            Expected Commercial Projections
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Expected Monthly Processing Volume (BDT ৳)"
              name="expectedMonthlyVolume"
              type="number"
              value={expectedMonthlyVolume}
              onChange={(e) => setExpectedMonthlyVolume(e.target.value)}
              placeholder="e.g. 500000"
              required
            />

            <FormField
              label="Estimated Daily Transactions"
              name="expectedDailyTxns"
              type="number"
              value={expectedDailyTxns}
              onChange={(e) => setExpectedDailyTxns(e.target.value)}
              placeholder="e.g. 100"
              required
            />

            <FormField
              label="Primary Purpose of Gateway Usage"
              name="purposeOfUse"
              value={purposeOfUse}
              onChange={(e) => setPurposeOfUse(e.target.value)}
              placeholder="e.g. Web checkout & In-store QR payments"
              required
            />

            <FormField
              label="Target Integration Timeline"
              name="integrationTimeline"
              type="select"
              value={integrationTimeline}
              onChange={(e) => setIntegrationTimeline(e.target.value)}
              options={[
                { value: "Immediate", label: "Immediate (Within 1-2 days)" },
                { value: "Within 1 Month", label: "Within 1 Month" },
                { value: "Exploratory", label: "Exploratory / Testing" },
              ]}
              required
            />
          </div>

          <FormField
            label="Additional Notes / Specific Requirements (Optional)"
            name="notes"
            type="textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide any additional merchant notes or specific requirements for the compliance officer..."
          />
        </div>

        {/* Compliance Acknowledgement & Submit */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              I confirm that the provided commercial projections are accurate and that our business operates in compliance with Bangladesh Bank BanglaQR regulatory guidelines and the merchant service agreement for <strong>{gateway.name}</strong>.
            </span>
          </label>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/merchant/gateways/${gatewayId}`)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={!termsAgreed}
              icon={Send}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

