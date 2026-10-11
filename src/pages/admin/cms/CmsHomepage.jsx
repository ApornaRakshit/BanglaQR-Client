import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import {
  Loader2,
  AlertTriangle,
  Send,
  ExternalLink,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
  Power,
} from "lucide-react";

import { adminApi } from "../../../services/adminApi";
import { CMS_SECTIONS_CONFIG } from "../../../components/admin/cms/cmsSectionsConfig";
import CmsLivePreview from "../../../components/admin/cms/CmsLivePreview";

// Section Editors
import NavbarEditor from "../../../components/admin/cms/sections/NavbarEditor";
import HeroEditor from "../../../components/admin/cms/sections/HeroEditor";
import PartnersEditor from "../../../components/admin/cms/sections/PartnersEditor";
import WhyBanglaQrEditor from "../../../components/admin/cms/sections/WhyBanglaQrEditor";
import BusinessGrowthEditor from "../../../components/admin/cms/sections/BusinessGrowthEditor";
import HowItWorksEditor from "../../../components/admin/cms/sections/HowItWorksEditor";
import DashboardShowcaseEditor from "../../../components/admin/cms/sections/DashboardShowcaseEditor";
import BusinessSolutionsEditor from "../../../components/admin/cms/sections/BusinessSolutionsEditor";
import PackagesEditor from "../../../components/admin/cms/sections/PackagesEditor";
import TestimonialsEditor from "../../../components/admin/cms/sections/TestimonialsEditor";
import FinalCtaEditor from "../../../components/admin/cms/sections/FinalCtaEditor";
import ContactUsEditor from "../../../components/admin/cms/sections/ContactUsEditor";
import FooterEditor from "../../../components/admin/cms/sections/FooterEditor";

