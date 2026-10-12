import { useState, useEffect } from "react";
import api from "../../../services/api";
import { resolveServiceLogo, resolveImageUrl as centralResolveImageUrl } from "../../../utils/imageUtils";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Landmark,
  Menu,
  MessageCircle,
  QrCode,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Utensils,
  ShoppingBag,
  GraduationCap,
  Activity,
  X,
  Zap,
  Star,
  Layers,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  CreditCard,
  FileCheck,
  BellRing,
  Code2,
  MousePointerClick,
  FileText,
  CheckCircle2,
} from "lucide-react";

import logoImg from "../../../assets/logo.jpg";
import authBg from "../../../assets/authbg.jpg";
import bkashLogo from "../../../assets/paymentLogos/bkash.png";
import nagadLogo from "../../../assets/paymentLogos/nagad.webp";
import rocketLogo from "../../../assets/paymentLogos/roket.webp";
import upayLogo from "../../../assets/paymentLogos/upay.webp";
import visaLogo from "../../../assets/paymentLogos/visa.png";
import mastercardLogo from "../../../assets/paymentLogos/mastercard.png";
import cafeCounter from "../../../assets/home/cafe-counter.png";
import educationImage from "../../../assets/home/education.png";
import healthcareImage from "../../../assets/home/healthcare.png";
import corporateImage from "../../../assets/home/corporate.png";
import dashboardImage from "../../../assets/home/payment-dashboard.png";
import paymentMoment from "../../../assets/home/payment-moment.png";
import paymentCheckout from "../../../assets/home/payment-checkout.png";

// Helper map to resolve lucide icons from strings
const ICON_MAP = {
  QrCode,
  BarChart3,
  ShieldCheck,
  Zap,
  Store,
  Smartphone,
  Headphones,
  CheckCircle: Check,
  CreditCard: Landmark,
  Utensils,
  ShoppingBag,
  GraduationCap,
  Building2,
  Activity,
  Calendar,
  Settings,
  Layers,
  HelpCircle,
};

const DEFAULT_PARTNER_LOGOS = {
  bKash: bkashLogo,
  bkash: bkashLogo,
  "নগদ": nagadLogo,
  nagad: nagadLogo,
  "রকেট": rocketLogo,
  rocket: rocketLogo,
  upay: upayLogo,
  VISA: visaLogo,
  visa: visaLogo,
  mastercard: mastercardLogo,
};

const DEFAULT_SOLUTION_IMAGES = [
  cafeCounter,
  paymentCheckout,
  paymentMoment,
  educationImage,
  corporateImage,
  healthcareImage,
];

// Helper to get full image url
function resolveImageUrl(url, fallback) {
  return centralResolveImageUrl(url, fallback);
}

