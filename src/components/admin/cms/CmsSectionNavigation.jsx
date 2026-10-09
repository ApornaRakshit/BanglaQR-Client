import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CMS_SECTIONS } from "../navigation/AdminSidebar";

export default function CmsSectionNavigation({ activeSection, onSelectSection }) {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative border-b border-slate-200 bg-white px-4 py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={scrollLeft}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="বামে স্ক্রোল করুন"
        >
          <ChevronLeft size={14} />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {CMS_SECTIONS.map((sec, idx) => {
            const isActive = activeSection === sec.id;
            const Icon = sec.icon;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={14} className={isActive ? "text-emerald-400" : "text-slate-500"} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={scrollRight}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="ডানে স্ক্রোল করুন"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

