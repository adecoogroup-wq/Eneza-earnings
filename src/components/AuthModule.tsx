import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { ShieldCheck, UserCheck, Smartphone, KeyRound, Sparkles, ArrowRight, Gift, CheckCircle2 } from 'lucide-react';
import { captureReferralCodeFromUrl, getCapturedReferralCode, clearCapturedReferralCode, fetchRemoteUsers } from '../utils/userSync';
import { generateNewAccountNumber } from '../utils/accountNumber';

interface AuthModuleProps {
  onLogin: (user: User) => void;
  registeredUsers: User[];
  onRegister: (newUser: User) => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({ onLogin, registeredUsers, onRegister }) => {
  const [authView, setAuthView] = useState<'signin' | 'signup'>(() => {
    // If user arrived via referral link (?ref=...), open signup form by default
    const refCode = captureReferralCodeFromUrl();
    return refCode ? 'signup' : 'signin';
  });

  // Sign in state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Sign up state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralInput, setReferralInput] = useState<string>(() => {
    return getCapturedReferralCode() || '';
  });
  const [signUpError, setSignUpError] = useState('');

  // Check URL on mount for referral code
  useEffect(() => {
    const code = captureReferralCodeFromUrl();
    if (code) {
      setReferralInput(code);
      setAuthView('signup');
    }
  }, []);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const cleanInput = signInIdentifier.trim().toLowerCase();
    const cleanPhoneDigits = signInIdentifier.trim().replace(/\D/g, '');
    const cleanPassword = signInPassword.trim();
    
    // Check if logging in as Admin via admin identifier aliases and passwords
    const isAdminIdentifier =
      cleanInput === 'admin_hq' ||
      cleanInput === 'admin' ||
      cleanInput === 'administrator' ||
      cleanInput === 'superadmin' ||
      cleanInput === 'admin@enezaearnings.ke' ||
      cleanInput === 'admin@eneza.ke' ||
      cleanInput === 'admin@enezaearnings.com' ||
      cleanPhoneDigits === '0799000111' ||
      cleanPhoneDigits.endsWith('799000111');

    const isAdminPassword =
      cleanPassword === 'Admin#Eneza2026!SecureKey' ||
      cleanPassword === 'admin123' ||
      cleanPassword === 'Admin123' ||
      cleanPassword === 'Admin@123' ||
      cleanPassword === 'admin_hq' ||
      cleanPassword === 'admin' ||
      cleanPassword === 'password123';

    if (isAdminIdentifier && isAdminPassword) {
      const adminUser = registeredUsers.find((u) => u.role === 'admin' || u.id === 'usr_admin') || INITIAL_USERS[0];
      onLogin({
        ...adminUser,
        role: 'admin',
        isActivated: true,
      });
      return;
    }

    // Standard authentication: Find user across registered database and initial users with registeredUsers taking priority
    const usersMap = new Map<string, User>();
    INITIAL_USERS.forEach((u) => usersMap.set(u.id, { ...u }));
    registeredUsers.forEach((u) => {
      const ex = usersMap.get(u.id);
      usersMap.set(u.id, ex ? { ...ex, ...u } : { ...u });
    });
    let allUsersPool = Array.from(usersMap.values());

    const findMatch = (pool: User[]) =>
      pool.find((u) => {
        const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
        const isPhoneMatch =
          cleanPhoneDigits.length >= 7 &&
          (uPhoneDigits === cleanPhoneDigits ||
            uPhoneDigits.endsWith(cleanPhoneDigits.slice(-9)) ||
            cleanPhoneDigits.endsWith(uPhoneDigits.slice(-9)));

        const isUserOrEmailMatch =
          u.username.toLowerCase() === cleanInput ||
          (u.email && u.email.toLowerCase() === cleanInput) ||
          (u.firstName && u.firstName.toLowerCase() === cleanInput);

        const isPassMatch = (u.password || '').trim() === cleanPassword;

        return (isPhoneMatch || isUserOrEmailMatch) && isPassMatch;
      });

    let user = findMatch(allUsersPool);

    if (!user) {
      // Check live central registry if not found in current pool
      try {
        const remoteUsers = await fetchRemoteUsers();
        if (remoteUsers && remoteUsers.length > 0) {
          user = findMatch(remoteUsers);
        }
      } catch (err) {
        console.warn('Fallback remote login search failed:', err);
      }
    }

    if (user) {
      onLogin(user);
    } else {
      setSignInError('Account not found or incorrect password. Please verify your credentials or register a new account.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');

    if (!fullName.trim() || !phone.trim() || !signupPassword) {
      setSignUpError('Please fill out all required fields.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setSignUpError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    const cleanPhoneDigits = phone.trim().replace(/\D/g, '');
    const existing = registeredUsers.find((u) => {
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
      const isPhoneDup =
        cleanPhoneDigits.length >= 7 &&
        (uPhoneDigits === cleanPhoneDigits ||
          uPhoneDigits.endsWith(cleanPhoneDigits.slice(-9)) ||
          cleanPhoneDigits.endsWith(uPhoneDigits.slice(-9)));

      return isPhoneDup;
    });

    const nameParts = fullName.trim().split(' ');
    const first = nameParts[0] || 'Member';
    const last = nameParts.slice(1).join(' ') || '';
    const generatedUsername = first.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);
    const effectiveReferral = (referralInput || getCapturedReferralCode() || '').trim().toUpperCase();

    let userToSave: User;

    if (existing) {
      // Update existing account credentials and profile info
      userToSave = {
        ...existing,
        firstName: first || existing.firstName,
        lastName: last || existing.lastName,
        phone: phone.trim(),
        email: email.trim() || existing.email || `${existing.username || generatedUsername}@enezaearnings.ke`,
        password: signupPassword || existing.password,
        referredBy: effectiveReferral || existing.referredBy,
      };
    } else {
      userToSave = {
        id: `usr_${Date.now()}`,
        username: generatedUsername,
        firstName: first,
        lastName: last,
        phone: phone.trim(),
        accountNumber: generateNewAccountNumber(phone),
        email: email.trim() || `${generatedUsername}@enezaearnings.ke`,
        password: signupPassword,
        role: 'user',
        isActivated: false,
        tier: 'Standard',
        balance: 0,
        depositBalance: 0,
        pendingBalance: 0,
        totalWithdrawn: 0,
        totalEarned: 0,
        referralCode: `EE${Math.floor(1000 + Math.random() * 9000)}`,
        referredBy: effectiveReferral || undefined,
        spinsRemaining: 1, // Welcome 1 spin bonus
        tasksCompletedToday: 0,
        maxTasksPerDay: 5,
        whatsappBalance: 0,
        pendingCashbackTotal: 0,
        isAuthorizedPackagePurchased: false,
        isUnlockMpesaPurchased: false,
        isAutomationPackagePurchased: false,
        isVerifiedAgentPurchased: false,
        isUniversePackagePurchased: false,
        createdAt: new Date().toISOString(),
      };
    }

    clearCapturedReferralCode();
    onRegister(userToSave);
    onLogin(userToSave);
  };

  return (
    <div id="authContainer" className="flex min-h-screen flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 bg-[#070e1b] text-zinc-100 relative overflow-hidden">
      {/* Deep atmosphere glow matching screenshots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-20 w-[450px] h-[450px] bg-[#1a1130] blur-[130px] rounded-full opacity-60" />
        <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-[#0c223a] blur-[120px] rounded-full opacity-60" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[450px] bg-[#0a1e2f] blur-[140px] rounded-full opacity-50" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[420px]">
        {/* ========================================== */}
        {/* SIGN IN PANEL (Exact Match to Screenshot 1) */}
        {/* ========================================== */}
        {authView === 'signin' && (
          <div className="space-y-6">
            {/* Header branding */}
            <div className="text-left px-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-1.5">
                <span className="text-white">Eneza</span>
                <span className="text-[#FF386B]">Earnings</span>
              </h1>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <span>Sign in</span>
                <span className="text-2xl">🔐</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Access your wallets, packages, and earnings.
              </p>
            </div>

            {signInError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            {/* Dark Container Box */}
            <div id="signInPanel" className="bg-[#0b1626]/90 border border-[#182a44] p-6 sm:p-7 rounded-[26px] shadow-2xl backdrop-blur-xl space-y-5">
              <form id="signInForm" onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label htmlFor="signin_email" className="block text-sm font-semibold text-slate-300 mb-2">
                    Phone or email
                  </label>
                  <input
                    type="text"
                    id="signin_email"
                    required
                    value={signInIdentifier || ''}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="2547... or email"
                    className="block w-full rounded-2xl bg-[#08111e] border border-[#1b2f4c] px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:border-[#FF386B] focus:outline-none transition shadow-inner"
                  />
                </div>

                <div>
                  <label htmlFor="signin_password" className="block text-sm font-semibold text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="signin_password"
                    required
                    value={signInPassword || ''}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder=""
                    className="block w-full rounded-2xl bg-[#08111e] border border-[#1b2f4c] px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:border-[#FF386B] focus:outline-none transition shadow-inner"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btnAuthenticateSession"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF3358] via-[#FF4868] to-[#FF6247] hover:opacity-95 text-white font-bold text-base shadow-lg shadow-rose-950/40 transition active:scale-[0.99] cursor-pointer text-center"
                  >
                    Sign in
                  </button>
                </div>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthView('signup')}
                  className="text-sm text-slate-400 hover:text-white transition cursor-pointer"
                >
                  No account? <span className="text-slate-300 font-medium hover:underline">Register</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SIGN UP PANEL (Exact Match to Screenshot 2) */}
        {/* ========================================== */}
        {authView === 'signup' && (
          <div className="space-y-6">
            {/* Header branding */}
            <div className="text-left px-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-1.5">
                <span className="text-white">Eneza</span>
                <span className="text-[#FF386B]">Earnings</span>
              </h1>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <span>Create account</span>
                <span className="text-2xl">✨</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Join Eneza Earnings and start with deposit, WhatsApp earn, and packages.
              </p>
            </div>

            {signUpError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            {/* Dark Container Box */}
            <div id="signUpPanel" className="bg-[#0b1626]/90 border border-[#182a44] p-6 sm:p-7 rounded-[26px] shadow-2xl backdrop-blur-xl space-y-4">
              <form id="signUpForm" onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="signup_fullname" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    id="signup_fullname"
                    required
                    value={fullName || ''}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder=""
                    className="block w-full rounded-2xl bg-[#08111e] border border-[#1b2f4c] px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-[#FF386B] focus:outline-none transition shadow-inner"
                  />
                </div>

                <div>
                  <label htmlFor="signup_phone" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    M-Pesa phone
                  </label>
                  <input
                    type="tel"
                    id="signup_phone"
                    required
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="block w-full rounded-2xl bg-[#08111e] border border-[#1b2f4c] px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-[#FF386B] focus:outline-none transition shadow-inner font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="signup_email" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Email <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    id="signup_email"
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="block w-full rounded-2xl bg-[#08111e] border border-[#1b2f4c] px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-[#FF386B] focus:outline-none transition shadow-inner"
                  />
                </div>

                <div>
                  <label htmlFor="signup_password" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    id="signup_password"
                    required
                    value={signupPassword || ''}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder=""
                    className="block w-full rounded-2xl bg-[#08111e] border border-[#1b2f4c] px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-[#FF386B] focus:outline-none transition shadow-inner"
                  />
                </div>

                <div>
                  <label htmlFor="signup_confirm_password" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    id="signup_confirm_password"
                    required
                    value={confirmPassword || ''}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=""
                    className="block w-full rounded-2xl bg-[#08111e] border border-[#1b2f4c] px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-[#FF386B] focus:outline-none transition shadow-inner"
                  />
                </div>

                {/* Referral Code (Auto-filled from ?ref=ENEZAPRO or manual) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="signup_referral" className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>Referral Code</span>
                    </label>
                    {referralInput ? (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Inviter Attached
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-normal">(optional)</span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="signup_referral"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                    placeholder="e.g. ENEZAPRO"
                    className="block w-full rounded-2xl bg-[#08111e] border border-[#1b2f4c] px-4 py-3 text-amber-300 placeholder-slate-500 text-sm font-mono tracking-wider focus:border-amber-500 focus:outline-none transition shadow-inner"
                  />
                  {referralInput && (
                    <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 pl-1">
                      <span>✓ You are joining under inviter:</span>
                      <strong className="text-amber-300 font-mono">{referralInput}</strong>
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF3358] via-[#FF4868] to-[#FF6247] hover:opacity-95 text-white font-bold text-base shadow-lg shadow-rose-950/40 transition active:scale-[0.99] cursor-pointer text-center"
                  >
                    Create account
                  </button>
                </div>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthView('signin')}
                  className="text-sm text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Already have an account? <span className="text-slate-300 font-medium hover:underline">Sign in</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
