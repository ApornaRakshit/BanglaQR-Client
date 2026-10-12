import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  AlertCircle,
  RefreshCw,
  X,
  CreditCard,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

export default function Addons() {
  const [searchParams, setSearchParams] = useSearchParams();
  const applyAddonId = searchParams.get("apply");
  const paymentStatus = searchParams.get("paymentStatus");
  const orderNumber = searchParams.get("order");
  const paymentRef = searchParams.get("paymentRef");

  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [applying, setApplying] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [applicationNotes, setApplicationNotes] = useState("");

  const fetchAddons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getAddons();
      setAddons(res.data || []);
    } catch (err) {
      console.error("Failed to load addons:", err);
      setError(err.response?.data?.message || "Failed to load add-on services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  useEffect(() => {
    if (applyAddonId && addons.length > 0) {
      const match = addons.find((a) => String(a.id) === String(applyAddonId));
      if (match && !match.is_activated && !match.isActivated) {
        setSelectedAddon(match);
      }
    }
  }, [applyAddonId, addons]);

  const categories = ["all", ...new Set(addons.map((a) => a.category).filter(Boolean))];

  const filteredAddons = addons.filter((item) => {
    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const clearPaymentBanner = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("payment");
    newParams.delete("paymentStatus");
    newParams.delete("order");
    newParams.delete("paymentRef");
    setSearchParams(newParams, { replace: true });
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedAddon) return;

    try {
      setApplying(true);
      setModalError(null);
      setModalSuccess(null);

      const res = await merchantApi.createAddonOrder(selectedAddon.id, {
        notes: applicationNotes,
      });

      if (res?.checkoutUrl) {
        setModalSuccess("Redirecting to DGePay secure payment gateway...");
        window.location.href = res.checkoutUrl;
        return;
      }

      setModalSuccess(res?.message || "Add-on activated successfully!");
      fetchAddons();
      setTimeout(() => {
        setSelectedAddon(null);
        setModalSuccess(null);
        setApplicationNotes("");
      }, 1500);
    } catch (err) {
      console.error("Failed to apply addon:", err);
      setModalError(err.response?.data?.message || "Failed to initiate add-on order");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Callback Notification Banner */}
      {paymentStatus && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-sm transition-all ${
            paymentStatus === "successful" || paymentStatus === "paid"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : paymentStatus === "cancelled"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {paymentStatus === "successful" || paymentStatus === "paid" ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            )}
            <div>
              <h4 className="text-sm font-bold">
                {paymentStatus === "successful" || paymentStatus === "paid"
                  ? "পেমেন্ট সফল হয়েছে! (Payment Completed)"
                  : paymentStatus === "cancelled"
                  ? "পেমেন্ট বাতিল করা হয়েছে (Payment Cancelled)"
                  : "পেমেন্ট সম্পন্ন হয়নি (Payment Incomplete / Failed)"}
              </h4>
              <p className="text-xs mt-0.5 opacity-90">
                {paymentStatus === "successful" || paymentStatus === "paid"
                  ? `আপনার অ্যাড-অন সার্ভিসটি সফলভাবে সক্রিয় করা হয়েছে। অর্ডার: ${orderNumber || "N/A"}`
                  : `অনলাইন পেমেন্ট সম্পন্ন করা সম্ভব হয়নি। ট্রানজেকশন রেফারেন্স: ${paymentRef || "N/A"}। অনুগ্রহ করে পুনরায় চেষ্টা করুন।`}
              </p>
            </div>
          </div>
          <button
            onClick={clearPaymentBanner}
            className="p-1 rounded-lg hover:bg-black/5 transition text-slate-500 hover:text-slate-800"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Value-Added Add-ons & Plugins
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Supercharge your BanglaQR operations with automated fraud protection, analytics, and notification plugins
            </p>
          </div>
        </div>

        <button
          onClick={fetchAddons}
          disabled={loading}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Refresh addons"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search add-on features, fraud prevention, reporting..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 capitalize focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c === "all" ? "All Categories" : c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Addons Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading add-on catalogue...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchAddons}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredAddons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No add-on services found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or check back later for newly published extensions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAddons.map((item) => {
            const isApplied = item.merchant_status === "applied" || item.merchant_status === "under_review";
            const isSubscribed = item.merchant_status === "approved" || item.merchant_status === "activated";

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-200 hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    {item.category && (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {item.category.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-4">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-slate-900">
                      {item.price > 0 ? `৳${item.price}` : "Free"}
                    </span>
                    {item.price > 0 && item.billing_cycle && (
                      <span className="text-xs text-slate-500">/ {item.billing_cycle}</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {isSubscribed ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Active Plugin
                    </div>
                  ) : item.has_unpaid_order || item.order_status === "pending_payment" ? (
                    <button
                      onClick={() => {
                        if (item.checkout_url) {
                          window.location.href = item.checkout_url;
                        } else {
                          setSelectedAddon(item);
                        }
                      }}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Complete Payment (৳{item.price})
                    </button>
                  ) : item.is_under_review || item.application_status === "under_review" ? (
                    <div className="w-full py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Application Under Review
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedAddon(item)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Subscribe Add-on
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {selectedAddon && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Subscribe to {selectedAddon.name}
                  </h3>
                  <span className="text-xs text-slate-500">Add-on Activation Request</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAddon(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalSuccess ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                {modalSuccess}
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 my-5">
                {modalError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    {modalError}
                  </div>
                )}

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Add-on Name:</span>
                    <span className="font-semibold text-slate-800">{selectedAddon.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pricing:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAddon.price > 0
                        ? `৳${selectedAddon.price} / ${selectedAddon.billing_cycle || "month"}`
                        : "Free"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Integration Notes / Requirements (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any specific requirements or instructions for this add-on..."
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {selectedAddon.price > 0 && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-800">
                      <CreditCard className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        Secure online checkout via <strong>DGePay Gateway</strong>. You will be redirected to complete payment with bKash, Nagad, Cards or Net Banking.
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAddon(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {applying
                      ? selectedAddon.price > 0
                        ? "Connecting to DGePay..."
                        : "Activating..."
                      : selectedAddon.price > 0
                      ? `Pay ৳${selectedAddon.price} via DGePay`
                      : "Confirm & Activate Free"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

