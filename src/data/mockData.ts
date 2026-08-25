import {
  User,
  EarningTask,
  VipPackage,
  Transaction,
  Referral,
  NotificationItem,
  LivePayoutItem,
  WhatsAppPackageItem,
  CashbackItem,
  InvestmentPlan,
  ActiveInvestment,
  DailyProductItem,
  PayHeroConfig
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    username: 'admin_hq',
    firstName: 'Executive',
    lastName: 'Admin',
    phone: '0799000111',
    email: 'admin@enezaearnings.ke',
    password: 'Admin#Eneza2026!SecureKey',
    role: 'admin',
    isActivated: true,
    tier: 'Diamond VIP',
    balance: 145000,
    pendingBalance: 0,
    totalWithdrawn: 420000,
    totalEarned: 565000,
    referralCode: 'ENEZAPRO',
    spinsRemaining: 99,
    tasksCompletedToday: 0,
    maxTasksPerDay: 50,
    createdAt: '2026-01-01T00:00:00Z',
    whatsappBalance: 0,
    pendingCashbackTotal: 0,
    activeWhatsAppPackage: 'premium_3000',
    isAuthorizedPackagePurchased: true,
    isUnlockMpesaPurchased: true,
    isAutomationPackagePurchased: true,
    isVerifiedAgentPurchased: true,
    isUniversePackagePurchased: true,
  },
  {
    id: 'usr_001',
    username: 'dennis_ke',
    firstName: 'Dennis',
    lastName: 'Kiprono',
    phone: '0712345678',
    email: 'dennis@example.com',
    password: 'password123',
    role: 'user',
    isActivated: false,
    tier: 'Standard',
    balance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0,
    totalEarned: 0,
    referralCode: 'ENEZA882',
    spinsRemaining: 0,
    tasksCompletedToday: 0,
    maxTasksPerDay: 5,
    createdAt: '2026-06-14T08:30:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    whatsappBalance: 0,
    pendingCashbackTotal: 0,
    activeWhatsAppPackage: 'elite_500',
    isAuthorizedPackagePurchased: false,
    isUnlockMpesaPurchased: false,
    isAutomationPackagePurchased: false,
    isVerifiedAgentPurchased: false,
    isUniversePackagePurchased: false,
  },
];

export const WHATSAPP_PACKAGES: WhatsAppPackageItem[] = [
  {
    id: 'elite_500',
    name: 'Elite Starter Package',
    price: 500,
    cashbackBonus: 1000,
    adFrequency: 'Advertise products twice a week (2x/week)',
    description: 'Entry-level node for active WhatsApp status earners with guaranteed KES 1,000 cashback after activation.',
    badge: 'Popular Starter',
    features: [
      '2 Sponsored Product Posts Per Week',
      'Earn KES 100 per status viewer',
      'Instant KES 1,000 Cashback Bonus Credited',
      'Instant Status Screenshot OCR Verification',
      'Automated WhatsApp Analytics'
    ]
  },
  {
    id: 'elite_1000',
    name: 'Pro Elite Package',
    price: 1000,
    cashbackBonus: 2000,
    adFrequency: 'Advertise products 4 times a week (4x/week)',
    description: 'High-frequency WhatsApp distributor node delivering 4 campaigns weekly with KES 2,000 cashback reward.',
    badge: 'Best Value',
    features: [
      '4 Sponsored Product Campaigns Weekly',
      'Earn KES 100 per unique status viewer',
      'Instant KES 2,000 Cashback Bonus Credited',
      'High-Priority Status View Approval (Under 5 mins)',
      'Direct WhatsApp Channel Ad Assets Access'
    ]
  },
  {
    id: 'premium_3000',
    name: 'Premium WhatsApp Package',
    price: 3000,
    cashbackBonus: 6000,
    adFrequency: 'Advertise products daily (7 days a week)',
    description: 'Maximum daily reach broadcaster node for heavy WhatsApp influencers with KES 6,000 cashback.',
    badge: 'Maximum Yield',
    features: [
      'Daily 7-Days-a-Week High-Ticket Campaigns',
      'Earn KES 100 per viewer with zero daily caps',
      'Instant KES 6,000 Cashback Bonus Credited',
      'VIP Product Creative Downloads in 4K Quality',
      'Dedicated WhatsApp Ad Campaign Strategist'
    ]
  }
];

