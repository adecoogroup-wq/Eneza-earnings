import React, { useState } from 'react';
import { User, Transaction } from '../../types';
import { ArrowUpRight, X, CheckCircle2, Loader2, Bot, Crown, Globe, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WithdrawalModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (amount: number, fee: number, newTx: Transaction) => void;
  onNavigateToPackage?: (viewName: 'automationPackageView' | 'verifiedAgentView' | 'universePackageView') => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  user,
  onClose,
  onSuccess,
  onNavigateToPackage,
}) => {
  const [amount, setAmount] = useState<number>(Math.min(user.balance, 1000) || 500);
  const [phone, setPhone] = useState<string>(user.phone || '0712345678');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  // Package Requirement Gatekeeper:
  // 1. Automation Package (KES 2,500)
  // 2. Verified Agent Package (KES 5,000)
  // 3. Universe Package (KES 7,000)
  let requiredPackage: {
    title: string;
    message: string;
    price: number;
    viewName: 'automationPackageView' | 'verifiedAgentView' | 'universePackageView';
    icon: React.ReactNode;
  } | null = null;

  if (!user.isAutomationPackagePurchased) {
    requiredPackage = {
      title: 'Automation Package',
      message: 'Purchase Automation package to receive your withdrawal.',
      price: 2500,
      viewName: 'automationPackageView',
      icon: <Bot className="w-8 h-8 text-purple-400" />,
    };
  } else if (!user.isVerifiedAgentPurchased) {
    requiredPackage = {
      title: 'Verified Agent Package',
      message: 'Purchase Verified Agent package to receive your withdrawal.',
      price: 5000,
      viewName: 'verifiedAgentView',
      icon: <Crown className="w-8 h-8 text-amber-400" />,
    };
  } else if (!user.isUniversePackagePurchased) {
    requiredPackage = {
      title: 'Universe Package',
      message: 'Purchase Universe package to receive your withdrawal.',
      price: 7000,
      viewName: 'universePackageView',
      icon: <Globe className="w-8 h-8 text-indigo-400" />,
    };
  }

  // Fee calculation (Standard tier has small fee, Gold/VIP has 0 fee)
  const isVipZeroFee = user.tier === 'Gold' || user.tier === 'Platinum' || user.tier === 'Diamond VIP';
  const fee = isVipZeroFee ? 0 : amount <= 1000 ? 25 : amount <= 2500 ? 35 : 50;
  const totalDeducted = amount + fee;
  const netReceived = amount;

  const minWithdrawal = 200;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.isActivated) {
      alert('Your account must be activated before requesting withdrawals.');
      return;
    }

    if (amount < minWithdrawal) {
      alert(`Minimum withdrawal amount is KES ${minWithdrawal}`);
      return;
    }

    if (totalDeducted > user.balance) {
      alert(`Insufficient account balance. You need KES ${totalDeducted.toLocaleString()} (including fee) but have KES ${user.balance.toLocaleString()}.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Create random receipt
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
      let receiptCode = 'QK';
      for (let i = 0; i < 8; i++) {
        receiptCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Fast disburse for Gold/Platinum, or pending for Standard
      const isInstant = user.tier === 'Gold' || user.tier === 'Platinum' || user.tier === 'Diamond VIP';

      const newTx: Transaction = {
        id: `tx_w_${Date.now()}`,
        mpesaReceiptNo: receiptCode,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userPhone: phone,
        type: 'withdrawal',
        amount: amount,
        fee: fee,
        netAmount: netReceived,
        status: isInstant ? 'completed' : 'pending',
        description: `M-Pesa B2C Cashout to ${phone}`,
        createdAt: new Date().toISOString(),
        approvedBy: isInstant ? 'Instant B2C Auto-Gateway' : undefined
      };

      setCompletedTx(newTx);
      setIsSubmitting(false);

      if (isInstant) {
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#f59e0b']
          });
        } catch {
          // ignore
        }
      }

      onSuccess(amount, fee, newTx);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PACKAGE REQUIREMENT PROMPT (If any prerequisite is pending) */}
        {requiredPackage && !completedTx ? (
          <div className="py-3 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto shadow-inner">
              {requiredPackage.icon}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {requiredPackage.title}
              </h3>
              <p className="text-sm text-zinc-300 font-medium max-w-xs mx-auto leading-relaxed">
                {requiredPackage.message}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-400">Available Account Balance:</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">
                KES {(user.balance || 0).toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                if (onNavigateToPackage && requiredPackage) {
                  onNavigateToPackage(requiredPackage.viewName);
                  onClose();
                }
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
            >
              <span>Purchase {requiredPackage.title} (KES {requiredPackage.price.toLocaleString()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !completedTx ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Withdraw to M-Pesa</h3>
                <p className="text-xs text-zinc-400">Direct Safaricom B2C Instant Disbursal</p>
              </div>
            </div>

            {/* Current Balance Bar */}
            <div className="mb-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Available Balance</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">KES {user.balance.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-500 block">Current Tier</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-xs font-semibold text-zinc-200">
                  {user.tier}
                </span>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">M-Pesa Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone || ''}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-zinc-400">Amount (KES)</label>
                  <button
                    type="button"
                    onClick={() => setAmount(user.balance)}
                    className="text-xs text-emerald-400 hover:underline font-medium cursor-pointer"
                  >
                    Withdraw All
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min={minWithdrawal}
                  max={user.balance}
                  value={isNaN(amount) ? '' : amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-zinc-100 text-lg font-bold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Fee & Breakdown Box */}
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Gross Payout:</span>
                  <span className="text-zinc-200 font-mono">KES {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>M-Pesa Transfer Fee:</span>
                  <span className={fee === 0 ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                    {fee === 0 ? 'FREE (VIP Perk)' : `KES ${fee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-800 text-zinc-200 font-semibold">
                  <span>Total from Balance:</span>
                  <span className="text-emerald-400 font-mono font-bold">KES {totalDeducted.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || user.balance < minWithdrawal}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white text-sm shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing B2C Transfer...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Confirm M-Pesa Cashout
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {completedTx.status === 'completed' ? 'Payout Dispatched!' : 'Withdrawal Submitted!'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {completedTx.status === 'completed'
                  ? `KES ${(completedTx.netAmount || 0).toLocaleString()} has been sent to ${completedTx.userPhone} via M-Pesa.`
                  : `Your request for KES ${(completedTx.netAmount || 0).toLocaleString()} has been queued for admin verification.`}
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">M-Pesa Reference:</span>
                <span className="text-emerald-400 font-bold">{completedTx.mpesaReceiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Net Amount:</span>
                <span className="text-zinc-200">KES {(completedTx.netAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{completedTx.status}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
