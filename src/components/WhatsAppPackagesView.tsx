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
  Wallet,
  Smartphone,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { AppView } from './Sidebar';

interface WhatsAppPackagesViewProps {
  currentUser: User;
  onPurchasePackage?: (pkg: WhatsAppPackageItem) => void;
  onSelectPackage?: (pkg: WhatsAppPackageItem) => void;
  onOpenDeposit?: (amount?: number) => void;
  onSwitchView: (view: AppView) => void;
}

export const WhatsAppPackagesView: React.FC<WhatsAppPackagesViewProps> = ({
  currentUser,
  onPurchasePackage,
  onSelectPackage,
  onOpenDeposit,
  onSwitchView,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const userDepositBalance = currentUser.depositBalance || 0;

  const handleAction = (pkg: WhatsAppPackageItem) => {
    // If deposit balance is less than package price, prompt deposit first
    if (userDepositBalance < pkg.price) {
      const shortfall = pkg.price - userDepositBalance;
      if (onOpenDeposit) {
        onOpenDeposit(shortfall > 0 ? shortfall : pkg.price);
      } else if (onPurchasePackage) {
        onPurchasePackage(pkg);
      }
      return;
    }

    // Has sufficient deposit balance - proceed to purchase/activation
    setProcessingId(pkg.id);
    setTimeout(() => {
      if (onPurchasePackage) {
        onPurchasePackage(pkg);
      } else if (onSelectPackage) {
        onSelectPackage(pkg);
      }
      setProcessingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/70 via-zinc-900 to-zinc-950 border border-emerald-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Monetization Program</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              WhatsApp Broadcast Packages
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Monetize your WhatsApp status views at guaranteed{' '}
              <span className="text-emerald-400 font-bold">KES 100 per viewer</span>. Select a
              package below to activate your broadcast rights and receive an instant{' '}
              <span className="text-amber-400 font-bold">200% Cashback Bonus</span> credited to
              your account.
            </p>
          </div>

          {/* Current Package & Status */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 text-center shrink-0 w-full md:w-64 space-y-2 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Current Package
            </span>
            <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                {currentUser.activeWhatsAppPackage
                  ? WHATSAPP_PACKAGES.find((p) => p.id === currentUser.activeWhatsAppPackage)?.name ||
                    'Active Broadcaster'
                  : 'No Active Package'}
              </span>
            </span>

            {currentUser.activeWhatsAppPackage ? (
              <button
                type="button"
                onClick={() => onSwitchView('whatsappEarningsView')}
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 transition cursor-pointer"
              >
                Go to Today's Creative & Submit &rarr;
              </button>
            ) : (
              <span className="inline-block text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                Deposit Required to Activate
              </span>
            )}
          </div>
        </div>

        {/* Deposit Policy Notice Banner */}
        <div className="mt-5 p-4 rounded-xl bg-zinc-950/90 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Mandatory Deposit Policy
              </span>
              <p className="text-[11px] text-zinc-300 leading-snug">
                All users must deposit first before purchasing any WhatsApp package. Funds are
                credited to your <strong className="text-emerald-400">Deposit Balance</strong> via
                Lipa Na M-Pesa STK push.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block">
                Your Deposit Balance
              </span>
              <span className="text-sm font-mono font-extrabold text-emerald-400">
                KES {userDepositBalance.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenDeposit && onOpenDeposit(500)}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer shrink-0"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Deposit via M-Pesa</span>
            </button>
          </div>
        </div>

        {/* Security Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted M-Pesa Settlement • Automated 200% Cashback Vault</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Instant STK Push Gateway</span>
          </div>
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WHATSAPP_PACKAGES.map((pkg) => {
          const isCurrentActive = currentUser.activeWhatsAppPackage === pkg.id;
          const isProcessing = processingId === pkg.id;
          const hasSufficient = userDepositBalance >= pkg.price;
          const shortfall = Math.max(0, pkg.price - userDepositBalance);

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

                {/* Deposit Balance Eligibility Pill */}
                <div className="pt-1">
                  {hasSufficient ? (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Eligible for Instant Activation
                      </span>
                      <span className="text-zinc-300 font-mono">
                        KES {pkg.price.toLocaleString()} available
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Deposit Required
                      </span>
                      <span className="text-amber-300 font-mono font-bold">
                        Short by KES {shortfall.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                  <div className="text-zinc-400 font-medium mb-1">{pkg.adFrequency}</div>
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
                {hasSufficient ? (
                  <button
                    type="button"
                    onClick={() => handleAction(pkg)}
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer ${
                      isCurrentActive
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                        : pkg.id === 'premium_3000'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-lg shadow-amber-950/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Activating Package...
                      </span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>
                          {isCurrentActive
                            ? 'Renew / Upgrade Package'
                            : `Activate with Deposit Balance (KES ${pkg.price.toLocaleString()})`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAction(pkg)}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-950/30 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Deposit KES {shortfall.toLocaleString()} to Purchase</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works Policy Box */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>How WhatsApp Monetization & Deposits Work</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <span className="font-bold text-emerald-400 block">1. Deposit via M-Pesa STK</span>
            <p className="text-zinc-400 text-[11px]">
              Deposit the exact package amount into your Deposit Balance via instant Safaricom M-Pesa
              STK push prompt.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <span className="font-bold text-amber-400 block">2. Activate & Receive 200% Cashback</span>
            <p className="text-zinc-400 text-[11px]">
              Upon package activation, an instant 200% Cashback Bonus is credited directly into your
              Cashback Vault.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <span className="font-bold text-blue-400 block">3. Post Daily & Earn KES 100 / View</span>
            <p className="text-zinc-400 text-[11px]">
              Download sponsored creatives daily, post them to your WhatsApp status, and earn KES
              100 per status viewer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
