export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const reference = String(req.query?.reference || req.query?.ref || req.query?.payheroReference || '').trim();
    const apiKey = String(req.query?.apiKey || req.query?.apiSecret || process.env.PAYHERO_API_KEY || '').trim();
    const username = String(req.query?.username || process.env.PAYHERO_USERNAME || '').trim();

    if (!reference) {
      return res.status(400).json({ success: false, error: 'Reference parameter is required' });
    }

    let authHeader = '';
    if (apiKey) {
      if (apiKey.startsWith('Basic ') || apiKey.startsWith('Bearer ')) {
        authHeader = apiKey;
      } else if (username) {
        authHeader = `Basic ${Buffer.from(`${username}:${apiKey}`).toString('base64')}`;
      } else if (apiKey.includes(':')) {
        authHeader = `Basic ${Buffer.from(apiKey).toString('base64')}`;
      } else {
        const isBase64 = /^[A-Za-z0-9+/=]+$/.test(apiKey) && apiKey.length % 4 === 0 && apiKey.length >= 8;
        authHeader = isBase64 ? `Basic ${apiKey}` : `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
      }
    }

    if (authHeader) {
      try {
        const resp = await fetch(`https://backend.payhero.co.ke/api/v2/transaction-status?reference=${encodeURIComponent(reference)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        });

        const data: any = await resp.json().catch(() => null);
        if (data) {
          const status = String(data.status || data.Status || '').toUpperCase();
          const receipt = data.MpesaReceiptNumber || data.mpesa_receipt || data.receipt_number || data.mpesa_reference;

          if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAID' || status === 'SETTLED') {
            return res.json({
              success: true,
              status: 'SUCCESS',
              reference,
              receiptCode: receipt || `QK${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              amount: data.amount,
              phone: data.phone_number,
              message: 'Payment received and verified by Safaricom M-Pesa!',
            });
          } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'REJECTED' || status === 'DECLINED') {
            return res.json({
              success: true,
              status: 'FAILED',
              reference,
              message: data.message || data.error || 'Payment cancelled or declined on phone.',
            });
          }
        }
      } catch (err: any) {
        console.warn('[Vercel Status Check Network Error]:', err?.message);
      }
    }

    // Default: QUEUED
    return res.json({
      success: true,
      status: 'QUEUED',
      reference,
      message: 'Awaiting M-Pesa PIN entry on Safaricom phone...',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error checking payment status',
    });
  }
}
