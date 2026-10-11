import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Shield,
  Layers,
  Activity,
  RefreshCw,
  QrCode,
  Smartphone,
  Check,
  FileText,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function GatewayDetails() {
  const { gatewayId } = useParams();
  const [gateway, setGateway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGateway() {
      setLoading(true);
      setError("");
      try {
        const res = await adminApi.getGateway(gatewayId);
        const data = res?.data || res?.gateway || res;
        setGateway(data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load gateway configuration.");
      } finally {
        setLoading(false);
      }
    }
    loadGateway();
  }, [gatewayId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
        Loading gateway specifications...
      </div>
    );
  }

  if (error || !gateway) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 text-center space-y-3">
        <p className="text-red-600 dark:text-red-400 font-semibold">{error || "Gateway not found"}</p>
        <Link
          to="/admin/gateways"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft size={16} /> Back to Gateway List
        </Link>
      </div>
    );
  }

  const supportedMethods = Array.isArray(gateway.supportedMethods)
    ? gateway.supportedMethods
    : typeof gateway.supported_methods === "string"
    ? JSON.parse(gateway.supported_methods || "[]")
    : gateway.supported_methods || [];

  const requiredDocuments = Array.isArray(gateway.requiredDocuments)
    ? gateway.requiredDocuments
    : typeof gateway.required_documents === "string"
    ? JSON.parse(gateway.required_documents || "[]")
    : gateway.required_documents || [];

  return (
    <div className="space-y-6">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/gateways"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Gateways
        </Link>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${
            gateway.status === "active"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border-slate-200"
          }`}
        >
          {gateway.status === "active" ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {gateway.status?.toUpperCase()}
        </span>
      </div>

      {/* Hero Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 flex items-center justify-center p-2 shrink-0">
            {gateway.logoUrl || gateway.logo_url ? (
              <img
                src={gateway.logoUrl || gateway.logo_url}
                alt={gateway.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-emerald-600 font-mono">
                {gateway.code?.substring(0, 3) || "GW"}
              </span>
            )}
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{gateway.name}</h1>
            <p className="text-sm font-mono text-slate-400">System Code: {gateway.code}</p>
            <p className="text-sm text-slate-500 pt-1">
              {gateway.description || "Digital payment rail configured for BanglaQR interoperability."}
            </p>
          </div>
        </div>
      </div>

      {/* Gateway Specs & Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Rail Specifications
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Service Classification</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {gateway.serviceType || gateway.service_type || "Payment Gateway"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">BanglaQR Interoperable</span>
              <span className="font-semibold text-emerald-600">
                {(gateway.qrSupported ?? gateway.qr_supported) ? "Enabled (EMVCo QR)" : "Disabled"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">MFS & Mobile Payment</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {(gateway.mobileSupported ?? gateway.mobile_supported) ? "Supported" : "Not Supported"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Card Acquiring Rails</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {(gateway.cardSupported ?? gateway.card_supported) ? "Visa / Mastercard / NexusPay" : "Not Supported"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Direct Merchant API</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {(gateway.apiSupported ?? gateway.api_supported) ? "REST / Webhooks Enabled" : "Portal Only"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Fee & Commercial Structure
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">MDR Fee Percentage</span>
              <span className="font-bold text-emerald-600">
                {gateway.serviceFee ?? gateway.service_fee ?? 1.5}%
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Setup / Activation Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ৳{gateway.setupFee ?? gateway.setup_fee ?? 0} BDT
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Settlement Standard</span>
              <span className="font-semibold text-slate-900 dark:text-white">T+1 Business Day</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Currency</span>
              <span className="font-semibold text-slate-900 dark:text-white">BDT (৳)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Methods & Required Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Supported Payment Channels
          </h2>
          <div className="flex flex-wrap gap-2 pt-1">
            {supportedMethods.length > 0 ? (
              supportedMethods.map((m, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  {m}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No explicit payment methods declared.</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Required Compliance Documents
          </h2>
          <div className="flex flex-wrap gap-2 pt-1">
            {requiredDocuments.length > 0 ? (
              requiredDocuments.map((doc, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold"
                >
                  {doc.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Standard KYC documentation applies.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
