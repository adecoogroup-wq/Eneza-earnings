import fs from 'fs';
import path from 'path';
import { UserActivityLog, Transaction } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/mockData';

const PROJECT_DATA_DIR = path.join(process.cwd(), 'data');
const ACTIVITIES_FILE_PATH = path.join(PROJECT_DATA_DIR, 'activity_logs.json');
const TRANSACTIONS_FILE_PATH = path.join(PROJECT_DATA_DIR, 'transactions.json');
const TMP_ACTIVITIES_PATH = path.join('/tmp', 'eneza_activity_logs.json');
const TMP_TRANSACTIONS_PATH = path.join('/tmp', 'eneza_transactions.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(PROJECT_DATA_DIR)) {
    fs.mkdirSync(PROJECT_DATA_DIR, { recursive: true });
  }
} catch (err) {
  // Safe ignore
}

// Initial seed activity logs
const SEED_ACTIVITY_LOGS: UserActivityLog[] = [
  {
    id: 'act_seed_1',
    userId: 'usr_1',
    userName: 'Chris Kamau',
    userPhone: '0712345678',
    action: 'login',
    title: 'User Signed In',
    details: 'Signed in via Web Portal from Safari / iOS',
    ipAddress: '197.232.84.11',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'act_seed_2',
    userId: 'usr_1',
    userName: 'Chris Kamau',
    userPhone: '0712345678',
    action: 'whatsapp_earn',
    title: 'WhatsApp Status Views Verified',
    details: 'Submitted 45 status views for Safaricom 5G campaign',
    amount: 4500,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'act_seed_3',
    userId: 'usr_2',
    userName: 'Sarah Wanjiku',
    userPhone: '0722998877',
    action: 'spin_wheel',
    title: 'Lucky Spin Reward Won',
    details: 'Won KES 500 on Lucky Wheel Daily Free Spin',
    amount: 500,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'act_seed_4',
    userId: 'usr_3',
    userName: 'Brian Otieno',
    userPhone: '0733112233',
    action: 'deposit',
    title: 'M-Pesa STK Deposit Completed',
    details: 'Lipa Na M-Pesa STK Push receipt QK98234JH verified',
    amount: 1500,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'act_seed_5',
    userId: 'usr_admin',
    userName: 'System Admin',
    userPhone: '0799000111',
    action: 'login',
    title: 'Administrator Console Login',
    details: 'Root SuperAdmin authenticated into HQ Portal',
    ipAddress: '102.134.12.9',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var _enezaActivityLogs: UserActivityLog[] | undefined;
  // eslint-disable-next-line no-var
  var _enezaTransactions: Map<string, Transaction> | undefined;
}

function loadFromFile<T>(paths: string[], fallback: T): T {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed) return parsed;
      }
    } catch (err) {
      // Continue to next path
    }
  }
  return fallback;
}

function saveToFile(filePath: string, tmpPath: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    if (!fs.existsSync(PROJECT_DATA_DIR)) {
      fs.mkdirSync(PROJECT_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, jsonStr, 'utf-8');
  } catch (err) {
    // Project root read-only in serverless, fallback
  }

  try {
    fs.writeFileSync(tmpPath, jsonStr, 'utf-8');
  } catch (err) {
    // Ignore
  }
}

// -------------------------------------------------------------
// Activity Logs Store
// -------------------------------------------------------------

export function getAllStoredActivityLogs(): UserActivityLog[] {
  if (!globalThis._enezaActivityLogs) {
    const loaded = loadFromFile<UserActivityLog[]>([ACTIVITIES_FILE_PATH, TMP_ACTIVITIES_PATH], []);
    const mergedMap = new Map<string, UserActivityLog>();
    
    // 1. Seed logs
    SEED_ACTIVITY_LOGS.forEach((log) => mergedMap.set(log.id, log));
    // 2. Persisted logs
    loaded.forEach((log) => {
      if (log && log.id) mergedMap.set(log.id, log);
    });

    globalThis._enezaActivityLogs = Array.from(mergedMap.values());
  }

  // Sort descending by timestamp
  return globalThis._enezaActivityLogs.sort((a, b) => {
    return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
  });
}

export function recordActivityLog(log: Partial<UserActivityLog> & { userId: string; action: UserActivityLog['action']; title: string }): UserActivityLog {
  const currentLogs = getAllStoredActivityLogs();
  const newLog: UserActivityLog = {
    id: log.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: log.userId,
    userName: log.userName || 'Member',
    userPhone: log.userPhone || '',
    action: log.action,
    title: log.title,
    details: log.details || '',
    amount: log.amount !== undefined ? Number(log.amount) : undefined,
    metadata: log.metadata || {},
    ipAddress: log.ipAddress || 'Internal WebApp',
    timestamp: log.timestamp || new Date().toISOString(),
  };

  // Add to top of list and limit to last 2,000 logs for high performance
  const updatedLogs = [newLog, ...currentLogs.filter((l) => l.id !== newLog.id)].slice(0, 2000);
  globalThis._enezaActivityLogs = updatedLogs;

  saveToFile(ACTIVITIES_FILE_PATH, TMP_ACTIVITIES_PATH, updatedLogs);
  return newLog;
}

// -------------------------------------------------------------
// Transactions Store
// -------------------------------------------------------------

export function getAllStoredTransactions(): Transaction[] {
  if (!globalThis._enezaTransactions) {
    globalThis._enezaTransactions = new Map<string, Transaction>();

    // 1. Mock initial transactions
    INITIAL_TRANSACTIONS.forEach((tx) => {
      globalThis._enezaTransactions!.set(tx.id, { ...tx });
    });

    // 2. File loaded transactions
    const loaded = loadFromFile<Transaction[]>([TRANSACTIONS_FILE_PATH, TMP_TRANSACTIONS_PATH], []);
    loaded.forEach((tx) => {
      if (tx && tx.id) {
        globalThis._enezaTransactions!.set(tx.id, { ...tx });
      }
    });
  }

  const result = Array.from(globalThis._enezaTransactions.values());
  return result.sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

export function saveOrUpdateTransaction(tx: Transaction): Transaction {
  getAllStoredTransactions(); // ensure initialized
  const map = globalThis._enezaTransactions!;

  const existing = map.get(tx.id) || {};
  const merged: Transaction = {
    ...existing,
    ...tx,
    id: tx.id || `tx_${Date.now()}`,
    createdAt: tx.createdAt || (existing as any).createdAt || new Date().toISOString(),
  };

  map.set(merged.id, merged);

  const all = Array.from(map.values());
  saveToFile(TRANSACTIONS_FILE_PATH, TMP_TRANSACTIONS_PATH, all);
  return merged;
}

export function batchSyncTransactions(txs: Transaction[]): Transaction[] {
  if (!Array.isArray(txs)) return getAllStoredTransactions();
  txs.forEach((tx) => {
    if (tx && tx.id) {
      saveOrUpdateTransaction(tx);
    }
  });
  return getAllStoredTransactions();
}
