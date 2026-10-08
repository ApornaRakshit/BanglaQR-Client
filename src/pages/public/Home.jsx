import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Landmark,
  Menu,
  MessageCircle,
  QrCode,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  X,
  Zap,
} from "lucide-react";

import logoImg from "../../assets/logo.jpg";
import authBg from "../../assets/authbg.jpg";
import bkashLogo from "../../assets/paymentLogos/bkash.png";
import nagadLogo from "../../assets/paymentLogos/nagad.webp";
import rocketLogo from "../../assets/paymentLogos/roket.webp";
import upayLogo from "../../assets/paymentLogos/upay.webp";
import visaLogo from "../../assets/paymentLogos/visa.png";
import mastercardLogo from "../../assets/paymentLogos/mastercard.png";
import cafeCounter from "../../assets/home/cafe-counter.png";
import educationImage from "../../assets/home/education.png";
import healthcareImage from "../../assets/home/healthcare.png";
import corporateImage from "../../assets/home/corporate.png";
import dashboardImage from "../../assets/home/payment-dashboard.png";
import paymentMoment from "../../assets/home/payment-moment.png";
import paymentCheckout from "../../assets/home/payment-checkout.png";

const navItems = [
  { label: "হোম", href: "#home" },
  { label: "সেবা সমূহ", href: "#services" },
  { label: "ব্যবসায়ী", href: "#merchants" },
  { label: "বিভিন্ন ব্যবসায়", href: "#industries" },
  { label: "ফিচারস", href: "#features" },
  { label: "সাহায্য", href: "#support" },
  { label: "যোগাযোগ", href: "#contact" },
];

const paymentPartners = [
  { name: "bKash", logo: bkashLogo, isImage: true },
  { name: "নগদ", logo: nagadLogo, isImage: true },
  { name: "রকেট", logo: rocketLogo, isImage: true },
  { name: "upay", logo: upayLogo, isImage: true },
  { name: "VISA", logo: visaLogo, isImage: true },
  { name: "mastercard", logo: mastercardLogo, isImage: true },
  { name: "সব ব্যাংক", isBank: true },
];

const benefits = [
  {
    icon: Zap,
    title: "ফাস্ট পেমেন্ট",
    text: "কয়েক সেকেন্ডেই পেমেন্ট গ্রহণ এবং যাচাই করুন।",
  },
  {
    icon: ShieldCheck,
    title: "নিরাপদ লেনদেন",
    text: "নিরাপত্তা, যাচাই এবং নিয়ন্ত্রণকে গুরুত্ব দিয়ে তৈরি।",
  },
  {
    icon: BarChart3,
    title: "রিয়েল-টাইম রিপোর্ট",
    text: "লেনদেন, বিক্রি ও ব্যবসার ইনসাইট এক জায়গায় দেখুন।",
  },
  {
    icon: Smartphone,
    title: "সহজ ইন্টিগ্রেশন",
    text: "POS, ওয়েবসাইট, অ্যাপ বা অন্যান্য চ্যানেলে সহজে ব্যবহার করুন।",
  },
];

const merchantHighlights = [
  { value: "10,000+", label: "অ্যাক্টিভ ব্যবসায়ী", icon: Store },
  { value: "50M+", label: "সকল লেনদেন", icon: BarChart3 },
  { value: "99.9%", label: "নিরাপদ ও নির্ভরযোগ্য", icon: ShieldCheck },
  { value: "24/7", label: "সাপোর্ট", icon: Headphones },
];

const howItWorks = [
  {
    no: "1",
    icon: Store,
    title: "অ্যাকাউন্ট খুলুন",
    text: "মাত্র কয়েকটি ধাপে মার্চেন্ট অ্যাকাউন্টের জন্য রেজিস্ট্রেশন করুন।",
  },
  {
    no: "2",
    icon: QrCode,
    title: "ডকুমেন্ট জমা দিন",
    text: "প্রয়োজনীয় তথ্য ও ডকুমেন্ট সম্পূর্ণ করে আবেদন যাচাইয়ের জন্য পাঠান।",
  },
  {
    no: "3",
    icon: Smartphone,
    title: "পেমেন্ট গ্রহণ শুরু করুন",
    text: "অনুমোদনের পর আপনার নির্বাচিত পেমেন্ট সেবা ও QR চ্যানেল ব্যবহার করুন।",
  },
];