export const PIPELINE_PACKAGES = {
  automation: {
    id: 'pkg_automation',
    name: 'Automation Package',
    price: 2500,
    cashbackBonus: 5000,
    title: 'Automation Package',
    description: 'Autonomous AI verification bot that auto-syncs WhatsApp views 24/7 without manual screenshot waits and adds KES 5,000 instant cashback.',
    features: [
      'Autonomous 24/7 Status View Sync & Auto-Scraper',
      'Credits KES 5,000 Direct Cashback Bonus Pool',
      'Auto-Posts High-Converting Status Creatives',
      'Instant Continuous WhatsApp Balance Crediting'
    ]
  },
  verifiedAgent: {
    id: 'pkg_verified_agent',
    name: 'Verified Agent Package',
    price: 5000,
    cashbackBonus: 10000,
    title: 'Verified Agent Package',
    description: 'Official Tier-1 Verified Agent partner accreditation. Unlocks executive VIP clearance and credits KES 10,000 instant cashback.',
    features: [
      'Official Tier-1 Verified Agent Accreditation',
      'Credits KES 10,000 Direct Cashback Bonus Pool',
      'Verified Gold Agent Badge & VIP Certificate',
      'High-Priority Direct Payout Channel'
    ]
  },
  universe: {
    id: 'pkg_universe',
    name: 'Universe Package',
    price: 7000,
    cashbackBonus: 14000,
    title: 'Universe Package',
    description: 'The premier elite Universe node. Completes executive clearance, unlocks unlimited instant cashouts, and credits KES 14,000 instant cashback.',
    features: [
      'Unlocks Complete Instant M-Pesa Cashouts',
      'Credits KES 14,000 Direct Cashback Bonus Pool',
      'Zero Disbursal Fees on All Future Outbound Payouts',
      'Perpetual VIP Commission Override on Sub-Network'
    ]
  },
  authorize: {
    id: 'pkg_authorize',
    name: 'Authorize Package',
    price: 5000,
    cashbackBonus: 10000,
    title: 'Authorize Package',
    description: 'Official authorization clearance node. Credits KES 10,000 instant cashback.',
    features: [
      'Authorize WhatsApp Payout Gateway',
      'Credits KES 10,000 Direct Cashback Bonus Pool',
      'Official Safaricom Escrow Authorisation Certificate'
    ]
  },
  unlockMpesa: {
    id: 'pkg_unlock_mpesa',
    name: 'Unlock To M-Pesa Package',
    price: 7000,
    cashbackBonus: 14000,
    title: 'Unlock To M-Pesa',
    description: 'Removes holding periods and activates zero-latency direct M-Pesa routing with KES 14,000 cashback.',
    features: [
      'Credits KES 14,000 Direct Cashback Bonus Pool',
      'Enables 0-Second Automated M-Pesa Disbursals'
    ]
  }
};

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'inv_1500',
    name: 'Starter Yield Plan',
    minDeposit: 1500,
    monthlyReturnPercent: 300,
    durationDays: 30,
    dailyInterestPercent: 10,
    payoutFrequency: 'Daily Accrual / 30-Day Maturity',
    riskRating: 'Guaranteed Principal',
    badge: 'Accessible Entry',
    features: [
      'Invest KES 1,500 → Return KES 4,500 (300% ROI)',
      'Daily 10% Accrual (KES 150/day credited)',
      'Principal Capital 100% Insured via Escrow',
      'Re-invest or Cash Out anytime upon maturity'
    ]
  },
  {
    id: 'inv_3500',
    name: 'Pro Growth Plan',
    minDeposit: 3500,
    monthlyReturnPercent: 300,
    durationDays: 30,
    dailyInterestPercent: 10,
    payoutFrequency: 'Daily Accrual / 30-Day Maturity',
    riskRating: 'Guaranteed Principal',
    badge: 'Popular Choice',
    features: [
      'Invest KES 3,500 → Return KES 10,500 (300% ROI)',
      'Daily 10% Accrual (KES 350/day credited)',
      'Automated Compounding or Daily Harvest',
      'Priority Liquidity Pool Allocation'
    ]
  },
  {
    id: 'inv_8000',
    name: 'Wealth Multiplier Plan',
    minDeposit: 8000,
    monthlyReturnPercent: 300,
    durationDays: 30,
    dailyInterestPercent: 10,
    payoutFrequency: 'Daily Accrual / 30-Day Maturity',
    riskRating: 'High Yield Insured',
    badge: 'High Yield',
    features: [
      'Invest KES 8,000 → Return KES 24,000 (300% ROI)',
      'Daily 10% Accrual (KES 800/day credited)',
      'Dedicated Capital Management Advisor',
      'Instant Early Partial Yield Withdrawals'
    ]
  },
  {
    id: 'inv_20000',
    name: 'Capital Elite Syndicate',
    minDeposit: 20000,
    monthlyReturnPercent: 300,
    durationDays: 30,
    dailyInterestPercent: 10,
    payoutFrequency: 'Daily Accrual / 30-Day Maturity',
    riskRating: 'High Yield Insured',
    badge: 'Executive VIP',
    features: [
      'Invest KES 20,000 → Return KES 60,000 (300% ROI)',
      'Daily 10% Accrual (KES 2,000/day credited)',
      'Zero-Fee Priority B2C M-Pesa Harvest',
      'Direct Access to Institutional Venture Yields'
    ]
  }
];

