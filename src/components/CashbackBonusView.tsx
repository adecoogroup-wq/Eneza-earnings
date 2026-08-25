import React, { useState } from 'react';
import { User, CashbackItem } from '../types';
import {
  Gift,
  Sparkles,
  Unlock,
  CheckCircle2,
  X,
  Smartphone,
  Check,
  ArrowRight,
  ShieldCheck,
  Wallet,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppView } from './Sidebar';

interface CashbackBonusViewProps {
  currentUser: User;
  cashbackItems: CashbackItem[];
  onClaimCashback: (item: CashbackItem) => void;
  onClaimAllCashback: () => void;
  onOpenDeposit: (amount?: number) => void;
  onSwitchView: (view: AppView) => void;
}

export const CashbackBonusView: React.FC<CashbackBonusViewProps> = ({
  currentUser,
  cashbackItems,
  onClaimCashback,
  onClaimAllCashback,
  onOpenDeposit,
  onSwitchView,
}) => {
  const [selectedClaimItem, setSelectedClaimItem] = useState<CashbackItem | 'all' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const pendingItems = cashbackItems.filter((i) => i.status === 'pending_unlock');
  const unlockedItems = cashbackItems.filter((i) => i.status === 'unlocked');

  const totalPendingCashback = pendingItems.reduce((acc, curr) => acc + curr.cashbackAmount, 0);
  const totalRequired40Fee = pendingItems.reduce((acc, curr) => acc + (curr.unlockFeeRequired || Math.round(curr.cashbackAmount * 0.4)), 0);

  const userDepositBalance = currentUser.depositBalance || 0;

  const currentFee = selectedClaimItem === 'all'
    ? totalRequired40Fee
    : selectedClaimItem
    ? (selectedClaimItem.unlockFeeRequired || Math.round(selectedClaimItem.cashbackAmount * 0.4))
    : 0;

  const currentBonusAmount = selectedClaimItem === 'all'
    ? totalPendingCashback
    : selectedClaimItem
    ? selectedClaimItem.cashbackAmount
    : 0;

  const handleExecuteClaim = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (userDepositBalance < currentFee) {
      const shortfall = currentFee - userDepositBalance;
      onOpenDeposit(shortfall);
      setSelectedClaimItem(null);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      if (selectedClaimItem === 'all') {
        onClaimAllCashback();
      } else if (selectedClaimItem) {
        onClaimCashback(selectedClaimItem);
      }

      setIsProcessing(false);
      setClaimSuccess(true);

      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#ffffff', '#3b82f6']
        });
      } catch {
        // ignore
      }
    }, 1200);
  };

  const handleCloseModal = () => {
    setSelectedClaimItem(null);
    setClaimSuccess(false);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <Gift className="w-3.5 h-3.5" />
            <span>Cashback Bonus Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cashback Bonus
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            All Cashback must be claimed with <strong className="text-amber-300">40% of the Cashback bonus</strong> (e.g. KES 6,000 bonus is claimed with KES 2,400). The 40% must be deposited to your account, then you will be able to claim your full cashback bonus with your deposit balance.
          </p>
        </div>
      </div>

      {/* Account Deposit Balance Status Strip */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Your Active Deposit Balance</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              KES {userDepositBalance.toLocaleString()}
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenDeposit()}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Deposit to Account via M-Pesa</span>
        </button>
      </div>

      {/* Main Cashback Items Area */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Available Cashback Bonuses</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pending bonuses ready to be claimed with 40% deposit balance.
            </p>
          </div>

          {pendingItems.length > 1 && (
            <button
              onClick={() => setSelectedClaimItem('all')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Claim All ({pendingItems.length})</span>
            </button>
          )}
        </div>

        {pendingItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white">All Cashback Bonuses Claimed!</div>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Activate additional WhatsApp or Pipeline packages to unlock new cashback bonus rewards.
            </p>
            <button
              onClick={() => onSwitchView('whatsappPackagesView')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Explore Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingItems.map((item) => {
              const req40 = item.unlockFeeRequired || Math.round(item.cashbackAmount * 0.4);
              const hasEnoughDeposit = userDepositBalance >= req40;
              const shortfall = Math.max(0, req40 - userDepositBalance);

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 hover:border-amber-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300">
                        {item.sourcePackageName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                        200% Cashback
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-400 block">Cashback Bonus</span>
                      <span className="text-2xl font-black font-mono text-amber-300 block">
                        KES {(item.cashbackAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                      <div className="flex justify-between text-zinc-400 text-[11px]">
                        <span>40% Required to Claim:</span>
                        <strong className="text-zinc-200 font-mono">KES {req40.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Your Deposit Balance:</span>
                        <strong className={hasEnoughDeposit ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                          KES {userDepositBalance.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80">
                    {hasEnoughDeposit ? (
                      <button
                        onClick={() => setSelectedClaimItem(item)}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Claim with Deposit Balance (KES {req40.toLocaleString()})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenDeposit(shortfall)}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Deposit KES {shortfall.toLocaleString()} to Claim</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claimed History */}
      {unlockedItems.length > 0 && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Claimed Cashback History</span>
          </h3>

          <div className="divide-y divide-zinc-800/80 text-xs">
            {unlockedItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-white">{item.sourcePackageName}</span>
                <span className="font-mono font-bold text-emerald-400">
                  +KES {(item.cashbackAmount || 0).toLocaleString()} (Credited)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLAIM CONFIRMATION MODAL */}
      {selectedClaimItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!claimSuccess ? (
              <div className="space-y-5 pt-2">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Claim Cashback Bonus
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Claim your bonus using 40% from your Deposit Balance.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cashback Payout:</span>
                    <span className="text-amber-400 font-bold text-sm">
                      +KES {(currentBonusAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">40% Deposit Deduction:</span>
                    <span className="text-zinc-300 font-bold">
                      -KES {(currentFee || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-800">
                    <span className="text-zinc-400">Your Current Deposit:</span>
                    <span className={userDepositBalance >= currentFee ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      KES {userDepositBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {userDepositBalance >= currentFee ? (
                  <button
                    onClick={() => handleExecuteClaim()}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Disbursing Cashback...
                      </span>
                    ) : (
                      <span>Claim KES {(currentBonusAmount || 0).toLocaleString()} with Deposit Balance</span>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>
                        Deposit balance insufficient. You need to deposit KES {(currentFee - userDepositBalance).toLocaleString()} more to claim this bonus.
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const shortfall = currentFee - userDepositBalance;
                        onOpenDeposit(shortfall);
                        handleCloseModal();
                      }}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Deposit KES {(currentFee - userDepositBalance).toLocaleString()} via M-Pesa</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cashback Released!</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    KES {(currentBonusAmount || 0).toLocaleString()} has been credited to your spendable M-Pesa account balance.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
