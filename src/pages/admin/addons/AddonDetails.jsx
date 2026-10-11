import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  DollarSign,
  Layers,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function AddonDetails() {
  const { addonId } = useParams();
  const [addon, setAddon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAddon() {
      setLoading(true);
      setError("");
      try {
        const res = await adminApi.getAddon(addonId);
        const data = res?.data || res?.addon || res;
        setAddon(data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load add-on details.");
      } finally {
        setLoading(false);
      }
    }
    loadAddon();
  }, [addonId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
        Loading add-on details...
      </div>
    );
  }

  if (error || !addon) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 text-center space-y-3">
        <p className="text-red-600 dark:text-red-400 font-semibold">{error || "Add-on not found"}</p>
        <Link
          to="/admin/addons"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft size={16} /> Back to Add-ons
        </Link>
      </div>
    );
  }

  const isActive = addon.status === "active" || addon.status === "available";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/addons"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Add-ons Catalog
        </Link>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${
            isActive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border-slate-200"
          }`}
        >
          {isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {addon.status?.toUpperCase()}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-2xl border border-emerald-200 dark:border-emerald-800 shrink-0">
              <Sparkles size={30} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200">
                {addon.category || "Operations"}
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{addon.name}</h1>
              <p className="text-sm font-mono text-slate-400">Code / SKU: {addon.code}</p>
              <p className="text-sm text-slate-500 pt-1">
                {addon.description || "BanglaQR add-on business service."}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right p-4 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold">Pricing</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              ৳{Number(addon.price || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {addon.pricingType || addon.pricing_type || "Monthly"} / {addon.billingCycle || addon.billing_cycle || "Monthly"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Product Specifications
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-semibold text-slate-900 dark:text-white">{addon.category || "Operations"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Billing Type</span>
              <span className="font-semibold capitalize text-slate-900 dark:text-white">{addon.pricingType || addon.pricing_type || "Monthly"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Billing Cycle</span>
              <span className="font-semibold text-slate-900 dark:text-white">{addon.billingCycle || addon.billing_cycle || "Monthly"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Prerequisites & Requirements
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {addon.requirements || "Active BanglaQR Merchant Terminal & Verified KYC."}
          </p>
        </div>
      </div>
    </div>
  );
}
