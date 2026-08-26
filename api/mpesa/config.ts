export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.json({
    success: true,
    hasEnvApiKey: !!process.env.PAYHERO_API_KEY,
    hasEnvUsername: !!process.env.PAYHERO_USERNAME,
    channelId: process.env.PAYHERO_CHANNEL_ID || '678',
    callbackUrl: process.env.PAYHERO_CALLBACK_URL || '',
  });
}
