// Tema (light/dark) ve aksan rengini köke uygular
import { store } from './store.js';

export function applyTheme() {
    const { theme, accent } = store.get();
    document.documentElement.setAttribute('data-theme', theme);   // dark override'ı tetikler
    document.documentElement.style.setProperty('--orange', accent); // aksan rengini ayarla
}

export const toggleTheme = () =>
    store.set({ theme: store.get().theme === 'dark' ? 'light' : 'dark' });

export const setAccent = (hex) => store.set({ accent: hex });