export default function CmsLivePreview({
  cmsData = {},
  activeSection = "navbar",
  viewport = "desktop",
}) {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [liveServices, setLiveServices] = useState([]);

  useEffect(() => {
    api
      .get("/public/marketplace/services")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setLiveServices(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const getIcon = (name, FallbackIcon = Sparkles) => {
    return ICON_MAP[name] || FallbackIcon;
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[375px] shadow-2xl rounded-3xl border-8 border-slate-800";
      case "tablet":
        return "max-w-[768px] shadow-xl rounded-2xl border-4 border-slate-800";
      case "desktop":
      default:
        return "w-full";
    }
  };

  const navbar = cmsData.navbar || {};
  const hero = cmsData.hero || {};
  const partners = cmsData.partners || {};
  const whyBanglaQr = cmsData.whyBanglaQr || {};
  const businessGrowth = cmsData.businessGrowth || {};
  const howItWorks = cmsData.howItWorks || {};
  const dashboardShowcase = cmsData.dashboardShowcase || {};
  const businessSolutions = cmsData.businessSolutions || {};
  const packages = cmsData.packages || {};
  const testimonials = cmsData.testimonials || {};
  const marketplace = cmsData.marketplace || {};
  const finalCta = cmsData.finalCta || {};
  const contact = cmsData.contact || {};
  const footer = cmsData.footer || {};

  const testimonialsList = (testimonials.testimonialsList || []).filter((t) => t.isActive !== false);

  const nextTestimonial = () => {
    if (testimonialsList.length === 0) return;
    setTestimonialIndex((current) => (current + 1) % testimonialsList.length);
  };

  const prevTestimonial = () => {
    if (testimonialsList.length === 0) return;
    setTestimonialIndex((current) => (current - 1 + testimonialsList.length) % testimonialsList.length);
  };

  return (
    <div className="flex flex-col items-center justify-start w-full bg-slate-100/70 p-3 sm:p-6 overflow-x-auto transition-all">
      <div
        className={`relative overflow-hidden bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200/80 transition-all duration-300 ${getViewportWidthClass()}`}
      >
        {/* Device indicator header for mobile/tablet */}
        {viewport !== "desktop" && (
          <div className="flex h-5 items-center justify-between bg-slate-900 px-4 text-[10px] text-white">
            <span>৯:৪১</span>
            <div className="flex items-center gap-1.5">
              <span>●●●</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* 1. NAVBAR PREVIEW */}
        {(activeSection === "navbar" || activeSection === "all") && (
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-2">
                {navbar.logo ? (
                  <img
                    src={resolveImageUrl(navbar.logo, logoImg)}
                    alt="Logo"
                    className="h-9 w-auto object-contain"
                  />
                ) : (
                  <img src={logoImg} alt="BanglaQR" className="h-9 w-auto object-contain" />
                )}
                {navbar.brandName && !navbar.logo && (
                  <span className="text-lg font-black text-slate-900">{navbar.brandName}</span>
                )}
              </div>

              <nav className="hidden md:flex items-center gap-5">
                {(navbar.menuItems || [])
                  .filter((item) => item.isActive !== false)
                  .map((item) => (
                    <span
                      key={item.id}
                      className="text-xs font-semibold text-slate-700 hover:text-emerald-600 cursor-pointer"
                    >
                      {item.label}
                    </span>
                  ))}
              </nav>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700">
                  {navbar.loginButtonText || "লগইন"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
                  {navbar.ctaButtonText || "মার্চেন্ট একাউন্ট খুলুন"}
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </header>
        )}

        {/* 2. HERO PREVIEW */}
        {(activeSection === "hero" || activeSection === "all") && (
          <section className="relative isolate overflow-hidden bg-slate-950 text-white py-12 px-4 sm:px-6">
            <div className="absolute inset-0 z-0">
              <img
                src={resolveImageUrl(hero.heroImage, paymentMoment)}
                alt="Hero"
                className="h-full w-full object-cover object-center opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950/40" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl">
              {hero.badgeText && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30 backdrop-blur-md mb-4">
                  <Sparkles size={13} className="text-emerald-300" />
                  {hero.badgeText}
                </div>
              )}

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                {hero.mainHeading || "একটি QR কোডে"}
                <br />
                <span className="text-emerald-400">{hero.highlightedHeading || "সব ধরনের পেমেন্ট"}</span>
                <br />
                {hero.subHeading || "এক প্ল্যাটফর্মে"}
              </h1>

              <p className="mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
                {hero.description || "BanglaQR দিয়ে আপনার ব্যবসা করুন আরও সহজ, নিরাপদ এবং স্মার্ট..."}
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-lg">
                  {hero.primaryButtonText || "অ্যাকাউন্ট খুলুন"} <ArrowRight size={13} />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                  ▶ {hero.secondaryButtonText || "ভিডিও দেখুন"}
                </span>
              </div>

              {/* Floating feature cards */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(hero.floatingCards || [])
                  .filter((c) => c.isActive !== false)
                  .map((c) => {
                    const Icon = getIcon(c.icon, QrCode);
                    return (
                      <div
                        key={c.id}
                        className="flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-300/20">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{c.title}</p>
                          <p className="text-[11px] text-slate-300 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* 3. PARTNERS PREVIEW */}
        {(activeSection === "partners" || activeSection === "all") && (
          <section className="border-y border-slate-200 bg-slate-50/70 py-6 px-4">
            <div className="mx-auto max-w-5xl">
              <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">
                {partners.heading || "আমাদের পেমেন্ট পার্টনারসমূহ"}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {(partners.partnersList || [])
                  .filter((p) => p.isActive !== false)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-2xs hover:border-emerald-500 transition"
                    >
                      {p.isBank ? (
                        <div className="flex flex-col items-center justify-center text-center">
                          <Landmark size={18} className="text-slate-700" />
                          <span className="text-[10px] font-bold text-slate-700">{p.name || "সব ব্যাংক"}</span>
                        </div>
                      ) : (
                        <img
                          src={resolveImageUrl(p.logo, DEFAULT_PARTNER_LOGOS[p.name] || bkashLogo)}
                          alt={p.name}
                          className="max-h-8 w-auto object-contain"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. WHY BANGLAQR PREVIEW */}
        {(activeSection === "whyBanglaQr" || activeSection === "all") && (
          <section className="py-10 px-4 sm:px-6 bg-white">
            <div className="mx-auto max-w-5xl">
              <div className="text-center max-w-2xl mx-auto mb-8">
                {whyBanglaQr.badge && (
                  <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
                    {whyBanglaQr.badge}
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {whyBanglaQr.heading || "আপনার ব্যবসার জন্য একটি সম্পূর্ণ ডিজিটাল পেমেন্ট সমাধান"}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  {whyBanglaQr.description || "পেমেন্ট গ্রহণ, রিপোর্টিং, সার্ভিস ম্যানেজমেন্ট..."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(whyBanglaQr.features || [])
                  .filter((f) => f.isActive !== false)
                  .map((f) => {
                    const Icon = getIcon(f.icon, Zap);
                    return (
                      <div
                        key={f.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-emerald-500 hover:shadow-xs transition"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-3">
                          <Icon size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{f.text}</p>
                        {f.linkText && (
                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            {f.linkText} <ArrowRight size={11} />
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* 5. BUSINESS GROWTH PREVIEW */}
        {(activeSection === "businessGrowth" || activeSection === "all") && (
          <section className="py-10 px-4 sm:px-6 bg-slate-900 text-white">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  {businessGrowth.badge && (
                    <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                      {businessGrowth.badge}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-black leading-tight text-white">
                    {businessGrowth.heading || "সব ধরনের ব্যবসার জন্য একটি পূর্ণাঙ্গ সমাধান"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {businessGrowth.description || "খুচরা দোকান, ক্যাফে, শিক্ষা, স্বাস্থ্য, সার্ভিস প্রতিষ্ঠান..."}
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md">
                      {businessGrowth.primaryButtonText || "অ্যাকাউন্ট খুলুন"} <ArrowRight size={13} />
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white">
                      {businessGrowth.secondaryButtonText || "কিভাবে কাজ করে?"}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-2 overflow-hidden backdrop-blur-md">
                    <img
                      src={resolveImageUrl(businessGrowth.dashboardImage, dashboardImage)}
                      alt="Dashboard Showcase"
                      className="rounded-xl w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Stats Grid */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(businessGrowth.stats || [])
                  .filter((s) => s.isActive !== false)
                  .map((s) => {
                    const Icon = getIcon(s.icon, Store);
                    return (
                      <div
                        key={s.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm"
                      >
                        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 mb-1.5">
                          <Icon size={16} />
                        </div>
                        <p className="text-base sm:text-lg font-black text-white">{s.value}</p>
                        <p className="text-[11px] text-slate-400">{s.label}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* 6. HOW IT WORKS PREVIEW */}
        {(activeSection === "howItWorks" || activeSection === "all") && (
          <section className="py-10 px-4 sm:px-6 bg-white">
            <div className="mx-auto max-w-5xl">
              <div className="text-center max-w-2xl mx-auto mb-8">
                {howItWorks.badge && (
                  <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
                    {howItWorks.badge}
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {howItWorks.heading || "মাত্র ৩টি ধাপে আপনার ব্যবসার ডিজিটাল পেমেন্ট শুরু করুন"}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  {howItWorks.description || "সহজ রেজিস্ট্রেশন থেকে প্রয়োজনীয় তথ্য জমা..."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(howItWorks.steps || [])
                  .filter((st) => st.isActive !== false)
                  .map((st, idx) => {
                    const Icon = getIcon(st.icon, Store);
                    return (
                      <div
                        key={st.id || idx}
                        className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2 hover:border-emerald-500 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs">
                            {st.stepNumber || idx + 1}
                          </span>
                          <Icon size={20} className="text-slate-400" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 pt-1">{st.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{st.text}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* 7. DASHBOARD SHOWCASE PREVIEW */}
        {(activeSection === "dashboardShowcase" || activeSection === "all") && (
          <section className="py-10 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
            <div className="mx-auto max-w-5xl">
              <div className="text-center max-w-2xl mx-auto mb-6">
                {dashboardShowcase.badge && (
                  <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
                    {dashboardShowcase.badge}
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {dashboardShowcase.heading || "রিয়েল-টাইম রিপোর্ট দেখে ব্যবসা চালান আরও স্মার্টভাবে"}
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  {dashboardShowcase.description || "লেনদেনের হিস্ট্রি, কাস্টমার ইনসাইট, সার্ভিস স্ট্যাটাস..."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md mb-6">
                <img
                  src={resolveImageUrl(dashboardShowcase.desktopImage, dashboardImage)}
                  alt="Showcase"
                  className="rounded-xl w-full object-cover shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(dashboardShowcase.features || [])
                  .filter((f) => f.isActive !== false)
                  .map((f) => (
                    <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                      <h5 className="text-xs font-bold text-slate-900">{f.title}</h5>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{f.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* 8. BUSINESS SOLUTIONS PREVIEW */}
        {(activeSection === "businessSolutions" || activeSection === "all") && (
          <section className="py-10 px-4 sm:px-6 bg-white">
            <div className="mx-auto max-w-5xl">
              <div className="text-center max-w-2xl mx-auto mb-8">
                {businessSolutions.badge && (
                  <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
                    {businessSolutions.badge}
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {businessSolutions.heading || "আপনার ব্যবসা যাই হোক, পেমেন্ট সমাধান আছে"}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  {businessSolutions.description || "আপনার ব্যবসার ধরন ও অপারেশন অনুযায়ী..."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(businessSolutions.solutionsList || [])
                  .filter((s) => s.isActive !== false)
                  .map((s, idx) => {
                    const Icon = getIcon(s.icon, Store);
                    return (
                      <div
                        key={s.id || idx}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-emerald-500 hover:shadow-md transition"
                      >
                        <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                          <img
                            src={resolveImageUrl(s.image, DEFAULT_SOLUTION_IMAGES[idx % DEFAULT_SOLUTION_IMAGES.length])}
                            alt={s.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                        <div className="p-4 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Icon size={16} className="text-emerald-600 shrink-0" />
                            <h4 className="text-xs font-bold text-slate-900 truncate">{s.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{s.text}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* 9. PACKAGES PREVIEW */}
        {(activeSection === "packages" || activeSection === "all") && (
          <section className="py-10 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
            <div className="mx-auto max-w-5xl">
              <div className="text-center max-w-2xl mx-auto mb-8">
                {packages.badge && (
                  <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
                    {packages.badge}
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {packages.heading || "আমাদের প্যাকেজ"}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  {packages.description || "আপনার ব্যবসার জন্য সঠিক প্যাকেজ নির্বাচন করুন।"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
                {(packages.packagesList || [])
                  .filter((p) => p.isActive !== false)
                  .map((pkg, pIdx) => {
                    const isMicro = pkg.id === "micro" || pIdx === 0;
                    return (
                      <div
                        key={pkg.id || pIdx}
                        className={`rounded-2xl border p-6 shadow-sm space-y-4 bg-white transition ${
                          isMicro
                            ? "border-emerald-300 ring-2 ring-emerald-500/20"
                            : "border-blue-300 ring-2 ring-blue-500/20"
                        }`}
                      >
                        <div>
                          <span
                            className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              isMicro ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {pkg.subtitle || (isMicro ? "এককালীন সেটআপ" : "মাসিক প্ল্যান")}
                          </span>
                          <h4 className="mt-2 text-base font-bold text-slate-900">{pkg.name}</h4>
                        </div>

                        <div className="flex items-baseline gap-1.5 pb-2 border-b border-slate-100">
                          <span className="text-2xl font-black text-slate-900">{pkg.price}</span>
                          <span className="text-xs text-slate-500">/ {pkg.period}</span>
                        </div>

                        <ul className="space-y-2 text-xs text-slate-600">
                          {(pkg.features || []).map((feat, bIdx) => (
                            <li key={bIdx} className="flex items-center gap-2">
                              <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <span
                          className={`flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-bold text-white shadow-xs ${
                            isMicro ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {pkg.buttonText || "এখনই কিনুন"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* 10. TESTIMONIALS PREVIEW */}
        {(activeSection === "testimonials" || activeSection === "all") && (
          <section className="py-10 px-4 sm:px-6 bg-white">
            <div className="mx-auto max-w-4xl">
              <div className="text-center max-w-xl mx-auto mb-6">
                {testimonials.badge && (
                  <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
                    {testimonials.badge}
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {testimonials.heading || "ব্যবসায়ীদের অভিজ্ঞতাই আমাদের অনুপ্রেরণা"}
                </h3>
              </div>

              {testimonialsList.length > 0 && (
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center space-y-4">
                  <div className="flex justify-center text-amber-400">
                    {Array.from({ length: testimonialsList[testimonialIndex]?.rating || 5 }).map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-sm font-medium text-slate-800 leading-relaxed italic max-w-xl mx-auto">
                    "{testimonialsList[testimonialIndex]?.quote}"
                  </p>

                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm mb-1 overflow-hidden">
                      {testimonialsList[testimonialIndex]?.avatarImage ? (
                        <img
                          src={resolveImageUrl(testimonialsList[testimonialIndex].avatarImage, "")}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        testimonialsList[testimonialIndex]?.avatar || "ম"
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900">{testimonialsList[testimonialIndex]?.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {testimonialsList[testimonialIndex]?.role} • {testimonialsList[testimonialIndex]?.businessName}
                    </p>
                  </div>

                  {/* Testimonial Nav buttons */}
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={prevTestimonial}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={nextTestimonial}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 10b. MARKETPLACE PREVIEW */}
        {(activeSection === "marketplace" || activeSection === "all") && (
          <section className="bg-[#F9FBFA] py-12 px-4 sm:px-6 font-['Hind_Siliguri',sans-serif] border-t border-slate-200/60 relative">
            <div className="mx-auto max-w-5xl space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-[#EAF8F2] px-3.5 py-1 text-xs font-semibold text-[#00875A]">
                  <QrCode size={13} className="text-[#00875A]" />
                  {marketplace.badge || "BanglaQR Merchant Marketplace"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  আপনার ব্যবসার জন্য <span className="text-[#00875A]">পেমেন্ট সেবা</span> বেছে নিন
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  {marketplace.subtitle ||
                    "তালিকাভুক্ত ব্যাংক, MFS ও পেমেন্ট সেবা থেকে আপনার প্রয়োজন অনুযায়ী নির্বাচন করুন এবং সহজেই আবেদন শুরু করুন।"}
                </p>

                {/* Category Tabs Preview */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
                  {[
                    { id: "all", label: "সব সেবা" },
                    { id: "bank", label: "ব্যাংক" },
                    { id: "mfs", label: "MFS" },
                    { id: "gateway", label: "পেমেন্ট গেটওয়ে" },
                    { id: "addon", label: "অ্যাড-অন সেবা" },
                  ].map((tab, idx) => (
                    <span
                      key={tab.id}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                        idx === 0
                          ? "bg-[#00875A] text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-100"
                      }`}
                    >
                      {tab.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Cards (Real Live Database Services) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(liveServices.length > 0 ? liveServices.slice(0, 4) : [
                  {
                    name: "ঢাকা ব্যাংক পিএলসি",
                    logoUrl: "/images/logos/dhakabank.svg",
                    availabilityStatus: "সক্রিয়",
                    isLimited: false,
                    shortDescription: "QR পেমেন্ট, মার্চেন্ট অ্যাকাউন্ট, API ইন্টিগ্রেশন",
                    capabilities: ["QR পেমেন্ট", "মার্চেন্ট অ্যাকাউন্ট", "API ইন্টিগ্রেশন"],
                  },
                  {
                    name: "বিকাশ মার্চেন্ট পেমেন্ট",
                    logoUrl: bkashLogo,
                    availabilityStatus: "সক্রিয়",
                    isLimited: false,
                    shortDescription: "QR পেমেন্ট, মার্চেন্ট অ্যাকাউন্ট, ইনস্ট্যান্ট সেটেলমেন্ট",
                    capabilities: ["QR পেমেন্ট", "মার্চেন্ট অ্যাকাউন্ট", "ইনস্ট্যান্ট সেটেলমেন্ট"],
                  },
                  {
                    name: "নগদ মার্চেন্ট সলিউশন",
                    logoUrl: nagadLogo,
                    availabilityStatus: "সীমিত",
                    isLimited: true,
                    shortDescription: "QR পেমেন্ট, মার্চেন্ট অ্যাকাউন্ট, ব্যাংক পেমেন্ট",
                    capabilities: ["QR পেমেন্ট", "মার্চেন্ট অ্যাকাউন্ট", "ব্যাংক পেমেন্ট"],
                  },
                  {
                    name: "ব্র্যাক ব্যাংক",
                    logoUrl: "/images/logos/bracbank.svg",
                    availabilityStatus: "সক্রিয়",
                    isLimited: false,
                    shortDescription: "মার্চেন্ট সলিউশন, QR, পেমেন্ট গেটওয়ে",
                    capabilities: ["QR পেমেন্ট", "মার্চেন্ট অ্যাকাউন্ট", "পেমেন্ট গেটওয়ে"],
                  },
                ]).map((item, idx) => {
                  const resolvedCardLogo = resolveServiceLogo(item.logoUrl || item.logo_url || item.logo, item.code, item.name);
                  const isLimited = item.availabilityStatus === "সীমিত" || item.isLimited;
                  const statusText = item.availabilityStatus || (item.acceptsApplications ? "সক্রিয়" : "স্থগিত");
                  const caps = item.capabilities && item.capabilities.length > 0
                    ? item.capabilities.slice(0, 3)
                    : ["QR পেমেন্ট", "মার্চেন্ট অ্যাকাউন্ট", "API ইন্টিগ্রেশন"];

                  return (
                    <div
                      key={item.id || idx}
                      className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 h-9">
                          <div className="h-8 max-w-[110px] flex items-center">
                            {resolvedCardLogo ? (
                              <img
                                src={resolvedCardLogo}
                                alt={item.name}
                                className="h-full w-auto max-h-7 object-contain"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="font-bold text-xs text-slate-800">{item.name}</span>
                            )}
                          </div>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              isLimited ? "bg-[#FEF6EE] text-[#F38B00]" : "bg-[#EAF8F2] text-[#00875A]"
                            }`}
                          >
                            {statusText}
                          </span>
                        </div>

                        <div className="mt-3">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{item.name}</h3>
                          <p className="text-[11px] text-slate-500 mt-1 min-h-[30px] line-clamp-2 leading-relaxed">
                            {item.shortDescription || item.description || "QR পেমেন্ট, মার্চেন্ট অ্যাকাউন্ট ও ডিজিটাল সেবা।"}
                          </p>
                        </div>

                        <div className="mt-3 mb-4 space-y-2">
                          {caps.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700">
                              {i === 0 ? (
                                <QrCode size={14} className="text-[#00875A] shrink-0" />
                              ) : i === 1 ? (
                                <CreditCard size={14} className="text-[#00875A] shrink-0" />
                              ) : (
                                <Code2 size={14} className="text-[#00875A] shrink-0" />
                              )}
                              <span className="line-clamp-1">{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-[#00875A] flex items-center gap-1 mb-2.5">
                          বিস্তারিত দেখুন →
                        </span>
                        <button
                          type="button"
                          className="w-full rounded-xl bg-[#00875A] py-2 text-xs font-semibold text-white shadow-xs"
                        >
                          এখনই আবেদন করুন →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3 Steps Panel matching Reference Image 1 */}
              <div className="rounded-3xl bg-[#EAF8F2]/60 border border-emerald-100/90 p-6 sm:p-8 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 text-center mb-6">
                  কীভাবে আবেদন করবেন?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                  <div className="flex md:flex-col items-center text-left md:text-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#C2F0D8] text-[#00875A] flex items-center justify-center shrink-0">
                      <MousePointerClick size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">১. পেমেন্ট সেবা নির্বাচন করুন</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">ব্যাংক, MFS বা অন্যান্য সেবার তালিকা থেকে বেছে নিন।</p>
                    </div>
                  </div>

                  <div className="hidden md:flex justify-center text-[#00875A]">
                    <ArrowRight size={18} strokeWidth={2.2} />
                  </div>

                  <div className="flex md:flex-col items-center text-left md:text-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#C2F0D8] text-[#00875A] flex items-center justify-center shrink-0">
                      <FileText size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">২. প্রয়োজনীয় তথ্য ও ডকুমেন্ট দিন</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">নির্বাচিত সেবার জন্য কেওয়াইসি তথ্য ও ডকুমেন্ট জমা দিন।</p>
                    </div>
                  </div>

                  <div className="hidden md:flex justify-center text-[#00875A]">
                    <ArrowRight size={18} strokeWidth={2.2} />
                  </div>

                  <div className="flex md:flex-col items-center text-left md:text-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#C2F0D8] text-[#00875A] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">৩. আপডেট পান</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">আবেদনের অবস্থান, রিভিও ও অনুমোদনের আপডেট পাবেন ড্যাশবোর্ডে।</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 11. FINAL CTA PREVIEW */}
        {(activeSection === "finalCta" || activeSection === "all") && (
          <section className="relative overflow-hidden bg-emerald-700 text-white py-10 px-4 sm:px-6">
            {finalCta.backgroundImage && (
              <img
                src={resolveImageUrl(finalCta.backgroundImage, "")}
                alt="CTA BG"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
            )}
            <div className="relative z-10 mx-auto max-w-4xl text-center space-y-3">
              <h3 className="text-xl sm:text-3xl font-black text-white">
                {finalCta.heading || "আজই আপনার ব্যবসা ডিজিটাল করুন"}
              </h3>
              <p className="max-w-xl mx-auto text-xs sm:text-sm text-emerald-100 leading-relaxed">
                {finalCta.description || "BanglaQR-এর সাথে যুক্ত হয়ে আপনার ব্যবসার পেমেন্ট..."}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-xs font-extrabold text-emerald-900 shadow-xl">
                  {finalCta.buttonText || "অ্যাকাউন্ট খুলুন"} <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 11b. CONTACT US PREVIEW */}
        {(activeSection === "contact" || activeSection === "all") && (
          <section className="relative overflow-hidden bg-[#0A111E] text-white py-12 px-4 sm:px-6 lg:px-8 font-['Hind_Siliguri',sans-serif]">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Contact Information Cards */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-400">
                      <Sparkles size={11} />
                      {contact.badge || "যোগাযোগ করুন"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {contact.title || contact.heading || "বাংলাদেশের সেরা পেমেন্ট ও সফটওয়্যার পার্টনারের সাথে যোগাযোগ করুন"}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {contact.subtitle || contact.description || "আপনার ব্যবসাকে ডিজিটাল ও সহজ করতে আজই আমাদের সাথে যোগাযোগ করুন। আমাদের বিশেষজ্ঞ টিম দ্রুত আপনাকে সহায়তা করবে।"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Hotline Card */}
                    <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Phone size={18} />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-bold text-slate-300">
                          {contact.salesTitle || contact.hotlineTitle || "হটলাইন ও সেলস"}
                        </p>
                        <p className="text-xs font-black text-emerald-400 tracking-wide font-mono">
                          {contact.salesPhone || contact.hotlineNumbers || "09602-111215  09697-428578"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {contact.salesHours || contact.hotlineAvailability || "সপ্তাহের ৭ দিন সকাল ৯:০০ - রাত ৯:০০"}
                        </p>
                      </div>
                    </div>

                    {/* Email Card */}
                    <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        <Mail size={18} />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-bold text-slate-300">
                          {contact.emailTitle || "ইমেইল যোগাযোগ"}
                        </p>
                        <p className="text-xs font-black text-white">
                          {contact.emailAddress || "info@csnbd.com"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {contact.emailSubtitle || "আমরা ২৪ ঘণ্টার মধ্যে উত্তর দিই"}
                        </p>
                      </div>
                    </div>

                    {/* Headquarters Card */}
                    <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <MapPin size={18} />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-bold text-slate-300">
                          {contact.officeTitle || "প্রধান কার্যালয়"}
                        </p>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {contact.officeAddress || "ওয়াকিল টাওয়ার (৮ম তলা) তা-১৩১, গুলশান-১ বাড্ডা লিংক রোড, ঢাকা-১২১২"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Demo / Quote Request Form */}
                <div className="lg:col-span-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl">
                    <div className="space-y-1 pb-4 border-b border-slate-100">
                      <h3 className="text-base font-black text-slate-900">
                        {contact.formTitle || "ফ্রি ডেমো বা তথ্য জানতে অনুরোধ করুন"}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {contact.formSubtitle || "নিচের ফর্মটি পূরণ করুন, আমাদের বিশেষজ্ঞ দল দ্রুত যোগাযোগ করবে।"}
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            {contact.nameLabel || "আপনার পূর্ণ নাম"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            readOnly
                            placeholder={contact.namePlaceholder || "যেমন: তানভীর হাসান"}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 pointer-events-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            {contact.phoneLabel || "মোবাইল নম্বর"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            readOnly
                            placeholder={contact.phonePlaceholder || "যেমন: 01712345678"}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 pointer-events-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            {contact.emailLabel || "ইমেইল ঠিকানা"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            readOnly
                            placeholder={contact.emailPlaceholder || "যেমন: name@company.com"}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 pointer-events-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            {contact.companyLabel || "প্রতিষ্ঠানের নাম"} <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                          </label>
                          <input
                            type="text"
                            readOnly
                            placeholder={contact.companyPlaceholder || "যেমন: এবিসি এন্টারপ্রাইজ"}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 pointer-events-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          {contact.serviceDropdownLabel || "কোন সেবা সম্পর্কে জানতে চান?"} <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-600 flex items-center justify-between pointer-events-none">
                          <span>
                            {typeof contact.services?.[0] === "string"
                              ? contact.services[0]
                              : contact.services?.[0]?.name || "BanglaQR পেমেন্ট গেটওয়ে"}
                          </span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          {contact.messageLabel || "আপনার বার্তা"} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          readOnly
                          placeholder={contact.messagePlaceholder || "আপনার ব্যবসা বা প্রয়োজনীয়তা সম্পর্কে সংক্ষেপে লিখুন..."}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 resize-none pointer-events-none"
                        />
                      </div>

                      <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00875a] py-2.5 px-4 text-xs font-bold text-white shadow-md cursor-default"
                      >
                        <span>{contact.submitButtonText || "বার্তা পাঠান"}</span>
                        <Send size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 12. FOOTER PREVIEW */}
        {(activeSection === "footer" || activeSection === "all") && (
          <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-8 px-4 sm:px-6 text-xs">
            <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-bold text-white">{footer.brandName || "BanglaQR"}</p>
                <p className="text-slate-400 leading-relaxed max-w-md">
                  {footer.description || "বাংলাদেশের ব্যবসায়ীদের জন্য একটি সহজ ও সংগঠিত ডিজিটাল পেমেন্ট প্ল্যাটফর্ম।"}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  {footer.contactAddress} • {footer.contactPhone}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-200 mb-2">কুইক লিংক</p>
                <ul className="space-y-1 text-slate-400">
                  {(footer.quickLinks || [])
                    .filter((l) => l.isActive !== false)
                    .map((l) => (
                      <li key={l.id}>{l.label}</li>
                    ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-200 mb-2">সাপোর্ট</p>
                <ul className="space-y-1 text-slate-400">
                  {(footer.supportLinks || [])
                    .filter((l) => l.isActive !== false)
                    .map((l) => (
                      <li key={l.id}>{l.label}</li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="mx-auto max-w-5xl mt-6 pt-4 border-t border-slate-900 text-center text-[10px] text-slate-500">
              {footer.copyrightText || "© 2026 BanglaQR. সর্বস্বত্ব সংরক্ষিত।"}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

