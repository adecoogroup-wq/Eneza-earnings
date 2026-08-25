import React, { useState } from 'react';
import { User } from '../types';
import { PIPELINE_PACKAGES } from '../data/mockData';
import {
  Globe,
  Sparkles,
  Zap,
  CheckCircle2,
  Gift,
  Check,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AppView } from './Sidebar';

interface UniversePackageViewProps {
  currentUser: User;
  onActivateUniverse: () => void;
  onSwitchView: (view: AppView) => void;
}

export const UniversePackageView: React.FC<UniversePackageViewProps> = ({
  currentUser,
  onActivateUniverse,
  onSwitchView,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const pkg = PIPELINE_PACKAGES.universe;
  const isPurchased = currentUser.isUniversePackagePurchased;

  const handleActivate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onActivateUniverse();
      setIsProcessing(false);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 border border-indigo-500/40 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" />
            <span>Universe Elite Network</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Universe Package
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            {pkg.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Full Executive Direct Cashout Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Includes KES 14,000 Guaranteed Cashback</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Card */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
              Universe Node Price
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              KES {(pkg?.price || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <Gift className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Universe Cashback Bonus Pool
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
            Universe Privileges & Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            {pkg.features.map((feat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
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
                <Check className="w-4 h-4" /> Universe Package Active & Verified!
              </span>
            ) : (
              <span>Instant Lipa Na M-Pesa automated activation.</span>
            )}
          </div>

          {isPurchased ? (
            <button
              onClick={() => onSwitchView('cashierView')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Go to Cashier & Withdraw</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-950/40 cursor-pointer"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Activating Universe Package...
                </span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Activate Universe Package (KES {(pkg?.price || 0).toLocaleString()})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
