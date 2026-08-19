export function formatNaira(amount: string | number, currency = "NGN"): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;

  if (currency !== "NGN") {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(numeric);
  }

  return `₦${numeric.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// New: compact formatter for large numbers
export function formatCompactNaira(amount: string | number, currency = "NGN"): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(numeric);
}