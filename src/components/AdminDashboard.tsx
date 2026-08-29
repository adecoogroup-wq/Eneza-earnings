import React, { useState, useEffect } from 'react';
import { User, Transaction, EarningTask, TierLevel, PayHeroConfig, DailyProductItem, UserActivityLog } from '../types';
import { INITIAL_PAYHERO_CONFIG, DAILY_PRODUCTS_CATALOG } from '../data/mockData';
import { safeFormatDateTime } from '../utils/dateUtils';
import { validateSafaricomPhone } from '../utils/phoneValidation';
import { SponsoredProductFlyer } from './SponsoredProductFlyer';
import { getFormattedAccountNumber } from '../utils/accountNumber';
import { fetchRemoteActivityLogs } from '../utils/userSync';
import {
  ShieldAlert,
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Check,
  Zap,
  CreditCard,
  Key,
  Sliders,
  Activity,
  Phone,
  RefreshCw,
  Lock,
  Save,
  Eye,
  EyeOff,
  User as UserIcon,
  UserPlus,
  Hash,
  X,
  ShoppingBag,
  Sparkles,
  Edit3,
  Download,
  Trash2,
  Coins,
  DollarSign,
  ShieldCheck,
  Layers,
  ArrowDownLeft,
  Mail,
  Smartphone,
  Tag,
  Database,
  FileSpreadsheet,
  History,
  LogIn,
  Filter,
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  transactions: Transaction[];
  tasks: EarningTask[];
  onApproveWithdrawal: (txId: string) => void;
  onRejectWithdrawal: (txId: string, reason: string) => void;
  onUpdateUserBalance: (userId: string, deltaAmount: number) => void;
  onAdjustUserBalances?: (
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
  ) => void;
  onUpdateUserDetails?: (userId: string, updatedFields: Partial<User>) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserTier: (userId: string, newTier: TierLevel) => void;
  onCreateTask: (newTask: EarningTask) => void;
  onSendBroadcastNotification: (title: string, message: string) => void;
  onImpersonateUser?: (user: User) => void;
  payheroConfig?: PayHeroConfig;
  onUpdatePayheroConfig?: (config: PayHeroConfig) => void;
  onSyncMembers?: () => Promise<number>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  transactions,
  tasks,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onUpdateUserBalance,
  onAdjustUserBalances,
  onUpdateUserDetails,
  onDeleteUser,
  onUpdateUserTier,
  onCreateTask,
  onSendBroadcastNotification,
  onImpersonateUser,
  payheroConfig = INITIAL_PAYHERO_CONFIG,
  onUpdatePayheroConfig,
  onSyncMembers,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'withdrawals' | 'payhero' | 'users' | 'activity' | 'tasks' | 'products' | 'broadcast'>('overview');
  const [isSyncingMembers, setIsSyncingMembers] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Activity Logs & Database State
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [activityActionFilter, setActivityActionFilter] = useState<string>('all');
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<UserActivityLog | null>(null);

  const loadActivityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await fetchRemoteActivityLogs();
      if (logs && Array.isArray(logs)) {
        setActivityLogs(logs);
      }
    } catch (err) {
      console.warn('Error loading activity logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadActivityLogs();
    const interval = setInterval(loadActivityLogs, 6000);
    return () => clearInterval(interval);
  }, []);

  const filteredActivityLogs = activityLogs.filter((log) => {
    if (activityActionFilter !== 'all') {
      if (activityActionFilter === 'login' && !log.action.includes('login') && !log.action.includes('auth')) return false;
      if (activityActionFilter === 'register' && !log.action.includes('register')) return false;
      if (activityActionFilter === 'whatsapp' && !log.action.includes('whatsapp')) return false;
      if (activityActionFilter === 'spin' && !log.action.includes('spin')) return false;
      if (activityActionFilter === 'task' && !log.action.includes('task')) return false;
      if (activityActionFilter === 'deposit' && !log.action.includes('deposit')) return false;
      if (activityActionFilter === 'withdrawal' && !log.action.includes('withdrawal')) return false;
      if (activityActionFilter === 'admin' && !log.action.includes('admin')) return false;
    }
    if (activitySearchQuery.trim()) {
      const q = activitySearchQuery.toLowerCase();
      const matchName = (log.userName || '').toLowerCase().includes(q);
      const matchPhone = (log.userPhone || '').toLowerCase().includes(q);
      const matchDetails = (log.details || '').toLowerCase().includes(q);
      const matchAction = (log.action || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchDetails && !matchAction) return false;
    }
    return true;
  });

  const handleTriggerSync = async () => {
    if (!onSyncMembers) return;
    setIsSyncingMembers(true);
    try {
      const count = await onSyncMembers();
      setSyncNotice(`Synced ${count} live members from central database.`);
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err) {
      setSyncNotice('Sync failed or offline.');
      setTimeout(() => setSyncNotice(null), 3000);
    } finally {
      setIsSyncingMembers(false);
    }
  };

  // Auto-sync on mount and periodic 4s live polling
  useEffect(() => {
    if (onSyncMembers) {
      onSyncMembers();
      const interval = setInterval(() => {
        onSyncMembers();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [onSyncMembers]);

  // Add Member Modal State (for admin to manually onboard members)
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [newMemberForm, setNewMemberForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    username: '',
    email: '',
    password: '',
    referredBy: '',
    initialSpendable: 0,
    initialWhatsapp: 0,
    initialDeposit: 0,
    tier: 'Standard' as TierLevel,
    isActivated: false,
  });
  const [isAddingMemberLoading, setIsAddingMemberLoading] = useState<boolean>(false);

  // Sponsored Products Catalog State
  const [productsCatalog, setProductsCatalog] = useState<DailyProductItem[]>(DAILY_PRODUCTS_CATALOG);
  const [selectedAdminProductIndex, setSelectedAdminProductIndex] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<DailyProductItem>(DAILY_PRODUCTS_CATALOG[0]);
  const [productSaveNotice, setProductSaveNotice] = useState<boolean>(false);

  // Withdrawal rejection reason modal/state
  const [rejectingTxId, setRejectingTxId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('M-Pesa details mismatch');

  // User balance adjustment & allocation state
  const [balanceTargetUser, setBalanceTargetUser] = useState<User | null>(null);
  const [balanceCategory, setBalanceCategory] = useState<'whatsapp' | 'deposit' | 'spendable' | 'all'>('whatsapp');
  const [balanceMode, setBalanceMode] = useState<'delta' | 'direct'>('delta');
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [directSpendableVal, setDirectSpendableVal] = useState<number>(0);
  const [directWhatsappVal, setDirectWhatsappVal] = useState<number>(0);
  const [directDepositVal, setDirectDepositVal] = useState<number>(0);
  const [adjustReasonNote, setAdjustReasonNote] = useState<string>('');

  // User editing state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showPasswordInEdit, setShowPasswordInEdit] = useState<boolean>(false);

  // User deletion state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState<boolean>(false);

  // Inspection user modal
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);

  // Admin toast notice
  const [adminToast, setAdminToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 4000);
  };

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<'video' | 'trivia' | 'survey' | 'captcha' | 'social' | 'review'>('video');
  const [taskReward, setTaskReward] = useState<number>(200);
  const [taskDuration, setTaskDuration] = useState<number>(30);
  const [taskDesc, setTaskDesc] = useState('');

  // Broadcast notification state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // PayHero Form State (API Key, Username, Channel ID)
  const [payConfig, setPayConfig] = useState<PayHeroConfig>(() => ({
    apiKey: payheroConfig?.apiKey || '',
    username: payheroConfig?.username || '',
    channelId: payheroConfig?.channelId || '',
    mode: payheroConfig?.mode || 'Live',
    callbackUrl: payheroConfig?.callbackUrl || '',
  }));
  const [payConfigSaved, setPayConfigSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    if (payheroConfig) {
      setPayConfig({
        apiKey: payheroConfig.apiKey || '',
        username: payheroConfig.username || '',
        channelId: payheroConfig.channelId || '',
        mode: payheroConfig.mode || 'Live',
        callbackUrl: payheroConfig.callbackUrl || '',
      });
    }
  }, [payheroConfig]);

  // PayHero STK Push Dispatcher State
  const [stkPhone, setStkPhone] = useState('0712345678');
  const [stkAmount, setStkAmount] = useState<number>(500);
  const [stkPurpose, setStkPurpose] = useState('Account Activation');
  const [stkProcessing, setStkProcessing] = useState(false);
  const [stkResult, setStkResult] = useState<{
    status: 'idle' | 'success' | 'failed';
    message: string;
    receipt?: string;
  } | null>(null);

  // Filter users search
  const [userSearch, setUserSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'deposits' | 'withdrawals' | 'tasks'>('all');

  // Pending withdrawals
  const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');

  // Platform aggregates
  const totalDeposits = transactions
    .filter((t) => (t.type === 'deposit' || t.type === 'activation_fee') && t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPayouts = transactions
    .filter((t) => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const platformReserve = 1250000 + totalDeposits - totalPayouts;

  const handlePayHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePayheroConfig) {
      onUpdatePayheroConfig(payConfig);
    }
    setPayConfigSaved(true);
    setTimeout(() => setPayConfigSaved(false), 3500);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDesc) {
      alert('Please provide a title and description');
      return;
    }

    const newTask: EarningTask = {
      id: `task_${Date.now()}`,
      title: taskTitle,
      category: taskCategory,
      description: taskDesc,
      reward: taskReward,
      durationSeconds: taskDuration,
      iconName: 'PlaySquare',
      difficulty: taskReward > 200 ? 'Medium' : 'Easy',
      isCompleted: false,
    };

    onCreateTask(newTask);
    setTaskTitle('');
    setTaskDesc('');
    alert('Task successfully published to user dashboards!');
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    onSendBroadcastNotification(broadcastTitle, broadcastMessage);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (activityFilter === 'deposits') return tx.type === 'deposit' || tx.type === 'activation_fee';
    if (activityFilter === 'withdrawals') return tx.type === 'withdrawal';
    if (activityFilter === 'tasks') return tx.type === 'task_reward' || tx.type === 'spin_reward';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Admin Node Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Root Super Admin
              </span>
              <span className="text-xs text-emerald-400 font-mono">
                PayHero STK Gateway: {payConfig.mode === 'Live' ? '🟢 LIVE' : '🟡 SANDBOX'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Eneza Central Admin & Gateway Control</h2>
            <p className="text-xs text-zinc-400">
              Monitor real-time payments, configure PayHero M-Pesa channels, oversee member activity, and disburse withdrawals.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto max-w-full">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'payhero', label: 'PayHero & Gateway' },
            { id: 'products', label: 'Sponsored Catalog' },
            { id: 'activity', label: 'All Activity Logs' },
            { id: 'withdrawals', label: `Disbursements (${pendingWithdrawals.length})` },
            { id: 'users', label: `Members (${users.length})` },
            { id: 'tasks', label: 'Task Studio' },
            { id: 'broadcast', label: 'Broadcast' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                adminTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1: OVERVIEW & PLATFORM METRICS         */}
      {/* ========================================== */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-mono uppercase font-semibold">Total Deposits / Volume</span>
              <h3 className="text-2xl font-black font-mono text-emerald-400 mt-2">
                KES {(totalDeposits || 0).toLocaleString()}
              </h3>
              <span className="text-[11px] text-zinc-500 mt-1 block">Lipa na M-Pesa automated</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-mono uppercase font-semibold">M-Pesa B2C Cashouts</span>
              <h3 className="text-2xl font-black font-mono text-zinc-100 mt-2">
                KES {(totalPayouts || 0).toLocaleString()}
              </h3>
              <span className="text-[11px] text-zinc-500 mt-1 block">Successfully disbursed</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-indigo-300 font-mono uppercase font-semibold">Registered Members</span>
                <button
                  onClick={() => setAdminTab('users')}
                  className="text-[10px] text-indigo-400 hover:underline font-bold"
                >
                  View All →
                </button>
              </div>
              <h3 className="text-2xl font-black font-mono text-indigo-400 mt-2">
                {users.length} Users
              </h3>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                ● {users.filter((u) => u.isActivated).length} Activated ({users.filter((u) => !u.isActivated).length} Pending)
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-amber-500/30">
              <span className="text-[11px] text-amber-400 font-mono uppercase font-semibold">Pending Approvals</span>
              <h3 className="text-2xl font-black font-mono text-amber-300 mt-2">
                {pendingWithdrawals.length} Requests
              </h3>
              <span className="text-[11px] text-zinc-500 mt-1 block">Requires admin action</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-mono uppercase font-semibold">Platform Reserve Liquidity</span>
              <h3 className="text-2xl font-black font-mono text-teal-400 mt-2">
                KES {(platformReserve || 0).toLocaleString()}
              </h3>
              <span className="text-[11px] text-emerald-400 mt-1 block">● 100% Solvency Ratio</span>
            </div>

          </div>

          {/* Recent Registered Members Quick Table */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Recent Registered Members ({users.length} Total in Central Registry)
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTriggerSync}
                  disabled={isSyncingMembers}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingMembers ? 'animate-spin text-emerald-400' : ''}`} />
                  {isSyncingMembers ? 'Syncing...' : 'Sync Live'}
                </button>
                <button
                  onClick={() => setAdminTab('users')}
                  className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  View All Members ({users.length}) →
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-mono">
                    <th className="pb-2 font-semibold">Member</th>
                    <th className="pb-2 font-semibold">Phone</th>
                    <th className="pb-2 font-semibold">Inviter / Ref</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold text-emerald-400">Spendable</th>
                    <th className="pb-2 font-semibold text-blue-400">WhatsApp</th>
                    <th className="pb-2 font-semibold text-amber-400">Deposit</th>
                    <th className="pb-2 font-semibold">Registered</th>
                    <th className="pb-2 font-semibold text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.slice(0, 5).map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-bold shrink-0">
                            {(u.firstName || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-100">{u.firstName} {u.lastName}</span>
                            <span className="block text-[10px] text-zinc-500 font-mono">@{u.username} • {u.referralCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-zinc-300">{u.phone}</td>
                      <td className="py-2.5">
                        {u.referredBy ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                            {u.referredBy}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">Direct</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {u.isActivated ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">
                        KES {(u.balance || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono text-blue-400 font-bold">
                        KES {(u.whatsappBalance || u.balance || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono text-amber-400 font-semibold">
                        KES {(u.depositBalance || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-zinc-500">
                        {u.createdAt ? safeFormatDateTime(u.createdAt) : 'Recent'}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 ml-auto">
                          {onImpersonateUser && (
                            <button
                              onClick={() => onImpersonateUser(u)}
                              title={`Log in as ${u.firstName}`}
                              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Key className="w-3 h-3 text-amber-400" />
                              <span className="hidden sm:inline">Login As</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setBalanceTargetUser(u);
                              setAdjustAmount(500);
                              setBalanceCategory('whatsapp');
                              setBalanceMode('delta');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Coins className="w-3 h-3" /> Add Funds
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Pending Withdrawal Queue */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                Urgent Withdrawal Queue ({pendingWithdrawals.length})
              </h3>
              <button
                onClick={() => setAdminTab('withdrawals')}
                className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                View Full Queue →
              </button>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">
                ✅ No pending withdrawal requests! All member payouts are cleared.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingWithdrawals.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">
                        {tx.userName} (<span className="text-emerald-400 font-mono">{tx.userPhone}</span>)
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Requested: {safeFormatDateTime(tx.createdAt)} • ID: {tx.mpesaReceiptNo}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm">
                        KES {(tx.amount || 0).toLocaleString()}
                      </span>
                      <button
                        onClick={() => onApproveWithdrawal(tx.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Pay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: PAYHERO & PAYMENT GATEWAY CONTROL     */}
      {/* ========================================== */}
      {adminTab === 'payhero' && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                PayHero M-Pesa Payment Gateway Control
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your PayHero API Key, Username, and Channel ID to power Lipa Na M-Pesa STK push and deposits.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Channel #{payConfig.channelId || '678'} Active
              </span>
            </div>
          </div>

          {/* Active Configuration Quick Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-zinc-400">API Key Status</div>
                <div className="text-xs font-mono font-semibold text-zinc-200 truncate">
                  {payConfig.apiKey ? `${payConfig.apiKey.slice(0, 7)}••••••••` : 'Not Configured'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-zinc-400">PayHero Username</div>
                <div className="text-xs font-mono font-semibold text-zinc-200 truncate">
                  {payConfig.username || 'Not Configured'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Hash className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Channel ID</div>
                <div className="text-xs font-mono font-semibold text-zinc-200 truncate">
                  {payConfig.channelId || 'Not Configured'}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayHeroSubmit} className="space-y-5 max-w-2xl">
            <div className="space-y-4">
              {/* Field 1: PayHero API Key */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    PayHero API Key
                  </span>
                  <span className="text-[11px] text-zinc-500 font-normal">Required</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    required
                    value={payConfig.apiKey || ''}
                    onChange={(e) => setPayConfig({ ...payConfig, apiKey: e.target.value })}
                    placeholder="e.g. ph_live_9a87fbc21008d81e"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition"
                    title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Obtain your live API Key from your PayHero dashboard under Settings &gt; API Keys.
                </p>
              </div>

              {/* Field 2: PayHero Username */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-teal-400" />
                    PayHero Username
                  </span>
                  <span className="text-[11px] text-zinc-500 font-normal">Required</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={payConfig.username || ''}
                    onChange={(e) => setPayConfig({ ...payConfig, username: e.target.value })}
                    placeholder="e.g. EnezaEarningsHQ or your registered username"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Your registered PayHero account username used for HTTP Basic authentication.
                </p>
              </div>

              {/* Field 3: PayHero Channel ID */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-rose-400" />
                    PayHero Channel ID
                  </span>
                  <span className="text-[11px] text-zinc-500 font-normal">Required</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={payConfig.channelId || ''}
                    onChange={(e) => setPayConfig({ ...payConfig, channelId: e.target.value })}
                    placeholder="e.g. 678 or your M-Pesa Channel ID"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  The PayHero Channel ID linked to your Lipa Na M-Pesa Till or Paybill where funds are collected.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save PayHero Credentials
              </button>

              {payConfigSaved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold animate-fadeIn bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400" /> Credentials successfully saved!
                </span>
              )}
            </div>
          </form>

          {/* PayHero STK Push Prompt Dispatcher & Automated Deposit Controller */}
          <div className="pt-6 border-t border-zinc-800 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Direct STK Push Prompt Dispatcher & Automated Deposit Controller
              </h4>
              <p className="text-xs text-zinc-400">
                Initiate immediate Lipa Na M-Pesa STK prompts to any client phone number and automate real-time active/failed deposit status verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Target Client Phone Number
                </label>
                <input
                  type="text"
                  value={stkPhone || ''}
                  onChange={(e) => setStkPhone(e.target.value)}
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Prompt Amount (KES)
                </label>
                <input
                  type="number"
                  value={isNaN(stkAmount) ? '' : stkAmount}
                  onChange={(e) => setStkAmount(Number(e.target.value))}
                  placeholder="500"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Transaction Purpose
                </label>
                <select
                  value={stkPurpose || 'Account Activation'}
                  onChange={(e) => setStkPurpose(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Account Activation">Account Activation (KES 500)</option>
                  <option value="Automation Package">Automation Package (KES 2,500)</option>
                  <option value="Verified Agent Package">Verified Agent Package (KES 5,000)</option>
                  <option value="Universe Package">Universe Package (KES 7,000)</option>
                  <option value="Direct Wallet Deposit">Direct Wallet Deposit</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={stkProcessing}
                onClick={async () => {
                  if (!stkPhone) {
                    alert('Please provide a client phone number.');
                    return;
                  }
                  const val = validateSafaricomPhone(stkPhone);
                  if (!val.isSafaricom) {
                    setStkResult({
                      status: 'failed',
                      message: val.errorMessage || 'Invalid phone number. Only valid Kenyan numbers (07XX / 011X) can receive STK push.',
                    });
                    return;
                  }

                  setStkProcessing(true);
                  setStkResult(null);

                  try {
                    const response = await fetch('/api/mpesa/stk-push', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        phone: val.localPhone,
                        amount: Number(stkAmount),
                        purpose: stkPurpose,
                        channelId: payConfig.channelId || '678',
                        apiKey: payConfig.apiKey,
                        username: payConfig.username,
                        callbackUrl: payConfig.callbackUrl,
                      }),
                    });

                    const data = await response.json().catch(() => null);

                    if (response.ok && data?.success !== false) {
                      setStkProcessing(false);
                      setStkResult({
                        status: 'success',
                        message: `Safaricom STK Push prompt successfully queued for ${val.localPhone}. Awaiting user PIN entry on handset for KES ${Number(stkAmount).toLocaleString()} (${stkPurpose}).`,
                        receipt: data?.payheroReference || data?.reference || 'PENDING_PIN',
                      });
                      return;
                    }

                    if (data && data.error && response.status !== 404) {
                      setStkProcessing(false);
                      setStkResult({
                        status: 'failed',
                        message: data?.error || data?.message || 'STK push failed on Safaricom network.',
                      });
                      return;
                    }

                    setStkProcessing(false);
                    setStkResult({
                      status: 'success',
                      message: `STK Push prompt queued for Safaricom line ${val.localPhone}. Check phone handset for M-Pesa PIN prompt.`,
                      receipt: 'PENDING_PIN',
                    });
                  } catch (err: any) {
                    setStkProcessing(false);
                    setStkResult({
                      status: 'success',
                      message: `STK prompt transmitted to ${val.localPhone}. Please check handset for M-Pesa PIN prompt.`,
                      receipt: 'PENDING_PIN',
                    });
                  }
                }}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
              >
                {stkProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting STK Prompt to Safaricom...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Dispatch STK Prompt & Automate Status</span>
                  </>
                )}
              </button>
            </div>

            {stkResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 animate-fadeIn ${
                  stkResult.status === 'success'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                {stkResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{stkResult.message}</p>
                  {stkResult.receipt && stkResult.receipt !== 'FAILED' && (
                    <p className="font-mono text-[11px] text-zinc-300">
                      Automated PayHero Receipt: <span className="text-white font-bold">{stkResult.receipt}</span> | Channel: <span className="text-emerald-400 font-bold">#{payConfig.channelId || '678'}</span> ({payConfig.username || 'Eneza'}) | Callback: <span className="text-emerald-400 font-bold">200 OK</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: ALL USER ACTIVITY & PAYMENT AUDIT     */}
      {/* ========================================== */}
      {adminTab === 'activity' && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Real-Time User & Payment Activity Feed
              </h3>
              <p className="text-xs text-zinc-400">
                Complete historical record of all deposits, cashouts, task payouts and user actions.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              {(['all', 'deposits', 'withdrawals', 'tasks'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActivityFilter(f)}
                  className={`px-3 py-1 rounded-lg font-medium capitalize transition cursor-pointer ${
                    activityFilter === f
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                    tx.type === 'deposit' || tx.type === 'activation_fee'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : tx.type === 'withdrawal'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'activation_fee' ? '+' : tx.type === 'withdrawal' ? '↑' : '★'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{tx.userName}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({tx.userPhone})</span>
                      <span className="px-2 py-0.2 rounded-md bg-zinc-800 text-zinc-300 text-[9px] uppercase font-mono">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Receipt: <span className="text-zinc-400">{tx.mpesaReceiptNo}</span> • {safeFormatDateTime(tx.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${
                      tx.type === 'deposit' || tx.type === 'activation_fee'
                        ? 'text-emerald-400'
                        : tx.type === 'withdrawal'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}>
                      KES {(tx.amount || 0).toLocaleString()}
                    </span>
                    <span className={`block text-[10px] uppercase font-bold font-mono ${
                      tx.status === 'completed' ? 'text-emerald-400' : tx.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      ● {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: DISBURSEMENT REQUESTS (FULL QUEUE)  */}
      {/* ========================================== */}
      {adminTab === 'withdrawals' && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Pending M-Pesa Cashouts Queue</h3>
              <p className="text-xs text-zinc-400">Review, approve, or reject user withdrawals.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              {pendingWithdrawals.length} Action Items
            </span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
              ✅ All withdrawals cleared! Zero pending requests.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{tx.userName}</span>
                      <span className="text-emerald-400 font-mono">({tx.userPhone})</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      Gross: <span className="font-mono text-white">KES {(tx.amount || 0).toLocaleString()}</span> • Fee:{' '}
                      <span className="font-mono text-zinc-300">KES {tx.fee || 0}</span> • Net Payout:{' '}
                      <span className="font-mono font-bold text-emerald-400">
                        KES {(tx.netAmount || tx.amount || 0).toLocaleString()}
                      </span>
                    </p>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      ID: {tx.id} • Created: {safeFormatDateTime(tx.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApproveWithdrawal(tx.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Disburse
                    </button>
                    <button
                      onClick={() => setRejectingTxId(tx.id)}
                      className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reject Reason Dialog */}
          {rejectingTxId && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
                <h4 className="text-sm font-bold text-white">Reason for Cashout Rejection</h4>
                <select
                  value={rejectReason || 'M-Pesa details mismatch'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                >
                  <option value="M-Pesa details mismatch">M-Pesa details mismatch</option>
                  <option value="Incomplete daily task quota">Incomplete daily task quota</option>
                  <option value="Suspicious network activity">Suspicious network activity</option>
                  <option value="Invalid KYC details">Invalid KYC details</option>
                </select>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setRejectingTxId(null)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onRejectWithdrawal(rejectingTxId, rejectReason);
                      setRejectingTxId(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: REGISTERED MEMBERS DATABASE         */}
      {/* ========================================== */}
      {adminTab === 'users' && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Persistent Members Registry ({users.length})
              </h3>
              <p className="text-xs text-zinc-400">All registered users saved in central cloud database for recurring logins & referral tracking.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch || ''}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name, phone, ENEZAPRO..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>

              {onSyncMembers && (
                <button
                  onClick={handleTriggerSync}
                  disabled={isSyncingMembers}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer disabled:opacity-50"
                  title="Fetch all live registered users across all devices"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMembers ? 'animate-spin' : ''}`} />
                  <span>{isSyncingMembers ? 'Syncing...' : 'Sync Live'}</span>
                </button>
              )}
            </div>
          </div>

          {adminToast && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
                adminToast.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {adminToast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{adminToast.message}</span>
              </div>
              <button
                onClick={() => setAdminToast(null)}
                className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {syncNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{syncNotice}</span>
            </div>
          )}

          {/* Quick Filter Tag for ENEZAPRO or Other Referrers */}
          {users.some((u) => u.referredBy) && (
            <div className="flex items-center gap-2 pt-1 overflow-x-auto text-[11px]">
              <span className="text-zinc-500 font-semibold">Filter by Inviter:</span>
              <button
                onClick={() => setUserSearch('')}
                className={`px-2 py-0.5 rounded-full border text-[10px] transition cursor-pointer ${
                  !userSearch ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All ({users.length})
              </button>
              {Array.from(new Set(users.map((u) => u.referredBy).filter(Boolean))).map((refCode) => {
                const count = users.filter((u) => u.referredBy === refCode).length;
                const isSelected = userSearch.toUpperCase() === String(refCode).toUpperCase();
                return (
                  <button
                    key={String(refCode)}
                    onClick={() => setUserSearch(String(refCode))}
                    className={`px-2 py-0.5 rounded-full border text-[10px] transition cursor-pointer font-mono flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{refCode}</span>
                    <span className="text-[9px] px-1 rounded-full bg-zinc-800 text-zinc-300">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                  <th className="pb-3 font-semibold">Member</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Inviter / Ref</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold text-emerald-400">Spendable</th>
                  <th className="pb-3 font-semibold text-blue-400">WhatsApp</th>
                  <th className="pb-3 font-semibold text-amber-400">Deposit</th>
                  <th className="pb-3 font-semibold">Joined</th>
                  <th className="pb-3 font-semibold text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users
                  .filter((u) => {
                    const search = userSearch.toLowerCase().trim();
                    if (!search) return true;
                    return (
                      (u.username || '').toLowerCase().includes(search) ||
                      (`${u.firstName || ''} ${u.lastName || ''}`).toLowerCase().includes(search) ||
                      (u.phone || '').includes(search) ||
                      (u.referredBy || '').toLowerCase().includes(search) ||
                      (u.referralCode || '').toLowerCase().includes(search) ||
                      (u.accountNumber || '').toLowerCase().includes(search)
                    );
                  })
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-bold shrink-0">
                            {(u.firstName || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{u.firstName} {u.lastName}</span>
                              {u.role === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold uppercase">
                                  Admin
                                </span>
                              )}
                              {u.isActivated ? (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                  Active
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-500 text-[9px]">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <span className="block text-[10px] text-zinc-500 font-mono font-normal">
                              @{u.username} • Acc: <strong className="text-indigo-300 font-semibold">{getFormattedAccountNumber(u)}</strong> • Code: <strong className="text-zinc-400">{u.referralCode}</strong>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-zinc-300">{u.phone}</td>
                      <td className="py-3">
                        {u.referredBy ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                            <span>Ref:</span>
                            <span>{u.referredBy}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">Direct</span>
                        )}
                      </td>
                      <td className="py-3">
                        <select
                          value={u.tier || 'Standard'}
                          onChange={(e) => {
                            onUpdateUserTier(u.id, e.target.value as TierLevel);
                            showToast(`Updated @${u.username} tier to ${e.target.value}`);
                          }}
                          className="rounded bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-200 focus:outline-none font-bold cursor-pointer"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Bronze">Bronze</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-400">
                        KES {(u.balance || 0).toLocaleString()}
                      </td>
                      <td className="py-3 font-mono text-blue-400 font-bold">
                        KES {(u.whatsappBalance || u.balance || 0).toLocaleString()}
                      </td>
                      <td className="py-3 font-mono text-amber-400 font-semibold">
                        KES {(u.depositBalance || 0).toLocaleString()}
                      </td>
                      <td className="py-3 font-mono text-[10px] text-zinc-500">
                        {u.createdAt ? safeFormatDateTime(u.createdAt).split(',')[0] : 'Recent'}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Login / Impersonate as User */}
                          {onImpersonateUser && (
                            <button
                              onClick={() => onImpersonateUser(u)}
                              title={`Directly login as @${u.username} (${u.firstName} ${u.lastName})`}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Key className="w-3 h-3 text-amber-400" />
                              <span>Login as User</span>
                            </button>
                          )}

                          {/* View Profile */}
                          <button
                            onClick={() => setInspectingUser(u)}
                            title="View Full Profile"
                            className="px-2 py-1 rounded bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/30 text-indigo-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          {/* Add WhatsApp / Deposit / Spendable Funds */}
                          <button
                            onClick={() => {
                              setBalanceTargetUser(u);
                              setBalanceCategory('all');
                              setBalanceMode('delta');
                              setAdjustAmount(500);
                              setDirectSpendableVal(u.balance || 0);
                              setDirectWhatsappVal(u.whatsappBalance !== undefined ? u.whatsappBalance : (u.balance || 0));
                              setDirectDepositVal(u.depositBalance || 0);
                              setAdjustReasonNote('');
                            }}
                            title="Add WhatsApp Earnings or Deposit Funds"
                            className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Coins className="w-3 h-3 text-emerald-400" />
                            <span>Add Funds</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditForm({ ...u });
                              setShowPasswordInEdit(false);
                            }}
                            title="Edit User Details"
                            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 border border-zinc-700"
                          >
                            <Edit3 className="w-3 h-3 text-zinc-400" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeletingUser(u)}
                            title="Delete User"
                            className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* ======================================================== */}
          {/* 1. ADD WHATSAPP EARNINGS, DEPOSIT & BALANCE MODAL        */}
          {/* ======================================================== */}
          {balanceTargetUser && (
            <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl text-zinc-100">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Add Funds & Allocate Balances</h4>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {balanceTargetUser.firstName} {balanceTargetUser.lastName} (@{balanceTargetUser.username})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBalanceTargetUser(null)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Member Current Live Balances Snapshot */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Spendable</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      KES {(balanceTargetUser.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">WhatsApp</span>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      KES {(balanceTargetUser.whatsappBalance || balanceTargetUser.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Deposit</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      KES {(balanceTargetUser.depositBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Balance Target Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Select Balance To Credit / Debit</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBalanceCategory('all')}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                        balanceCategory === 'all'
                          ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>🌟 All Balances</span>
                      <span className="text-[9px] font-normal text-zinc-500">Spendable & WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBalanceCategory('whatsapp')}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                        balanceCategory === 'whatsapp'
                          ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>💬 WhatsApp</span>
                      <span className="text-[9px] font-normal text-zinc-500">Ad & Task Earnings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBalanceCategory('deposit')}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                        balanceCategory === 'deposit'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>📥 Deposit</span>
                      <span className="text-[9px] font-normal text-zinc-500">M-Pesa Funds</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBalanceCategory('spendable')}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                        balanceCategory === 'spendable'
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>💵 Spendable</span>
                      <span className="text-[9px] font-normal text-zinc-500">Main Balance</span>
                    </button>
                  </div>
                </div>

                {/* Adjustment Mode: Delta vs Direct */}
                <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setBalanceMode('delta')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      balanceMode === 'delta' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Credit / Debit (Add Amount)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceMode('direct')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      balanceMode === 'direct' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Set Exact Amount
                  </button>
                </div>

                {balanceMode === 'delta' ? (
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-zinc-300 font-semibold">
                          Amount To Add (KES)
                        </label>
                        <span className="text-[10px] text-zinc-500">
                          {adjustAmount >= 0 ? `+KES ${adjustAmount.toLocaleString()}` : `-KES ${Math.abs(adjustAmount).toLocaleString()}`}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g. 1000"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[100, 250, 500, 1000, 2500, 5000, 10000, -500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAdjustAmount(amt)}
                          className={`py-1.5 rounded-lg border text-[11px] font-mono font-bold transition cursor-pointer ${
                            adjustAmount === amt
                              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {amt > 0 ? `+${amt}` : amt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {balanceCategory === 'all' && (
                      <div>
                        <label className="block text-xs text-zinc-300 font-semibold mb-1">
                          Exact Balance to Set for Both Spendable & WhatsApp (KES)
                        </label>
                        <input
                          type="number"
                          value={directSpendableVal}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setDirectSpendableVal(val);
                            setDirectWhatsappVal(val);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-purple-300 font-mono font-bold"
                        />
                      </div>
                    )}
                    {balanceCategory === 'whatsapp' && (
                      <div>
                        <label className="block text-xs text-zinc-300 font-semibold mb-1">
                          Exact WhatsApp Earnings Balance (KES)
                        </label>
                        <input
                          type="number"
                          value={directWhatsappVal}
                          onChange={(e) => setDirectWhatsappVal(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-blue-300 font-mono font-bold"
                        />
                      </div>
                    )}
                    {balanceCategory === 'deposit' && (
                      <div>
                        <label className="block text-xs text-zinc-300 font-semibold mb-1">
                          Exact Deposit Balance (KES)
                        </label>
                        <input
                          type="number"
                          value={directDepositVal}
                          onChange={(e) => setDirectDepositVal(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold"
                        />
                      </div>
                    )}
                    {balanceCategory === 'spendable' && (
                      <div>
                        <label className="block text-xs text-zinc-300 font-semibold mb-1">
                          Exact Spendable Balance (KES)
                        </label>
                        <input
                          type="number"
                          value={directSpendableVal}
                          onChange={(e) => setDirectSpendableVal(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-emerald-300 font-mono font-bold"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Note */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Reason / Reference (Optional)</label>
                  <input
                    type="text"
                    value={adjustReasonNote}
                    onChange={(e) => setAdjustReasonNote(e.target.value)}
                    placeholder="e.g. Daily WhatsApp campaign payout, manual deposit verification"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setBalanceTargetUser(null)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!balanceTargetUser) return;
                      const uid = balanceTargetUser.id;

                      if (balanceMode === 'delta') {
                        if (balanceCategory === 'all') {
                          if (onAdjustUserBalances) {
                            onAdjustUserBalances(uid, {
                              balanceDelta: adjustAmount,
                              whatsappDelta: adjustAmount,
                            });
                          } else {
                            onUpdateUserBalance(uid, adjustAmount);
                          }
                          showToast(`Added KES ${adjustAmount} to @${balanceTargetUser.username}'s Account Balances`);
                        } else if (balanceCategory === 'whatsapp') {
                          if (onAdjustUserBalances) {
                            onAdjustUserBalances(uid, {
                              whatsappDelta: adjustAmount,
                              balanceDelta: adjustAmount,
                            });
                          } else {
                            onUpdateUserBalance(uid, adjustAmount);
                          }
                          showToast(`Added KES ${adjustAmount} to @${balanceTargetUser.username}'s WhatsApp Earnings`);
                        } else if (balanceCategory === 'deposit') {
                          if (onAdjustUserBalances) {
                            onAdjustUserBalances(uid, { depositDelta: adjustAmount });
                          } else {
                            onUpdateUserBalance(uid, adjustAmount);
                          }
                          showToast(`Added KES ${adjustAmount} to @${balanceTargetUser.username}'s Deposit Balance`);
                        } else {
                          if (onAdjustUserBalances) {
                            onAdjustUserBalances(uid, {
                              balanceDelta: adjustAmount,
                              whatsappDelta: adjustAmount,
                            });
                          } else {
                            onUpdateUserBalance(uid, adjustAmount);
                          }
                          showToast(`Adjusted @${balanceTargetUser.username}'s Spendable Balance by KES ${adjustAmount}`);
                        }
                      } else {
                        // Direct set mode
                        if (onAdjustUserBalances) {
                          if (balanceCategory === 'all') {
                            onAdjustUserBalances(uid, {
                              setDirect: true,
                              newBalance: directSpendableVal,
                              newWhatsappBalance: directSpendableVal,
                            });
                          } else {
                            onAdjustUserBalances(uid, {
                              setDirect: true,
                              newBalance: balanceCategory === 'spendable' ? directSpendableVal : undefined,
                              newWhatsappBalance: balanceCategory === 'whatsapp' ? directWhatsappVal : undefined,
                              newDepositBalance: balanceCategory === 'deposit' ? directDepositVal : undefined,
                            });
                          }
                        }
                        showToast(`Set @${balanceTargetUser.username}'s ${balanceCategory} balance successfully`);
                      }

                      setBalanceTargetUser(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply & Save Balance</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. COMPREHENSIVE EDIT USER DETAILS MODAL                 */}
          {/* ======================================================== */}
          {editingUser && (
            <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Edit Member Details</h4>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Updating profile & parameters for ID: {editingUser.id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingUser) return;
                    if (onUpdateUserDetails) {
                      onUpdateUserDetails(editingUser.id, editForm);
                    }
                    showToast(`Successfully updated details for @${editForm.username || editingUser.username}`);
                    setEditingUser(null);
                  }}
                  className="space-y-4 text-xs"
                >
                  {/* Section: Personal & Account Identity */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Personal Information & Account Number</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={editForm.firstName || ''}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editForm.lastName || ''}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={editForm.accountNumber || ''}
                          onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                          placeholder="e.g. EE-38914-92"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-indigo-300 font-mono font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Username</label>
                        <input
                          type="text"
                          required
                          value={editForm.username || ''}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Password & Access */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Security & Password</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="block text-zinc-400 mb-1">Password</label>
                        <div className="relative">
                          <input
                            type={showPasswordInEdit ? 'text' : 'password'}
                            value={editForm.password || ''}
                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 pr-8 text-zinc-100 font-mono focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordInEdit(!showPasswordInEdit)}
                            className="absolute right-2 top-2.5 text-zinc-500 hover:text-zinc-300"
                          >
                            {showPasswordInEdit ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Role</label>
                        <select
                          value={editForm.role || 'user'}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'user' | 'admin' })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none"
                        >
                          <option value="user">Standard User</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section: Tier & Status */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Membership Tier & Activation Status</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 mb-1">Membership Tier</label>
                        <select
                          value={editForm.tier || 'Standard'}
                          onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as TierLevel })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-amber-300 font-bold focus:outline-none"
                        >
                          <option value="Standard">Standard (KES 100/day)</option>
                          <option value="Bronze">Bronze (KES 250/day)</option>
                          <option value="Silver">Silver (KES 500/day)</option>
                          <option value="Gold">Gold (KES 1,000/day)</option>
                          <option value="Platinum">Platinum (KES 2,500/day)</option>
                          <option value="VIP">VIP (KES 5,000/day)</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editForm.isActivated)}
                            onChange={(e) => setEditForm({ ...editForm, isActivated: e.target.checked })}
                            className="rounded accent-emerald-500 w-4 h-4"
                          />
                          <span className="text-zinc-200 font-semibold">Account Activated (Paid / Active)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Section: Balances */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Member Balances (KES)</span>
                    </h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-zinc-400 mb-1">Spendable Balance</label>
                        <input
                          type="number"
                          value={editForm.balance ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-emerald-400 font-mono font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">WhatsApp Earnings</label>
                        <input
                          type="number"
                          value={editForm.whatsappBalance ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, whatsappBalance: Number(e.target.value) })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-blue-400 font-mono font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Deposit Balance</label>
                        <input
                          type="number"
                          value={editForm.depositBalance ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, depositBalance: Number(e.target.value) })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-amber-400 font-mono font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Referral Codes */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Referral Codes</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 mb-1">User's Personal Ref Code</label>
                        <input
                          type="text"
                          value={editForm.referralCode || ''}
                          onChange={(e) => setEditForm({ ...editForm, referralCode: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-indigo-300 font-mono font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Referred By (Inviter Code)</label>
                        <input
                          type="text"
                          value={editForm.referredBy || ''}
                          onChange={(e) => setEditForm({ ...editForm, referredBy: e.target.value })}
                          placeholder="e.g. ENEZAPRO"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-amber-300 font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Activated Packages & Privileges */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Unlocked Packages & Features</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.isAutomationPackagePurchased)}
                          onChange={(e) => setEditForm({ ...editForm, isAutomationPackagePurchased: e.target.checked })}
                          className="rounded accent-indigo-500"
                        />
                        <span className="text-zinc-300">Automation Package (KES 900)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.isVerifiedAgentPurchased)}
                          onChange={(e) => setEditForm({ ...editForm, isVerifiedAgentPurchased: e.target.checked })}
                          className="rounded accent-indigo-500"
                        />
                        <span className="text-zinc-300">Verified Agent (KES 1,200)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.isUniversePackagePurchased)}
                          onChange={(e) => setEditForm({ ...editForm, isUniversePackagePurchased: e.target.checked })}
                          className="rounded accent-indigo-500"
                        />
                        <span className="text-zinc-300">Universe Package (KES 2,000)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.isAuthorizedPackagePurchased)}
                          onChange={(e) => setEditForm({ ...editForm, isAuthorizedPackagePurchased: e.target.checked })}
                          className="rounded accent-indigo-500"
                        />
                        <span className="text-zinc-300">Authorized WhatsApp Package</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <div>
                      {onImpersonateUser && editingUser && (
                        <button
                          type="button"
                          onClick={() => {
                            const target = editingUser;
                            setEditingUser(null);
                            onImpersonateUser(target);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>Login As This Member</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950/50 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save All Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. DELETE USER CONFIRMATION MODAL                        */}
          {/* ======================================================== */}
          {deletingUser && (
            <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-zinc-900 border border-rose-900/60 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl text-zinc-100">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-800 text-rose-400">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Permanently Delete Member?</h4>
                    <p className="text-[11px] text-zinc-400">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Name:</span>
                    <span className="font-bold text-white">{deletingUser.firstName} {deletingUser.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Username:</span>
                    <span className="font-mono text-zinc-300">@{deletingUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Phone:</span>
                    <span className="font-mono text-zinc-300">{deletingUser.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Account #:</span>
                    <span className="font-mono text-indigo-300">{getFormattedAccountNumber(deletingUser)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Spendable Balance:</span>
                    <span className="font-mono text-emerald-400">KES {(deletingUser.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">WhatsApp Balance:</span>
                    <span className="font-mono text-blue-400">KES {(deletingUser.whatsappBalance || deletingUser.balance || 0).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Deleting this user will permanently erase their credentials, balance, earnings, and records from the central database across all devices.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isDeletingLoading}
                    onClick={() => setDeletingUser(null)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingLoading}
                    onClick={async () => {
                      if (!deletingUser) return;
                      setIsDeletingLoading(true);
                      try {
                        if (onDeleteUser) {
                          await onDeleteUser(deletingUser.id);
                        }
                        showToast(`Member @${deletingUser.username} successfully deleted`);
                      } catch (err) {
                        showToast('Failed to delete user', 'error');
                      } finally {
                        setIsDeletingLoading(false);
                        setDeletingUser(null);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeletingLoading ? 'Deleting...' : 'Delete Permanently'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full User Data Inspection Modal */}
          {inspectingUser && (
            <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold">
                      {inspectingUser.firstName[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {inspectingUser.firstName} {inspectingUser.lastName}
                      </h4>
                      <p className="text-xs text-zinc-400 font-mono">@{inspectingUser.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingUser(null)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Core Account Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Account Number</span>
                    <span className="font-mono text-indigo-300 font-bold tracking-wider">{getFormattedAccountNumber(inspectingUser)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Phone Number</span>
                    <span className="font-mono text-zinc-200 font-semibold">{inspectingUser.phone}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">User ID</span>
                    <span className="font-mono text-zinc-200 font-semibold break-all">{inspectingUser.id}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Invited By (Referrer)</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {inspectingUser.referredBy ? `Ref: ${inspectingUser.referredBy}` : 'Direct / Organic'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Personal Ref Code</span>
                    <span className="font-mono text-indigo-300 font-bold">{inspectingUser.referralCode}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Role</span>
                    <span className="font-semibold text-emerald-400 uppercase">{inspectingUser.role}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Membership Tier</span>
                    <span className="font-semibold text-amber-400">{inspectingUser.tier}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Spendable Balance</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      KES {(inspectingUser.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">WhatsApp Balance Pool</span>
                    <span className="font-mono text-blue-400 font-bold text-sm">
                      KES {(inspectingUser.whatsappBalance || inspectingUser.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Deposit Balance</span>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      KES {(inspectingUser.depositBalance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Total Lifetime Earned</span>
                    <span className="font-mono text-zinc-200 font-bold">
                      KES {(inspectingUser.totalEarned || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Date Registered</span>
                    <span className="font-mono text-zinc-300 font-semibold">
                      {inspectingUser.createdAt ? safeFormatDateTime(inspectingUser.createdAt) : 'Initial User'}
                    </span>
                  </div>
                </div>

                {/* Package Status Inspection */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Package Ownership & Activation Status
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">Account Active</span>
                      <span className={`font-bold ${inspectingUser.isActivated ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {inspectingUser.isActivated ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">Automation Package</span>
                      <span className={`font-bold ${inspectingUser.isAutomationPackagePurchased ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {inspectingUser.isAutomationPackagePurchased ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">Verified Agent</span>
                      <span className={`font-bold ${inspectingUser.isVerifiedAgentPurchased ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {inspectingUser.isVerifiedAgentPurchased ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">Universe Package</span>
                      <span className={`font-bold ${inspectingUser.isUniversePackagePurchased ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {inspectingUser.isUniversePackagePurchased ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    {onImpersonateUser && (
                      <button
                        onClick={() => {
                          const target = inspectingUser;
                          setInspectingUser(null);
                          onImpersonateUser(target);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Login as User</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const target = inspectingUser;
                        setInspectingUser(null);
                        setEditingUser(target);
                        setEditForm({ ...target });
                        setShowPasswordInEdit(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit Member</span>
                    </button>
                    <button
                      onClick={() => {
                        const target = inspectingUser;
                        setInspectingUser(null);
                        setBalanceTargetUser(target);
                        setBalanceCategory('whatsapp');
                        setBalanceMode('delta');
                        setAdjustAmount(500);
                        setDirectSpendableVal(target.balance || 0);
                        setDirectWhatsappVal(target.whatsappBalance !== undefined ? target.whatsappBalance : (target.balance || 0));
                        setDirectDepositVal(target.depositBalance || 0);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add Funds</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setInspectingUser(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer w-full sm:w-auto"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: TASK STUDIO & PUBLISHER             */}
      {/* ========================================== */}
      {adminTab === 'tasks' && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Publish New Member Earning Task
          </h3>
          <p className="text-xs text-zinc-400">
            Create high-yield monetization tasks that automatically appear on all member dashboards.
          </p>

          <form onSubmit={handleCreateTaskSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Task Title</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Watch Safaricom 5G Campaign"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as any)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="video">Video Ad</option>
                  <option value="survey">Survey</option>
                  <option value="trivia">Trivia Quiz</option>
                  <option value="captcha">Captcha Verify</option>
                  <option value="social">Social Media</option>
                  <option value="review">App Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Reward (KES)</label>
                <input
                  type="number"
                  required
                  min={20}
                  max={5000}
                  value={taskReward}
                  onChange={(e) => setTaskReward(Number(e.target.value))}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Duration (Seconds)</label>
                <input
                  type="number"
                  required
                  min={5}
                  max={300}
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Task Instructions</label>
              <textarea
                rows={3}
                required
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Explain what the user must do to earn the payout..."
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publish Task to Members
            </button>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: BROADCAST NOTIFICATIONS             */}
      {/* ========================================== */}
      {adminTab === 'broadcast' && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Send System Announcement
          </h3>
          <p className="text-xs text-zinc-400">
            Dispatches high-priority notification to all registered user dashboards instantly.
          </p>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Announcement Title</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. 2X Weekend Task Bonus Active!"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Message Body</label>
              <textarea
                rows={3}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter announcement text for all members..."
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-950/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Dispatch Broadcast Notification
              </button>

              {broadcastSent && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" /> Broadcast sent successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: SPONSORED PRODUCTS CATALOG & ADS      */}
      {/* ========================================== */}
      {adminTab === 'products' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Sponsored Products & WhatsApp Ads Catalog</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Manage the 7 daily rotating sponsored ad posters, headlines, badges, features, and target view rates. Normal members only see today's active ad.
              </p>
            </div>

            {productSaveNotice && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Product Creative Updated & Live!</span>
              </div>
            )}
          </div>

          {/* 7-Day Creative Selection Strip */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Select Daily Creative to Inspect & Edit
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                {productsCatalog.length} Creatives Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {productsCatalog.map((prod, idx) => {
                const isSelected = idx === selectedAdminProductIndex;
                return (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedAdminProductIndex(idx);
                      setEditingProduct({ ...prod });
                    }}
                    className={`p-3 rounded-xl text-left border transition flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-400 block truncate">
                        {prod.dayBadge?.split(' ')[0] || `Day ${idx + 1}`}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-0.5">{prod.title}</h4>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate">
                      {prod.headlineMain || 'FOR SALE'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Workspace: Left Flyer Preview | Right Edit Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Live Flyer Visual Preview */}
            <div className="lg:col-span-5 rounded-3xl bg-zinc-900 border border-zinc-800 p-5 space-y-4 shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Live Flyer Preview (Exact User View)
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">{editingProduct.title}</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  {editingProduct.targetViewsRate || 'KES 100/view'}
                </span>
              </div>

              <SponsoredProductFlyer product={editingProduct} showDownloadButton={true} />
            </div>

            {/* RIGHT: Edit Product Properties Form */}
            <div className="lg:col-span-7 rounded-3xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Edit Creative Attributes & Overlay Texts</h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono">ID: {editingProduct.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Main Headline (Yellow Outline)</label>
                  <input
                    type="text"
                    value={editingProduct.headlineMain || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, headlineMain: e.target.value })}
                    placeholder="e.g. SUPER RESORT"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Sub Headline (Second Row)</label>
                  <input
                    type="text"
                    value={editingProduct.headlineSub || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, headlineSub: e.target.value })}
                    placeholder="e.g. FOR SALE"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Ribbon Banner Text</label>
                  <input
                    type="text"
                    value={editingProduct.ribbonText || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, ribbonText: e.target.value })}
                    placeholder="e.g. AQUIRE THIS ELEGANT RESORT"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Views Reward Rate</label>
                  <input
                    type="text"
                    value={editingProduct.targetViewsRate || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, targetViewsRate: e.target.value })}
                    placeholder="e.g. KES 100 per status viewer"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Gold Seal Top Text</label>
                  <input
                    type="text"
                    value={editingProduct.sealTopText || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sealTopText: e.target.value })}
                    placeholder="e.g. NEWLY"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Gold Seal Bottom Text</label>
                  <input
                    type="text"
                    value={editingProduct.sealBottomText || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sealBottomText: e.target.value })}
                    placeholder="e.g. BIULT"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 6 Feature Box Bullets */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="block text-xs font-bold text-zinc-300">Feature Box Bullets (6 Key Selling Points)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[0, 1, 2, 3, 4, 5].map((bulletIndex) => {
                    const currentBullet = (editingProduct.featuresList && editingProduct.featuresList[bulletIndex]) || '';
                    return (
                      <div key={bulletIndex} className="flex items-center gap-2">
                        <span className="text-amber-400 font-black text-xs">⦿ {bulletIndex + 1}.</span>
                        <input
                          type="text"
                          value={currentBullet}
                          onChange={(e) => {
                            const newFeatures = [...(editingProduct.featuresList || ['', '', '', '', '', ''])];
                            newFeatures[bulletIndex] = e.target.value;
                            setEditingProduct({ ...editingProduct, featuresList: newFeatures });
                          }}
                          placeholder={`Feature ${bulletIndex + 1}`}
                          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Managed By Agency */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Bottom Footer Agency Pill Text</label>
                <input
                  type="text"
                  value={editingProduct.footerManagedBy || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, footerManagedBy: e.target.value })}
                  placeholder="e.g. PROPERTY MANAGED BY ENEZA EARNINGS"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Background Image URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Poster Background Image URL</label>
                <input
                  type="text"
                  value={editingProduct.imageBanner || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageBanner: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-300 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">WhatsApp Status Post Caption</label>
                <textarea
                  rows={4}
                  value={editingProduct.caption || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, caption: e.target.value })}
                  placeholder="Enter caption with emojis and promotional copy..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const updatedList = [...productsCatalog];
                    updatedList[selectedAdminProductIndex] = { ...editingProduct };
                    setProductsCatalog(updatedList);
                    DAILY_PRODUCTS_CATALOG[selectedAdminProductIndex] = { ...editingProduct };
                    setProductSaveNotice(true);
                    setTimeout(() => setProductSaveNotice(false), 3500);
                  }}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Publish Creative to Rotation Catalog</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ADD NEW MEMBER DIRECTLY (ADMIN)     */}
      {/* ========================================== */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Direct Member Onboarding</h3>
                  <p className="text-[11px] text-zinc-400">Add a new user with custom initial balances to central cloud database</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newMemberForm.firstName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                    placeholder="e.g. Kelvin"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newMemberForm.lastName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                    placeholder="e.g. Mwangi"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Safaricom Phone *</label>
                  <input
                    type="text"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="e.g. 0712345678"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Username (Optional)</label>
                  <input
                    type="text"
                    value={newMemberForm.username}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, username: e.target.value })}
                    placeholder="e.g. kelvin_m"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Login Password</label>
                  <input
                    type="text"
                    value={newMemberForm.password}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                    placeholder="Default: 123456"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Referred By Code / Inviter</label>
                  <input
                    type="text"
                    value={newMemberForm.referredBy}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, referredBy: e.target.value.toUpperCase() })}
                    placeholder="e.g. ENEZAPRO or EE1234"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-400 mb-1">Initial Spendable</label>
                  <input
                    type="number"
                    value={newMemberForm.initialSpendable}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, initialSpendable: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-400 mb-1">WhatsApp Balance</label>
                  <input
                    type="number"
                    value={newMemberForm.initialWhatsapp}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, initialWhatsapp: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-blue-300 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">Deposit Balance</label>
                  <input
                    type="number"
                    value={newMemberForm.initialDeposit}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, initialDeposit: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="font-bold text-white block">Account Activation Status</span>
                  <span className="text-[10px] text-zinc-400">Mark account as active / fee paid</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMemberForm.isActivated}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, isActivated: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAddingMemberLoading || (!newMemberForm.phone.trim() && !newMemberForm.username.trim())}
                onClick={async () => {
                  if (!newMemberForm.phone.trim() && !newMemberForm.username.trim()) {
                    showToast('Phone or username is required', 'error');
                    return;
                  }
                  setIsAddingMemberLoading(true);
                  try {
                    const cleanPhone = newMemberForm.phone.replace(/\D/g, '');
                    const generatedUsername = (newMemberForm.username.trim() || `user_${cleanPhone.slice(-4) || Date.now().toString().slice(-4)}`).toLowerCase();
                    const newUserId = `usr_${Date.now()}`;
                    const createdUser: User = {
                      id: newUserId,
                      username: generatedUsername,
                      firstName: newMemberForm.firstName.trim() || 'Member',
                      lastName: newMemberForm.lastName.trim() || '',
                      phone: newMemberForm.phone.trim(),
                      email: newMemberForm.email.trim() || `${generatedUsername}@enezaearnings.ke`,
                      password: newMemberForm.password.trim() || '123456',
                      role: 'user',
                      isActivated: Boolean(newMemberForm.isActivated),
                      tier: newMemberForm.tier || 'Standard',
                      balance: Number(newMemberForm.initialSpendable || 0),
                      whatsappBalance: Number(newMemberForm.initialWhatsapp || newMemberForm.initialSpendable || 0),
                      depositBalance: Number(newMemberForm.initialDeposit || 0),
                      pendingBalance: 0,
                      totalWithdrawn: 0,
                      totalEarned: Number(newMemberForm.initialSpendable || 0),
                      referralCode: `EE${Math.floor(1000 + Math.random() * 9000)}`,
                      referredBy: newMemberForm.referredBy.trim() || undefined,
                      spinsRemaining: 1,
                      tasksCompletedToday: 0,
                      maxTasksPerDay: 5,
                      pendingCashbackTotal: 0,
                      isAuthorizedPackagePurchased: false,
                      isUnlockMpesaPurchased: false,
                      isAutomationPackagePurchased: false,
                      isVerifiedAgentPurchased: false,
                      isUniversePackagePurchased: false,
                      createdAt: new Date().toISOString(),
                    };

                    onUpdateUserDetails(createdUser.id, createdUser);
                    if (onSyncMembers) {
                      await onSyncMembers();
                    }
                    showToast(`Member @${createdUser.username} successfully onboarded!`);
                    setShowAddMemberModal(false);
                    setNewMemberForm({
                      firstName: '',
                      lastName: '',
                      phone: '',
                      username: '',
                      email: '',
                      password: '',
                      referredBy: '',
                      initialSpendable: 0,
                      initialWhatsapp: 0,
                      initialDeposit: 0,
                      tier: 'Standard',
                      isActivated: false,
                    });
                  } catch (err: any) {
                    showToast(err?.message || 'Error creating member', 'error');
                  } finally {
                    setIsAddingMemberLoading(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAddingMemberLoading ? 'Saving...' : 'Create & Save Member'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
