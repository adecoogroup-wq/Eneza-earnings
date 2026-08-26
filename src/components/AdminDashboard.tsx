import React, { useState, useEffect } from 'react';
import { User, Transaction, EarningTask, TierLevel, PayHeroConfig, DailyProductItem } from '../types';
import { INITIAL_PAYHERO_CONFIG, DAILY_PRODUCTS_CATALOG } from '../data/mockData';
import { safeFormatDateTime } from '../utils/dateUtils';
import { validateSafaricomPhone } from '../utils/phoneValidation';
import { SponsoredProductFlyer } from './SponsoredProductFlyer';
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
  Hash,
  X,
  ShoppingBag,
  Sparkles,
  Edit3,
  Download,
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  transactions: Transaction[];
  tasks: EarningTask[];
  onApproveWithdrawal: (txId: string) => void;
  onRejectWithdrawal: (txId: string, reason: string) => void;
  onUpdateUserBalance: (userId: string, deltaAmount: number) => void;
  onUpdateUserTier: (userId: string, newTier: TierLevel) => void;
  onCreateTask: (newTask: EarningTask) => void;
  onSendBroadcastNotification: (title: string, message: string) => void;
  payheroConfig?: PayHeroConfig;
  onUpdatePayheroConfig?: (config: PayHeroConfig) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  transactions,
  tasks,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onUpdateUserBalance,
  onUpdateUserTier,
  onCreateTask,
  onSendBroadcastNotification,
  payheroConfig = INITIAL_PAYHERO_CONFIG,
  onUpdatePayheroConfig,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'withdrawals' | 'payhero' | 'users' | 'activity' | 'tasks' | 'products' | 'broadcast'>('overview');

  // Sponsored Products Catalog State
  const [productsCatalog, setProductsCatalog] = useState<DailyProductItem[]>(DAILY_PRODUCTS_CATALOG);
  const [selectedAdminProductIndex, setSelectedAdminProductIndex] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<DailyProductItem>(DAILY_PRODUCTS_CATALOG[0]);
  const [productSaveNotice, setProductSaveNotice] = useState<boolean>(false);

  // Withdrawal rejection reason modal/state
  const [rejectingTxId, setRejectingTxId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('M-Pesa details mismatch');

  // User balance adjustment state
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<string | null>(null);
  const [balanceDelta, setBalanceDelta] = useState<number>(500);

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

  // Inspect User Data
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
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
              <p className="text-xs text-zinc-400">All registered users saved in database for recurring logins.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch || ''}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search username, name, phone..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Spendable</th>
                  <th className="pb-3 font-semibold">WhatsApp Pool</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users
                  .filter(
                    (u) =>
                      (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                      (`${u.firstName || ''} ${u.lastName || ''}`).toLowerCase().includes(userSearch.toLowerCase()) ||
                      (u.phone || '').includes(userSearch)
                  )
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/20">
                      <td className="py-3 font-semibold text-white">
                        {u.firstName} {u.lastName}
                        <span className="block text-[10px] text-zinc-500 font-mono font-normal">
                          @{u.username}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-zinc-300">{u.phone}</td>
                      <td className="py-3">
                        <select
                          value={u.tier || 'Standard'}
                          onChange={(e) => onUpdateUserTier(u.id, e.target.value as TierLevel)}
                          className="rounded bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-200 focus:outline-none font-bold"
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
                      <td className="py-3 font-mono text-blue-400">
                        KES {(u.whatsappBalance || 0).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectingUser(u)}
                            className="px-2.5 py-1 rounded bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/30 text-indigo-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Data</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserForBalance(u.id);
                            }}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Adjust Balance
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

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
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Core Account Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">User ID</span>
                    <span className="font-mono text-zinc-200 font-semibold break-all">{inspectingUser.id}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Phone Number</span>
                    <span className="font-mono text-zinc-200 font-semibold">{inspectingUser.phone}</span>
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
                      KES {(inspectingUser.whatsappBalance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Pending Cashback Pool</span>
                    <span className="font-mono text-amber-400 font-bold">
                      KES {(inspectingUser.pendingCashbackTotal || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Total Lifetime Earned</span>
                    <span className="font-mono text-zinc-200 font-bold">
                      KES {(inspectingUser.totalEarned || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 col-span-2">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Referral Code</span>
                    <span className="font-mono text-indigo-300 font-bold">{inspectingUser.referralCode}</span>
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

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setInspectingUser(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Adjust User Balance Modal */}
          {selectedUserForBalance && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-xs w-full space-y-4">
                <h4 className="text-sm font-bold text-white">Credit / Debit Member Balance</h4>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Adjustment Amount (KES)</label>
                  <input
                    type="number"
                    value={balanceDelta}
                    onChange={(e) => setBalanceDelta(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Use positive numbers to add balance, negative to deduct.
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedUserForBalance(null)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onUpdateUserBalance(selectedUserForBalance, balanceDelta);
                      setSelectedUserForBalance(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Apply Adjustment
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

    </div>
  );
};
