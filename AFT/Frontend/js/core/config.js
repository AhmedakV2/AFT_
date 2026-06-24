// Uygulama yapılandırması
export const config = {
    // Backend kökü. Auth uçları /auth/**, kaynaklar /api/v1/** altında (ön ekler path'te verilir).
    API_ORIGIN: 'http://localhost:8080',
    USE_MOCK: false,            // backend'e bağlan. Offline denemek istersen true yap.
    SESSION_MAX_DAYS: 30,       // refresh token TTL'i (backend ile aynı): ayda bir yeniden giriş
    GOOGLE_CLIENT_ID: '',       // Google ile giriş için OAuth Client ID (boşsa devre dışı)
};