// Oturum: giriş/çıkış, kayıt-doğrulama sonrası otomatik giriş, açılışta sessiz yenileme.
import { api, refresh } from './api.js';
import { config } from './config.js';
import { saveAuth, clearAuth, loadSession, getRefresh } from './tokens.js';
import { userFromToken } from './jwt.js';
import { store } from './store.js';
import { navigate } from './router.js';

// Açılışta çağrılır; geçerli refresh token varsa oturumu geri yükler
export async function bootSession() {
    const rec = loadSession();
    if (!rec || !getRefresh()) return;
    const ageDays = (Date.now() - rec.lastAuth) / 86400000;
    if (ageDays > config.SESSION_MAX_DAYS) return clearAuth();   // süre dolmuş, tekrar giriş
    try {
        await refresh();                                          // sessizce taze access al
        store.set({ user: rec.user });
    } catch {
        clearAuth();
    }
}

export async function login(email, password) {
    const data = await api.post('/auth/login', { email, password }); // {accessToken,refreshToken,...}
    saveAuth({ ...data, user: userFromToken(data.accessToken) });
}

export async function googleLogin(idToken) {
    const data = await api.post('/auth/google', { idToken });
    saveAuth({ ...data, user: userFromToken(data.accessToken) });
}

export async function logout() {
    try { await api.post('/auth/logout', { refreshToken: getRefresh() }); } catch { /* yine de çık */ }
    clearAuth();
    navigate('/login');
}