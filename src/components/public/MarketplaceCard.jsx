import { QrCode, CreditCard, Code2, Building2, Smartphone, Layers, ShieldCheck, Zap } from "lucide-react";

export function getCapabilityIcon(index, text = "") {
  const lower = text.toLowerCase();
  if (lower.includes("qr") || lower.includes("কিউআর")) {
    return <QrCode size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
  }
  if (lower.includes("মার্চেন্ট") || lower.includes("অ্যাকাউন্ট") || lower.includes("কার্ড") || lower.includes("card")) {
    return <CreditCard size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
  }
  if (lower.includes("api") || lower.includes("ইন্টিগ্রেশন") || lower.includes("কোড")) {
    return <Code2 size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
  }
  if (lower.includes("ব্যাংক") || lower.includes("bank")) {
    return <Building2 size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
  }
  if (lower.includes("সেটেলমেন্ট") || lower.includes("ইনস্ট্যান্ট") || lower.includes("তাৎক্ষণিক")) {
    return <Zap size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
  }
  if (lower.includes("mfs") || lower.includes("ওয়ালেট")) {
    return <Smartphone size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
  }

  // Positional fallback
  if (index === 0) return <QrCode size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
  if (index === 1) return <CreditCard size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
  return <Code2 size={16} className="text-[#00875A] shrink-0" strokeWidth={2} />;
}

export default function MarketplaceCard({ service, logo, onDetails, onApply }) {
  if (!service) return null;

  const isLimited = service.availabilityStatus === "সীমিত" || service.isLimited;
  const statusText = service.availabilityStatus || (service.acceptsApplications ? "সক্রিয়" : "স্থগিত");

  // Format 3 capabilities rows
  const rawCaps = service.capabilities && service.capabilities.length > 0
    ? service.capabilities
    : ["QR পেমেন্ট", "মার্চেন্ট অ্যাকাউন্ট", "API ইন্টিগ্রেশন"];
  
  const displayCapabilities = rawCaps.slice(0, 3);
  while (displayCapabilities.length < 3) {
    if (displayCapabilities.length === 1) displayCapabilities.push("মার্চেন্ট অ্যাকাউন্ট");
    else displayCapabilities.push("API ইন্টিগ্রেশন");
  }

  return (
    <article className="h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 hover:shadow-xl hover:border-emerald-200/90 transition-all duration-300 group">
      <div>
        {/* Top Row: Provider Logo & Availability Badge */}
        <div className="flex items-center justify-between gap-3 h-10">
          <div className="h-9 max-w-[140px] flex items-center">
            {logo ? (
              <img
                src={logo}
                alt={service.name}
                className="h-full w-auto max-h-8 max-w-[130px] object-contain"
                loading="lazy"
              />
            ) : (
              <span className="text-base font-black tracking-tight text-slate-800">
                {service.name?.split(" ")[0] || "BanglaQR"}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold shrink-0 ${
              isLimited
                ? "bg-[#FEF6EE] text-[#F38B00]"
                : "bg-[#EAF8F2] text-[#00875A]"
            }`}
          >
            {statusText}
          </span>
        </div>

        {/* Service Name & Subtitle */}
        <div className="mt-4">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00875A] transition-colors leading-tight line-clamp-1">
            {service.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed min-h-[34px] line-clamp-2">
            {service.shortDescription || service.description || "QR পেমেন্ট, মার্চেন্ট অ্যাকাউন্ট ও ডিজিটাল ট্রানজেকশন সেবা।"}
          </p>
        </div>

        {/* 3 Capabilities Feature Rows matching Reference Image 1 */}
        <div className="mt-4 mb-5 space-y-2.5">
          {displayCapabilities.map((cap, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
              {getCapabilityIcon(i, cap)}
              <span className="font-medium line-clamp-1">{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons: Detail link & Apply button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onDetails?.(service)}
          className="text-xs font-semibold text-[#00875A] hover:underline flex items-center gap-1 cursor-pointer mb-3.5 transition group/link"
        >
          <span>বিস্তারিত দেখুন</span>
          <span className="inline-block transition-transform group-hover/link:translate-x-0.5">→</span>
        </button>

        <button
          type="button"
          disabled={!service.acceptsApplications}
          onClick={() => onApply?.(service)}
          className="w-full py-2.5 px-4 bg-[#00875A] hover:bg-[#00704A] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>এখনই আবেদন করুন</span>
          <span>→</span>
        </button>
      </div>
    </article>
  );
}

