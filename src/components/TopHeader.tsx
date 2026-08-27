import React from 'react';
import { User } from '../types';
import { Menu, Moon, Sun, Bell, ArrowUpRight, Plus, Wallet } from 'lucide-react';
import { AppView } from './Sidebar';

interface TopHeaderProps {
  currentUser: User;
  currentView?: AppView;
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
  currentView = 'userDashboardView',
  onOpenMobileSidebar,
  onOpenDeposit,
  onOpenWithdraw,
  onSwitchView,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const userInitial = currentUser?.firstName
    ? currentUser.firstName.charAt(0).toUpperCase()
    : 'C';

  // Determine dynamic title and subtitle matching user screenshots
  let headerTitle = 'EarnWave Solutions';
  let headerSubtitle = 'Welcome back · your WhatsApp wallets';

  if (currentView === 'whatsappPackagesView') {
    headerTitle = 'Activation';
    headerSubtitle = 'WhatsApp packages · 2× cashback';
  } else if (currentView === 'cashierView') {
    headerTitle = 'Recharge';
    headerSubtitle = 'Fund deposit via M-Pesa Swift Wallet';
  } else if (currentView === 'whatsappEarningsView') {
    headerTitle = 'WhatsApp Earn';
    headerSubtitle = 'Submit views · auto payout';
  } else if (currentView === 'cashbackBonusView') {
    headerTitle = 'Cashback Bonus';
    headerSubtitle = '200% instant cashback rewards';
  } else if (currentView === 'referralsView') {
    headerTitle = 'Referrals';
    headerSubtitle = 'Invite friends · earn commission';
  } else if (currentView === 'investmentPlansView') {
    headerTitle = 'Investments';
    headerSubtitle = 'High yield daily growth plans';
  } else if (currentView === 'spinWheelView') {
    headerTitle = 'Lucky Wheel';
    headerSubtitle = 'Spin to win cash prizes';
  } else if (currentView === 'adminDashboardView') {
    headerTitle = 'Admin Console';
    headerSubtitle = 'Live platform management hub';
  }

  return (
    <header
      className={`sticky top-0 z-30 w-full ${
        isDarkMode
          ? 'bg-[#070e1b]/95 border-[#182a44] text-slate-100'
          : 'bg-white/85 border-slate-200/80 text-slate-900'
      } border-b backdrop-blur-md px-4 sm:px-6 py-3 transition-colors duration-200`}
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
              className={`text-base sm:text-lg font-black tracking-tight leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              {headerTitle}
            </h1>
            <p
              className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              } font-normal leading-tight hidden xs:block`}
            >
              {headerSubtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Night/Light Mode Toggle & Coral Profile Avatar */}
        <div className="flex items-center gap-2.5">
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
            className="w-10 h-10 rounded-full bg-[#FF3B30] text-white font-black text-sm flex items-center justify-center shadow-md shadow-rose-950/20 hover:opacity-90 transition cursor-pointer"
            title={`${currentUser?.firstName || 'Member'} (${currentUser?.username || ''})`}
          >
            {userInitial}
          </button>
        </div>
      </div>
    </header>
  );
};
