import React from 'react';
import { User } from '../types';
import {
  X,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

export type AppView =
  | 'userDashboardView'
  | 'whatsappPackagesView'
  | 'cashbackBonusView'
  | 'whatsappEarningsView'
  | 'authorizePackageView'
  | 'unlockMpesaView'
  | 'automationPackageView'
  | 'verifiedAgentView'
  | 'universePackageView'
  | 'investmentPlansView'
  | 'spinWheelView'
  | 'referralsView'
  | 'cashierView'
  | 'ledgerView'
  | 'adminDashboardView';

interface SidebarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  currentUser: User;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingTasksCount: number;
  pendingCashbackCount?: number;
  adminVerificationUnlocked: boolean;
  onToggleAdminVerification: () => void;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  isDarkMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  adminVerificationUnlocked,
  onOpenDeposit,
  onOpenWithdraw,
  isDarkMode = false,
}) => {
  const isAdmin = currentUser.role === 'admin' || adminVerificationUnlocked;

  const navItems = [
    {
      id: 'userDashboardView' as AppView,
      label: 'Dashboard',
      customIcon: <span className="text-base">🏠</span>,
      isHighlight: currentView === 'userDashboardView',
      textColor: 'text-slate-800 font-semibold',
    },
    {
      id: 'whatsappEarningsView' as AppView,
      label: 'WhatsApp Earn',
      customIcon: <span className="text-base">💬</span>,
      textColor: 'text-emerald-500 font-bold',
    },
    {
      id: 'whatsappPackagesView' as AppView,
      label: 'WhatsApp Program',
      customIcon: <span className="text-base">⚡</span>,
      textColor: 'text-pink-500 font-semibold',
    },
    {
      id: 'cashbackBonusView' as AppView,
      label: 'Cashback Bonus',
      customIcon: <span className="text-base">🎁</span>,
      badgeText: (currentUser.pendingCashbackTotal || 0) > 0 ? `KES ${(currentUser.pendingCashbackTotal || 0).toLocaleString()}` : undefined,
      textColor: 'text-purple-600 font-bold',
    },
    {
      id: 'cashierView' as AppView,
      label: 'Recharge',
      customIcon: <span className="text-base">💳</span>,
      textColor: 'text-slate-700 font-medium',
      action: onOpenDeposit,
    },
    {
      id: 'cashierView' as AppView,
      label: 'Withdraw',
      customIcon: <span className="text-base">🏦</span>,
      textColor: 'text-slate-700 font-medium',
      action: onOpenWithdraw,
    },
    {
      id: 'investmentPlansView' as AppView,
      label: 'Investments',
      customIcon: <span className="text-base">📈</span>,
      textColor: 'text-slate-700 font-medium',
    },
    {
      id: 'automationPackageView' as AppView,
      label: 'Automation',
      customIcon: <span className="text-base">🤖</span>,
      textColor: 'text-purple-600 font-semibold',
    },
    {
      id: 'verifiedAgentView' as AppView,
      label: 'Verified Agent',
      customIcon: <span className="text-base">🛡️</span>,
      textColor: 'text-amber-600 font-semibold',
    },
    {
      id: 'universePackageView' as AppView,
      label: 'Universe',
      customIcon: <span className="text-base">🌌</span>,
      textColor: 'text-indigo-600 font-semibold',
    },
    {
      id: 'referralsView' as AppView,
      label: 'Profile',
      customIcon: <span className="text-base">👤</span>,
      textColor: 'text-slate-700 font-medium',
    },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
        />
      )}

      {/* Slide-over Drawer / Sidebar */}
      <aside
        id="sidebarMenu"
        className={`fixed inset-y-0 left-0 z-50 w-72 ${
          isDarkMode ? 'bg-zinc-950 text-zinc-100 border-zinc-800' : 'bg-white text-slate-800 border-slate-200/80'
        } shadow-2xl border-r flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 flex-1 flex flex-col overflow-y-auto">
          {/* Header Brand */}
          <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
            <button
              onClick={() => {
                onSelectView('userDashboardView');
                onCloseMobile();
              }}
              className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-1 group cursor-pointer`}
            >
              <span className="font-black">Eneza</span>
              <span className="text-[#FF486B] font-black">Earnings</span>
            </button>

            <button
              onClick={onCloseMobile}
              className={`p-1.5 rounded-xl border ${
                isDarkMode
                  ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'border-slate-200/80 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              } transition cursor-pointer`}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 py-1 flex-1">
            {navItems.map((item, idx) => {
              const isActive = currentView === item.id && item.label === 'Dashboard';
              return (
                <button
                  key={`${item.id}-${item.label}-${idx}`}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    }
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[14px] transition text-left group cursor-pointer ${
                    isActive
                      ? isDarkMode
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold shadow-xs'
                        : 'bg-gradient-to-r from-pink-50/70 via-sky-50/70 to-teal-50/70 border border-slate-200/90 text-slate-900 font-semibold shadow-xs'
                      : isDarkMode
                      ? 'hover:bg-zinc-900 text-zinc-300 font-normal'
                      : 'hover:bg-slate-50/90 text-slate-700 font-normal'
                  }`}
                >
                  <div className="w-5 flex items-center justify-center shrink-0">
                    {item.customIcon}
                  </div>
                  <span className={`flex-1 ${isDarkMode ? 'text-zinc-200' : (item.textColor || 'text-slate-800')}`}>
                    {item.label}
                  </span>
                  {item.badgeText && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-[10px] font-bold border border-purple-500/30">
                      {item.badgeText}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Management Section if Admin */}
            {isAdmin && (
              <div className={`pt-3 mt-2 border-t ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
                <button
                  onClick={() => {
                    onSelectView('adminDashboardView');
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[14px] transition text-left cursor-pointer ${
                    currentView === 'adminDashboardView'
                      ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                      : isDarkMode
                      ? 'text-amber-400 hover:bg-zinc-900 font-medium'
                      : 'text-amber-600 hover:bg-amber-50/60 font-medium'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Admin Control Center</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* User Footer with Quick Actions */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-zinc-800 bg-zinc-900/80' : 'border-slate-100 bg-slate-50/70'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="truncate">
                <div className={`text-xs font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'} truncate`}>
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} truncate font-mono`}>
                  {currentUser.phone}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log out"
              className={`p-2 rounded-xl ${isDarkMode ? 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'} transition cursor-pointer`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