export const INITIAL_CASHBACK_ITEMS: CashbackItem[] = [];

export const INITIAL_ACTIVE_INVESTMENTS: ActiveInvestment[] = [
  {
    id: 'act_inv_1',
    planId: 'inv_1500',
    planName: 'Starter Yield Plan',
    amountInvested: 1500,
    expectedTotalPayout: 4500,
    currentEarned: 1650,
    progressPercent: 36,
    startDate: '2026-08-11T09:00:00Z',
    maturityDate: '2026-09-10T09:00:00Z',
    status: 'active'
  }
];

export const DAILY_PRODUCTS_CATALOG: DailyProductItem[] = [
  {
    id: 'prod_01',
    dayBadge: 'Sunday Luxury Super Resort',
    title: 'Super Luxury Resort & Private Holiday Haven',
    brand: 'Earnwave Solutions Real Estate',
    category: 'Luxury Resorts & Real Estate',
    targetViewsRate: 'KES 100 per status viewer',
    headlineMain: 'SUPER RESORT',
    headlineSub: 'FOR SALE',
    ribbonText: 'AQUIRE THIS ELEGANT RESORT',
    sealTopText: 'NEWLY',
    sealBottomText: 'BIULT',
    featuresList: [
      'Recreational Centre',
      'Accomondation',
      'GYM Scheme',
      'Enough Packing',
      'Maximum Security',
      'Favourable Services'
    ],
    footerManagedBy: 'PROPERTY MANAGED BY EARNWAVE SOLUTIONS',
    caption: `🏖️ EARNWAVE SOLUTIONS - SUPER RESORT FOR SALE! 🏖️\nAcquire this world-class luxury resort featuring infinity pool, recreational center, gym scheme, ample parking, and maximum 24/7 security!\n\n✨ Newly Built | Ready Freehold Title Deeds | Turnkey Investment\n💰 Target rate KES 100 per viewer. Share to earn today!\n👉 Inquiries and official site bookings managed exclusively by Earnwave Solutions! #EarnwaveSolutions #EnezaEarnings`,
    imageBanner: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop&q=80',
    downloadFileName: 'earnwave_super_resort_for_sale.jpg'
  },
  {
    id: 'prod_02',
    dayBadge: 'Monday Titanium Flagship',
    title: 'Brand New Apple iPhone 16 Pro Max 1TB Titanium Edition',
    brand: 'Earnwave Solutions Tech MegaStore',
    category: 'Flagship Mobile Phones',
    targetViewsRate: 'KES 100 per status viewer',
    headlineMain: 'IPHONE 16 PRO MAX',
    headlineSub: 'FOR SALE',
    ribbonText: 'AQUIRE THIS TITANIUM FLAGSHIP',
    sealTopText: '100%',
    sealBottomText: 'ORIGINAL',
    featuresList: [
      '1TB Titanium Body',
      'A18 Pro Bionic Chip',
      '48MP Fusion Camera',
      'Free MagSafe Case',
      '1-Yr Apple Warranty',
      'Same-Day Delivery'
    ],
    footerManagedBy: 'PRODUCTS MANAGED BY EARNWAVE SOLUTIONS',
    caption: `📱 EARNWAVE SOLUTIONS - FLASH SALE: 50% OFF IPHONE 16 PRO MAX! 📱\nBrand new genuine Apple iPhone 16 Pro Max (1TB Grade 5 Titanium) with 1-Year Official AppleCare Warranty, Free 35W Fast Charger & MagSafe Case!\n\n⚡ A18 Pro Bionic Chip | 48MP Pro Fusion Camera | All-Day Battery Life\n✨ Lowest price in Kenya guaranteed today only on Eneza Marketplace!\n👉 Free same-day delivery countrywide with Lipa na M-Pesa. Order directly on the Eneza Platform! #EarnwaveSolutions`,
    imageBanner: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80',
    downloadFileName: 'earnwave_iphone16_promax_sale.jpg'
  },
  {
    id: 'prod_03',
    dayBadge: 'Tuesday Ultra Computing',
    title: 'Apple M4 Pro MacBook Pro 16" & High-Performance Laptops',
    brand: 'Earnwave Solutions Tech MegaStore',
    category: 'Premium Laptops & Computing',
    targetViewsRate: 'KES 100 per status viewer',
    headlineMain: 'M4 PRO MACBOOK',
    headlineSub: 'FOR SALE',
    ribbonText: 'AQUIRE THIS WORKSTATION BEAST',
    sealTopText: 'BRAND',
    sealBottomText: 'NEW',
    featuresList: [
      '36GB Unified Memory',
      '1TB Ultra NVMe SSD',
      'Liquid Retina XDR',
      '22-Hour Battery Life',
      'Free Leather Sleeve',
      'Full Official Warranty'
    ],
    footerManagedBy: 'PRODUCTS MANAGED BY EARNWAVE SOLUTIONS',
    caption: `💻 EARNWAVE SOLUTIONS - M4 PRO MACBOOK PRO WORKSTATIONS! 💻\nBlazing-fast M4 Pro MacBook Pro 16" (36GB Unified Memory / 1TB SSD) engineered for Heavy Coding, 8K Video Editing & Creative Work!\n\n⚡ Liquid Retina XDR 120Hz Display | 22-Hour Battery Life | MagSafe 3\n🎁 Includes Free Leather Sleeve & USB-C Multi-Port Hub.\n🚀 Order today with instant M-Pesa clearance on Earnwave Platform! #EarnwaveSolutions`,
    imageBanner: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80',
    downloadFileName: 'earnwave_macbook_pro_m4_sale.jpg'
  },
  {
    id: 'prod_04',
    dayBadge: 'Wednesday AI Mobile Revolution',
    title: 'Samsung Galaxy S25 Ultra 5G AI Flagship Smartphone',
    brand: 'Earnwave Solutions Electronics',
    category: 'Latest Mobile Phones',
    targetViewsRate: 'KES 100 per status viewer',
    headlineMain: 'SAMSUNG S25 ULTRA',
    headlineSub: 'FOR SALE',
    ribbonText: 'AQUIRE THIS AI SMARTPHONE',
    sealTopText: 'LIMITED',
    sealBottomText: 'OFFER',
    featuresList: [
      '200MP Quad Zoom',
      'Snapdragon 8 Elite',
      'Built-in S-Pen Stylus',
      'Titanium Armor Frame',
      'Corning Armor Glass',
      'Free Galaxy Buds Pro'
    ],
    footerManagedBy: 'PRODUCTS MANAGED BY EARNWAVE SOLUTIONS',
    caption: `📱 EARNWAVE SOLUTIONS - SAMSUNG GALAXY S25 ULTRA 5G RELEASE! 📱\nExperience the next generation of mobile AI with the Snapdragon 8 Elite, 200MP Quad Zoom Camera & Built-in S-Pen!\n\n⚡ Titanium Armor Frame | Corning Gorilla Armor Anti-Reflective Glass\n💰 Exclusive 35% discount for verified Eneza members.\n🚚 Instant dispatch & free insured shipping across all 47 counties! #EarnwaveSolutions`,
    imageBanner: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&auto=format&fit=crop&q=80',
    downloadFileName: 'earnwave_samsung_s25_ultra_sale.jpg'
  },
  {
    id: 'prod_05',
    dayBadge: 'Thursday Luxury Living',
    title: 'Italian Royal Velvet Curved Modular Sectional & Living Room Furniture',
    brand: 'Earnwave Solutions Luxury Decor',
    category: 'Luxurious Furnitures',
    targetViewsRate: 'KES 100 per status viewer',
    headlineMain: 'ROYAL VELVET SOFA',
    headlineSub: 'FOR SALE',
    ribbonText: 'AQUIRE THIS LUXURY SUITE',
    sealTopText: 'BESPOKE',
    sealBottomText: 'DESIGN',
    featuresList: [
      '7-Seater Modular Set',
      'Water-Repellent Velvet',
      'Solid Hardwood Frame',
      'Gold Metal Accents',
      'Orthopedic Comfort',
      'Free White-Glove Setup'
    ],
    footerManagedBy: 'PROPERTY MANAGED BY EARNWAVE SOLUTIONS',
    caption: `🛋️ EARNWAVE SOLUTIONS - ITALIAN ROYAL VELVET SECTIONAL SOFA! 🛋️\nTransform your home with our handcrafted 7-seater curved modular velvet sectional, gold metal accents & high-density orthopedic comfort cushions!\n\n✨ Water-repellent fabric | Solid mahogany hardwood frame | Ergonomic luxury\n🏷️ Huge 40% OFF Home Makeover Sale today!\n🚚 White-glove doorstep delivery and free assembly included nationwide! #EarnwaveSolutions`,
    imageBanner: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop&q=80',
    downloadFileName: 'earnwave_royal_velvet_sofa_sale.jpg'
  },
  {
    id: 'prod_06',
    dayBadge: 'Friday Prime Mansions',
    title: 'Modern 5-Bedroom Luxury Smart Villa in Karen & Runda (Gated Estate)',
    brand: 'Earnwave Solutions Prime Real Estate',
    category: 'Luxury Houses & Mansions',
    targetViewsRate: 'KES 100 per status viewer',
    headlineMain: '5-BEDROOM SMART VILLA',
    headlineSub: 'FOR SALE',
    ribbonText: 'AQUIRE THIS PRIME MANSION',
    sealTopText: 'READY',
    sealBottomText: 'TITLES',
    featuresList: [
      '0.5 Acre Gated Estate',
      'Heated Infinity Pool',
      'Private Cinema Room',
      'Rooftop Sunset Lounge',
      'Smart Automation',
      'Clean Freehold Title'
    ],
    footerManagedBy: 'PROPERTY MANAGED BY EARNWAVE SOLUTIONS',
    caption: `🏡 EARNWAVE SOLUTIONS - PRIME 5-BEDROOM SMART LUXURY VILLA! 🏡\nArchitectural masterpiece on 0.5 Acre in secure gated community featuring heated infinity pool, private cinema room, rooftop lounge & smart home automation!\n\n📍 Prime Karen & Runda scenic locations with Ready Clean Title Deeds.\n💎 Flexible Lipa Pole Pole financing options available!\n✨ Book your VIP private tour directly on the Platform today! #EarnwaveSolutions`,
    imageBanner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
    downloadFileName: 'earnwave_luxury_smart_villa_sale.jpg'
  },
  {
    id: 'prod_07',
    dayBadge: 'Saturday Royal Bedroom Suite',
    title: 'Bespoke Luxury Master Bedroom King Suite & Gold Accent Furnishings',
    brand: 'Earnwave Solutions Luxury Living',
    category: 'Luxurious Furnitures',
    targetViewsRate: 'KES 100 per status viewer',
    headlineMain: 'ROYAL MASTER SUITE',
    headlineSub: 'FOR SALE',
    ribbonText: 'AQUIRE THIS ELEGANT BEDROOM',
    sealTopText: 'ROYAL',
    sealBottomText: 'LUXURY',
    featuresList: [
      'Emperor King Bedframe',
      'Tufted Velvet Finish',
      'Floating Nightstands',
      'Memory Foam Mattress',
      'Ambient LED Lighting',
      'Free Delivery & Fitting'
    ],
    footerManagedBy: 'PROPERTY MANAGED BY EARNWAVE SOLUTIONS',
    caption: `👑 EARNWAVE SOLUTIONS - BESPOKE ROYAL KING MASTER BEDROOM SUITE! 👑\nElevate your bedroom with an Emperor King tufted velvet bedframe, floating marble nightstands, dresser mirror & memory foam orthopedic mattress!\n\n✨ Solid oak craftsmanship | Brass gold accents | Built-in ambient LED lighting\n🏷️ 30% Flash Weekend Discount on all bespoke furniture orders.\n📦 Safe countrywide delivery and complimentary installation! #EarnwaveSolutions`,
    imageBanner: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&auto=format&fit=crop&q=80',
    downloadFileName: 'earnwave_bespoke_royal_bedroom_suite.jpg'
  }
];

