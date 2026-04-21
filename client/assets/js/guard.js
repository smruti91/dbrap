const ROLE_ROUTES = {
    admin:   './dashboard/admin.html',
    manager: './dashboard/manager.html',
    user:    './dashboard/user.html',
};

// call on every PROTECTED page
async function guardPage(allowedRoles = []) {
    try {
        const res = await apiFetch('/auth/me');
        
        // null = refresh failed = not logged in → go to login
        if (!res || !res.ok) {
            window.location.href = './login.html';
            return null;
        }

        const data = await res.json();
        const user = data;
        
        console.log(user);

        // wrong role → 403
        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
            window.location.href = './403.html';
            return null;
        }

        return user;

    } catch {
        //window.location.href = './login.html';
        return null;
    }
}

// call on LOGIN page only — redirect if already logged in
async function checkAlreadyLoggedIn() {
    try {
        const res = await apiFetch('/auth/me');
        if (res && res.ok) {
            const data = await res.json();
            redirectByRole(data.user.role);
            return true;  // already logged in
        }
    } catch (_) {}
    return false;  // not logged in, stay on login page
}

function redirectByRole(role) {
    window.location.href = ROLE_ROUTES[role] || './login.html';
}