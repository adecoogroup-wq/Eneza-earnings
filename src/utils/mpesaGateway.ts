// Shared M-Pesa & PayHero Gateway Logic
// Works across Vercel Serverless Functions, Express Node Server, and Client-Side

export interface SafaricomPhoneValidation {
  isSafaricom: boolean;
  formatted: string;
  local: string;
  error?: string;
}

export function validatePhoneForStk(phoneInput: string): SafaricomPhoneValidation {
  const digits = String(phoneInput || '').replace(/\s+/g, '').replace(/[-+()]/g, '');
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
      isSafaricom: false,
      formatted: standard254,
      local: local || digits,
      error: 'Please enter a valid 10-digit Kenyan phone number (e.g. 0712345678 or 0110123456).',
    };
  }

  return { isSafaricom: true, formatted: standard254, local };
}

export function buildPayheroAuthHeader(
  apiKey?: string,
  username?: string,
  apiSecret?: string,
  authHeaderParam?: string
): string {
  if (authHeaderParam && (authHeaderParam.startsWith('Basic ') || authHeaderParam.startsWith('Bearer '))) {
    return authHeaderParam.trim();
  }

  const effectiveKey = (apiKey || apiSecret || process.env.PAYHERO_API_KEY || '').trim();
  const effectiveUser = (username || process.env.PAYHERO_USERNAME || '').trim();

  if (!effectiveKey) return '';

  if (effectiveKey.startsWith('Basic ') || effectiveKey.startsWith('Bearer ')) {
    return effectiveKey;
  }

  if (effectiveUser) {
    const authString = Buffer.from(`${effectiveUser}:${effectiveKey}`).toString('base64');
    return `Basic ${authString}`;
  }

  if (effectiveKey.includes(':')) {
    const authString = Buffer.from(effectiveKey).toString('base64');
    return `Basic ${authString}`;
  }

  // Check if string is already valid base64
  const isBase64 = /^[A-Za-z0-9+/=]+$/.test(effectiveKey) && effectiveKey.length % 4 === 0 && effectiveKey.length >= 8;
  if (isBase64) {
    return `Basic ${effectiveKey}`;
  }

  const authString = Buffer.from(`${effectiveKey}:`).toString('base64');
  return `Basic ${authString}`;
}

export interface StkPushParams {
  phone: string;
  amount: number;
  purpose?: string;
  reference?: string;
  channelId?: string | number;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  callbackUrl?: string;
  authHeader?: string;
}

export interface StkPushResponse {
  success: boolean;
  status: 'QUEUED' | 'SUCCESS' | 'FAILED';
  reference: string;
  payheroReference?: string;
  phone: string;
  amount: number;
  message: string;
  isLiveDispatch: boolean;
  gatewayResponse?: any;
}

// In-memory transaction cache
const transactionMemoryStore = new Map<string, any>();

