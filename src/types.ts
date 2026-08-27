export type UserRole = 'user' | 'admin' | 'verified_agent';

export type TierLevel = 'Standard' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond VIP';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string; // e.g. 0712345678 or 254712345678
  email?: string;
  password?: string;
  role: UserRole;
  isActivated: boolean; // Account activation status
  tier: TierLevel;
  balance: number; // in KES (withdrawable / main balance)
  depositBalance: number; // in KES (active deposit balance for claiming bonuses/packages)
  pendingBalance: number;
  totalWithdrawn: number;
  totalEarned: number;
  referralCode: string;
  referredBy?: string;
  spinsRemaining: number;
  tasksCompletedToday: number;
  maxTasksPerDay: number;
  createdAt: string;
  avatarUrl?: string;
  // WhatsApp & Pipeline Extensions
  whatsappBalance: number; // accumulated earnings from status views (1 view = KES 100)
  pendingCashbackTotal: number; // total unreleased cashback
  activeWhatsAppPackage?: string; // 'elite_500' | 'elite_1000' | 'premium_3000'
  isAuthorizedPackagePurchased: boolean; // KES 5,000 package
  isUnlockMpesaPurchased: boolean; // KES 7,000 package
  isAutomationPackagePurchased: boolean; // KES 2,500 package
  isVerifiedAgentPurchased: boolean; // KES 5,000 package
  isUniversePackagePurchased: boolean; // KES 7,000 package
}

export type TaskCategory = 'video' | 'trivia' | 'survey' | 'social' | 'captcha' | 'review';

export interface EarningTask {
  id: string;
  title: string;
  category: TaskCategory;
  description: string;
  reward: number; // in KES
  durationSeconds: number;
  iconName: string;
  difficulty: 'Easy' | 'Medium' | 'Instant';
  isCompleted?: boolean;
  quizQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[];
  surveyQuestions?: {
    question: string;
    options: string[];
  }[];
  videoUrl?: string;
  actionUrl?: string;
  captchaCode?: string;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'task_reward'
  | 'referral_bonus'
  | 'spin_reward'
  | 'tier_upgrade'
  | 'activation_fee'
  | 'whatsapp_package'
  | 'package_purchase'
  | 'cashback_claim'
  | 'cashback_fee'
  | 'authorize_package'
  | 'unlock_mpesa'
  | 'automation_package'
  | 'verified_agent'
  | 'universe_package'
  | 'investment_deposit'
  | 'investment_yield'
  | 'whatsapp_views_earning';

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'rejected';

export interface Transaction {
  id: string;
  mpesaReceiptNo: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: TransactionType;
  amount: number; // in KES
  fee: number;
  netAmount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  approvedBy?: string;
  notes?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  referredUserPhone: string;
  date: string;
  status: 'Active' | 'Pending Activation';
  tierLevel: 1 | 2 | 3;
  commissionEarned: number;
}

export interface VipPackage {
  id: string;
  name: TierLevel;
  price: number;
  dailyEarningPotential: string;
  tasksLimit: number;
  bonusMultiplier: number;
  features: string[];
  recommended?: boolean;
  color: string;
}

export interface LivePayoutItem {
  id: string;
  phone: string;
  amount: number;
  timeAgo: string;
  type: 'withdrawal' | 'spin' | 'task' | 'referral' | 'package' | 'whatsapp' | 'investment';
  memberName?: string;
  location?: string;
  actionTitle?: string;
  mpesaRef?: string;
  timestampMs?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'money' | 'alert' | 'system' | 'task';
}

// WhatsApp Specific Packages
export interface WhatsAppPackageItem {
  id: 'elite_500' | 'elite_1000' | 'premium_3000';
  name: string;
  price: number;
  cashbackBonus: number;
  adFrequency: string; // "Advertise twice a week" | "Advertise 4 times a week" | "Advertise daily"
  description: string;
  badge: string;
  features: string[];
}

// Cashback Items Record
export interface CashbackItem {
  id: string;
  sourcePackageName: string;
  packagePrice: number;
  cashbackAmount: number;
  unlockFeeRequired: number; // 40% of packagePrice
  status: 'pending_unlock' | 'unlocked';
  createdAt: string;
  unlockedAt?: string;
}

// WhatsApp Status View Submission
export interface WhatsAppSubmission {
  id: string;
  date: string;
  productName: string;
  viewCount: number;
  earnedAmount: number; // viewCount * 100
  screenshotUrl: string;
  status: 'approved' | 'pending' | 'reviewing';
}

// Investment Plan Definition
export interface InvestmentPlan {
  id: string;
  name: string;
  minDeposit: number;
  monthlyReturnPercent: number; // e.g. 300%
  durationDays: number;
  dailyInterestPercent: number; // e.g. 10% daily (300% / 30)
  payoutFrequency: string;
  riskRating: 'Guaranteed Principal' | 'High Yield Insured';
  badge: string;
  features: string[];
}

// Active User Investment
export interface ActiveInvestment {
  id: string;
  planId: string;
  planName: string;
  amountInvested: number;
  expectedTotalPayout: number; // amountInvested * 4 (300% profit + 100% principal = 400% or 300% return)
  currentEarned: number;
  progressPercent: number;
  startDate: string;
  maturityDate: string;
  status: 'active' | 'matured' | 'claimed';
}

// Daily Product Creative
export interface DailyProductItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  targetViewsRate: string;
  rewardPerView?: string;
  caption: string;
  imageBanner: string;
  downloadFileName: string;
  dayBadge?: string;
  headlineMain?: string;
  headlineSub?: string;
  ribbonText?: string;
  sealTopText?: string;
  sealBottomText?: string;
  featuresList?: string[];
  footerManagedBy?: string;
}

// PayHero & Payment Gateway Integration Settings (API Key, Username, Channel ID)
export interface PayHeroConfig {
  apiKey: string;
  username: string;
  channelId: string;
  apiSecret?: string;
  serviceId?: string;
  paybillOrTill?: string;
  channelType?: 'Paybill' | 'Till' | 'B2C Payout';
  callbackUrl?: string;
  mode?: 'Live' | 'Sandbox';
  autoDisburse?: boolean;
  minDisbursalLimit?: number;
  maxDisbursalLimit?: number;
}


