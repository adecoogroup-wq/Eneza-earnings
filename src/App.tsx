import React, { useState, useEffect } from 'react';
import {
  User,
  EarningTask,
  Transaction,
  Referral,
  NotificationItem,
  VipPackage,
  TierLevel,
  WhatsAppPackageItem,
  CashbackItem,
  WhatsAppSubmission,
  InvestmentPlan,
  ActiveInvestment,
  PayHeroConfig
} from './types';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_REFERRALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CASHBACK_ITEMS,
  INITIAL_ACTIVE_INVESTMENTS,
  WHATSAPP_PACKAGES,
  PIPELINE_PACKAGES,
  TODAY_PRODUCT_AD,
  INITIAL_PAYHERO_CONFIG
} from './data/mockData';
import { AuthModule } from './components/AuthModule';
import { Sidebar, AppView } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { UserDashboard } from './components/UserDashboard';
import { TasksView } from './components/TasksView';
import { SpinWheelView } from './components/SpinWheelView';
import { ReferralsView } from './components/ReferralsView';
import { CashierView } from './components/CashierView';
import { LedgerView } from './components/LedgerView';
import { AdminDashboard } from './components/AdminDashboard';
import { WhatsAppPackagesView } from './components/WhatsAppPackagesView';
import { CashbackBonusView } from './components/CashbackBonusView';
import { WhatsAppEarningsView } from './components/WhatsAppEarningsView';
import { AuthorizePackageView } from './components/AuthorizePackageView';
import { UnlockMpesaView } from './components/UnlockMpesaView';
import { AutomationPackageView } from './components/AutomationPackageView';
import { VerifiedAgentView } from './components/VerifiedAgentView';
import { UniversePackageView } from './components/UniversePackageView';
import { InvestmentPlansView } from './components/InvestmentPlansView';
import { MpesaDepositModal } from './components/Modals/MpesaDepositModal';
import { WithdrawalModal } from './components/Modals/WithdrawalModal';
import { TaskExecutionModal } from './components/Modals/TaskExecutionModal';
import { ReceiptModal } from './components/Modals/ReceiptModal';
import { NotificationsDrawer } from './components/Modals/NotificationsDrawer';
import confetti from 'canvas-confetti';
import {
  captureReferralCodeFromUrl,
  fetchRemoteUsers,
  registerRemoteUser,
  updateRemoteUser,
  deleteRemoteUser,
  syncAllUsersWithBackend,
  mergeUserLists,
} from './utils/userSync';
import { getFormattedAccountNumber } from './utils/accountNumber';

