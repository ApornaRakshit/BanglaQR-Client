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
        setAddon(res?.data?.addon || null);
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
      <div className="p-12 text-center text-slate-400">Loading add-on details...</div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/addons"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Add-ons
        </Link>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
            addon.status === "active"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
          }`}
        >
          {addon.status === "active" ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {addon.status?.toUpperCase()}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-2xl border border-emerald-200 dark:border-emerald-800">
            <Sparkles size={32} />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{addon.name}</h1>
            <p className="text-sm font-mono text-slate-400">SKU Code: {addon.code}</p>
            <p className="text-sm text-slate-500 pt-1">
              {addon.description || "BanglaQR add-on business service."}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 uppercase font-bold">Standard Price</p>
            <p className="text-2xl font-black text-emerald-600">
              ৳{Number(addon.price || 0).toLocaleString()}
            </p>
            <p className="text-sm text-slate-400 capitalize">{addon.billing_type || "monthly"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

