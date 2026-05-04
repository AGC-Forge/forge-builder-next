import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

// ISO 4217 zero-decimal currencies — avoid relying on ICU data which differs between Node and browsers
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "ISK", "IDR", "JPY", "KMF", "KRW",
  "MGA", "PYG", "RWF", "UGX", "UYI", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = "USD", locale = "en-US", minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const defaultDecimals = ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2;
  const effectiveNoDecimals = noDecimals || ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase());

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: effectiveNoDecimals ? 0 : (minimumFractionDigits ?? defaultDecimals),
    maximumFractionDigits: effectiveNoDecimals ? 0 : (maximumFractionDigits ?? defaultDecimals),
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}