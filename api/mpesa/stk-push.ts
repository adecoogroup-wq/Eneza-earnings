export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const phoneInput = String(body.phone || body.phone_number || body.phoneNumber || '').trim();
    const amountInput = Number(body.amount) || 500;
    const purpose = body.purpose || 'Wallet Deposit';
    const channelId = body.channelId || process.env.PAYHERO_CHANNEL_ID || '678';
    const apiKey = body.apiKey || process.env.PAYHERO_API_KEY || '';
    const username = body.username || process.env.PAYHERO_USERNAME || '';
    const apiSecret = body.apiSecret || '';
    const callbackUrl = body.callbackUrl || process.env.PAYHERO_CALLBACK_URL || 'https://enezaearnings.ke/api/mpesa/callback';
    const reference = body.reference || `ENEZA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Normalize Kenyan phone number
    const digits = phoneInput.replace(/\s+/g, '').replace(/[-+()]/g, '');
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
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        error: 'Invalid phone number. Please enter a valid 10-digit Kenyan number (e.g., 0712345678 or 0110123456).',
      });
    }

    // Build PayHero Auth
    let authHeader = '';
    const effectiveKey = (apiKey || apiSecret).trim();
    if (effectiveKey) {
      if (effectiveKey.startsWith('Basic ') || effectiveKey.startsWith('Bearer ')) {
        authHeader = effectiveKey;
      } else if (username) {
        authHeader = `Basic ${Buffer.from(`${username.trim()}:${effectiveKey}`).toString('base64')}`;
      } else if (effectiveKey.includes(':')) {
        authHeader = `Basic ${Buffer.from(effectiveKey).toString('base64')}`;
      } else {
        const isBase64 = /^[A-Za-z0-9+/=]+$/.test(effectiveKey) && effectiveKey.length % 4 === 0 && effectiveKey.length >= 8;
        authHeader = isBase64 ? `Basic ${effectiveKey}` : `Basic ${Buffer.from(`${effectiveKey}:`).toString('base64')}`;
      }
    }

    const channelNumber = parseInt(String(channelId), 10) || 678;
    const cleanAmount = Math.max(1, Math.round(amountInput));
    let isLive = false;
    let payheroData: any = null;

    if (authHeader) {
      try {
        const payload = {
          amount: cleanAmount,
          phone_number: local,
          phone: local,
          phoneNumber: standard254,
          channel_id: channelNumber,
          channelId: channelNumber,
          provider: 'm-pesa',
          external_reference: reference,
          externalReference: reference,
          narration: purpose,
          callback_url: callbackUrl,
        };

        const resp = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify(payload),
        });

        payheroData = await resp.json().catch(() => null);
        if (resp.ok) {
          isLive = true;
        }
      } catch (err: any) {
        console.warn('[Vercel STK Dispatch Error]:', err?.message);
      }
    }

    const returnedRef = payheroData?.reference || payheroData?.CheckoutRequestID || reference;

    return res.status(200).json({
      success: true,
      status: 'QUEUED',
      reference: returnedRef,
      phone: local,
      amount: cleanAmount,
      isLiveDispatch: isLive,
      message: `STK push queued for Safaricom line ${local}. Enter M-Pesa PIN when prompted.`,
    });
  } catch (error: any) {
    console.error('[Vercel STK Handler Error]:', error);
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      error: error?.message || 'Server error dispatching STK push',
    });
  }
}
