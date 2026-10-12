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
  Building2,
  Mail,
  Phone,
  Archive,
  Sparkles,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    awaitingPaymentOrders: 0,
    processingOrders: 0,
    paidOrders: 0,
    activeSubscriptions: 0,
    cancelledOrders: 0,
    failedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAddonOrders({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        limit: 15,
      });

      const list = res.data || res.orders || [];
      setOrders(Array.isArray(list) ? list : []);

      if (res.stats) {
        setStats(res.stats);
      } else {
        const total = res.pagination?.total || list.length;
        const awaiting = list.filter(
          (o) => o.status === "pending_payment" || o.status === "awaiting_payment"
        ).length;
        const processing = list.filter((o) => o.status === "processing").length;
        const paid = list.filter((o) => o.status === "paid" || o.status === "active").length;
        const active = list.filter((o) => o.status === "active").length;
        const cancelled = list.filter((o) => o.status === "cancelled").length;
        const failed = list.filter((o) => o.status === "failed").length;

        setStats({
          totalOrders: total,
          awaitingPaymentOrders: awaiting,
          processingOrders: processing,
          paidOrders: paid,
          activeSubscriptions: active,
          cancelledOrders: cancelled,
          failedOrders: failed,
        });
      }

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
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
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleOpenDetails = async (order) => {
    setSelectedOrder(order);
    setReviewNotes(order.admin_notes || "");
    try {
      setOrderDetailsLoading(true);
      const res = await adminApi.getAddonOrderById(order.id);
      if (res.data || res.order) {
        setSelectedOrder({
          ...order,
          ...(res.data || res.order),
          payments: res.payments || [],
        });
      }
    } catch (err) {
      console.error("Failed to load detailed order info:", err);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleReviewOrder = async (orderId, action) => {
    try {
      setReviewingId(orderId);
      const res = await adminApi.reviewAddonOrder(orderId, {
        action,
        notes: reviewNotes,
      });

      if (res.success) {
        showToast(res.message || `Order successfully updated to ${action}`);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            status: action === "activate" ? "active" : action === "approve" ? "approved" : "cancelled",
            admin_notes: reviewNotes,
          }));
        }
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to review order:", err);
      showToast(err?.response?.data?.message || "Failed to update order status", "error");
    } finally {
      setReviewingId(null);
    }
  };

  const handleArchiveOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to archive this order from active view?")) return;
    try {
      await adminApi.archiveAddonOrder(orderId, { reason: "Archived by Admin" });
      showToast("Order archived successfully");
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      fetchOrders();
    } catch (err) {
      console.error("Failed to archive order:", err);
      showToast("Failed to archive order", "error");
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
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Order Management
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Live Add-ons
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Review and manage all merchant add-on orders, lifecycle states, and subscription fulfillments
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
            to="/admin/payments"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition"
          >
            <CreditCard className="h-4 w-4 text-slate-600" />
            Payment Records
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
          <span className="text-[11px] text-blue-600/80 mt-0.5 block">Under fulfillment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-emerald-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Paid / Active</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats.paidOrders || stats.activeSubscriptions}
          </p>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Active subscriptions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cancelled</p>
          <p className="text-2xl font-black text-slate-500 mt-1">{stats.cancelledOrders}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Voided</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-sm bg-gradient-to-br from-rose-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Failed</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.failedOrders}</p>
          <span className="text-[11px] text-rose-600/80 mt-0.5 block">Payment errors</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, merchant code, company, or add-on..."
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
            { id: "processing", label: "Processing" },
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
          <RefreshCw className="h-8 w-8 text-[#00875a] animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading order records from database...</p>
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
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No orders found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            There are no merchant orders matching the current filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold tracking-wider">
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Merchant Profile</th>
                  <th className="p-4">Item / Service</th>
                  <th className="p-4">Date Placed</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => {
                  const isPaid = ord.status === "paid" || ord.status === "active";
                  const isAwaitingPayment =
                    ord.status === "pending_payment" || ord.status === "awaiting_payment";

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
                        <p className="font-bold text-slate-900 truncate max-w-[180px]">
                          {ord.company_name || "Merchant #" + ord.merchant_id}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="font-mono font-semibold">{ord.merchant_code || "N/A"}</span>
                          {ord.contact_email && (
                            <span className="truncate max-w-[120px]">{ord.contact_email}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-900">{ord.addon_name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="font-mono">{ord.addon_code}</span>
                          <span>•</span>
                          <span className="capitalize">{ord.billing_cycle || "Monthly"}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(ord.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                        ৳{Number(ord.amount || 0).toLocaleString()}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {ord.currency || "BDT"}
                        </span>
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
                          {isPaid ? (
                            <CheckCircle2 size={11} />
                          ) : isAwaitingPayment ? (
                            <Clock size={11} />
                          ) : (
                            <XCircle size={11} />
                          )}
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(ord)}
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

      {/* Order Management & Review Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Order Details: {selectedOrder.order_number}
                  </h3>
                  <span className="text-[11px] text-slate-400">Merchant Service Subscription</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Merchant Profile Box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Merchant Information
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Company Name:</span>
                <span className="font-bold text-slate-900">{selectedOrder.company_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant Code:</span>
                <span className="font-mono font-bold text-emerald-700">{selectedOrder.merchant_code || "N/A"}</span>
              </div>
              {selectedOrder.contact_email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700">{selectedOrder.contact_email}</span>
                </div>
              )}
              {selectedOrder.contact_phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-700">{selectedOrder.contact_phone}</span>
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Order & Pricing Specifications
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Add-on Item:</span>
                <span className="font-bold text-slate-900">{selectedOrder.addon_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Code / SKU:</span>
                <span className="font-mono text-slate-700">{selectedOrder.addon_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Amount:</span>
                <span className="font-black text-slate-900 text-sm">
                  ৳{Number(selectedOrder.amount || 0).toLocaleString()} {selectedOrder.currency || "BDT"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="capitalize text-slate-800">{selectedOrder.billing_cycle || "Monthly"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold capitalize text-emerald-700">
                  {selectedOrder.status?.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Placed Date:</span>
                <span className="text-slate-600">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Linked Payments */}
            {selectedOrder.payments && selectedOrder.payments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Linked Payment Transactions ({selectedOrder.payments.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedOrder.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900">{p.payment_reference}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">
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

            {/* Admin Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Administrative Notes:
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter internal fulfillment or audit notes..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleArchiveOrder(selectedOrder.id)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
              >
                <Archive size={12} />
                Archive
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>

                {selectedOrder.status !== "active" && (
                  <button
                    type="button"
                    onClick={() => handleReviewOrder(selectedOrder.id, "activate")}
                    disabled={reviewingId === selectedOrder.id}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    <CheckCircle2 size={13} />
                    {reviewingId === selectedOrder.id ? "Updating..." : "Activate / Mark Paid"}
                  </button>
                )}

                {selectedOrder.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => handleReviewOrder(selectedOrder.id, "reject")}
                    disabled={reviewingId === selectedOrder.id}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
                  >
                    <XCircle size={13} />
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

