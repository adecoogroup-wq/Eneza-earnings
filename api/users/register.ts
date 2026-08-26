import { getAllStoredUsers, registerOrUpdateUser } from '../../src/utils/userStore';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const phone = String(body.phone || '').trim();
    const username = String(body.username || '').trim();

    if (!phone && !username) {
      return res.status(400).json({ success: false, error: 'Phone or username is required for registration' });
    }

    const userId = body.id || `usr_${Date.now()}`;
    const userToSave = {
      ...body,
      id: userId,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = registerOrUpdateUser(userToSave);
    const allUsers = getAllStoredUsers();

    console.log(`[Eneza Cloud Registry] Registered new user: ${saved.username} (${saved.phone}) | Referred by: ${saved.referredBy || 'None'} | Total users: ${allUsers.length}`);

    return res.status(200).json({
      success: true,
      message: 'User registered successfully in centralized registry',
      user: saved,
      totalUsers: allUsers.length,
      users: allUsers,
    });
  } catch (err: any) {
    console.error('[Eneza Registration Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error saving user registration',
    });
  }
}
