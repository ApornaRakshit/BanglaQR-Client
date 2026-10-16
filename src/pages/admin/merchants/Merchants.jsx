import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Users,
  Search,
  Filter,
  Eye,
  RotateCw,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  FileText,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function Merchants({ defaultStatus = "" }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFromUrl = searchParams.get("status") || defaultStatus || "all";
  const [status, setStatus] = useState(statusFromUrl);

  useEffect(() => {
    const newStatus = searchParams.get("status") || defaultStatus || "all";
    setStatus(newStatus);
  }, [searchParams, defaultStatus]);
  const [kycStatus, setKycStatus] = useState(searchParams.get("kycStatus") || "all");
  const [businessType, setBusinessType] = useState(searchParams.get("businessType") || "all");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const [data, setData] = useState({ merchants: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getMerchants({
        search,
        status: status === "all" ? "" : status,
        kycStatus: kycStatus === "all" ? "" : kycStatus,
        businessType: businessType === "all" ? "" : businessType,
        dateFrom,
        dateTo,
        page,
        limit: 15,
      });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load merchants:", err);
      setError("Unable to load merchant records. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, status, kycStatus, businessType, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMerchants();
  };

  const statusTabs = [
    { key: "all", label: "All Merchants" },
    { key: "submitted", label: "Pending Review" },
    { key: "under_review", label: "Under Review" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "suspended", label: "Suspended" },
    { key: "draft", label: "Draft" },
  ];

  const accountStatusBadges = {
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    under_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    suspended: "bg-amber-50 text-amber-800 border-amber-200",
    additional_information_required: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const kycStatusBadges = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    under_review: "bg-blue-50 text-blue-700 border-blue-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    additional_information_required: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            Merchant Directory & Management
          </h1>
          <p className="mt-1 text-sm sm:text-sm text-slate-500">
            Manage registered merchants, review compliance packages, audit credentials and update statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMerchants}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition self-start sm:self-auto cursor-pointer"
        >
          <RotateCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>


      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, business, email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
            />
          </div>

          {/* KYC Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={kycStatus}
              onChange={(e) => {
                setKycStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
            >
              <option value="all">All KYC Statuses</option>
              <option value="pending">KYC Pending</option>
              <option value="under_review">KYC Under Review</option>
              <option value="approved">KYC Approved</option>
              <option value="rejected">KYC Rejected</option>
              <option value="additional_information_required">KYC Info Required</option>
            </select>
          </div>

          {/* Business Type Filter */}
          <div className="lg:col-span-2">
            <select
              value={businessType}
              onChange={(e) => {
                setBusinessType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
            >
              <option value="all">All Entity Types</option>
              <option value="Proprietorship">Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Private Limited">Private Limited</option>
              <option value="Public Limited">Public Limited</option>
            </select>
          </div>

          {/* Date From */}
          <div className="lg:col-span-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Date To */}
          <div className="lg:col-span-2 flex gap-2">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <RotateCw size={24} className="animate-spin text-emerald-600 mb-2" />
            <p className="text-sm font-semibold">Loading merchants...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle size={28} className="text-red-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <button
              type="button"
              onClick={fetchMerchants}
              className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-bold text-white"
            >
              Retry
            </button>
          </div>
        ) : data.merchants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users size={24} />
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-900">No merchants found</h4>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Try adjusting your search query, status tabs or date range filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Merchant Code</th>
                  <th className="py-3.5 px-4">Company Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">KYC Status</th>
                  <th className="py-3.5 px-4">Documents</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.merchants.map((m) => (
                  <tr key={m.id} className="transition hover:bg-slate-50/80 group">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-emerald-700">
                      {m.merchantCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{m.companyName}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {m.businessType || "Entity Unassigned"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700 truncate max-w-[170px]">{m.email}</p>
                      <p className="text-[11px] text-slate-400">{m.phone || m.contactPhone || "No Phone"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          accountStatusBadges[m.accountStatus] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {m.accountStatus?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          kycStatusBadges[m.kycStatus] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {m.kycStatus?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600 font-semibold">
                        <FileText size={13} className="text-slate-400" />
                        <span>{m.documentCount}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/merchants/${m.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-2xs hover:border-emerald-300 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <Eye size={13} className="text-slate-400" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data.total > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-5 py-3.5 bg-slate-50/50 text-sm text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{(page - 1) * 15 + 1}</span> to{" "}
              <span className="font-bold text-slate-900">
                {Math.min(page * 15, data.total)}
              </span>{" "}
              of <span className="font-bold text-slate-900">{data.total}</span> merchants
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 transition hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-2 font-bold text-slate-800">
                Page {page} of {data.totalPages}
              </span>

              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 transition hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

