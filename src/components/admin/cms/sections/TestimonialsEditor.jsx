import { Plus, Trash2, ChevronUp, ChevronDown, Star } from "lucide-react";
import CmsImageUpload from "../CmsImageUpload";

export default function TestimonialsEditor({ data = {}, onChange }) {
  const testimonials = data.testimonials || {};
  const testimonialsList = testimonials.testimonialsList || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      testimonials: {
        ...testimonials,
        [field]: value,
      },
    });
  };

  const updateTestimonial = (index, field, value) => {
    const updated = [...testimonialsList];
    updated[index] = { ...updated[index], [field]: value };
    updateField("testimonialsList", updated);
  };

  const toggleTestimonialActive = (index) => {
    const updated = [...testimonialsList];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("testimonialsList", updated);
  };

  const addTestimonial = () => {
    const newId = `t-${Date.now()}`;
    const newItem = {
      id: newId,
      name: "নতুন মার্চেন্ট",
      role: "ব্যবসায়ী",
      businessName: "মার্চেন্ট প্রতিষ্ঠান",
      avatar: "ম",
      avatarImage: "",
      quote: "BanglaQR ব্যবহার করে আমাদের দোকানের পেমেন্ট প্রক্রিয়া অনেক সহজ হয়েছে।",
      rating: 5,
      isActive: true,
      order: testimonialsList.length + 1,
    };
    updateField("testimonialsList", [...testimonialsList, newItem]);
  };

  const removeTestimonial = (index) => {
    if (window.confirm("Are you sure you want to remove this review?")) {
      const updated = testimonialsList.filter((_, i) => i !== index);
      updateField("testimonialsList", updated);
    }
  };

  const moveTestimonial = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= testimonialsList.length) return;
    const updated = [...testimonialsList];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField("testimonialsList", updated);
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
                value={testimonials.badge || ""}
                onChange={(e) => updateField("badge", e.target.value)}
                placeholder="আমাদের ব্যবহারকারীদের মতামত"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম</label>
              <input
                type="text"
                value={testimonials.heading || ""}
                onChange={(e) => updateField("heading", e.target.value)}
                placeholder="ব্যবসায়ীদের অভিজ্ঞতাই আমাদের অনুপ্রেরণা"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">বর্ণনা</label>
            <textarea
              rows={2}
              value={testimonials.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="BanglaQR কীভাবে তাদের প্রতিদিনের পেমেন্ট ব্যবস্থাপনাকে সহজ করছে..."
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Testimonials Management Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage merchant reviews</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, remove or reorder customer reviews and rating testimonials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {testimonialsList.length} reviews
            </span>
            <button
              type="button"
              onClick={addTestimonial}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add review</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-28 text-center">PHOTO</th>
                <th className="py-3 px-4 min-w-[140px]">MERCHANT NAME</th>
                <th className="py-3 px-4 min-w-[160px]">ROLE & BUSINESS</th>
                <th className="py-3 px-4 w-28 text-center">RATING</th>
                <th className="py-3 px-4 min-w-[240px]">QUOTE</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {testimonialsList.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <CmsImageUpload
                        value={item.avatarImage || ""}
                        onChange={(url) => updateTestimonial(idx, "avatarImage", url)}
                        compact={true}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.name || ""}
                      onChange={(e) => {
                        updateTestimonial(idx, "name", e.target.value);
                        if (!item.avatar && e.target.value) {
                          updateTestimonial(idx, "avatar", e.target.value.charAt(0));
                        }
                      }}
                      placeholder="রাকিব হাসান"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={item.businessName || ""}
                        onChange={(e) => updateTestimonial(idx, "businessName", e.target.value)}
                        placeholder="হাসান স্টোর"
                        className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-900 focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={item.role || ""}
                        onChange={(e) => updateTestimonial(idx, "role", e.target.value)}
                        placeholder="রিটেইল ব্যবসায়ী"
                        className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-500 focus:border-emerald-500"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={item.rating || 5}
                      onChange={(e) => updateTestimonial(idx, "rating", Number(e.target.value))}
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-amber-500 focus:border-emerald-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                      <option value={2}>⭐⭐ (2/5)</option>
                      <option value={1}>⭐ (1/5)</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.quote || ""}
                      onChange={(e) => updateTestimonial(idx, "quote", e.target.value)}
                      placeholder="BanglaQR ব্যবহার করে আমাদের দোকানের পেমেন্ট..."
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleTestimonialActive(idx)}
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
                        onClick={() => moveTestimonial(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTestimonial(idx, 1)}
                        disabled={idx === testimonialsList.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTestimonial(idx)}
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
