import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  ClipboardList,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  FileText,
  Building2,
  RefreshCw,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

const statusConfig = {
  applied: {
    label: "Applied",
    desc: "Your application has been received and is waiting for initial compliance review.",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    desc: "Our verification team is reviewing your company documents and commercial parameters.",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    desc: "Your gateway integration request has been approved! You can now configure your credentials.",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    desc: "Your application was not approved. Review the admin notes below for more details.",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  additional_information_required: {
    label: "Action Required",
    desc: "Additional documentation or information is requested by the compliance team.",
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    icon: AlertCircle,
  },
};

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getApplicationById(id);
      setApp(res.data);
    } catch (err) {
      console.error("Failed to load application details:", err);
      setError(err.response?.data?.message || "Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading application details...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
        <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
        <p className="font-semibold">{error || "Application not found"}</p>
        <Link
          to="/merchant/applications"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
      </div>
    );
  }

  const config = statusConfig[app.status] || statusConfig.applied;
  const StatusIcon = config.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          to="/merchant/applications"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gateway Applications
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 flex items-center justify-center shrink-0">
              {app.gateway_logo ? (
                <img
                  src={app.gateway_logo}
                  alt={app.gateway_name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <CreditCard className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">
                  {app.gateway_name || "Payment Gateway Application"}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                  {app.gateway_code || `GW-${app.gateway_id}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Application Reference #{app.id} • Submitted on{" "}
                {new Date(app.created_at || app.applied_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${config.bg}`}
            >
              <StatusIcon className="h-4 w-4" />
              {config.label}
            </span>
          </div>
        </div>

        {/* Status notice banner */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
          <StatusIcon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-slate-800">Current Application Status</p>
            <p className="text-slate-600 mt-0.5">{config.desc}</p>
          </div>
        </div>

        {/* Admin Review Note if available */}
        {app.admin_note && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-amber-900">Compliance & Review Team Note</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">{app.admin_note}</p>
            </div>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gateway Specification */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            Gateway Specifications
          </h2>
          <div className="space-y-3 text-xs divide-y divide-slate-100">
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Gateway Name</span>
              <span className="font-semibold text-slate-800">{app.gateway_name || "—"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Gateway Code</span>
              <span className="font-mono font-semibold text-slate-800">{app.gateway_code || "—"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Service Type</span>
              <span className="capitalize font-semibold text-slate-800">
                {app.service_type ? app.service_type.replace("_", " ") : "Aggregated Gateway"}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Transaction / Service Fee</span>
              <span className="font-semibold text-slate-800">{app.service_fee || "Standard Tier"}</span>
            </div>
          </div>
        </div>

        {/* Application Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Application Information
          </h2>
          <div className="space-y-3 text-xs divide-y divide-slate-100">
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Application Reference</span>
              <span className="font-mono font-semibold text-slate-800">#{app.id}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Application Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(app.created_at || app.applied_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Last Updated</span>
              <span className="font-semibold text-slate-800">
                {app.updated_at ? new Date(app.updated_at).toLocaleDateString() : "—"}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Merchant Account</span>
              <span className="font-semibold text-slate-800">{app.merchant_name || "Current Merchant"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action footer */}
      {app.status === "approved" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs">
            <h3 className="font-bold text-emerald-950 text-sm">Ready for Integration</h3>
            <p className="text-emerald-800 mt-1">
              Your gateway application is active. Navigate to My Services to manage API configuration and credentials.
            </p>
          </div>
          <Link
            to="/merchant/services"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm whitespace-nowrap"
          >
            Go to My Services
          </Link>
        </div>
      )}
    </div>
  );
}