const dashboardFeatures = [
  {
    title: "রিয়েল-টাইম ড্যাশবোর্ড",
    text: "এক নজরে লেনদেনের হিস্ট্রি, ভলিউম, স্ট্যাটাস ও ব্যবসার পারফরম্যান্স দেখুন।",
  },
  {
    title: "মাল্টি-সার্ভিস ম্যানেজমেন্ট",
    text: "আপনার সক্রিয় সেবা, অ্যাপ্লিকেশন, ইন্টিগ্রেশন ও সাপোর্ট একই জায়গায় পরিচালনা করুন।",
  },
  {
    title: "সহজ রিপোর্টিং",
    text: "ব্যবসার সিদ্ধান্তের জন্য গুরুত্বপূর্ণ রিপোর্ট দ্রুত বুঝে নিন।",
  },
];

const industries = [
  {
    title: "খুচরা ও রিটেইল দোকান",
    text: "দ্রুত QR ও ডিজিটাল পেমেন্ট গ্রহণের সহজ সমাধান।",
    image: cafeCounter,
  },
  {
    title: "রেস্টুরেন্ট ও ক্যাফে",
    text: "কাউন্টার, টেবিল বা ডিজিটাল অর্ডারের জন্য সহজ পেমেন্ট অভিজ্ঞতা।",
    image: paymentCheckout,
  },
  {
    title: "ই-কমার্স",
    text: "অনলাইন অর্ডার ও কাস্টমার পেমেন্টে নির্ভরযোগ্য ডিজিটাল ফ্লো।",
    image: paymentMoment,
  },
  {
    title: "সেবা প্রতিষ্ঠান",
    text: "শিক্ষা, স্বাস্থ্য, ট্রেনিং ও অন্যান্য সেবার পেমেন্ট ব্যবস্থাপনা।",
    image: educationImage,
  },
  {
    title: "কর্পোরেট ও বড় প্রতিষ্ঠান",
    text: "বড় পরিসরের ব্যবসায়িক পেমেন্ট ব্যবস্থাপনা ও রিপোর্টিং।",
    image: corporateImage,
  },
  {
    title: "স্বাস্থ্যসেবা",
    text: "ক্লিনিক, হাসপাতাল ও স্বাস্থ্যসেবা প্রতিষ্ঠানে সহজ ডিজিটাল পেমেন্ট।",
    image: healthcareImage,
  },
];

const testimonials = [
  {
    quote: "BanglaQR ব্যবহার করে আমাদের দোকানের পেমেন্ট নেওয়ার প্রক্রিয়া অনেক সহজ হয়েছে।",
    name: "রাকিব হাসান",
    role: "রিটেইল ব্যবসায়ী",
    avatar: "র",
  },
  {
    quote: "ড্যাশবোর্ড থেকে ব্যবসার পেমেন্ট ও রিপোর্ট খুব দ্রুত বুঝতে পারি।",
    name: "অঞ্জলি সুলতানা",
    role: "সার্ভিস ব্যবসা",
    avatar: "অ",
  },
  {
    quote: "একাধিক পেমেন্ট চ্যানেলকে একটি ম্যানেজমেন্ট ফ্লোতে দেখার বিষয়টি খুব সুবিধাজনক।",
    name: "জাহিদুল ইসলাম",
    role: "কর্পোরেট ব্যবসা",
    avatar: "জ",
  },
];

