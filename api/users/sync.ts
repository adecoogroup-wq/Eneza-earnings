import { batchSyncUsers, getAllStoredUsers } from '../../src/utils/userStore';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const body = req.body || {};
      const clientUsers = Array.isArray(body.users) ? body.users : [];
      if (clientUsers.length > 0) {
        batchSyncUsers(clientUsers);
      }
    }

    const allUsers = getAllStoredUsers();
    return res.status(200).json({
      success: true,
      totalUsers: allUsers.length,
      users: allUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Sync error',
    });
  }
}