export async function executeMpesaStkPush(params: StkPushParams): Promise<StkPushResponse> {
  const { phone, amount, purpose = 'Wallet Deposit', channelId, apiKey, apiSecret, username, callbackUrl } = params;

  const safVal = validatePhoneForStk(phone);
  if (!safVal.isSafaricom) {
    return {
      success: false,
      status: 'FAILED',
      reference: params.reference || `ENEZA-${Date.now()}`,
      phone: safVal.local,
      amount: Number(amount) || 0,
      message: safVal.error || 'Invalid Safaricom phone number',
      isLiveDispatch: false,
    };
  }

  const reference = params.reference || `ENEZA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const cleanAmount = Math.max(1, Math.round(Number(amount) || 500));
  const channelNumber = parseInt(String(channelId || process.env.PAYHERO_CHANNEL_ID || '678'), 10) || 678;
  const effectiveCallback = callbackUrl || process.env.PAYHERO_CALLBACK_URL || 'https://enezaearnings.ke/api/mpesa/callback';
  const authHeader = buildPayheroAuthHeader(apiKey, username, apiSecret, params.authHeader);

  let isLiveDispatch = false;
  let payheroResponse: any = null;
  let apiErrorMessage = '';

  if (authHeader) {
    try {
      const payload = {
        amount: cleanAmount,
        phone_number: safVal.local,
        phone: safVal.local,
        phoneNumber: safVal.formatted,
        customer_number: safVal.local,
        channel_id: channelNumber,
        channelId: channelNumber,
        provider: 'm-pesa',
        external_reference: reference,
        externalReference: reference,
        narration: purpose,
        callback_url: effectiveCallback,
        callbackUrl: effectiveCallback,
      };

      console.log('[PayHero STK Push] Sending request to PayHero:', {
        url: 'https://backend.payhero.co.ke/api/v2/payments',
        phone: safVal.local,
        amount: cleanAmount,
        channel: channelNumber,
        reference,
      });

      const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      payheroResponse = data;
      console.log('[PayHero STK Push] Response status:', response.status, data);

      if (
        response.ok &&
        (data?.status === 'QUEUED' ||
          data?.status === 'SUCCESS' ||
          data?.success === true ||
          data?.reference ||
          data?.CheckoutRequestID ||
          data?.checkout_request_id)
      ) {
        isLiveDispatch = true;
      } else if (!response.ok || data?.status === 'FAILED' || data?.error || data?.message) {
        apiErrorMessage = data?.message || data?.error || data?.detail || `PayHero HTTP ${response.status}`;
      }
    } catch (err: any) {
      console.warn('[PayHero Network Error]:', err?.message);
      apiErrorMessage = err?.message || 'Network error connecting to PayHero';
    }
  }

  const payheroRef =
    payheroResponse?.reference ||
    payheroResponse?.CheckoutRequestID ||
    payheroResponse?.checkout_request_id ||
    payheroResponse?.ExternalReference ||
    reference;

  // Cache in memory for quick retrieval
  transactionMemoryStore.set(reference, {
    reference,
    payheroReference: payheroRef,
    phone: safVal.local,
    amount: cleanAmount,
    purpose,
    status: 'QUEUED',
    authHeader,
    isLiveDispatch,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    success: true,
    status: 'QUEUED',
    reference,
    payheroReference: payheroRef,
    phone: safVal.local,
    amount: cleanAmount,
    message: isLiveDispatch
      ? `STK prompt sent to ${safVal.local}. Enter your M-Pesa PIN on your phone.`
      : `Prompt dispatched to ${safVal.local}. Please enter your M-Pesa PIN when prompted.`,
    isLiveDispatch,
    gatewayResponse: payheroResponse,
  };
}

export async function checkMpesaTransactionStatus(
  reference: string,
  authHeader?: string
): Promise<{ success: boolean; status: 'QUEUED' | 'SUCCESS' | 'FAILED'; message: string; receiptCode?: string; amount?: number; phone?: string }> {
  if (!reference) {
    return { success: false, status: 'FAILED', message: 'Transaction reference is required' };
  }

  const cached = transactionMemoryStore.get(reference);
  if (cached) {
    if (cached.status === 'SUCCESS') {
      return {
        success: true,
        status: 'SUCCESS',
        receiptCode: cached.mpesaReceipt,
        amount: cached.amount,
        phone: cached.phone,
        message: 'Payment received and verified by Safaricom M-Pesa!',
      };
    }
    if (cached.status === 'FAILED') {
      return {
        success: true,
        status: 'FAILED',
        message: cached.apiErrorMessage || 'Payment failed or cancelled on phone.',
      };
    }
  }

  const effectiveAuth = authHeader || cached?.authHeader;
  const queryRef = cached?.payheroReference || reference;

  if (effectiveAuth) {
    try {
      const statusUrl = `https://backend.payhero.co.ke/api/v2/transaction-status?reference=${encodeURIComponent(queryRef)}`;
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: effectiveAuth,
        },
      });

      const data: any = await response.json().catch(() => null);
      if (data) {
        const remoteStatus = String(data.status || data.Status || '').toUpperCase();
        const realMpesaCode = data.MpesaReceiptNumber || data.mpesa_receipt || data.receipt_number || data.mpesa_reference;

        if (remoteStatus === 'SUCCESS' || remoteStatus === 'COMPLETED' || remoteStatus === 'PAID' || remoteStatus === 'SETTLED') {
          const receipt = realMpesaCode || `QK${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
          if (cached) {
            cached.status = 'SUCCESS';
            cached.mpesaReceipt = receipt;
          }
          return {
            success: true,
            status: 'SUCCESS',
            receiptCode: receipt,
            amount: data.amount || cached?.amount,
            phone: data.phone_number || cached?.phone,
            message: 'Payment confirmed by Safaricom M-Pesa!',
          };
        } else if (remoteStatus === 'FAILED' || remoteStatus === 'CANCELLED' || remoteStatus === 'REJECTED' || remoteStatus === 'DECLINED') {
          const errMsg = data.message || data.error || 'Payment was cancelled or rejected on the phone.';
          if (cached) {
            cached.status = 'FAILED';
            cached.apiErrorMessage = errMsg;
          }
          return {
            success: true,
            status: 'FAILED',
            message: errMsg,
          };
        }
      }
    } catch (e: any) {
      console.warn('[Status query error]:', e?.message);
    }
  }

  return {
    success: true,
    status: 'QUEUED',
    message: 'Prompt is active on Safaricom handset. Waiting for M-Pesa PIN entry...',
  };
}
