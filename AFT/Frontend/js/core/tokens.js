// Token deposu: access bellekte, refresh + oturum kaydı localStorage'da. store.user'ı senkron tutar.
import { store } from './store.js';

const SK = 'aft.session';   // { user, lastAuth }
const RK = 'aft.rt';        // refresh token (rotate edilir)

let accessToken = null;     // bellekte tut, kalıcı yazma

export const getAccess = () => accessToken;
export const getRefresh = () => localStorage.getItem(RK);
export const loadSession = () => JSON.parse(localStorage.getItem(SK) || 'null');

// Giriş/kayıt sonrası tam oturumu kur
export function saveAuth({ accessToken: at, refreshToken: rt, user }) {
    accessToken = at;
    if (rt) localStorage.setItem(RK, rt);
    localStorage.setItem(SK, JSON.stringify({ user, lastAuth: Date.now() }));
    store.set({ user });
}

// Refresh sonrası yalnız token'ları tazele (rotate edilen refresh dahil)
export function updateTokens(at, rt) {
    accessToken = at;
    if (rt) localStorage.setItem(RK, rt);
}

export function clearAuth() {
    accessToken = null;
    localStorage.removeItem(RK);
    localStorage.removeItem(SK);
    store.set({ user: null });
}