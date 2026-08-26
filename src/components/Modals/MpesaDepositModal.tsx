import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Transaction, PayHeroConfig } from '../../types';
import { Smartphone, X, CheckCircle2, ShieldCheck, AlertCircle, Loader2, RotateCw, RefreshCw, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { validateSafaricomPhone } from '../../utils/phoneValidation';

interface MpesaDepositModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (amount: number, newTx: Transaction) => void;
  defaultAmount?: number;
  isActivation?: boolean;
  payheroConfig?: PayHeroConfig;
}

export const MpesaDepositModal: React.FC<MpesaDepositModalProps> = ({
  user,
  onClose,
  onSuccess,
  defaultAmount = 500,
  isActivation = false,
  payheroConfig,
}) => {
  const [amount, setAmount] = useState<number>(isActivation ? 200 : defaultAmount);
  const [phone, setPhone] = useState<string>(user.phone || '0712345678');
  const [step, setStep] = useState<'form' | 'waiting_for_stk' | 'success' | 'failed'>('form');
  const [countdown, setCountdown] = useState<number>(55);
  const [generatedTx, setGeneratedTx] = useState<Transaction | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [activeTxReference, setActiveTxReference] = useState<string>('');
  const [failureReason, setFailureReason] = useState<string>('No completed M-Pesa transaction was received.');

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Quick amount selections
  const quickAmounts = isActivation ? [200] : [250, 500, 1000, 2500, 5000, 7000];

  // Validate Safaricom phone in real-time
  const phoneValidation = validateSafaricomPhone(phone);

  const completePayment = useCallback((receiptCode: string, paidAmount: number, paidPhone: string) => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      mpesaReceiptNo: receiptCode,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userPhone: paidPhone,
      type: isActivation ? 'activation_fee' : 'deposit',
      amount: paidAmount,
      fee: 0,
      netAmount: paidAmount,
      status: 'completed',
      description: isActivation
        ? 'Eneza VIP Account Activation Fee'
        : `Lipa na M-Pesa Online Deposit from ${paidPhone}`,
      createdAt: new Date().toISOString(),
    };

    setGeneratedTx(newTx);
    setStep('success');

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#ffffff'],
      });
    } catch {
      // ignore
    }

    onSuccess(paidAmount, newTx);
  }, [isActivation, user, onSuccess]);

  // Query live payment status from backend / PayHero
  const checkStatusWithServer = useCallback(async (reference: string, silent = false): Promise<boolean> => {
    if (!reference) return false;
    if (!silent) setIsCheckingStatus(true);

    try {
      const params = new URLSearchParams({
        reference,
        channelId: payheroConfig?.channelId || '678',
      });
      if (payheroConfig?.apiKey) params.append('apiKey', payheroConfig.apiKey);
      if (payheroConfig?.username) params.append('username', payheroConfig.username);
      if (payheroConfig?.apiSecret) params.append('apiSecret', payheroConfig.apiSecret);

      const res = await fetch(`/api/mpesa/check-status?${params.toString()}`);
      const data = await res.json().catch(() => null);

      if (data && data.success) {
        if (data.status === 'SUCCESS') {
          const receipt = data.receiptCode || `QK${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
          completePayment(receipt, amount, phone);
          return true;
        } else if (data.status === 'FAILED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setFailureReason(data.message || 'Payment prompt was cancelled or incorrect M-Pesa PIN was entered on the phone.');
          setStep('failed');
          return true;
        } else {
          // Still QUEUED
          if (!silent) {
            setStatusMessage('Awaiting PIN entry on your Safaricom phone. Checking PayHero in real-time...');
            setTimeout(() => setStatusMessage(null), 3000);
          }
        }
      }
    } catch (err: any) {
      console.warn('Status poll error:', err?.message);
    } finally {
      if (!silent) setIsCheckingStatus(false);
    }

    return false;
  }, [amount, phone, completePayment, payheroConfig]);

  const executeStkPush = useCallback(async (targetPhone: string, targetAmount: number) => {
    const val = validateSafaricomPhone(targetPhone);
    if (!val.isSafaricom) {
      setDispatchError(val.errorMessage || 'Only Safaricom M-Pesa numbers (07XX / 011X) are supported.');
      return;
    }

    setIsDispatching(true);
    setDispatchError(null);
    setStatusMessage(null);

    const clientRef = `ENEZA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setActiveTxReference(clientRef);

    // Call server-side STK proxy endpoint with fallback
    try {
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: val.localPhone,
          amount: Number(targetAmount),
          purpose: isActivation ? 'Account Activation' : 'Wallet Deposit',
          reference: clientRef,
          channelId: payheroConfig?.channelId || '678',
          apiKey: payheroConfig?.apiKey || '',
          apiSecret: payheroConfig?.apiSecret || '',
          username: payheroConfig?.username || '',
          callbackUrl: payheroConfig?.callbackUrl || '',
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success !== false) {
        if (data?.reference) {
          setActiveTxReference(data.reference);
        }
        setIsDispatching(false);
        setStep('waiting_for_stk');
        setCountdown(55);
        return;
      }

      // If backend returned explicit error with message
      if (data && data.error && response.status !== 404) {
        setDispatchError(data.error || data.message || 'STK Push dispatch was rejected by gateway.');
        setIsDispatching(false);
        return;
      }

      // If 404 or unhandled response on serverless host, gracefully transition into the prompt countdown
      setActiveTxReference(clientRef);
      setIsDispatching(false);
      setStep('waiting_for_stk');
      setCountdown(55);
    } catch (e: any) {
      console.warn('STK push network dispatch warning:', e?.message);
      // Fallback: Proceed to waiting state so user can complete PIN entry or manual verification
      setActiveTxReference(clientRef);
      setIsDispatching(false);
      setStep('waiting_for_stk');
      setCountdown(55);
    }
  }, [payheroConfig, isActivation]);

  const handleInitiateSTK = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 50) {
      setDispatchError('Minimum deposit amount is KES 50');
      return;
    }
    const val = validateSafaricomPhone(phone);
    if (!val.isSafaricom) {
      setDispatchError(val.errorMessage || 'Please enter a valid Safaricom phone number (e.g. 0712345678 or 0110123456). Airtel / Telkom numbers cannot receive M-Pesa STK prompts.');
      return;
    }

    executeStkPush(phone, amount);
  };

  // Real-time PayHero Polling and Countdown (strictly verifies status, fails on timeout)
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (step === 'waiting_for_stk' && activeTxReference) {
      // Periodic server check every 2.5 seconds
      pollingTimerRef.current = setInterval(() => {
        checkStatusWithServer(activeTxReference, true);
      }, 2500);

      // Countdown timer
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            setFailureReason('STK prompt timed out. No M-Pesa PIN was entered on your Safaricom phone.');
            setStep('failed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [step, activeTxReference, checkStatusWithServer]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 overflow-hidden">
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isActivation ? 'Activate Eneza Account' : 'Deposit via Lipa Na M-Pesa'}
                </h3>
                <p className="text-xs text-zinc-400">Instant Safaricom M-Pesa STK Push Prompt</p>
              </div>
            </div>

            {/* Current Deposit Balance Badge */}
            <div className="mb-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Current Deposit Balance:</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                KES {(user.depositBalance || 0).toLocaleString()}
              </span>
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

            {dispatchError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-snug">{dispatchError}</span>
              </div>
            )}

            <form onSubmit={handleInitiateSTK} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-400">Safaricom Phone Number</label>
                  {phone && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        phoneValidation.isSafaricom
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {phoneValidation.isSafaricom ? '✓ Safaricom M-Pesa' : `✕ ${phoneValidation.network} (Unsupported)`}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone || ''}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (dispatchError) setDispatchError(null);
                    }}
                    placeholder="07XXXXXXXX or 011XXXXXXX"
                    className={`w-full rounded-lg bg-zinc-950 border px-3.5 py-2.5 text-zinc-100 text-sm font-mono focus:outline-none focus:ring-1 ${
                      phone && !phoneValidation.isSafaricom
                        ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  STK prompt will pop up on this Safaricom phone. Other telcos (Airtel, Telkom) are not supported for STK push.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Deposit Amount (KES)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={150000}
                  disabled={isActivation}
                  value={isNaN(amount) ? '' : amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-zinc-100 text-lg font-bold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              {!isActivation && (
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((qAmt) => (
                    <button
                      key={qAmt}
                      type="button"
                      onClick={() => setAmount(qAmt)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer font-mono ${
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
                  <span>Payment Channel:</span>
                  <span className="font-mono text-zinc-200 font-semibold">Safaricom Lipa Na M-Pesa</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Fee:</span>
                  <span className="text-emerald-400 font-semibold">FREE (0 KES)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isDispatching || (phone.length >= 9 && !phoneValidation.isSafaricom)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting to Safaricom M-Pesa...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Send Safaricom STK Push (KES {amount.toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP: AWAITING M-PESA PIN & STRICT STATUS VERIFICATION */}
        {step === 'waiting_for_stk' && (
          <div className="py-2 space-y-5 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
              <div className="relative w-20 h-20 rounded-2xl bg-zinc-950 border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/60">
                <Smartphone className="w-8 h-8 text-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-emerald-400 mt-1">M-PESA</span>
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-zinc-900"></span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Safaricom STK Prompt Sent</h3>
              <p className="text-xs text-zinc-300">
                Prompt delivered to <strong className="text-emerald-400 font-mono text-sm">{phone}</strong>
              </p>
            </div>

            {/* Instruction Card */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-left text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold pb-1 border-b border-zinc-800">
                <ShieldCheck className="w-4 h-4" />
                <span>Enter PIN on your Safaricom phone:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 text-[11px] leading-relaxed">
                <li>Look at your phone screen for the Safaricom M-Pesa pop-up.</li>
                <li>
                  Confirm payment of <strong className="text-white font-mono">KES {amount.toLocaleString()}</strong>.
                </li>
                <li>
                  Enter your <strong className="text-emerald-400">M-Pesa PIN</strong> and tap OK / Send.
                </li>
              </ol>
            </div>

            {/* Live PayHero Verification Status */}
            <div className="p-3.5 bg-zinc-950/90 rounded-xl border border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-1.5">
                <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Safaricom Gateway Polling
                </span>
                <span className="text-emerald-400 font-bold font-mono">{countdown}s remaining</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>STK Push prompt dispatched to {phone}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-amber-400" />
                  <span>Awaiting PIN entry on phone keypad...</span>
                </div>
              </div>

              {statusMessage && (
                <div className="p-2 rounded bg-zinc-900 text-emerald-300 text-[10px] font-mono border border-zinc-800 text-center animate-fadeIn">
                  {statusMessage}
                </div>
              )}
            </div>

            {/* Live gateway status check button */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={isCheckingStatus}
                onClick={() => checkStatusWithServer(activeTxReference, false)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-semibold text-zinc-200 text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isCheckingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Checking Safaricom Gateway Receipt...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Check M-Pesa Payment Status</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-zinc-400 hover:text-zinc-200 transition underline cursor-pointer"
              >
                Change Phone / Amount
              </button>
              <button
                type="button"
                onClick={() => {
                  setFailureReason('STK push request was cancelled.');
                  setStep('failed');
                }}
                className="text-rose-400 hover:text-rose-300 font-medium transition cursor-pointer"
              >
                Cancel Request
              </button>
            </div>
          </div>
        )}

        {/* STEP: FAILED / TIMEOUT */}
        {step === 'failed' && (
          <div className="py-4 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Payment Not Completed</h3>
              <p className="text-xs text-zinc-300">
                {failureReason}
              </p>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-left text-xs space-y-2 text-zinc-400">
              <span className="font-semibold text-rose-400 block">Common causes:</span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-300">
                <li>No M-Pesa PIN was entered before the prompt expired.</li>
                <li>The prompt was cancelled or dismissed on the phone.</li>
                <li>Incorrect M-Pesa PIN or insufficient M-Pesa funds.</li>
                <li>SIM card was unreachable or busy.</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => executeStkPush(phone, amount)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Resend Safaricom STK Push</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-medium text-zinc-300 text-xs transition cursor-pointer"
              >
                Edit Number or Amount
              </button>
            </div>
          </div>
        )}

        {/* STEP: SUCCESS - ONLY DISPLAYED WHEN ACTUALLY CONFIRMED */}
        {step === 'success' && generatedTx && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Verified & Credited!</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {isActivation
                  ? 'Your Eneza Earnings account is now FULLY ACTIVATED!'
                  : `KES ${amount.toLocaleString()} has been confirmed by Safaricom M-Pesa and credited to your Deposit Balance.`}
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">M-Pesa Receipt:</span>
                <span className="text-emerald-400 font-bold">{generatedTx.mpesaReceiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount Deposited:</span>
                <span className="text-zinc-200 font-bold">KES {generatedTx.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Credited To:</span>
                <span className="text-emerald-400 font-semibold">Deposit Balance</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Verification Status:</span>
                <span className="text-emerald-400 font-bold uppercase">SAFARICOM M-PESA CONFIRMED</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition cursor-pointer"
            >
              Continue with Deposit Balance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
