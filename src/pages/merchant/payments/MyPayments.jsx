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
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

export default function MyPayments() {
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
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getAddonPayments({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
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
      console.error("Failed to load payments:", err);
      setError(err?.response?.data?.message || "Failed to load payments from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, page]);

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
      const res = await merchantApi.getAddonPaymentById(payment.id);
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

  const handleRefreshStatus = async (paymentId) => {
    try {
      setRefreshingId(paymentId);
      const res = await merchantApi.refreshPaymentStatus(paymentId);
      if (res.success) {
        // Update local list
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, ...(res.data || res.payment) } : p))
        );
        if (selectedPayment && selectedPayment.id === paymentId) {
          setSelectedPayment((prev) => ({ ...prev, ...(res.data || res.payment) }));
        }
        // Refresh overall stats
        fetchPayments();
      }
    } catch (err) {
      console.error("Failed to refresh payment status:", err);
      alert(err?.response?.data?.message || "Unable to refresh status with gateway.");
    } finally {
      setRefreshingId(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      p.payment_reference?.toLowerCase().includes(term) ||
      p.order_number?.toLowerCase().includes(term) ||
      p.gateway_unique_txn_id?.toLowerCase().includes(term) ||
      p.addon_name?.toLowerCase().includes(term) ||
      p.gateway?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Payments
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Review transaction attempts, gateway receipts, and live payment status confirmations
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
            to="/merchant/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition"
          >
            <ShoppingBag className="h-4 w-4 text-slate-600" />
            My Orders
          </Link>
          <Link
            to="/merchant/addons"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all duration-150"
          >
            <Layers className="h-4 w-4" />
            Add-ons
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
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Confirmed paid</span>
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
          <span className="text-[11px] text-slate-400 mt-0.5 block">User closed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-sm bg-gradient-to-br from-rose-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Failed</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.failedPayments}</p>
          <span className="text-[11px] text-rose-600/80 mt-0.5 block">Gateway declined</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-sm bg-emerald-50/70">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Verified Paid</p>
          <p className="text-xl font-black text-emerald-700 mt-1">
            ৳{Number(stats.totalCollectedAmount || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-700/80 mt-0.5 block font-semibold">Total settled BDT</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, txn id, or order..."
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
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading payment transactions from database...</p>
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
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No payment transactions found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            There are no payment attempts matching this criteria in your account history.
          </p>
          <Link
            to="/merchant/orders"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Check My Orders
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider">
                  <th className="p-4">Payment Reference</th>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Add-on Item</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Gateway Txn ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPayments.map((p) => {
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
                        <p className="font-bold text-slate-900 truncate max-w-[180px]">
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

                      <td className="p-4 font-mono text-slate-500 text-[11px] truncate max-w-[140px]">
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
                          {isPending && (
                            <button
                              onClick={() => handleRefreshStatus(p.id)}
                              disabled={refreshingId === p.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 transition"
                              title="Check status directly with DGePay"
                            >
                              <RefreshCw
                                size={11}
                                className={refreshingId === p.id ? "animate-spin" : ""}
                              />
                              {refreshingId === p.id ? "Checking..." : "Verify"}
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDetails(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                          >
                            <Eye size={12} />
                            Details
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

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Payment Details: {selectedPayment.payment_reference}
                  </h3>
                  <span className="text-[11px] text-slate-400">Gateway Transaction Record</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedPayment.order_number || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Item Name:</span>
                <span className="font-bold text-slate-900">{selectedPayment.addon_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Charged:</span>
                <span className="font-black text-slate-900">
                  ৳{Number(selectedPayment.amount || 0).toLocaleString()}{" "}
                  {selectedPayment.currency || "BDT"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="uppercase font-bold text-slate-800">
                  {selectedPayment.gateway || "DGePay"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Session / Txn ID:</span>
                <span className="font-mono text-slate-800 text-[11px]">
                  {selectedPayment.gateway_unique_txn_id || "N/A"}
                </span>
              </div>
              {selectedPayment.gateway_order_id && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Order ID:</span>
                  <span className="font-mono text-slate-700">
                    {selectedPayment.gateway_order_id}
                  </span>
                </div>
              )}
              {selectedPayment.gateway_transaction_id && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank / Channel Txn ID:</span>
                  <span className="font-mono text-slate-700">
                    {selectedPayment.gateway_transaction_id}
                  </span>
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
                <span className="text-slate-500">Initiated At:</span>
                <span className="text-slate-600">
                  {new Date(selectedPayment.created_at).toLocaleString()}
                </span>
              </div>
              {selectedPayment.paid_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmed Paid At:</span>
                  <span className="text-emerald-700 font-semibold">
                    {new Date(selectedPayment.paid_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {selectedPayment.gateway_response && (
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-600 block mb-1">Gateway Callback Data:</span>
                <pre className="font-mono text-[10px] text-slate-700 overflow-x-auto whitespace-pre-wrap max-h-24">
                  {typeof selectedPayment.gateway_response === "string"
                    ? selectedPayment.gateway_response
                    : JSON.stringify(selectedPayment.gateway_response, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {(selectedPayment.status === "pending" ||
                selectedPayment.status === "processing") && (
                <button
                  type="button"
                  onClick={() => handleRefreshStatus(selectedPayment.id)}
                  disabled={refreshingId === selectedPayment.id}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw
                    size={14}
                    className={refreshingId === selectedPayment.id ? "animate-spin" : ""}
                  />
                  {refreshingId === selectedPayment.id
                    ? "Verifying..."
                    : "Check Gateway Status"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

