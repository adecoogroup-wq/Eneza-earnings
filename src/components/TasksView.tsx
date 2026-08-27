import React, { useState } from 'react';
import { EarningTask, User } from '../types';
import {
  CheckSquare,
  PlaySquare,
  HelpCircle,
  ClipboardList,
  ShieldCheck,
  Share2,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface TasksViewProps {
  tasks: EarningTask[];
  user: User;
  onSelectTask: (task: EarningTask) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, user, onSelectTask }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Tasks' },
    { id: 'video', label: 'Video Ads' },
    { id: 'survey', label: 'Surveys' },
    { id: 'captcha', label: 'Captchas' },
    { id: 'social', label: 'Social' },
    { id: 'review', label: 'App Reviews' },
  ];

  const filteredTasks = tasks.filter((t) =>
    selectedCategory === 'all' ? true : t.category === selectedCategory
  );

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalPotentialReward = tasks.reduce((sum, t) => sum + (t.isCompleted ? 0 : t.reward), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              Verified Partner Micro-Gigs
            </span>
            <span className="text-xs text-zinc-400">Daily Reset at 00:00 EAT</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Daily Earning Tasks</h2>
          <p className="text-xs text-zinc-400">
            Complete quick videos, surveys, and app tasks to get credited in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Today's Progress</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {completedCount} / {tasks.length} Completed
            </span>
          </div>
          <div className="text-right px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Unclaimed Rewards</span>
            <span className="text-sm font-bold font-mono text-white">
              KES {(totalPotentialReward || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          return (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                task.isCompleted
                  ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                  : 'bg-zinc-900/70 border-zinc-800 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20'
              }`}
            >
              <div>
                {/* Top Badge & Reward */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] font-mono uppercase text-zinc-400 font-bold">
                    {task.category}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-sm">
                    <span>+KES {task.reward}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-zinc-100 mb-1.5">{task.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                  {task.description}
                </p>
              </div>

              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-3 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{task.durationSeconds}s duration</span>
                  </div>
                  <span className="text-zinc-400">{task.difficulty}</span>
                </div>

                {/* CTA */}
                {task.isCompleted ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400/80 text-xs font-semibold flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Reward Collected
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition flex items-center justify-center gap-2"
                  >
                    <span>Start Task</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
