import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  CreditCard,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  Smartphone,
  Globe,
  FileText,
  Percent,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/status/StatusBadge";
import { merchantApi } from "../../../services/merchantApi";

export default function GatewayServices() {
  const navigate = useNavigate();
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    loadGateways();
  }, []);

  async function loadGateways() {
    try {
      setLoading(true);
      setError("");
      const res = await merchantApi.getGateways();
      if (res.success) {
        setGateways(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load gateway services:", err);
      setError("Unable to load gateway catalogue. Please refresh or try again later.");
    } finally {
      setLoading(false);
    }
  }

  const filteredGateways = gateways.filter((g) => {
    const matchesSearch =
      (g.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.code || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod =
      selectedMethod === "all"
        ? true
        : selectedMethod === "qr"
        ? g.qrSupported
        : selectedMethod === "card"
        ? g.cardSupported
        : selectedMethod === "mobile"
        ? g.mobileSupported
        : selectedMethod === "api"
        ? g.apiSupported
        : (g.supportedMethods || []).some((m) =>
            m.toLowerCase().includes(selectedMethod.toLowerCase())
          );

    const matchesType =
      selectedType === "all" ? true : g.serviceType?.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesMethod && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CreditCard size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Payment Gateway Services
                </h1>
                <p className="text-sm text-slate-500">
                  Explore and apply for authorized external payment gateways & interoperable BanglaQR channels.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/merchant/applications")}
              icon={Clock}
            >
              My Applications
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/merchant/services")}
              icon={CheckCircle2}
            >
              Active Services
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search gateways by name, method, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal size={13} /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedMethod("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedMethod === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Methods
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("qr")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                selectedMethod === "qr"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <QrCode size={13} /> QR Pay
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("mobile")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                selectedMethod === "mobile"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Smartphone size={13} /> MFS (bKash/Nagad)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("card")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                selectedMethod === "card"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <CreditCard size={13} /> Cards
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-200 bg-white">
          <Loader2 size={36} className="animate-spin text-emerald-600" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading authorized gateway services catalogue...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <AlertCircle size={22} className="shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Catalogue Error</h4>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadGateways}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filteredGateways.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-slate-200 bg-white p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <CreditCard size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No Gateways Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {searchQuery
              ? `No gateway matching "${searchQuery}" was found. Try clearing your search query.`
              : "No active gateway services are currently published by administration."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedMethod("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {!loading && !error && filteredGateways.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGateways.map((gateway) => {
            const hasApplied = Boolean(gateway.merchantApplicationStatus);
            const isApproved = gateway.merchantApplicationStatus === "approved";
            const isActivated = gateway.isActivated;

            return (
              <div
                key={gateway.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200"
              >
                <div>
                  {/* Top Bar: Icon + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200/60 p-2 text-slate-700 font-bold group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition">
                      {gateway.logoUrl ? (
                        <img
                          src={gateway.logoUrl}
                          alt={gateway.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <CreditCard size={24} />
                      )}
                    </div>

                    <div>
                      {isActivated ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : isApproved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
                          <Check size={12} /> Approved
                        </span>
                      ) : hasApplied ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                          <Clock size={12} /> Under Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gateway Name & Code */}
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {gateway.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {gateway.code} · {gateway.serviceType}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {gateway.description ||
                      "Authorized digital payment processing and merchant settlement service."}
                  </p>

                  {/* Capabilities / Badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {gateway.qrSupported && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                        <QrCode size={11} /> BanglaQR
                      </span>
                    )}
                    {gateway.mobileSupported && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200/60">
                        <Smartphone size={11} /> MFS
                      </span>
                    )}
                    {gateway.cardSupported && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
                        <CreditCard size={11} /> Cards
                      </span>
                    )}
                    {gateway.apiSupported && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        <Globe size={11} /> API
                      </span>
                    )}
                  </div>

                  {/* Supported Methods Tags */}
                  {gateway.supportedMethods && gateway.supportedMethods.length > 0 && (
                    <div className="mt-3 text-[11px] text-slate-500">
                      <span className="text-slate-400">Methods:</span>{" "}
                      <span className="font-medium text-slate-700">
                        {gateway.supportedMethods.slice(0, 4).join(", ")}
                        {gateway.supportedMethods.length > 4 && ` +${gateway.supportedMethods.length - 4}`}
                      </span>
                    </div>
                  )}

                  {/* Fees Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Transaction Fee
                      </p>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">
                        {gateway.serviceFee}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Setup Fee
                      </p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {gateway.setupFee === 0 ? "Free" : `৳ ${gateway.setupFee}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(`/merchant/gateways/${gateway.id}`)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                  >
                    View Details
                  </button>

                  {isActivated ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/merchant/services/${gateway.id}`)}
                      icon={ChevronRight}
                      iconPosition="right"
                    >
                      Configure
                    </Button>
                  ) : hasApplied ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/merchant/applications`)}
                      icon={Clock}
                    >
                      View Status
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/merchant/gateways/${gateway.id}/apply`)}
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

