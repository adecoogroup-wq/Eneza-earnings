import { getAllStoredUsers, registerOrUpdateUser } from '../../src/utils/userStore';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const users = getAllStoredUsers();
      return res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Error fetching users' });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = req.body || {};
      if (!body.id) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      const savedUser = registerOrUpdateUser(body);
      const allUsers = getAllStoredUsers();
      return res.status(200).json({
        success: true,
        user: savedUser,
        totalUsers: allUsers.length,
        users: allUsers,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Error saving user' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
