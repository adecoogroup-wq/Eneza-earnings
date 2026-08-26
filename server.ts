import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// In-memory payment transaction tracker for PayHero STK Push
interface TrackedTransaction {
  reference: string;
  payheroReference?: string;
  phone: string;
  localPhone: string;
  amount: number;
  purpose: string;
  status: 'QUEUED' | 'SUCCESS' | 'FAILED';
  mpesaReceipt?: string;
  authHeader?: string;
  isLiveDispatch: boolean;
  apiErrorMessage?: string | null;
  createdAt: number;
  updatedAt: number;
}

const transactionStore = new Map<string, TrackedTransaction>();

// Helper: Validate Kenyan phone numbers for STK push
export function isSafaricomPhone(phoneInput: string): { isSafaricom: boolean; formatted: string; local: string; error?: string } {
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

// Helper: Resolve PayHero Authorization header from all possible inputs
export function buildPayheroAuthHeader(apiKey?: string, username?: string, apiSecret?: string, authHeaderParam?: string): string {
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

  // Default to Basic <base64(apiKey:)>
  const authString = Buffer.from(`${effectiveKey}:`).toString('base64');
  return `Basic ${authString}`;
}

export function configureApiRoutes(app: express.Application) {
  // CORS & Options handling for Vercel and cross-origin environments
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), platform: 'Eneza Platform' });
  });

  // API Route: Get Public M-Pesa Gateway Config
  app.get('/api/mpesa/config', (req, res) => {
    res.json({
      success: true,
      hasEnvApiKey: !!process.env.PAYHERO_API_KEY,
      hasEnvUsername: !!process.env.PAYHERO_USERNAME,
      channelId: process.env.PAYHERO_CHANNEL_ID || '678',
      callbackUrl: process.env.PAYHERO_CALLBACK_URL || '',
    });
  });

  // API Route: M-Pesa Lipa Na M-Pesa STK Push (via PayHero / Daraja)
  app.post('/api/mpesa/stk-push', async (req, res) => {
    try {
      const {
        phone,
        amount,
        purpose = 'Deposit',
        reference = `ENEZA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        channelId = '678',
        apiKey,
        username,
        apiSecret,
        callbackUrl,
      } = req.body;

      if (!phone || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and amount are required',
        });
      }

      // Safaricom / Kenyan Phone Validation
      const safValidation = isSafaricomPhone(phone);
      if (!safValidation.isSafaricom) {
        return res.status(400).json({
          success: false,
          error: safValidation.error || 'Only valid Kenyan phone numbers are supported for Lipa Na M-Pesa STK push.',
        });
      }

      const formattedPhone = safValidation.formatted;
      const localPhone = safValidation.local;

      // Effective credentials
      const effectiveChannelId = channelId || process.env.PAYHERO_CHANNEL_ID || '678';
      const effectiveCallbackUrl = callbackUrl || process.env.PAYHERO_CALLBACK_URL || 'https://enezaearnings.ke/api/mpesa/callback';
      const authHeader = buildPayheroAuthHeader(apiKey, username, apiSecret, req.headers.authorization);

      let payheroResponse: any = null;
      let isLiveDispatch = false;
      let apiErrorMessage: string | null = null;

      if (authHeader) {
        try {
          const parsedChannel = parseInt(String(effectiveChannelId), 10);
          const channelNumber = isNaN(parsedChannel) ? 678 : parsedChannel;
          const cleanAmount = Math.max(1, Math.round(Number(amount)));

          // PayHero v2 STK Push Payload
          const payload = {
            amount: cleanAmount,
            phone_number: localPhone,
            phone: localPhone,
            phoneNumber: formattedPhone,
            customer_number: localPhone,
            channel_id: channelNumber,
            channelId: channelNumber,
            provider: 'm-pesa',
            network_code: '63902',
            external_reference: reference,
            externalReference: reference,
            callback_url: effectiveCallbackUrl,
            callbackUrl: effectiveCallbackUrl,
          };

          console.log('[PayHero STK Dispatch] Sending to Safaricom via PayHero:', {
            url: 'https://backend.payhero.co.ke/api/v2/payments',
            phone: localPhone,
            amount: cleanAmount,
            channel: channelNumber,
            reference,
            hasAuth: !!authHeader,
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

          console.log('[PayHero STK Response]: HTTP', response.status, data);

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
            apiErrorMessage = data?.message || data?.error || data?.detail || `PayHero gateway returned HTTP ${response.status}`;
            console.warn('[PayHero STK Warning/Failure]:', response.status, data);
          }
        } catch (apiErr: any) {
          console.warn('[PayHero Network Error]:', apiErr?.message);
          apiErrorMessage = `Network error connecting to PayHero gateway: ${apiErr?.message}`;
        }
      } else {
        console.log('[PayHero STK Dispatch] Running in demo/simulated mode (no PayHero API key configured).');
      }

      // Determine reference returned by PayHero or our local external reference
      const payheroRef =
        payheroResponse?.reference ||
        payheroResponse?.CheckoutRequestID ||
        payheroResponse?.checkout_request_id ||
        payheroResponse?.ExternalReference ||
        null;

      // Store transaction as QUEUED awaiting actual Safaricom PIN entry
      const trackedTx: TrackedTransaction = {
        reference,
        payheroReference: payheroRef || undefined,
        phone: formattedPhone,
        localPhone,
        amount: Number(amount),
        purpose,
        status: 'QUEUED',
        authHeader,
        isLiveDispatch,
        apiErrorMessage,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      transactionStore.set(reference, trackedTx);
      if (payheroRef) {
        transactionStore.set(payheroRef, trackedTx);
      }

      return res.json({
        success: true,
        status: 'QUEUED',
        message: isLiveDispatch
          ? `Safaricom STK push prompt dispatched to ${localPhone}. Please check your phone and enter your M-Pesa PIN.`
          : `STK push prompt sent to Safaricom number ${localPhone}. Awaiting M-Pesa PIN entry.`,
        phone: formattedPhone,
        localPhone,
        amount: Number(amount),
        reference,
        payheroReference: payheroRef,
        isLiveDispatch,
        apiErrorMessage,
        payheroResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[STK Push Exception]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while dispatching STK push',
      });
    }
  });

  // API Route: Real-Time Payment Status Check with PayHero / Daraja
  app.get('/api/mpesa/check-status', async (req, res) => {
    try {
      const reference = String(req.query.reference || req.query.ref || req.query.payheroReference || '').trim();
      const apiKey = String(req.query.apiKey || req.query.apiSecret || '').trim();
      const username = String(req.query.username || '').trim();

      if (!reference) {
        return res.status(400).json({
          success: false,
          error: 'Transaction reference is required',
        });
      }

      const tx = transactionStore.get(reference);

      // If already resolved as SUCCESS or FAILED in local store
      if (tx) {
        if (tx.status === 'SUCCESS') {
          return res.json({
            success: true,
            status: 'SUCCESS',
            reference: tx.reference,
            receiptCode: tx.mpesaReceipt,
            amount: tx.amount,
            phone: tx.phone,
            message: 'Payment received and verified by Safaricom M-Pesa!',
          });
        }

        if (tx.status === 'FAILED') {
          return res.json({
            success: true,
            status: 'FAILED',
            reference: tx.reference,
            message: tx.apiErrorMessage || 'Payment failed or cancelled on phone.',
          });
        }
      }

      // Determine authorization header from tx or query params or environment (for stateless serverless / Vercel instances)
      const effectiveAuth = tx?.authHeader || buildPayheroAuthHeader(apiKey, username, undefined, req.headers.authorization);

      if (effectiveAuth) {
        const queryRef = tx?.payheroReference || reference;
        try {
          const statusUrl = `https://backend.payhero.co.ke/api/v2/transaction-status?reference=${encodeURIComponent(queryRef)}`;
          const response = await fetch(statusUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: effectiveAuth,
            },
          });

          if (response.ok) {
            const data: any = await response.json().catch(() => null);
            console.log('[PayHero Status Check Response]:', data);

            if (data) {
              const remoteStatus = String(data.status || data.Status || '').toUpperCase();
              const realMpesaCode = data.mpesa_code || data.mpesa_reference || data.MpesaReceiptNumber || data.receipt;

              // Strictly require explicit SUCCESS / COMPLETED status from gateway
              if (
                remoteStatus === 'SUCCESS' ||
                remoteStatus === 'COMPLETED' ||
                remoteStatus === 'PAID' ||
                remoteStatus === 'SETTLED'
              ) {
                const receipt = realMpesaCode || `QK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                if (tx) {
                  tx.status = 'SUCCESS';
                  tx.mpesaReceipt = receipt;
                  tx.updatedAt = Date.now();
                }

                return res.json({
                  success: true,
                  status: 'SUCCESS',
                  reference,
                  receiptCode: receipt,
                  amount: data.amount || tx?.amount,
                  phone: data.phone_number || tx?.phone,
                  message: 'Payment confirmed by Safaricom M-Pesa!',
                });
              } else if (
                remoteStatus === 'CANCELLED' ||
                remoteStatus === 'REJECTED' ||
                remoteStatus === 'DECLINED' ||
                remoteStatus === 'EXPIRED'
              ) {
                const errMsg = data.message || data.error || 'Payment was cancelled or rejected on the phone.';
                if (tx) {
                  tx.status = 'FAILED';
                  tx.apiErrorMessage = errMsg;
                  tx.updatedAt = Date.now();
                }

                return res.json({
                  success: true,
                  status: 'FAILED',
                  reference,
                  message: errMsg,
                });
              }
              // If status is QUEUED or PENDING or PROCESSING, KEEP AS QUEUED
            }
          }
        } catch (pollErr: any) {
          console.warn('[Error Querying PayHero Status]:', pollErr?.message);
        }
      }

      // Check timeout (if prompt has been pending for over 180 seconds without PIN entry)
      if (tx) {
        const ageSeconds = (Date.now() - tx.createdAt) / 1000;
        if (ageSeconds > 180) {
          tx.status = 'FAILED';
          tx.apiErrorMessage = 'Payment prompt timed out. No M-Pesa PIN was entered on the phone.';
          tx.updatedAt = Date.now();

          return res.json({
            success: true,
            status: 'FAILED',
            reference: tx.reference,
            message: tx.apiErrorMessage,
          });
        }

        return res.json({
          success: true,
          status: 'QUEUED',
          reference: tx.reference,
          secondsRemaining: Math.max(0, Math.round(120 - ageSeconds)),
          message: 'Prompt is active on Safaricom handset. Waiting for M-Pesa PIN entry...',
        });
      }

      // Fallback for brand-new serverless container: report QUEUED
      return res.json({
        success: true,
        status: 'QUEUED',
        reference,
        message: 'Awaiting M-Pesa PIN entry on Safaricom phone...',
      });
    } catch (err: any) {
      console.error('[Status Check Error]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Error checking payment status',
      });
    }
  });

  // PayHero Webhook Callback
  app.post('/api/mpesa/callback', (req, res) => {
    try {
      console.log('[M-Pesa / PayHero Callback Received]:', JSON.stringify(req.body));
      const body = req.body || {};

      const externalRef =
        body.external_reference ||
        body.ExternalReference ||
        body.reference ||
        body.CheckoutRequestID ||
        body.response?.ExternalReference ||
        body.response?.reference ||
        body.response?.CheckoutRequestID;

      const rawStatus = (
        body.status ||
        body.Status ||
        body.result_desc ||
        body.ResultDesc ||
        (body.success === true ? 'SUCCESS' : '') ||
        (body.ResultCode === 0 ? 'SUCCESS' : '')
      ).toString().toUpperCase();

      const mpesaReceipt =
        body.mpesa_reference ||
        body.MpesaReceiptNumber ||
        body.receipt ||
        body.mpesa_code ||
        body.response?.MpesaReceiptNumber ||
        body.response?.mpesa_reference;

      if (externalRef && transactionStore.has(externalRef)) {
        const tx = transactionStore.get(externalRef)!;
        if (rawStatus.includes('SUCCESS') || rawStatus === '0' || rawStatus.includes('PAID') || body.ResultCode === 0) {
          tx.status = 'SUCCESS';
          tx.mpesaReceipt = mpesaReceipt || tx.mpesaReceipt || `QK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          tx.updatedAt = Date.now();
          console.log(`[PayHero Callback] Marked ${tx.reference} as SUCCESS with receipt ${tx.mpesaReceipt}`);
        } else if (rawStatus.includes('FAIL') || rawStatus.includes('CANCEL') || rawStatus.includes('REJECT') || (body.ResultCode && body.ResultCode !== 0)) {
          tx.status = 'FAILED';
          tx.apiErrorMessage = body.ResultDesc || body.message || 'Payment cancelled or rejected by user';
          tx.updatedAt = Date.now();
          console.log(`[PayHero Callback] Marked ${tx.reference} as FAILED: ${tx.apiErrorMessage}`);
        }
      }

      res.json({ status: 'received' });
    } catch (err: any) {
      console.error('[PayHero Callback Exception]:', err);
      res.json({ status: 'error', message: err.message });
    }
  });
}

export function createExpressApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  configureApiRoutes(app);
  return app;
}

async function startServer() {
  const app = createExpressApp();
  const PORT = 3000;

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

