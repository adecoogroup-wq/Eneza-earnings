import React, { useState } from 'react';
import { Transaction } from '../types';
import { History, Search, Receipt, ArrowDownLeft, ArrowUpRight, Filter, Download } from 'lucide-react';
import { safeFormatDate } from '../utils/dateUtils';

interface LedgerViewProps {
  transactions: Transaction[];
  onViewReceipt: (tx: Transaction) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ transactions, onViewReceipt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.mpesaReceiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userPhone.includes(searchTerm);

    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Full Transaction Ledger</h2>
          <p className="text-xs text-zinc-400">
            Immutable audited history of all deposits, task payouts, bonuses, and M-Pesa withdrawals.
          </p>
        </div>
        <div className="text-right px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Recorded Entries</span>
          <span className="text-sm font-bold font-mono text-emerald-400">{transactions.length} Transactions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search receipt, phone, name..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'deposit', 'withdrawal', 'task_reward', 'referral_bonus', 'spin_reward'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition ${
                filterType === type
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 font-mono uppercase tracking-wider">
                <th className="pb-3">Receipt Code</th>
                <th className="pb-3">User & Phone</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No transactions match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 font-mono font-bold text-emerald-400">{tx.mpesaReceiptNo}</td>
                    <td className="py-3.5">
                      <p className="font-semibold text-zinc-200">{tx.userName}</p>
                      <p className="font-mono text-zinc-500 text-[10px]">{tx.userPhone}</p>
                    </td>
                    <td className="py-3.5 capitalize">
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
                    <td className="py-3.5 text-zinc-300 max-w-xs truncate">{tx.description}</td>
                    <td className="py-3.5 text-zinc-400 text-[11px]">
                      {safeFormatDate(tx.createdAt)}
                    </td>
                    <td className="py-3.5">
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
                    <td className={`py-3.5 text-right font-mono font-bold text-sm ${
                      tx.type === 'withdrawal' ? 'text-zinc-200' : 'text-emerald-400'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}KES {(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition"
                        title="View Official Receipt"
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
