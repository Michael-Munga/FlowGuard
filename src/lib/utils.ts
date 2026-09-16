import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeApiUrl(raw?: string): string {
  if (!raw) return "http://localhost:8000";
  let url = raw.trim().replace(/\/+$/, "");

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.includes("localhost") || url.startsWith("127.0.0.1")) {
      url = `http://${url}`;
    } else if (url.includes(".onrender.com")) {
      url = `https://${url}`;
    } else {
      // Handles Render Blueprint service name (e.g. "flowguard-backend-zav5")
      url = `https://${url}.onrender.com`;
    }
  }
  return url;
}

export function getApiBaseUrl(): string {
  return normalizeApiUrl(
    process.env.NEXT_PUBLIC_FLOWGUARD_API_URL || process.env.NEXT_PUBLIC_API_URL
  );
}

export function isApiMode(): boolean {
  const explicit =
    process.env.NEXT_PUBLIC_FLOWGUARD_DATA_MODE ||
    process.env.NEXT_PUBLIC_DATA_MODE;
  if (explicit === "api") return true;
  if (explicit === "synthetic") return false;
  return Boolean(
    process.env.NEXT_PUBLIC_FLOWGUARD_API_URL ||
    process.env.NEXT_PUBLIC_API_URL
  );
}

