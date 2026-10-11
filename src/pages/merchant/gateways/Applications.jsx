import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Building2,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

const statusConfig = {
  applied: {
    label: "Applied",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  additional_information_required: {
    label: "Action Required",
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    icon: AlertCircle,
  },
};

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getApplications();
      setApplications(res.data || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError(err.response?.data?.message || "Failed to load gateway applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      !search ||
      app.gateway_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.gateway_code?.toLowerCase().includes(search.toLowerCase()) ||
      String(app.id).includes(search);
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Gateway Applications
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track and monitor the status of your payment gateway onboarding applications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Refresh applications"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/merchant/gateways"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all duration-150"
          >
            <CreditCard className="h-4 w-4" />
            Apply New Gateway
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by gateway name, code, or application ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="additional_information_required">Action Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Application Cards / Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading your applications...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No applications found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "all"
              ? "No applications match your selected filters. Try resetting search or status."
              : "You haven't submitted any payment gateway applications yet."}
          </p>
          <Link
            to="/merchant/gateways"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Browse Gateway Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => {
            const config = statusConfig[app.status] || statusConfig.applied;
            const StatusIcon = config.icon;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 sm:p-6 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Gateway Info */}
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-200/70 p-2 flex items-center justify-center shrink-0">
                      {app.gateway_logo ? (
                        <img
                          src={app.gateway_logo}
                          alt={app.gateway_name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <CreditCard className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          {app.gateway_name || "Payment Gateway"}
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {app.gateway_code || `GW-${app.gateway_id}`}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Applied: {new Date(app.created_at || app.applied_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>Application #{app.id}</span>
                        {app.service_type && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{app.service_type.replace("_", " ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Notes Status */}
                  <div className="flex items-center gap-3 self-end lg:self-center">
                    <Link
                      to={`/merchant/applications/${app.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                    >
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {app.status === "approved" && (
                      <Link
                        to="/merchant/services"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        Configure Service
                      </Link>
                    )}
                  </div>
                </div>

                {/* Admin Feedback / Note Alert if present */}
                {app.admin_note && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3 bg-slate-50/80 p-3.5 rounded-xl text-xs">
                    <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800">Admin Review Note: </span>
                      <span className="text-slate-600">{app.admin_note}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

