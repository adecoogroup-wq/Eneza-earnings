export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.json({
    status: 'ok',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
  });
}
