// ============================================
//  AUTH.JS – ADMIN‑ONLY AUTHENTICATION
// ============================================

// ----- MOCK ADMIN CREDENTIALS (for testing) -----
const MOCK_ADMIN = {
    email: 'admin@sportsarena.com',
    password: 'admin123',
    name: 'Arena Admin',
    role: 'admin'
};

// ----- CHECK IF CURRENT USER IS ADMIN -----
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('sportsArenaAdmin'));
    return user && user.role === 'admin';
}

// ----- ADMIN LOGIN -----
function adminLogin(email, password) {
    // --- MOCK MODE (default) ---
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
        const adminUser = {
            email: MOCK_ADMIN.email,
            name: MOCK_ADMIN.name,
            role: 'admin'
        };
        localStorage.setItem('sportsArenaAdmin', JSON.stringify(adminUser));
        updateNav();
        return true;
    }

    // --- APPWRITE MODE (uncomment when ready) ---
    /*
    // 1. Call Appwrite account.createEmailPasswordSession(email, password)
    // 2. Fetch the user document from your database
    // 3. Check if user.role === 'admin'
    // 4. If yes, store in localStorage and return true
    */

    return false;
}

// ----- ADMIN LOGOUT -----
function adminLogout() {
    localStorage.removeItem('sportsArenaAdmin');
    updateNav();
    // Redirect to homepage if on a protected page
    if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
}

// ----- UPDATE NAVIGATION (show/hide admin links) -----
function updateNav() {
    const authNav = document.getElementById('authNav');
    const adminNav = document.getElementById('adminNav');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isAdmin()) {
        if (authNav) authNav.style.display = 'none';
        if (adminNav) adminNav.style.display = 'flex';
    } else {
        if (authNav) authNav.style.display = 'flex';
        if (adminNav) adminNav.style.display = 'none';
    }

    // Attach logout event (runs every time nav updates)
    if (logoutBtn) {
        // Remove any existing listeners to avoid duplicates
        logoutBtn.removeEventListener('click', handleLogout);
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// ----- LOGOUT HANDLER -----
function handleLogout(e) {
    e.preventDefault();
    adminLogout();
}

// ----- REDIRECT IF NOT ADMIN (for dashboard) -----
function requireAdmin() {
    if (!isAdmin()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ----- AUTO-RUN ON PAGE LOAD -----
document.addEventListener('DOMContentLoaded', function() {
    updateNav();

    // If we're on login.html and already logged in, redirect to dashboard
    if (window.location.pathname.includes('login.html') && isAdmin()) {
        window.location.href = 'dashboard.html';
    }

    // If we're on dashboard.html, enforce admin access
    if (window.location.pathname.includes('dashboard.html')) {
        requireAdmin();
    }
});
