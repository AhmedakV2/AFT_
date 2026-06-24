// Geçici mock backend (config.USE_MOCK=true iken). Gerçek sözleşmeyle aynı şekilleri döndürür;
// request() mock modda zarf açmaz, bu yüzden burada doğrudan 'data' karşılığı döneriz.
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
let pending = {};                                                 // doğrulama bekleyen kayıtlar

function b64url(obj) {                                            // sahte JWT parçası üretir
    return btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function fakeJwt(email) {                                         // userFromToken çözebilsin diye email gömülü
    return `${b64url({ alg: 'none' })}.${b64url({ sub: email, email, exp: Date.now() / 1000 + 1800 })}.sig`;
}
const authResp = (email) => ({ accessToken: fakeJwt(email), refreshToken: 'mock.rt.' + Date.now(), tokenType: 'Bearer', expiresInSeconds: 1800 });

export async function mockApi(method, path, body) {
    await wait();
    const key = `${method} ${path}`;
    switch (key) {
        case 'POST /auth/register':
            pending[body.email] = { ...body, code: '123456' };         // demo kod
            return 'Onay kodu gönderildi (demo: 123456)';
        case 'POST /auth/verify-email': {
            const rec = pending[body.email];
            if (!rec || body.code !== rec.code) throw { message: 'Doğrulama kodu hatalı.' };
            delete pending[body.email];
            return 'E-posta doğrulandı';
        }
        case 'POST /auth/login':
            if (!body.email || !body.password) throw { message: 'E-posta ve şifre zorunlu.' };
            return authResp(body.email);
        case 'POST /auth/google':
            return authResp('user@gmail.com');
        case 'POST /auth/refresh':
            return authResp('user@demo.aft');
        case 'POST /auth/logout':
            return 'Çıkış yapıldı';
        case 'GET /api/v1/dashboard/summary':
            return { totalRuns: 128, activeSchedules: 4 };
        case 'GET /api/v1/runs/recent?limit=5':
            return [
                { project: 'E-Ticaret', scenario: 'Kredi kartı ile ödeme', status: 'PASSED', totalSteps: 12, passedSteps: 12, runAt: new Date(Date.now() - 36e5).toISOString() },
                { project: 'E-Ticaret', scenario: 'Geçersiz kart reddi', status: 'FAILED', totalSteps: 9, passedSteps: 6, runAt: new Date(Date.now() - 72e5).toISOString() },
                { project: 'Bankacılık', scenario: 'Giriş & oturum', status: 'PASSED', totalSteps: 7, passedSteps: 7, runAt: new Date(Date.now() - 18e5).toISOString() },
                { project: 'CRM', scenario: 'Müşteri ekleme', status: 'PASSED', totalSteps: 10, passedSteps: 10, runAt: new Date(Date.now() - 9e6).toISOString() },
                { project: 'E-Ticaret', scenario: 'Sepete ürün ekleme', status: 'FAILED', totalSteps: 8, passedSteps: 5, runAt: new Date(Date.now() - 12e6).toISOString() },
            ];
        default:
            throw { message: `Mock uç tanımsız: ${key}` };
    }
}