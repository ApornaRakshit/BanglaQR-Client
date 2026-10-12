import { useState } from "react";
import { Link } from "react-router";
import {
  CreditCard,
  Building2,
  Smartphone,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  FileCheck,
  BellRing,
} from "lucide-react";

export default function MarketplaceEditor({ data, onChange, config }) {
  const marketplace = data?.marketplace || {
    isActive: true,
    badge: "BanglaQR Merchant Marketplace",
    title: "আপনার ব্যবসার জন্য পেমেন্ট সেবা বেছে নিন",
    subtitle:
      "তালিকাভুক্ত ব্যাংক, MFS ও পেমেন্ট সেবা থেকে আপনার প্রয়োজন অনুযায়ী নির্বাচন করুন এবং সহজেই আবেদন শুরু করুন।",
    columns: 3,
    stepsHeading: "৩টি সহজ ধাপে সেবা গ্রহণ করুন",
    steps: [
      {
        stepNumber: "১",
        title: "১. পেমেন্ট সেবা নির্বাচন করুন",
        description: "ব্যাংক, MFS বা অন্যান্য সেবার তালিকা থেকে পছন্দের সেবা বেছে নিন।",
      },
      {
        stepNumber: "২",
        title: "২. প্রয়োজনীয় তথ্য ও ডকুমেন্ট দিন",
        description: "নির্বাচিত সেবার জন্য প্রয়োজনীয় KYC তথ্য ও ডকুমেন্ট জমা দিন।",
      },
      {
        stepNumber: "৩",
        title: "৩. আপডেট পান",
        description: "আবেদনের অবস্থা, রিভিউ এবং পরবর্তী করণীয় Merchant Dashboard থেকে দেখুন।",
      },
    ],
  };

  const handleUpdate = (updates) => {
    onChange((prev) => ({
      ...prev,
      marketplace: {
        ...marketplace,
        ...updates,
      },
    }));
  };

  const handleStepUpdate = (index, field, value) => {
    const nextSteps = [...(marketplace.steps || [])];
    nextSteps[index] = {
      ...nextSteps[index],
      [field]: value,
    };
    handleUpdate({ steps: nextSteps });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Text Content */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-600" />
            <span>মার্কেটপ্লেস শিরোনাম ও বিবরণ (Header & Branding)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            পাবলিক হোমপেজে মার্কেটপ্লেস সেকশনের টপ ব্যাজ, মূল শিরোনাম ও বিস্তারিত বিবরণ কাস্টমাইজ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              টপ ব্যাজ টেক্সট (Badge)
            </label>
            <input
              type="text"
              value={marketplace.badge || ""}
              onChange={(e) => handleUpdate({ badge: e.target.value })}
              placeholder="BanglaQR Merchant Marketplace"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              মূল শিরোনাম (Main Bengali Heading)
            </label>
            <input
              type="text"
              value={marketplace.title || ""}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="আপনার ব্যবসার জন্য পেমেন্ট সেবা বেছে নিন"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              বিবরণ (Supporting Description)
            </label>
            <textarea
              rows={3}
              value={marketplace.subtitle || ""}
              onChange={(e) => handleUpdate({ subtitle: e.target.value })}
              placeholder="তালিকাভুক্ত ব্যাংক, MFS ও পেমেন্ট সেবা থেকে আপনার প্রয়োজন অনুযায়ী নির্বাচন করুন এবং সহজেই আবেদন শুরু করুন।"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Layout Settings */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid size={16} className="text-emerald-600" />
            <span>গ্রিড লেআউট অপশন (Grid Columns)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            সার্ভিস কার্ড প্রদর্শনের জন্য প্রি-ডিফাইন্ড কলাম সংখ্যা নির্বাচন করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { cols: 2, label: "২ কলাম (2 Columns)", desc: "বড় কার্ড ও বিস্তারিত তথ্যের জন্য" },
            { cols: 3, label: "৩ কলাম (3 Columns - ডিফল্ট)", desc: "স্ট্যান্ডার্ড ব্যালান্সড ভিউ" },
            { cols: 4, label: "৪ কলাম (4 Columns)", desc: "কমপ্যাক্ট কার্ড ভিউ" },
          ].map((item) => (
            <button
              key={item.cols}
              type="button"
              onClick={() => handleUpdate({ columns: item.cols })}
              className={`p-4 rounded-xl border text-left transition ${
                Number(marketplace.columns || 3) === item.cols
                  ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <p className="text-xs font-bold text-slate-900">{item.label}</p>
              <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. 3-Step Application Process Configuration */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>৩টি আবেদন ধাপের বিবরণ (3-Step Application Process Strip)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            কার্ড গ্রিডের নিচে প্রদর্শিত ৩টি নির্দেশমূলক ধাপের শিরোনাম ও বিবরণ সম্পাদনা করুন।
          </p>
        </div>

        <div className="space-y-4">
          {(marketplace.steps || []).map((step, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                  {step.stepNumber || idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-800">ধাপ {step.stepNumber || idx + 1}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">শিরোনাম</label>
                  <input
                    type="text"
                    value={step.title || ""}
                    onChange={(e) => handleStepUpdate(idx, "title", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">বিবরণ</label>
                  <input
                    type="text"
                    value={step.description || ""}
                    onChange={(e) => handleStepUpdate(idx, "description", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Real Service Catalogue Links */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Building2 size={16} className="text-emerald-700" />
              <span>প্রকৃত সার্ভিস ক্যাটালগ ম্যানেজমেন্ট (Real Services Data Source)</span>
            </h3>
            <p className="text-xs text-emerald-800 mt-1 max-w-2xl">
              মার্কেটপ্লেসের ব্যাংক, MFS, পেমেন্ট গেটওয়ে এবং অ্যাড-অন সার্ভিসের তালিকা ডাটাবেজের <code>gateways</code> ও <code>addons</code> টেবিল থেকে সরাসরি ডায়নামিকভাবে আসে। নতুন সার্ভিস যোগ করতে বা কোনো সার্ভিসের সক্রিয়তা ও ফি পরিবর্তন করতে নিচের মডিউলগুলোতে যান:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Link
            to="/admin/gateways"
            className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-white text-slate-800 shadow-xs hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">গেটওয়ে ও ব্যাংক ম্যানেজমেন্ট</p>
                <p className="text-[11px] text-slate-500">ব্যাংক, MFS ও গেটওয়ে সার্ভিস নিয়ন্ত্রণ করুন</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>

          <Link
            to="/admin/addons"
            className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-white text-slate-800 shadow-xs hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">অ্যাড-অন ক্যাটালগ ম্যানেজমেন্ট</p>
                <p className="text-[11px] text-slate-500">ভ্যালু-অ্যাডেড অ্যাড-অন ও প্লাগইন নিয়ন্ত্রণ করুন</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}

