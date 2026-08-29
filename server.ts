import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing for login requests
app.use(express.json());

// Serve your frontend interface (index.html)
app.use(express.static(path.join(__dirname, '.')));

// ----------------------------------------------------
// PERMANENT MEMORY STORAGE (Saves users while running)
// ----------------------------------------------------
let platformUserDatabase: any[] = [];

// ----------------------------------------------------
// API ROUTES (Login, Profile, Admin)
// ----------------------------------------------------

// 1. LOGIN (Strictly by Phone Number)
app.post('/api/users/login', (req, res) => {
    const { phoneNumber, referredByCode } = req.body;
    
    if (!phoneNumber || String(phoneNumber).trim() === "") {
        return res.status(400).json({ success: false, error: "Phone number is required." });
    }

    let user = platformUserDatabase.find(u => u.phoneNumber === phoneNumber);

    if (!user) {
        // Create new user if they don't exist
        const generatedRefCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        user = {
            id: 'usr_' + Date.now(),
            phoneNumber: phoneNumber,
            referralCode: generatedRefCode,
            referredBy: referredByCode || null,
            canAccessReferral: false, // Default: Locked ("Coming Soon")
            totalDeposited: 0,
            createdAt: new Date()
        };
        platformUserDatabase.push(user);
    }
    res.json({ success: true, user });
});

// 2. GET PROFILE (Read-Only)
app.get('/api/users/profile', (req, res) => {
    const { userId } = req.query;
    const user = platformUserDatabase.find(u => u.id === userId);
    
    if (!user) return res.status(404).json({ error: "User not found." });
    
    res.json({
        phoneNumber: user.phoneNumber,
        canAccessReferral: user.canAccessReferral,
        referralCode: user.referralCode,
        totalDeposited: user.totalDeposited
    });
});

// 3. ADMIN: APPROVE REFERRAL ACCESS
app.post('/api/users/approve', (req, res) => {
    const { targetUserId } = req.body;
    const user = platformUserDatabase.find(u => u.id === targetUserId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    
    user.canAccessReferral = true; // Unlock the referral page
    res.json({ success: true, user });
});

// 4. ADMIN: UPDATE DEPOSITS
app.post('/api/users/updateDeposit', (req, res) => {
    const { targetUserId, amount } = req.body;
    const user = platformUserDatabase.find(u => u.id === targetUserId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    
    user.totalDeposited = Number(amount) || 0;
    res.json({ success: true, user });
});

// 5. ADMIN: DOWNLOAD DATABASE
app.get('/api/users/rawDatabase', (req, res) => {
    res.json(platformUserDatabase);
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
    
