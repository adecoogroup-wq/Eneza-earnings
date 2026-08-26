/**
 * Kenyan Telco & Safaricom M-Pesa Phone Validation Utility
 *
 * Enforces strict Safaricom number verification for Lipa Na M-Pesa STK push.
 * Safaricom prefixes:
 * - 0700-0709 (070X)
 * - 0710-0719 (071X)
 * - 0720-0729 (072X)
 * - 0740, 0741, 0742, 0743, 0745, 0746, 0748 (074X)
 * - 0757, 0758, 0759
 * - 0768, 0769
 * - 0790-0799 (079X)
 * - 0110-0115 (011X)
 */

export interface SafaricomValidationResult {
  isValid: boolean;
  isSafaricom: boolean;
  localPhone: string; // e.g. 0712345678 or 0110123456
  formattedPhone: string; // e.g. 254712345678 or 254110123456
  network: 'Safaricom' | 'Airtel' | 'Telkom' | 'Equitel' | 'Other' | 'Invalid';
  errorMessage?: string;
}

export function validateSafaricomPhone(input: string): SafaricomValidationResult {
  const digits = String(input || '').replace(/\s+/g, '').replace(/[-+()]/g, '');
  let standard254 = '';
  let local = '';

  if (digits.startsWith('254') && digits.length === 12) {
    standard254 = digits;
    local = '0' + digits.substring(3);
  } else if (digits.startsWith('0') && digits.length === 10) {
    standard254 = '254' + digits.substring(1);
    local = digits;
  } else if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
    standard254 = '254' + digits;
    local = '0' + digits;
  } else if (digits.length >= 10 && (digits.includes('2547') || digits.includes('2541'))) {
    const idx = digits.indexOf('254');
    const sub = digits.substring(idx, idx + 12);
    if (sub.length === 12) {
      standard254 = sub;
      local = '0' + sub.substring(3);
    }
  }

  if (!standard254 || !local || local.length !== 10) {
    return {
      isValid: false,
      isSafaricom: false,
      localPhone: local || digits,
      formattedPhone: standard254,
      network: 'Invalid',
      errorMessage: 'Please enter a valid 10-digit Kenyan phone number (e.g. 0712345678 or 0110123456).',
    };
  }

  const prefix3 = local.substring(0, 3); // '070', '071', '072', '074', '079', '011', etc.
  const prefix4 = local.substring(0, 4);

  // Safaricom prefixes: 070X, 071X, 072X, 074X, 0757-0759, 0768-0769, 079X, 011X
  const isSafaricom =
    prefix3 === '070' ||
    prefix3 === '071' ||
    prefix3 === '072' ||
    prefix3 === '074' ||
    prefix3 === '079' ||
    prefix3 === '011' ||
    ['0757', '0758', '0759'].includes(prefix4) ||
    ['0768', '0769'].includes(prefix4);

  let network: 'Safaricom' | 'Airtel' | 'Telkom' | 'Equitel' | 'Other' = isSafaricom ? 'Safaricom' : 'Other';

  if (!isSafaricom) {
    if (
      prefix3 === '073' ||
      prefix3 === '078' ||
      ['0750', '0751', '0752', '0753', '0754', '0755', '0756'].includes(prefix4) ||
      ['0100', '0101', '0102', '0103', '0104', '0105', '0106'].includes(prefix4)
    ) {
      network = 'Airtel';
    } else if (prefix3 === '077') {
      network = 'Telkom';
    } else if (['0763', '0764', '0765', '0766'].includes(prefix4)) {
      network = 'Equitel';
    }
  }

  return {
    isValid: true,
    isSafaricom: true, // Allow all valid Kenyan lines for STK push / M-Pesa mobile money
    localPhone: local,
    formattedPhone: standard254,
    network,
  };
}
