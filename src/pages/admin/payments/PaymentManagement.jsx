import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  X,
  FileText,
  Calendar,
  Layers,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  Building2,
  Archive,
  Sparkles,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    processingPayments: 0,
    successfulPayments: 0,
    cancelledPayments: 0,
    failedPayments: 0,
    totalCollectedAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reconcilingId, setReconcilingId] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAddonPayments({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        gateway: gatewayFilter !== "all" ? gatewayFilter : undefined,
        page,
        limit: 15,
      });

      const list = res.data || res.payments || [];
      setPayments(Array.isArray(list) ? list : []);

      if (res.stats) {
        setStats(res.stats);
      } else {
        const total = res.pagination?.total || list.length;
        const pending = list.filter((p) => p.status === "pending").length;
        const processing = list.filter((p) => p.status === "processing").length;
        const successful = list.filter((p) => p.status === "successful").length;
        const cancelled = list.filter((p) => p.status === "cancelled").length;
        const failed = list.filter((p) => p.status === "failed").length;
        const totalAmount = list
          .filter((p) => p.status === "successful")
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        setStats({
          totalPayments: total,
          pendingPayments: pending,
          processingPayments: processing,
          successfulPayments: successful,
          cancelledPayments: cancelled,
          failedPayments: failed,
          totalCollectedAmount: totalAmount,
        });
      }

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load admin payments:", err);
      setError(err?.response?.data?.message || "Failed to load payments from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, gatewayFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleOpenDetails = async (payment) => {
    setSelectedPayment(payment);
    try {
      setDetailsLoading(true);
      const res = await adminApi.getAddonPaymentById(payment.id);
      if (res.data || res.payment) {
        setSelectedPayment({
          ...payment,
          ...(res.data || res.payment),
        });
      }
    } catch (err) {
      console.error("Failed to load full payment details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReconcile = async (paymentId) => {
    try {
      setReconcilingId(paymentId);
      const res = await adminApi.reconcileAddonPayment(paymentId);
      if (res.success) {
        showToast(res.message || "Payment verified with DGePay gateway");
        if (res.payment) {
          setPayments((prev) =>
            prev.map((p) => (p.id === paymentId ? { ...p, ...res.payment } : p))
          );
          if (selectedPayment && selectedPayment.id === paymentId) {
            setSelectedPayment((prev) => ({ ...prev, ...res.payment }));
          }
        }
        fetchPayments();
      }
    } catch (err) {
      console.error("Failed to reconcile payment:", err);
      showToast(err?.response?.data?.message || "Gateway reconciliation failed", "error");
    } finally {
      setReconcilingId(null);
    }
  };

  const handleArchive = async (paymentId) => {
    if (!window.confirm("Archive this payment transaction from active view?")) return;
    try {
      await adminApi.archiveAddonPayment(paymentId);
      showToast("Payment record archived successfully");
      if (selectedPayment && selectedPayment.id === paymentId) {
        setSelectedPayment(null);
      }
      fetchPayments();
    } catch (err) {
      console.error("Failed to archive payment:", err);
      showToast("Failed to archive payment", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold ${
            toast.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Payment Management
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                DGePay Integrated
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Live gateway transactions, payment confirmations, session verification, and reconciliation audits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPayments}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Refresh Payments"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition"
          >
            <ShoppingBag className="h-4 w-4 text-slate-600" />
            Orders Management
          </Link>
          <Link
            to="/admin/addons"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00875a] hover:bg-[#00704a] text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150"
          >
            <Sparkles className="h-4 w-4" />
            Add-ons Catalog
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Payments</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalPayments}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Attempts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-emerald-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Successful</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.successfulPayments}</p>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Verified & settled</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-sm bg-gradient-to-br from-amber-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {stats.pendingPayments + (stats.processingPayments || 0)}
          </p>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Awaiting confirmation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cancelled</p>
          <p className="text-2xl font-black text-slate-500 mt-1">{stats.cancelledPayments}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Expired / Closed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-sm bg-gradient-to-br from-rose-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Failed</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.failedPayments}</p>
          <span className="text-[11px] text-rose-600/80 mt-0.5 block">Gateway declined</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-sm bg-emerald-50/70">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Collected</p>
          <p className="text-xl font-black text-emerald-700 mt-1">
            ৳{Number(stats.totalCollectedAmount || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-700/80 mt-0.5 block font-semibold">Total Revenue (BDT)</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search payment ref, txn ID, order #, merchant, or add-on..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: "all", label: "All Payments" },
            { id: "successful", label: "Successful" },
            { id: "pending", label: "Pending" },
            { id: "cancelled", label: "Cancelled" },
            { id: "failed", label: "Failed" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatusFilter(st.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-[#00875a] animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading payment records from database...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchPayments}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No payment transactions found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            There are no payment attempts matching the selected criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider">
                  <th className="p-4">Payment Reference</th>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Merchant Profile</th>
                  <th className="p-4">Item / Service</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Gateway Txn ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.map((p) => {
                  const isSuccess = p.status === "successful";
                  const isPending = p.status === "pending" || p.status === "processing";
                  const isCancelled = p.status === "cancelled";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {p.payment_reference}
                          </span>
                          <button
                            onClick={() => handleCopy(p.payment_reference)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                            title="Copy Payment Reference"
                          >
                            {copiedText === p.payment_reference ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-slate-600">
                        {p.order_number || "—"}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-900 truncate max-w-[170px]">
                          {p.company_name || "Merchant #" + p.merchant_id}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {p.merchant_code || "N/A"}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-900 truncate max-w-[170px]">
                          {p.addon_name || "Add-on Subscription"}
                        </p>
                        {p.addon_code && (
                          <span className="text-[10px] text-slate-400 font-mono">{p.addon_code}</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                        ৳{Number(p.amount || 0).toLocaleString()}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {p.currency || "BDT"}
                        </span>
                      </td>

                      <td className="p-4 uppercase text-xs font-semibold text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {p.gateway || "DGePay"}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-slate-500 text-[11px] truncate max-w-[130px]">
                        {p.gateway_unique_txn_id ? (
                          <div className="flex items-center gap-1">
                            <span className="truncate">{p.gateway_unique_txn_id}</span>
                            <button
                              onClick={() => handleCopy(p.gateway_unique_txn_id)}
                              className="p-0.5 rounded text-slate-400 hover:text-slate-600"
                              title="Copy Transaction ID"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            isSuccess
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : isCancelled
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 size={11} />
                          ) : isPending ? (
                            <Clock size={11} />
                          ) : (
                            <XCircle size={11} />
                          )}
                          {p.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReconcile(p.id)}
                            disabled={reconcilingId === p.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition"
                            title="Query DGePay directly to reconcile"
                          >
                            <RefreshCw
                              size={11}
                              className={reconcilingId === p.id ? "animate-spin" : ""}
                            />
                            {reconcilingId === p.id ? "Checking..." : "Reconcile"}
                          </button>
                          <button
                            onClick={() => handleOpenDetails(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                          >
                            <Eye size={12} />
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg font-semibold"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Details & Reconcile Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Payment Details: {selectedPayment.payment_reference}
                  </h3>
                  <span className="text-[11px] text-slate-400">Gateway Transaction Audit</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Merchant Details Box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Merchant Information
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Company Name:</span>
                <span className="font-bold text-slate-900">{selectedPayment.company_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant Code:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {selectedPayment.merchant_code || "N/A"}
                </span>
              </div>
              {selectedPayment.contact_email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700">{selectedPayment.contact_email}</span>
                </div>
              )}
            </div>

            {/* Transaction Data */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transaction Specifications
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Linked Order Number:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedPayment.order_number || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Add-on Item:</span>
                <span className="font-bold text-slate-900">{selectedPayment.addon_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Charged:</span>
                <span className="font-black text-slate-900 text-sm">
                  ৳{Number(selectedPayment.amount || 0).toLocaleString()}{" "}
                  {selectedPayment.currency || "BDT"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="uppercase font-bold text-slate-800">
                  {selectedPayment.gateway || "DGePay"} ({selectedPayment.payment_method || "dgepay"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DGePay Txn ID:</span>
                <span className="font-mono text-slate-800 text-[11px]">
                  {selectedPayment.gateway_unique_txn_id || "N/A"}
                </span>
              </div>
              {selectedPayment.gateway_order_id && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Order ID:</span>
                  <span className="font-mono text-slate-700">{selectedPayment.gateway_order_id}</span>
                </div>
              )}
              {selectedPayment.gateway_transaction_id && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank / Channel Txn ID:</span>
                  <span className="font-mono text-slate-700">{selectedPayment.gateway_transaction_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-bold capitalize ${
                    selectedPayment.status === "successful"
                      ? "text-emerald-700"
                      : selectedPayment.status === "pending"
                      ? "text-amber-700"
                      : "text-rose-700"
                  }`}
                >
                  {selectedPayment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attempted At:</span>
                <span className="text-slate-600">
                  {new Date(selectedPayment.created_at).toLocaleString()}
                </span>
              </div>
              {selectedPayment.paid_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid At:</span>
                  <span className="text-emerald-700 font-semibold">
                    {new Date(selectedPayment.paid_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Gateway response viewer */}
            {selectedPayment.gateway_response && (
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-600 block mb-1">Raw Gateway Callback Response:</span>
                <pre className="font-mono text-[10px] text-slate-700 overflow-x-auto whitespace-pre-wrap max-h-28">
                  {typeof selectedPayment.gateway_response === "string"
                    ? selectedPayment.gateway_response
                    : JSON.stringify(selectedPayment.gateway_response, null, 2)}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleArchive(selectedPayment.id)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
              >
                <Archive size={12} />
                Archive
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => handleReconcile(selectedPayment.id)}
                  disabled={reconcilingId === selectedPayment.id}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <RefreshCw
                    size={13}
                    className={reconcilingId === selectedPayment.id ? "animate-spin" : ""}
                  />
                  {reconcilingId === selectedPayment.id ? "Checking Gateway..." : "Reconcile with DGePay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

