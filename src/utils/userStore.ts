import fs from 'fs';
import path from 'path';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

const TMP_FILE_PATH = path.join('/tmp', 'eneza_registered_users.json');

// Global in-memory cache for serverless environments
declare global {
  // eslint-disable-next-line no-var
  var _enezaRegisteredUsers: Map<string, User> | undefined;
}

if (!globalThis._enezaRegisteredUsers) {
  globalThis._enezaRegisteredUsers = new Map<string, User>();
  // Seed with initial users
  INITIAL_USERS.forEach((u) => {
    globalThis._enezaRegisteredUsers!.set(u.id, { ...u });
    if (u.phone) {
      const cleanPhone = u.phone.replace(/\D/g, '');
      if (cleanPhone) globalThis._enezaRegisteredUsers!.set(`phone_${cleanPhone}`, { ...u });
    }
  });
}

function loadUsersFromFile(): User[] {
  try {
    if (fs.existsSync(TMP_FILE_PATH)) {
      const content = fs.readFileSync(TMP_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[UserStore] Error loading from temp file:', err);
  }
  return [];
}

function saveUsersToFile(users: User[]) {
  try {
    fs.writeFileSync(TMP_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[UserStore] Error saving to temp file:', err);
  }
}

export function getAllStoredUsers(): User[] {
  const map = globalThis._enezaRegisteredUsers || new Map<string, User>();
  const fileUsers = loadUsersFromFile();

  // Merge file users into map
  fileUsers.forEach((u) => {
    if (u && u.id) {
      map.set(u.id, u);
    }
  });

  // Extract unique users by id
  const userMap = new Map<string, User>();
  // Ensure seed users exist
  INITIAL_USERS.forEach((u) => userMap.set(u.id, { ...u }));

  map.forEach((value, key) => {
    if (key.startsWith('phone_')) return;
    if (value && value.id) {
      userMap.set(value.id, value);
    }
  });

  const result = Array.from(userMap.values());
  // Sort descending by registration / creation time
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

  const merged: User = {
    id: user.id,
    username: user.username || existing.username || `user_${Date.now()}`,
    firstName: user.firstName || existing.firstName || 'Member',
    lastName: user.lastName || existing.lastName || '',
    phone: user.phone || existing.phone || '',
    email: user.email || existing.email,
    password: user.password || existing.password || '123456',
    role: user.role || existing.role || 'user',
    isActivated: user.isActivated ?? existing.isActivated ?? false,
    tier: user.tier || existing.tier || 'Standard',
    balance: Number(user.balance ?? existing.balance ?? 0),
    depositBalance: Number(user.depositBalance ?? existing.depositBalance ?? 0),
    pendingBalance: Number(user.pendingBalance ?? existing.pendingBalance ?? 0),
    totalWithdrawn: Number(user.totalWithdrawn ?? existing.totalWithdrawn ?? 0),
    totalEarned: Number(user.totalEarned ?? existing.totalEarned ?? 0),
    referralCode: user.referralCode || existing.referralCode || `EE${Math.floor(1000 + Math.random() * 9000)}`,
    referredBy: user.referredBy || existing.referredBy || '',
    spinsRemaining: Number(user.spinsRemaining ?? existing.spinsRemaining ?? 0),
    tasksCompletedToday: Number(user.tasksCompletedToday ?? existing.tasksCompletedToday ?? 0),
    maxTasksPerDay: Number(user.maxTasksPerDay ?? existing.maxTasksPerDay ?? 5),
    whatsappBalance: Number(user.whatsappBalance ?? existing.whatsappBalance ?? 0),
    pendingCashbackTotal: Number(user.pendingCashbackTotal ?? existing.pendingCashbackTotal ?? 0),
    activeWhatsAppPackage: user.activeWhatsAppPackage || existing.activeWhatsAppPackage,
    isAuthorizedPackagePurchased: Boolean(user.isAuthorizedPackagePurchased ?? existing.isAuthorizedPackagePurchased),
    isUnlockMpesaPurchased: Boolean(user.isUnlockMpesaPurchased ?? existing.isUnlockMpesaPurchased),
    isAutomationPackagePurchased: Boolean(user.isAutomationPackagePurchased ?? existing.isAutomationPackagePurchased),
    isVerifiedAgentPurchased: Boolean(user.isVerifiedAgentPurchased ?? existing.isVerifiedAgentPurchased),
    isUniversePackagePurchased: Boolean(user.isUniversePackagePurchased ?? existing.isUniversePackagePurchased),
    createdAt: user.createdAt || existing.createdAt || new Date().toISOString(),
  };

  map.set(merged.id, merged);
  if (merged.phone) {
    const cleanPhone = merged.phone.replace(/\D/g, '');
    if (cleanPhone) map.set(`phone_${cleanPhone}`, merged);
  }

  // Persist to file
  const all = getAllStoredUsers();
  saveUsersToFile(all);

  return merged;
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
