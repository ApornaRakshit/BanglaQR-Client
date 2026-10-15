import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Building2,
  ArrowRight,
  RefreshCw,
  Landmark,
  Download,
  Calendar,
  Eye,
  TrendingUp,
  ShoppingBag,
  Utensils,
  Pill,
  Store,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { institutionApi } from "../../services/institutionApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLORS = {
  Approved: "#10b981",
  "Pending Review": "#f59e0b",
  "Under Review": "#3b82f6",
  Rejected: "#ef4444",
  "Additional Info": "#6366f1",
};

const MERCHANT_ICONS = {
  "Retail Shop": ShoppingBag,
  Restaurant: Utensils,
  Pharmacy: Pill,
  "Super Shop": Store,
  Education: GraduationCap,
};

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("01 Oct 2026 - 31 Oct 2026");

  const institutionName =
    user?.institution?.name ||
    user?.institutionMemberships?.[0]?.name ||
    "Bank Partner";

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await institutionApi.getDashboard();
      setStats(res.data || {});
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const appData = stats?.applications || {};
  const totalApps = appData.total ?? 0;
  const pendingCount = appData.pending ?? 0;
  const underReviewCount = appData.underReview ?? 0;
  const approvedCount = appData.approved ?? 0;
  const rejectedCount = appData.rejected ?? 0;
  const additionalInfoCount = appData.additionalInfo ?? appData.correctionRequired ?? 0;
  const activeMerchants = stats?.activeMerchants ?? 0;

  // Donut chart status breakdown data
  const pieData = [
    { name: "Approved", value: approvedCount, color: "#10b981" },
    { name: "Pending Review", value: pendingCount, color: "#f59e0b" },
    { name: "Under Review", value: underReviewCount, color: "#3b82f6" },
    { name: "Rejected", value: rejectedCount, color: "#ef4444" },
    { name: "Additional Info", value: additionalInfoCount, color: "#6366f1" },
  ].filter((item) => item.value > 0);

  // Fallback pie slice if total is 0 to draw clean empty donut
  const displayPieData =
    pieData.length > 0
      ? pieData
      : [{ name: "No Applications", value: 1, color: "#e2e8f0" }];

  // 30-Day Trend Data
  const trendData =
    stats?.trend && stats.trend.length > 0
      ? stats.trend
      : [
          { date: "1 Oct", total: 0, approved: 0, pending: 0, rejected: 0 },
          { date: "5 Oct", total: 0, approved: 0, pending: 0, rejected: 0 },
          { date: "10 Oct", total: 0, approved: 0, pending: 0, rejected: 0 },
          { date: "15 Oct", total: 0, approved: 0, pending: 0, rejected: 0 },
          { date: "20 Oct", total: 0, approved: 0, pending: 0, rejected: 0 },
          { date: "25 Oct", total: 0, approved: 0, pending: 0, rejected: 0 },
          { date: "31 Oct", total: 0, approved: 0, pending: 0, rejected: 0 },
        ];

  // Top Merchant Types
  const merchantTypes =
    stats?.merchantTypes && stats.merchantTypes.length > 0
      ? stats.merchantTypes
      : [
          { type: "Retail Shop", count: 0, percentage: 0 },
          { type: "Restaurant", count: 0, percentage: 0 },
          { type: "Pharmacy", count: 0, percentage: 0 },
          { type: "Super Shop", count: 0, percentage: 0 },
          { type: "Education", count: 0, percentage: 0 },
        ];

  const recentApplications = stats?.recentApplications || [];
  const recentActivities = stats?.recentActivities || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Approved
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            Under Review
          </span>
        );
      case "additional_information_required":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            Additional Info
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "applied":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            Pending Review
          </span>
        );
    }
  };

  const handleDownloadReport = () => {
    if (!stats) return;
    const jsonStr = JSON.stringify(stats, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bank_dashboard_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage merchant applications, KYC verification, and service onboarding for {institutionName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 shadow-2xs font-medium">
            <Calendar size={13} className="text-slate-400" />
            <span>{dateRange}</span>
          </div>

          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Download size={13} />
            <span>Download Report</span>
          </button>

          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-2xs transition cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Primary KPI Stats Row (6 Cards exactly matching reference) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Applications */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total Applications</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalApps}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                ↑ 12%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">vs last month</span>
          </div>
        </div>

        {/* 2. Pending Review */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Pending Review</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
              <span className="text-[10px] font-bold text-red-500 flex items-center">
                ↓ 33%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">vs last month</span>
          </div>
        </div>

        {/* 3. Under Review */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Under Review</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <RefreshCw size={15} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">{underReviewCount}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                ↑ 20%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">vs last month</span>
          </div>
        </div>

        {/* 4. Approved */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Approved</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{approvedCount}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                ↑ 18%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">vs last month</span>
          </div>
        </div>

        {/* 5. Rejected */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Rejected</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <XCircle size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-red-600">{rejectedCount}</span>
              <span className="text-[10px] font-bold text-red-500 flex items-center">
                ↓ 5%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">vs last month</span>
          </div>
        </div>

        {/* 6. Active Merchants */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Active Merchants</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{activeMerchants}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                ↑ 10%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts & Distribution Row (Application Trend, Applications by Status, Top Merchant Types) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Application Trend Line Chart (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Application Trend</h3>
              <p className="text-[10px] text-slate-400">Monthly pipeline velocity</p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Total
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications by Status Donut Chart (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-xs font-bold text-slate-900">Applications by Status</h3>
            <span className="text-[10px] text-slate-400 font-medium">Real-time</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            {/* Donut representation */}
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 leading-none">{totalApps}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Total</span>
              </div>
            </div>

            {/* Status Breakdown Legend */}
            <div className="space-y-1.5 flex-1 pl-3 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Approved</span>
                </span>
                <span className="font-bold text-slate-800">
                  {approvedCount} <span className="text-slate-400 text-[10px]">({totalApps > 0 ? Math.round((approvedCount / totalApps) * 100) : 0}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Pending Review</span>
                </span>
                <span className="font-bold text-slate-800">
                  {pendingCount} <span className="text-slate-400 text-[10px]">({totalApps > 0 ? Math.round((pendingCount / totalApps) * 100) : 0}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Under Review</span>
                </span>
                <span className="font-bold text-slate-800">
                  {underReviewCount} <span className="text-slate-400 text-[10px]">({totalApps > 0 ? Math.round((underReviewCount / totalApps) * 100) : 0}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Rejected</span>
                </span>
                <span className="font-bold text-slate-800">
                  {rejectedCount} <span className="text-slate-400 text-[10px]">({totalApps > 0 ? Math.round((rejectedCount / totalApps) * 100) : 0}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Additional Info</span>
                </span>
                <span className="font-bold text-slate-800">
                  {additionalInfoCount} <span className="text-slate-400 text-[10px]">({totalApps > 0 ? Math.round((additionalInfoCount / totalApps) * 100) : 0}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Merchant Types (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-xs font-bold text-slate-900">Top Merchant Types</h3>
            <Link to="/institution/applications" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {merchantTypes.map((item, idx) => {
              const Icon = MERCHANT_ICONS[item.type] || Store;
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                      <Icon size={14} />
                    </div>
                    <span className="font-medium text-slate-800 truncate max-w-[110px]" title={item.type}>
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{item.count}</span>
                    <span className="text-[11px] text-slate-400 w-7 text-right">{item.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Applications & Latest Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Applications (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-xs font-bold text-slate-900">Recent Applications</h3>
            <Link to="/institution/applications" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-2.5">#</th>
                  <th className="pb-2.5">Merchant Name</th>
                  <th className="pb-2.5">Business Type</th>
                  <th className="pb-2.5">Submitted On</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No merchant applications found.
                    </td>
                  </tr>
                ) : (
                  recentApplications.map((app, index) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 font-mono text-slate-400 text-[11px]">{index + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {app.merchantName[0]?.toUpperCase() || "M"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block text-xs">
                              {app.merchantName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {app.applicationNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 text-xs">{app.businessType}</td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {app.submittedAt
                          ? new Date(app.submittedAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3">{getStatusBadge(app.status)}</td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/institution/applications/${app.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition"
                        >
                          <span>View</span>
                          <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Activities (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-xs font-bold text-slate-900">Latest Activities</h3>
            <Link to="/institution/connections" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No recent activity logs recorded yet.
              </p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-600">
                    <Sparkles size={13} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 capitalize truncate">
                      {act.action.replace(/[._]/g, " ")}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {act.statusTransition || act.userEmail || `ID #${act.resourceId}`}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
