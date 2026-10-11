import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  Users,
  Download,
  Send,
  CreditCard,
  MoreVertical,
  Edit,
  Ban,
  Eye,
  BellRing,
  Check,
  X,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

const statusConfig = {
  draft: {
    label: "Draft",
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Edit,
  },
  sent: {
    label: "Sent",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Send,
  },
  partially_paid: {
    label: "Partially Paid",
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-slate-100 text-slate-500 border-slate-200 line-through",
    icon: Ban,
  },
};

export default function Invoices() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    draftInvoices: 0,
    sentInvoices: 0,
    paidInvoices: 0,
    partiallyPaidInvoices: 0,
    overdueInvoices: 0,
    totalOutstanding: 0,
    totalCollected: 0,
  });

  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    referenceId: "",
    notes: "",
  });
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Global Alert Message
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchStats = async () => {
    try {
      const res = await merchantApi.getInvoiceStats();
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error("Failed to load invoice stats:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getInvoices({
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      setInvoices(res.invoices || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError(err.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter, page]);

  const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
    try {
      showToast("Generating PDF...");
      const response = await merchantApi.getInvoicePdfBlob(invoiceId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${invoiceNumber || invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF download failed:", err);
      showToast("Failed to download PDF", true);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      showToast("Generating Excel spreadsheet...");
      const res = await merchantApi.exportInvoicesExcel({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      const today = new Date().toISOString().split("T")[0];
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `banglaqr-merchant-invoices-${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("Excel spreadsheet downloaded successfully!");
    } catch (err) {
      console.error("Excel export failed:", err);
      showToast("Failed to export Excel spreadsheet", true);
    } finally {
      setExporting(false);
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      showToast("Sending invoice...");
      const res = await merchantApi.sendInvoice(invoiceId);
      showToast(res.message || "Invoice sent!");
      fetchStats();
      fetchInvoices();
    } catch (err) {
      console.error("Send invoice failed:", err);
      showToast(err.response?.data?.message || "Failed to send invoice", true);
    }
  };

  const handleSendReminder = async (invoiceId) => {
    try {
      showToast("Sending reminder...");
      const res = await merchantApi.sendInvoiceReminder(invoiceId);
      showToast(res.message || "Reminder sent!");
    } catch (err) {
      console.error("Reminder failed:", err);
      showToast(err.response?.data?.message || "Failed to send reminder", true);
    }
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      setRecordingPayment(true);
      setPaymentError(null);

      await merchantApi.recordInvoicePayment(selectedInvoice.id, {
        amount: Number(paymentData.amount),
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        referenceId: paymentData.referenceId,
        notes: paymentData.notes,
      });

      showToast("Payment recorded successfully!");
      setPaymentModalOpen(false);
      setSelectedInvoice(null);
      setPaymentData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        referenceId: "",
        notes: "",
      });
      fetchStats();
      fetchInvoices();
    } catch (err) {
      console.error("Record payment failed:", err);
      setPaymentError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleCancelInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      setCancelling(true);
      await merchantApi.cancelInvoice(selectedInvoice.id, {
        reason: cancelReason,
      });

      showToast("Invoice cancelled successfully");
      setCancelModalOpen(false);
      setSelectedInvoice(null);
      setCancelReason("");
      fetchStats();
      fetchInvoices();
    } catch (err) {
      console.error("Cancel invoice failed:", err);
      showToast(err.response?.data?.message || "Failed to cancel invoice", true);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all ${
            toastMsg.isError
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toastMsg.isError ? <AlertCircle className="h-4 w-4 text-rose-600" /> : <Check className="h-4 w-4 text-emerald-600" />}
          {toastMsg.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Merchant Invoice Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Issue professional customer invoices, track payments, send reminders, and generate PDF bills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              fetchStats();
              fetchInvoices();
            }}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Refresh Invoices"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            title="Export all matching invoices to Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            {exporting ? "Exporting..." : "Export Excel"}
          </button>
          <Link
            to="/merchant/invoice-customers"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Users className="h-4 w-4" />
            Manage Customers
          </Link>
          <Link
            to="/merchant/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Invoices
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {stats.totalInvoices}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Drafts
          </span>
          <span className="text-xl font-bold text-slate-600 mt-1 block">
            {stats.draftInvoices}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
            Sent / Active
          </span>
          <span className="text-xl font-bold text-blue-700 mt-1 block">
            {stats.sentInvoices + stats.partiallyPaidInvoices}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Paid
          </span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">
            {stats.paidInvoices}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Overdue
          </span>
          <span className="text-xl font-bold text-rose-700 mt-1 block">
            {stats.overdueInvoices}
          </span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Outstanding
          </span>
          <span className="text-lg font-bold text-emerald-950 mt-1 block">
            ৳{stats.totalOutstanding.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, customer name, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table / List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-600">Loading invoice records...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold text-xs">{error}</p>
          <button
            onClick={fetchInvoices}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No invoices found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "all"
              ? "No invoices match the selected filter criteria."
              : "You have not generated any invoices for your customers yet."}
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Link
              to="/merchant/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Invoice
            </Link>
            <Link
              to="/merchant/invoice-customers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              <Users className="h-3.5 w-3.5" />
              Add Customer
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Issue Date</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Paid</th>
                  <th className="px-5 py-3.5">Balance Due</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const config = statusConfig[inv.status] || statusConfig.draft;
                  const StatusIcon = config.icon;
                  const isDraft = inv.status === "draft";
                  const isPaid = inv.status === "paid";
                  const isCancelled = inv.status === "cancelled";

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        <Link
                          to={`/merchant/invoices/${inv.id}`}
                          className="hover:text-emerald-600 transition-colors"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{inv.customerName}</div>
                        {inv.customerBusinessName && (
                          <div className="text-[11px] text-slate-500">{inv.customerBusinessName}</div>
                        )}
                        {inv.customerEmail && (
                          <div className="text-[10px] text-slate-400">{inv.customerEmail}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Upon Receipt"}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        ৳{Number(inv.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-emerald-700">
                        ৳{Number(inv.amountPaid || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        ৳{Number(inv.balanceDue || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.bg}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <Link
                            to={`/merchant/invoices/${inv.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="View Invoice"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          {/* PDF */}
                          <button
                            onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit (if draft) */}
                          {isDraft && (
                            <Link
                              to={`/merchant/invoices/${inv.id}/edit`}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="Edit Draft"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                          )}

                          {/* Send / Resend */}
                          {!isCancelled && (
                            <button
                              onClick={() => handleSendInvoice(inv.id)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title={isDraft ? "Send to Customer" : "Resend to Customer"}
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Record Payment */}
                          {!isDraft && !isPaid && !isCancelled && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentData({
                                  ...paymentData,
                                  amount: String(inv.balanceDue),
                                });
                                setPaymentModalOpen(true);
                              }}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg font-semibold"
                              title="Record Manual Payment"
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Remind */}
                          {(inv.status === "sent" || inv.status === "overdue" || inv.status === "partially_paid") && (
                            <button
                              onClick={() => handleSendReminder(inv.id)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                              title="Send Reminder"
                            >
                              <BellRing className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Cancel */}
                          {!isPaid && !isCancelled && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setCancelModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Cancel Invoice"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
              <span className="text-slate-500">
                Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> (Total {pagination.total} invoices)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
                <p className="text-xs text-slate-500">
                  Invoice #{selectedInvoice.invoiceNumber} • Balance Due: ৳{selectedInvoice.balanceDue.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setSelectedInvoice(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {paymentError && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                {paymentError}
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received (৳ BDT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={selectedInvoice.balanceDue}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Method *
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer / BEFTN</option>
                    <option value="cheque">Cheque</option>
                    <option value="bkash_manual">bKash (Manual TrxID)</option>
                    <option value="nagad_manual">Nagad (Manual TrxID)</option>
                    <option value="pos_card">POS Terminal Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction / Reference ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRX-9823412 or Cheque #1234"
                  value={paymentData.referenceId}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal receipt note or bank branch name..."
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setSelectedInvoice(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {recordingPayment ? "Recording..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Invoice Modal */}
      {cancelModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 pb-3 border-b border-slate-100">
              <Ban className="h-5 w-5" />
              <h3 className="text-base font-bold text-slate-900">Cancel Invoice #{selectedInvoice.invoiceNumber}</h3>
            </div>

            <p className="text-xs text-slate-600 my-3">
              Are you sure you want to cancel this invoice? The invoice status will be changed to Cancelled and no further payments will be accepted.
            </p>

            <form onSubmit={handleCancelInvoiceSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cancellation Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Order cancelled by client or wrong billing amount"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOpen(false);
                    setSelectedInvoice(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Keep Invoice
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
