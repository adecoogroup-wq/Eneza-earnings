/**
 * Safe date utilities that prevent "Invalid time value" RangeError
 */

export function parseSafeDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? new Date() : val;
  }
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  if (typeof val === 'string') {
    // Check if it's already a relative / descriptive string like 'Today, 08:30 AM' or 'Just now'
    if (val.toLowerCase().includes('just now') || val.toLowerCase().includes('today') || val.toLowerCase().includes('yesterday')) {
      return new Date();
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  return new Date();
}

export function safeFormatDate(
  val: any,
  options?: Intl.DateTimeFormatOptions,
  fallback = 'Just now'
): string {
  try {
    if (!val) return fallback;
    if (typeof val === 'string' && (val.includes('ago') || val.includes('Just now') || val.includes('Today,'))) {
      return val;
    }
    const d = parseSafeDate(val);
    return d.toLocaleDateString('en-KE', options || {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return fallback;
  }
}

export function safeFormatDateTime(
  val: any,
  options?: Intl.DateTimeFormatOptions,
  fallback = 'Just now'
): string {
  try {
    if (!val) return fallback;
    if (typeof val === 'string' && (val.includes('ago') || val.includes('Just now') || val.includes('Today,'))) {
      return val;
    }
    const d = parseSafeDate(val);
    return d.toLocaleString('en-KE', options || {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return fallback;
  }
}

export function safeToISODateString(val: any): string {
  try {
    const d = parseSafeDate(val);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function safeGetTime(val: any): number {
  try {
    const d = parseSafeDate(val);
    return d.getTime();
  } catch {
    return Date.now();
  }
}
