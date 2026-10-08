import AuthBrand from "./AuthBrand";
import AuthTopLink from "./AuthTopLink";
import AuthMarketingPanel from "./AuthMarketingPanel";
import authBg from "../../assets/authbg.jpg";

export default function AuthLayout({ children, variant = "register" }) {
  return (
    <div
      className="
        relative flex min-h-dvh w-full flex-col
        overflow-x-hidden
        bg-cover bg-center bg-no-repeat
        font-sans antialiased text-slate-900
        selection:bg-[#00a86b] selection:text-white
      "
      style={{ backgroundImage: `url(${authBg})` }}
    >
      {/* Soft readability layer — intentionally subtle so the photo stays bright */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white/8"
      />

      {/* Header */}
      <header className="relative z-20 shrink-0 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-10 xl:px-12">
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4">
          <AuthBrand />
          <AuthTopLink variant={variant} />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center px-4 py-4 sm:px-6 sm:py-5 lg:px-10 xl:px-12">
        <div className="mx-auto w-full max-w-[1360px]">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
            {/* Marketing */}
            <section className="hidden lg:col-span-7 lg:flex">
              <AuthMarketingPanel variant={variant} />
            </section>

            {/* Authentication card */}
            <section className="lg:col-span-5">
              <div className="mx-auto w-full max-w-[540px]">
                <div
                  className="
                    w-full rounded-[26px]
                    border border-white/75
                    bg-white/95
                    p-6
                    shadow-2xl shadow-slate-950/20
                    backdrop-blur-[2px]
                    sm:p-6
                  "
                >
                  {children}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="h-2 shrink-0 sm:h-3" />
    </div>
  );
}
