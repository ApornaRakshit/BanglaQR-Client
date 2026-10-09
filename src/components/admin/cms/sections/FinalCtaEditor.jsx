import CmsImageUpload from "../CmsImageUpload";

export default function FinalCtaEditor({ data = {}, onChange }) {
  const finalCta = data.finalCta || {};

  const updateField = (field, value) => {
    onChange({
      ...data,
      finalCta: {
        ...finalCta,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Button Settings */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          রেজিস্ট্রেশন কল-টু-অ্যাকশন ব্যানার (Final CTA)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম</label>
            <input
              type="text"
              value={finalCta.heading || ""}
              onChange={(e) => updateField("heading", e.target.value)}
              placeholder="আজই আপনার ব্যবসা ডিজিটাল করুন"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">বর্ণনা</label>
            <textarea
              rows={3}
              value={finalCta.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="BanglaQR-এর সাথে যুক্ত হয়ে আপনার ব্যবসার পেমেন্ট, রিপোর্টিং এবং মার্চেন্ট অপারেশন..."
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">বাটন টেক্সট</label>
              <input
                type="text"
                value={finalCta.buttonText || ""}
                onChange={(e) => updateField("buttonText", e.target.value)}
                placeholder="অ্যাকাউন্ট খুলুন"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">বাটন লিংক URL</label>
              <input
                type="text"
                value={finalCta.buttonUrl || ""}
                onChange={(e) => updateField("buttonUrl", e.target.value)}
                placeholder="/register"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Banner Background Image */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          ব্যানার ব্যাকগ্রাউন্ড ও ভিজ্যুয়াল
        </h3>

        <CmsImageUpload
          label="CTA ব্যাকগ্রাউন্ড ইমেজ (ঐচ্ছিক)"
          value={finalCta.backgroundImage || ""}
          onChange={(url) => updateField("backgroundImage", url)}
          hint="ডিফল্ট গ্রিন ব্যানার না চাইলে কাস্টম ব্যাকগ্রাউন্ড ইমেজ আপলোড করুন (1400x500px)"
        />
      </div>
    </div>
  );
}
