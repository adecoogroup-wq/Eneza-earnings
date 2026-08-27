import { User } from '../types';

/**
 * Formats or generates a unique Eneza Earnings account number for a user.
 * Format: EE · XXXX · XXXX (e.g., EE · 7056 · 1031)
 */
export function getFormattedAccountNumber(user?: Partial<User> | null): string {
  if (!user) return 'EE · 0000 · 0000';

  if (user.accountNumber && user.accountNumber.trim()) {
    const raw = user.accountNumber.trim();
    if (raw.startsWith('EE ·') || raw.startsWith('EE -') || raw.startsWith('EE ')) {
      return raw;
    }
    // Format digits if plain number
    const cleanDigits = raw.replace(/\D/g, '');
    if (cleanDigits.length >= 8) {
      return `EE · ${cleanDigits.slice(-8, -4)} · ${cleanDigits.slice(-4)}`;
    }
    return `EE · ${raw}`;
  }

  // Derive unique deterministic account number from user's phone or ID
  const digits = (user.phone || user.id || `${user.username || 'usr'}_${user.createdAt || ''}`).replace(/\D/g, '');

  if (digits.length >= 8) {
    return `EE · ${digits.slice(-8, -4)} · ${digits.slice(-4)}`;
  } else if (digits.length >= 4) {
    const p1 = digits.padStart(4, '7').slice(0, 4);
    const p2 = digits.padEnd(4, '3').slice(-4);
    return `EE · ${p1} · ${p2}`;
  }

  // Fallback hash from user.id
  let hash = 0;
  const seed = `${user.id || 'usr'}_${user.username || 'member'}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash).toString().padStart(8, '5');
  return `EE · ${abs.slice(0, 4)} · ${abs.slice(4, 8)}`;
}

/**
 * Generate a fresh unique account number upon new user registration
 */
export function generateNewAccountNumber(phone?: string): string {
  if (phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 8) {
      return `EE · ${clean.slice(-8, -4)} · ${clean.slice(-4)}`;
    }
  }
  const p1 = Math.floor(1000 + Math.random() * 9000);
  const p2 = Math.floor(1000 + Math.random() * 9000);
  return `EE · ${p1} · ${p2}`;
}
