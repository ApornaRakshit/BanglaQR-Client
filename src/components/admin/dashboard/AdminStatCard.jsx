import { ArrowUp, ArrowDown } from "lucide-react";

export function PrimaryKpiCard({
  title,
  value,
  trend,
  trendUp = true,
  trendColor, // 'emerald' | 'red'
  icon: Icon,
  iconBg = "bg-emerald-50",
  iconColor = "text-[#00875a]",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`h-[96px] rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex items-center gap-3.5 transition ${
        onClick ? "hover:border-slate-300 hover:shadow-xs cursor-pointer" : ""
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        <Icon size={19} strokeWidth={2.2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-500 truncate leading-none">
          {title}
        </p>
        <h3 className="text-[22px] font-extrabold text-slate-900 leading-tight mt-1 truncate">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
        {trend && (
          <p
            className={`text-[10px] font-bold mt-0.5 flex items-center gap-0.5 truncate ${
              trendColor === "red"
                ? "text-red-500"
                : trendColor === "emerald" || trendUp
                ? "text-[#00875a]"
                : "text-red-500"
            }`}
          >
            <span>{trendUp ? "▲" : "▼"}</span>
            <span>{trend}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function SecondaryKpiCard({
  title,
  value,
  trend,
  trendUp = true,
  trendColor,
  icon: Icon,
  iconBg = "bg-slate-50",
  iconColor = "text-[#00875a]",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`h-[76px] rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-2xs flex items-center justify-between gap-3 transition ${
        onClick ? "hover:border-slate-300 hover:shadow-xs cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
        >
          <Icon size={17} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-600 truncate leading-none">
            {title}
          </p>
          <h4 className="text-[20px] font-extrabold text-slate-900 leading-tight mt-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h4>
        </div>
      </div>

      {trend && (
        <span
          className={`text-[10px] font-bold shrink-0 ${
            trendColor === "red"
              ? "text-red-500"
              : trendColor === "emerald" || trendUp
              ? "text-[#00875a]"
              : "text-red-500"
          }`}
        >
          {trendUp ? "▲" : "▼"} {trend}
        </span>
      )}
    </div>
  );
}

export default PrimaryKpiCard;
