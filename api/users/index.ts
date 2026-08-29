<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eneza Earnings Portal</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; margin: 0; padding: 0; color: #f8fafc; }
        .app-layout { display: flex; min-height: 100vh; }
        
        /* INDEPENDENT SIDE MENU NAVIGATION */
        .side-menu { width: 260px; background: #1e293b; border-right: 1px solid #334155; padding: 20px; box-sizing: border-box; }
        .side-menu h2 { font-size: 18px; color: #38bdf8; margin-top: 0; padding-bottom: 15px; border-bottom: 1px solid #334155; }
        .menu-btn { width: 100%; text-align: left; padding: 12px 15px; background: transparent; color: #94a3b8; border: none; font-size: 15px; font-weight: 600; cursor: pointer; border-radius: 6px; margin-bottom: 8px; transition: 0.2s; }
        .menu-btn.active, .menu-btn:hover { background: #334155; color: #f8fafc; }
        .logout-btn { background: #ef4444 !important; color: white !important; margin-top: 40px; text-align: center; }

        /* MAIN CONTENT INTERFACE HOUSING */
        .main-workspace { flex: 1; padding: 30px; box-sizing: border-box; }
        .page-view { display: none; background: #1e293b; border: 1px solid #334155; padding: 30px; border-radius: 12px; max-width: 700px; }
        .page-view.active { display: block; }
        
        /* FORM UTILITIES & STRUCTURAL DISPLAY BLOCKS */
        h3 { margin-top: 0; font-size: 22px; color: #f1f5f9; border-bottom: 1px solid #334155; padding-bottom: 10px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; font-size: 13px; font-weight: bold; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; }
        input[type="tel"], input[type="text"] { width: 100%; padding: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: white; box-sizing: border-box; font-size: 15px; }
        .lock-badge { display: inline-block; background: #7f1d1d; color: #fca5a5; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-top: 5px; }
        .coming-soon-wrapper { text-align: center; padding: 40px 10px; }
        .badge-pending { display: inline-block; background: #78350f; color: #fde68a; padding: 8px 24px; border-radius: 20px; font-weight: 800; font-size: 20px; margin: 20px 0; border: 1px solid #b45309; }
        
        /* ADMIN TERMINAL GRID LAYOUT */
        .admin-panel { border-top: 4px solid #38bdf8; margin-top: 40px; background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #334155; }
        .user-row { background: #0f172a; border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 12px; font-size: 13px; }
        .admin-action-btn { background: #0284c7; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-right: 10px; margin-top: 8px; font-size: 12px; }
        .backup-btn { background: #16a34a; font-size: 14px; padding: 12px; width: 100%; border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; margin-bottom: 20px; }
    </style>
</head>
<body>

    <!-- GATEWAY: AUTHENTICATION FLOW (Strictly via Phone Entry Parameters) -->
    <div id="authGate" style="max-width: 400px; margin: 100px auto; background: #1e293b; padding: 35px; border-radius: 12px; border: 1px solid #334155;">
        <h2 style="margin-top:0; text-align:center; color:#38bdf8;">Eneza Earnings</h2>
        <p style="color:#94a3b8; text-align:center; font-size:14px; margin-bottom:25px;">Provide your registered phone token parameter to log in.</p>
        <label>Phone Number Line:</label>
        <input type="tel" id="userPhoneField" placeholder="e.g. +254700000000">
        <button onclick="executeLoginWorkflow()" style="width:100%; padding:12px; background:#38bdf8; color:#0f172a; border:none; font-weight:bold; border-radius:6px; cursor:pointer; margin-top:15px; font-size:16px;">Secure Authenticate</button>
    </div>

    <!-- MAIN APP STRUCTURE LAYER -->
    <div id="appWorkspace" class="app-layout" style="display: none;">
        
        <!-- INDEPENDENT SIDE MENU NAVIGATION -->
        <div class="side-menu">
            <h2>Navigation</h2>
            <button id="menuProfile" class="menu-btn active" onclick="switchTab('profile')">👤 My Profile</button>
            <button id="menuReferral" class="menu-btn" onclick="switchTab('referral')">🔗 Referral Center</button>
            <button id="menuAdmin" class="menu-btn" onclick="switchTab('admin')" style="color:#38bdf8; display:none;">🛠️ System Admin</button>
            
            <button class="menu-btn logout-btn" onclick="terminateSession()">Exit Portal</button>
        </div>

        <!-- APP CONTENT PANELS DISPLAY SWITCH -->
        <div class="main-workspace">
            
            <!-- VIEW A: PROFILE PAGE (Shows User Details Only - Completely Read-Only) -->
            <div id="viewProfile" class="page-view active">
                <h3>User Account Profile</h3>
                <div class="form-group">
                    <label>Verified Phone Identity Parameter:</label>
                    <input type="text" id="profPhone" readonly>
                    <span class="lock-badge">🔒 Read-Only Metric: Cannot edit user credentials</span>
                </div>
                <div class="form-group">
                    <label>Internal Platform User ID Code:</label>
                    <input type="text" id="profUid" readonly>
                </div>
                <div class="form-group">
                    <label>Account Node Status Summary:</label>
                    <input type="text" id="profStatus" readonly>
                </div>
            </div>

            <!-- VIEW B: INDEPENDENT REFERRAL PAGE (Handles Conditional Admin Lockout Logic) -->
            <div id="viewReferral" class="page-view">
                <div id="referralContentDynamicWindow">
                    <!-- Javascript checks user privileges to load "Coming Soon" screen versus Live Network Metrics -->
                </div>
            </div>

            <!-- VIEW C: SYSTEM ADMIN CONSOLE TERMINAL -->
            <div id="viewAdmin" class="page-view">
                <h3>Administration Console</h3>
                <button class="backup-btn" onclick="executePermanentOfflineFileBackup()">📥 Download Permanent Data Archive (.json)</button>
                <button class="admin-action-btn" style="background:#0891b2; width:100%; margin-bottom:15px; padding:10px;" onclick="syncAdminRecordsEngine()">🔄 Reload Records List</button>
                <div id="adminRecordsDisplay"></div>
            </div>

        </div>
    </div>

    <script>
        let runtimeClientSession = null;

        // AUTHENTICATION UTILITY
        async function executeLoginWorkflow() {
            const phone = document.getElementById('userPhoneField').value.trim();
            if(!phone) return alert('Input phone values string.');

            try {
                const res = await fetch('/api/users?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: phone })
                });
                const data = await res.json();
                if(data.success) {
                    runtimeClientSession = data.user;
                    
                    // Simple admin check simulation layout helper
                    if(phone.includes("admin") || phone === "+254700000000") {
                        document.getElementById('menuAdmin').style.display = 'block';
                    }

                    document.getElementById('authGate').style.display = 'none';
                    document.getElementById('appWorkspace').style.display = 'flex';
                    
                    switchTab('profile'); // Default viewing pane setup
                }
            } catch (err) { alert('Runtime engine authentication failure.'); }
        }

        // SIDE MENU TAB CONTROLLER MODULE
        async function switchTab(targetTabName) {
            // Clean active display layouts
            document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.side-menu .menu-btn').forEach(b => b.classList.remove('active'));

            if(targetTabName === 'profile') {
                document.getElementById('viewProfile').classList.add('active');
                document.getElementById('menuProfile').classList.add('active');
                
                // Fetch fresh read-only data straight from backend profile layers
                const res = await fetch(`/api/users?action=profile&userId=${runtimeClientSession.id}`);
                const profile = await res.json();

                document.getElementById('profPhone').value = profile.phoneNumber;
                document.getElementById('profUid').value = runtimeClientSession.id;
                document.getElementById('profStatus').value = profile.canAccessReferral ? "Verified Matrix Node (Access Granted)" : "Pending Admin Approvals Audits";
            } 
            else if(targetTabName === 'referral') {
                document.getElementById('viewReferral').classList.add('active');
                document.getElementById('menuReferral').classList.add('active');
                
                const res = await fetch(`/api/users?action=profile&userId=${runtimeClientSession.id}`);
                const profile = await res.json();
                const windowTarget = document.getElementById('referralContentDynamicWindow');

                if (!profile.canAccessReferral) {
                    // ACTION REQUIRED RE-ROUTE 1: If false, print the independent Coming Soon Lock block
                    windowTarget.innerHTML = `
                    
