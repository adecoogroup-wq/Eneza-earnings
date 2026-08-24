import React from 'react';
import { User, EarningTask, Transaction } from '../types';
import { LIVE_PAYOUTS } from '../data/mockData';
import {
  MessageSquare,
  ShoppingBag,
  CreditCard,
  Gift,
  ArrowUpRight,
  Plus,
  Eye,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  Smartphone,
  Crown,
} from 'lucide-react';
import { AppView } from './Sidebar';

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
  isDarkMode = true,
}) => {
  const [copiedAccount, setCopiedAccount] = React.useState(false);

  const formatCurrency = (amount?: number | null) => {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `KSH ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const displayName = user?.firstName || user?.username || 'Chris';
  const ewAccountNumber = `EW · 4399 · 5705`;

  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(ewAccountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

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

      {/* 3. VIRTUAL DEBIT / PLATINUM MEMBER CARD (Exact Match to Screenshots) */}
      <div
        onClick={() => onSwitchView('whatsappEarningsView')}
        className="relative overflow-hidden rounded-[26px] p-6 sm:p-7 text-white border border-[#1d3354]/70 bg-gradient-to-br from-[#0c2b3d] via-[#103d4c] to-[#2d1b38] shadow-2xl transition-transform active:scale-[0.99] cursor-pointer group"
      >
        {/* Subtle decorative glow & micro line textures */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Card Row: Brand & Gold EMV Chip + Contactless Wave */}
        <div className="flex items-center justify-between relative z-10">
          <div className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1">
            <span className="text-white font-black">Eneza</span>
            <span className="text-[#FF486B] font-black">Earnings</span>
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
              <svg className="w-5 h-5 text-amber-200/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.828 7.172a4 4 0 015.656 0 M7 4.343a8 8 0 0111.314 0 M12.657 10a1.5 1.5 0 012.121 0" />
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
            {ewAccountNumber}
          </div>
        </div>

        {/* WhatsApp Balance & Copy Button */}
        <div className="mt-4 flex items-end justify-between relative z-10">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-400">
              WHATSAPP BALANCE
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
              KES {Math.floor(user.whatsappBalance || 0)}
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

      {/* 4. WHATSAPP EARNING (Electric Cyan-Blue Card - Exact Match) */}
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
            {formatCurrency(user.whatsappBalance || 0)}
          </div>
          <div className="text-xs text-white/90 mt-2 font-medium">
            Views × rate · auto payouts
          </div>
        </div>

        {/* Ambient background glow inside card */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-cyan-300/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 5. WHATSAPP WITHDRAWAL (Pink / Magenta Card) */}
      <div
        onClick={onOpenWithdraw}
        className="relative overflow-hidden rounded-[26px] p-6 text-white bg-gradient-to-r from-[#FF2B6D] via-[#FF3B7A] to-[#D81B5B] shadow-xl shadow-pink-500/25 transition-transform active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="w-8 h-8 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white stroke-[2.2]" />
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
            {(user.pendingBalance || 0) > 0 ? `Pending KES ${(user.pendingBalance || 0).toLocaleString()}` : 'Direct to M-Pesa · instant'}
          </div>
        </div>
      </div>

      {/* 6. DEPOSIT BALANCE (Green Gradient) */}
      <div
        onClick={onOpenDeposit}
        className="relative overflow-hidden rounded-[26px] p-6 text-white bg-gradient-to-r from-[#10b981] via-[#22c55e] to-[#84cc16] shadow-xl shadow-green-500/25 transition-transform active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black tracking-wider backdrop-blur-xs font-mono">
            KSH
          </span>
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
            DEPOSIT BALANCE
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
            {formatCurrency(user.balance || 0)}
          </div>
          <div className="text-xs text-white/90 mt-2 font-medium">
            Buy packs · cash-out gate
          </div>
        </div>
      </div>

      {/* 7. Quick Action Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <button
          onClick={() => onSwitchView('whatsappEarningsView')}
          className={`p-3.5 rounded-2xl ${
            isDarkMode
              ? 'bg-[#0b1626] border-[#1b2f4c] hover:border-blue-500/50 hover:bg-[#11233d] text-zinc-100'
              : 'bg-white/90 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-slate-800'
          } border text-left transition shadow-xs group cursor-pointer`}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <Eye className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold">Post & Earn</div>
          <div className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} mt-0.5`}>100/= per view</div>
        </button>

        <button
          onClick={() => onSwitchView('whatsappPackagesView')}
          className={`p-3.5 rounded-2xl ${
            isDarkMode
              ? 'bg-[#0b1626] border-[#1b2f4c] hover:border-pink-500/50 hover:bg-[#11233d] text-zinc-100'
              : 'bg-white/90 border-slate-200 hover:border-pink-400 hover:bg-pink-50/30 text-slate-800'
          } border text-left transition shadow-xs group cursor-pointer`}
        >
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold">WA Packages</div>
          <div className="text-[11px] text-pink-500 font-semibold mt-0.5">200% Cashback</div>
        </button>

        <button
          onClick={onOpenDeposit}
          className={`p-3.5 rounded-2xl ${
            isDarkMode
              ? 'bg-[#0b1626] border-[#1b2f4c] hover:border-emerald-500/50 hover:bg-[#11233d] text-zinc-100'
              : 'bg-white/90 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-slate-800'
          } border text-left transition shadow-xs group cursor-pointer`}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <Plus className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold">Recharge</div>
          <div className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} mt-0.5`}>M-Pesa STK push</div>
        </button>

        <button
          onClick={onOpenWithdraw}
          className={`p-3.5 rounded-2xl ${
            isDarkMode
              ? 'bg-[#0b1626] border-[#1b2f4c] hover:border-purple-500/50 hover:bg-[#11233d] text-zinc-100'
              : 'bg-white/90 border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 text-slate-800'
          } border text-left transition shadow-xs group cursor-pointer`}
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold">Withdraw</div>
          <div className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} mt-0.5`}>Instant B2C Payout</div>
        </button>
      </div>

      {/* 8. PLATFORM LIVE ACTIVITY */}
      <div
        className={`${
          isDarkMode
            ? 'bg-[#0b1626] border-[#1b2f4c]'
            : 'bg-white/95 border-slate-200/90'
        } border rounded-[26px] p-6 shadow-xs space-y-4`}
      >
        <div className="flex items-center justify-between">
          <h2
            className={`text-lg font-black tracking-tight ${
              isDarkMode ? 'text-zinc-100' : 'text-slate-900'
            }`}
          >
            Platform live activity
          </h2>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>

        <div
          className={`divide-y ${
            isDarkMode ? 'divide-[#182a44]' : 'divide-slate-100'
          } text-xs`}
        >
          {LIVE_PAYOUTS.slice(0, 6).map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-2 first:pt-1 last:pb-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  KES
                </div>
                <div>
                  <div
                    className={`font-semibold ${
                      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
                    }`}
                  >
                    Member {item.phone}
                  </div>
                  <div
                    className={`text-[11px] ${
                      isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                    }`}
                  >
                    Direct M-Pesa B2C Cashout · {item.timeAgo}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-black text-emerald-500 text-sm">
                  +KES {(item.amount || 0).toLocaleString()}
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isDarkMode
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-emerald-50 text-emerald-700'
                  } font-semibold`}
                >
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
