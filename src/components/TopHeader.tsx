import React from 'react';
import { User } from '../types';
import { Menu, Moon, Sun, Bell, ArrowUpRight, Plus, Wallet } from 'lucide-react';

interface TopHeaderProps {
  currentUser: User;
  onOpenMobileSidebar: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onSwitchView: (view: any) => void;
  currency: 'KES' | 'USD';
  onToggleCurrency: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  onOpenMobileSidebar,
  onOpenDeposit,
  onOpenWithdraw,
  onSwitchView,
  isDarkMode = true,
  onToggleDarkMode,
}) => {
  const userInitial = currentUser?.firstName
    ? currentUser.firstName.charAt(0).toUpperCase()
    : 'C';

  return (
    <header
      className={`sticky top-0 z-30 w-full ${
        isDarkMode
          ? 'bg-[#070e1b]/95 border-[#182a44] text-slate-100'
          : 'bg-white/85 border-slate-200/80 text-slate-900'
      } border-b backdrop-blur-md px-4 sm:px-6 py-3.5 transition-colors duration-200`}
    >
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left Side: Hamburger Menu & Brand Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className={`p-2.5 rounded-2xl border ${
              isDarkMode
                ? 'border-[#1b2f4c] bg-[#0b1626] text-white hover:bg-[#12223b]'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
            } transition shadow-xs cursor-pointer`}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div>
            <h1
              className={`text-base sm:text-lg font-black tracking-tight leading-tight flex items-center gap-1.5 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span>Eneza</span>
              <span className="text-[#FF386B]">Earnings</span>
            </h1>
            <p
              className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              } font-normal leading-tight hidden xs:block`}
            >
              Welcome back · your WhatsApp wallets
            </p>
          </div>
        </div>

        {/* Right Side: Night/Light Mode Toggle & Coral Profile Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Quick Action Buttons on desktop */}
          <div className="hidden sm:flex items-center gap-2 mr-1">
            <button
              onClick={onOpenDeposit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              onClick={onOpenWithdraw}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${
                isDarkMode
                  ? 'bg-[#0b1626] hover:bg-[#12223b] text-slate-200 border-[#1b2f4c]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              } border text-xs font-semibold transition cursor-pointer`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>Withdraw</span>
            </button>
          </div>

          {/* Theme Mode Toggle (Moon in Light mode, Sun in Dark mode) */}
          <button
            onClick={onToggleDarkMode}
            className={`w-10 h-10 rounded-full border ${
              isDarkMode
                ? 'border-[#1b2f4c] bg-[#0b1626] text-slate-200 hover:bg-[#12223b]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            } flex items-center justify-center transition shadow-xs cursor-pointer`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Theme mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 stroke-[2]" />
            )}
          </button>

          {/* Profile Circle Avatar with Coral/Red Background (Matching Screenshots) */}
          <button
            onClick={() => onSwitchView('referralsView')}
            className="w-10 h-10 rounded-full bg-[#FF486B] text-white font-black text-sm flex items-center justify-center shadow-md shadow-rose-950/20 hover:opacity-90 transition cursor-pointer"
            title={`${currentUser?.firstName || 'Member'} (${currentUser?.username || ''})`}
          >
            {userInitial}
          </button>
        </div>
      </div>
    </header>
  );
};
