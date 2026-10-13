import bkashLogo from "../assets/paymentLogos/bkash.png";
import nagadLogo from "../assets/paymentLogos/nagad.webp";
import rocketLogo from "../assets/paymentLogos/roket.webp";
import upayLogo from "../assets/paymentLogos/upay.webp";
import visaLogo from "../assets/paymentLogos/visa.png";
import mastercardLogo from "../assets/paymentLogos/mastercard.png";

export const DEFAULT_BRAND_LOGOS = {
  bkash: bkashLogo,
  "bKash": bkashLogo,
  "বিকাশ": bkashLogo,
  nagad: nagadLogo,
  "নগদ": nagadLogo,
  rocket: rocketLogo,
  roket: rocketLogo,
  "রকেট": rocketLogo,
  upay: upayLogo,
  "উপায়": upayLogo,
  visa: visaLogo,
  VISA: visaLogo,
  mastercard: mastercardLogo,
  "dhaka bank": "/images/logos/dhakabank.svg",
  "dhakabank": "/images/logos/dhakabank.svg",
  "ঢাকা ব্যাংক": "/images/logos/dhakabank.svg",
  "brac bank": "/images/logos/bracbank.svg",
  "bracbank": "/images/logos/bracbank.svg",
  "ব্র্যাক ব্যাংক": "/images/logos/bracbank.svg",
};

export function getApiBaseUrl() {
  // const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  const apiUrl = import.meta.env.VITE_API_URL || "https://api.banglaqr.online/api/v1";

  return apiUrl.replace(/\/api\/v1\/?$/, "");
}

/**
 * Normalizes relative uploaded paths, absolute URLs, or local public static assets
 */
export function resolveImageUrl(url, fallback = null) {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Files in client/public
  if (trimmed.startsWith("/images/") || trimmed.startsWith("/assets/")) {
    return trimmed;
  }

  // Uploaded media served by backend
  if (trimmed.startsWith("/uploads/")) {
    const base = getApiBaseUrl();
    return `${base}${trimmed}`;
  }

  const base = getApiBaseUrl();
  return `${base}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

/**
 * Resolves a service logo with automatic brand fallback
 */
export function resolveServiceLogo(logoUrl, code = "", name = "") {
  if (logoUrl) {
    return resolveImageUrl(logoUrl);
  }

  const normalized = `${name || ""} ${code || ""}`.toLowerCase();
  for (const [key, logo] of Object.entries(DEFAULT_BRAND_LOGOS)) {
    if (normalized.includes(key.toLowerCase())) {
      return resolveImageUrl(logo);
    }
  }

  return null;
}

