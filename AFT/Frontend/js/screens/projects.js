// Projeler ekranı: kartlar -> modüller -> senaryolar -> senaryo detayı (router param yok, view state ile).
import { el, icon } from '../core/dom.js';
import { api } from '../core/api.js';
import { appShell } from '../components/appShell.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

// 5 kart rengi (ayarlardaki aksan paletiyle aynı)
const CARD_COLORS = ['#ef6c1a', '#2f6fb0', '#1f9d57', '#7c5cdb', '#e0a106'];

// Üst stepper adımları ve view <-> adım eşlemesi
const STEPS = ['Projeler', 'Modüller', 'Senaryolar', 'Düzenleme'];
const VIEW_BY_STEP = ['projects', 'modules', 'scenarios', 'scenario'];
const STEP_BY_VIEW = { projects: 0, modules: 1, scenarios: 2, scenario: 3 };

// Sistemde kayıtlı aksiyon tipleri (INCLUDE_SCENARIO hariç; o "Kalıtım Al"dan eklenir)
const ACTION_GROUPS = [
    { label: 'Navigasyon', items: [['NAVIGATE', 'Sayfaya git'], ['NAVIGATE_BACK', 'Geri'], ['NAVIGATE_FORWARD', 'İleri'], ['REFRESH', 'Yenile']] },
    { label: 'Etkileşim', items: [['CLICK', 'Tıkla'], ['DOUBLE_CLICK', 'Çift tıkla'], ['RIGHT_CLICK', 'Sağ tıkla'], ['HOVER', 'Üzerine gel'], ['TYPE', 'Metin yaz'], ['TYPE_SECRET', 'Gizli metin yaz'], ['CLEAR', 'Temizle'], ['SELECT_OPTION', 'Seçenek seç'], ['PRESS_KEY', 'Tuşa bas'], ['UPLOAD_FILE', 'Dosya yükle']] },
    { label: 'Kaydırma', items: [['SCROLL_TO_ELEMENT', 'Elemana kaydır'], ['SCROLL_TO_TOP', 'En üste kaydır'], ['SCROLL_TO_BOTTOM', 'En alta kaydır']] },
    { label: 'Bekleme', items: [['WAIT_SECONDS', 'Saniye bekle'], ['WAIT_FOR_VISIBLE', 'Görünür olmasını bekle'], ['WAIT_FOR_CLICKABLE', 'Tıklanabilir olmasını bekle'], ['WAIT_FOR_TEXT', 'Metin gelmesini bekle'], ['WAIT_FOR_URL', 'URL değişimini bekle']] },
    { label: 'Doğrulama', items: [['ASSERT_VISIBLE', 'Görünür mü?'], ['ASSERT_NOT_VISIBLE', 'Gizli mi?'], ['ASSERT_TEXT_EQUALS', 'Metin eşit mi?'], ['ASSERT_TEXT_CONTAINS', 'Metin içeriyor mu?'], ['ASSERT_URL_CONTAINS', 'URL içeriyor mu?']] },
    { label: 'Diğer', items: [['SCREENSHOT', 'Ekran görüntüsü'], ['LOG_MESSAGE', 'Log mesajı']] },
];

// Eleman seçicisi gerektirmeyen aksiyonlar
const NO_SELECTOR = new Set(['NAVIGATE', 'NAVIGATE_BACK', 'NAVIGATE_FORWARD', 'REFRESH', 'SCROLL_TO_TOP', 'SCROLL_TO_BOTTOM', 'WAIT_SECONDS', 'WAIT_FOR_URL', 'ASSERT_URL_CONTAINS', 'SCREENSHOT', 'LOG_MESSAGE']);

// Değer alanı gerektirmeyen aksiyonlar (sadece eleman lazım)
const NO_VALUE = new Set(['CLICK', 'DOUBLE_CLICK', 'RIGHT_CLICK', 'HOVER', 'CLEAR', 'NAVIGATE_BACK', 'NAVIGATE_FORWARD', 'REFRESH', 'SCROLL_TO_ELEMENT', 'SCROLL_TO_TOP', 'SCROLL_TO_BOTTOM', 'ASSERT_VISIBLE', 'ASSERT_NOT_VISIBLE', 'SCREENSHOT']);

// Aksiyona göre değer alanı placeholder'ı
const VALUE_HINT = { NAVIGATE: 'https://...', TYPE: 'Yazılacak metin', TYPE_SECRET: 'Gizli değer', SELECT_OPTION: 'Seçilecek seçenek', PRESS_KEY: 'Enter, Tab, Escape...', WAIT_SECONDS: 'Saniye (örn. 2)', WAIT_FOR_TEXT: 'Beklenen metin', WAIT_FOR_URL: 'Beklenen URL parçası', ASSERT_TEXT_EQUALS: 'Beklenen metin', ASSERT_TEXT_CONTAINS: 'İçermesi gereken metin', ASSERT_URL_CONTAINS: 'URL parçası', LOG_MESSAGE: 'Mesaj', UPLOAD_FILE: 'Dosya yolu' };

