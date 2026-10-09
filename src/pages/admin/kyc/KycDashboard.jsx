import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  UserCheck,
  Search,
  RotateCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function KycDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [businessType, setBusinessType] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const fetchKyc = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getKycList({
        search,
        status: status === "all" ? "" : status,
        businessType: businessType === "all" ? "" : businessType,
        page,
        limit: 15,
      });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load KYC list:", err);
      setError("Unable to load KYC queue.");
    } finally {
      setLoading(false);
    }
  }, [search, status, businessType, page]);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

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
            KYC Compliance & Review Queue
          </h1>
          <p className="mt-1 text-sm sm:text-sm text-slate-500">
            Audit merchant legal entity credentials, National ID records, and settlement bank authorization.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchKyc}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition self-start sm:self-auto cursor-pointer"
        >
          <RotateCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchKyc();
          }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12"
        >
          <div className="lg:col-span-6 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search legal name, TIN, NID, merchant code..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
            >
              <option value="all">All KYC Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="additional_information_required">Info Required</option>
            </select>
          </div>

          <div className="lg:col-span-3 flex gap-2">
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
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition cursor-pointer"
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
            <p className="text-sm font-semibold">Loading KYC compliance queue...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-red-600">
            <AlertCircle size={28} className="mb-2" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <UserCheck size={28} className="text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-900">No KYC records matching query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Merchant</th>
                  <th className="py-3.5 px-4">Legal Business Name</th>
                  <th className="py-3.5 px-4">Authorized NID</th>
                  <th className="py-3.5 px-4">Settlement Bank</th>
                  <th className="py-3.5 px-4">KYC Status</th>
                  <th className="py-3.5 px-4">Docs Verified</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.items.map((item) => (
                  <tr key={item.merchantId} className="transition hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 sm:px-6">
                      <p className="font-bold text-slate-900">{item.companyName}</p>
                      <p className="font-mono text-[10px] text-emerald-700">{item.merchantCode}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{item.legalBusinessName || "N/A"}</p>
                      <p className="text-[10px] text-slate-400">{item.businessEntityType || "Standard"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-semibold text-slate-700">{item.nidNumber}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{item.authorizedPersonName}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{item.bankName || "Pending"}</p>
                      <p className="font-mono text-[10px] text-slate-400">{item.bankAccountNumber}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          kycStatusBadges[item.kycStatus] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.kycStatus?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {item.approvedDocumentCount} / {item.documentCount} Docs
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/merchants/${item.merchantId}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-2xs hover:border-emerald-300 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <Eye size={13} className="text-slate-400" />
                        <span>Audit KYC</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data.total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 bg-slate-50/50 text-sm text-slate-600">
            <span>Page {page} of {data.totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
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

