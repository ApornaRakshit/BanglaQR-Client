import {
  Store,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  ClipboardCheck,
  LifeBuoy,
} from "lucide-react";

import bkashLogo from "../../assets/paymentLogos/bkash.png";
import nagadLogo from "../../assets/paymentLogos/nagad.webp";
import rocketLogo from "../../assets/paymentLogos/roket.webp";
import upayLogo from "../../assets/paymentLogos/upay.webp";
import visaLogo from "../../assets/paymentLogos/visa.png";
import mastercardLogo from "../../assets/paymentLogos/mastercard.png";

const paymentPartners = [
  { name: "bKash", logo: bkashLogo },
  { name: "Nagad", logo: nagadLogo },
  { name: "Rocket", logo: rocketLogo },
  { name: "upay", logo: upayLogo },
  { name: "VISA", logo: visaLogo },
  { name: "Mastercard", logo: mastercardLogo },
];

export default function AuthMarketingPanel({ variant = "register" }) {
  const isRegister = variant === "register";

  const features = isRegister
    ? [
        {
          title: "Accept Digital Payments",
          subtitle: "Reach more customers",
          icon: Store,
        },
        {
          title: "Grow Your Business",
          subtitle: "Increase sales and revenue",
          icon: BarChart3,
        },
        {
          title: "Secure & Reliable",
          subtitle: "Bank-grade security.",
          icon: ShieldCheck,
        },
      ]
    : [
        {
          title: "Manage Your Services",
          subtitle: "View services and application status",
          icon: LayoutDashboard,
        },
        {
          title: "Complete Onboarding",
          subtitle: "Continue merchant KYC & profile",
          icon: ClipboardCheck,
        },
        {
          title: "Dedicated Support",
          subtitle: "Access 24/7 merchant help desk",
          icon: LifeBuoy,
        },
      ];

  return (
    <div className="flex h-full flex-col justify-between py-1 xl:max-w-[480px]">
      <div>
        <div className="mb-4 h-1.5 w-12 rounded-full bg-[#00e68a]" />

        <h1 className="text-[34px] font-black leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-[40px] lg:text-[44px]">
          {isRegister ? (
            <>
              Grow Your
              <br />
              Business with
              <br />
              <span className="text-[#00e68a]">BanglaQR</span>
            </>
          ) : (
            <>
              Welcome Back
              <br />
              to
              <br />
              <span className="text-[#00e68a]">BanglaQR</span>
            </>
          )}
        </h1>

        <p className="mt-3 max-w-[390px] text-[13px] leading-relaxed text-white/90">
          {isRegister
            ? "Join thousands of businesses across Bangladesh and start accepting digital payments easily and securely."
            : "Sign in to your merchant account and continue managing your business payments and services."}
        </p>
      </div>

      <div className="my-5 space-y-2.5 max-w-[420px]">
        {features.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-emerald-950/30 p-2.5 shadow-sm backdrop-blur-md transition-all hover:bg-emerald-950/45"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-[#00e68a] shadow-sm">
                <Icon size={17} className="stroke-[2.2]" />
              </div>

              <div className="min-w-0">
                <h3 className="text-[13px] font-bold leading-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-tight text-emerald-100/80">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-[470px]">
        <p className="text-[11px] font-medium tracking-wide text-white/80">
          Trusted by businesses across Bangladesh
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {paymentPartners.map((partner) => (
            <div
              key={partner.name}
              className="flex h-8 items-center justify-center px-2 py-1 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-emerald-400 hover:scale-105"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-8 sm:h-5 w-auto max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
