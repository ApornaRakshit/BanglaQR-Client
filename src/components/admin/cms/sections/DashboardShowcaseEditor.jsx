import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import CmsImageUpload from "../CmsImageUpload";

export default function DashboardShowcaseEditor({ data = {}, onChange }) {
  const showcase = data.dashboardShowcase || {};
  const features = showcase.features || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      dashboardShowcase: {
        ...showcase,
        [field]: value,
      },
    });
  };

  const updateFeature = (index, field, value) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    updateField("features", updated);
  };

  const toggleFeatureActive = (index) => {
    const updated = [...features];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("features", updated);
  };

  const addFeature = () => {
    const newFeature = {
      id: `feat-${Date.now()}`,
      title: "নতুন ফিচার",
      text: "ফিচারের বিস্তারিত বিবরণ ও সুবিধা লিখুন।",
      isActive: true,
      order: features.length + 1,
    };
    updateField("features", [...features, newFeature]);
  };

  const removeFeature = (index) => {
    if (window.confirm("Are you sure you want to remove this feature?")) {
      const updated = features.filter((_, i) => i !== index);
      updateField("features", updated);
    }
  };

  const moveFeature = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= features.length) return;
    const updated = [...features];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField("features", updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Section Header Settings */}
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
                value={showcase.badge || ""}
                onChange={(e) => updateField("badge", e.target.value)}
                placeholder="ড্যাশবোর্ড"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম</label>
              <input
                type="text"
                value={showcase.heading || ""}
                onChange={(e) => updateField("heading", e.target.value)}
                placeholder="রিয়েল-টাইম রিপোর্ট দেখে ব্যবসা চালান আরও স্মার্টভাবে"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">বর্ণনা</label>
            <textarea
              rows={2}
              value={showcase.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="লেনদেনের হিস্ট্রি, কাস্টমার ইনসাইট, সার্ভিস স্ট্যাটাস..."
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">বাটন টেক্সট</label>
              <input
                type="text"
                value={showcase.ctaText || ""}
                onChange={(e) => updateField("ctaText", e.target.value)}
                placeholder="ড্যাশবোর্ড দেখুন"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">বাটন লিংক URL</label>
              <input
                type="text"
                value={showcase.ctaUrl || ""}
                onChange={(e) => updateField("ctaUrl", e.target.value)}
                placeholder="/login"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Mockup Screenshots */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          ড্যাশবোর্ড স্ক্রিনশট ও মিডিয়া
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CmsImageUpload
            label="ডেস্কটপ ড্যাশবোর্ড স্ক্রিনশট (বড় প্রিভিউ)"
            value={showcase.desktopImage || ""}
            onChange={(url) => updateField("desktopImage", url)}
            hint="সাজেস্টেড রেজোলিউশন: 1200x750px বা হাই-রেজ্যুলেশন ইমেজ"
          />

          <CmsImageUpload
            label="মোবাইল প্রিভিউ স্ক্রিনশট (ঐচ্ছিক)"
            value={showcase.mobileImage || ""}
            onChange={(url) => updateField("mobileImage", url)}
            hint="সাজেস্টেড রেজোলিউশন: 400x800px মোবাইল অ্যাপ স্ক্রিন"
          />
        </div>
      </div>

      {/* 3. Features Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage dashboard features</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Highlight key reporting features, analytics, and operational capabilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {features.length} features
            </span>
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add feature</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">FEATURE TITLE</th>
                <th className="py-3 px-4 min-w-[320px]">DESCRIPTION</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {features.map((feat, idx) => (
                <tr key={feat.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={feat.title || ""}
                      onChange={(e) => updateFeature(idx, "title", e.target.value)}
                      placeholder="রিয়েল-টাইম ড্যাশবোর্ড"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={feat.text || ""}
                      onChange={(e) => updateFeature(idx, "text", e.target.value)}
                      placeholder="এক নজরে লেনদেনের হিস্ট্রি, ভলিউম, স্ট্যাটাস ও ব্যবসার পারফরম্যান্স দেখুন।"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleFeatureActive(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        feat.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          feat.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{feat.isActive !== false ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveFeature(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFeature(idx, 1)}
                        disabled={idx === features.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
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
