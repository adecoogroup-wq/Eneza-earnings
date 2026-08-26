import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import {
  History,
  Search,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Download,
  X,
  Layers,
  Sparkles,
  Gift,
  Coins,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { safeFormatDate } from '../utils/dateUtils';

interface LedgerViewProps {
  transactions: Transaction[];
  onViewReceipt: (tx: Transaction) => void;
}

type FilterCategory =
  | 'all'
  | 'deposit'
  | 'task_reward'
  | 'cashback'
  | 'withdrawal'
  | 'referral'
  | 'package';

interface FilterOption {
  id: FilterCategory;
  label: string;
  count?: number;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ transactions, onViewReceipt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FilterCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Categorize transaction types
  const matchCategory = (type: TransactionType, cat: FilterCategory): boolean => {
    if (cat === 'all') return true;
    if (cat === 'deposit') {
      return type === 'deposit' || type === 'investment_deposit';
    }
    if (cat === 'task_reward') {
      return type === 'task_reward' || type === 'spin_reward' || type === 'whatsapp_views_earning' || type === 'investment_yield';
    }
    if (cat === 'cashback') {
      return type === 'cashback_claim' || type === 'cashback_fee';
    }
    if (cat === 'withdrawal') {
      return type === 'withdrawal';
    }
    if (cat === 'referral') {
      return type === 'referral_bonus';
    }
    if (cat === 'package') {
      return (
        type === 'tier_upgrade' ||
        type === 'activation_fee' ||
        type === 'whatsapp_package' ||
        type === 'authorize_package' ||
        type === 'unlock_mpesa' ||
        type === 'automation_package' ||
        type === 'verified_agent' ||
        type === 'universe_package'
      );
    }
    return true;
  };

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      all: transactions.length,
      deposit: 0,
      task_reward: 0,
      cashback: 0,
      withdrawal: 0,
      referral: 0,
      package: 0,
    };

    transactions.forEach((tx) => {
      if (matchCategory(tx.type, 'deposit')) counts.deposit++;
      if (matchCategory(tx.type, 'task_reward')) counts.task_reward++;
      if (matchCategory(tx.type, 'cashback')) counts.cashback++;
      if (matchCategory(tx.type, 'withdrawal')) counts.withdrawal++;
      if (matchCategory(tx.type, 'referral')) counts.referral++;
      if (matchCategory(tx.type, 'package')) counts.package++;
    });

    return counts;
  }, [transactions]);

  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Transactions', count: categoryCounts.all },
    { id: 'deposit', label: 'Deposit', count: categoryCounts.deposit },
    { id: 'task_reward', label: 'Task Reward', count: categoryCounts.task_reward },
    { id: 'cashback', label: 'Cashback', count: categoryCounts.cashback },
    { id: 'withdrawal', label: 'Withdrawal', count: categoryCounts.withdrawal },
    { id: 'referral', label: 'Referral Bonus', count: categoryCounts.referral },
    { id: 'package', label: 'Packages & Fees', count: categoryCounts.package },
  ];

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        tx.mpesaReceiptNo?.toLowerCase().includes(term) ||
        tx.description?.toLowerCase().includes(term) ||
        tx.userName?.toLowerCase().includes(term) ||
        tx.userPhone?.includes(term) ||
        tx.type?.toLowerCase().includes(term);

      const matchesType = matchCategory(tx.type, selectedType);
      const matchesStatus = selectedStatus === 'all' || tx.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, searchTerm, selectedType, selectedStatus]);

  // Aggregate stats for filtered records
  const { totalInflow, totalOutflow } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    filtered.forEach((tx) => {
      if (tx.type === 'withdrawal') {
        outflow += tx.amount || 0;
      } else {
        inflow += tx.amount || 0;
      }
    });
    return { totalInflow: inflow, totalOutflow: outflow };
  }, [filtered]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
  };

  const hasActiveFilters = selectedType !== 'all' || selectedStatus !== 'all' || searchTerm.trim() !== '';

  const getTypeBadgeStyle = (type: TransactionType) => {
    if (type === 'deposit' || type === 'investment_deposit') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    if (type === 'withdrawal') {
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
    if (type === 'task_reward' || type === 'whatsapp_views_earning' || type === 'investment_yield') {
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
    if (type === 'cashback_claim' || type === 'cashback_fee') {
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    }
    if (type === 'spin_reward' || type === 'referral_bonus') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
    return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Full Transaction Ledger</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Immutable audited history of deposits, task rewards, cashback settlements, and M-Pesa payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Recorded Entries</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{transactions.length} Total</span>
          </div>
          <div className="text-right px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Filtered</span>
            <span className="text-sm font-bold font-mono text-white">{filtered.length} Results</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt code, phone, user name, description..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400 text-[11px] font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-zinc-200 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="bg-zinc-900 text-zinc-200">All Statuses</option>
                <option value="completed" className="bg-zinc-900 text-emerald-400">Completed</option>
                <option value="pending" className="bg-zinc-900 text-amber-400">Pending</option>
                <option value="failed" className="bg-zinc-900 text-rose-400">Failed / Rejected</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Transaction Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="flex items-center gap-1.5 shrink-0 pr-1 text-zinc-400 text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Type:</span>
          </div>

          {filterOptions.map((opt) => {
            const isSelected = selectedType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedType(opt.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span>{opt.label}</span>
                {opt.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isSelected
                        ? 'bg-emerald-700/80 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Financial Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Filtered Inflow</span>
            <p className="text-base font-bold font-mono text-emerald-400">+KES {totalInflow.toLocaleString()}</p>
          </div>
          <ArrowDownLeft className="w-5 h-5 text-emerald-500/60" />
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Filtered Outflow</span>
            <p className="text-base font-bold font-mono text-rose-400">-KES {totalOutflow.toLocaleString()}</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-rose-500/60" />
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Active Filter Mode</span>
            <p className="text-xs font-semibold text-zinc-200 capitalize">
              {selectedType === 'all' ? 'All Types' : selectedType.replace('_', ' ')} ({filtered.length})
            </p>
          </div>
          <Filter className="w-5 h-5 text-zinc-500/60" />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-xl">
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
                  <td colSpan={8} className="py-12 text-center text-zinc-500 space-y-2">
                    <History className="w-8 h-8 mx-auto text-zinc-600 opacity-50" />
                    <p className="font-medium text-zinc-400">No transactions match your filter criteria.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      Clear all filters
                    </button>
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
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getTypeBadgeStyle(tx.type)}`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 text-zinc-300 max-w-xs truncate">{tx.description}</td>
                    <td className="py-3.5 text-zinc-400 text-[11px]">
                      {safeFormatDate(tx.createdAt)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {tx.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {tx.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                        {(tx.status === 'failed' || tx.status === 'rejected') && <AlertCircle className="w-2.5 h-2.5" />}
                        {tx.status}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 text-right font-mono font-bold text-sm ${
                        tx.type === 'withdrawal' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {tx.type === 'withdrawal' ? '-' : '+'}KES {(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
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