export default function CmsHomepage() {
  const [searchParams] = useSearchParams();
  const currentSection = searchParams.get("section") || "partners";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverData, setServerData] = useState(null);
  const [draftData, setDraftData] = useState({});

  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Preview device viewport: "desktop" | "mobile"
  const [previewViewport, setPreviewViewport] = useState("desktop");

  const sectionConfig = CMS_SECTIONS_CONFIG[currentSection] || CMS_SECTIONS_CONFIG.partners;
  const isCurrentSectionActive = draftData[currentSection]?.isActive !== false;
  const [showDeactivateConfirmModal, setShowDeactivateConfirmModal] = useState(false);

  const handleToggleSectionActive = () => {
    if ((currentSection === "navbar" || currentSection === "footer") && isCurrentSectionActive) {
      setShowDeactivateConfirmModal(true);
      return;
    }
    executeToggleSectionActive();
  };

  const executeToggleSectionActive = () => {
    setShowDeactivateConfirmModal(false);
    const newStatus = !isCurrentSectionActive;
    setDraftData((prev) => ({
      ...prev,
      [currentSection]: {
        ...(prev[currentSection] || {}),
        isActive: newStatus,
      },
    }));
    showToast(
      newStatus
        ? `${sectionConfig.name} সেকশন সক্রিয় (Active) করা হয়েছে`
        : `${sectionConfig.name} সেকশন নিষ্ক্রিয় (Inactive) করা হয়েছে`,
      newStatus ? "success" : "info"
    );
  };

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadCmsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getCmsHomepage();
      if (res.success && res.data) {
        setServerData(res.data);
        setDraftData(res.data.draftContent || res.data.publishedContent || {});
      } else {
        throw new Error(res.message || "CMS ডাটা লোড করতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "CMS ডাটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  // Compute dirty status by comparing current draftData with serverData.draftContent
  const isDirty = useMemo(() => {
    if (!serverData || !serverData.draftContent) return false;
    return JSON.stringify(draftData) !== JSON.stringify(serverData.draftContent);
  }, [draftData, serverData]);

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const res = await adminApi.saveCmsDraft(draftData);
      if (res.success && res.data) {
        setServerData(res.data);
        setDraftData(res.data.draftContent);
        showToast("ড্রাফট সফলভাবে সংরক্ষিত হয়েছে!", "success");
      } else {
        throw new Error(res.message || "ড্রাফট সংরক্ষণে ব্যর্থ");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "ড্রাফট সংরক্ষণ ব্যর্থ হয়েছে", "error");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleConfirmPublish = async () => {
    setShowPublishModal(false);
    try {
      setPublishing(true);
      const res = await adminApi.publishCmsDraft(draftData);
      if (res.success && res.data) {
        setServerData(res.data);
        setDraftData(res.data.draftContent);
        showToast("হোমপেজ সফলভাবে লাইভ পাবলিশ করা হয়েছে!", "success");
      } else {
        throw new Error(res.message || "পাবলিশ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "পাবলিশ ব্যর্থ হয়েছে", "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("আপনি কি অসংরক্ষিত পরিবর্তনগুলো বাতিল করে পূর্বাবস্থায় ফিরতে চান?")) {
      if (serverData?.draftContent) {
        setDraftData(JSON.parse(JSON.stringify(serverData.draftContent)));
      }
      showToast("পরিবর্তনগুলো বাতিল করা হয়েছে", "info");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "কখনও নয়";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderSectionEditor = () => {
    switch (currentSection) {
      case "navbar":
        return <NavbarEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "hero":
        return <HeroEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "partners":
        return <PartnersEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "whyBanglaQr":
        return <WhyBanglaQrEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "businessGrowth":
        return <BusinessGrowthEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "howItWorks":
        return <HowItWorksEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "dashboardShowcase":
        return <DashboardShowcaseEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "businessSolutions":
        return <BusinessSolutionsEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "packages":
        return <PackagesEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "testimonials":
        return <TestimonialsEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "finalCta":
        return <FinalCtaEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "contact":
        return <ContactUsEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      case "footer":
        return <FooterEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
      default:
        return <PartnersEditor data={draftData} onChange={setDraftData} config={sectionConfig} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">সিএমএস ওয়ার্কস্পেস লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4 border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">সিএমএস লোড করতে ত্রুটি হয়েছে</h3>
        <p className="mt-2 text-xs text-slate-600">{error}</p>
        <button
          type="button"
          onClick={loadCmsData}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          <RefreshCw size={14} />
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold shadow-2xl transition-all animate-in slide-in-from-bottom-4 ${
            toastMessage.type === "error"
              ? "bg-red-600 text-white"
              : toastMessage.type === "info"
              ? "bg-slate-900 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Page Header & Actions */}
      <div className="space-y-1.5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>Website</span>
          <span>/</span>
          <span>CMS</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">{sectionConfig.name}</span>
        </div>

        {/* Title & Top Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {sectionConfig.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {sectionConfig.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Section Active / Inactive Toggle */}
            <button
              type="button"
              onClick={handleToggleSectionActive}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition shadow-2xs ${
                isCurrentSectionActive
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
              }`}
              title={
                isCurrentSectionActive
                  ? "This section is Active on website. Click to deactivate."
                  : "This section is Inactive. Click to activate."
              }
            >
              {isCurrentSectionActive ? (
                <Eye size={13} className="text-emerald-600" />
              ) : (
                <EyeOff size={13} className="text-slate-500" />
              )}
              <span>{isCurrentSectionActive ? "Section Active" : "Section Inactive"}</span>
            </button>

            {/* Status Pill */}
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Draft saved
              </span>
            )}

            {/* Last Published Text */}
            <span className="text-xs text-slate-400 hidden xl:inline-block">
              Last published: {formatDate(serverData?.lastPublishedAt)}
            </span>

            {/* Preview Homepage Button */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <ExternalLink size={13} className="text-slate-500" />
              <span>Preview homepage</span>
            </a>

            {/* Publish Changes Button */}
            <button
              type="button"
              onClick={() => setShowPublishModal(true)}
              disabled={savingDraft || publishing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 size={13} className="animate-spin text-white" />
              ) : (
                <Send size={13} />
              )}
              <span>Publish changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inactive Section Warning Banner */}
      {!isCurrentSectionActive && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-amber-950">
              {sectionConfig.name} সেকশনটি বর্তমানে নিষ্ক্রিয় (Inactive) করা আছে
            </p>
            <p className="text-amber-800">
              পাবলিশ করার পর এই সেকশনটি লাইভ পাবলিক ওয়েবসাইটে লুকানো থাকবে। তবে নিচের সমস্ত ডাটা সংরক্ষিত থাকবে এবং যেকোনো সময় পুনরায় সক্রিয় (Active) করা যাবে।
            </p>
          </div>
        </div>
      )}

      {/* 2. LIVE SECTION PREVIEW (Card 1) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900">Live section preview</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              This is how the {sectionConfig.name.toLowerCase()} section will look on your website.
            </p>
          </div>

          {/* Desktop / Mobile Segmented Toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setPreviewViewport("desktop")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                previewViewport === "desktop"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Monitor size={13} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("mobile")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                previewViewport === "mobile"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone size={13} />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Rendered Live Component */}
        <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
          <CmsLivePreview
            cmsData={draftData}
            activeSection={currentSection}
            viewport={previewViewport}
          />
        </div>
      </div>

      {/* 3. CONTENT MANAGEMENT (Card 2) */}
      <div className="space-y-6">
        {renderSectionEditor()}
      </div>

      {/* 4. Bottom Sticky Save Bar (Appears when isDirty) */}
      {isDirty && (
        <div className="sticky bottom-4 z-40 mx-auto w-full rounded-2xl bg-[#fffbeb] border border-[#fde68a] p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/30 text-amber-900 font-black">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">You have unsaved changes</p>
              <p className="text-[11px] text-amber-800">
                Your changes are visible in the preview but not published yet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={savingDraft || publishing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <RotateCcw size={13} />
              <span>Discard changes</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || publishing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition disabled:opacity-50"
            >
              {savingDraft ? (
                <Loader2 size={13} className="animate-spin text-white" />
              ) : (
                <Save size={13} />
              )}
              <span>Save draft</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4">
              <Sparkles size={24} />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Publish changes to public website?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              All changes in your current draft will immediately become live on the public BanglaQR website for all visitors and merchants.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200/80">
              <p className="font-semibold text-slate-700">Before publishing, verify:</p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                <li>Bengali spellings and text formatting are correct.</li>
                <li>All uploaded images and logos look sharp.</li>
                <li>Package pricing conforms with Bangladesh Bank regulations.</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#00704a]"
              >
                <Send size={13} />
                Yes, publish now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Navbar / Footer Deactivation */}
      {showDeactivateConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-red-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700 mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {sectionConfig.name} সেকশন নিষ্ক্রিয় (Deactivate) করতে চান?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              সতর্কতা: {sectionConfig.name} ওয়েবসাইটের একটি অপরিহার্য অংশ। এটি নিষ্ক্রিয় করে ড্রাফট পাবলিশ করলে লাইভ পাবলিক ওয়েবসাইটে দর্শনার্থীরা আর {sectionConfig.name.toLowerCase()} দেখতে পাবেন না।
            </p>

            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-900 border border-amber-200">
              <p className="font-semibold text-amber-950">দ্রষ্টব্য:</p>
              <p className="mt-0.5 text-amber-800">
                সেকশনের সকল ডাটা অক্ষত থাকবে এবং যেকোনো সময় পুনরায় সক্রিয় (Active) করা যাবে।
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeactivateConfirmModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={executeToggleSectionActive}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700"
              >
                <Power size={13} />
                হ্যাঁ, নিষ্ক্রিয় করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
