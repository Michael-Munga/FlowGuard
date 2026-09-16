import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_FLOWGUARD_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";
  return raw.replace(/\/+$/, "");
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

