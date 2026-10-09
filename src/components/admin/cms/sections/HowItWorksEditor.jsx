import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

const ICON_OPTIONS = [
  { value: "Store", label: "মার্চেন্ট স্টোর / অ্যাকাউন্ট (Store)" },
  { value: "QrCode", label: "কিউআর কোড / ডকুমেন্ট (QrCode)" },
  { value: "Smartphone", label: "স্মার্টফোন / পেমেন্ট গ্রহণ (Smartphone)" },
  { value: "CheckCircle", label: "চেক মার্ক (CheckCircle)" },
  { value: "ShieldCheck", label: "ভেরিফিকেশন শিল্ড (ShieldCheck)" },
  { value: "CreditCard", label: "কার্ড ও গেটওয়ে (CreditCard)" },
  { value: "Zap", label: "বিদ্যুতগতি / ফাস্ট (Zap)" },
];

export default function HowItWorksEditor({ data = {}, onChange }) {
  const howItWorks = data.howItWorks || {};
  const steps = howItWorks.steps || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      howItWorks: {
        ...howItWorks,
        [field]: value,
      },
    });
  };

  const updateStep = (index, field, value) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    updateField("steps", updated);
  };

  const toggleStepActive = (index) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("steps", updated);
  };

  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      stepNumber: `${steps.length + 1}`,
      title: "নতুন ধাপ",
      text: "এই ধাপের প্রয়োজনীয় কাজের বিবরণ লিখুন।",
      icon: "Store",
      isActive: true,
      order: steps.length + 1,
    };
    updateField("steps", [...steps, newStep]);
  };

  const removeStep = (index) => {
    if (window.confirm("Are you sure you want to remove this step?")) {
      const updated = steps.filter((_, i) => i !== index);
      updateField("steps", updated);
    }
  };

  const moveStep = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField("steps", updated);
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
                value={howItWorks.badge || ""}
                onChange={(e) => updateField("badge", e.target.value)}
                placeholder="কিভাবে কাজ করে?"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম</label>
              <input
                type="text"
                value={howItWorks.heading || ""}
                onChange={(e) => updateField("heading", e.target.value)}
                placeholder="মাত্র ৩টি ধাপে আপনার ব্যবসার ডিজিটাল পেমেন্ট শুরু করুন"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">বর্ণনা</label>
            <textarea
              rows={2}
              value={howItWorks.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="সহজ রেজিস্ট্রেশন থেকে প্রয়োজনীয় তথ্য জমা এবং অনুমোদনের পর..."
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Steps Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage onboarding steps</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, remove or reorder the visual steps explaining how merchants get started.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {steps.length} steps
            </span>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add step</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-20 text-center">STEP NO</th>
                <th className="py-3 px-4 w-40">ICON</th>
                <th className="py-3 px-4 min-w-[160px]">TITLE</th>
                <th className="py-3 px-4 min-w-[260px]">DESCRIPTION</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {steps.map((st, idx) => (
                <tr key={st.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="text"
                      value={st.stepNumber || `${idx + 1}`}
                      onChange={(e) => updateStep(idx, "stepNumber", e.target.value)}
                      placeholder={`${idx + 1}`}
                      className="h-9 w-12 text-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={st.icon || "Store"}
                      onChange={(e) => updateStep(idx, "icon", e.target.value)}
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
                      value={st.title || ""}
                      onChange={(e) => updateStep(idx, "title", e.target.value)}
                      placeholder="অ্যাকাউন্ট খুলুন"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={st.text || ""}
                      onChange={(e) => updateStep(idx, "text", e.target.value)}
                      placeholder="মাত্র কয়েকটি ধাপে মার্চেন্ট অ্যাকাউন্টের জন্য রেজিস্ট্রেশন করুন।"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleStepActive(idx)}
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
                        onClick={() => moveStep(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(idx, 1)}
                        disabled={idx === steps.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
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
