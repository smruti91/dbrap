const API = 'http://127.0.0.1:5000/api/v1';

let isRefreshing = false;
let refreshQueue = [];

async function apiFetch(url, options = {}) {
    const res = await fetch(`${API}${url}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });

    if (res.status === 401) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject, url, options });
            });
        }

        isRefreshing = true;

        const refreshed = await fetch(`${API}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include'
        });

        isRefreshing = false;

        if (!refreshed.ok) {
            refreshQueue.forEach(q => q.reject('Session expired'));
            refreshQueue = [];
            sessionStorage.clear();
            // ✅ NO redirect here — just return null
            // each page decides what to do
            return null;
        }

        // retry queued requests
        for (const q of refreshQueue) {
            try {
                const retried = await apiFetch(q.url, q.options);
                q.resolve(retried);
            } catch(e) {
                q.reject(e);
            }
        }
        refreshQueue = [];

        // retry original request
        return fetch(`${API}${url}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options
        });
    }

    return res;
}

async function logout() {
    try {
        await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (_) {}
    sessionStorage.clear();
    window.location.href = './login.html';
}