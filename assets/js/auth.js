/**
 * Auth — Login, logout, registro, sesión
 */

async function doLogin(username, password) {
    const user = await api('/login', { method: 'POST', body: { username, password } });
    AppState.setUser(user);
    return user;
}

async function doRegister(data) {
    return await api('/register', { method: 'POST', body: data });
}

async function doLogout() {
    try {
        await api('/logout', { method: 'POST' });
    } catch { /* ignore */ }
    AppState.clearSession();
    window.location.href = 'index.html';
}

function requireSession() {
    if (!AppState.loadSession()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
