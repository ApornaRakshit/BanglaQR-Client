import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import CmsImageUpload from "../CmsImageUpload";

const ICON_OPTIONS = [
  { value: "Store", label: "দোকান / রিটেইল (Store)" },
  { value: "Utensils", label: "রেস্টুরেন্ট ও ক্যাফে (Utensils)" },
  { value: "ShoppingBag", label: "ই-কমার্স ও শপিং (ShoppingBag)" },
  { value: "GraduationCap", label: "শিক্ষা ও সেবা (GraduationCap)" },
  { value: "Building2", label: "কর্পোরেট ও অফিস (Building2)" },
  { value: "Activity", label: "স্বাস্থ্যসেবা ও ফার্মেসি (Activity)" },
  { value: "Smartphone", label: "অনলাইন সেবা (Smartphone)" },
  { value: "CreditCard", label: "পেমেন্ট সার্ভিস (CreditCard)" },
];

export default function BusinessSolutionsEditor({ data = {}, onChange }) {
  const solutions = data.businessSolutions || {};
  const solutionsList = solutions.solutionsList || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      businessSolutions: {
        ...solutions,
        [field]: value,
      },
    });
  };

  const updateSolutionItem = (index, field, value) => {
    const updated = [...solutionsList];
    updated[index] = { ...updated[index], [field]: value };
    updateField("solutionsList", updated);
  };

  const toggleSolutionActive = (index) => {
    const updated = [...solutionsList];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("solutionsList", updated);
  };

  const addSolutionItem = () => {
    const newId = `bs-${Date.now()}`;
    const newItem = {
      id: newId,
      title: "নতুন ব্যবসার সমাধান",
      text: "এই খাতের ব্যবসায়ীদের জন্য পেমেন্ট সমাধানের বিবরণ।",
      image: "",
      icon: "Store",
      url: "#contact",
      isActive: true,
      order: solutionsList.length + 1,
    };
    updateField("solutionsList", [...solutionsList, newItem]);
  };

  const removeSolutionItem = (index) => {
    if (window.confirm("Are you sure you want to remove this industry solution?")) {
      const updated = solutionsList.filter((_, i) => i !== index);
      updateField("solutionsList", updated);
    }
  };

  const moveSolutionItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= solutionsList.length) return;
    const updated = [...solutionsList];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField("solutionsList", updated);
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
                value={solutions.badge || ""}
                onChange={(e) => updateField("badge", e.target.value)}
                placeholder="সব ধরনের ব্যবসার জন্য"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম</label>
              <input
                type="text"
                value={solutions.heading || ""}
                onChange={(e) => updateField("heading", e.target.value)}
                placeholder="আপনার ব্যবসা যাই হোক, পেমেন্ট সমাধান আছে"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">বর্ণনা</label>
            <textarea
              rows={2}
              value={solutions.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="আপনার ব্যবসার ধরন ও অপারেশন অনুযায়ী মার্চেন্ট পেমেন্ট..."
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Solutions Management Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage business solutions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Category solutions tailored for retail, restaurants, e-commerce, healthcare and more.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {solutionsList.length} solutions
            </span>
            <button
              type="button"
              onClick={addSolutionItem}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add solution</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-28 text-center">BANNER IMAGE</th>
                <th className="py-3 px-4 w-36">ICON</th>
                <th className="py-3 px-4 min-w-[150px]">TITLE</th>
                <th className="py-3 px-4 min-w-[220px]">DESCRIPTION</th>
                <th className="py-3 px-4 min-w-[120px]">LINK URL</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {solutionsList.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <CmsImageUpload
                        value={item.image || ""}
                        onChange={(url) => updateSolutionItem(idx, "image", url)}
                        compact={true}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={item.icon || "Store"}
                      onChange={(e) => updateSolutionItem(idx, "icon", e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                      value={item.title || ""}
                      onChange={(e) => updateSolutionItem(idx, "title", e.target.value)}
                      placeholder="খুচরা ও রিটেইল দোকান"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.text || ""}
                      onChange={(e) => updateSolutionItem(idx, "text", e.target.value)}
                      placeholder="দ্রুত QR ও ডিজিটাল পেমেন্ট..."
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.url || ""}
                      onChange={(e) => updateSolutionItem(idx, "url", e.target.value)}
                      placeholder="#contact"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSolutionActive(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        item.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{item.isActive !== false ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSolutionItem(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSolutionItem(idx, 1)}
                        disabled={idx === solutionsList.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSolutionItem(idx)}
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
