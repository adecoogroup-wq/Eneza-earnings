import React from 'react';
import { NotificationItem } from '../../types';
import { Bell, CheckCheck, X, DollarSign, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm h-full bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              <p className="text-[11px] text-zinc-400">{notifications.filter((n) => !n.isRead).length} unread alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-zinc-950/40 border-b border-zinc-800/80 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllAsRead}
            className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            onClick={onClearNotifications}
            className="text-zinc-500 hover:text-zinc-300"
          >
            Clear all
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-zinc-400" />
              No notifications yet. You're all caught up!
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border transition ${
                  notif.isRead
                    ? 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400'
                    : 'bg-zinc-950 border-emerald-500/30 text-zinc-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    notif.type === 'money'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : notif.type === 'task'
                      ? 'bg-teal-500/10 text-teal-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {notif.type === 'money' ? (
                      <DollarSign className="w-3.5 h-3.5" />
                    ) : notif.type === 'task' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-zinc-100 truncate">{notif.title}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
