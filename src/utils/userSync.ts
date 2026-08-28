import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

const REFERRAL_STORAGE_KEY = 'eneza_captured_referral_code';

/**
 * Capture referral code from URL query parameters (e.g. ?ref=ENEZAPRO or ?r=ENEZAPRO)
 */
export function captureReferralCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('r') || params.get('referrer') || params.get('code');
    if (ref && ref.trim()) {
      const cleanRef = ref.trim().toUpperCase();
      localStorage.setItem(REFERRAL_STORAGE_KEY, cleanRef);
      console.log('[Eneza Referral Engine] Captured referral code from URL:', cleanRef);
      return cleanRef;
    }
  } catch (err) {
    console.warn('[Referral Capture Error]:', err);
  }

  return localStorage.getItem(REFERRAL_STORAGE_KEY) || null;
}

/**
 * Get current active captured referral code
 */
export function getCapturedReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFERRAL_STORAGE_KEY) || null;
}

/**
 * Clear stored referral code after successful registration
 */
export function clearCapturedReferralCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
}

/**
 * Fetch all registered users from the central backend registry
 */
export async function fetchRemoteUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        console.log(`[Eneza User Sync] Fetched ${data.users.length} live members from central registry.`);
        return data.users;
      }
    }
  } catch (err) {
    console.warn('[Eneza User Sync] Could not fetch remote users, using local cache:', err);
  }
  return [];
}

/**
 * Register a newly created user in the central database
 */
export async function registerRemoteUser(newUser: User): Promise<{ success: boolean; allUsers?: User[]; user?: User }> {
  try {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[Eneza User Sync] Successfully registered ${newUser.username} in central registry! Total members:`, data.totalUsers);
      return {
        success: true,
        allUsers: data.users || [],
        user: data.user || newUser,
      };
    } else {
      const errData = await res.json().catch(() => null);
      console.warn('[Eneza User Sync] Registration API returned error:', errData);
    }
  } catch (err) {
    console.warn('[Eneza User Sync] Network error during remote registration:', err);
  }

  return { success: false };
}

/**
 * Update user in the central database
 */
export async function updateRemoteUser(user: Partial<User> & { id: string }): Promise<{ success: boolean; allUsers?: User[]; user?: User }> {
  try {
    const res = await fetch('/api/users/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[Eneza User Sync] Successfully updated ${user.id} in central registry!`);
      return {
        success: true,
        allUsers: data.users || [],
        user: data.user,
      };
    }
  } catch (err) {
    console.warn('[Eneza User Sync] Network error during remote user update:', err);
  }

  return { success: false };
}

/**
 * Delete user in the central database
 */
export async function deleteRemoteUser(userId: string): Promise<{ success: boolean; allUsers?: User[] }> {
  try {
    const res = await fetch('/api/users/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[Eneza User Sync] Successfully deleted ${userId} from central registry!`);
      return {
        success: true,
        allUsers: data.users || [],
      };
    }
  } catch (err) {
    console.warn('[Eneza User Sync] Network error during remote user deletion:', err);
  }

  return { success: false };
}

/**
 * Batch synchronize client and server users
 */
export async function syncAllUsersWithBackend(clientUsers: User[]): Promise<User[]> {
  try {
    const res = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: clientUsers }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        return data.users;
      }
    }
  } catch (err) {
    console.warn('[Eneza User Sync] Batch sync error:', err);
  }

  return clientUsers;
}

/**
 * Merge two lists of users without losing data or duplicates
 */
export function mergeUserLists(local: User[], remote: User[]): User[] {
  const map = new Map<string, User>();

  // 1. Add initial seed users
  INITIAL_USERS.forEach((u) => {
    if (u && u.id) map.set(u.id, { ...u });
  });

  // 2. Add local users (from localStorage/state)
  if (Array.isArray(local)) {
    local.forEach((u) => {
      if (u && u.id) {
        const existing = map.get(u.id);
        map.set(u.id, existing ? { ...existing, ...u } : { ...u });
      }
    });
  }

  // 3. Merge remote users (central server source of truth)
  if (Array.isArray(remote)) {
    remote.forEach((u) => {
      if (u && u.id) {
        const existing = map.get(u.id);
        if (existing) {
          map.set(u.id, {
            ...existing,
            ...u,
            // Retain explicit remote values when defined
            balance: u.balance !== undefined ? u.balance : existing.balance,
            depositBalance: u.depositBalance !== undefined ? u.depositBalance : existing.depositBalance,
            whatsappBalance: u.whatsappBalance !== undefined ? u.whatsappBalance : existing.whatsappBalance,
            isActivated: u.isActivated !== undefined ? u.isActivated : existing.isActivated,
            tier: u.tier || existing.tier,
            isAuthorizedPackagePurchased: u.isAuthorizedPackagePurchased ?? existing.isAuthorizedPackagePurchased,
            isUnlockMpesaPurchased: u.isUnlockMpesaPurchased ?? existing.isUnlockMpesaPurchased,
            isAutomationPackagePurchased: u.isAutomationPackagePurchased ?? existing.isAutomationPackagePurchased,
            isVerifiedAgentPurchased: u.isVerifiedAgentPurchased ?? existing.isVerifiedAgentPurchased,
            isUniversePackagePurchased: u.isUniversePackagePurchased ?? existing.isUniversePackagePurchased,
          });
        } else {
          map.set(u.id, { ...u });
        }
      }
    });
  }

  const merged = Array.from(map.values());
  // Sort descending by registration date (newest registered members first)
  merged.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return merged;
}

/**
 * Trigger immediate multi-tab sync event
 */
export function broadcastUserUpdate(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('eneza_users_updated', { detail: { timestamp: Date.now() } }));
    localStorage.setItem('eneza_last_sync_signal', String(Date.now()));
  } catch (err) {
    // ignore
  }
}

