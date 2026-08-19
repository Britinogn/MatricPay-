/**
 * Calculate the gross amount a student must pay so the organizer receives
 * exactly the desired net amount after all fees.
 *
 * Fees:
 * - MatricPay platform fee: 2% of gross
 * - Paystack processing fee: 1.5% + ₦100 (local cards), capped at ₦2,000
 *
 * The calculation uses the capped fee when gross > ₦126,666.67.
 */
export function calculateGrossFromNet(netAmountNaira: number): number {
  const net = netAmountNaira;

  // Case 1: Paystack fee = 1.5% + 100 (not capped)
  const grossCase1 = (net + 100) / 0.965;
  if (grossCase1 <= 126666.67) {
    // Round up to nearest kobo to ensure organizer never receives less
    return Math.ceil(grossCase1 * 100) / 100;
  }

  // Case 2: Paystack fee capped at ₦2,000
  const grossCase2 = (net + 2000) / 0.98;
  return Math.ceil(grossCase2 * 100) / 100;
}