const packages = [
  {
    name: "সেটআপ প্যাকেজ (এককালীন)",
    subtitle: "একবারের জন্য সেটআপ",
    price: "৳ ৫০০",
    period: "এককালীন",
    icon: Settings,
    colorScheme: "emerald",
    features: [
      "পেমেন্ট গেটওয়ে সেটআপ",
      "বেসিক ইন্টিগ্রেশন সাপোর্ট",
      "টেস্ট ও লাইভ সেটআপ",
    ],
    buttonText: "এখনই কিনুন",
    buttonLink: "/register",
  },
  {
    name: "মাসিক প্যাকেজ",
    subtitle: "মাসিক ব্যবহারের পরিকল্পনা",
    price: "৳ ১,৫০০",
    period: "প্রতি মাসে",
    icon: Calendar,
    colorScheme: "blue",
    features: [
      "ফুল গেটওয়ে অ্যাক্সেস",
      "API অ্যাক্সেস",
      "টেকনিক্যাল সাপোর্ট",
      "লেনদেন পর্যবেক্ষণ ও মনিটরিং",
    ],
    buttonText: "এখনই কিনুন",
    buttonLink: "/register",
  },
];

function Brand({ compact = false }) {
  return (
    <Link to="/" className="group inline-flex items-center">
      <img
        src={logoImg}
        alt="BanglaQR"
        className={`${compact ? "h-9" : "h-11"} w-auto object-contain transition-transform group-hover:scale-105`}
      />
    </Link>
  );
}

function SectionHeading({ eyebrow, title, text, centered = false }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <div className={`mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 ${centered ? "" : ""}`}>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-[46px] lg:leading-[1.05]">
        {title}
      </h2>
      {text && <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{text}</p>}
    </div>
  );
}

