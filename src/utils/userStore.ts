import fs from 'fs';
import path from 'path';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

// Persistent storage file paths
const PROJECT_DATA_DIR = path.join(process.cwd(), 'data');
const PROJECT_FILE_PATH = path.join(PROJECT_DATA_DIR, 'registered_users.json');
const TMP_FILE_PATH = path.join('/tmp', 'eneza_registered_users.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(PROJECT_DATA_DIR)) {
    fs.mkdirSync(PROJECT_DATA_DIR, { recursive: true });
  }
} catch (err) {
  // Non-fatal if filesystem is restricted
}

// Global in-memory cache for serverless and long-lived node environments
declare global {
  // eslint-disable-next-line no-var
  var _enezaRegisteredUsers: Map<string, User> | undefined;
}

function loadUsersFromFile(): User[] {
  // Try project data file first, then /tmp fallback
  const candidatePaths = [PROJECT_FILE_PATH, TMP_FILE_PATH];
  for (const filePath of candidatePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[UserStore] Error loading users from ${filePath}:`, err);
    }
  }
  return [];
}

function saveUsersToFile(users: User[]) {
  if (!Array.isArray(users)) return;
  const jsonStr = JSON.stringify(users, null, 2);

  // Write to project data file
  try {
    if (!fs.existsSync(PROJECT_DATA_DIR)) {
      fs.mkdirSync(PROJECT_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROJECT_FILE_PATH, jsonStr, 'utf-8');
  } catch (err) {
    // Project root may be read-only in some environments, fallback to /tmp
  }

  // Write to /tmp file
  try {
    fs.writeFileSync(TMP_FILE_PATH, jsonStr, 'utf-8');
  } catch (err) {
    console.warn('[UserStore] Error saving to /tmp:', err);
  }
}

// Initialize global user map on startup with seed users + persisted file users
if (!globalThis._enezaRegisteredUsers) {
  globalThis._enezaRegisteredUsers = new Map<string, User>();

  // 1. Seed initial users
  INITIAL_USERS.forEach((u) => {
    globalThis._enezaRegisteredUsers!.set(u.id, { ...u });
    if (u.phone) {
      const cleanPhone = u.phone.replace(/\D/g, '');
      if (cleanPhone) globalThis._enezaRegisteredUsers!.set(`phone_${cleanPhone}`, { ...u });
    }
  });

  // 2. Load and merge saved users from file
  const savedUsers = loadUsersFromFile();
  savedUsers.forEach((u) => {
    if (u && u.id) {
      const existing = globalThis._enezaRegisteredUsers!.get(u.id);
      globalThis._enezaRegisteredUsers!.set(u.id, existing ? { ...existing, ...u } : { ...u });
      if (u.phone) {
        const cleanPhone = u.phone.replace(/\D/g, '');
        if (cleanPhone) globalThis._enezaRegisteredUsers!.set(`phone_${cleanPhone}`, u);
      }
    }
  });
}

export function getAllStoredUsers(): User[] {
  const map = globalThis._enezaRegisteredUsers || new Map<string, User>();
  const fileUsers = loadUsersFromFile();

  // Merge file users into in-memory map without overwriting newer in-memory updates
  fileUsers.forEach((u) => {
    if (u && u.id) {
      const current = map.get(u.id);
      if (!current) {
        map.set(u.id, u);
      } else {
        // Retain file persisted values merged with in-memory updates
        map.set(u.id, { ...current, ...u });
      }
      if (u.phone) {
        const cleanPhone = u.phone.replace(/\D/g, '');
        if (cleanPhone) map.set(`phone_${cleanPhone}`, u);
      }
    }
  });

  // Extract unique users by id
  const userMap = new Map<string, User>();
  // Ensure seed users exist
  INITIAL_USERS.forEach((u) => userMap.set(u.id, { ...u }));

  map.forEach((value, key) => {
    if (key.startsWith('phone_')) return;
    if (value && value.id) {
      const existing = userMap.get(value.id);
      userMap.set(value.id, existing ? { ...existing, ...value } : value);
    }
  });

  const result = Array.from(userMap.values());
  // Sort descending by registration / creation time (newest registrations first)
  result.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return result;
}

export function registerOrUpdateUser(user: Partial<User> & { id: string }): User {
  const map = globalThis._enezaRegisteredUsers || new Map<string, User>();
  const existing: Partial<User> = map.get(user.id) || {};

  const cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : (existing.phone ? existing.phone.replace(/\D/g, '') : '');
  const existingByPhone: Partial<User> = cleanPhone ? (map.get(`phone_${cleanPhone}`) || {}) : {};

  const baseUser = { ...existingByPhone, ...existing };

  const merged: User = {
    id: user.id || baseUser.id || `usr_${Date.now()}`,
    username: user.username || baseUser.username || `user_${Date.now()}`,
    firstName: user.firstName || baseUser.firstName || 'Member',
    lastName: user.lastName || baseUser.lastName || '',
    phone: user.phone || baseUser.phone || '',
    accountNumber: user.accountNumber || baseUser.accountNumber,
    email: user.email || baseUser.email,
    password: user.password || baseUser.password || '123456',
    role: user.role || baseUser.role || 'user',
    isActivated: user.isActivated ?? baseUser.isActivated ?? false,
    tier: user.tier || baseUser.tier || 'Standard',
    balance: Number(user.balance ?? baseUser.balance ?? 0),
    depositBalance: Number(user.depositBalance ?? baseUser.depositBalance ?? 0),
    pendingBalance: Number(user.pendingBalance ?? baseUser.pendingBalance ?? 0),
    totalWithdrawn: Number(user.totalWithdrawn ?? baseUser.totalWithdrawn ?? 0),
    totalEarned: Number(user.totalEarned ?? baseUser.totalEarned ?? 0),
    referralCode: user.referralCode || baseUser.referralCode || `EE${Math.floor(1000 + Math.random() * 9000)}`,
    referredBy: user.referredBy || baseUser.referredBy || '',
    spinsRemaining: Number(user.spinsRemaining ?? baseUser.spinsRemaining ?? 1),
    tasksCompletedToday: Number(user.tasksCompletedToday ?? baseUser.tasksCompletedToday ?? 0),
    maxTasksPerDay: Number(user.maxTasksPerDay ?? baseUser.maxTasksPerDay ?? 5),
    whatsappBalance: user.whatsappBalance !== undefined
      ? Number(user.whatsappBalance)
      : baseUser.whatsappBalance !== undefined
      ? Number(baseUser.whatsappBalance)
      : Number(user.balance !== undefined ? user.balance : (baseUser.balance ?? 0)),
    pendingCashbackTotal: Number(user.pendingCashbackTotal ?? baseUser.pendingCashbackTotal ?? 0),
    activeWhatsAppPackage: user.activeWhatsAppPackage || baseUser.activeWhatsAppPackage,
    isAuthorizedPackagePurchased: Boolean(user.isAuthorizedPackagePurchased ?? baseUser.isAuthorizedPackagePurchased),
    isUnlockMpesaPurchased: Boolean(user.isUnlockMpesaPurchased ?? baseUser.isUnlockMpesaPurchased),
    isAutomationPackagePurchased: Boolean(user.isAutomationPackagePurchased ?? baseUser.isAutomationPackagePurchased),
    isVerifiedAgentPurchased: Boolean(user.isVerifiedAgentPurchased ?? baseUser.isVerifiedAgentPurchased),
    isUniversePackagePurchased: Boolean(user.isUniversePackagePurchased ?? baseUser.isUniversePackagePurchased),
    createdAt: user.createdAt || baseUser.createdAt || new Date().toISOString(),
  };

  map.set(merged.id, merged);
  if (cleanPhone) {
    map.set(`phone_${cleanPhone}`, merged);
  }

  // Persist all users to disk
  const all = getAllStoredUsers();
  saveUsersToFile(all);

  return merged;
}

export function deleteStoredUser(userId: string): boolean {
  const map = globalThis._enezaRegisteredUsers || new Map<string, User>();
  const user = map.get(userId);
  if (user) {
    map.delete(userId);
    if (user.phone) {
      const cleanPhone = user.phone.replace(/\D/g, '');
      if (cleanPhone) map.delete(`phone_${cleanPhone}`);
    }
  }

  // Also remove from file
  const fileUsers = loadUsersFromFile();
  const filtered = fileUsers.filter((u) => u.id !== userId && (!user?.phone || u.phone?.replace(/\D/g, '') !== user.phone.replace(/\D/g, '')));
  saveUsersToFile(filtered);

  return true;
}

export function batchSyncUsers(usersToSync: User[]): User[] {
  if (!Array.isArray(usersToSync)) return getAllStoredUsers();

  usersToSync.forEach((u) => {
    if (u && u.id) {
      registerOrUpdateUser(u);
    }
  });

  return getAllStoredUsers();
}

