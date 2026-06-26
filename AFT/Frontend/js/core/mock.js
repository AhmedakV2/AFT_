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

// ---- Proje verisi: bellek-içi store + yardımcılar ----
const uid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();
const pageOf = (content) => ({ content, totalElements: content.length, totalPages: 1, number: 0 });
const nextFireMock = () => new Date(Date.now() + 60_000).toISOString(); // mock cron çözmez; backend gerçek değeri hesaplar

const projDb = {
    projects: [
        { id: uid(), name: 'E-ticaret Testleri', description: 'Ödeme ve sepet akışları', baseUrl: 'https://shop.example.com', cardColor: '#ef6c1a', createdAt: nowIso() },
        { id: uid(), name: 'Bankacılık', description: 'Giriş ve oturum doğrulama', baseUrl: 'https://bank.example.com', cardColor: '#2f6fb0', createdAt: nowIso() },
    ],
    modules: [],      // {id, projectId, name, description, createdAt}
    scenarios: [],    // {id, moduleId, name, description, status, createdAt}
    steps: {},        // scenarioId -> [adım]
    schedules: [],    // {id, scenarioId, cron, active, nextFireAt, lastFiredAt}
};

// Bir senaryonun adım dizisini getir, yoksa boş oluştur (demo adım enjekte etmez)
function stepsOf(scenarioId) {
    return projDb.steps[scenarioId] || (projDb.steps[scenarioId] = []);
}

// ScheduleResponse şekli: dahili scenarioId dışarı sızmadan döner
const toSchedule = ({ scenarioId, ...rest }) => rest;

