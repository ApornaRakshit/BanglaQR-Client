import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  CreditCard,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  Smartphone,
  Globe,
  FileText,
  Percent,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  Info,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { merchantApi } from "../../../services/merchantApi";

export default function GatewayDetails() {
  const { gatewayId } = useParams();
  const navigate = useNavigate();
  const [gateway, setGateway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGateway() {
      try {
        setLoading(true);
        setError("");
        const res = await merchantApi.getGatewayById(gatewayId);
        if (res.success) {
          setGateway(res.data);
        }
      } catch (err) {
        console.error("Failed to load gateway details:", err);
        setError("Unable to find or load the requested payment gateway service.");
      } finally {
        setLoading(false);
      }
    }
    loadGateway();
  }, [gatewayId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-200 bg-white">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="mt-3 text-sm font-medium text-slate-500">Loading service specifications...</p>
      </div>
    );
  }

  if (error || !gateway) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/merchant/gateways")} icon={ArrowLeft}>
          Back to Catalogue
        </Button>
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <AlertCircle size={22} className="shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Service Unavailable</h4>
            <p className="text-xs mt-0.5">{error || "Gateway details could not be found."}</p>
          </div>
        </div>
      </div>
    );
  }

  const hasApplied = Boolean(gateway.application);
  const isApproved = gateway.application?.status === "approved";
  const isActivated = gateway.service?.status === "active";

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/merchant/gateways")}
            icon={ArrowLeft}
          >
            Back to Gateway Catalogue
          </Button>

          <div className="flex items-center gap-2">
            {isActivated ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={13} /> Active on Account
              </span>
            ) : hasApplied ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                <Clock size={13} /> Application {gateway.application?.status}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Available for Application
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200/80 p-3">
            {gateway.logoUrl ? (
              <img
                src={gateway.logoUrl}
                alt={gateway.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <CreditCard size={32} className="text-slate-700" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              {gateway.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Code: {gateway.code} · Category: {gateway.serviceType}
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">
              {gateway.description ||
                "Authorized digital payment channel supporting interoperable QR and merchant processing."}
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            {isActivated ? (
              <Button
                variant="primary"
                onClick={() => navigate(`/merchant/services/${gateway.id}`)}
                icon={ArrowRight}
                iconPosition="right"
              >
                Configure Service
              </Button>
            ) : hasApplied ? (
              <Button
                variant="outline"
                onClick={() => navigate("/merchant/applications")}
                icon={Clock}
              >
                Track Application
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate(`/merchant/gateways/${gateway.id}/apply`)}
                icon={ArrowRight}
                iconPosition="right"
              >
                Apply for Gateway
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Details & Specifications */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Capabilities & Required Documents */}
        <div className="space-y-6 lg:col-span-2">
          {/* Supported Methods */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Supported Payment Channels & Methods
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {gateway.qrSupported && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <QrCode size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">BanglaQR Interoperable</p>
                    <p className="text-[11px] text-slate-500">Universal EMVCo QR Specification</p>
                  </div>
                </div>
              )}

              {gateway.mobileSupported && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mobile Financial Services</p>
                    <p className="text-[11px] text-slate-500">bKash, Nagad, Rocket, Upay</p>
                  </div>
                </div>
              )}

              {gateway.cardSupported && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Debit & Credit Cards</p>
                    <p className="text-[11px] text-slate-500">Visa, Mastercard, UnionPay, Amex</p>
                  </div>
                </div>
              )}

              {gateway.apiSupported && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">REST API & Webhooks</p>
                    <p className="text-[11px] text-slate-500">Real-time payment callbacks & IPN</p>
                  </div>
                </div>
              )}
            </div>

            {/* List of explicit methods */}
            {gateway.supportedMethods && gateway.supportedMethods.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-slate-500 mb-2">Detailed Methods List:</p>
                <div className="flex flex-wrap gap-2">
                  {gateway.supportedMethods.map((method, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Required Documents */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Application Documentation Requirements
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              The following verification certificates must be active on your merchant profile to approve this gateway service:
            </p>

            <div className="mt-4 space-y-2.5">
              {(gateway.requiredDocuments && gateway.requiredDocuments.length > 0
                ? gateway.requiredDocuments
                : ["NID (National Identity Card)", "e-TIN Certificate", "Cancelled Bank Cheque Leaf", "Trade License"]
              ).map((docName, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <FileText size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">{docName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pricing & Commercial Information */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Fee Structure & Terms
            </h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-500">Service Fee per Transaction</span>
                <span className="text-sm font-bold text-emerald-600">{gateway.serviceFee}%</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-500">Initial Setup & Integration Fee</span>
                <span className="text-sm font-bold text-slate-900">
                  {gateway.setupFee === 0 ? "Free (৳ 0.00)" : `৳ ${gateway.setupFee}`}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-500">Settlement Frequency</span>
                <span className="text-xs font-semibold text-slate-700">T+1 Business Day</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Settlement Currency</span>
                <span className="text-xs font-semibold text-slate-700">BDT (৳)</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-3.5 border border-slate-200/60 text-xs text-slate-500 flex gap-2.5">
              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <p>
                BanglaQR manages application compliance, key provisioning, and integration APIs. Payment settlements are deposited directly into your designated bank account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

