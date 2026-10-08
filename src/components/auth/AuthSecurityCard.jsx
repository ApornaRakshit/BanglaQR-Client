import { ShieldCheck } from "lucide-react";

export default function AuthSecurityCard({
  title = "Secure registration",
  description = "Your account information is protected with secure authentication and data-protection practices.",
}) {
  return (
    <div className="mt-4 rounded-xl border border-emerald-100 bg-[#f2fbf6] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00a86b]/10 text-[#00a86b]">
          <ShieldCheck size={16} className="stroke-[2.2]" />
        </div>

        <div className="min-w-0">
          <h4 className="text-[11px] font-bold leading-tight text-slate-900">
            {title}
          </h4>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
