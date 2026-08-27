import React, { useState } from 'react';
import { User, InvestmentPlan, ActiveInvestment } from '../types';
import { INVESTMENT_PLANS } from '../data/mockData';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Calculator,
  PieChart,
  Wallet,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import { AppView } from './Sidebar';

interface InvestmentPlansViewProps {
  currentUser: User;
  activeInvestments: ActiveInvestment[];
  onInvest: (plan: InvestmentPlan, customAmount?: number) => void;
  onHarvestYield: (investmentId: string) => void;
  onOpenDeposit?: (amount?: number) => void;
  onSwitchView: (view: AppView) => void;
}

export const InvestmentPlansView: React.FC<InvestmentPlansViewProps> = ({
  currentUser,
  activeInvestments,
  onInvest,
  onHarvestYield,
  onOpenDeposit,
  onSwitchView,
}) => {
  const [calcAmount, setCalcAmount] = useState<number>(1500);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [harvestingId, setHarvestingId] = useState<string | null>(null);

  const userDepositBalance = currentUser.depositBalance || 0;

  // 300% monthly return calculations
  const monthlyReturn = calcAmount * 3; // 300% net profit
  const totalPayout = calcAmount * 4; // Principal (100%) + Profit (300%) = 400%
  const dailyAccrual = monthlyReturn / 30; // daily yield

  const handleInvestClick = (plan: InvestmentPlan) => {
    if (userDepositBalance < plan.minDeposit) {
      const shortfall = plan.minDeposit - userDepositBalance;
      if (onOpenDeposit) {
        onOpenDeposit(shortfall);
        return;
      }
    }

    setProcessingPlanId(plan.id);
    setTimeout(() => {
      onInvest(plan);
      setProcessingPlanId(null);
    }, 700);
  };

  const handleHarvest = (invId: string) => {
    setHarvestingId(invId);
    setTimeout(() => {
      onHarvestYield(invId);
      setHarvestingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>High-Yield Liquidity & Capital Growth Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Investment Plans (Up to 300% Monthly)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Start growing your passive capital with packages beginning from{' '}
              <span className="text-emerald-400 font-bold">KES 1,500</span> and enjoy up to{' '}
              <span className="text-amber-400 font-bold">300% Monthly Yield</span>. All investments are activated instantly using your available deposit balance.
            </p>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Active Investment Capital
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              KES {(activeInvestments?.reduce((acc, c) => acc + (c.amountInvested || 0), 0) || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-400 block">
              Total Yield Harvested:{' '}
              <strong className="text-amber-300 font-mono">
                KES {(activeInvestments?.reduce((acc, c) => acc + (c.currentEarned || 0), 0) || 0).toLocaleString()}
              </strong>
            </span>
          </div>
        </div>

        {/* Masked Trust Badges */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Regulated Institutional Liquidity Pool • Daily Automated Accrual Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono text-zinc-300">Vault Seal: INV-ESCROW-***6328</span>
          </div>
        </div>
      </div>

      {/* Available Deposit Balance Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Your Available Deposit Balance</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              KES {userDepositBalance.toLocaleString()}
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenDeposit && onOpenDeposit()}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Deposit via Lipa Na M-Pesa</span>
        </button>
      </div>

      {/* Interactive Yield Calculator */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            300% Monthly ROI Yield Estimator
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Enter Investment Capital (Min KES 1,500)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold font-mono text-zinc-400 text-sm">KES</span>
              <input
                type="number"
                min="1500"
                step="500"
                value={isNaN(calcAmount) ? '' : calcAmount}
                onChange={(e) => setCalcAmount(Math.max(1500, parseInt(e.target.value) || 1500))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-14 pr-4 py-2.5 text-white font-mono font-bold text-base focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[1500, 3500, 8000, 15000, 30000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCalcAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                    calcAmount === amt
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  KES {(amt || 0).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Daily Yield (10%)</span>
              <span className="text-base font-black font-mono text-emerald-400">
                KES {(dailyAccrual || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-zinc-500 block">Credited daily</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">300% Net Profit</span>
              <span className="text-base font-black font-mono text-amber-300">
                +KES {(monthlyReturn || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500 block">30 days return</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Payout (400%)</span>
              <span className="text-base font-black font-mono text-white">
                KES {(totalPayout || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 block font-semibold">Principal + Profit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Investment Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {INVESTMENT_PLANS.map((plan) => {
          const isProcessing = processingPlanId === plan.id;
          const hasEnoughDeposit = userDepositBalance >= plan.minDeposit;
          const shortfall = Math.max(0, plan.minDeposit - userDepositBalance);

          return (
            <div
              key={plan.id}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition p-5 flex flex-col justify-between space-y-4 shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {plan.badge}
                  </span>
                  <span className="text-[11px] font-bold text-amber-400">300% Monthly</span>
                </div>

                <h3 className="text-lg font-bold text-white">{plan.name}</h3>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Minimum Capital</span>
                  <span className="text-2xl font-black font-mono text-white">
                    KES {(plan.minDeposit || 0).toLocaleString()}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 space-y-2">
                {hasEnoughDeposit ? (
                  <button
                    onClick={() => handleInvestClick(plan)}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition active:scale-[0.99] cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deploying with Deposit...
                      </span>
                    ) : (
                      <>
                        <span>Invest KES {(plan.minDeposit || 0).toLocaleString()} (Available)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleInvestClick(plan)}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Deposit KES {shortfall.toLocaleString()} to Invest</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active User Portfolios */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-emerald-400" />
          <span>My Active Investment Portfolios ({activeInvestments.length})</span>
        </h3>

        {activeInvestments.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-800">
            <TrendingUp className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">
              You have no active investment contracts. Choose a plan above to start earning 300% monthly return.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeInvestments.map((inv) => {
              const isHarvesting = harvestingId === inv.id;
              return (
                <div
                  key={inv.id}
                  className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-md w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{inv.planName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        30-Day Growth Active
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Capital Deployed</span>
                        <span className="text-white font-bold">KES {(inv.amountInvested || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Expected Payout (400%)</span>
                        <span className="text-amber-300 font-bold">KES {(inv.expectedTotalPayout || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>30-Day Contract Progress</span>
                        <span>{inv.progressPercent || 10}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                          style={{ width: `${Math.min(100, inv.progressPercent || 10)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Accrued Yield</span>
                      <span className="text-lg font-black font-mono text-emerald-400">
                        KES {(inv.currentEarned || 0).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleHarvest(inv.id)}
                      disabled={isHarvesting || inv.currentEarned <= 0}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      {isHarvesting ? (
                        <span>Harvesting...</span>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Harvest Yield</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