// Returns the lively daily product based on 24-hour cycle or manual offset
export const getTodayProductAd = (dayOffset: number = 0): DailyProductItem => {
  const dayIndex = (new Date().getDay() + dayOffset + 7) % 7;
  return DAILY_PRODUCTS_CATALOG[dayIndex] || DAILY_PRODUCTS_CATALOG[0];
};

export const TODAY_PRODUCT_AD = getTodayProductAd();

export const INITIAL_PAYHERO_CONFIG: PayHeroConfig = {
  apiKey: 'ph_live_9a87fbc21008d81e',
  username: 'EnezaEarningsHQ',
  channelId: '678',
  apiSecret: 'sec_live_4187acbe45802100344',
  serviceId: 'SERV-ENEZA-KE-8821',
  paybillOrTill: '247247',
  channelType: 'Paybill',
  callbackUrl: 'https://api.enezaearnings.ke/v1/payments/payhero-callback',
  mode: 'Live',
  autoDisburse: true,
  minDisbursalLimit: 100,
  maxDisbursalLimit: 150000
};


export const INITIAL_TASKS: EarningTask[] = [
  {
    id: 'task_01',
    title: 'Kenya Tech & FinTech Trivia',
    category: 'trivia',
    description: 'Answer 3 fast trivia questions about mobile money and Kenyan innovation to earn your reward.',
    reward: 120,
    durationSeconds: 30,
    iconName: 'HelpCircle',
    difficulty: 'Easy',
    isCompleted: false,
    quizQuestions: [
      {
        question: 'In what year was M-Pesa originally launched in Kenya?',
        options: ['2004', '2007', '2010', '2012'],
        correctIndex: 1,
        explanation: 'M-Pesa was launched by Safaricom in Kenya in March 2007.'
      },
      {
        question: 'What does "Eneza" mean in Swahili?',
        options: ['To save', 'To spread / expand', 'To calculate', 'To invest'],
        correctIndex: 1,
        explanation: 'Eneza translates directly to spreading, propagating, or distributing.'
      },
      {
        question: 'Which of the following is the standard M-Pesa USSD shortcode?',
        options: ['*100#', '*334#', '*144#', '*544#'],
        correctIndex: 1,
        explanation: '*334# is the direct M-Pesa USSD menu code.'
      }
    ]
  },
  {
    id: 'task_02',
    title: 'Watch Sponsored Tech Startup Pitch',
    category: 'video',
    description: 'Watch a 20-second overview of an African solar energy fintech startup.',
    reward: 180,
    durationSeconds: 20,
    iconName: 'PlaySquare',
    difficulty: 'Instant',
    videoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    isCompleted: false
  },
  {
    id: 'task_03',
    title: 'Rapid Consumer Shopping Survey',
    category: 'survey',
    description: 'Share your shopping preferences on e-commerce platforms in Nairobi & major towns.',
    reward: 250,
    durationSeconds: 45,
    iconName: 'ClipboardList',
    difficulty: 'Medium',
    isCompleted: false,
    surveyQuestions: [
      {
        question: 'How often do you shop online or pay via Lipa na M-Pesa weekly?',
        options: ['1-3 times', '4-7 times', 'More than 7 times', 'Rarely']
      },
      {
        question: 'What is your primary factor when buying products online?',
        options: ['Price & Discounts', 'Free/Fast Delivery', 'Product Reviews', 'Payment on Delivery']
      },
      {
        question: 'Which device do you primarily use for daily digital earnings and transactions?',
        options: ['Smartphone (Android)', 'Smartphone (iPhone)', 'Laptop / Desktop', 'Tablet']
      }
    ]
  },
  {
    id: 'task_04',
    title: 'Verify High-Speed Captcha Sequence',
    category: 'captcha',
    description: 'Enter the generated optical security alphanumeric code to authenticate human traffic.',
    reward: 85,
    durationSeconds: 15,
    iconName: 'ShieldCheck',
    difficulty: 'Instant',
    captchaCode: 'ENZ-9482-K',
    isCompleted: false
  },
  {
    id: 'task_05',
    title: 'Follow & Like Eneza Official Channel',
    category: 'social',
    description: 'Visit our official verified updates channel and confirm participation.',
    reward: 150,
    durationSeconds: 25,
    iconName: 'Share2',
    difficulty: 'Easy',
    actionUrl: 'https://t.me/eneza_earnings_official',
    isCompleted: false
  },
  {
    id: 'task_06',
    title: 'Rate & Review Partner Android App',
    category: 'review',
    description: 'Provide constructive feedback on usability for our partner savings app.',
    reward: 300,
    durationSeconds: 60,
    iconName: 'Star',
    difficulty: 'Medium',
    isCompleted: false
  }
];

