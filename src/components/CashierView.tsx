import React, { useState } from 'react';
import { User, Transaction } from '../types';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, History, Receipt, Smartphone } from 'lucide-react';
import { safeFormatDate } from '../utils/dateUtils';

interface CashierViewProps {
  user: User;
  transactions: Transaction[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onViewReceipt: (tx: Transaction) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({
  user,
  transactions,
  onOpenDeposit,
  onOpenWithdraw,
  onViewReceipt,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const userTransactions = transactions.filter((t) => t.userId === user.id);
  const filtered = userTransactions.filter((t) => (filterType === 'all' ? true : t.type === filterType));

  return (
    <div className="space-y-6">
      {/* Header Balance Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/60 border border-emerald-500/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                Safaricom Daraja Automated Gateway
              </span>
            </div>
            <p className="text-xs text-zinc-400">Available Withdrawable Balance</p>
            <h1 className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              KES {(user.balance || 0).toLocaleString()}
            </h1>
            <p className="text-xs text-emerald-400/90 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant B2C Payouts active for {user.tier} Tier</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              onClick={onOpenDeposit}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Deposit via M-Pesa STK
            </button>
            <button
              onClick={onOpenWithdraw}
              className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Cash Out to M-Pesa
            </button>
          </div>

        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-800/80 text-xs">
          <div>
            <span className="text-zinc-500 block text-[11px]">Total Withdrawn</span>
            <span className="font-mono font-bold text-zinc-200 text-sm">
              KES {(user.totalWithdrawn || 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Pending Withdrawals</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              KES {(user.pendingBalance || 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Lifetime Earnings</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              KES {(user.totalEarned || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            M-Pesa Transaction Statement
          </h3>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'deposit', 'withdrawal', 'task_reward', 'referral_bonus', 'spin_reward'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
                  filterType === type
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 font-mono uppercase tracking-wider">
                <th className="pb-3">Receipt No</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No transactions found under this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3 font-mono font-bold text-emerald-400">{tx.mpesaReceiptNo}</td>
                    <td className="py-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : tx.type === 'withdrawal'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-teal-500/10 text-teal-300'
                      }`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-300 max-w-xs truncate">{tx.description}</td>
                    <td className="py-3 text-zinc-400 text-[11px]">
                      {safeFormatDate(tx.createdAt)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className={`py-3 text-right font-mono font-bold ${
                      tx.type === 'withdrawal' ? 'text-zinc-200' : 'text-emerald-400'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}KES {(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded transition"
                        title="View M-Pesa Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
