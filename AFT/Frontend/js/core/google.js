// Google Identity Services ile idToken alır. config.GOOGLE_CLIENT_ID dolu olmalı.
import { config } from './config.js';

let loader;
function loadGis() {
    return (loader ||= new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';        // GIS istemci kütüphanesi
        s.async = true; s.onload = resolve; s.onerror = () => reject({ message: 'Google kütüphanesi yüklenemedi' });
        document.head.append(s);
    }));
}

// Kullanıcıya Google hesabı seçtirir, backend'e gönderilecek idToken'ı döndürür
export async function getGoogleIdToken() {
    if (!config.GOOGLE_CLIENT_ID) throw { message: 'Google istemci kimliği ayarlı değil (config.GOOGLE_CLIENT_ID).' };
    await loadGis();
    return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
            client_id: config.GOOGLE_CLIENT_ID,
            callback: (r) => (r?.credential ? resolve(r.credential) : reject({ message: 'Google girişi tamamlanmadı' })),
        });
        window.google.accounts.id.prompt();                      // hesap seçim penceresini aç
    });
}