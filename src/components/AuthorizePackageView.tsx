import React, { useState } from 'react';
import { User } from '../types';
import { PIPELINE_PACKAGES } from '../data/mockData';
import {
  Award,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Gift,
  Check,
  ArrowRight,
  Sparkles,
  Wallet,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import { AppView } from './Sidebar';

interface AuthorizePackageViewProps {
  currentUser: User;
  onActivateAuthorize: () => void;
  onOpenDeposit?: (amount?: number) => void;
  onSwitchView: (view: AppView) => void;
}

export const AuthorizePackageView: React.FC<AuthorizePackageViewProps> = ({
  currentUser,
  onActivateAuthorize,
  onOpenDeposit,
  onSwitchView,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const pkg = PIPELINE_PACKAGES.authorize;
  const isPurchased = currentUser.isAuthorizedPackagePurchased;
  const userDepositBalance = currentUser.depositBalance || 0;
  const hasEnoughDeposit = userDepositBalance >= pkg.price;
  const shortfall = Math.max(0, pkg.price - userDepositBalance);

  const handleActivate = () => {
    if (!hasEnoughDeposit && onOpenDeposit) {
      onOpenDeposit(shortfall);
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onActivateAuthorize();
      setIsProcessing(false);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-zinc-900 to-zinc-950 border border-blue-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Official Network Authorization</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Authorize VIP Package
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            {pkg.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safaricom M-Pesa Certified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant KES {(pkg?.cashbackBonus || 0).toLocaleString()} Cashback Bonus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Deposit Status Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Available Deposit Balance</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              KES {userDepositBalance.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-400 font-medium">
          {hasEnoughDeposit ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Ready to buy using available deposit
            </span>
          ) : (
            <button
              onClick={() => onOpenDeposit && onOpenDeposit(shortfall)}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Deposit KES {shortfall.toLocaleString()} to Buy</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Action Card */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
              Authorization Package Price
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              KES {(pkg?.price || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <Gift className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Guaranteed Cashback Bonus
              </span>
              <span className="text-xl font-extrabold font-mono text-amber-300">
                +KES {(pkg?.cashbackBonus || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Authorization Privileges & Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            {pkg.features.map((feat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase / Status Action Area */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400">
            {isPurchased ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Package Active & Verified!
              </span>
            ) : hasEnoughDeposit ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Deducts KES {pkg.price.toLocaleString()} from available deposit.
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Top up KES {shortfall.toLocaleString()} to complete purchase.
              </span>
            )}
          </div>

          {isPurchased ? (
            <button
              onClick={() => onSwitchView('whatsappEarningsView')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Go to WhatsApp Earnings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={isProcessing}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] cursor-pointer ${
                hasEnoughDeposit
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-blue-950/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Activating Package with Deposit...
                </span>
              ) : hasEnoughDeposit ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Buy with Available Deposit (KES {(pkg?.price || 0).toLocaleString()})</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Deposit KES {shortfall.toLocaleString()} to Activate</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
