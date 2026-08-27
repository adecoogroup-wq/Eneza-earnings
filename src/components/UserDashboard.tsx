import React, { useState, useEffect } from 'react';
import { User, EarningTask, Transaction, LivePayoutItem } from '../types';
import {
  generateInitialBotActivityList,
  generateSingleBotActivity,
  formatTimeAgo,
} from '../utils/botActivity';
import {
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Plus,
  Eye,
  CreditCard,
  Radio,
  FileText,
  HelpCircle,
  Clock,
  Lock,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { AppView } from './Sidebar';
import { getFormattedAccountNumber } from '../utils/accountNumber';

interface UserDashboardProps {
  user: User;
  tasks: EarningTask[];
  transactions: Transaction[];
  onSwitchView: (view: AppView) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onSelectTask: (task: EarningTask) => void;
  onActivateAccount: () => void;
  isDarkMode?: boolean;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  transactions,
  onSwitchView,
  onOpenDeposit,
  onOpenWithdraw,
  isDarkMode = false,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Platform Live Activity Active Bot Data Engine (Automatically shuffles & streams)
  const [botActivities, setBotActivities] = useState<LivePayoutItem[]>(() => [
    {
      id: 'bot_init_1',
      memberName: 'Tinsae',
      phone: '07****90',
      actionTitle: 'withdrew',
      amount: 150000,
      timeAgo: '1h ago',
      type: 'whatsapp',
      mpesaRef: 'QK8945829',
    },
    {
      id: 'bot_init_2',
      memberName: 'Brian',
      phone: '07****22',
      actionTitle: 'earned',
      amount: 4500,
      timeAgo: '2m ago',
      type: 'whatsapp',
      mpesaRef: 'QK8945830',
    },
    {
      id: 'bot_init_3',
      memberName: 'Mercy',
      phone: '07****45',
      actionTitle: 'withdrew',
      amount: 28000,
      timeAgo: '4m ago',
      type: 'whatsapp',
      mpesaRef: 'QK8945831',
    },
    {
      id: 'bot_init_4',
      memberName: 'Faith',
      phone: '07****88',
      actionTitle: 'activated Dominance',
      amount: 7000,
      timeAgo: '8m ago',
      type: 'package',
      mpesaRef: 'QK8945832',
    },
    {
      id: 'bot_init_5',
      memberName: 'Kevin',
      phone: '07****11',
      actionTitle: 'withdrew',
      amount: 85000,
      timeAgo: '12m ago',
      type: 'whatsapp',
      mpesaRef: 'QK8945833',
    },
    {
      id: 'bot_init_6',
      memberName: 'David',
      phone: '07****99',
      actionTitle: 'earned',
      amount: 12000,
      timeAgo: '15m ago',
      type: 'whatsapp',
      mpesaRef: 'QK8945834',
    },
    {
      id: 'bot_init_7',
      memberName: 'Sarah',
      phone: '07****31',
      actionTitle: 'withdrew',
      amount: 62000,
      timeAgo: '18m ago',
      type: 'whatsapp',
      mpesaRef: 'QK8945835',
    },
  ]);

  // Real-time dynamic updates to stream
  useEffect(() => {
    const interval = setInterval(() => {
      const newItem = generateSingleBotActivity(0);
      setBotActivities((prev) => [newItem, ...prev.slice(0, 15)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount?: number | null) => {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `KSH ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const displayName = user?.firstName || user?.username || 'Chris';
  const eeAccountNumber = getFormattedAccountNumber(user);

  // Derive spendable WhatsApp earnings balance (falls back cleanly to user.balance if whatsappBalance is 0)
  const effectiveWhatsAppBalance =
    typeof user.whatsappBalance === 'number' && user.whatsappBalance > 0
      ? user.whatsappBalance
      : typeof user.balance === 'number'
      ? user.balance
      : 0;

  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(eeAccountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Map real dynamic user transactions strictly for this user
  const userTransactionsList = (transactions || []).filter((tx) => {
    if (!tx) return false;
    if (user?.id) {
      return tx.userId === user.id || (user.phone && tx.userPhone === user.phone);
    }
    return false;
  });

  const displayTransactions = userTransactionsList;

  const userRecentTransactions = displayTransactions.slice(0, 10).map((tx) => {
    const isCredit =
      tx.type === 'deposit' ||
      tx.type === 'cashback_claim' ||
      tx.type === 'investment_yield' ||
      tx.type === 'whatsapp_views_earning' ||
      tx.type === 'task_reward' ||
      tx.type === 'referral_bonus' ||
      tx.type === 'spin_reward';

    const isDebit =
      tx.type === 'package_purchase' ||
      tx.type === 'whatsapp_package' ||
      tx.type === 'authorize_package' ||
      tx.type === 'unlock_mpesa' ||
      tx.type === 'automation_package' ||
      tx.type === 'verified_agent' ||
      tx.type === 'universe_package' ||
      tx.type === 'investment_deposit' ||
      tx.type === 'withdrawal' ||
      tx.type === 'activation_fee' ||
      tx.type === 'cashback_fee' ||
      tx.type === 'tier_upgrade';

    const isPositive = isCredit && !isDebit;
    const rawAmt = typeof tx.amount === 'number' && !isNaN(tx.amount) ? Math.abs(tx.amount) : 0;
    const displayAmount = isPositive ? rawAmt : -rawAmt;

    // Smart Date / Time formatting
    const dateObj = new Date(tx.createdAt);
    const isValidDate = !isNaN(dateObj.getTime());

    let dateStr = '27 Aug 2026';
    let timeStr = '';
    if (isValidDate) {
      const now = new Date();
      const isToday =
        dateObj.getDate() === now.getDate() &&
        dateObj.getMonth() === now.getMonth() &&
        dateObj.getFullYear() === now.getFullYear();

      const isYesterday =
        new Date(now.getTime() - 86400000).getDate() === dateObj.getDate() &&
        dateObj.getMonth() === now.getMonth() &&
        dateObj.getFullYear() === now.getFullYear();

      timeStr = dateObj.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (isToday) {
        dateStr = `Today · ${timeStr}`;
      } else if (isYesterday) {
        dateStr = `Yesterday · ${timeStr}`;
      } else {
        dateStr = `${dateObj.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}`;
      }
    }

    // Precise Category Label
    let categoryLabel = tx.description || 'Commission';
    if (tx.type === 'deposit') categoryLabel = tx.description || 'Recharge Deposit (M-Pesa STK)';
    else if (tx.type === 'whatsapp_views_earning') categoryLabel = tx.description || 'WhatsApp Status Views Earning';
    else if (tx.type === 'package_purchase' || tx.type === 'whatsapp_package') categoryLabel = tx.description || 'Package purchase';
    else if (tx.type === 'cashback_claim') categoryLabel = tx.description || 'Cashback Bonus Claim';
    else if (tx.type === 'referral_bonus') categoryLabel = tx.description || 'Referral Commission';
    else if (tx.type === 'investment_yield') categoryLabel = tx.description || 'Investment 300% Yield Harvest';
    else if (tx.type === 'investment_deposit') categoryLabel = tx.description || 'Investment Capital Deployed';
    else if (tx.type === 'spin_reward') categoryLabel = tx.description || 'Lucky Wheel Spin Reward';
    else if (tx.type === 'withdrawal') categoryLabel = tx.description || 'M-Pesa Cashout Withdrawal';
    else if (tx.type === 'activation_fee') categoryLabel = tx.description || 'Account Activation Fee';

    // Status format
    let statusText = 'Completed';
    if (tx.status === 'pending') statusText = 'Pending';
    else if (tx.status === 'failed' || tx.status === 'rejected') statusText = 'Failed';
    else if (tx.status === 'processing') statusText = 'Processing';

    return {
      id: tx.id,
      date: dateStr,
      time: timeStr,
      category: categoryLabel,
      amount: displayAmount,
      isPositive,
      status: statusText,
      mpesaReceiptNo: tx.mpesaReceiptNo,
    };
  });

  return (
    <div className="space-y-4 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto pb-10">
      {/* 1. GREEN WELCOME NOTIFICATION BANNER (Exact Match to Screenshot) */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl ${
          isDarkMode
            ? 'bg-[#0a271f]/90 border-[#10b981]/40 text-emerald-300'
            : 'bg-[#d8f5e7] border-[#86efac] text-[#14532d]'
        } border font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xs`}
      >
        <span>✅</span>
        <span>Welcome back, {displayName}!</span>
      </div>

      {/* 2. WELCOME BACK SECTION HEADER */}
      <div className="px-1 py-1">
        <h1
          className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#0f172a]'
          }`}
        >
          Welcome back
        </h1>
        <p
          className={`text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          } mt-0.5`}
        >
          Your WhatsApp wallets and recent activity.
        </p>
      </div>

      {/* 3. PLATFORM LIVE ACTIVITY MARQUEE (Sliding small line from right to left beneath welcome back) */}
      <div
        className={`relative overflow-hidden rounded-full py-2 px-3 border ${
          isDarkMode
            ? 'bg-[#0b1626]/80 border-[#1b2f4c] text-slate-300'
            : 'bg-white/90 border-slate-200/90 text-slate-700'
        } shadow-xs backdrop-blur-xs flex items-center`}
      >
        {/* Subtle Edge Fade Gradients */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#070e1b] to-transparent'
              : 'bg-gradient-to-r from-[#fdebee] sm:from-white to-transparent'
          }`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none ${
            isDarkMode
              ? 'bg-gradient-to-l from-[#070e1b] to-transparent'
              : 'bg-gradient-to-l from-[#fdebee] sm:from-white to-transparent'
          }`}
        />

        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-xs font-medium">
          {/* Double repeat for seamless infinite loop */}
          {[...botActivities, ...botActivities].map((item, idx) => (
            <div key={`${item.id}_${idx}`} className="inline-flex items-center gap-2">
              <span className="text-slate-400">•</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {item.memberName || 'Member'}
              </span>
              <span
                className={
                  item.actionTitle?.includes('withdrew')
                    ? 'text-amber-500 font-semibold'
                    : 'text-emerald-500 font-semibold'
                }
              >
                {item.actionTitle}
              </span>
              <span className="font-mono font-bold text-amber-500">
                KES {(item.amount || 0).toLocaleString()}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                {item.phone} · {item.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. VIRTUAL DEBIT / PLATINUM MEMBER CARD (Exact Match to Screenshots) */}
      <div
        onClick={() => onSwitchView('whatsappEarningsView')}
        className="relative overflow-hidden rounded-[26px] p-6 sm:p-7 text-white border border-[#1d3354]/70 bg-gradient-to-br from-[#0c2b3d] via-[#103d4c] to-[#2d1b38] shadow-2xl transition-transform active:scale-[0.99] cursor-pointer group"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Card Row: Brand & Gold EMV Chip + Contactless Wave */}
        <div className="flex items-center justify-between relative z-10">
          <div className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1">
            <span className="text-white font-black tracking-wider uppercase">ENEZA EARNINGS</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Gold EMV Chip */}
            <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-100 via-amber-300 to-amber-600 border border-amber-200/80 shadow-md relative overflow-hidden flex items-center justify-center p-1">
              <div className="w-full h-full border border-amber-900/30 rounded-xs grid grid-cols-2 gap-0.5 opacity-50">
                <div className="border-r border-b border-amber-900/30"></div>
                <div className="border-b border-amber-900/30"></div>
                <div className="border-r border-amber-900/30"></div>
                <div></div>
              </div>
            </div>

            {/* Contactless Wave Icon */}
            <div className="flex items-center gap-0.5 text-amber-200/70 pl-1">
              <svg
                className="w-5 h-5 text-amber-200/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.828 7.172a4 4 0 015.656 0 M7 4.343a8 8 0 0111.314 0 M12.657 10a1.5 1.5 0 012.121 0"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Username Block */}
        <div className="mt-5 relative z-10">
          <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-400">
            USERNAME
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-0.5 tracking-tight">
            {displayName}
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-b border-white/10 my-4 relative z-10" />

        {/* Account Number */}
        <div className="relative z-10">
          <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-400">
            ACCOUNT NUMBER
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-slate-200 tracking-[0.2em] mt-0.5">
            {eeAccountNumber}
          </div>
        </div>

        {/* WhatsApp Balance & Copy Button */}
        <div className="mt-4 flex items-end justify-between relative z-10">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-400">
              WHATSAPP BALANCE
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
              KES {Math.floor(effectiveWhatsAppBalance)}
            </div>
          </div>

          <button
            onClick={handleCopyAccount}
            type="button"
            className="text-[10px] font-black tracking-widest text-slate-400 hover:text-white uppercase transition pb-1 cursor-pointer"
          >
            {copiedAccount ? 'COPIED!' : 'TAP TO COPY'}
          </button>
        </div>
      </div>

      {/* 5. WHATSAPP EARNING (Sky Blue / Cyan Gradient Card - Exact Match) */}
      <div
        onClick={() => onSwitchView('whatsappEarningsView')}
        className="relative overflow-hidden rounded-[26px] p-6 text-white bg-gradient-to-r from-[#0084FF] via-[#0094FF] to-[#0060E6] shadow-xl shadow-blue-500/25 transition-transform active:scale-[0.99] cursor-pointer group"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="w-8 h-8 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black tracking-wider backdrop-blur-xs font-mono">
            KSH
          </span>
        </div>

        <div className="mt-4 relative z-10">
          <div className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
            WHATSAPP EARNING
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
            {formatCurrency(effectiveWhatsAppBalance)}
          </div>
          <div className="text-xs text-white/90 mt-2 font-medium">
            Views × rate · auto payouts
          </div>
        </div>

        {/* Ambient background glow inside card */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-cyan-300/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 6. WHATSAPP WITHDRAWAL (Pink / Magenta Gradient Card - Exact Match) */}
      <div
        onClick={onOpenWithdraw}
        className="relative overflow-hidden rounded-[26px] p-6 text-white bg-gradient-to-r from-[#d946ef] via-[#ec4899] to-[#f43f5e] shadow-xl shadow-pink-500/25 transition-transform active:scale-[0.99] cursor-pointer group"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="w-8 h-8 flex items-center justify-center">
            <Lock className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black tracking-wider backdrop-blur-xs font-mono">
            KSH
          </span>
        </div>

        <div className="mt-4 relative z-10">
          <div className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
            WHATSAPP WITHDRAWAL
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
            {formatCurrency(user.totalWithdrawn || 0)}
          </div>
          <div className="text-xs text-white/90 mt-2 font-medium">
            {user.pendingBalance && user.pendingBalance > 0
              ? `Pending KES ${user.pendingBalance.toLocaleString()}`
              : 'No active withdrawal'}
          </div>
        </div>

        {/* Ambient background glow inside card */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-rose-300/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 7. DEPOSIT BALANCE (Emerald / Bright Green Gradient Card - Exact Match) */}
      <div
        onClick={onOpenDeposit}
        className="relative overflow-hidden rounded-[26px] p-6 text-white bg-gradient-to-r from-[#059669] via-[#10b981] to-[#22c55e] shadow-xl shadow-emerald-500/25 transition-transform active:scale-[0.99] cursor-pointer group"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="w-8 h-8 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black tracking-wider backdrop-blur-xs font-mono">
            KSH
          </span>
        </div>

        <div className="mt-4 relative z-10">
          <div className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
            DEPOSIT BALANCE
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
            {formatCurrency(user.depositBalance || 0)}
          </div>
          <div className="text-xs text-white/90 mt-2 font-medium">
            Buy packs · cash-out gate
          </div>
        </div>

        {/* Ambient background glow inside card */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-green-300/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 8. CASHBACK BALANCE (Purple / Violet Gradient Card - Exact Match) */}
      <div
        onClick={() => onSwitchView('cashbackBonusView')}
        className="relative overflow-hidden rounded-[26px] p-6 text-white bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#ec4899] shadow-xl shadow-purple-500/25 transition-transform active:scale-[0.99] cursor-pointer group"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="w-8 h-8 flex items-center justify-center">
            <Gift className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black tracking-wider backdrop-blur-xs font-mono">
            KSH
          </span>
        </div>

        <div className="mt-4 relative z-10">
          <div className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
            CASHBACK BALANCE
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
            {formatCurrency(user.pendingCashbackTotal || 0)}
          </div>
          <div className="text-xs text-white/90 mt-2 font-medium">
            Pending · claims KES 0
          </div>
        </div>

        {/* Ambient background glow inside card */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-pink-300/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 9. RECENT TRANSACTIONS TABLE (Exact Match to Screenshot 7 - Real Dynamic Transaction Data) */}
      <div
        className={`${
          isDarkMode
            ? 'bg-[#0b1626] border-[#1b2f4c]'
            : 'bg-white/95 border-slate-200/90'
        } border rounded-[26px] p-5 sm:p-6 shadow-xs space-y-4 transition-all duration-300`}
      >
        <div className="flex items-center justify-between">
          <h2
            className={`text-xl font-black tracking-tight ${
              isDarkMode ? 'text-zinc-100' : 'text-slate-900'
            }`}
          >
            Recent Transactions
          </h2>
          <button
            onClick={() => onSwitchView('cashierView')}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View Statement</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table Container */}
        <div className="w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-[11px] font-bold tracking-wider uppercase text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="col-span-6 sm:col-span-5">DATE & DESCRIPTION</div>
            <div className="col-span-3 sm:col-span-4 text-right sm:text-left">AMOUNT</div>
            <div className="col-span-3 text-right">STATUS</div>
          </div>

          {/* Table Rows */}
          {userRecentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {userRecentTransactions.map((tx) => {
                let statusBadgeClasses = isDarkMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-[#d8f5e7] text-[#15803d]';

                if (tx.status === 'Pending') {
                  statusBadgeClasses = isDarkMode
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-amber-100 text-amber-800';
                } else if (tx.status === 'Processing') {
                  statusBadgeClasses = isDarkMode
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-blue-100 text-blue-800';
                } else if (tx.status === 'Failed') {
                  statusBadgeClasses = isDarkMode
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-rose-100 text-rose-800';
                }

                return (
                  <div
                    key={tx.id}
                    className="py-3.5 grid grid-cols-12 items-center gap-2 text-xs"
                  >
                    {/* Date & Category */}
                    <div className="col-span-6 sm:col-span-5 pr-1">
                      <div className="font-bold text-slate-900 dark:text-zinc-100 truncate">
                        {tx.date}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5 font-medium truncate">
                        {tx.category}
                      </div>
                      {tx.mpesaReceiptNo && (
                        <div className="mt-1">
                          <span className="inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {tx.mpesaReceiptNo}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div
                      className={`col-span-3 sm:col-span-4 font-mono font-bold text-xs sm:text-sm text-right sm:text-left ${
                        tx.isPositive
                          ? 'text-[#10b981]'
                          : 'text-[#ef4444]'
                      }`}
                    >
                      {tx.isPositive ? '+KES ' : '-KES '}{Math.abs(tx.amount).toLocaleString()}
                    </div>

                    {/* Status Pill Badge */}
                    <div className="col-span-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold ${statusBadgeClasses}`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs text-slate-400 font-medium">
                No recent transactions recorded on your account yet.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={onOpenDeposit}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Deposit via M-Pesa
                </button>
                <button
                  onClick={() => onSwitchView('whatsappPostView')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition"
                >
                  Post WhatsApp Ad
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
