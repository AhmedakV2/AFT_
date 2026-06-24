// HTTP katmanı: ApiResponse zarfını açar, JWT ekler, 401'de bir kez refresh dener.
// Auth uçları /auth/**, kaynaklar /api/v1/** — tam path çağıranlar tarafından verilir.
import { config } from './config.js';
import { mockApi } from './mock.js';
import { getAccess, getRefresh, updateTokens, clearAuth } from './tokens.js';

async function request(method, path, body, retried = false) {
    if (config.USE_MOCK) return mockApi(method, path, body);   // backend yokken mock

    const res = await fetch(config.API_ORIGIN + path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(getAccess() && { Authorization: `Bearer ${getAccess()}` }),
        },
        body: body != null ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && !retried && path !== '/auth/refresh') { // token süresi dolmuş
        await refresh();
        return request(method, path, body, true);
    }

    const env = await res.json().catch(() => null);            // tüm yanıtlar {success,data,message}
    if (!res.ok || !env || env.success === false) {
        throw { message: env?.message || `İstek başarısız (${res.status})`, status: res.status };
    }
    return env.data;                                            // zarfı aç
}

// Refresh token'ı gövdede gönderir; backend yeni access + yeni refresh (rotate) döner
export async function refresh() {
    const rt = getRefresh();
    if (!rt) { clearAuth(); throw { message: 'Oturum bulunamadı' }; }
    const res = await fetch(config.API_ORIGIN + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
    });
    const env = await res.json().catch(() => null);
    if (!res.ok || !env?.success) { clearAuth(); location.hash = '#/login'; throw { message: 'Oturum süresi doldu' }; }
    updateTokens(env.data.accessToken, env.data.refreshToken);  // rotate edilen refresh'i sakla
    return env.data;
}

export const api = {
    get: (p) => request('GET', p),
    post: (p, b) => request('POST', p, b),
    put: (p, b) => request('PUT', p, b),
    patch: (p, b) => request('PATCH', p, b),
    del: (p) => request('DELETE', p),
};