function ProviderStrip() {
  return (
    <section className="relative z-10 border-y border-slate-200/70 bg-gradient-to-b from-slate-50/40 via-white/50 to-slate-50/40 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-7 sm:gap-4">
          {paymentPartners.map((partner) => (
            <div
              key={partner.name}
              className="group relative flex h-20 sm:h-24 items-center justify-center rounded-2xl border border-slate-200/80 bg-transparent px-4 py-3 transition-all duration-300 hover:border-emerald-500 hover:bg-white/70 hover:backdrop-blur-xl hover:shadow-lg hover:shadow-emerald-950/5 hover:-translate-y-1 cursor-pointer"
            >
              {partner.isImage ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 sm:max-h-14 w-auto max-w-[90%] object-contain transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 transition-transform duration-300 group-hover:scale-105 select-none">
                  <Landmark className="h-7 w-7 text-slate-800 transition-colors group-hover:text-emerald-600" />
                  <span className="text-xs sm:text-[13px] font-bold text-slate-800 transition-colors group-hover:text-emerald-600">
                    সব ব্যাংক
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const nextTestimonial = () => {
    setTestimonialIndex((current) => (current + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav className="hidden items-center gap-7 xl:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-700 transition hover:text-emerald-600"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 text-sm font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50">
              লগইন
            </Link>
            <Link to="/register" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
              মার্চেন্ট অ্যাকাউন্ট খুলুন <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white xl:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 xl:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Link to="/login" className="rounded-xl border border-emerald-200 py-3 text-center text-sm font-bold text-emerald-700">লগইন</Link>
                <Link to="/register" className="rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white">অ্যাকাউন্ট খুলুন</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img src={paymentMoment} alt="BanglaQR digital payment" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-900/10" />
          <div className="absolute inset-0 bg-emerald-950/10" />
        </div>

        <div className="relative mx-auto grid min-h-[690px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100 ring-1 ring-white/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              বাংলাদেশের নির্ভরযোগ্য QR পেমেন্ট প্ল্যাটফর্ম
            </div>
            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
              একটি QR কোডে
              <br />
              <span className="text-emerald-300">সব ধরনের পেমেন্ট</span>
              <br />
              এক প্ল্যাটফর্মে
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              BanglaQR দিয়ে আপনার ব্যবসা করুন আরও সহজ, নিরাপদ এবং স্মার্ট। অনলাইন ও অফলাইনে বিভিন্ন ডিজিটাল পেমেন্ট সেবা একটি ম্যানেজমেন্ট প্ল্যাটফর্মে পরিচালনা করুন।
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-extrabold text-white shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-400">
                অ্যাকাউন্ট খুলুন <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white/15">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/60">▶</span>
                ভিডিও দেখুন
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                [QrCode, "এক QR-এ বহু পেমেন্ট", "গ্রাহকের জন্য সহজ অভিজ্ঞতা"],
                [BarChart3, "ব্যবসা বাড়ান", "সহজ রিপোর্ট ও ইনসাইট"],
                [ShieldCheck, "নিরাপদ ও নির্ভরযোগ্য", "সুরক্ষিত মার্চেন্ট অপারেশন"],
              ].map(([Icon, title, text]) => (
                <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-300/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-white/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
            <div className="relative w-full max-w-[500px]">
             
            </div>
          </div>
        </div>
      </section>

      {/* Provider strip */}
      <ProviderStrip />

      {/* Why BanglaQR */}
      <section id="features" className="bg-[linear-gradient(180deg,#f8fffb_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="কেন BanglaQR?"
            centered
            title="আপনার ব্যবসার জন্য একটি সম্পূর্ণ ডিজিটাল পেমেন্ট সমাধান"
            text="পেমেন্ট গ্রহণ, রিপোর্টিং, সার্ভিস ম্যানেজমেন্ট এবং মার্চেন্ট অপারেশন—সবকিছুকে আরও সহজ ও গুছিয়ে পরিচালনা করুন।"
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                <a href="#contact" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">আরও জানুন <ArrowRight className="h-4 w-4" /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Merchant growth section */}
      <section id="merchants" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="ছোট থেকে বড়"
              title="সব ধরনের ব্যবসার জন্য একটি পূর্ণাঙ্গ সমাধান"
              text="খুচরা দোকান, ক্যাফে, শিক্ষা, স্বাস্থ্য, সার্ভিস প্রতিষ্ঠান কিংবা কর্পোরেট ব্যবসা—আপনার ব্যবসার ধরন অনুযায়ী ডিজিটাল পেমেন্ট অভিজ্ঞতা তৈরি করুন।"
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700">
                অ্যাকাউন্ট খুলুন <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-5 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
                কিভাবে কাজ করে? <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {merchantHighlights.map(({ value, label, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-xl font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 shadow-2xl shadow-slate-950/10">
              <img src={dashboardImage} alt="BanglaQR merchant dashboard" className="h-[430px] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 left-5 rounded-2xl border border-white bg-white/95 p-4 shadow-xl backdrop-blur sm:left-auto sm:right-5">
              <p className="text-xs font-bold text-slate-500">স্মার্ট মার্চেন্ট ড্যাশবোর্ড</p>
              <p className="mt-1 text-sm font-black text-slate-950">সব গুরুত্বপূর্ণ তথ্য এক জায়গায়</p>
            </div>
          </div>
        </div>Merchant Portal

      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="কিভাবে কাজ করে?"
            centered
            title="মাত্র ৩টি ধাপে আপনার ব্যবসার ডিজিটাল পেমেন্ট শুরু করুন"
            text="সহজ রেজিস্ট্রেশন থেকে প্রয়োজনীয় তথ্য জমা এবং অনুমোদনের পর সেবা ব্যবহারের পুরো ফ্লোটি একটি পরিষ্কার মার্চেন্ট অনবোর্ডিং অভিজ্ঞতার মাধ্যমে পরিচালিত হবে।"
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {howItWorks.map(({ no, icon: Icon, title, text }) => (
              <div key={no} className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-lg font-black text-white">{no}</span>
                  <Icon className="h-8 w-8 text-emerald-600/80" />
                </div>
                <h3 className="mt-7 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section id="services" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-2xl shadow-slate-950/10">
              <img src={dashboardImage} alt="BanglaQR dashboard analytics" className="h-[390px] w-full object-cover object-top" />
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5">
            <SectionHeading
              eyebrow="ড্যাশবোর্ড"
              title="রিয়েল-টাইম রিপোর্ট দেখে ব্যবসা চালান আরও স্মার্টভাবে"
              text="লেনদেনের হিস্ট্রি, কাস্টমার ইনসাইট, সার্ভিস স্ট্যাটাস এবং আপনার মার্চেন্ট অপারেশনকে একটি পরিষ্কার ড্যাশবোর্ডে দেখুন।"
            />
            <div className="mt-7 space-y-4">
              {dashboardFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-black text-slate-950">{feature.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/login" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">
              ড্যাশবোর্ড দেখুন <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="সব ধরনের ব্যবসার জন্য"
            centered
            title="আপনার ব্যবসা যাই হোক, পেমেন্ট সমাধান আছে"
            text="আপনার ব্যবসার ধরন ও অপারেশন অনুযায়ী মার্চেন্ট পেমেন্ট ম্যানেজমেন্টকে আরও সহজ করতে তৈরি করা হয়েছে।"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <div key={industry.title} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5">
                <div className="relative h-48 overflow-hidden">
                  <img src={industry.image} alt={industry.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-950">{industry.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{industry.text}</p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><ArrowRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/40">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-[44px]">
              আমাদের প্যাকেজ
            </h2>
            <p className="mt-2.5 text-base leading-7 text-slate-600 sm:text-lg">
              আপনার ব্যবসার জন্য সঠিক প্যাকেজ নির্বাচন করুন।
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:gap-8 lg:grid-cols-2">
            {packages.map((plan) => {
              const Icon = plan.icon;
              const isEmerald = plan.colorScheme === "emerald";

              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col justify-between rounded-[32px] border p-7 sm:p-9 transition-all duration-300 hover:-translate-y-1.5 ${
                    isEmerald
                      ? "border-[#c9f2dc] bg-gradient-to-b from-[#eafaf1]/80 via-white to-white shadow-xl shadow-emerald-950/5 hover:shadow-2xl hover:shadow-emerald-950/10 hover:border-emerald-400"
                      : "border-[#d0e3ff] bg-gradient-to-b from-[#eef5ff]/80 via-white to-white shadow-xl shadow-blue-950/5 hover:shadow-2xl hover:shadow-blue-950/10 hover:border-blue-400"
                  }`}
                >
                  <div>
                    {/* Top Header Row with Icon and Title */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                          isEmerald
                            ? "bg-[#d5f7e5] text-[#008744]"
                            : "bg-[#dbe9fe] text-[#0066f5]"
                        }`}
                      >
                        <Icon className="h-7 w-7 stroke-[2.2]" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-[22px] leading-tight">
                          {plan.name}
                        </h3>
                        <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500">
                          {plan.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="mt-8 flex items-baseline gap-2">
                      <span
                        className={`text-4xl font-black tracking-tight sm:text-5xl ${
                          isEmerald ? "text-[#006837]" : "text-[#0062d2]"
                        }`}
                      >
                        {plan.price}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">
                        {plan.period}
                      </span>
                    </div>

                    {/* Subtle divider */}
                    <div className="my-6 border-t border-slate-200/60" />

                    {/* Features List */}
                    <div className="space-y-3.5">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                              isEmerald
                                ? "bg-[#d5f7e5] text-[#008744]"
                                : "bg-[#dbe9fe] text-[#0066f5]"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                          <span className="text-sm sm:text-[15px] font-semibold text-slate-800">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="mt-8 pt-2">
                    <Link
                      to={plan.buttonLink}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-base font-bold text-white shadow-lg transition-all ${
                        isEmerald
                          ? "bg-[#008744] hover:bg-[#007038] shadow-emerald-700/20"
                          : "bg-[#0066f5] hover:bg-[#0052c9] shadow-blue-700/20"
                      }`}
                    >
                      <span>{plan.buttonText}</span>
                      <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="support" className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="আমাদের ব্যবহারকারীদের মতামত"
            centered
            title="ব্যবসায়ীদের অভিজ্ঞতাই আমাদের অনুপ্রেরণা"
            text="BanglaQR কীভাবে তাদের প্রতিদিনের পেমেন্ট ব্যবস্থাপনাকে সহজ করছে, সেটিই আমাদের সবচেয়ে গুরুত্বপূর্ণ feedback।"
          />

          <div className="relative mt-12">
            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((item, index) => (
                <article key={item.name} className={`rounded-3xl border bg-white p-6 shadow-sm ${index === testimonialIndex ? "border-emerald-200 shadow-lg shadow-emerald-950/5" : "border-slate-200"}`}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 font-black text-emerald-700">{item.avatar}</span>
                    <div>
                      <p className="text-sm font-black text-slate-950">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <span key={i}>★</span>)}</div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">“{item.quote}”</p>
                </article>
              ))}
            </div>
            <div className="mt-7 flex items-center justify-center gap-2">
              <button type="button" onClick={prevTestimonial} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:text-emerald-700" aria-label="Previous testimonial"><ChevronLeft className="h-4 w-4" /></button>
              {testimonials.map((item, index) => <button key={item.name} type="button" onClick={() => setTestimonialIndex(index)} aria-label={`Testimonial ${index + 1}`} className={`h-2.5 rounded-full transition ${index === testimonialIndex ? "w-8 bg-emerald-600" : "w-2.5 bg-slate-300"}`} />)}
              <button type="button" onClick={nextTestimonial} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:text-emerald-700" aria-label="Next testimonial"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-emerald-950 shadow-2xl shadow-emerald-950/20">
          <div className="relative isolate overflow-hidden px-7 py-10 sm:px-10 sm:py-12 lg:px-14">
            <img src={authBg} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15" />
            <div className="absolute inset-0 -z-10 bg-emerald-950/85" />
            <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
              <div>
                <p className="text-3xl font-black text-white sm:text-4xl">আজই আপনার ব্যবসা ডিজিটাল করুন</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">BanglaQR-এর সাথে যুক্ত হয়ে আপনার ব্যবসার পেমেন্ট, রিপোর্টিং এবং মার্চেন্ট অপারেশনকে আরও সহজ ও গুছিয়ে পরিচালনা করুন।</p>
              </div>
              <Link to="/register" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 text-sm font-extrabold text-emerald-950 hover:bg-emerald-300">
                অ্যাকাউন্ট খুলুন <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="inline-flex items-center">
                <img
                  src={logoImg}
                  alt="BanglaQR"
                  className="h-10 w-auto rounded-lg bg-white p-1 object-contain shadow-xs"
                />
              </div>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">বাংলাদেশের ব্যবসায়ীদের জন্য একটি সহজ ও সংগঠিত ডিজিটাল পেমেন্ট সার্ভিস ম্যানেজমেন্ট প্ল্যাটফর্ম।</p>
              <div className="mt-5 flex items-center gap-2">
                {['f','▶','in','◎'].map((item) => <span key={item} className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-xs font-bold text-white/70">{item}</span>)}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">দ্রুত লিংক</h3>
              <div className="mt-4 space-y-3 text-sm text-white/60">
                <a href="#home" className="block hover:text-white">হোম</a>
                <a href="#features" className="block hover:text-white">সেবা সমূহ</a>
                <a href="#how-it-works" className="block hover:text-white">কিভাবে কাজ করে?</a>
                <a href="#packages" className="block hover:text-white">প্যাকেজ</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">সাহায্য</h3>
              <div className="mt-4 space-y-3 text-sm text-white/60">
                <a href="#support" className="block hover:text-white">FAQ</a>
                <a href="#support" className="block hover:text-white">ডকুমেন্টেশন</a>
                <a href="#support" className="block hover:text-white">সাপোর্ট সেন্টার</a>
                <a href="#contact" className="block hover:text-white">যোগাযোগ করুন</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">যোগাযোগ</h3>
              <div className="mt-4 space-y-4 text-sm text-white/60">
                <p className="flex items-start gap-2"><Building2 className="mt-0.5 h-4 w-4 text-emerald-400" />ঢাকা, বাংলাদেশ</p>
                <p className="flex items-start gap-2"><MessageCircle className="mt-0.5 h-4 w-4 text-emerald-400" />support@banglaqr.com</p>
                <p className="flex items-start gap-2"><Headphones className="mt-0.5 h-4 w-4 text-emerald-400" />+880 1234 567890</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 BanglaQR. সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex gap-5">
              <a href="#contact" className="hover:text-white">গোপনীয়তা নীতি</a>
              <a href="#contact" className="hover:text-white">শর্তাবলি</a>
              <a href="#contact" className="hover:text-white">সাহায্য</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
