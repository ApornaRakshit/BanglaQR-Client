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
  Download,
  AlertCircle,
  Filter,
  DollarSign,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    draftInvoices: 0,
    sentInvoices: 0,
    paidInvoices: 0,
    partiallyPaidInvoices: 0,
    overdueInvoices: 0,
    totalOutstanding: 0,
    totalCollected: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getInvoiceStats();
      const s = res?.data || res?.stats;
      if (s) setStats(s);
    } catch (err) {
      console.error("Failed to load admin invoice stats:", err);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getInvoices({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const list = res?.data?.invoices || res?.invoices || (Array.isArray(res?.data) ? res.data : []);
      setInvoices(list);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load platform invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search, dateFrom, dateTo]);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const blob = await adminApi.exportInvoicesExcel({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const today = new Date().toISOString().split("T")[0];
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `banglaqr-admin-invoices-${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export error:", err);
      alert(err?.response?.data?.message || "Failed to export Excel spreadsheet.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = async (id, invoiceNumber) => {
    try {
      setDownloadingPdfId(id);
      const res = await adminApi.getInvoicePdfBlob(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download invoice PDF.");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Receipt className="text-emerald-600" />
            Merchant Invoices & Billing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global oversight of merchant-issued customer invoices, settlement status, and audit ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            {exporting ? "Exporting Excel..." : "Export Excel"}
          </button>
          <button
            onClick={() => { fetchStats(); fetchInvoices(); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Invoices</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalInvoices}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold text-blue-600 uppercase">Sent / Pending</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{stats.sentInvoices}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-600 uppercase">Paid Invoices</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.paidInvoices}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold text-rose-600 uppercase">Overdue</div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{stats.overdueInvoices}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm col-span-2">
          <div className="text-[11px] font-bold text-amber-600 uppercase">Total Outstanding Balance</div>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
            ৳{Number(stats.totalOutstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, merchant, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["all", "draft", "sent", "partially_paid", "paid", "overdue", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
              title="Issue Date From"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
              title="Issue Date To"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs text-rose-600 hover:underline font-medium"
              >
                Clear
              </button>
            )}
          </div>
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
          <div className="p-12 text-center text-slate-400">Loading invoice ledger from database...</div>
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
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {invoices.map((inv) => {
                  const invNumber = inv.invoiceNumber || inv.invoice_number || `INV-${inv.id}`;
                  const merchantLabel =
                    inv.companyName ||
                    inv.company_name ||
                    inv.merchantCode ||
                    inv.merchant_code ||
                    (inv.merchantId || inv.merchant_id ? `Merchant #${inv.merchantId || inv.merchant_id}` : "Merchant information unavailable");
                  const customerLabel = inv.customerName || inv.customer_name || "—";
                  const dueDateVal = inv.dueDate || inv.due_date;
                  const totalAmt = Number(inv.grandTotal ?? inv.totalAmount ?? inv.amount ?? 0);
                  const balanceDueVal = Number(inv.balanceDue ?? inv.balance_due ?? totalAmt);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        <Link
                          to={`/admin/invoices/${inv.id}`}
                          className="hover:text-emerald-600 flex items-center gap-2 transition"
                        >
                          <FileText size={15} className="text-slate-400" />
                          {invNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 size={14} className="text-slate-400" />
                          {merchantLabel}
                        </div>
                        {(inv.merchantCode || inv.merchant_code) && (
                          <div className="text-[11px] font-mono text-slate-400 ml-5">
                            {inv.merchantCode || inv.merchant_code}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{customerLabel}</div>
                        {(inv.customerBusinessName || inv.customer_business_name) && (
                          <div className="text-[11px] text-slate-400">
                            {inv.customerBusinessName || inv.customer_business_name}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          ৳{totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {inv.status !== "paid" && (
                          <div className="text-[11px] text-amber-600 font-medium">
                            Due: ৳{balanceDueVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {dueDateVal ? new Date(dueDateVal).toLocaleDateString() : "Not set"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            inv.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : inv.status === "overdue"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : inv.status === "cancelled"
                              ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                              : inv.status === "sent"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                        >
                          {inv.status === "paid" ? (
                            <CheckCircle size={12} />
                          ) : inv.status === "overdue" || inv.status === "cancelled" ? (
                            <XCircle size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {String(inv.status || "draft").replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPdf(inv.id, invNumber)}
                            disabled={downloadingPdfId === inv.id}
                            title="Download PDF"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                          >
                            <Download size={14} className={downloadingPdfId === inv.id ? "animate-spin" : ""} />
                          </button>
                          <Link
                            to={`/admin/invoices/${inv.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                          >
                            View <ExternalLink size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
