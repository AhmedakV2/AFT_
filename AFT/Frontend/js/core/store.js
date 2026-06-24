// Tek kaynak state + pub/sub; tema/aksan tercihleri kalıcı saklanır
const KEY = 'aft.prefs';
const saved = JSON.parse(localStorage.getItem(KEY) || '{}');

const state = {
    user: null,                              // giriş yapan kullanıcı (null = misafir)
    theme: saved.theme || 'light',
    accent: saved.accent || '#ef6c1a',
    sidebarOpen: true,
};

const subs = new Set();

export const store = {
    get: () => state,                                            // anlık state
    set(patch) {                                                 // state'i güncelle + abonelere yay
        Object.assign(state, patch);
        persist();
        subs.forEach((fn) => fn(state));
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }, // aboneliği iptal eder
};

function persist() {                                            // yalnız kalıcı tercihleri yaz
    localStorage.setItem(KEY, JSON.stringify({ theme: state.theme, accent: state.accent }));
}