// Gerçek backend sözleşmesi (flat): modül/senaryo create query param, listeleme query filtreli
function mockProjects(method, fullPath, body) {
    const [path, qs = ''] = fullPath.split('?');
    const q = new URLSearchParams(qs);
    const seg = path.split('/').filter(Boolean);                 // ['api','v1','projects',...]

    // Projeler
    if (path === '/api/v1/projects') {
        if (method === 'GET') return pageOf(projDb.projects);
        if (method === 'POST') { const p = { id: uid(), ...body, createdAt: nowIso() }; projDb.projects.unshift(p); return p; }
    }

    // Proje sil (+ cascade: modül, senaryo, adım, plan) (/api/v1/projects/{id})
    if (method === 'DELETE' && seg[2] === 'projects' && seg[3]) {
        const moduleIds = projDb.modules.filter((m) => m.projectId === seg[3]).map((m) => m.id);
        const scenarioIds = projDb.scenarios.filter((s) => moduleIds.includes(s.moduleId)).map((s) => s.id);
        scenarioIds.forEach((sid) => { delete projDb.steps[sid]; });                    // adımları sil
        projDb.schedules = projDb.schedules.filter((t) => !scenarioIds.includes(t.scenarioId)); // planları sil
        projDb.scenarios = projDb.scenarios.filter((s) => !moduleIds.includes(s.moduleId)); // senaryoları sil
        projDb.modules = projDb.modules.filter((m) => m.projectId !== seg[3]);          // modülleri sil
        projDb.projects = projDb.projects.filter((p) => p.id !== seg[3]);               // projeyi sil
        return 'Proje silindi';
    }

    // Modüller (/api/v1/modules?projectId=)
    if (path === '/api/v1/modules') {
        if (method === 'GET') {
            const pid = q.get('projectId');
            return pageOf(projDb.modules.filter((m) => !pid || m.projectId === pid));
        }
        if (method === 'POST') {
            const m = { id: uid(), projectId: q.get('projectId'), ...body, createdAt: nowIso() };
            projDb.modules.push(m); return m;
        }
    }

    // Modül sil (+ cascade: senaryo, adım, plan) (/api/v1/modules/{id})
    if (method === 'DELETE' && seg[2] === 'modules' && seg[3]) {
        const scenarioIds = projDb.scenarios.filter((s) => s.moduleId === seg[3]).map((s) => s.id);
        scenarioIds.forEach((sid) => { delete projDb.steps[sid]; });                    // adımları sil
        projDb.schedules = projDb.schedules.filter((t) => !scenarioIds.includes(t.scenarioId)); // planları sil
        projDb.scenarios = projDb.scenarios.filter((s) => s.moduleId !== seg[3]);       // senaryoları sil
        projDb.modules = projDb.modules.filter((m) => m.id !== seg[3]);                 // modülü sil
        return 'Modül silindi';
    }

    // Senaryolar (/api/v1/scenarios?moduleId=)
    if (path === '/api/v1/scenarios') {
        if (method === 'GET') {
            const mid = q.get('moduleId');
            return pageOf(projDb.scenarios.filter((s) => !mid || s.moduleId === mid));
        }
        if (method === 'POST') {
            const mid = q.get('moduleId');
            const s = { id: uid(), moduleId: mid, ...body, status: body.status || 'DRAFT', createdAt: nowIso() };
            projDb.scenarios.unshift(s);
            // Senaryo oluşunca projenin baseUrl'ini kalıcı ilk adım (NAVIGATE) olarak yaz
            const md = projDb.modules.find((x) => x.id === mid);
            const proj = md && projDb.projects.find((x) => x.id === md.projectId);
            projDb.steps[s.id] = proj && proj.baseUrl
                ? [{ id: uid(), stepOrder: 1, action: 'NAVIGATE', value: proj.baseUrl, selectors: {}, includedScenarioId: null, includedScenarioName: null }]
                : [];
            return s;
        }
    }

    // Senaryo status (/api/v1/scenarios/{id}/status)
    if (method === 'PATCH' && seg[2] === 'scenarios' && seg[4] === 'status') {
        const s = projDb.scenarios.find((x) => x.id === seg[3]);
        if (s) { s.status = body.status; return s; }
    }

    // Senaryo çalıştır (/api/v1/scenarios/{id}/run)
    if (method === 'POST' && seg[2] === 'scenarios' && seg[4] === 'run') {
        return { runId: uid(), status: 'QUEUED' };
    }

    // Zamanlanmış görevler — listele (/api/v1/scenarios/{id}/schedules)
    if (method === 'GET' && seg[2] === 'scenarios' && seg[4] === 'schedules' && !seg[5]) {
        return projDb.schedules.filter((t) => t.scenarioId === seg[3]).map(toSchedule);
    }

    // Zamanlanmış görev — oluştur (/api/v1/scenarios/{id}/schedules)
    if (method === 'POST' && seg[2] === 'scenarios' && seg[4] === 'schedules' && !seg[5]) {
        const cron = (body.cron || '').trim();
        const f = cron.split(/\s+/);
        if (f.length !== 6) throw { message: 'Geçersiz cron ifadesi.' };                // backend de 400 döner
        if (!/^[0-5]?\d$/.test(f[0])) throw { message: 'Çok sık tetikleme. En fazla 60 saniyede bir çalışabilir.' }; // saniye sabit
        const t = { id: uid(), scenarioId: seg[3], cron, active: true, nextFireAt: nextFireMock(), lastFiredAt: null };
        projDb.schedules.unshift(t); return toSchedule(t);
    }

    // Senaryo sil (+ cascade: adım, plan) (/api/v1/scenarios/{id})
    if (method === 'DELETE' && seg[2] === 'scenarios' && seg[3] && !seg[4]) {
        delete projDb.steps[seg[3]];                                                    // adımları sil
        projDb.schedules = projDb.schedules.filter((t) => t.scenarioId !== seg[3]);     // planları sil
        projDb.scenarios = projDb.scenarios.filter((s) => s.id !== seg[3]);             // senaryoyu sil
        return 'Senaryo silindi';
    }

    // Zamanlanmış görev — aktif/pasif yap (/api/v1/schedules/{id})
    if (method === 'PATCH' && seg[2] === 'schedules' && seg[3]) {
        const t = projDb.schedules.find((x) => x.id === seg[3]);
        if (!t) throw { message: 'Plan bulunamadı.' };
        t.active = body.active !== false;                                               // body {active}
        if (t.active) t.nextFireAt = nextFireMock();                                     // tekrar aktifse sonraki tetik yenilenir
        return toSchedule(t);
    }

    // Zamanlanmış görev — sil (/api/v1/schedules/{id})
    if (method === 'DELETE' && seg[2] === 'schedules' && seg[3]) {
        projDb.schedules = projDb.schedules.filter((x) => x.id !== seg[3]);
        return null;                                                                    // backend ApiResponse.ok(null)
    }

    // Kalıtım adayları (/api/v1/scenarios/inheritable?projectId=&excludeScenarioId=)
    if (path === '/api/v1/scenarios/inheritable' && method === 'GET') {
        const pid = q.get('projectId'); const ex = q.get('excludeScenarioId');
        const moduleIds = projDb.modules.filter((m) => m.projectId === pid).map((m) => m.id);
        return pageOf(projDb.scenarios.filter((s) => moduleIds.includes(s.moduleId) && s.id !== ex));
    }

    // Adım listesi (/api/v1/scenarios/{id}/steps)
    if (method === 'GET' && seg[2] === 'scenarios' && seg[4] === 'steps' && !seg[5]) {
        return projDb.steps[seg[3]] || [];
    }

    // Manuel adım ekle (/api/v1/scenarios/{id}/steps)
    if (method === 'POST' && seg[2] === 'scenarios' && seg[4] === 'steps' && !seg[5]) {
        const arr = stepsOf(seg[3]);
        const st = { id: uid(), stepOrder: arr.length + 1, action: body.action, value: body.value || null, selectors: body.selectors || {}, includedScenarioId: null, includedScenarioName: null };
        arr.push(st); return st;
    }

    // Kalıtım ekle (/api/v1/scenarios/{id}/steps/include)
    if (method === 'POST' && seg[2] === 'scenarios' && seg[4] === 'steps' && seg[5] === 'include') {
        const arr = stepsOf(seg[3]);
        const target = projDb.scenarios.find((x) => x.id === body.includedScenarioId);
        const st = { id: uid(), stepOrder: arr.length + 1, action: 'INCLUDE_SCENARIO', value: null, selectors: {}, includedScenarioId: body.includedScenarioId, includedScenarioName: target ? target.name : 'Senaryo' };
        arr.push(st); return st;
    }

    // Yeniden sırala (/api/v1/scenarios/{id}/steps/reorder)
    if (method === 'PATCH' && seg[2] === 'scenarios' && seg[4] === 'steps' && seg[5] === 'reorder') {
        const arr = projDb.steps[seg[3]] || [];
        const order = body.orderedStepIds;
        arr.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        arr.forEach((x, i) => { x.stepOrder = i + 1; });
        return arr;
    }

    // Adım sil (/api/v1/steps/{id})
    if (method === 'DELETE' && seg[2] === 'steps') {
        for (const k of Object.keys(projDb.steps)) projDb.steps[k] = projDb.steps[k].filter((x) => x.id !== seg[3]);
        return 'Adım silindi';
    }

    // Adım güncelle - seçici/değer (/api/v1/steps/{id})
    if (method === 'PATCH' && seg[2] === 'steps') {
        for (const k of Object.keys(projDb.steps)) {
            const st = projDb.steps[k].find((x) => x.id === seg[3]);
            if (st) { Object.assign(st, body); return st; }
        }
    }

    return undefined;
}

export async function mockApi(method, path, body) {
    await wait();
    const proj = mockProjects(method, path, body);               // önce proje uçlarını dene
    if (proj !== undefined) return proj;

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
            return { totalRuns: 128, activeSchedules: projDb.schedules.filter((s) => s.active).length }; // aktif plan sayısı dinamik
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