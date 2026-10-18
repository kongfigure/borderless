/** Sandbox-only payment helpers for the mocked checkout. This is the one and
 * only card number ever accepted — a widely-published test number, never a
 * real one — so nothing here can be mistaken for handling a real card. */
export const SANDBOX_CARD_NUMBER = "4242424242424242";

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})(?=.)/g, "$1 ");
}

export function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 12) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(mmYY: string): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(mmYY.trim());
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expiryEnd = new Date(year, month, 0);
  return expiryEnd >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export interface VirtualCard {
  number: string;
  expiry: string;
  cvc: string;
  lastFour: string;
}

/** A fresh single-use sandbox card for this order. The number is always the
 * published test number above; only expiry/CVC vary per checkout session,
 * and never outlive the browser tab. */
export function generateVirtualCard(): VirtualCard {
  const now = new Date();
  const expiryDate = new Date(now.getFullYear() + 2, now.getMonth());
  const month = String(expiryDate.getMonth() + 1).padStart(2, "0");
  const year = String(expiryDate.getFullYear() % 100).padStart(2, "0");
  const cvc = String(Math.floor(100 + Math.random() * 900));

  return {
    number: SANDBOX_CARD_NUMBER,
    expiry: `${month}/${year}`,
    cvc,
    lastFour: SANDBOX_CARD_NUMBER.slice(-4),
  };
}