export const VIP_PACKAGES: VipPackage[] = [
  {
    id: 'pkg_standard',
    name: 'Standard',
    price: 0,
    dailyEarningPotential: 'KES 300 - KES 600',
    tasksLimit: 5,
    bonusMultiplier: 1.0,
    color: 'from-zinc-700 to-zinc-900',
    features: [
      '5 Daily Tasks access',
      '1 Free Daily Lucky Spin',
      'KES 150 Referral Commission (Level 1)',
      'Standard 24h M-Pesa Withdrawal Processing',
      'Community Telegram Support'
    ]
  },
  {
    id: 'pkg_silver',
    name: 'Silver',
    price: 1200,
    dailyEarningPotential: 'KES 800 - KES 1,500',
    tasksLimit: 12,
    bonusMultiplier: 1.25,
    color: 'from-slate-500 to-zinc-800',
    features: [
      '12 Daily High-Yield Tasks',
      '3 Daily Lucky Spins',
      'KES 250 Referral Commission (Level 1) + Level 2 bonuses',
      'Fast 6-Hour M-Pesa Withdrawals',
      'Priority Customer Ticket Queue'
    ]
  },
  {
    id: 'pkg_gold',
    name: 'Gold',
    price: 3000,
    dailyEarningPotential: 'KES 2,000 - KES 4,500',
    tasksLimit: 25,
    bonusMultiplier: 1.6,
    recommended: true,
    color: 'from-amber-600 to-amber-950',
    features: [
      '25 High-Tier Tasks Daily',
      '7 Daily Lucky Spins with Guaranteed Cash',
      'KES 500 Level 1 + KES 200 Level 2 + KES 100 Level 3 Referral Payouts',
      'Instant STK Direct M-Pesa Payouts (under 15 mins)',
      'VIP Dedicated Account Manager',
      'Zero Withdrawal Processing Fees'
    ]
  },
  {
    id: 'pkg_platinum',
    name: 'Platinum',
    price: 6500,
    dailyEarningPotential: 'KES 5,000 - KES 12,000',
    tasksLimit: 50,
    bonusMultiplier: 2.2,
    color: 'from-emerald-600 to-teal-950',
    features: [
      'Unlimited Premium Micro-Tasks & Video Campaigns',
      '15 Daily Spins + High-Jackpot Wheel Access',
      'Maximum 3-Tier Referral Payout Matrix (KES 1,000 / KES 400 / KES 200)',
      'Instant Automated 24/7 B2C M-Pesa Disbursals',
      'Exclusive Weekly Affiliate Leaderboard Pool',
      'Personal Financial Advisor Direct Access'
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_101',
    mpesaReceiptNo: 'QK98XJ2841',
    userId: 'usr_001',
    userName: 'Dennis Kiprono',
    userPhone: '0712345678',
    type: 'withdrawal',
    amount: 3500,
    fee: 45,
    netAmount: 3455,
    status: 'completed',
    description: 'M-Pesa B2C Payout to 0712345678',
    createdAt: '2026-08-21T16:42:00Z',
    approvedBy: 'Auto-Disburse Engine'
  },
  {
    id: 'tx_102',
    mpesaReceiptNo: 'QK98WF9182',
    userId: 'usr_001',
    userName: 'Dennis Kiprono',
    userPhone: '0712345678',
    type: 'task_reward',
    amount: 300,
    fee: 0,
    netAmount: 300,
    status: 'completed',
    description: 'Completed Partner App Rating Task',
    createdAt: '2026-08-22T08:15:00Z'
  },
  {
    id: 'tx_103',
    mpesaReceiptNo: 'QK98TG4430',
    userId: 'usr_001',
    userName: 'Dennis Kiprono',
    userPhone: '0712345678',
    type: 'referral_bonus',
    amount: 500,
    fee: 0,
    netAmount: 500,
    status: 'completed',
    description: 'Referral commission for Brian M. activation',
    createdAt: '2026-08-22T06:20:00Z'
  },
  {
    id: 'tx_104',
    mpesaReceiptNo: 'QK98LQ7712',
    userId: 'usr_001',
    userName: 'Dennis Kiprono',
    userPhone: '0712345678',
    type: 'spin_reward',
    amount: 250,
    fee: 0,
    netAmount: 250,
    status: 'completed',
    description: 'Lucky Wheel Daily Win',
    createdAt: '2026-08-21T10:05:00Z'
  },
  {
    id: 'tx_105',
    mpesaReceiptNo: 'QK98AA1904',
    userId: 'usr_001',
    userName: 'Dennis Kiprono',
    userPhone: '0712345678',
    type: 'withdrawal',
    amount: 1800,
    fee: 30,
    netAmount: 1770,
    status: 'pending',
    description: 'M-Pesa B2C Withdrawal Request to 0712345678',
    createdAt: '2026-08-22T08:55:00Z'
  }
];

export const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'ref_1',
    referrerId: 'usr_001',
    referredUserId: 'usr_sub_1',
    referredUserName: 'Brian Mwangi',
    referredUserPhone: '0721***419',
    date: '2026-08-20',
    status: 'Active',
    tierLevel: 1,
    commissionEarned: 500
  },
  {
    id: 'ref_2',
    referrerId: 'usr_001',
    referredUserId: 'usr_sub_2',
    referredUserName: 'Faith Chebet',
    referredUserPhone: '0798***881',
    date: '2026-08-21',
    status: 'Active',
    tierLevel: 1,
    commissionEarned: 500
  },
  {
    id: 'ref_3',
    referrerId: 'usr_001',
    referredUserId: 'usr_sub_3',
    referredUserName: 'Kevin Omondi',
    referredUserPhone: '0704***302',
    date: '2026-08-22',
    status: 'Pending Activation',
    tierLevel: 1,
    commissionEarned: 0
  },
  {
    id: 'ref_4',
    referrerId: 'usr_001',
    referredUserId: 'usr_sub_4',
    referredUserName: 'Mercy Wanjiku',
    referredUserPhone: '0711***992',
    date: '2026-08-19',
    status: 'Active',
    tierLevel: 2,
    commissionEarned: 200
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'M-Pesa Payout Successful',
    message: 'KES 3,455 has been sent to 0712345678 via M-Pesa. Receipt: QK98XJ2841.',
    time: '2 hours ago',
    isRead: false,
    type: 'money'
  },
  {
    id: 'notif_2',
    title: 'Referral Commission Credited',
    message: 'Your direct invite Faith Chebet activated their account! +KES 500 added to your balance.',
    time: '5 hours ago',
    isRead: false,
    type: 'money'
  },
  {
    id: 'notif_3',
    title: 'Daily Tasks Refreshed',
    message: 'New high-paying video and trivia tasks are now live in your dashboard. Complete them before midnight.',
    time: '8 hours ago',
    isRead: true,
    type: 'task'
  },
  {
    id: 'notif_4',
    title: 'Weekend 2X Earning Promo Active',
    message: 'All task rewards and spin jackpots have a 25% boost for Gold & Platinum members this weekend!',
    time: '1 day ago',
    isRead: true,
    type: 'system'
  }
];

