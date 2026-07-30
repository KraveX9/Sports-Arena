// ============================================
//  ADMIN AUTHENTICATION (SIMPLE HARDCODED)
// ============================================

const ADMIN_EMAIL = 'admin@sportsarena.com';
const ADMIN_PASSWORD = 'SportsArena2026!';

function isAdmin() {
    const user = JSON.parse(localStorage.getItem('sportsArenaAdmin'));
    return user && user.role === 'admin';
}

function adminLogin(email, password) {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('sportsArenaAdmin', JSON.stringify({
            email: ADMIN_EMAIL,
            name: 'Arena Admin',
            role: 'admin'
        }));
        updateNav();
        return true;
    } else {
        alert('❌ Invalid admin credentials. Use the correct email and password.');
        return false;
    }
}

function adminLogout() {
    localStorage.removeItem('sportsArenaAdmin');
    updateNav();
    window.location.href = 'index.html';
}

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
