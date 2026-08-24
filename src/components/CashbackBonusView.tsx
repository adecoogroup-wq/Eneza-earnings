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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppView } from './Sidebar';

interface CashbackBonusViewProps {
  currentUser: User;
  cashbackItems: CashbackItem[];
  onClaimCashback: (itemId: string) => void;
  onClaimAllCashback: () => void;
  onSwitchView: (view: AppView) => void;
}

export const CashbackBonusView: React.FC<CashbackBonusViewProps> = ({
  currentUser,
  cashbackItems,
  onClaimCashback,
  onClaimAllCashback,
  onSwitchView,
}) => {
  const [selectedClaimItem, setSelectedClaimItem] = useState<CashbackItem | 'all' | null>(null);
  const [phone, setPhone] = useState<string>(currentUser.phone || '0712345678');
  const [isProcessing, setIsProcessing] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const pendingItems = cashbackItems.filter((i) => i.status === 'pending_unlock');
  const unlockedItems = cashbackItems.filter((i) => i.status === 'unlocked');

  const totalPendingCashback = pendingItems.reduce((acc, curr) => acc + curr.cashbackAmount, 0);
  const totalRequired40Fee = pendingItems.reduce((acc, curr) => acc + curr.unlockFeeRequired, 0);

  const currentFee = selectedClaimItem === 'all'
    ? totalRequired40Fee
    : selectedClaimItem
    ? selectedClaimItem.unlockFeeRequired
    : 0;

  const currentBonusAmount = selectedClaimItem === 'all'
    ? totalPendingCashback
    : selectedClaimItem
    ? selectedClaimItem.cashbackAmount
    : 0;

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      if (selectedClaimItem === 'all') {
        onClaimAllCashback();
      } else if (selectedClaimItem) {
        onClaimCashback(selectedClaimItem.id);
      }

      setIsProcessing(false);
      setClaimSuccess(true);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#ffffff']
        });
      } catch {
        // ignore
      }
    }, 1500);
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
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <Gift className="w-3.5 h-3.5" />
            <span>Cashback Bonus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cashback Bonus
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
            Claim your cashback bonus instantly to your spendable M-Pesa account balance.
          </p>
        </div>
      </div>

      {/* Main Cashback Items Area */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Available Cashback Bonuses</span>
            </h2>
          </div>

          {pendingItems.length > 1 && (
            <button
              onClick={() => setSelectedClaimItem('all')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Claim All</span>
            </button>
          )}
        </div>

        {pendingItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white">All Cashback Claimed!</div>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Activate additional packages to unlock more cashback bonuses.
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
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 hover:border-amber-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white block">
                    {item.sourcePackageName}
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-300 block">
                    KES {(item.cashbackAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedClaimItem(item)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Claim</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claimed History */}
      {unlockedItems.length > 0 && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Claimed Cashback</span>
          </h3>

          <div className="divide-y divide-zinc-800/80 text-xs">
            {unlockedItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-white">{item.sourcePackageName}</span>
                <span className="font-mono font-bold text-emerald-400">
                  +KES {(item.cashbackAmount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 40% FEE PAYMENT MODAL */}
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
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    pay this to receive your Cashback bonus
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider block">
                    Amount to Pay
                  </span>
                  <div className="text-3xl font-black font-mono text-amber-400">
                    KES {(currentFee || 0).toLocaleString()}
                  </div>
                </div>

                <form onSubmit={handleConfirmPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      M-Pesa Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-zinc-100 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Processing M-Pesa STK...
                      </span>
                    ) : (
                      <span>Pay KES {(currentFee || 0).toLocaleString()}</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cashback Released!</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    KES {(currentBonusAmount || 0).toLocaleString()} has been credited to your available balance.
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
