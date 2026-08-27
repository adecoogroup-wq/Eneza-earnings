import React, { useState } from 'react';
import { User, Referral } from '../types';
import { Users, Copy, Check, Share2, Award, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';

interface ReferralsViewProps {
  user: User;
  referrals: Referral[];
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({ user, referrals }) => {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://enezaearnings.ke';
  const referralLink = `${baseUrl}/?ref=${user.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Join Eneza Earnings today and earn KES 500+ daily doing simple tasks with instant M-Pesa withdrawals! Use my link to get a KES 150 welcome bonus: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const totalCommissionEarned = referrals.reduce((sum, r) => sum + r.commissionEarned, 0);
  const activeReferralsCount = referrals.filter((r) => r.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-teal-950/50 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              3-Tier Multi-Level Affiliate
            </span>
            <span className="text-xs text-amber-400 font-bold">Earn up to KES 500 per Invite</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Affiliate & Referral Network</h2>
          <p className="text-xs text-zinc-400">
            Share your link with friends, family, and social channels to build passive lifetime commissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Total Affiliate Income</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              KES {(totalCommissionEarned || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Referral Link & Sharing Box */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Share2 className="w-4 h-4 text-emerald-400" />
          Your Unique Referral Link
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="w-full flex-1 p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 select-all truncate">
            {referralLink}
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition flex items-center justify-center gap-2 shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Link!' : 'Copy Link'}
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition flex items-center justify-center gap-2 shrink-0"
          >
            <Share2 className="w-4 h-4" />
            Share WhatsApp
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
          <span>Referral Code: <strong className="text-emerald-400 font-mono">{user.referralCode}</strong></span>
          <span>•</span>
          <span>Active Downline: <strong className="text-white">{activeReferralsCount} Members</strong></span>
        </div>
      </div>

      {/* Commission Structure 3-Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/20 font-black text-4xl">L1</div>
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
            Direct Tier (Level 1)
          </span>
          <h4 className="text-xl font-bold text-white font-mono">KES 300 - 500</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Earned immediately upon account activation for anyone who registers directly through your referral link.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-zinc-700/20 font-black text-4xl">L2</div>
          <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase">
            Secondary Tier (Level 2)
          </span>
          <h4 className="text-xl font-bold text-white font-mono">KES 150 - 200</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Earned when your direct recruits invite their own network of friends and partners.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-zinc-700/20 font-black text-4xl">L3</div>
          <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase">
            Tertiary Tier (Level 3)
          </span>
          <h4 className="text-xl font-bold text-white font-mono">KES 50 - 100</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Passive depth reward from 3rd generation invites in your growing affiliate tree.
          </p>
        </div>
      </div>

      {/* Downline Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          Invited Members & Downline ({referrals.length})
        </h3>

        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono uppercase tracking-wider">
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Tier Level</th>
                  <th className="pb-3">Date Joined</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3 font-semibold text-zinc-200">{ref.referredUserName}</td>
                    <td className="py-3 font-mono text-zinc-400">{ref.referredUserPhone}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                        Level {ref.tierLevel}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400">{ref.date}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ref.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      KES {(ref.commissionEarned || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center space-y-3 bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-sm font-bold text-zinc-200">No invited members yet (0)</p>
              <p className="text-xs text-zinc-400">
                You haven't invited anyone yet. Copy and share your unique referral link to start earning up to KES 500 per activated recruit.
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
