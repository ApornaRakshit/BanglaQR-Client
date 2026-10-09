import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import CmsImageUpload from "../CmsImageUpload";
import paymentMoment from "../../../../assets/home/payment-moment.png";

const ICON_OPTIONS = [
  { value: "QrCode", label: "কিউআর কোড (QrCode)" },
  { value: "BarChart3", label: "চার্ট / গ্রাফ (BarChart3)" },
  { value: "ShieldCheck", label: "নিরাপত্তা শিল্ড (ShieldCheck)" },
  { value: "Zap", label: "ফাস্ট পেমেন্ট (Zap)" },
  { value: "Store", label: "মার্চেন্ট স্টোর (Store)" },
  { value: "Smartphone", label: "স্মার্টফোন (Smartphone)" },
  { value: "CheckCircle", label: "সফল টিক (CheckCircle)" },
  { value: "CreditCard", label: "কার্ড / পেমেন্ট (CreditCard)" },
];

export default function HeroEditor({ data = {}, onChange }) {
  const hero = data.hero || {};
  const floatingCards = hero.floatingCards || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      hero: {
        ...hero,
        [field]: value,
      },
    });
  };

  const updateFloatingCard = (index, field, value) => {
    const updated = [...floatingCards];
    updated[index] = { ...updated[index], [field]: value };
    updateField("floatingCards", updated);
  };

  const toggleFloatingCard = (index) => {
    const updated = [...floatingCards];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("floatingCards", updated);
  };

  const addFloatingCard = () => {
    const newCard = {
      id: `fc-${Date.now()}`,
      title: "নতুন ফিচার কার্ড",
      text: "ফিচারের সংক্ষিপ্ত বর্ণনা",
      icon: "QrCode",
      isActive: true,
      order: floatingCards.length + 1,
    };
    updateField("floatingCards", [...floatingCards, newCard]);
  };

  const removeFloatingCard = (index) => {
    if (window.confirm("Are you sure you want to remove this feature card?")) {
      const updated = floatingCards.filter((_, i) => i !== index);
      updateField("floatingCards", updated);
    }
  };

  const moveFloatingCard = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= floatingCards.length) return;
    const updated = [...floatingCards];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField("floatingCards", updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Headline & Copy Settings */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          হেডলাইন ও মূল টেক্সট কন্টেন্ট
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">টপ ব্যাজ টেক্সট</label>
            <input
              type="text"
              value={hero.badgeText || ""}
              onChange={(e) => updateField("badgeText", e.target.value)}
              placeholder="বাংলাদেশের নির্ভরযোগ্য QR পেমেন্ট প্ল্যাটফর্ম"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম (প্রথম অংশ)</label>
              <input
                type="text"
                value={hero.mainHeading || ""}
                onChange={(e) => updateField("mainHeading", e.target.value)}
                placeholder="একটি QR কোডে"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">সবুজ হাইলাইটেড শিরোনাম</label>
              <input
                type="text"
                value={hero.highlightedHeading || ""}
                onChange={(e) => updateField("highlightedHeading", e.target.value)}
                placeholder="সব ধরনের পেমেন্ট"
                className="mt-1 h-10 w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3.5 text-xs text-emerald-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">শিরোনাম সমাপ্তি (শেষ অংশ)</label>
              <input
                type="text"
                value={hero.subHeading || ""}
                onChange={(e) => updateField("subHeading", e.target.value)}
                placeholder="এক প্ল্যাটফর্মে"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">বর্ণনা / সাব-টাইটেল</label>
            <textarea
              rows={3}
              value={hero.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="BanglaQR দিয়ে আপনার ব্যবসা করুন আরও সহজ, নিরাপদ এবং স্মার্ট..."
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Action Buttons */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          কল-টু-অ্যাকশন বাটনসমূহ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-slate-700">প্রাথমিক বাটন লেখা (Primary CTA)</label>
            <input
              type="text"
              value={hero.primaryButtonText || ""}
              onChange={(e) => updateField("primaryButtonText", e.target.value)}
              placeholder="অ্যাকাউন্ট খুলুন"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">প্রাথমিক বাটন লিংক URL</label>
            <input
              type="text"
              value={hero.primaryButtonUrl || ""}
              onChange={(e) => updateField("primaryButtonUrl", e.target.value)}
              placeholder="/register"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">দ্বিতীয় বাটন লেখা (Secondary CTA)</label>
            <input
              type="text"
              value={hero.secondaryButtonText || ""}
              onChange={(e) => updateField("secondaryButtonText", e.target.value)}
              placeholder="ভিডিও দেখুন"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">দ্বিতীয় বাটন লিংক URL</label>
            <input
              type="text"
              value={hero.secondaryButtonUrl || ""}
              onChange={(e) => updateField("secondaryButtonUrl", e.target.value)}
              placeholder="#how-it-works"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Hero Visual Media */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          হিরো ব্যানার ইমেজ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CmsImageUpload
            label="হিরো প্রধান ব্যাকগ্রাউন্ড ছবি"
            value={hero.heroImage}
            fallbackImage={paymentMoment}
            onChange={(url) => updateField("heroImage", url)}
            hint="ডিফল্ট ছবি না চাইলে কাস্টম ইমেজ আপলোড করুন (1200x800px)"
          />

          <CmsImageUpload
            label="ব্যাকগ্রাউন্ড প্যাটার্ন ইমেজ (ঐচ্ছিক)"
            value={hero.backgroundImage}
            onChange={(url) => updateField("backgroundImage", url)}
            hint="হালকা ব্যাকগ্রাউন্ড টেক্সচার বা গ্রেডিয়েন্ট"
          />
        </div>
      </div>

      {/* 4. Floating Feature Cards Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage floating feature cards</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the 3 interactive feature highlight cards floating over the hero banner.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {floatingCards.length} cards
            </span>
            <button
              type="button"
              onClick={addFloatingCard}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add card</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-40">ICON</th>
                <th className="py-3 px-4 min-w-[180px]">CARD TITLE</th>
                <th className="py-3 px-4 min-w-[260px]">DESCRIPTION TEXT</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {floatingCards.map((c, idx) => (
                <tr key={c.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <select
                      value={c.icon || "QrCode"}
                      onChange={(e) => updateFloatingCard(idx, "icon", e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={c.title || ""}
                      onChange={(e) => updateFloatingCard(idx, "title", e.target.value)}
                      placeholder="এক QR-এ বহু পেমেন্ট"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={c.text || ""}
                      onChange={(e) => updateFloatingCard(idx, "text", e.target.value)}
                      placeholder="গ্রাহকের জন্য সহজ অভিজ্ঞতা"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleFloatingCard(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        c.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          c.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{c.isActive !== false ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveFloatingCard(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFloatingCard(idx, 1)}
                        disabled={idx === floatingCards.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFloatingCard(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
