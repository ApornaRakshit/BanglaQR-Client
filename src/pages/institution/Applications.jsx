import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import {
  FileCheck2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { institutionApi } from "../../services/institutionApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_PILLS = [
  { key: "all", label: "All" },
  { key: "applied", label: "Pending Review" },
  { key: "under_review", label: "Under Review" },
  { key: "additional_information_required", label: "Additional Info" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function InstitutionApplications() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [applications, setApplications] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    applied: 0,
    under_review: 0,
    additional_information_required: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const institutionName =
    user?.institution?.name ||
    user?.institutionMemberships?.[0]?.name ||
    "Bank Partner";

  const fetchApplicationsData = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const [appRes, dashRes] = await Promise.all([
        institutionApi.getApplications({
          page,
          limit: pagination.limit,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search.trim() || undefined,
        }),
        institutionApi.getDashboard().catch(() => null),
      ]);

      setApplications(appRes.applications || []);
      setPagination({
        page: appRes.page || page,
        limit: appRes.limit || pagination.limit,
        total: appRes.total || 0,
        totalPages: appRes.totalPages || 1,
      });

      if (dashRes?.data?.applications) {
        const apps = dashRes.data.applications;
        setStatusCounts({
          all: apps.total ?? 0,
          applied: apps.pending ?? 0,
          under_review: apps.underReview ?? 0,
          additional_information_required: apps.additionalInfo ?? apps.correctionRequired ?? 0,
          approved: apps.approved ?? 0,
          rejected: apps.rejected ?? 0,
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load merchant applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsData(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplicationsData(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    if (status === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", status);
    }
    setSearchParams(searchParams);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Approved
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            Under Review
          </span>
        );
      case "additional_information_required":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            Additional Info
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "applied":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            Pending Review
          </span>
        );
    }
  };

  // Filter local business type if selected
  const displayedApps =
    businessTypeFilter === "all"
      ? applications
      : applications.filter((a) => a.business_type === businessTypeFilter);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View and manage merchant applications for {institutionName} services.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchApplicationsData(pagination.page)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-2xs transition cursor-pointer"
            title="Refresh table"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Status Filter Tabs (Top Pill Row matching screenshot: All (189), Pending Review (8), Under Review (12)...) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_PILLS.map((pill) => {
          const count = statusCounts[pill.key] ?? 0;
          const isActive = statusFilter === pill.key;
          return (
            <button
              key={pill.key}
              type="button"
              onClick={() => handleStatusChange(pill.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>{pill.label}</span>
              <span className={`ml-1.5 text-[11px] ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by merchant name, application ID, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Business Type Filter */}
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">Business Type</option>
            <option value="Retail Shop">Retail Shop</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Fashion">Fashion</option>
            <option value="Electronics">Electronics</option>
            <option value="Super Shop">Super Shop</option>
            <option value="Education">Education</option>
          </select>

          {/* Date Range Button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium hover:bg-slate-50"
          >
            <Calendar size={13} className="text-slate-400" />
            <span>Date Range</span>
          </button>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">Status: All</option>
            <option value="applied">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="additional_information_required">Additional Info</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Filter Action Button */}
          <button
            type="button"
            onClick={() => fetchApplicationsData(1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Filter size={13} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-3">Application ID</th>
                <th className="py-3.5 px-3">Merchant Name</th>
                <th className="py-3.5 px-3">Business Type</th>
                <th className="py-3.5 px-3">Requested Service</th>
                <th className="py-3.5 px-3">Assigned Branch</th>
                <th className="py-3.5 px-3">Submitted On</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                    <span>Loading merchant applications...</span>
                  </td>
                </tr>
              ) : displayedApps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileCheck2 size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No applications found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {statusFilter !== "all"
                        ? `No applications found with status '${statusFilter}'`
                        : "There are currently no merchant applications assigned to this institution."}
                    </p>
                  </td>
                </tr>
              ) : (
                displayedApps.map((app, index) => {
                  const merchantInitial =
                    (app.business_name || app.trade_name || "M")[0]?.toUpperCase() || "M";
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-900">
                        {app.application_number || `APP-${app.id}`}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {merchantInitial}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                              {app.business_name || app.trade_name || "Unnamed Merchant"}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                              {app.merchant_email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {app.business_type || "Retail"}
                      </td>

                      <td className="py-3.5 px-3 text-slate-700">
                        <span className="font-semibold block truncate max-w-[130px]">
                          {app.requested_service || app.gateway_name || "BanglaQR Gateway"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {app.branch_name ? (
                          <div className="flex items-center gap-1 text-slate-700">
                            <Building2 size={12} className="text-slate-400 shrink-0" />
                            <span className="font-medium truncate max-w-[120px]" title={app.branch_name}>
                              {app.branch_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Head Office</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                        {app.applied_at
                          ? new Date(app.applied_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>

                      <td className="py-3.5 px-3">{getStatusBadge(app.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/institution/applications/${app.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                          >
                            <span>View</span>
                          </Link>
                          <button
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                            title="More options"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching reference (Showing 1 to 10 of 189 results, 1 2 3 4 5 ... 19) */}
        <div className="p-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </span>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fetchApplicationsData(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => fetchApplicationsData(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                      pagination.page === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {pagination.totalPages > 5 && (
                <>
                  <span className="px-1 text-slate-400">...</span>
                  <button
                    type="button"
                    onClick={() => fetchApplicationsData(pagination.totalPages)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                      pagination.page === pagination.totalPages
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => fetchApplicationsData(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
