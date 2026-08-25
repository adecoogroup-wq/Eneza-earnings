import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpRight, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { generateSingleBotActivity } from '../utils/botActivity';

interface ToastData {
  id: string;
  name: string;
  phone: string;
  action: string;
  amount: string;
  timeAgo: string;
  type: string;
}

export const FloatingToast: React.FC = () => {
  const [currentToast, setCurrentToast] = useState<ToastData>(() => {
    const item = generateSingleBotActivity(0);
    return {
      id: item.id,
      name: item.memberName ? `${item.memberName.split(' ')[0]} ${item.memberName.split(' ')[1]?.[0] || ''}.` : `Member ${item.phone.slice(0, 4)}`,
      phone: item.phone,
      action: item.actionTitle || 'cashed out via M-Pesa',
      amount: `KES ${item.amount.toLocaleString()}`,
      timeAgo: 'Just now',
      type: item.type,
    };
  });
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (isDismissed) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        const item = generateSingleBotActivity(0);
        setCurrentToast({
          id: item.id,
          name: item.memberName ? `${item.memberName.split(' ')[0]} ${item.memberName.split(' ')[1]?.[0] || ''}.` : `Member ${item.phone.slice(0, 4)}`,
          phone: item.phone,
          action: item.actionTitle || 'cashed out via M-Pesa',
          amount: `KES ${item.amount.toLocaleString()}`,
          timeAgo: 'Just now',
          type: item.type,
        });
        setIsVisible(true);
        setAnimKey((prev) => prev + 1);
      }, 350);
    }, 5500);

    return () => clearInterval(interval);
  }, [isDismissed]);

  const toast = currentToast;

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
