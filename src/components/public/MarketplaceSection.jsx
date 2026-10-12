import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  Landmark,
  Smartphone,
  CreditCard,
  Layers,
  QrCode,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileText,
  CheckCircle2,
  MousePointerClick,
  Info,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  ShieldCheck,
  Lock,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import MarketplaceCard from "./MarketplaceCard";
import { resolveServiceLogo } from "../../utils/imageUtils";

export default function MarketplaceSection({ cmsMarketplace = {} }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedService, setSelectedService] = useState(null);

  // Responsive items count per view
  const [cardsPerView, setCardsPerView] = useState(4);

  const updateCardsPerView = useCallback(() => {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    if (width >= 1024) {
      setCardsPerView(4);
    } else if (width >= 640) {
      setCardsPerView(2);
    } else {
      setCardsPerView(1);
    }
  }, []);

  useEffect(() => {
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, [updateCardsPerView]);

  // Load published services from real backend API
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/public/marketplace/services");
      if (res.data?.success) {
        setServices(res.data.data || []);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Failed to load marketplace services:", err);
      setError("পেমেন্ট ও গেটওয়ে সার্ভিস লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Category Tabs matching Reference Image 1
  const categoryTabs = [
    { id: "all", label: "সব সেবা", icon: Landmark },
    { id: "bank", label: "ব্যাংক", icon: Building2 },
    { id: "mfs", label: "MFS", icon: Smartphone },
    { id: "gateway", label: "পেমেন্ট গেটওয়ে", icon: CreditCard },
    { id: "addon", label: "অ্যাড-অন সেবা", icon: Layers },
  ];

  // Filter services by category
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      if (activeTab === "all") return true;
      return item.category === activeTab;
    });
  }, [services, activeTab]);

  // Reset slider index when tab changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  const maxIndex = Math.max(0, filteredServices.length - cardsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Touch Swipe Handlers for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50 && currentIndex < maxIndex) {
      handleNext();
    } else if (diff < -50 && currentIndex > 0) {
      handlePrev();
    }
  };

  // Handle Apply Now Action
  const handleApplyNow = (service) => {
    if (!service.acceptsApplications) return;

    const targetUrl =
      service.sourceType === "addon"
        ? `/merchant/addons?apply=${service.rawId}`
        : `/merchant/gateways/${service.rawId}/apply`;

    if (isAuthenticated && user?.role === "merchant") {
      navigate(targetUrl);
    } else {
      try {
        sessionStorage.setItem(
          "pendingMarketplaceService",
          JSON.stringify({
            sourceType: service.sourceType,
            rawId: service.rawId,
            code: service.code,
            name: service.name,
            targetUrl,
          })
        );
      } catch (e) {}

      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`, {
        state: {
          from: targetUrl,
          message: `আবেদন শুরু করতে অনুগ্রহ করে আপনার মার্চেন্ট অ্যাকাউন্টে লগইন করুন (${service.name})`,
        },
      });
    }
  };

  return (
    <section
      id="marketplace"
      className="scroll-mt-20 relative bg-[#F9FBFA] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 font-['Hind_Siliguri',sans-serif] overflow-hidden"
    >
      {/* Subtle ambient mint gradient at top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#EAF8F2]/70 via-[#EAF8F2]/30 to-transparent pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl space-y-10 sm:space-y-12">
        {/* A. Section Header (Matching Reference Image 1) */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          {/* Badge */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#EAF8F2] px-4 py-1.5 text-xs font-semibold text-[#00875A] shadow-xs">
              <QrCode size={14} className="text-[#00875A]" />
              <span>{cmsMarketplace.badge || "BanglaQR Merchant Marketplace"}</span>
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black text-slate-900 tracking-tight leading-[1.25]">
            আপনার ব্যবসার জন্য <span className="text-[#00875A]">পেমেন্ট সেবা</span> বেছে নিন
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            তালিকাভুক্ত ব্যাংক, MFS ও পেমেন্ট সেবা থেকে আপনার প্রয়োজন অনুযায়ী নির্বাচন করুন
            <br className="hidden sm:inline" />
            এবং সহজেই আবেদন শুরু করুন।
          </p>

          {/* B. Category Tabs (Matching Reference Image 1) */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-1 sm:gap-2 rounded-2xl bg-white p-1.5 shadow-xs border border-slate-100">
              {categoryTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-[#00875A] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* C. Service Carousel Section */}
        <div className="relative">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-28 rounded-lg bg-slate-200" />
                    <div className="h-6 w-14 rounded-md bg-slate-200" />
                  </div>
                  <div className="h-4 w-3/4 rounded bg-slate-200 mt-4" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="space-y-2 pt-3">
                    <div className="h-3 w-32 rounded bg-slate-100" />
                    <div className="h-3 w-36 rounded bg-slate-100" />
                    <div className="h-3 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="h-10 w-full rounded-xl bg-slate-200 mt-6" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
              <AlertCircle size={32} className="mx-auto text-red-600" />
              <p className="text-sm font-bold text-red-950">{error}</p>
              <button
                type="button"
                onClick={fetchServices}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00875A] px-4 py-2 text-xs font-bold text-white hover:bg-[#00704A] transition cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>পুনরায় চেষ্টা করুন</span>
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-xs">
              <Info size={32} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800">কোনো সেবা পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500">
                নির্বাচিত ক্যাটাগরিতে এই মুহূর্তে কোনো সক্রিয় পেমেন্ট সেবা উপলব্ধ নেই।
              </p>
              {activeTab !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  সব সেবা দেখুন
                </button>
              )}
            </div>
          ) : (
            <div className="relative px-2 sm:px-4">
              {/* Outer Left Arrow Button */}
              {filteredServices.length > cardsPerView && (
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={handlePrev}
                  aria-label="Previous services"
                  className="absolute -left-2 sm:-left-3 lg:-left-6 top-1/2 -translate-y-1/2 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-[#00875A] hover:border-emerald-300 transition-all z-20 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Outer Right Arrow Button */}
              {filteredServices.length > cardsPerView && (
                <button
                  type="button"
                  disabled={currentIndex >= maxIndex}
                  onClick={handleNext}
                  aria-label="Next services"
                  className="absolute -right-2 sm:-right-3 lg:-right-6 top-1/2 -translate-y-1/2 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-[#00875A] hover:border-emerald-300 transition-all z-20 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <ChevronRight size={22} />
                </button>
              )}

              {/* Carousel Viewport */}
              <div
                className="overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-350 ease-out"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                  }}
                >
                  {filteredServices.map((service) => {
                    const logo = resolveServiceLogo(service.logoUrl, service.code, service.name);
                    return (
                      <div
                        key={service.id}
                        className="px-2.5 shrink-0 w-full sm:w-1/2 lg:w-1/4"
                        style={{ boxSizing: "border-box" }}
                      >
                        <MarketplaceCard
                          service={service}
                          logo={logo}
                          onDetails={setSelectedService}
                          onApply={handleApplyNow}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* D. "কীভাবে আবেদন করবেন?" (How to Apply Panel Matching Reference Image 1) */}
        <div className="rounded-3xl bg-[#EAF8F2]/60 border border-emerald-100/90 p-8 sm:p-10 shadow-xs">
          <h3 className="text-xl font-bold text-slate-900 text-center mb-8">
            কীভাবে আবেদন করবেন?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-6 md:gap-2">
            {/* Step 1 */}
            <div className="md:col-span-1 flex md:flex-col items-center text-left md:text-center gap-4 md:gap-3">
              <div className="w-14 h-14 rounded-full bg-[#C2F0D8] text-[#00875A] flex items-center justify-center shrink-0 shadow-2xs">
                <MousePointerClick size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  ১. পেমেন্ট সেবা নির্বাচন করুন
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  ব্যাংক, MFS বা অন্যান্য সেবার তালিকা থেকে বেছে নিন।
                </p>
              </div>
            </div>

            {/* Connecting Arrow 1 */}
            <div className="hidden md:flex justify-center text-[#00875A]">
              <ArrowRight size={22} strokeWidth={2.2} />
            </div>

            {/* Step 2 */}
            <div className="md:col-span-1 flex md:flex-col items-center text-left md:text-center gap-4 md:gap-3">
              <div className="w-14 h-14 rounded-full bg-[#C2F0D8] text-[#00875A] flex items-center justify-center shrink-0 shadow-2xs">
                <FileText size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  ২. প্রয়োজনীয় তথ্য ও ডকুমেন্ট দিন
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  নির্বাচিত সেবার জন্য কেওয়াইসি তথ্য ও ডকুমেন্ট জমা দিন।
                </p>
              </div>
            </div>

            {/* Connecting Arrow 2 */}
            <div className="hidden md:flex justify-center text-[#00875A]">
              <ArrowRight size={22} strokeWidth={2.2} />
            </div>

            {/* Step 3 */}
            <div className="md:col-span-1 flex md:flex-col items-center text-left md:text-center gap-4 md:gap-3">
              <div className="w-14 h-14 rounded-full bg-[#C2F0D8] text-[#00875A] flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  ৩. আপডেট পান
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  আবেদনের অবস্থান, রিভিও ও অনুমোদনের আপডেট পাবেন ড্যাশবোর্ডে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* E. Service Details Modal (বিস্তারিত) */}
      {selectedService && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                  {resolveServiceLogo(selectedService.logoUrl, selectedService.code, selectedService.name) ? (
                    <img
                      src={resolveServiceLogo(selectedService.logoUrl, selectedService.code, selectedService.name)}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 size={26} className="text-[#00875A]" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {selectedService.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedService.code} • {selectedService.categoryLabel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-5 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-1">
                  বিবরণ ও কার্যপ্রণালী
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {selectedService.description || selectedService.shortDescription || "কোনো বিবরণ প্রদান করা হয়নি।"}
                </p>
              </div>

              {/* Capabilities */}
              {selectedService.capabilities && selectedService.capabilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                    সক্ষমতা ও পেমেন্ট চ্যানেল
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedService.capabilities.map((cap, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 font-medium text-slate-700"
                      >
                        <Check size={14} className="text-[#00875A]" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-800 uppercase block">ফি ও চার্জ</span>
                  <span className="text-base font-black text-[#00875A] mt-1 block font-mono">
                    {selectedService.pricing?.displayPrice || "ফ্রি"}
                  </span>
                  <span className="text-xs text-emerald-700/80 mt-0.5 block">
                    {selectedService.pricing?.pricingNote || "কোনো লুকায়িত ফি নেই"}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase block">যোগ্যতা</span>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                    {selectedService.eligibility || "অনবোর্ডিং সম্পন্ন বাংলা কিউআর মার্চেন্ট প্রোফাইল।"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                বন্ধ করুন
              </button>

              <button
                type="button"
                disabled={!selectedService.acceptsApplications}
                onClick={() => {
                  const s = selectedService;
                  setSelectedService(null);
                  handleApplyNow(s);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#00875A] text-xs font-bold text-white hover:bg-[#00704A] disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
              >
                <span>এখনই আবেদন করুন</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
