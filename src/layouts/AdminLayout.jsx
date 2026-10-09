import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { X } from "lucide-react";
import AdminSidebar from "../components/admin/navigation/AdminSidebar";
import AdminNavbar from "../components/admin/navigation/AdminNavbar";

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* =====================================================
          DESKTOP SIDEBAR (FIXED 228px)
      ====================================================== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[228px] border-r border-slate-800/80 bg-[#0b1320] lg:block">
        <AdminSidebar />
      </aside>

      {/* =====================================================
          MOBILE DRAWER SIDEBAR
      ====================================================== */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 flex max-w-full">
            <div className="relative flex w-[260px] max-w-[85vw] flex-col overflow-hidden bg-[#0b1320] shadow-2xl animate-in slide-in-from-left duration-200">
              {/* Close Button Header */}
              <div className="absolute right-3 top-3 z-50">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  aria-label="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 min-h-0">
                <AdminSidebar onNavigate={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN LAYOUT CONTENT (OFFSET 228px)
      ====================================================== */}
      <div className="min-h-screen flex flex-col lg:pl-[228px]">
        <AdminNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
