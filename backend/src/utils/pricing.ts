/**
 * Calculate the gross amount a student must pay so the organizer receives
 * exactly the desired net amount after all fees.
 *
 * Fees:
 * - MatricPay platform fee: 2% of gross
 * - Paystack processing fee:
 *   - If gross < ₦2,500: 1.5% of gross
 *   - If gross >= ₦2,500: min(1.5% + ₦100, ₦2,000)
 *
 * The gross-up ensures: gross - PaystackFee - MatricPayFee >= net
 * The final gross is always a whole Naira (no decimals).
 */

const MATRICPAY_FEE_PERCENT = 0.02;
const PAYSTACK_FEE_PERCENT = 0.015;
const PAYSTACK_FLAT_FEE = 100;      // ₦100 flat when gross >= ₦2,500
const PAYSTACK_THRESHOLD = 2500;    // gross threshold for flat fee
const PAYSTACK_MAX_FEE = 2000;      // cap on total Paystack fee

/**
 * Calculate Paystack fee for a given gross amount (in Naira).
 * Single source of truth for Paystack fee calculation.
 */
export function calculatePaystackFee(grossNaira: number): number {
  if (grossNaira < PAYSTACK_THRESHOLD) {
    return grossNaira * PAYSTACK_FEE_PERCENT;
  }

  return Math.min(
    grossNaira * PAYSTACK_FEE_PERCENT + PAYSTACK_FLAT_FEE,
    PAYSTACK_MAX_FEE
  );
}

/**
 * Calculate the smallest whole-Naira gross amount such that:
 * gross - PaystackFee(gross) - 2% * gross >= target
 */
export function calculateGrossFromNet(targetAmountNaira: number): number {
  const target = targetAmountNaira;

  // Upper bound: even if Paystack fee were max (2000) and MatricPay 2%,
  // gross <= (target + 2000) / 0.98
  const upperBound = Math.ceil((target + PAYSTACK_MAX_FEE) / (1 - MATRICPAY_FEE_PERCENT)) + 10;

  let low = 1;
  let high = upperBound;

  // Binary search for smallest gross that satisfies net >= target
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const net = mid - calculatePaystackFee(mid) - MATRICPAY_FEE_PERCENT * mid;

    // Use small epsilon to avoid floating-point precision issues
    if (net >= target - 1e-9) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}