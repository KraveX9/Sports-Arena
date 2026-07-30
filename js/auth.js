// ============================================
//  ADMIN AUTHENTICATION (HARDCODED FALLBACK)
// ============================================

// HARDCODED ADMIN CREDENTIALS (FOR TESTING ONLY)
const ADMIN_EMAIL = 'jeffzilla393@gmail.com';
const ADMIN_PASSWORD = 'admin123';

function isAdmin() {
    const user = JSON.parse(localStorage.getItem('sportsArenaAdmin'));
    return user && user.role === 'admin';
}

// Admin login - uses hardcoded credentials
async function adminLogin(email, password) {
    // Bypass Appwrite – just check hardcoded credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser = {
            email: ADMIN_EMAIL,
            name: 'Arena Admin',
            role: 'admin'
        };
        localStorage.setItem('sportsArenaAdmin', JSON.stringify(adminUser));
        updateNav();
        return true;
    } else {
        alert('❌ Invalid credentials. Use jeffzilla393@gmail.com / admin123');
        return false;
    }
}

// Admin logout
async function adminLogout() {
    localStorage.removeItem('sportsArenaAdmin');
    updateNav();
    window.location.href = 'index.html';
}

// Update navigation
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

    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        newLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminLogout();
        });
    }
}

document.addEventListener('DOMContentLoaded', updateNav);
