import React from 'react';
import { Transaction } from '../../types';
import { CheckCircle, Download, X, ShieldCheck, Share2 } from 'lucide-react';
import { safeFormatDateTime } from '../../utils/dateUtils';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `ENEZA EARNINGS M-PESA RECEIPT\nReceipt No: ${transaction.mpesaReceiptNo}\nAmount: KES ${(transaction.amount || 0).toLocaleString()}\nStatus: ${transaction.status.toUpperCase()}\nDate: ${safeFormatDateTime(transaction.createdAt)}\nPhone: ${transaction.userPhone}`
    );
    alert('Receipt copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Top green glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mt-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">M-Pesa Transaction Receipt</h3>
          <p className="text-xs text-zinc-400 mt-1">Eneza Earnings Automated M-Pesa Settlement</p>
        </div>

        {/* Receipt Slip Container */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-4 mb-5 font-mono text-xs space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
            <span className="text-zinc-500 uppercase tracking-wider">Receipt No</span>
            <span className="font-bold text-emerald-400 text-sm tracking-wide">{transaction.mpesaReceiptNo}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Transaction Type</span>
            <span className="text-zinc-200 capitalize font-sans font-medium">{transaction.type.replace('_', ' ')}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Recipient / Account</span>
            <span className="text-zinc-200">{transaction.userPhone} ({transaction.userName})</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Gross Amount</span>
            <span className="text-zinc-200">KES {transaction.amount.toLocaleString()}</span>
          </div>

          {transaction.fee > 0 && (
            <div className="flex justify-between items-center text-zinc-400">
              <span>Safaricom B2C Fee</span>
              <span>- KES {transaction.fee.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-sm font-sans font-bold">
            <span className="text-zinc-300">Net Settled</span>
            <span className="text-emerald-400 text-base">KES {transaction.netAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center pt-1 text-zinc-500 text-[11px]">
            <span>Timestamp</span>
            <span>{safeFormatDateTime(transaction.createdAt)}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-500">Status</span>
            <span className={`px-2 py-0.5 rounded-full font-sans font-semibold text-[10px] uppercase tracking-wider ${
              transaction.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : transaction.status === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Security watermark */}
        <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-xs mb-5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Verified Safaricom M-Pesa Official System</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
          >
            <Share2 className="w-4 h-4" />
            Share Receipt
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition"
          >
            <Download className="w-4 h-4" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
