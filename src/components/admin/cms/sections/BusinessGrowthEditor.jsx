import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import CmsImageUpload from "../CmsImageUpload";
import dashboardImage from "../../../../assets/home/payment-dashboard.png";

const ICON_OPTIONS = [
  { value: "Store", label: "মার্চেন্ট স্টোর (Store)" },
  { value: "BarChart3", label: "চার্ট ও লেনদেন (BarChart3)" },
  { value: "ShieldCheck", label: "নিরাপত্তা শিল্ড (ShieldCheck)" },
  { value: "Headphones", label: "সাপোর্ট হেডফোন (Headphones)" },
  { value: "Zap", label: "ফাস্ট পেমেন্ট (Zap)" },
  { value: "Users", label: "গ্রাহক / ইউজার (Users)" },
];

export default function BusinessGrowthEditor({ data = {}, onChange }) {
  const businessGrowth = data.businessGrowth || {};
  const stats = businessGrowth.stats || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      businessGrowth: {
        ...businessGrowth,
        [field]: value,
      },
    });
  };

  const updateStat = (index, field, value) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: value };
    updateField("stats", updated);
  };

  const toggleStatActive = (index) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("stats", updated);
  };

  const addStat = () => {
    const newStat = {
      id: `st-${Date.now()}`,
      value: "10,000+",
      label: "অ্যাক্টিভ ব্যবসায়ী",
      icon: "Store",
      isActive: true,
      order: stats.length + 1,
    };
    updateField("stats", [...stats, newStat]);
  };

  const removeStat = (index) => {
    if (window.confirm("Are you sure you want to remove this statistic?")) {
      const updated = stats.filter((_, i) => i !== index);
      updateField("stats", updated);
    }
  };

  const moveStat = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= stats.length) return;
    const updated = [...stats];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField("stats", updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Section Header & Copy */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          সেকশন শিরোনাম ও পরিচিতি
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">টপ ব্যাজ</label>
              <input
                type="text"
                value={businessGrowth.badge || ""}
                onChange={(e) => updateField("badge", e.target.value)}
                placeholder="ছোট থেকে বড়"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম</label>
              <input
                type="text"
                value={businessGrowth.heading || ""}
                onChange={(e) => updateField("heading", e.target.value)}
                placeholder="সব ধরনের ব্যবসার জন্য একটি পূর্ণাঙ্গ সমাধান"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">বর্ণনা</label>
            <textarea
              rows={2}
              value={businessGrowth.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="খুচরা দোকান, ক্যাফে, শিক্ষা, স্বাস্থ্য, সার্ভিস প্রতিষ্ঠান কিংবা কর্পোরেট ব্যবসা..."
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
            <label className="text-xs font-semibold text-slate-700">প্রাথমিক বাটন লেখা</label>
            <input
              type="text"
              value={businessGrowth.primaryButtonText || ""}
              onChange={(e) => updateField("primaryButtonText", e.target.value)}
              placeholder="অ্যাকাউন্ট খুলুন"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">প্রাথমিক বাটন URL</label>
            <input
              type="text"
              value={businessGrowth.primaryButtonUrl || ""}
              onChange={(e) => updateField("primaryButtonUrl", e.target.value)}
              placeholder="/register"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">দ্বিতীয় বাটন লেখা</label>
            <input
              type="text"
              value={businessGrowth.secondaryButtonText || ""}
              onChange={(e) => updateField("secondaryButtonText", e.target.value)}
              placeholder="কিভাবে কাজ করে?"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">দ্বিতীয় বাটন URL</label>
            <input
              type="text"
              value={businessGrowth.secondaryButtonUrl || ""}
              onChange={(e) => updateField("secondaryButtonUrl", e.target.value)}
              placeholder="#how-it-works"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Showcase Image */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          ড্যাশবোর্ড / শোকেস ইমেজ
        </h3>

        <CmsImageUpload
          label="গ্রোথ সেকশনের ড্যাশবোর্ড স্ক্রিনশট বা ইলাস্ট্রেশন"
          value={businessGrowth.dashboardImage}
          fallbackImage={dashboardImage}
          onChange={(url) => updateField("dashboardImage", url)}
          hint="ডিফল্ট ছবি না চাইলে কাস্টম ইমেজ আপলোড করুন (1000x700px)"
        />
      </div>

      {/* 4. Key Statistics Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage platform statistics</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the 4 key business metric counters displayed under the growth banner.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {stats.length} stats
            </span>
            <button
              type="button"
              onClick={addStat}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add stat</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-40">ICON</th>
                <th className="py-3 px-4 min-w-[160px]">VALUE (COUNT)</th>
                <th className="py-3 px-4 min-w-[220px]">LABEL / DESCRIPTION</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {stats.map((st, idx) => (
                <tr key={st.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <select
                      value={st.icon || "Store"}
                      onChange={(e) => updateStat(idx, "icon", e.target.value)}
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
                      value={st.value || ""}
                      onChange={(e) => updateStat(idx, "value", e.target.value)}
                      placeholder="10,000+"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={st.label || ""}
                      onChange={(e) => updateStat(idx, "label", e.target.value)}
                      placeholder="অ্যাক্টিভ ব্যবসায়ী"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleStatActive(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        st.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          st.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{st.isActive !== false ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveStat(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStat(idx, 1)}
                        disabled={idx === stats.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStat(idx)}
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
