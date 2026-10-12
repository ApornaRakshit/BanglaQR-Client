import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
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
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    awaitingPaymentOrders: 0,
    processingOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
    failedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [resumingId, setResumingId] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getAddonOrders({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        limit: 15,
      });

      const list = res.data || res.orders || [];
      setOrders(Array.isArray(list) ? list : []);

      // Calculate stats or use backend stats
      const total = res.pagination?.total || list.length;
      const awaiting = list.filter((o) => o.status === "pending_payment" || o.status === "awaiting_payment").length;
      const processing = list.filter((o) => o.status === "processing").length;
      const paid = list.filter((o) => o.status === "paid" || o.status === "active").length;
      const cancelled = list.filter((o) => o.status === "cancelled").length;
      const failed = list.filter((o) => o.status === "failed").length;

      setStats({
        totalOrders: total,
        awaitingPaymentOrders: awaiting,
        processingOrders: processing,
        paidOrders: paid,
        cancelledOrders: cancelled,
        failedOrders: failed,
      });

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err?.response?.data?.message || "Failed to load orders from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleOpenDetails = async (order) => {
    setSelectedOrder(order);
    try {
      setOrderDetailsLoading(true);
      const details = await merchantApi.getAddonOrderById(order.id);
      if (details.data || details.order) {
        setSelectedOrder({
          ...order,
          ...(details.data || details.order),
          payments: details.payments || [],
        });
      }
    } catch (err) {
      console.error("Failed to load detailed order info:", err);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleResumePayment = async (orderId) => {
    try {
      setResumingId(orderId);
      const res = await merchantApi.resumeOrderCheckout(orderId);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert(res.message || "Payment session could not be established.");
      }
    } catch (err) {
      console.error("Failed to resume checkout:", err);
      alert(err?.response?.data?.message || "Unable to initiate payment session.");
    } finally {
      setResumingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(term) ||
      o.addon_name?.toLowerCase().includes(term) ||
      o.addon_code?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Review and manage your add-on subscriptions, hardware orders, and payment statuses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/merchant/addons"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all duration-150"
          >
            <Layers className="h-4 w-4" />
            Explore Add-ons
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">All records</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-sm bg-gradient-to-br from-amber-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Awaiting Payment</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.awaitingPaymentOrders}</p>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Pending checkout</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-sm bg-gradient-to-br from-blue-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Processing</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.processingOrders}</p>
          <span className="text-[11px] text-blue-600/80 mt-0.5 block">In fulfillment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-emerald-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Paid & Active</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.paidOrders}</p>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Activated services</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cancelled</p>
          <p className="text-2xl font-black text-slate-500 mt-1">{stats.cancelledOrders}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Revoked</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-sm bg-gradient-to-br from-rose-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Failed</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.failedOrders}</p>
          <span className="text-[11px] text-rose-600/80 mt-0.5 block">Payment errors</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order number or add-on..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending_payment", label: "Awaiting Payment" },
            { id: "paid", label: "Paid" },
            { id: "active", label: "Active" },
            { id: "cancelled", label: "Cancelled" },
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

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading your orders from database...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No orders found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't placed any add-on subscription orders matching this criteria.
          </p>
          <Link
            to="/merchant/addons"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Browse Available Add-ons
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider">
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Item / Service</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Billing Cycle</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((ord) => {
                  const isAwaitingPayment =
                    ord.status === "pending_payment" || ord.status === "awaiting_payment";
                  const isPaid = ord.status === "paid" || ord.status === "active";

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {ord.order_number}
                          </span>
                          <button
                            onClick={() => handleCopy(ord.order_number)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                            title="Copy Order Number"
                          >
                            {copiedText === ord.order_number ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-900">{ord.addon_name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{ord.addon_code}</span>
                      </td>

                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(ord.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        ৳{Number(ord.amount || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">BDT</span>
                      </td>

                      <td className="p-4 capitalize text-slate-600">
                        {ord.billing_cycle || "Monthly"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isAwaitingPayment
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={11} /> : isAwaitingPayment ? <Clock size={11} /> : <XCircle size={11} />}
                          {ord.status?.replace("_", " ")}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isAwaitingPayment
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isPaid ? "Paid" : isAwaitingPayment ? "Pending" : "Unpaid"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAwaitingPayment && (
                            <button
                              onClick={() => handleResumePayment(ord.id)}
                              disabled={resumingId === ord.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                              title="Pay now with DGePay"
                            >
                              <CreditCard size={12} />
                              {resumingId === ord.id ? "Connecting..." : "Complete Payment"}
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDetails(ord)}
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
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Order Details: {selectedOrder.order_number}
                  </h3>
                  <span className="text-[11px] text-slate-400">BanglaQR Service Order</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Service / Add-on:</span>
                <span className="font-bold text-slate-900">{selectedOrder.addon_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Code:</span>
                <span className="font-mono text-slate-700">{selectedOrder.addon_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authoritative Price:</span>
                <span className="font-black text-slate-900">
                  ৳{Number(selectedOrder.amount || 0).toLocaleString()} {selectedOrder.currency || "BDT"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="capitalize text-slate-800">{selectedOrder.billing_cycle || "Monthly"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Status:</span>
                <span className="font-bold capitalize text-emerald-700">
                  {selectedOrder.status?.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created At:</span>
                <span className="text-slate-600">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Order Notes:</span>
                <p>{selectedOrder.notes}</p>
              </div>
            )}

            {/* Payment history for this order */}
            {selectedOrder.payments && selectedOrder.payments.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Linked Payment Transactions
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedOrder.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900">{p.payment_reference}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Txn: {p.gateway_unique_txn_id || "N/A"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">৳{Number(p.amount).toLocaleString()}</span>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            p.status === "successful" ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {(selectedOrder.status === "pending_payment" || selectedOrder.status === "awaiting_payment") && (
                <button
                  type="button"
                  onClick={() => handleResumePayment(selectedOrder.id)}
                  disabled={resumingId === selectedOrder.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <CreditCard size={14} />
                  {resumingId === selectedOrder.id ? "Connecting..." : "Pay via DGePay"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

