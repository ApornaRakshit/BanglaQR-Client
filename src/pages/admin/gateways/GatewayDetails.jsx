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
        setGateway(res?.data?.gateway || null);
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
      <div className="p-12 text-center text-slate-400">Loading gateway specifications...</div>
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
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
            gateway.status === "active"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
          }`}
        >
          {gateway.status === "active" ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {gateway.status?.toUpperCase()}
        </span>
      </div>

      {/* Hero Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-2xl border border-emerald-200 dark:border-emerald-800">
            {gateway.code?.substring(0, 3) || "GW"}
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
              <span className="text-slate-500">Gateway Type</span>
              <span className="font-semibold text-slate-900 dark:text-white">{gateway.type || "MFS"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Settlement Cycle</span>
              <span className="font-semibold text-slate-900 dark:text-white">T+1 Business Day</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Currency</span>
              <span className="font-semibold text-slate-900 dark:text-white">BDT (৳)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Protocol</span>
              <span className="font-semibold font-mono text-slate-900 dark:text-white">EMVCo BanglaQR / REST API</span>
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
              <span className="font-semibold text-emerald-600">{gateway.fee_percentage}%</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Fixed Fee per Tx</span>
              <span className="font-semibold text-slate-900 dark:text-white">{gateway.fee_fixed || "0.00"} BDT</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Tax / VAT Applicable</span>
              <span className="font-semibold text-slate-900 dark:text-white">Standard 15% on MDR</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Minimum Transaction</span>
              <span className="font-semibold text-slate-900 dark:text-white">10.00 BDT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

