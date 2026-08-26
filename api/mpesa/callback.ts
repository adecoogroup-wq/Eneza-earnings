export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('[PayHero Webhook Received on Vercel]:', req.body);
  return res.status(200).json({ status: 'received' });
}