// Girilen değerin seçici tipini sezgisel algılar (XPath/CSS/ID)
const detectSelector = (raw) => {
    const v = raw.trim();
    if (!v) return null;
    if (v.startsWith('/') || v.startsWith('(')) return { xpath: v };   // XPath
    if (/[.#\[\s>]/.test(v)) return { css: v };                         // CSS işareti var
    return { id: v };                                                   // sade kelime → id
};

const fmtDate = (iso) => {
    try { return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(iso)); }
    catch { return iso || '—'; }
};

// Page zarfını da düz diziyi de tek tipe indirger
const listOf = (res) => Array.isArray(res) ? res : (res?.content ?? []);

async function safeGet(path, fallback) {
    try { return await api.get(path); } catch { return fallback; }
}

export function projectsScreen() {
    // Tek kaynak ekran durumu; render() bu duruma göre içeriği basar
    const state = { view: 'projects', project: null, module: null, scenario: null };
    const holder = el('div', {});

    const render = () => {
        const map = { projects: viewProjects, modules: viewModules, scenarios: viewScenarios, scenario: viewScenario };
        holder.replaceChildren(stepper(), map[state.view]());   // üstte stepper, altta aktif görünüm
    };

    // İstenen adıma git (yalnız geri yönde; ileri kilitli)
    const goStep = (i) => { state.view = VIEW_BY_STEP[i]; render(); };

    // ---------- Üst adım göstergesi (4 adım, geri tıklanabilir) ----------
    function stepper() {
        const current = STEP_BY_VIEW[state.view];
        const dot = (i) => {
            const done = i < current, active = i === current;
            const canGo = i < current;                          // yalnız tamamlanmış adımlar tıklanır
            const bg = done ? 'var(--green)' : active ? 'var(--orange)' : 'var(--bg-3)';
            const fg = done || active ? '#fff' : 'var(--fg-3)';
            const circle = el('span', { style: `width:30px;height:30px;border-radius:99px;display:grid;place-items:center;background:${bg};color:${fg};font:700 13px var(--font-ui);flex-shrink:0;transition:background .2s` },
                done ? icon('check', 16) : String(i + 1));
            const label = el('span', { style: `font:600 13px var(--font-ui);color:${active ? 'var(--fg)' : 'var(--fg-3)'}` }, STEPS[i]);
            return el(canGo ? 'button' : 'div', {
                class: canGo ? 'press' : '', onClick: canGo ? () => goStep(i) : null,
                style: `display:flex;align-items:center;gap:9px;border:none;background:none;cursor:${canGo ? 'pointer' : 'default'};padding:0`,
            }, circle, label);
        };
        const line = () => el('span', { style: 'flex:1;height:2px;background:var(--border);min-width:18px' });
        return el('div', { class: 'card card--pad', style: 'display:flex;align-items:center;gap:10px;margin-bottom:20px;overflow-x:auto' },
            ...STEPS.flatMap((_, i) => i ? [line(), dot(i)] : [dot(i)]));
    }

    // ---------- Yardımcı UI parçaları ----------

    // Üst başlık + sağdaki aksiyon butonu
    const head = (title, sub, action) => el('div', { class: 'content__head row', style: 'justify-content:space-between;align-items:flex-end;gap:16px' },
        el('div', {}, el('h2', {}, title), sub && el('p', {}, sub)),
        action || '',
    );

    // Ortak silme onayı: kullanıcı onaylarsa fn çalışır
    function confirmDelete(message, fn) {
        const warn = el('p', { class: 'muted', style: 'margin:0 0 4px' }, message);
        const cancelBtn = el('button', { class: 'btn btn--ghost press' }, 'Vazgeç');
        const okBtn = el('button', { class: 'btn btn--danger press' }, icon('x', 16), 'Sil');
        okBtn.onclick = async () => {
            okBtn.disabled = true; okBtn.textContent = 'Siliniyor...';
            try { await fn(); close(); } catch (err) { okBtn.disabled = false; okBtn.textContent = 'Sil'; toast(err.message || 'Silinemedi.', 'error'); }
        };
        cancelBtn.onclick = () => close();
        const close = openModal(el('div', { class: 'col gap-4' },
            warn,
            el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, cancelBtn, okBtn),
        ), { title: 'Silme Onayı' });
    }

    const statusBadge = (s) => String(s).toUpperCase() === 'READY'
        ? el('span', { class: 'badge badge--success' }, 'Hazır')
        : el('span', { class: 'badge badge--neutral' }, 'Taslak');

    const emptyBox = (text, ic = 'folder') => el('div', { class: 'card' },
        el('div', { class: 'empty' }, icon(ic, 40), el('div', {}, text)));

    // ---------- 1) Proje kartları ----------

    function viewProjects() {
        const grid = el('div', { class: 'proj-grid' }, el('div', { class: 'muted', style: 'padding:24px' }, 'Yükleniyor...'));

        const newBtn = el('button', { class: 'btn btn--primary press', onClick: () => openProjectModal() }, icon('plus', 18), 'Yeni Proje');

        (async () => {
            const projects = listOf(await safeGet('/api/v1/projects?page=0&size=100&sort=createdAt,desc', []));
            grid.replaceChildren(...(projects.length
                ? [...projects.map(projectCard), addCard()]
                : [emptyBox('Henüz projen yok. İlk projeni oluştur.'), addCard()]));
        })();

        // Kart: renk şeridi + ad + açıklama + baseUrl; tıklayınca modüllere geçer
        function projectCard(p) {
            const color = p.cardColor || p.card_color || 'var(--orange)';
            const del = el('button', { class: 'btn btn--ghost btn--icon btn--sm press proj-card__del', title: 'Sil', onClick: (e) => { e.stopPropagation(); askDeleteProject(p); } }, icon('x', 15));
            return el('button', { class: 'proj-card press', onClick: () => { state.project = p; state.view = 'modules'; render(); } },
                el('div', { class: 'proj-card__bar', style: `background:${color}` }),
                del,
                el('div', { class: 'proj-card__body' },
                    el('div', { class: 'proj-card__icon', style: `background:${color}` }, (p.name || '?').charAt(0).toUpperCase()),
                    el('h3', { class: 'proj-card__name' }, p.name || '—'),
                    el('p', { class: 'proj-card__desc' }, p.description || 'Açıklama yok'),
                    el('div', { class: 'proj-card__url' }, icon('layers', 14), p.baseUrl || p.base_url || '—'),
                ));
        }

        // Proje silme onayı: modül, senaryo ve adımlar da silinir (cascade)
        function askDeleteProject(p) {
            confirmDelete(`"${p.name}" projesi ve içindeki tüm modül, senaryo ve adımlar kalıcı olarak silinecek. Onaylıyor musun?`, async () => {
                await api.del(`/api/v1/projects/${p.id}`);
                toast('Proje silindi.', 'success'); render();
            });
        }

        // "Yeni proje" boş kartı
        function addCard() {
            return el('button', { class: 'proj-card proj-card--add press', onClick: () => openProjectModal() },
                icon('plus', 26), el('span', {}, 'Yeni Proje'));
        }

        // Proje oluşturma modalı (ad, açıklama, baseUrl, kart rengi)
        function openProjectModal() {
            let picked = CARD_COLORS[0];
            const name = el('input', { class: 'input', placeholder: 'Örn. E-ticaret testleri' });
            const desc = el('textarea', { class: 'input', style: 'height:90px;padding:12px 14px;resize:vertical', placeholder: 'Kısa açıklama' });
            const url = el('input', { class: 'input', placeholder: 'https://shop.example.com' });

            const swatches = el('div', { class: 'swatches' });
            const paint = () => swatches.replaceChildren(...CARD_COLORS.map((hex) =>
                el('button', { class: 'swatch' + (picked === hex ? ' sel' : ''), style: `background:${hex}`, type: 'button', onClick: () => { picked = hex; paint(); } })));
            paint()

            const submit = el('button', { class: 'btn btn--primary btn--block press' }, 'Oluştur');
            submit.onclick = async () => {
                if (!name.value.trim() || !url.value.trim()) return toast('Proje adı ve base URL zorunlu.', 'error');
                submit.disabled = true; submit.textContent = 'Oluşturuluyor...';
                try {
                    await api.post('/api/v1/projects', { name: name.value.trim(), description: desc.value.trim(), baseUrl: url.value.trim(), cardColor: picked });
                    close(); toast('Proje oluşturuldu.', 'success'); render();
                } catch (err) {
                    submit.disabled = false; submit.textContent = 'Oluştur';
                    toast(err.message || 'Proje oluşturulamadı.', 'error');
                }
            };

            const close = openModal(el('div', { class: 'col gap-4' },
                el('div', { class: 'field' }, el('label', {}, 'Proje Adı'), name),
                el('div', { class: 'field' }, el('label', {}, 'Açıklama'), desc),
                el('div', { class: 'field' }, el('label', {}, 'Base URL'), url),
                el('div', { class: 'field' }, el('label', {}, 'Kart Rengi'), swatches),
                submit,
            ), { title: 'Yeni Proje' });
        }

        return el('div', {}, head('Projeler'), grid);
    }

    // ---------- 2) Modüller (sadece tablo) ----------

    function viewModules() {
        const p = state.project;
        const tbody = el('tbody', {}, el('tr', {}, el('td', { colspan: 4, class: 'muted', style: 'padding:24px' }, 'Yükleniyor...')));
        let all = [];

        const search = el('input', { class: 'input', style: 'max-width:280px', placeholder: 'Modül ara...' });
        search.oninput = () => paintRows(all.filter((m) => (m.name || '').toLowerCase().includes(search.value.toLowerCase())));

        const newBtn = el('button', { class: 'btn btn--primary press', onClick: openModuleModal }, icon('plus', 18), 'Yeni Modül');

        (async () => {
            // Gerçek uç: GET /api/v1/modules?projectId=...  (projeye göre listeleme)
            all = listOf(await safeGet(`/api/v1/modules?projectId=${p.id}&page=0&size=100`, []));
            paintRows(all);
        })();

        // Modül satırlarını basar; tıklayınca senaryolara geçer
        function paintRows(rows) {
            tbody.replaceChildren(...(rows.length
                ? rows.map((m) => {
                    const del = el('button', { class: 'btn btn--ghost btn--icon btn--sm press', title: 'Sil', onClick: (e) => { e.stopPropagation(); askDeleteModule(m); } }, icon('x', 15));
                    return el('tr', { class: 'row-link', onClick: () => { state.module = m; state.view = 'scenarios'; render(); } },
                        el('td', { style: 'font-weight:600;color:var(--fg)' }, m.name || '—'),
                        el('td', { class: 'muted' }, m.description || '—'),
                        el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(m.createdAt || m.created_at)),
                        el('td', {}, el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, del, icon('chevronR', 16))));
                })
                : [el('tr', {}, el('td', { colspan: 4 }, el('div', { class: 'empty', style: 'padding:36px' }, icon('layers', 36), 'Bu projede modül yok.')))]));
        }

        // Modül silme onayı: senaryo ve adımlar da silinir (cascade)
        function askDeleteModule(m) {
            confirmDelete(`"${m.name}" modülü ve içindeki tüm senaryo ve adımlar silinecek. Onaylıyor musun?`, async () => {
                await api.del(`/api/v1/modules/${m.id}`);
                toast('Modül silindi.', 'success');
                all = all.filter((x) => x.id !== m.id); paintRows(all);
            });
        }

        // Modül oluşturma modalı (sadece ad + açıklama)
        function openModuleModal() {
            const name = el('input', { class: 'input', placeholder: 'Örn. Login akışı' });
            const desc = el('textarea', { class: 'input', style: 'height:90px;padding:12px 14px;resize:vertical', placeholder: 'Kısa açıklama' });
            const submit = el('button', { class: 'btn btn--primary btn--block press' }, 'Oluştur');
            submit.onclick = async () => {
                if (!name.value.trim()) return toast('Modül adı zorunlu.', 'error');
                submit.disabled = true; submit.textContent = 'Oluşturuluyor...';
                try {
                    // Gerçek uç: POST /api/v1/modules?projectId=...  (projectId query param, body sadece ad+açıklama)
                    await api.post(`/api/v1/modules?projectId=${p.id}`, { name: name.value.trim(), description: desc.value.trim() });
                    close(); toast('Modül oluşturuldu.', 'success'); render();
                } catch (err) {
                    submit.disabled = false; submit.textContent = 'Oluştur';
                    toast(err.message || 'Modül oluşturulamadı.', 'error');
                }
            };
            const close = openModal(el('div', { class: 'col gap-4' },
                el('div', { class: 'field' }, el('label', {}, 'Modül Adı'), name),
                el('div', { class: 'field' }, el('label', {}, 'Açıklama'), desc),
                submit,
            ), { title: 'Yeni Modül' });
        }

        const table = el('div', { class: 'card panel' },
            el('div', { class: 'panel__head' }, el('h3', {}, 'Modüller'), search),
            el('table', { class: 'table' },
                el('thead', {}, el('tr', {}, el('th', {}, 'Ad'), el('th', {}, 'Açıklama'), el('th', {}, 'Tarih'), el('th', {}, ''))),
                tbody));

        return el('div', {}, head(p.name, p.description || p.baseUrl || p.base_url, newBtn), table);
    }

    // ---------- 3) Senaryolar ----------

    function viewScenarios() {
        const { project: p, module: m } = state;
        const tbody = el('tbody', {}, el('tr', {}, el('td', { colspan: 5, class: 'muted', style: 'padding:24px' }, 'Yükleniyor...')));

        const newBtn = el('button', { class: 'btn btn--primary press', onClick: openScenarioModal }, icon('plus', 18), 'Yeni Senaryo');

        (async () => {
            // Gerçek uç: GET /api/v1/scenarios?moduleId=...  (modüle göre listeleme)
            const rows = listOf(await safeGet(`/api/v1/scenarios?moduleId=${m.id}&page=0&size=100&sort=createdAt,desc`, []));
            tbody.replaceChildren(...(rows.length ? rows.map(scenarioRow)
                : [el('tr', {}, el('td', { colspan: 5 }, el('div', { class: 'empty', style: 'padding:36px' }, icon('fileText', 36), 'Bu modülde senaryo yok.')))]));
        })();

        // Senaryo satırı: tarih, ad, açıklama, durum + en sağda düzenle/çalıştır/sil
        function scenarioRow(s) {
            const edit = el('button', { class: 'btn btn--ghost btn--icon btn--sm press', title: 'Düzenle', onClick: () => { state.scenario = s; state.view = 'scenario'; render(); } }, icon('settings', 16));
            const run = el('button', { class: 'btn btn--soft btn--icon btn--sm press', title: 'Çalıştır', onClick: () => runScenario(s) }, icon('play', 15));
            const del = el('button', { class: 'btn btn--ghost btn--icon btn--sm press', title: 'Sil', onClick: () => askDeleteScenario(s) }, icon('x', 16));

            const nameCell = el('td', { style: 'font-weight:600;color:var(--fg)' }, s.name || '—');
            // Başka senaryolar bunu kalıtım alıyorsa görünür rozet bas
            if (s.included) nameCell.append(el('span', { class: 'badge badge--info', title: 'Bu senaryo başka senaryolar tarafından kullanılıyor.', style: 'margin-left:8px;font-size:11px' }, icon('layers', 12)));

            return el('tr', {},
                el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(s.createdAt || s.created_at)),
                nameCell,
                el('td', { class: 'muted' }, s.description || '—'),
                el('td', {}, statusBadge(s.status)),
                el('td', {}, el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, edit, run, del)));
        }

        // Senaryo silme onayı: adımlar da silinir (cascade)
        function askDeleteScenario(s) {
            confirmDelete(`"${s.name}" senaryosu ve tüm adımları silinecek. Onaylıyor musun?`, async () => {
                await api.del(`/api/v1/scenarios/${s.id}`);
                toast('Senaryo silindi.', 'success'); render();
            });
        }

        // Senaryo oluşturma modalı (ad, açıklama, durum)
        function openScenarioModal() {
            const name = el('input', { class: 'input', placeholder: 'Örn. Kredi kartı ile ödeme' });
            const desc = el('textarea', { class: 'input', style: 'height:90px;padding:12px 14px;resize:vertical', placeholder: 'Kısa açıklama' });
            const status = el('select', { class: 'input' }, el('option', { value: 'DRAFT' }, 'Taslak'), el('option', { value: 'READY' }, 'Hazır'));
            const submit = el('button', { class: 'btn btn--primary btn--block press' }, 'Oluştur');
            submit.onclick = async () => {
                if (!name.value.trim()) return toast('Senaryo adı zorunlu.', 'error');
                submit.disabled = true; submit.textContent = 'Oluşturuluyor...';
                try {
                    // status create body'sinde gider (DTO zorunlu tutar); ek PATCH yok
                    await api.post(`/api/v1/scenarios?moduleId=${m.id}`, { name: name.value.trim(), description: desc.value.trim(), status: status.value });
                    close(); toast('Senaryo oluşturuldu.', 'success'); render();
                } catch (err) {
                    submit.disabled = false; submit.textContent = 'Oluştur';
                    toast(err.message || 'Senaryo oluşturulamadı.', 'error');
                }
            };
            const close = openModal(el('div', { class: 'col gap-4' },
                el('div', { class: 'field' }, el('label', {}, 'Senaryo Adı'), name),
                el('div', { class: 'field' }, el('label', {}, 'Açıklama'), desc),
                el('div', { class: 'field' }, el('label', {}, 'Durum'), status),
                submit,
            ), { title: 'Yeni Senaryo' });
        }

        const table = el('div', { class: 'card panel' },
            el('div', { class: 'panel__head' }, el('h3', {}, 'Senaryolar'), ''),
            el('table', { class: 'table' },
                el('thead', {}, el('tr', {}, el('th', {}, 'Tarih'), el('th', {}, 'Ad'), el('th', {}, 'Açıklama'), el('th', {}, 'Durum'), el('th', { style: 'text-align:right' }, 'İşlem'))),
                tbody));

        return el('div', {}, head(m.name, m.description, newBtn), table);
    }

    // Senaryoyu çalıştırma kuyruğuna atar (gerçek uç: POST /api/v1/scenarios/{id}/run)
    async function runScenario(s) {
        try { await api.post(`/api/v1/scenarios/${s.id}/run`); toast(`"${s.name}" çalıştırma kuyruğa alındı.`, 'success'); }
        catch (err) { toast(err.message || 'Çalıştırma başlatılamadı.', 'error'); }
    }

    // ---------- 4) Senaryo detayı (adımlar + seçiciler) ----------

    function viewScenario() {
        const { project: p, module: m, scenario: s } = state;
        const baseUrl = p.baseUrl || p.base_url || '';
        let tab = 'steps';
        let steps = [];                                              // gerçek adımlar (GET /steps)
        let dragId = null;                                          // sürüklenen adımın id'si

        const runBtn = el('button', { class: 'btn btn--soft press', onClick: () => runScenario(s) }, icon('play', 16), 'Çalıştır');
        const inheritBtn = el('button', { class: 'btn btn--ghost press', onClick: openInheritModal }, icon('layers', 16), 'Senaryo Dahil Et');
        const addStepBtn = el('button', { class: 'btn btn--ghost press', onClick: openStepDrawer }, icon('plus', 16), 'Aksiyon Ekle');

        const body = el('div', {});
        const stepsTab = el('button', { class: 'seg active', onClick: () => { tab = 'steps'; paintTabs(); } }, 'Senaryo Adımları');
        const selTab = el('button', { class: 'seg', onClick: () => { tab = 'selectors'; paintTabs(); } }, 'Seçici Değerler');

        // Adımları backend'den çek (INCLUDE_SCENARIO satırları da gelir)
        (async () => { steps = listOf(await safeGet(`/api/v1/scenarios/${s.id}/steps`, [])); paintTabs(); })();

        const isAuto = (st) => st.action === 'NAVIGATE' && (st.value || '').replace(/\/$/, '') === baseUrl.replace(/\/$/, '');
        const isInclude = (st) => st.action === 'INCLUDE_SCENARIO';

        function paintTabs() {
            stepsTab.className = 'seg' + (tab === 'steps' ? ' active' : '');
            selTab.className = 'seg' + (tab === 'selectors' ? ' active' : '');
            body.replaceChildren(tab === 'steps' ? stepsView() : selectorsView());
        }

        // 1. sekme: sürüklenebilir adım tablosu (INCLUDE satırı = gömülü senaryo)
        function stepsView() {
            if (!steps.length) return el('div', { class: 'empty', style: 'padding:36px' }, icon('fileText', 36), 'Henüz adım yok. Eklentiden kaydet, kalıtım al ya da manuel aksiyon ekle.');
            const rows = steps.map((st, i) => stepRow(st, i));
            return el('table', { class: 'table table--drag' },
                el('thead', {}, el('tr', {}, el('th', { style: 'width:48px' }, ''), el('th', { style: 'width:56px' }, '#'), el('th', {}, 'Aksiyon'), el('th', {}, 'Değer'), el('th', { style: 'width:56px' }, ''))),
                el('tbody', {}, ...rows));
        }

        // Tek adım satırı; INCLUDE ise senaryo adıyla vurgulu gösterilir
        function stepRow(st, i) {
            const inc = isInclude(st);
            const actionCell = inc
                ? el('span', { class: 'badge badge--info' }, icon('layers', 13), st.includedScenarioName || 'Senaryo')
                : el('span', { class: 'badge ' + (isAuto(st) ? 'badge--info' : 'badge--neutral') }, st.action || '—');
            const valueCell = inc
                ? el('span', { class: 'muted' }, 'Gömülü senaryo adımları')
                : el('span', { class: 'muted', style: 'word-break:break-all' }, (isAuto(st) ? 'Otomatik · ' : '') + (st.value || '—'));

            const del = el('button', { class: 'btn btn--ghost btn--icon btn--sm press', title: 'Sil', onClick: (e) => { e.stopPropagation(); removeStep(st); } }, icon('x', 15));

            const tr = el('tr', { class: 'drag-row' + (inc ? ' drag-row--inc' : ''), draggable: 'true', dataset: { id: st.id } },
                el('td', { class: 'drag-handle muted' }, icon('menu', 16)),
                el('td', { class: 'muted' }, i + 1),
                el('td', {}, actionCell),
                el('td', {}, valueCell),
                el('td', {}, del));

            // Native HTML5 sürükle-bırak ile yeniden sıralama
            tr.ondragstart = () => { dragId = st.id; tr.classList.add('dragging'); };
            tr.ondragend = () => { dragId = null; tr.classList.remove('dragging'); };
            tr.ondragover = (e) => { e.preventDefault(); tr.classList.add('drop-target'); };
            tr.ondragleave = () => tr.classList.remove('drop-target');
            tr.ondrop = (e) => { e.preventDefault(); tr.classList.remove('drop-target'); dropOn(st.id); };
            return tr;
        }

        // Sürüklenen adımı hedefin önüne taşı, sırayı backend'e yaz
        function dropOn(targetId) {
            if (!dragId || dragId === targetId) return;
            const from = steps.findIndex((x) => x.id === dragId);
            const to = steps.findIndex((x) => x.id === targetId);
            if (from < 0 || to < 0) return;
            const [moved] = steps.splice(from, 1);
            steps.splice(to, 0, moved);
            paintTabs();
            persistOrder();
        }

        // PATCH /steps/reorder — yeni sırayı id listesi olarak gönder
        async function persistOrder() {
            try { await api.patch(`/api/v1/scenarios/${s.id}/steps/reorder`, { orderedStepIds: steps.map((x) => x.id) }); }
            catch (err) { toast(err.message || 'Sıralama kaydedilemedi.', 'error'); reload(); }
        }

        async function removeStep(st) {
            try { await api.del(`/api/v1/steps/${st.id}`); steps = steps.filter((x) => x.id !== st.id); paintTabs(); }
            catch (err) { toast(err.message || 'Adım silinemedi.', 'error'); }
        }

        async function reload() { steps = listOf(await safeGet(`/api/v1/scenarios/${s.id}/steps`, [])); paintTabs(); }

        // 2. sekme: seçici (id/css/xpath) düzenleme — PATCH /steps/{id}
        function selectorsView() {
            const withSel = steps.filter((st) => st.selectors && Object.keys(st.selectors).length);
            if (!withSel.length) return el('div', { class: 'empty', style: 'padding:36px' }, icon('search', 36), 'Henüz seçici verisi yok (eklentiden gelir).');
            const cell = (st, key) => {
                const inp = el('input', { class: 'input', value: (st.selectors[key] || '') });
                inp.onchange = async () => {
                    const selectors = { ...st.selectors, [key]: inp.value };
                    try { await api.patch(`/api/v1/steps/${st.id}`, { selectors }); st.selectors = selectors; }
                    catch (err) { toast(err.message || 'Seçici kaydedilemedi.', 'error'); }
                };
                return el('td', {}, inp);
            };
            return el('table', { class: 'table' },
                el('thead', {}, el('tr', {}, el('th', {}, 'Adım'), el('th', {}, 'ID'), el('th', {}, 'CSS'), el('th', {}, 'XPath'))),
                el('tbody', {}, ...withSel.map((st) => el('tr', {},
                    el('td', { class: 'muted' }, st.action), cell(st, 'id'), cell(st, 'css'), cell(st, 'xpath')))));
        }

        // "Kalıtım Al" modalı: aynı projedeki uygun senaryolar
        function openInheritModal() {
            const listWrap = el('div', { class: 'col gap-2', style: 'max-height:340px;overflow:auto' }, el('div', { class: 'muted', style: 'padding:12px' }, 'Yükleniyor...'));
            (async () => {
                const rows = listOf(await safeGet(`/api/v1/scenarios/inheritable?projectId=${p.id}&excludeScenarioId=${s.id}&page=0&size=100`, []));
                listWrap.replaceChildren(...(rows.length
                    ? rows.map((cand) => el('button', { class: 'inherit-item press', onClick: () => addInherit(cand) },
                        el('div', {}, el('div', { style: 'font-weight:600;color:var(--fg)' }, cand.name),
                            el('div', { class: 'muted', style: 'font-size:12px' }, cand.description || '—')),
                        el('span', { class: 'badge badge--soft' }, icon('plus', 13), 'Ekle')))
                    : [el('div', { class: 'empty', style: 'padding:28px' }, icon('layers', 32), 'Eklenebilecek senaryo yok.')]));
            })();
            const close = openModal(listWrap, { title: 'Kalıtım Al' });

            // Seçilen senaryoyu INCLUDE adımı olarak ekle (sona eklenir, sürükleyerek taşınır)
            async function addInherit(cand) {
                try {
                    await api.post(`/api/v1/scenarios/${s.id}/steps/include`, { includedScenarioId: cand.id });
                    close(); toast(`"${cand.name}" kalıtım olarak eklendi.`, 'success'); reload();
                } catch (err) { toast(err.message || 'Kalıtım eklenemedi.', 'error'); }
            }
        }

        // "Aksiyon Ekle" paneli: sağdan kayarak açılan drawer (kategorize seçim + dinamik alanlar)
        function openStepDrawer() {
            // Kategorili aksiyon select'i (optgroup)
            const action = el('select', { class: 'input' },
                ...ACTION_GROUPS.map((g) => el('optgroup', { label: g.label },
                    ...g.items.map(([val, txt]) => el('option', { value: val }, txt)))));

            const valueField = el('div', { class: 'field' });
            const value = el('input', { class: 'input' });
            const selectorField = el('div', { class: 'field' });
            const selector = el('input', { class: 'input', placeholder: '#email, //input[@id="email"] veya email' });
            const hint = el('div', { class: 'muted', style: 'font-size:12px;margin-top:6px' }, 'CSS, XPath ya da ID otomatik algılanır.');

            // Aksiyon değişince ilgili alanları göster/gizle ve placeholder'ı güncelle
            const sync = () => {
                const a = action.value;
                valueField.style.display = NO_VALUE.has(a) ? 'none' : '';
                value.placeholder = VALUE_HINT[a] || 'Değer';
                selectorField.style.display = NO_SELECTOR.has(a) ? 'none' : '';
            };
            action.onchange = sync;

            valueField.append(el('label', {}, 'Değer'), value);
            selectorField.append(el('label', {}, 'Hedef Eleman'), selector, hint);

            const submit = el('button', { class: 'btn btn--primary btn--block press' }, 'Ekle');

            // Drawer iskeleti: scrim + panel; ikisi de animasyon için bir tick sonra "open" alır
            const scrim = el('div', { class: 'drawer-scrim' });
            const closeBtn = el('button', { class: 'btn btn--ghost btn--icon press', title: 'Kapat' }, icon('x', 18));
            const panel = el('div', { class: 'drawer' },
                el('div', { class: 'drawer__head' }, el('h3', {}, 'Aksiyon Ekle'), closeBtn),
                el('div', { class: 'drawer__body' },
                    el('div', { class: 'col gap-4' },
                        el('div', { class: 'field' }, el('label', {}, 'Aksiyon'), action),
                        valueField, selectorField)),
                el('div', { class: 'drawer__foot' }, submit));

            document.body.append(scrim, panel);
            requestAnimationFrame(() => { scrim.classList.add('open'); panel.classList.add('open'); });

            // Kapatma: animasyonu oynat, bitince DOM'dan kaldır ve ESC dinleyicisini sök
            const close = () => {
                scrim.classList.remove('open'); panel.classList.remove('open');
                document.removeEventListener('keydown', onEsc);
                setTimeout(() => { scrim.remove(); panel.remove(); }, 280);
            };
            const onEsc = (e) => { if (e.key === 'Escape') close(); };
            scrim.onclick = close;
            closeBtn.onclick = close;
            document.addEventListener('keydown', onEsc);

            submit.onclick = async () => {
                const a = action.value;
                // Eleman zorunluysa boş bırakılamaz
                if (!NO_SELECTOR.has(a) && !selector.value.trim()) return toast('Hedef eleman gerekli.', 'error');
                const selectors = NO_SELECTOR.has(a) ? null : detectSelector(selector.value);
                submit.disabled = true; submit.textContent = 'Ekleniyor...';
                try {
                    // Sona eklenir; reload sonrası drag-drop ile taşınabilir
                    await api.post(`/api/v1/scenarios/${s.id}/steps`, {
                        action: a,
                        value: NO_VALUE.has(a) ? null : (value.value.trim() || null),
                        selectors,
                    });
                    close(); toast('Aksiyon eklendi.', 'success'); reload();
                } catch (err) {
                    submit.disabled = false; submit.textContent = 'Ekle';
                    toast(err.message || 'Aksiyon eklenemedi.', 'error');
                }
            };

            sync();   // ilk açılışta alanları hizala
        }

        paintTabs();

        return el('div', {},
            head(s.name, s.description, el('div', { class: 'row gap-2' }, addStepBtn, inheritBtn, runBtn)),
            el('div', { class: 'card panel' },
                el('div', { class: 'panel__head' }, el('div', { class: 'segbar' }, stepsTab, selTab)),
                body));
    }

    render();
    return appShell({ active: 'projects', title: 'Projeler', content: holder });
}