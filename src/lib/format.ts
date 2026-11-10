export function formatMoney(paise: number): string {
  const value = paise / 100;
  const hasPaise = Math.round(paise) % 100 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: hasPaise ? 2 : 0,
  }).format(value);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function initials(value?: string | null): string {
  if (!value) return "F";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "F";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const FREE_SHIPPING_THRESHOLD = 150000; // ₹1,500 complimentary shipping
export const SHIPPING_FEE = 9900; // ₹99 flat pan-India shipping
export const TAX_RATE = 0.05; // 5% GST on single-origin spices

export function orderSummary(subtotal: number) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
