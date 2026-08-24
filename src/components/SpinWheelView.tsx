import React, { useState, useRef } from 'react';
import { User, Transaction } from '../types';
import { WHEEL_PRIZES } from '../data/mockData';
import { Disc, Sparkles, Award, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinWheelViewProps {
  user: User;
  onSpinWin: (rewardAmount: number, newTx?: Transaction) => void;
  onBuySpins: () => void;
}

export const SpinWheelView: React.FC<SpinWheelViewProps> = ({ user, onSpinWin, onBuySpins }) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDegree, setRotationDegree] = useState<number>(0);
  const [lastWonPrize, setLastWonPrize] = useState<{ label: string; value: number } | null>(null);

  const numSlices = WHEEL_PRIZES.length;
  const sliceAngle = 360 / numSlices;

  const handleSpin = () => {
    if (user.spinsRemaining <= 0) {
      alert('You have 0 spins remaining today. Upgrade your VIP Tier or deposit to get extra lucky spins!');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setLastWonPrize(null);

    // Determine random winning slice
    // Weight index 0 (KES 100), 1 (KES 250), 3 (KES 500), 4 (KES 75), 6 (KES 50), 7 (Jackpot)
    const winningIndex = Math.floor(Math.random() * numSlices);
    const winningPrize = WHEEL_PRIZES[winningIndex];

    // Calculate rotation: 5 full rotations (1800deg) + slice offset
    // In standard SVG wheel pointer at top (270 deg or 90 deg depending on orientation)
    // Slice i is at angle (i * sliceAngle)
    const extraRotations = 360 * 6; // 6 full circles
    // To land winningIndex at the top pointer:
    const targetAngle = extraRotations + (360 - winningIndex * sliceAngle - sliceAngle / 2);
    const newTotalRotation = rotationDegree + targetAngle;

    setRotationDegree(newTotalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setLastWonPrize(winningPrize);

      if (winningPrize.value > 0) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.5 },
            colors: ['#10b981', '#f59e0b', '#34d399', '#ffffff']
          });
        } catch {
          // ignore
        }

        // Generate Transaction for winning
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
        let receiptCode = 'QK';
        for (let i = 0; i < 8; i++) {
          receiptCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const winTx: Transaction = {
          id: `tx_spin_${Date.now()}`,
          mpesaReceiptNo: receiptCode,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userPhone: user.phone,
          type: 'spin_reward',
          amount: winningPrize.value,
          fee: 0,
          netAmount: winningPrize.value,
          status: 'completed',
          description: `Spin & Win Wheel Daily Cash Prize (${winningPrize.label})`,
          createdAt: new Date().toISOString(),
        };

        onSpinWin(winningPrize.value, winTx);
      } else {
        onSpinWin(0);
      }
    }, 4200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-teal-950/60 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Disc className="w-8 h-8 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                Daily Jackpot Game
              </span>
              <span className="text-xs text-amber-400 font-bold">Up to KES 2,500 Instant Cash</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Lucky Spin & Win</h2>
            <p className="text-xs text-zinc-400">
              Spin the official Eneza wheel to win instant M-Pesa credited cash rewards!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Spins Available</span>
            <span className="text-lg font-black font-mono text-emerald-400">{user.spinsRemaining}</span>
          </div>
          <button
            onClick={onBuySpins}
            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition shadow-sm"
          >
            + Get Extra Spins
          </button>
        </div>
      </div>

      {/* Wheel Stage Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wheel Canvas / SVG */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Top Pointer Triangle Indicator */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
            <div className="w-6 h-8 bg-amber-400 shadow-xl shadow-amber-500/50 clip-triangle transform rotate-180 -mb-2 border-t-2 border-white rounded-t-sm" />
          </div>

          {/* Rotating Wheel Container */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-6">
            <div
              className="w-full h-full rounded-full border-8 border-zinc-950 shadow-2xl overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0.9, 0.25, 1)"
              style={{ transform: `rotate(${rotationDegree}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {WHEEL_PRIZES.map((prize, i) => {
                  const angle = (360 / numSlices);
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;
                  
                  const startX = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const startY = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const endX = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const endY = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  const pathData = `M 50 50 L ${startX} ${startY} A 50 50 0 0 1 ${endX} ${endY} Z`;

                  // Text position
                  const textAngle = startAngle + angle / 2;
                  const textRad = (Math.PI * textAngle) / 180;
                  const textX = 50 + 32 * Math.cos(textRad);
                  const textY = 50 + 32 * Math.sin(textRad);

                  return (
                    <g key={i}>
                      <path d={pathData} fill={prize.color} stroke="#18181b" strokeWidth="0.8" />
                      <text
                        x={textX}
                        y={textY}
                        fill={prize.textColor}
                        fontSize="3.8"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                      >
                        {prize.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Golden Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-4 border-zinc-950 flex items-center justify-center shadow-lg text-zinc-950 font-black text-xs">
              ENEZA
            </div>
          </div>

          {/* Spin Trigger Button */}
          <button
            type="button"
            disabled={isSpinning || user.spinsRemaining <= 0}
            onClick={handleSpin}
            className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white text-sm shadow-xl shadow-emerald-900/40 transition active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Spinning...' : user.spinsRemaining > 0 ? 'Spin The Wheel Now' : 'No Spins Remaining'}
          </button>

          {/* Result Banner */}
          {lastWonPrize && (
            <div className="mt-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>You Won: {lastWonPrize.label}!</span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                {lastWonPrize.value > 0
                  ? `+KES ${lastWonPrize.value} has been credited to your available balance.`
                  : 'Better luck next time! Try another spin for the Jackpot.'}
              </p>
            </div>
          )}
        </div>

        {/* Prize List & Rules */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Wheel Prize Matrix
            </h3>
            <div className="space-y-2 text-xs">
              {WHEEL_PRIZES.map((prize, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: prize.color }} />
                    <span className="text-zinc-300 font-medium">{prize.label}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">
                    {prize.value > 0 ? `+KES ${prize.value}` : 'Bonus'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-2">
            <h4 className="font-semibold text-zinc-200">Spin Rules & Multipliers</h4>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
              <li>All registered users receive 1 Free Spin every 24 hours.</li>
              <li>Gold & Platinum VIP accounts unlock up to 15 Daily Spins.</li>
              <li>Winnings are instantly credited to your M-Pesa balance.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