export const LIVE_PAYOUTS: LivePayoutItem[] = [
  { id: 'lp1', phone: '0722***491', amount: 2450, timeAgo: 'just now', type: 'withdrawal' },
  { id: 'lp2', phone: '0714***882', amount: 800, timeAgo: '1m ago', type: 'spin' },
  { id: 'lp3', phone: '0790***120', amount: 5000, timeAgo: '2m ago', type: 'withdrawal' },
  { id: 'lp4', phone: '0743***607', amount: 350, timeAgo: '3m ago', type: 'task' },
  { id: 'lp5', phone: '0708***931', amount: 1500, timeAgo: '4m ago', type: 'withdrawal' },
  { id: 'lp6', phone: '0729***745', amount: 3200, timeAgo: '5m ago', type: 'withdrawal' },
  { id: 'lp7', phone: '0799***512', amount: 1200, timeAgo: '7m ago', type: 'withdrawal' }
];

export const WHEEL_PRIZES = [
  { label: 'KES 100', value: 100, color: '#059669', textColor: '#ffffff' },
  { label: 'KES 250', value: 250, color: '#10b981', textColor: '#ffffff' },
  { label: 'Try Again', value: 0, color: '#27272a', textColor: '#a1a1aa' },
  { label: 'KES 500', value: 500, color: '#047857', textColor: '#ffffff' },
  { label: '2X Task Boost', value: 75, color: '#14b8a6', textColor: '#ffffff' },
  { label: 'KES 1,000', value: 1000, color: '#f59e0b', textColor: '#ffffff' },
  { label: 'KES 50', value: 50, color: '#064e3b', textColor: '#ffffff' },
  { label: 'Jackpot KES 2,500', value: 2500, color: '#d97706', textColor: '#ffffff' },
];
