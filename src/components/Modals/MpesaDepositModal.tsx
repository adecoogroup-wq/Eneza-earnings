import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../../types';
import { Smartphone, X, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MpesaDepositModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (amount: number, newTx: Transaction) => void;
  defaultAmount?: number;
  isActivation?: boolean;
}

export const MpesaDepositModal: React.FC<MpesaDepositModalProps> = ({
  user,
  onClose,
  onSuccess,
  defaultAmount = 500,
  isActivation = false,
}) => {
  const [amount, setAmount] = useState<number>(isActivation ? 200 : defaultAmount);
  const [phone, setPhone] = useState<string>(user.phone || '0712345678');
  const [step, setStep] = useState<'form' | 'stk_sent' | 'pin_prompt' | 'processing' | 'success'>('form');
  const [pin, setPin] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(20);
  const [generatedTx, setGeneratedTx] = useState<Transaction | null>(null);

  // Quick amount selections
  const quickAmounts = isActivation ? [200] : [250, 500, 1000, 2500, 5000];

  const handleInitiateSTK = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 50) {
      alert('Minimum deposit amount is KES 50');
      return;
    }
    setStep('stk_sent');
    setCountdown(15);
  };

  // Countdown and transition to simulated phone popup
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'stk_sent') {
      timer = setTimeout(() => {
        setStep('pin_prompt');
      }, 1800);
    }
    return () => clearTimeout(timer);
  }, [step]);

  const handleSimulatedPinSubmit = () => {
    if (pin.length < 4) {
      alert('Please enter a 4-digit PIN');
      return;
    }
    setStep('processing');

    setTimeout(() => {
      // Generate random M-Pesa Receipt (e.g. QK98...)
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
      let receiptCode = 'QK';
      for (let i = 0; i < 8; i++) {
        receiptCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        mpesaReceiptNo: receiptCode,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userPhone: phone,
        type: isActivation ? 'activation_fee' : 'deposit',
        amount: amount,
        fee: 0,
        netAmount: amount,
        status: 'completed',
        description: isActivation ? 'Eneza VIP Account Activation Fee' : `Lipa na M-Pesa Online Deposit from ${phone}`,
        createdAt: new Date().toISOString(),
      };

      setGeneratedTx(newTx);
      setStep('success');

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399', '#ffffff']
        });
      } catch {
        // ignore
      }

      onSuccess(amount, newTx);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Glow indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isActivation ? 'Activate Eneza Account' : 'Deposit via Lipa Na M-Pesa'}
                </h3>
                <p className="text-xs text-zinc-400">Instant STK Push Prompt to your Mobile Phone</p>
              </div>
            </div>

            {isActivation && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <span className="font-semibold block text-white">One-Time Activation Fee: KES 200</span>
                  Unlocks unlimited daily task rewards, referral commissions, and instant M-Pesa withdrawals.
                </div>
              </div>
            )}

            <form onSubmit={handleInitiateSTK} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">M-Pesa Registered Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XXXXXXXX or 2547XXXXXXXX"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-emerald-400 font-medium">Safaricom</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Deposit Amount (KES)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={150000}
                  disabled={isActivation}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-zinc-100 text-lg font-bold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {!isActivation && (
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((qAmt) => (
                    <button
                      key={qAmt}
                      type="button"
                      onClick={() => setAmount(qAmt)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                        amount === qAmt
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      +KES {qAmt.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <span className="font-mono text-zinc-200 font-bold">Lipa Na M-Pesa Online (Automated STK)</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Fee:</span>
                  <span className="text-emerald-400 font-medium">FREE (0 KES)</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Send STK Push Prompt
              </button>
            </form>
          </div>
        )}

        {step === 'stk_sent' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sending STK Push to Phone...</h3>
              <p className="text-xs text-zinc-400 mt-1">Please check phone number <span className="text-emerald-400 font-mono">{phone}</span> for the Safaricom PIN dialog.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Connecting to Safaricom Daraja Gateway...</span>
            </div>
          </div>
        )}

        {step === 'pin_prompt' && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/20">
                Simulated STK Push Screen
              </span>
              <h3 className="text-base font-bold text-white">Authorize Lipa na M-Pesa</h3>
            </div>

            {/* Mock Phone SIM Dialog */}
            <div className="bg-zinc-950 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-inner space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 tracking-wide">SAFARICOM M-PESA</span>
                <span className="text-[10px] text-zinc-500">SIM 1</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Do you want to pay <strong className="text-white">KES {amount.toLocaleString()}.00</strong> to <strong className="text-emerald-400">ENEZA EARNINGS</strong> for Account <span className="font-mono text-zinc-400">{user.username}</span>?
              </p>
              
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Enter M-Pesa PIN:</label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-[1em] text-xl font-bold bg-zinc-900 border border-zinc-700 rounded-lg py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="py-2 text-xs font-medium rounded-lg bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulatedPinSubmit}
                  className="py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                >
                  Send PIN
                </button>
              </div>
            </div>
            <p className="text-[11px] text-center text-zinc-500">
              * Test Mode: Type any 4-digit PIN (e.g. 1234) to simulate instant confirmation.
            </p>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Validating M-Pesa Transaction...</h3>
              <p className="text-xs text-zinc-400 mt-1">Awaiting confirmation callback from Safaricom API.</p>
            </div>
          </div>
        )}

        {step === 'success' && generatedTx && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Received!</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {isActivation
                  ? 'Your Eneza Earnings account is now FULLY ACTIVATED!'
                  : `KES ${amount.toLocaleString()} has been credited to your account balance.`}
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">M-Pesa Receipt:</span>
                <span className="text-emerald-400 font-bold">{generatedTx.mpesaReceiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount Paid:</span>
                <span className="text-zinc-200">KES {generatedTx.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">COMPLETED</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
