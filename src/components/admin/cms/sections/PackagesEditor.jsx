import { Plus, Trash2, Check, Sparkles, ShieldCheck } from "lucide-react";

export default function PackagesEditor({ data = {}, onChange }) {
  const packages = data.packages || {};
  const packagesList = packages.packagesList || [
    {
      id: "micro",
      name: "সেটআপ প্যাকেজ (এককালীন)",
      subtitle: "একবারের জন্য সেটআপ",
      price: "৳ ৫০০",
      period: "এককালীন",
      icon: "Settings",
      colorScheme: "emerald",
      features: [
        "পেমেন্ট গেটওয়ে সেটআপ",
        "বেসিক ইন্টিগ্রেশন সাপোর্ট",
        "টেস্ট ও লাইভ সেটআপ",
      ],
      buttonText: "এখনই কিনুন",
      buttonLink: "/register",
      isActive: true,
      order: 1,
    },
    {
      id: "enterprise",
      name: "মাসিক প্যাকেজ",
      subtitle: "মাসিক ব্যবহারের পরিকল্পনা",
      price: "৳ ১,৫০০",
      period: "প্রতি মাসে",
      icon: "Calendar",
      colorScheme: "blue",
      features: [
        "ফুল গেটওয়ে অ্যাক্সেস",
        "API অ্যাক্সেস",
        "টেকনিক্যাল সাপোর্ট",
        "লেনদেন পর্যবেক্ষণ ও মনিটরিং",
      ],
      buttonText: "এখনই কিনুন",
      buttonLink: "/register",
      isActive: true,
      order: 2,
    },
  ];

  const updateField = (field, value) => {
    onChange({
      ...data,
      packages: {
        ...packages,
        [field]: value,
      },
    });
  };

  const updatePackage = (index, field, value) => {
    const updated = [...packagesList];
    updated[index] = { ...updated[index], [field]: value };
    updateField("packagesList", updated);
  };

  const togglePackageActive = (index) => {
    const updated = [...packagesList];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("packagesList", updated);
  };

  // Feature bullets management inside package
  const addFeatureBullet = (pkgIndex) => {
    const updated = [...packagesList];
    const currentFeatures = updated[pkgIndex].features || [];
    updated[pkgIndex] = {
      ...updated[pkgIndex],
      features: [...currentFeatures, "নতুন সুবিধা বা ফিচার"],
    };
    updateField("packagesList", updated);
  };

  const updateFeatureBullet = (pkgIndex, bulletIndex, value) => {
    const updated = [...packagesList];
    const currentFeatures = [...(updated[pkgIndex].features || [])];
    currentFeatures[bulletIndex] = value;
    updated[pkgIndex] = {
      ...updated[pkgIndex],
      features: currentFeatures,
    };
    updateField("packagesList", updated);
  };

  const removeFeatureBullet = (pkgIndex, bulletIndex) => {
    const updated = [...packagesList];
    const currentFeatures = (updated[pkgIndex].features || []).filter((_, i) => i !== bulletIndex);
    updated[pkgIndex] = {
      ...updated[pkgIndex],
      features: currentFeatures,
    };
    updateField("packagesList", updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Strict 2-Slot Rule Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="font-bold text-slate-900">প্যাকেজ স্ট্রাকচার নিয়ম (Fixed 2 Plans)</p>
          <p className="text-slate-600 text-xs mt-0.5">
            বাংলা কিউআর প্ল্যাটফর্মে সুনির্দিষ্ট ২টি প্যাকেজ প্ল্যান প্রযোজ্য: ১. মাইক্রো মার্চেন্ট সেটআপ প্যাকেজ এবং ২. এন্টারপ্রাইজ মাসিক প্যাকেজ।
          </p>
        </div>
      </div>

      {/* 2. Section Header Settings */}
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
                value={packages.badge || ""}
                onChange={(e) => updateField("badge", e.target.value)}
                placeholder="আমাদের প্যাকেজ"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম</label>
              <input
                type="text"
                value={packages.heading || ""}
                onChange={(e) => updateField("heading", e.target.value)}
                placeholder="আমাদের প্যাকেজ"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">বর্ণনা</label>
            <textarea
              rows={2}
              value={packages.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="আপনার ব্যবসার জন্য সঠিক প্যাকেজ নির্বাচন করুন।"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. 2 Packages Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packagesList.slice(0, 2).map((pkg, pIdx) => {
          const isMicro = pkg.id === "micro" || pIdx === 0;

          return (
            <div
              key={pkg.id || pIdx}
              className={`rounded-2xl border p-6 shadow-xs space-y-4 bg-white transition ${
                pkg.isActive !== false
                  ? isMicro
                    ? "border-emerald-200"
                    : "border-blue-200"
                  : "border-slate-200/60 bg-slate-50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-white font-bold text-xs ${
                      isMicro ? "bg-emerald-600" : "bg-blue-600"
                    }`}
                  >
                    {pIdx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isMicro ? "১. মাইক্রো মার্চেন্ট প্যাকেজ" : "২. এন্টারপ্রাইজ / মাসিক প্যাকেজ"}
                    </h4>
                    <p className="text-[11px] text-slate-500">Slot ID: {pkg.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePackageActive(pIdx)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                    pkg.isActive !== false
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      pkg.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  <span>{pkg.isActive !== false ? "Active" : "Inactive"}</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">প্যাকেজের নাম</label>
                <input
                  type="text"
                  value={pkg.name || ""}
                  onChange={(e) => updatePackage(pIdx, "name", e.target.value)}
                  placeholder="সেটআপ প্যাকেজ (এককালীন)"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">সাব-টাইটেল / ব্যাজ</label>
                <input
                  type="text"
                  value={pkg.subtitle || ""}
                  onChange={(e) => updatePackage(pIdx, "subtitle", e.target.value)}
                  placeholder="একবারের জন্য সেটআপ"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">মূল্য / ফি (Price)</label>
                  <input
                    type="text"
                    value={pkg.price || ""}
                    onChange={(e) => updatePackage(pIdx, "price", e.target.value)}
                    placeholder="৳ ৫০০"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">চার্জের মেয়াদ (Period)</label>
                  <input
                    type="text"
                    value={pkg.period || ""}
                    onChange={(e) => updatePackage(pIdx, "period", e.target.value)}
                    placeholder="এককালীন / প্রতি মাসে"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Feature Bullet Points */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">প্যাকেজ সুবিধাসমূহ (Features)</label>
                  <button
                    type="button"
                    onClick={() => addFeatureBullet(pIdx)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus size={13} />
                    সুবিধা যোগ করুন
                  </button>
                </div>

                <div className="space-y-2">
                  {(pkg.features || []).map((feat, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <input
                        type="text"
                        value={feat || ""}
                        onChange={(e) => updateFeatureBullet(pIdx, bIdx, e.target.value)}
                        placeholder="সুবিধার নাম"
                        className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeatureBullet(pIdx, bIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-700">বাটন লেখা</label>
                  <input
                    type="text"
                    value={pkg.buttonText || ""}
                    onChange={(e) => updatePackage(pIdx, "buttonText", e.target.value)}
                    placeholder="এখনই কিনুন"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">বাটন লিংক URL</label>
                  <input
                    type="text"
                    value={pkg.buttonLink || ""}
                    onChange={(e) => updatePackage(pIdx, "buttonLink", e.target.value)}
                    placeholder="/register"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
