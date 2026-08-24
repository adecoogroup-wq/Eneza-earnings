import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpRight, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface ToastData {
  id: string;
  name: string;
  phone: string;
  action: string;
  amount: string;
  timeAgo: string;
  type: 'withdrawal' | 'spin' | 'task' | 'referral';
}

const SAMPLE_LIVE_TESTIMONIALS: ToastData[] = [
  {
    id: 't1',
    name: 'Dennis K.',
    phone: '0712***678',
    action: 'cashed out via M-Pesa',
    amount: 'KES 3,500',
    timeAgo: 'Just now',
    type: 'withdrawal',
  },
  {
    id: 't2',
    name: 'Faith W.',
    phone: '0722***410',
    action: 'won on Lucky Wheel',
    amount: 'KES 1,000',
    timeAgo: '28s ago',
    type: 'spin',
  },
  {
    id: 't3',
    name: 'Kevin O.',
    phone: '0745***890',
    action: 'received Level 1 Affiliate Bonus',
    amount: 'KES 500',
    timeAgo: '45s ago',
    type: 'referral',
  },
  {
    id: 't4',
    name: 'Grace M.',
    phone: '0790***231',
    action: 'completed Kenya Tech Survey',
    amount: 'KES 250',
    timeAgo: '1m ago',
    type: 'task',
  },
  {
    id: 't5',
    name: 'Brian W.',
    phone: '0733***554',
    action: 'withdrew via M-Pesa Instant',
    amount: 'KES 5,200',
    timeAgo: '2m ago',
    type: 'withdrawal',
  },
  {
    id: 't6',
    name: 'Mercy A.',
    phone: '0701***992',
    action: 'completed Trivia Task',
    amount: 'KES 180',
    timeAgo: '3m ago',
    type: 'task',
  },
];

export const FloatingToast: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (isDismissed) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SAMPLE_LIVE_TESTIMONIALS.length);
        setIsVisible(true);
        setAnimKey((prev) => prev + 1);
      }, 350);
    }, 7000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  const toast = SAMPLE_LIVE_TESTIMONIALS[currentIndex];

  if (isDismissed || !isVisible) return null;

  return (
    <aside
      id="globalToastTarget"
      aria-label="Live Testimonial Feed"
      className="fixed bottom-3 right-3 z-30 flex justify-end pointer-events-none"
    >
      <div
        key={animKey}
        className="pointer-events-auto flex items-center gap-2 bg-zinc-950/90 hover:bg-zinc-950 text-zinc-100 border border-zinc-800/90 hover:border-emerald-500/50 shadow-lg px-2.5 py-1.5 rounded-full backdrop-blur-md max-w-[280px] transition-all text-[11px]"
      >
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <span className="font-bold text-zinc-200 truncate">{toast.name}</span>
          <span className="font-mono font-bold text-emerald-400 shrink-0">{toast.amount}</span>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded-full hover:bg-zinc-800 transition shrink-0 cursor-pointer ml-auto"
          title="Dismiss testimonials"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
