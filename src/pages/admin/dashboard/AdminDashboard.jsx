import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  RotateCw,
  FileText,
  AlertTriangle,
  Ban,
  Shield,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { PrimaryKpiCard, SecondaryKpiCard } from "../../../components/admin/dashboard/AdminStatCard";
import {
  RegistrationTrendCard,
  ApplicationStatusCard,
} from "../../../components/admin/dashboard/DashboardChartCard";
import PendingApplicationsTable from "../../../components/admin/dashboard/PendingApplicationsTable";
import RecentMerchants from "../../../components/admin/dashboard/RecentMerchants";
import KycQueueCard from "../../../components/admin/dashboard/KycQueueCard";
import DocumentQueueCard from "../../../components/admin/dashboard/DocumentQueueCard";
import AdminActivity from "../../../components/admin/dashboard/AdminActivity";
import QuickActions from "../../../components/admin/dashboard/QuickActions";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("30days");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchDashboardData = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const res = await adminApi.getDashboard({ timeframe });
        if (res?.success) {
          setData(res.data);
          const now = new Date();
          setLastUpdated(
            now.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        } else {
          setError("Unable to load dashboard data. Please try again.");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Unable to load dashboard data. Please check your connection and try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeframe]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const stats = data?.stats || {};
  const registrationTrend = data?.registrationTrend || [];
  const applicationStatus = data?.applicationStatus || [];
  const pendingApplications = data?.pendingApplications || [];
  const recentMerchants = data?.recentMerchants || [];
  const kycQueue = data?.kycQueue || {};
  const documentQueue = data?.documentQueue || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-3.5 max-w-[1520px] mx-auto pb-4">
      {/* =====================================================
          1. DASHBOARD HEADER
      ====================================================== */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div>
          <h1 className="text-[26px] font-black tracking-tight text-slate-900 leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Monitor merchant registrations, onboarding progress, KYC reviews and platform activity.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          {lastUpdated && (
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
              Last updated: {lastUpdated}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#00875a] hover:bg-[#00734c] px-4 text-xs font-semibold text-white shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            <RotateCw
              size={14}
              className={`${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh Dashboard</span>
          </button>
        </div>
      </section>

      {/* =====================================================
          2. PRIMARY KPI GRID (6 CARDS IN 1 ROW)
      ====================================================== */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <PrimaryKpiCard
          title="Total Merchants"
          value={stats.totalMerchants || 0}
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-[#00875a]"
        />

        <PrimaryKpiCard
          title="New Registrations"
          value={stats.newRegistrations || 0}
          icon={UserPlus}
          iconBg="bg-emerald-50/80"
          iconColor="text-emerald-500"
        />

        <PrimaryKpiCard
          title="Pending Review"
          value={stats.pendingReview || 0}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />

        <PrimaryKpiCard
          title="Under Review"
          value={stats.underReview || 0}
          icon={Search}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />

        <PrimaryKpiCard
          title="Approved Merchants"
          value={stats.approved || 0}
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-[#00875a]"
        />

        <PrimaryKpiCard
          title="Rejected Applications"
          value={stats.rejected || 0}
          icon={XCircle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
      </section>

      {/* =====================================================
          3. SECONDARY KPI ROW (4 CARDS IN 1 ROW)
      ====================================================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SecondaryKpiCard
          title="KYC Pending"
          value={stats.kycPending || 0}
          icon={Shield}
          iconBg="bg-emerald-50"
          iconColor="text-[#00875a]"
        />

        <SecondaryKpiCard
          title="Documents Pending"
          value={stats.documentsPending || 0}
          icon={FileText}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />

        <SecondaryKpiCard
          title="Additional Information Required"
          value={stats.additionalInformationRequired || 0}
          icon={AlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />

        <SecondaryKpiCard
          title="Suspended Merchants"
          value={stats.suspended || 0}
          icon={Ban}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
      </section>

      {/* =====================================================
          4. CHARTS & QUICK ACTIONS SECTION (3 COLUMNS)
      ====================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Merchant Registrations Bar Chart (~44%) */}
        <div className="lg:col-span-5">
          <RegistrationTrendCard
            trendData={registrationTrend}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        {/* Application Status Donut Chart (~38%) */}
        <div className="lg:col-span-4">
          <ApplicationStatusCard statusDistribution={applicationStatus} />
        </div>

        {/* Quick Actions (~18%) */}
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </section>

      {/* =====================================================
          5. PENDING APPLICATIONS & RECENT REGISTRATIONS (2 COLUMNS)
      ====================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Pending Merchant Applications (~58%) */}
        <div className="lg:col-span-7">
          <PendingApplicationsTable applications={pendingApplications} />
        </div>

        {/* Recent Merchant Registrations (~42%) */}
        <div className="lg:col-span-5">
          <RecentMerchants merchants={recentMerchants} />
        </div>
      </section>

      {/* =====================================================
          6. LOWER SUMMARY ROW (3 EQUAL COLUMNS)
      ====================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KycQueueCard kycQueue={kycQueue} />
        <DocumentQueueCard documentQueue={documentQueue} />
        <AdminActivity activity={recentActivity} />
      </section>
    </div>
  );
}
