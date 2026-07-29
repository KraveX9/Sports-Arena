// ============================================
//  ADMIN AUTHENTICATION (APPWRITE)
// ============================================

// Check if current user is an admin (checks localStorage)
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('sportsArenaAdmin'));
    return user && user.role === 'admin';
}

// Admin login using Appwrite
async function adminLogin(email, password) {
    try {
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();

        const adminUser = {
            email: user.email,
            name: user.name || 'Admin',
            id: user.$id,
            role: 'admin'
        };
        localStorage.setItem('sportsArenaAdmin', JSON.stringify(adminUser));
        updateNav();
        return true;
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Invalid admin credentials. Please check your email and password.');
        return false;
    }
}

// Admin logout
async function adminLogout() {
    try {
        await account.deleteSession('current');
    } catch (e) {
        console.warn('Session already expired.');
    } finally {
        localStorage.removeItem('sportsArenaAdmin');
        updateNav();
        window.location.href = 'index.html';
    }
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
