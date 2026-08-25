import { LivePayoutItem } from '../types';

export interface BotActivityProfile {
  name: string;
  phone: string;
  location: string;
}

export const KENYAN_BOT_PROFILES: BotActivityProfile[] = [
  { name: 'Dennis Kiprono', phone: '0712***678', location: 'Nairobi' },
  { name: 'Faith Chebet', phone: '0722***410', location: 'Eldoret' },
  { name: 'Kevin Omondi', phone: '0745***890', location: 'Kisumu' },
  { name: 'Mercy Wanjiku', phone: '0701***992', location: 'Mombasa' },
  { name: 'Brian Mwangi', phone: '0759***314', location: 'Nakuru' },
  { name: 'Sharon Nekesa', phone: '0790***231', location: 'Thika' },
  { name: 'Eric Mutua', phone: '0733***554', location: 'Kiambu' },
  { name: 'Agnes Cherono', phone: '0728***109', location: 'Kericho' },
  { name: 'Victor Kimani', phone: '0719***443', location: 'Nyeri' },
  { name: 'Cynthia Jepchirchir', phone: '0740***852', location: 'Eldoret' },
  { name: 'Samuel Otieno', phone: '0791***776', location: 'Kisii' },
  { name: 'Brenda Wayua', phone: '0720***395', location: 'Machakos' },
  { name: 'Collins Rotich', phone: '0704***819', location: 'Naivasha' },
  { name: 'Joy Khaemba', phone: '0796***240', location: 'Kitale' },
  { name: 'Jackson Tanui', phone: '0715***339', location: 'Nairobi' },
  { name: 'Hellen Wambui', phone: '0748***112', location: 'Embu' },
  { name: 'Edwin Barasa', phone: '0797***603', location: 'Mombasa' },
  { name: 'Esther Nyambura', phone: '0724***951', location: 'Kakamega' },
  { name: 'Peter Kirimi', phone: '0707***482', location: 'Meru' },
  { name: 'Caroline Muthoni', phone: '0110***921', location: 'Nairobi' },
  { name: 'Geoffrey Koech', phone: '0115***403', location: 'Bomet' },
  { name: 'Abigael Wairimu', phone: '0799***512', location: 'Ruiru' },
  { name: 'Daniel Macharia', phone: '0729***745', location: 'Nanyuki' },
  { name: 'Prudence Achieng', phone: '0708***931', location: 'Homa Bay' },
];

const BOT_ACTION_TEMPLATES: {
  type: LivePayoutItem['type'];
  actionTitle: string;
  minAmount: number;
  maxAmount: number;
  step: number;
  fixedAmounts?: number[];
}[] = [
  {
    type: 'withdrawal',
    actionTitle: 'Direct M-Pesa B2C Cashout',
    minAmount: 1200,
    maxAmount: 14500,
    step: 50,
  },
  {
    type: 'whatsapp',
    actionTitle: 'WhatsApp Status Ad Payout',
    minAmount: 400,
    maxAmount: 2200,
    step: 50,
  },
  {
    type: 'spin',
    actionTitle: 'Lucky Spin Jackpot Win',
    minAmount: 250,
    maxAmount: 2500,
    step: 250,
    fixedAmounts: [250, 500, 1000, 2500],
  },
  {
    type: 'package',
    actionTitle: 'Universe 200% Cashback Unlock',
    minAmount: 2500,
    maxAmount: 14000,
    step: 500,
    fixedAmounts: [2500, 5000, 8000, 14000],
  },
  {
    type: 'referral',
    actionTitle: 'Level 1 Instant Invite Commission',
    minAmount: 500,
    maxAmount: 1500,
    step: 500,
    fixedAmounts: [500, 1000, 1500],
  },
  {
    type: 'investment',
    actionTitle: 'Yield Harvest Daily Disbursal',
    minAmount: 450,
    maxAmount: 4800,
    step: 150,
  },
  {
    type: 'task',
    actionTitle: 'Kenya Tech & Survey Task Reward',
    minAmount: 120,
    maxAmount: 380,
    step: 10,
    fixedAmounts: [120, 180, 250, 350],
  },
];

const MPESA_PREFIXES = ['QK', 'QL', 'QM', 'QN', 'QJ', 'QP', 'QR'];

export function generateMpesaReceipt(): string {
  const prefix = MPESA_PREFIXES[Math.floor(Math.random() * MPESA_PREFIXES.length)];
  const digit1 = Math.floor(10 + Math.random() * 89);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const char1 = chars[Math.floor(Math.random() * chars.length)];
  const char2 = chars[Math.floor(Math.random() * chars.length)];
  const endDigits = Math.floor(1000 + Math.random() * 8999);
  return `${prefix}${digit1}${char1}${char2}${endDigits}`;
}

export function formatTimeAgo(timestampMs: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  if (diffSec < 3) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}

export function generateSingleBotActivity(offsetSeconds = 0): LivePayoutItem {
  const profile = KENYAN_BOT_PROFILES[Math.floor(Math.random() * KENYAN_BOT_PROFILES.length)];
  const template = BOT_ACTION_TEMPLATES[Math.floor(Math.random() * BOT_ACTION_TEMPLATES.length)];

  let amount = 0;
  if (template.fixedAmounts && template.fixedAmounts.length > 0) {
    amount = template.fixedAmounts[Math.floor(Math.random() * template.fixedAmounts.length)];
  } else {
    const steps = Math.floor((template.maxAmount - template.minAmount) / template.step);
    amount = template.minAmount + Math.floor(Math.random() * (steps + 1)) * template.step;
  }

  const timestampMs = Date.now() - offsetSeconds * 1000;

  return {
    id: `bot_act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    phone: profile.phone,
    memberName: profile.name,
    location: profile.location,
    amount,
    timeAgo: formatTimeAgo(timestampMs),
    type: template.type,
    actionTitle: template.actionTitle,
    mpesaRef: generateMpesaReceipt(),
    timestampMs,
  };
}

export function generateInitialBotActivityList(count = 10): LivePayoutItem[] {
  const items: LivePayoutItem[] = [];
  const secondOffsets = [0, 4, 12, 28, 45, 75, 120, 180, 240, 310, 420, 540];

  for (let i = 0; i < count; i++) {
    const offset = secondOffsets[i] !== undefined ? secondOffsets[i] : (i + 1) * 60;
    items.push(generateSingleBotActivity(offset));
  }
  return items;
}