export default function App() {
  // Persistence key helpers
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`eneza_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const setStored = <T,>(key: string, val: T) => {
    try {
      localStorage.setItem(`eneza_${key}`, JSON.stringify(val));
    } catch {
      // ignore
    }
  };

  const normalizeUser = (u: any): User => {
    if (!u) return INITIAL_USERS[0];
    const bal = Number(u.balance || 0);
    const waBal = typeof u.whatsappBalance === 'number' && u.whatsappBalance > 0 ? u.whatsappBalance : (u.whatsappBalance !== undefined ? Number(u.whatsappBalance) : bal);
    return {
      id: u.id || `usr_${Date.now()}`,
      username: u.username || 'user',
      firstName: u.firstName || 'User',
      lastName: u.lastName || '',
      phone: u.phone || '0700000000',
      accountNumber: u.accountNumber || getFormattedAccountNumber(u),
      email: u.email || '',
      password: u.password || '',
      role: u.role || 'user',
      isActivated: Boolean(u.isActivated),
      tier: u.tier || 'Standard',
      balance: bal,
      depositBalance: Number(u.depositBalance || 0),
      pendingBalance: Number(u.pendingBalance || 0),
      totalWithdrawn: Number(u.totalWithdrawn || 0),
      totalEarned: Number(u.totalEarned || 0),
      referralCode: u.referralCode || 'ENEZA123',
      referredBy: u.referredBy,
      spinsRemaining: Number(u.spinsRemaining || 0),
      tasksCompletedToday: Number(u.tasksCompletedToday || 0),
      maxTasksPerDay: Number(u.maxTasksPerDay || 5),
      createdAt: u.createdAt || new Date().toISOString(),
      avatarUrl: u.avatarUrl,
      whatsappBalance: waBal,
      pendingCashbackTotal: Number(u.pendingCashbackTotal || 0),
      activeWhatsAppPackage: u.activeWhatsAppPackage,
      isAuthorizedPackagePurchased: Boolean(u.isAuthorizedPackagePurchased),
      isUnlockMpesaPurchased: Boolean(u.isUnlockMpesaPurchased),
      isAutomationPackagePurchased: Boolean(u.isAutomationPackagePurchased),
      isVerifiedAgentPurchased: Boolean(u.isVerifiedAgentPurchased),
      isUniversePackagePurchased: Boolean(u.isUniversePackagePurchased),
    };
  };

  // Main State
  const [users, setUsers] = useState<User[]>(() => {
    const raw = getStored('users', INITIAL_USERS);
    const parsed = Array.isArray(raw) ? raw.map(normalizeUser) : INITIAL_USERS.map(normalizeUser);
    // Guarantee all standard initial members exist even if an older localStorage cache was present
    const map = new Map<string, User>();
    INITIAL_USERS.forEach((u) => map.set(u.id, normalizeUser(u)));
    parsed.forEach((u) => {
      if (u && u.id) {
        const existing = map.get(u.id);
        map.set(u.id, existing ? { ...existing, ...u } : u);
      }
    });
    return Array.from(map.values());
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = getStored<any | null>('current_user', null);
    return saved ? normalizeUser(saved) : null;
  });
  const [currentView, setCurrentView] = useState<AppView>('userDashboardView');
  const [tasks, setTasks] = useState<EarningTask[]>(() => getStored('tasks', INITIAL_TASKS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const raw = getStored<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
    if (!Array.isArray(raw) || raw.length === 0) return INITIAL_TRANSACTIONS;
    // Remove outdated mock transactions from 21/22 Aug that do not belong to the user's real timeline
    const cleaned = raw.filter((tx) => {
      if (!tx || !tx.id) return false;
      const legacyMockIds = [
        'tx_101', 'tx_102', 'tx_103', 'tx_104', 'tx_105', 'tx_106', 'tx_107', 'tx_108',
        'tx_rec_1', 'tx_rec_2', 'tx_rec_3', 'tx_rec_4', 'tx_rec_5'
      ];
      if (legacyMockIds.includes(tx.id)) return false;
      if (
        tx.mpesaReceiptNo &&
        ['QK98XJ2841', 'QK98WF9182', 'QK98TG4430', 'QK98LQ7712', 'QK98AA1904', 'QK99PL4012', 'QK99WA2801', 'QK98PK9911', 'QK98CB8820', 'QK98IY1104'].includes(tx.mpesaReceiptNo)
      ) {
        return false;
      }
      return true;
    });
    return cleaned.length > 0 ? cleaned : INITIAL_TRANSACTIONS;
  });
  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const raw = getStored<Referral[]>('referrals', INITIAL_REFERRALS);
    if (!Array.isArray(raw)) return [];
    // Reset invited members to 0 (remove old mock referral records)
    return raw.filter((r) => r && r.id && !['ref_1', 'ref_2', 'ref_3', 'ref_4'].includes(r.id));
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStored('notifications', INITIAL_NOTIFICATIONS)
  );

  // WhatsApp & Extended Financial States
  const [cashbackItems, setCashbackItems] = useState<CashbackItem[]>(() =>
    getStored('cashback_items', INITIAL_CASHBACK_ITEMS)
  );
  const [whatsAppSubmissions, setWhatsAppSubmissions] = useState<WhatsAppSubmission[]>(() =>
    getStored('wa_submissions', [
      {
        id: 'sub_01',
        date: new Date().toISOString(),
        productName: TODAY_PRODUCT_AD.title,
        viewCount: 35,
        earnedAmount: 3500,
        screenshotUrl: 'whatsapp_proof_35views.png',
        status: 'approved'
      }
    ])
  );
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>(() =>
    getStored('active_investments', INITIAL_ACTIVE_INVESTMENTS)
  );
  const [payheroConfig, setPayheroConfig] = useState<PayHeroConfig>(() => {
    const stored = getStored('payhero_config', INITIAL_PAYHERO_CONFIG);
    return {
      ...INITIAL_PAYHERO_CONFIG,
      ...(stored || {}),
    };
  });

  // Dark / Light Mode State (Defaults to true matching Eneza Earnings dark design)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    getStored('dark_mode', true)
  );

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Currency State (KES / USD)
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');

  // Admin verification state for sandbox testing
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  // Modal States
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositDefaultAmount, setDepositDefaultAmount] = useState<number>(500);
  const [isActivationMode, setIsActivationMode] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [selectedTaskForExec, setSelectedTaskForExec] = useState<EarningTask | null>(null);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    setStored('users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      setStored('current_user', currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    setStored('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    setStored('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    setStored('referrals', referrals);
  }, [referrals]);

  useEffect(() => {
    setStored('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    setStored('cashback_items', cashbackItems);
  }, [cashbackItems]);

  useEffect(() => {
    setStored('wa_submissions', whatsAppSubmissions);
  }, [whatsAppSubmissions]);

  useEffect(() => {
    setStored('active_investments', activeInvestments);
  }, [activeInvestments]);

  useEffect(() => {
    setStored('payhero_config', payheroConfig);
  }, [payheroConfig]);

  useEffect(() => {
    setStored('dark_mode', isDarkMode);
  }, [isDarkMode]);

  // Initial startup sync & periodic sync with central cloud backend
  useEffect(() => {
    captureReferralCodeFromUrl();

    const doSync = async () => {
      try {
        const remote = await fetchRemoteUsers();
        if (remote && remote.length > 0) {
          setUsers((prev) => {
            const merged = mergeUserLists(prev, remote);
            return merged;
          });

          // If a user is currently logged in, ensure their balance and status stay up to date
          setCurrentUser((curr) => {
            if (!curr) return null;
            const fresh = remote.find(
              (r) =>
                r.id === curr.id ||
                (r.phone && curr.phone && r.phone.replace(/\D/g, '') === curr.phone.replace(/\D/g, ''))
            );
            if (fresh) {
              return {
                ...curr,
                ...fresh,
                balance: fresh.balance !== undefined ? fresh.balance : curr.balance,
                whatsappBalance:
                  fresh.whatsappBalance !== undefined
                    ? fresh.whatsappBalance
                    : (fresh.balance ?? curr.whatsappBalance),
                depositBalance:
                  fresh.depositBalance !== undefined ? fresh.depositBalance : curr.depositBalance,
                isActivated: fresh.isActivated ?? curr.isActivated,
                tier: fresh.tier || curr.tier,
              };
            }
            return curr;
          });
        }
      } catch (err) {
        console.warn('Startup user sync warning:', err);
      }
    };

    doSync();

    // Background poll every 10 seconds so admin dashboard and clients receive live updates
    const interval = setInterval(doSync, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Login
  const handleLogin = async (user: User) => {
    // 1. Ensure we pick the freshest version from memory
    const inState = users.find(
      (u) =>
        u.id === user.id ||
        (u.phone && user.phone && u.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, ''))
    );
    const normalized = normalizeUser(inState ? { ...user, ...inState } : user);

    setCurrentUser(normalized);
    setStored('current_user', normalized);

    if (normalized.role === 'admin') {
      setAdminUnlocked(true);
      setCurrentView('adminDashboardView');
    } else {
      setCurrentView('userDashboardView');
    }

    // 2. Fetch directly from central registry to guarantee latest balance immediately on login
    try {
      const remote = await fetchRemoteUsers();
      if (remote && remote.length > 0) {
        const remoteMatch = remote.find(
          (r) =>
            r.id === user.id ||
            (r.phone && user.phone && r.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, ''))
        );
        if (remoteMatch) {
          const fresh = normalizeUser({
            ...normalized,
            ...remoteMatch,
            balance: remoteMatch.balance !== undefined ? remoteMatch.balance : normalized.balance,
            whatsappBalance:
              remoteMatch.whatsappBalance !== undefined
                ? remoteMatch.whatsappBalance
                : (remoteMatch.balance ?? normalized.whatsappBalance),
            depositBalance:
              remoteMatch.depositBalance !== undefined
                ? remoteMatch.depositBalance
                : normalized.depositBalance,
          });
          setCurrentUser(fresh);
          setStored('current_user', fresh);
          setUsers((prev) => prev.map((u) => (u.id === fresh.id ? fresh : u)));
        }
      }
    } catch (err) {
      console.warn('Post-login sync check:', err);
    }
  };

  // Handle Register (with real-time central backend persistence & referral link attribution)
  const handleRegister = async (newUser: User) => {
    setUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== newUser.id);
      return [newUser, ...filtered];
    });

    // Check if user joined via a referral link (e.g. ENEZAPRO)
    if (newUser.referredBy) {
      const refCode = newUser.referredBy.trim().toUpperCase();
      const referrer = users.find(
        (u) =>
          (u.referralCode || '').toUpperCase() === refCode ||
          u.username.toUpperCase() === refCode
      );

      const newRef: Referral = {
        id: `ref_${Date.now()}`,
        referrerId: referrer ? referrer.id : `ref_code_${refCode}`,
        referredUserId: newUser.id,
        referredUserName: `${newUser.firstName} ${newUser.lastName}`,
        referredUserPhone: newUser.phone,
        date: new Date().toISOString(),
        status: 'Active',
        tierLevel: 1,
        commissionEarned: 150, // 150 KES referral lead bonus
      };

      setReferrals((prev) => [newRef, ...prev]);

      if (referrer) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === referrer.id
              ? {
                  ...u,
                  pendingBalance: (u.pendingBalance || 0) + 150,
                  totalEarned: (u.totalEarned || 0) + 150,
                }
              : u
          )
        );
      }
    }

    // Persist to central cloud database immediately
    try {
      const res = await registerRemoteUser(newUser);
      if (res.allUsers && res.allUsers.length > 0) {
        setUsers((prev) => mergeUserLists(prev, res.allUsers || []));
      }
    } catch (err) {
      console.warn('Central registration sync fallback:', err);
    }
  };

  // Manual trigger for Admin Dashboard member sync
  const handleSyncMembers = async (): Promise<number> => {
    try {
      const remote = await fetchRemoteUsers();
      if (remote && remote.length > 0) {
        const merged = mergeUserLists(users, remote);
        setUsers(merged);
        await syncAllUsersWithBackend(merged);
        return merged.length;
      }
      // If no remote yet, push current local users to backend
      const synced = await syncAllUsersWithBackend(users);
      setUsers(synced);
      return synced.length;
    } catch (err) {
      console.warn('Manual sync failed:', err);
      return users.length;
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setStored('current_user', null);
    setCurrentView('userDashboardView');
  };

  // Helper to generate Safaricom receipt
  const generateReceipt = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    let code = 'QK';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Helper trigger confetti
  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ffffff']
      });
    } catch {
      // ignore
    }
  };

  // ==========================================
  // WHATSAPP PACKAGE PURCHASE (STRICT DEPOSIT REQUIRED FIRST)
  // ==========================================
  const handlePurchaseWhatsAppPackage = (pkg: WhatsAppPackageItem) => {
    if (!currentUser) return;

    const userDepositBal = Math.max(currentUser.depositBalance ?? 0, currentUser.balance ?? 0);

    // Check if user has deposited enough funds first
    if (userDepositBal < pkg.price) {
      const shortfall = pkg.price - userDepositBal;
      setDepositDefaultAmount(shortfall > 0 ? shortfall : pkg.price);
      setIsActivationMode(false);
      setIsDepositOpen(true);

      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Deposit Required First',
        message: `All users must deposit first. Please deposit KES ${shortfall.toLocaleString()} to complete the purchase of ${pkg.name}.`,
        time: 'Just now',
        isRead: false,
        type: 'alert',
      };
      setNotifications((prev) => [notif, ...prev]);
      return;
    }

    // User has sufficient deposit balance - deduct and activate
    const receipt = generateReceipt();
    const newTx: Transaction = {
      id: `tx_wa_pkg_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'whatsapp_package',
      amount: pkg.price,
      fee: 0,
      netAmount: pkg.price,
      status: 'completed',
      description: `Purchased ${pkg.name} from Deposit Balance (+KES ${(pkg.cashbackBonus || 0).toLocaleString()} Cashback Credited)`,
      createdAt: new Date().toISOString(),
    };

    const newCashbackItem: CashbackItem = {
      id: `cb_${Date.now()}`,
      sourcePackageName: pkg.name,
      packagePrice: pkg.price,
      cashbackAmount: pkg.cashbackBonus,
      unlockFeeRequired: Math.round(pkg.cashbackBonus * 0.4), // 40% of Cashback bonus
      status: 'pending_unlock',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setCashbackItems((prev) => [newCashbackItem, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, (currentUser.depositBalance ?? userDepositBal) - pkg.price),
      balance: Math.max(0, (currentUser.balance ?? userDepositBal) - pkg.price),
      activeWhatsAppPackage: pkg.id,
      pendingCashbackTotal: (currentUser.pendingCashbackTotal || 0) + pkg.cashbackBonus,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `${pkg.name} Activated!`,
      message: `Receipt ${receipt}. KES ${pkg.price.toLocaleString()} deducted from your Deposit Balance. KES ${(pkg.cashbackBonus || 0).toLocaleString()} 200% Cashback Bonus has been credited to your Cashback Vault!`,
      time: 'Just now',
      isRead: false,
      type: 'money',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    fireConfetti();
    setCurrentView('cashbackBonusView');
  };

  // ==========================================
  // CASHBACK BONUS 40% FEE CLEARANCE & CLAIM
  // ==========================================
  const handleClaimCashback = (item: CashbackItem) => {
    if (!currentUser) return;
    const requiredDepositFee = item.unlockFeeRequired || Math.round(item.cashbackAmount * 0.4);
    const userDepositBal = Math.max(currentUser.depositBalance ?? 0, currentUser.balance ?? 0);

    if (userDepositBal < requiredDepositFee) {
      setIsActivationMode(false);
      setIsDepositOpen(true);
      return;
    }

    const receiptFee = generateReceipt();
    const receiptBonus = generateReceipt();

    // 1. Fee Transaction (40% payment deducted from deposit balance)
    const feeTx: Transaction = {
      id: `tx_cb_fee_${Date.now()}`,
      mpesaReceiptNo: receiptFee,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'cashback_fee',
      amount: requiredDepositFee,
      fee: 0,
      netAmount: requiredDepositFee,
      status: 'completed',
      description: `40% Deposit Clearance for ${item.sourcePackageName} Cashback`,
      createdAt: new Date().toISOString(),
    };

    // 2. Bonus Credit Transaction
    const bonusTx: Transaction = {
      id: `tx_cb_payout_${Date.now()}`,
      mpesaReceiptNo: receiptBonus,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'cashback_claim',
      amount: item.cashbackAmount,
      fee: 0,
      netAmount: item.cashbackAmount,
      status: 'completed',
      description: `Disbursed Cashback Bonus (${item.sourcePackageName})`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [bonusTx, feeTx, ...prev]);
    setCashbackItems((prev) =>
      prev.map((cb) =>
        cb.id === item.id ? { ...cb, status: 'unlocked', unlockedAt: new Date().toISOString() } : cb
      )
    );

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, userDepositBal - requiredDepositFee),
      balance: currentUser.balance + item.cashbackAmount,
      totalEarned: currentUser.totalEarned + item.cashbackAmount,
      pendingCashbackTotal: Math.max(0, currentUser.pendingCashbackTotal - item.cashbackAmount),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Cashback Bonus Claimed!',
      message: `KES ${(item.cashbackAmount || 0).toLocaleString()} credited to your balance via M-Pesa receipt ${receiptBonus} using KES ${(requiredDepositFee).toLocaleString()} from your deposit balance.`,
      time: 'Just now',
      isRead: false,
      type: 'money',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    fireConfetti();
  };

  const handleClaimAllCashback = () => {
    const pending = cashbackItems.filter((i) => i.status === 'pending_unlock');
    if (pending.length === 0 || !currentUser) return;

    const totalRequiredFee = pending.reduce(
      (acc, curr) => acc + (curr.unlockFeeRequired || Math.round(curr.cashbackAmount * 0.4)),
      0
    );
    const userDepositBal = Math.max(currentUser.depositBalance ?? 0, currentUser.balance ?? 0);

    if (userDepositBal < totalRequiredFee) {
      setIsActivationMode(false);
      setIsDepositOpen(true);
      return;
    }

    let totalBonus = 0;
    const newTxs: Transaction[] = [];

    pending.forEach((item) => {
      const itemFee = item.unlockFeeRequired || Math.round(item.cashbackAmount * 0.4);
      totalBonus += item.cashbackAmount;

      newTxs.push({
        id: `tx_cb_fee_${Date.now()}_${item.id}`,
        mpesaReceiptNo: generateReceipt(),
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userPhone: currentUser.phone,
        type: 'cashback_fee',
        amount: itemFee,
        fee: 0,
        netAmount: itemFee,
        status: 'completed',
        description: `40% Deposit Clearance: ${item.sourcePackageName}`,
        createdAt: new Date().toISOString(),
      });

      newTxs.push({
        id: `tx_cb_all_${Date.now()}_${item.id}`,
        mpesaReceiptNo: generateReceipt(),
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userPhone: currentUser.phone,
        type: 'cashback_claim',
        amount: item.cashbackAmount,
        fee: 0,
        netAmount: item.cashbackAmount,
        status: 'completed',
        description: `Disbursed Cashback: ${item.sourcePackageName}`,
        createdAt: new Date().toISOString(),
      });
    });

    setTransactions((prev) => [...newTxs, ...prev]);
    setCashbackItems((prev) =>
      prev.map((cb) => ({ ...cb, status: 'unlocked', unlockedAt: new Date().toISOString() }))
    );

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, userDepositBal - totalRequiredFee),
      balance: currentUser.balance + totalBonus,
      totalEarned: currentUser.totalEarned + totalBonus,
      pendingCashbackTotal: 0,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
  };

  // ==========================================
  // WHATSAPP STATUS VIEWS SUBMISSION (1 View = KES 100)
  // ==========================================
  const handleSubmitWhatsAppViews = (viewCount: number, screenshotName: string) => {
    if (!currentUser) return;

    const earned = viewCount * 100;
    const newSubmission: WhatsAppSubmission = {
      id: `sub_${Date.now()}`,
      date: new Date().toISOString(),
      productName: TODAY_PRODUCT_AD.title,
      viewCount: viewCount,
      earnedAmount: earned,
      screenshotUrl: screenshotName,
      status: 'approved',
    };

    const viewTx: Transaction = {
      id: `tx_views_${Date.now()}`,
      mpesaReceiptNo: generateReceipt(),
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'whatsapp_views_earning',
      amount: earned,
      fee: 0,
      netAmount: earned,
      status: 'completed',
      description: `WhatsApp Status Broadcast (${viewCount} Views @ KES 100/view)`,
      createdAt: new Date().toISOString(),
    };

    setWhatsAppSubmissions((prev) => [newSubmission, ...prev]);
    setTransactions((prev) => [viewTx, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      whatsappBalance: currentUser.whatsappBalance + earned,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
  };

  // ==========================================
  // DISBURSE WHATSAPP EARNINGS (After 4 Pipeline Steps)
  // ==========================================
  const handleDisburseWhatsAppEarnings = () => {
    if (!currentUser) return;
    const amountToDisburse = currentUser.whatsappBalance;
    if (amountToDisburse <= 0) return;

    const receipt = generateReceipt();
    const disburseTx: Transaction = {
      id: `tx_disburse_wa_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'withdrawal',
      amount: amountToDisburse,
      fee: 0,
      netAmount: amountToDisburse,
      status: 'completed',
      description: `Direct Pipeline B2C Disbursal of WhatsApp View Earnings to Main Balance`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [disburseTx, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + amountToDisburse,
      totalEarned: currentUser.totalEarned + amountToDisburse,
      whatsappBalance: 0,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'WhatsApp Earnings Disbursed!',
      message: `KES ${(amountToDisburse || 0).toLocaleString()} moved to your spendable M-Pesa balance via receipt ${receipt}.`,
      time: 'Just now',
      isRead: false,
      type: 'money',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    fireConfetti();
  };

  // ==========================================
  // 4 PIPELINE SEQUENTIAL PACKAGE ACTIVATIONS (STRICT DEPOSIT BALANCE FIRST)
  // ==========================================

  // Step 1: Authorize Package (5,000 -> Cashback 10,000)
  const handleActivateAuthorizePackage = () => {
    if (!currentUser) return;
    const pkg = PIPELINE_PACKAGES.authorize;
    const userDepositBal = Math.max(currentUser.depositBalance ?? 0, currentUser.balance ?? 0);

    if (userDepositBal < pkg.price) {
      const shortfall = pkg.price - userDepositBal;
      setDepositDefaultAmount(shortfall > 0 ? shortfall : pkg.price);
      setIsActivationMode(false);
      setIsDepositOpen(true);

      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Deposit Required First',
        message: `Please deposit KES ${shortfall.toLocaleString()} to your Deposit Balance to activate ${pkg.name}.`,
        time: 'Just now',
        isRead: false,
        type: 'alert',
      };
      setNotifications((prev) => [notif, ...prev]);
      return;
    }

    const receipt = generateReceipt();

    const authTx: Transaction = {
      id: `tx_auth_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'authorize_package',
      amount: pkg.price,
      fee: 0,
      netAmount: pkg.price,
      status: 'completed',
      description: `Activated ${pkg.name} from Deposit Balance (+ KES 10,000 Cashback)`,
      createdAt: new Date().toISOString(),
    };

    const newCashbackItem: CashbackItem = {
      id: `cb_auth_${Date.now()}`,
      sourcePackageName: pkg.name,
      packagePrice: pkg.price,
      cashbackAmount: pkg.cashbackBonus,
      unlockFeeRequired: Math.round(pkg.cashbackBonus * 0.4), // 40% of Cashback bonus
      status: 'pending_unlock',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [authTx, ...prev]);
    setCashbackItems((prev) => [newCashbackItem, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, userDepositBal - pkg.price),
      isAuthorizedPackagePurchased: true,
      pendingCashbackTotal: currentUser.pendingCashbackTotal + pkg.cashbackBonus,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
  };

  // Step 2: Unlock To MPESA (7,000 -> Cashback 14,000)
  const handleActivateUnlockMpesa = () => {
    if (!currentUser) return;
    const pkg = PIPELINE_PACKAGES.unlockMpesa;
    const userDepositBal = Math.max(currentUser.depositBalance ?? 0, currentUser.balance ?? 0);

    if (userDepositBal < pkg.price) {
      const shortfall = pkg.price - userDepositBal;
      setDepositDefaultAmount(shortfall > 0 ? shortfall : pkg.price);
      setIsActivationMode(false);
      setIsDepositOpen(true);

      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Deposit Required First',
        message: `Please deposit KES ${shortfall.toLocaleString()} to your Deposit Balance to activate ${pkg.name}.`,
        time: 'Just now',
        isRead: false,
        type: 'alert',
      };
      setNotifications((prev) => [notif, ...prev]);
      return;
    }

    const receipt = generateReceipt();

    const unlockTx: Transaction = {
      id: `tx_unlock_mpesa_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'unlock_mpesa',
      amount: pkg.price,
      fee: 0,
      netAmount: pkg.price,
      status: 'completed',
      description: `Activated ${pkg.name} from Deposit Balance (+ KES 14,000 Cashback)`,
      createdAt: new Date().toISOString(),
    };

    const newCashbackItem: CashbackItem = {
      id: `cb_unlock_${Date.now()}`,
      sourcePackageName: pkg.name,
      packagePrice: pkg.price,
      cashbackAmount: pkg.cashbackBonus,
      unlockFeeRequired: Math.round(pkg.cashbackBonus * 0.4), // 40% of Cashback bonus
      status: 'pending_unlock',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [unlockTx, ...prev]);
    setCashbackItems((prev) => [newCashbackItem, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, userDepositBal - pkg.price),
      isUnlockMpesaPurchased: true,
      pendingCashbackTotal: currentUser.pendingCashbackTotal + pkg.cashbackBonus,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
  };

  // Step 3: Automation Package (KES 2,500 -> Cashback 5,000)
  const handleActivateAutomationPackage = () => {
    if (!currentUser) return;
    const pkg = PIPELINE_PACKAGES.automation;
    const userDepositBal = Math.max(currentUser.depositBalance ?? 0, currentUser.balance ?? 0);

    if (userDepositBal < pkg.price) {
      const shortfall = pkg.price - userDepositBal;
      setDepositDefaultAmount(shortfall > 0 ? shortfall : pkg.price);
      setIsActivationMode(false);
      setIsDepositOpen(true);

      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Deposit Required First',
        message: `Please deposit KES ${shortfall.toLocaleString()} to your Deposit Balance to activate ${pkg.name}.`,
        time: 'Just now',
        isRead: false,
        type: 'alert',
      };
      setNotifications((prev) => [notif, ...prev]);
      return;
    }

    const receipt = generateReceipt();

    const autoTx: Transaction = {
      id: `tx_automation_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'automation_package',
      amount: pkg.price,
      fee: 0,
      netAmount: pkg.price,
      status: 'completed',
      description: `Activated ${pkg.name} from Deposit Balance (+ KES ${(pkg.cashbackBonus).toLocaleString()} Cashback)`,
      createdAt: new Date().toISOString(),
    };

    const newCashbackItem: CashbackItem = {
      id: `cb_auto_${Date.now()}`,
      sourcePackageName: pkg.name,
      packagePrice: pkg.price,
      cashbackAmount: pkg.cashbackBonus,
      unlockFeeRequired: Math.round(pkg.cashbackBonus * 0.4), // 40% of cashback = 2,000
      status: 'pending_unlock',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [autoTx, ...prev]);
    setCashbackItems((prev) => [newCashbackItem, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, userDepositBal - pkg.price),
      isAutomationPackagePurchased: true,
      pendingCashbackTotal: currentUser.pendingCashbackTotal + pkg.cashbackBonus,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
  };

  // Step 4: Verified Agent (KES 5,000 -> Cashback 10,000)
  const handleActivateVerifiedAgent = () => {
    if (!currentUser) return;
    const pkg = PIPELINE_PACKAGES.verifiedAgent;
    const userDepositBal = Math.max(currentUser.depositBalance ?? 0, currentUser.balance ?? 0);

    if (userDepositBal < pkg.price) {
      const shortfall = pkg.price - userDepositBal;
      setDepositDefaultAmount(shortfall > 0 ? shortfall : pkg.price);
      setIsActivationMode(false);
      setIsDepositOpen(true);

      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Deposit Required First',
        message: `Please deposit KES ${shortfall.toLocaleString()} to your Deposit Balance to activate ${pkg.name}.`,
        time: 'Just now',
        isRead: false,
        type: 'alert',
      };
      setNotifications((prev) => [notif, ...prev]);
      return;
    }

    const receipt = generateReceipt();

    const agentTx: Transaction = {
      id: `tx_agent_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'verified_agent',
      amount: pkg.price,
      fee: 0,
      netAmount: pkg.price,
      status: 'completed',
      description: `Activated ${pkg.name} from Deposit Balance (+ KES ${(pkg.cashbackBonus).toLocaleString()} Cashback)`,
      createdAt: new Date().toISOString(),
    };

    const newCashbackItem: CashbackItem = {
      id: `cb_agent_${Date.now()}`,
      sourcePackageName: pkg.name,
      packagePrice: pkg.price,
      cashbackAmount: pkg.cashbackBonus,
      unlockFeeRequired: Math.round(pkg.cashbackBonus * 0.4), // 40% of cashback = 4,000
      status: 'pending_unlock',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [agentTx, ...prev]);
    setCashbackItems((prev) => [newCashbackItem, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, userDepositBal - pkg.price),
      role: 'verified_agent',
      isVerifiedAgentPurchased: true,
      pendingCashbackTotal: currentUser.pendingCashbackTotal + pkg.cashbackBonus,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
  };

  // Step 5: Universe Package (KES 7,000 -> Cashback 14,000)
  const handleActivateUniversePackage = () => {
    if (!currentUser) return;
    const pkg = PIPELINE_PACKAGES.universe;
    const userDepositBal = Math.max(currentUser.depositBalance ?? 0, currentUser.balance ?? 0);

    if (userDepositBal < pkg.price) {
      const shortfall = pkg.price - userDepositBal;
      setDepositDefaultAmount(shortfall > 0 ? shortfall : pkg.price);
      setIsActivationMode(false);
      setIsDepositOpen(true);

      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Deposit Required First',
        message: `Please deposit KES ${shortfall.toLocaleString()} to your Deposit Balance to activate ${pkg.name}.`,
        time: 'Just now',
        isRead: false,
        type: 'alert',
        };
      setNotifications((prev) => [notif, ...prev]);
      return;
    }

    const receipt = generateReceipt();

    const universeTx: Transaction = {
      id: `tx_universe_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'universe_package',
      amount: pkg.price,
      fee: 0,
      netAmount: pkg.price,
      status: 'completed',
      description: `Activated ${pkg.name} from Deposit Balance (+ KES ${(pkg.cashbackBonus).toLocaleString()} Cashback)`,
      createdAt: new Date().toISOString(),
    };

    const newCashbackItem: CashbackItem = {
      id: `cb_universe_${Date.now()}`,
      sourcePackageName: pkg.name,
      packagePrice: pkg.price,
      cashbackAmount: pkg.cashbackBonus,
      unlockFeeRequired: Math.round(pkg.cashbackBonus * 0.4), // 40% of cashback = 5,600
      status: 'pending_unlock',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [universeTx, ...prev]);
    setCashbackItems((prev) => [newCashbackItem, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, userDepositBal - pkg.price),
      isUniversePackagePurchased: true,
      pendingCashbackTotal: currentUser.pendingCashbackTotal + pkg.cashbackBonus,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
  };

  // ==========================================
  // INVESTMENT PLANS (Starting 1,500, up to 300% monthly)
  // ==========================================
  const handleInvestInPlan = (plan: InvestmentPlan, customAmount?: number) => {
    if (!currentUser) return;
    const amount = customAmount || plan.minDeposit;
    const userDepositBal = currentUser.depositBalance || 0;

    if (userDepositBal < amount) {
      const shortfall = amount - userDepositBal;
      setDepositDefaultAmount(shortfall > 0 ? shortfall : amount);
      setIsActivationMode(false);
      setIsDepositOpen(true);

      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Deposit Required First',
        message: `Please deposit KES ${shortfall.toLocaleString()} to your Deposit Balance to subscribe to ${plan.name}.`,
        time: 'Just now',
        isRead: false,
        type: 'alert',
      };
      setNotifications((prev) => [notif, ...prev]);
      return;
    }

    const receipt = generateReceipt();

    const invTx: Transaction = {
      id: `tx_inv_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'investment_deposit',
      amount: amount,
      fee: 0,
      netAmount: amount,
      status: 'completed',
      description: `Subscribed to ${plan.name} from Deposit Balance (300% Monthly Yield Contract)`,
      createdAt: new Date().toISOString(),
    };

    const expectedTotal = amount * 4; // 100% Principal + 300% Return = 400% total payout

    const newInvestment: ActiveInvestment = {
      id: `act_inv_${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      amountInvested: amount,
      expectedTotalPayout: expectedTotal,
      currentEarned: Math.round(amount * 0.1), // instant day 1 yield
      progressPercent: 4,
      startDate: new Date().toISOString(),
      maturityDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'active',
    };

    setTransactions((prev) => [invTx, ...prev]);
    setActiveInvestments((prev) => [newInvestment, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      depositBalance: Math.max(0, userDepositBal - amount),
      totalDeposited: (currentUser.totalDeposited || 0) + amount,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Investment Plan Active!',
      message: `KES ${(amount || 0).toLocaleString()} deployed in ${plan.name}. Expected ROI: KES ${(expectedTotal || 0).toLocaleString()} (300% Profit).`,
      time: 'Just now',
      isRead: false,
      type: 'money',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    fireConfetti();
  };

  const handleHarvestYield = (investmentId: string) => {
    const target = activeInvestments.find((i) => i.id === investmentId);
    if (!target || !currentUser || target.currentEarned <= 0) return;

    const receipt = generateReceipt();
    const yieldAmount = target.currentEarned;

    const yieldTx: Transaction = {
      id: `tx_yield_${Date.now()}`,
      mpesaReceiptNo: receipt,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'investment_yield',
      amount: yieldAmount,
      fee: 0,
      netAmount: yieldAmount,
      status: 'completed',
      description: `Harvested Yield from ${target.planName}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [yieldTx, ...prev]);
    setActiveInvestments((prev) =>
      prev.map((inv) =>
        inv.id === investmentId ? { ...inv, currentEarned: 0 } : inv
      )
    );

    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + yieldAmount,
      totalEarned: currentUser.totalEarned + yieldAmount,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
  };

  // Handle Deposit / Activation Success
  const handleDepositSuccess = (amount: number, newTx: Transaction) => {
    if (!currentUser) return;

    if (newTx.type === 'activation_fee') {
      const updatedUser: User = {
        ...currentUser,
        isActivated: true,
        tier: 'Standard',
        spinsRemaining: currentUser.spinsRemaining + 2,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    } else {
      const updatedUser: User = {
        ...currentUser,
        depositBalance: (currentUser.depositBalance || 0) + amount,
        balance: currentUser.balance + amount,
        totalEarned: currentUser.totalEarned + amount,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    }

    setTransactions((prev) => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: newTx.type === 'activation_fee' ? 'Account Activated!' : 'M-Pesa Deposit Received',
      message: `KES ${(amount || 0).toLocaleString()} processed via ${newTx.mpesaReceiptNo}.`,
      time: 'Just now',
      isRead: false,
      type: 'money',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handle Withdrawal Request Success
  const handleWithdrawalSuccess = (amount: number, fee: number, newTx: Transaction) => {
    if (!currentUser) return;

    const isInstant = newTx.status === 'completed';
    const totalDeducted = amount + fee;

    const updatedUser: User = {
      ...currentUser,
      balance: Math.max(0, currentUser.balance - totalDeducted),
      totalWithdrawn: currentUser.totalWithdrawn + (isInstant ? amount : 0),
      pendingBalance: currentUser.pendingBalance + (isInstant ? 0 : amount),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setTransactions((prev) => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: isInstant ? 'M-Pesa Cashout Sent!' : 'Withdrawal Request Queued',
      message: isInstant
        ? `KES ${(amount || 0).toLocaleString()} dispatched to ${newTx.userPhone} via M-Pesa (${newTx.mpesaReceiptNo}).`
        : `KES ${(amount || 0).toLocaleString()} submitted for admin B2C batch release.`,
      time: 'Just now',
      isRead: false,
      type: 'money',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handle Task Completion
  const handleTaskCompletion = (taskId: string, reward: number) => {
    if (!currentUser) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t))
    );

    const multiplier =
      currentUser.tier === 'Platinum'
        ? 2.2
        : currentUser.tier === 'Gold'
        ? 1.6
        : currentUser.tier === 'Silver'
        ? 1.25
        : 1.0;

    const finalReward = Math.round(reward * multiplier);
    const receiptCode = generateReceipt();

    const taskTx: Transaction = {
      id: `tx_task_${Date.now()}`,
      mpesaReceiptNo: receiptCode,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'task_reward',
      amount: finalReward,
      fee: 0,
      netAmount: finalReward,
      status: 'completed',
      description: `Daily Micro-Task Completion Reward (${multiplier}x Tier Rate)`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [taskTx, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + finalReward,
      totalEarned: currentUser.totalEarned + finalReward,
      tasksCompletedToday: currentUser.tasksCompletedToday + 1,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    setSelectedTaskForExec(null);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Task Reward Credited!',
      message: `+KES ${finalReward} added to balance for task completion.`,
      time: 'Just now',
      isRead: false,
      type: 'task',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handle Spin Win
  const handleSpinWin = (rewardAmount: number, winTx?: Transaction) => {
    if (!currentUser) return;

    if (rewardAmount > 0 && winTx) {
      setTransactions((prev) => [winTx, ...prev]);
    }

    const updatedUser: User = {
      ...currentUser,
      spinsRemaining: Math.max(0, currentUser.spinsRemaining - 1),
      balance: currentUser.balance + rewardAmount,
      totalEarned: currentUser.totalEarned + rewardAmount,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    if (rewardAmount > 0) {
      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Lucky Spin Cash Win!',
        message: `+KES ${rewardAmount} won on the Eneza Spin Wheel!`,
        time: 'Just now',
        isRead: false,
        type: 'money',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Handle Tier Upgrade
  const handleTierUpgrade = (pkg: VipPackage) => {
    if (!currentUser) return;

    if (pkg.price > currentUser.balance) {
      setIsActivationMode(false);
      setIsDepositOpen(true);
      return;
    }

    const receiptCode = generateReceipt();

    const upgradeTx: Transaction = {
      id: `tx_upg_${Date.now()}`,
      mpesaReceiptNo: receiptCode,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userPhone: currentUser.phone,
      type: 'tier_upgrade',
      amount: pkg.price,
      fee: 0,
      netAmount: pkg.price,
      status: 'completed',
      description: `VIP Tier Upgrade to ${pkg.name}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [upgradeTx, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      tier: pkg.name,
      balance: currentUser.balance - pkg.price,
      spinsRemaining: currentUser.spinsRemaining + pkg.tasksLimit,
      maxTasksPerDay: pkg.tasksLimit,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    fireConfetti();
    alert(`🎉 Congratulations! You have successfully upgraded to the ${pkg.name} Tier!`);
  };

  // Admin Actions
  const handleAdminApproveWithdrawal = (txId: string) => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'completed', approvedBy: 'Root Admin' } : t))
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetTx.userId) {
          return {
            ...u,
            pendingBalance: Math.max(0, u.pendingBalance - targetTx.amount),
            totalWithdrawn: u.totalWithdrawn + targetTx.amount,
          };
        }
        return u;
      })
    );

    if (currentUser && currentUser.id === targetTx.userId) {
      setCurrentUser({
        ...currentUser,
        pendingBalance: Math.max(0, currentUser.pendingBalance - targetTx.amount),
        totalWithdrawn: currentUser.totalWithdrawn + targetTx.amount,
      });
    }

    alert(`Disbursal approved for ${targetTx.userName} (KES ${(targetTx.amount || 0).toLocaleString()}) via M-Pesa B2C.`);
  };

  const handleAdminRejectWithdrawal = (txId: string, reason: string) => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', notes: reason } : t))
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetTx.userId) {
          return {
            ...u,
            pendingBalance: Math.max(0, u.pendingBalance - targetTx.amount),
            balance: u.balance + targetTx.amount + targetTx.fee,
          };
        }
        return u;
      })
    );

    if (currentUser && currentUser.id === targetTx.userId) {
      setCurrentUser({
        ...currentUser,
        pendingBalance: Math.max(0, currentUser.pendingBalance - targetTx.amount),
        balance: currentUser.balance + targetTx.amount + targetTx.fee,
      });
    }

    alert(`Withdrawal rejected. Funds have been refunded to the member balance.`);
  };

  const handleAdminUpdateUserBalance = async (userId: string, deltaAmount: number) => {
    let updatedUserTarget: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newBal = Math.max(0, (u.balance || 0) + deltaAmount);
          const newWaBal = Math.max(0, (u.whatsappBalance || u.balance || 0) + deltaAmount);
          const updated = {
            ...u,
            balance: newBal,
            whatsappBalance: newWaBal,
            totalEarned: deltaAmount > 0 ? (u.totalEarned || 0) + deltaAmount : (u.totalEarned || 0),
          };
          updatedUserTarget = updated;
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
            setStored('current_user', updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (updatedUserTarget) {
      try {
        await updateRemoteUser(updatedUserTarget);
      } catch (err) {
        console.warn('Central registry balance sync fallback:', err);
      }
    }

    alert(`Adjusted user balance by KES ${deltaAmount > 0 ? '+' : ''}${deltaAmount}`);
  };

  const handleAdminAdjustBalances = async (
    userId: string,
    adjustments: {
      balanceDelta?: number;
      whatsappDelta?: number;
      depositDelta?: number;
      setDirect?: boolean;
      newBalance?: number;
      newWhatsappBalance?: number;
      newDepositBalance?: number;
    }
  ) => {
    let updatedUserTarget: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          let newBal = u.balance || 0;
          let newWaBal = u.whatsappBalance !== undefined ? u.whatsappBalance : (u.balance || 0);
          let newDepBal = u.depositBalance || 0;

          if (adjustments.setDirect) {
            if (adjustments.newBalance !== undefined) newBal = Math.max(0, adjustments.newBalance);
            if (adjustments.newWhatsappBalance !== undefined) newWaBal = Math.max(0, adjustments.newWhatsappBalance);
            if (adjustments.newDepositBalance !== undefined) newDepBal = Math.max(0, adjustments.newDepositBalance);
          } else {
            if (adjustments.balanceDelta !== undefined) newBal = Math.max(0, newBal + adjustments.balanceDelta);
            if (adjustments.whatsappDelta !== undefined) newWaBal = Math.max(0, newWaBal + adjustments.whatsappDelta);
            if (adjustments.depositDelta !== undefined) newDepBal = Math.max(0, newDepBal + adjustments.depositDelta);
          }

          const earnedBonus = (adjustments.balanceDelta && adjustments.balanceDelta > 0 ? adjustments.balanceDelta : 0) +
            (adjustments.whatsappDelta && adjustments.whatsappDelta > 0 ? adjustments.whatsappDelta : 0);

          const updated: User = {
            ...u,
            balance: newBal,
            whatsappBalance: newWaBal,
            depositBalance: newDepBal,
            totalEarned: earnedBonus > 0 ? (u.totalEarned || 0) + earnedBonus : (u.totalEarned || 0),
          };
          updatedUserTarget = updated;
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
            setStored('current_user', updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (updatedUserTarget) {
      try {
        await updateRemoteUser(updatedUserTarget);
      } catch (err) {
        console.warn('Central registry balance sync fallback:', err);
      }
    }
  };

  const handleAdminUpdateUserDetails = async (userId: string, updatedFields: Partial<User>) => {
    let updatedUserTarget: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = normalizeUser({
            ...u,
            ...updatedFields,
            id: u.id,
          });
          updatedUserTarget = updated;
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
            setStored('current_user', updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (updatedUserTarget) {
      try {
        await updateRemoteUser(updatedUserTarget);
      } catch (err) {
        console.warn('Central registry user update error:', err);
      }
    }
  };

  const handleAdminDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
      alert('You cannot delete the currently active admin account.');
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    try {
      await deleteRemoteUser(userId);
    } catch (err) {
      console.warn('Central registry user delete error:', err);
    }
  };

  const handleAdminUpdateUserTier = async (userId: string, newTier: TierLevel) => {
    let updatedUserTarget: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, tier: newTier };
          updatedUserTarget = updated;
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
            setStored('current_user', updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (updatedUserTarget) {
      try {
        await updateRemoteUser(updatedUserTarget);
      } catch (err) {
        console.warn('Central registry tier sync fallback:', err);
      }
    }
  };

  const handleAdminCreateTask = (newTask: EarningTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleAdminBroadcast = (title: string, message: string) => {
    const newNotif: NotificationItem = {
      id: `notif_bcast_${Date.now()}`,
      title: title,
      message: message,
      time: 'Just now',
      isRead: false,
      type: 'alert',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // If no user is logged in, show Auth Module
  if (!currentUser) {
    return (
      <AuthModule
        onLogin={handleLogin}
        registeredUsers={users}
        onRegister={handleRegister}
      />
    );
  }

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;
  const pendingCashbackCount = cashbackItems.filter((i) => i.status === 'pending_unlock').length;

  return (
    <div
      className={`h-full min-h-screen ${
        isDarkMode
          ? 'bg-[#070e1b] text-zinc-100'
          : 'bg-gradient-to-br from-[#fdebee] via-[#eaf4f7] to-[#e4eef6] text-slate-900'
      } selection:bg-rose-500/20 selection:text-rose-500 font-sans flex transition-colors duration-200`}
    >
      {/* 1. SIDEBAR MENU NAVIGATION */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        pendingTasksCount={pendingTasksCount}
        pendingCashbackCount={pendingCashbackCount}
        adminVerificationUnlocked={adminUnlocked}
        onToggleAdminVerification={() => {
          setAdminUnlocked(true);
          alert('Admin node verified and unlocked in your navigation sidebar!');
        }}
        onOpenDeposit={() => {
          setIsActivationMode(false);
          setIsDepositOpen(true);
        }}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        isDarkMode={isDarkMode}
      />

      {/* 2. MAIN APPLICATION CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col md:pl-72 min-h-screen overflow-x-hidden">
        {/* Sticky Top Header */}
        <TopHeader
          currentUser={currentUser}
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenDeposit={() => {
            setIsActivationMode(false);
            setIsDepositOpen(true);
          }}
          onOpenWithdraw={() => setIsWithdrawOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadNotifsCount}
          onSwitchView={(v) => setCurrentView(v)}
          currency={currency}
          onToggleCurrency={() => setCurrency((prev) => (prev === 'KES' ? 'USD' : 'KES'))}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        />

        {/* View Dynamic Router Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {/* Main Dashboard */}
          {currentView === 'userDashboardView' && (
            <UserDashboard
              user={currentUser}
              tasks={tasks}
              transactions={transactions}
              onSwitchView={(v) => setCurrentView(v)}
              onOpenDeposit={() => {
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onOpenWithdraw={() => setIsWithdrawOpen(true)}
              onSelectTask={(t) => setSelectedTaskForExec(t)}
              onActivateAccount={() => {
                setIsActivationMode(true);
                setIsDepositOpen(true);
              }}
              isDarkMode={isDarkMode}
            />
          )}

          {/* WhatsApp Packages */}
          {currentView === 'whatsappPackagesView' && (
            <WhatsAppPackagesView
              currentUser={currentUser}
              onPurchasePackage={handlePurchaseWhatsAppPackage}
              onSelectPackage={handlePurchaseWhatsAppPackage}
              onOpenDeposit={(amt) => {
                setDepositDefaultAmount(amt || 500);
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* Cashback Bonus Tab */}
          {currentView === 'cashbackBonusView' && (
            <CashbackBonusView
              currentUser={currentUser}
              cashbackItems={cashbackItems}
              onClaimCashback={handleClaimCashback}
              onClaimAllCashback={handleClaimAllCashback}
              onOpenDeposit={() => {
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* WhatsApp Status Earnings (1 View = KES 100) */}
          {currentView === 'whatsappEarningsView' && (
            <WhatsAppEarningsView
              currentUser={currentUser}
              submissions={whatsAppSubmissions}
              onSubmitViews={handleSubmitWhatsAppViews}
              onDisburseEarnings={handleDisburseWhatsAppEarnings}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* Sequential Pipeline Step 1: Authorize Package */}
          {currentView === 'authorizePackageView' && (
            <AuthorizePackageView
              currentUser={currentUser}
              onActivateAuthorize={handleActivateAuthorizePackage}
              onOpenDeposit={(amt) => {
                if (amt) setDepositDefaultAmount(amt);
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* Sequential Pipeline Step 2: Unlock To MPESA */}
          {currentView === 'unlockMpesaView' && (
            <UnlockMpesaView
              currentUser={currentUser}
              onActivateUnlockMpesa={handleActivateUnlockMpesa}
              onOpenDeposit={(amt) => {
                if (amt) setDepositDefaultAmount(amt);
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* Sequential Pipeline Step 3: Automation Package */}
          {currentView === 'automationPackageView' && (
            <AutomationPackageView
              currentUser={currentUser}
              onActivateAutomation={handleActivateAutomationPackage}
              onOpenDeposit={(amt) => {
                if (amt) setDepositDefaultAmount(amt);
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* Sequential Pipeline Step 4: Verified Agent */}
          {currentView === 'verifiedAgentView' && (
            <VerifiedAgentView
              currentUser={currentUser}
              onActivateVerifiedAgent={handleActivateVerifiedAgent}
              onOpenDeposit={(amt) => {
                if (amt) setDepositDefaultAmount(amt);
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* Sequential Pipeline Step 5: Universe Package */}
          {currentView === 'universePackageView' && (
            <UniversePackageView
              currentUser={currentUser}
              onActivateUniverse={handleActivateUniversePackage}
              onOpenDeposit={(amt) => {
                if (amt) setDepositDefaultAmount(amt);
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* Investment Plans (Up to 300% Monthly) */}
          {currentView === 'investmentPlansView' && (
            <InvestmentPlansView
              currentUser={currentUser}
              activeInvestments={activeInvestments}
              onInvest={handleInvestInPlan}
              onHarvestYield={handleHarvestYield}
              onOpenDeposit={(amt) => {
                if (amt) setDepositDefaultAmount(amt);
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}

          {/* Daily Tasks */}
          {currentView === 'tasksView' && (
            <TasksView
              tasks={tasks}
              user={currentUser}
              onSelectTask={(t) => setSelectedTaskForExec(t)}
            />
          )}

          {/* Lucky Spin Wheel */}
          {currentView === 'spinWheelView' && (
            <SpinWheelView
              user={currentUser}
              onSpinWin={handleSpinWin}
              onBuySpins={() => {
                setCurrentView('whatsappPackagesView');
              }}
            />
          )}

          {/* Referral Network */}
          {currentView === 'referralsView' && (
            <ReferralsView user={currentUser} referrals={referrals} />
          )}

          {/* Cashier View */}
          {currentView === 'cashierView' && (
            <CashierView
              user={currentUser}
              transactions={transactions}
              onOpenDeposit={() => {
                setIsActivationMode(false);
                setIsDepositOpen(true);
              }}
              onOpenWithdraw={() => setIsWithdrawOpen(true)}
              onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            />
          )}

          {/* Transaction Ledger */}
          {currentView === 'ledgerView' && (
            <LedgerView
              transactions={transactions}
              onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            />
          )}

          {/* Admin Dashboard */}
          {currentView === 'adminDashboardView' && (
            <AdminDashboard
              users={users}
              transactions={transactions}
              tasks={tasks}
              onApproveWithdrawal={handleAdminApproveWithdrawal}
              onRejectWithdrawal={handleAdminRejectWithdrawal}
              onUpdateUserBalance={handleAdminUpdateUserBalance}
              onAdjustUserBalances={handleAdminAdjustBalances}
              onUpdateUserDetails={handleAdminUpdateUserDetails}
              onDeleteUser={handleAdminDeleteUser}
              onUpdateUserTier={handleAdminUpdateUserTier}
              onCreateTask={handleAdminCreateTask}
              onSendBroadcastNotification={handleAdminBroadcast}
              payheroConfig={payheroConfig}
              onUpdatePayheroConfig={(newCfg) => {
                setPayheroConfig(newCfg);
                alert('PayHero & Payment Gateway configuration updated and synced!');
              }}
              onSyncMembers={handleSyncMembers}
            />
          )}
        </main>
      </div>

      {/* ========================================== */}
      {/* GLOBAL APPLICATION MODALS                  */}
      {/* ========================================== */}

      {/* M-Pesa Deposit / STK Push Modal */}
      {isDepositOpen && (
        <MpesaDepositModal
          user={currentUser}
          defaultAmount={depositDefaultAmount}
          isActivation={isActivationMode}
          payheroConfig={payheroConfig}
          onClose={() => {
            setIsDepositOpen(false);
            setIsActivationMode(false);
          }}
          onSuccess={(amt, newTx) => {
            handleDepositSuccess(amt, newTx);
            setIsDepositOpen(false);
            setIsActivationMode(false);
          }}
        />
      )}

      {/* Withdrawal Cashout Modal */}
      {isWithdrawOpen && (
        <WithdrawalModal
          user={currentUser}
          onClose={() => setIsWithdrawOpen(false)}
          onSuccess={(amt, fee, newTx) => {
            handleWithdrawalSuccess(amt, fee, newTx);
          }}
          onNavigateToPackage={(view) => setCurrentView(view)}
        />
      )}

      {/* Interactive Task Execution Modal */}
      {selectedTaskForExec && (
        <TaskExecutionModal
          task={selectedTaskForExec}
          user={currentUser}
          onClose={() => setSelectedTaskForExec(null)}
          onComplete={(taskId, reward) => handleTaskCompletion(taskId, reward)}
        />
      )}

      {/* Official M-Pesa Receipt Modal */}
      {selectedReceiptTx && (
        <ReceiptModal
          transaction={selectedReceiptTx}
          onClose={() => setSelectedReceiptTx(null)}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }}
        onClearNotifications={() => {
          setNotifications([]);
        }}
      />
    </div>
  );
}

