// Projeler ekranı: kartlar -> modüller -> senaryolar -> senaryo detayı (router param yok, view state ile).
import { el, icon } from '../core/dom.js';
import { api } from '../core/api.js';
import { appShell } from '../components/appShell.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

// 5 kart rengi (ayarlardaki aksan paletiyle aynı)
const CARD_COLORS = ['#ef6c1a', '#2f6fb0', '#1f9d57', '#7c5cdb', '#e0a106'];

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
        holder.replaceChildren(map[state.view]());
    };

    // ---------- Yardımcı UI parçaları ----------

    // Üst başlık + sağdaki aksiyon butonu
    const head = (title, sub, action) => el('div', { class: 'content__head row', style: 'justify-content:space-between;align-items:flex-end;gap:16px' },
        el('div', {}, el('h2', {}, title), sub && el('p', {}, sub)),
        action || '',
    );

    // Geri navigasyonu için breadcrumb
    const crumbs = (...items) => el('div', { class: 'row gap-2', style: 'margin-bottom:14px;flex-wrap:wrap;font-size:13px;font-weight:600' },
        ...items.flatMap((it, i) => [
            i ? el('span', { class: 'muted' }, icon('chevronR', 14)) : null,
            it.go
                ? el('button', { class: 'crumb', onClick: it.go }, it.label)
                : el('span', { class: 'muted' }, it.label),
        ].filter(Boolean)));

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
            return el('button', { class: 'proj-card press', onClick: () => { state.project = p; state.view = 'modules'; render(); } },
                el('div', { class: 'proj-card__bar', style: `background:${color}` }),
                el('div', { class: 'proj-card__body' },
                    el('div', { class: 'proj-card__icon', style: `background:${color}` }, (p.name || '?').charAt(0).toUpperCase()),
                    el('h3', { class: 'proj-card__name' }, p.name || '—'),
                    el('p', { class: 'proj-card__desc' }, p.description || 'Açıklama yok'),
                    el('div', { class: 'proj-card__url' }, icon('layers', 14), p.baseUrl || p.base_url || '—'),
                ));
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
            paint();

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

        return el('div', {}, head('Projeler', 'Test projelerini yönet.', newBtn), grid);
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
                ? rows.map((m) => el('tr', { class: 'row-link', onClick: () => { state.module = m; state.view = 'scenarios'; render(); } },
                    el('td', { style: 'font-weight:600;color:var(--fg)' }, m.name || '—'),
                    el('td', { class: 'muted' }, m.description || '—'),
                    el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(m.createdAt || m.created_at)),
                    el('td', {}, el('span', { class: 'muted' }, icon('chevronR', 16)))))
                : [el('tr', {}, el('td', { colspan: 4 }, el('div', { class: 'empty', style: 'padding:36px' }, icon('layers', 36), 'Bu projede modül yok.')))]));
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

        return el('div', {},
            crumbs({ label: 'Projeler', go: () => { state.view = 'projects'; render(); } }, { label: p.name }),
            head(p.name, p.description || p.baseUrl || p.base_url, newBtn),
            table);
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

        // Senaryo satırı: tarih, ad, açıklama, durum + en sağda düzenle/çalıştır
        function scenarioRow(s) {
            const edit = el('button', { class: 'btn btn--ghost btn--icon btn--sm press', title: 'Düzenle', onClick: () => { state.scenario = s; state.view = 'scenario'; render(); } }, icon('settings', 16));
            const run = el('button', { class: 'btn btn--soft btn--icon btn--sm press', title: 'Çalıştır', onClick: () => runScenario(s) }, icon('play', 15));
            return el('tr', {},
                el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(s.createdAt || s.created_at)),
                el('td', { style: 'font-weight:600;color:var(--fg)' }, s.name || '—'),
                el('td', { class: 'muted' }, s.description || '—'),
                el('td', {}, statusBadge(s.status)),
                el('td', {}, el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, edit, run)));
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

        return el('div', {},
            crumbs(
                { label: 'Projeler', go: () => { state.view = 'projects'; render(); } },
                { label: p.name, go: () => { state.view = 'modules'; render(); } },
                { label: m.name }),
            head(m.name, m.description, newBtn),
            table);
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

        const runBtn = el('button', { class: 'btn btn--soft press', onClick: () => runScenario(s) }, icon('play', 16), 'Run');

        const body = el('div', {});
        const stepsTab = el('button', { class: 'seg active', onClick: () => { tab = 'steps'; paintTabs(); } }, 'Senaryo Adımları');
        const selTab = el('button', { class: 'seg', onClick: () => { tab = 'selectors'; paintTabs(); } }, 'Seçici Değerler');

        // İlk adım her zaman projenin base URL'i (gereksinim: otomatik ilk adım).
        // Gerçek adımlar eklenti ingestion'ı ile gelir; GET steps ucu henüz yok, bu yüzden yalnız base adımı gösteriyoruz.
        const steps = [{ stepOrder: 1, action: 'OPEN', value: baseUrl, selector: null, auto: true }];

        // Aktif sekmeyi yeniden çizer
        function paintTabs() {
            stepsTab.className = 'seg' + (tab === 'steps' ? ' active' : '');
            selTab.className = 'seg' + (tab === 'selectors' ? ' active' : '');
            body.replaceChildren(tab === 'steps' ? stepsView() : selectorsView());
        }

        // 1. sekme: sıralı aksiyon adımları
        function stepsView() {
            return el('table', { class: 'table' },
                el('thead', {}, el('tr', {}, el('th', { style: 'width:60px' }, '#'), el('th', {}, 'Aksiyon'), el('th', {}, 'Değer'))),
                el('tbody', {}, ...steps.map((st, i) => el('tr', {},
                    el('td', { class: 'muted' }, st.stepOrder ?? i + 1),
                    el('td', {}, el('span', { class: 'badge ' + (st.auto ? 'badge--info' : 'badge--neutral') }, st.action || '—')),
                    el('td', { class: 'muted', style: 'word-break:break-all' }, st.value || '—')))));
        }

        // 2. sekme: yakalanan XPath / CSS / ID değerleri
        function selectorsView() {
            const withSel = steps.filter((st) => st.selector);
            if (!withSel.length) return el('div', { class: 'empty', style: 'padding:36px' }, icon('search', 36), 'Henüz seçici verisi yok (eklentiden gelir).');
            return el('table', { class: 'table' },
                el('thead', {}, el('tr', {}, el('th', {}, 'Adım'), el('th', {}, 'ID'), el('th', {}, 'CSS'), el('th', {}, 'XPath'))),
                el('tbody', {}, ...withSel.map((st) => el('tr', {},
                    el('td', { class: 'muted' }, st.action),
                    el('td', {}, el('input', { class: 'input', value: st.selector.id || '' })),
                    el('td', {}, el('input', { class: 'input', value: st.selector.css || '' })),
                    el('td', {}, el('input', { class: 'input', value: st.selector.xpath || '' }))))));
        }

        paintTabs();

        return el('div', {},
            crumbs(
                { label: 'Projeler', go: () => { state.view = 'projects'; render(); } },
                { label: p.name, go: () => { state.view = 'modules'; render(); } },
                { label: m.name, go: () => { state.view = 'scenarios'; render(); } },
                { label: s.name }),
            head(s.name, s.description, runBtn),
            el('div', { class: 'card panel' },
                el('div', { class: 'panel__head' }, el('div', { class: 'segbar' }, stepsTab, selTab)),
                body));
    }

    render();
    return appShell({ active: 'projects', title: 'Projeler', content: holder });
}