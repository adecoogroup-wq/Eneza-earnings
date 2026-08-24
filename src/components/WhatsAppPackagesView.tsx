import React, { useState } from 'react';
import { User, WhatsAppPackageItem } from '../types';
import { WHATSAPP_PACKAGES } from '../data/mockData';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Gift,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { AppView } from './Sidebar';

interface WhatsAppPackagesViewProps {
  currentUser: User;
  onPurchasePackage?: (pkg: WhatsAppPackageItem) => void;
  onSelectPackage?: (pkg: WhatsAppPackageItem) => void;
  onSwitchView: (view: AppView) => void;
}

export const WhatsAppPackagesView: React.FC<WhatsAppPackagesViewProps> = ({
  currentUser,
  onPurchasePackage,
  onSelectPackage,
  onSwitchView,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleBuy = (pkg: WhatsAppPackageItem) => {
    setProcessingId(pkg.id);
    setTimeout(() => {
      if (onPurchasePackage) {
        onPurchasePackage(pkg);
      } else if (onSelectPackage) {
        onSelectPackage(pkg);
      }
      setProcessingId(null);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/60 via-zinc-900 to-zinc-950 border border-emerald-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Monetization Program</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              WhatsApp Packages
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Monetize your WhatsApp status views at guaranteed <span className="text-emerald-400 font-bold">KES 100 per viewer</span>. Select a package below to activate your broadcast rights and receive an instant <span className="text-amber-400 font-bold">200% Cashback Bonus</span> credited to your account.
            </p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-center shrink-0 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Current Package</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5 mt-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              {currentUser.activeWhatsAppPackage
                ? WHATSAPP_PACKAGES.find(p => p.id === currentUser.activeWhatsAppPackage)?.name || 'Active Broadcaster'
                : 'No Active Package'}
            </span>
            <button
              onClick={() => onSwitchView('whatsappEarningsView')}
              className="mt-2 text-[11px] text-zinc-300 hover:text-white underline block mx-auto"
            >
              Go to Today's Ad & Submit Views &rarr;
            </button>
          </div>
        </div>

        {/* Security Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted M-Pesa Settlement • Automated Instant Payouts</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Program</span>
          </div>
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WHATSAPP_PACKAGES.map((pkg) => {
          const isCurrentActive = currentUser.activeWhatsAppPackage === pkg.id;
          const isProcessing = processingId === pkg.id;

          return (
            <div
              key={pkg.id}
              className={`relative rounded-2xl bg-zinc-900/90 border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                pkg.id === 'premium_3000'
                  ? 'border-amber-500/50 shadow-lg shadow-amber-950/20'
                  : 'border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              {pkg.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-black font-extrabold text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                  {pkg.badge}
                </div>
              )}

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-white">
                      KES {(pkg.price || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500">/ package</span>
                  </div>
                </div>

                {/* 200% Cashback Highlight */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">200% Cashback Bonus</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-amber-400">
                    +KES {(pkg.cashbackBonus || 0).toLocaleString()}
                  </span>
                </div>

                {/* Features list */}
                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                  <div className="text-zinc-400 font-medium mb-1">
                    {pkg.adFrequency}
                  </div>
                  <div className="space-y-1.5">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleBuy(pkg)}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] ${
                    isCurrentActive
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                      : pkg.id === 'premium_3000'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-lg shadow-amber-950/40'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Activating Package...
                    </span>
                  ) : (
                    <>
                      <span>{isCurrentActive ? 'Renew / Upgrade Package' : `Activate for KES ${(pkg.price || 0).toLocaleString()}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works Policy Box */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>How WhatsApp Monetization Works</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <span className="font-bold text-emerald-400 block">1. Instant Cashback Bonus</span>
            <p className="text-zinc-400 text-[11px]">
              Upon activating any package, you receive a guaranteed 200% Cashback Bonus credited directly to your account.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <span className="font-bold text-blue-400 block">2. Post & Earn KES 100 / View</span>
            <p className="text-zinc-400 text-[11px]">
              Download the daily creative graphic from the WhatsApp Earnings tab, post it to your status, and earn KES 100 per status viewer.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <span className="font-bold text-purple-400 block">3. Direct M-Pesa Payouts</span>
            <p className="text-zinc-400 text-[11px]">
              Transfer your earnings directly into your spendable balance for instant automated withdrawal to your M-Pesa wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
