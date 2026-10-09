import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Receipt,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  ExternalLink,
  RefreshCw,
  FileText,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getInvoices({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setInvoices(res?.data?.invoices || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load platform invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Receipt className="text-emerald-600" />
            Billing & Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track generated invoices for setup fees, add-on subscriptions, and gateway usage.
          </p>
        </div>
        <button
          onClick={fetchInvoices}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice # or merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "paid", "unpaid", "pending", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold capitalize transition ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading invoice ledger...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">No Invoices Found</p>
            <p className="text-sm text-slate-400 mt-1">There are no billing records matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3">Invoice Number</th>
                  <th className="px-5 py-3">Merchant</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText size={15} className="text-slate-400" />
                      {inv.invoice_number || `INV-${inv.id}`}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/merchants/${inv.merchant_id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-emerald-600 flex items-center gap-1.5"
                      >
                        <Building2 size={14} className="text-slate-400" />
                        {inv.company_name || `Merchant #${inv.merchant_id}`}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      ৳{Number(inv.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                          inv.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : inv.status === "cancelled"
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {inv.status === "paid" ? (
                          <CheckCircle size={12} />
                        ) : inv.status === "cancelled" ? (
                          <XCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 transition"
                      >
                        View Receipt <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

