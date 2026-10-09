import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChevronDown } from "lucide-react";

export function RegistrationTrendCard({
  trendData = [],
  timeframe = "30days",
  onTimeframeChange,
}) {
  const chartData = trendData.map((d) => ({
    name: d.date ? `Oct ${new Date(d.date).getDate()}` : d.name || "",
    count: Number(d.count) || 0,
  }));

  const maxVal = Math.max(10, ...chartData.map((d) => d.count));
  const domainMax = Math.ceil(maxVal / 10) * 10;

  return (
    <div className="h-[260px] rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">Merchant Registrations</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">New merchant registrations over time</p>
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>Last 30 Days</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[185px] w-full mt-2">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No registration records found for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
              />
              <YAxis
                domain={[0, domainMax]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-slate-200 bg-[#0b1320] px-3 py-1.5 text-xs text-white shadow-xl">
                        <p className="font-semibold text-slate-300 text-[10px]">{label}</p>
                        <p className="font-bold text-emerald-400 text-xs">
                          • {payload[0].value} registrations
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#00875a" radius={[3, 3, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function ApplicationStatusCard({ statusDistribution = [] }) {
  const STATUS_CONFIG = [
    { key: "draft", label: "Draft", color: "#94a3b8" },
    { key: "submitted", label: "Submitted", color: "#3b82f6" },
    { key: "under_review", label: "Under Review", color: "#f59e0b" },
    { key: "additional_information_required", label: "Additional Info Required", color: "#ea580c" },
    { key: "approved", label: "Approved", color: "#00875a" },
    { key: "rejected", label: "Rejected", color: "#ef4444" },
    { key: "suspended", label: "Suspended", color: "#64748b" },
    { key: "active", label: "Active", color: "#06b6d4" },
  ];

  const statusMap = {};
  statusDistribution.forEach((s) => {
    statusMap[s.status] = Number(s.count) || 0;
  });

  const totalCount = statusDistribution.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

  const items = STATUS_CONFIG.map((cfg) => {
    const count = statusMap[cfg.key] || 0;
    const pct = totalCount > 0 ? `${((count / totalCount) * 100).toFixed(1)}%` : "0.0%";
    return {
      ...cfg,
      count,
      pct,
    };
  });

  const pieData = items
    .filter((i) => i.key !== "active" && i.count > 0)
    .map((i) => ({
      name: i.label,
      value: i.count,
      color: i.color,
    }));

  // If no data, show empty placeholder ring
  const finalPieData =
    pieData.length > 0
      ? pieData
      : [{ name: "No Data", value: 1, color: "#e2e8f0" }];

  return (
    <div className="h-[260px] rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 leading-tight">Application Status</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Current status of all merchant applications</p>
      </div>

      {/* Body: Donut chart on left, Breakdown on right */}
      <div className="flex items-center justify-between gap-2 h-[185px]">
        {/* Left Donut */}
        <div className="relative h-[160px] w-[160px] shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={finalPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={pieData.length > 1 ? 2 : 0}
                dataKey="value"
                stroke="none"
              >
                {finalPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base font-extrabold text-slate-900 leading-none">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Total</span>
          </div>
        </div>

        {/* Right Status Breakdown list */}
        <div className="flex-1 min-w-0 grid grid-cols-1 gap-1 text-[11px] pr-1">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-1 leading-none py-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-slate-600 font-medium text-[11px]">{item.label}</span>
              </div>
              <span className="font-bold text-slate-900 shrink-0 text-[11px]">
                {item.count}{" "}
                <span className="font-normal text-slate-400 text-[10px]">({item.pct})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
