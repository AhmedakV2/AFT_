
import { el, icon } from '../core/dom.js';
import { api } from '../core/api.js';
import { appShell } from '../components/appShell.js';
import { openModal } from '../components/modal.js';
import { navigate } from '../core/router.js';


async function safeGet(path, fallback) {
    try { return await api.get(path); } catch { return fallback; }
}

const fmtDate = (iso) => {
    try { return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); }
    catch { return iso || '—'; }
};

function statusBadge(status) {
    const ok = String(status).toUpperCase() === 'PASSED';
    return el('span', { class: 'badge ' + (ok ? 'badge--success' : 'badge--fail') }, ok ? 'Başarılı' : 'Başarısız');
}

function runRow(r) {
    const total = r.totalSteps ?? 0, passed = r.passedSteps ?? 0;
    const pct = total ? Math.round((passed / total) * 100) : 0;
    const failed = String(r.status).toUpperCase() !== 'PASSED';
    return el('tr', {},
        el('td', {}, r.project || '—'),
        el('td', { style: 'font-weight:600' }, r.scenario || '—'),
        el('td', {}, statusBadge(r.status)),
        el('td', { style: 'min-width:160px' },
            el('div', { class: 'row gap-3' },
                el('div', { class: 'progress' + (failed ? ' progress--fail' : ''), style: 'flex:1' }, el('i', { style: `width:${pct}%` })),
                el('span', { class: 'muted', style: 'font-size:12px;white-space:nowrap' }, `${passed}/${total}`),
            )),
        el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(r.runAt)),
        el('td', {}, el('button', { class: 'btn btn--ghost btn--icon btn--sm', title: 'Raporu aç', onClick: () => navigate('/reports') }, icon('chevronR', 16))),
    );
}

export function dashboardScreen() {
    const statCard = (cls, ic, label, valRef, onDetail) => {
        const val = el('div', { class: 'stat__val' }, '—');
        valRef(val);
        return el('div', { class: 'card stat' },
            el('div', { class: 'stat__top' }, el('div', { class: `stat__ic ${cls}` }, icon(ic))),
            val,
            el('div', { class: 'stat__label' }, label),
            el('button', { class: 'stat__link', onClick: onDetail }, 'Detaylar'),
        );
    };

    let totalEl, schedEl;
    const cards = el('div', { class: 'stat-grid' },
        statCard('stat__ic--o', 'zap', 'Toplam çalıştırılan test', (n) => totalEl = n,
            () => openModal(el('p', { class: 'muted' }, 'Detaylı test istatistikleri raporlama modülüyle gelecek.'), { title: 'Test İstatistikleri' })),
        statCard('stat__ic--g', 'clock', 'Aktif zamanlanmış görev', (n) => schedEl = n,
            () => openModal(el('p', { class: 'muted' }, 'Zamanlanmış görev detayları yakında.'), { title: 'Zamanlanmış Görevler' })),
    );


    const tbody = el('tbody', {}, el('tr', {}, el('td', { colspan: '6', class: 'muted', style: 'padding:24px;text-align:center' }, 'Yükleniyor...')));
    const panel = el('div', { class: 'card panel' },
        el('div', { class: 'panel__head' }, el('h3', {}, 'Son Çalıştırmalar'),
            el('button', { class: 'btn btn--soft btn--sm', onClick: () => navigate('/reports') }, 'Tümünü gör')),
        el('table', { class: 'table' },
            el('thead', {}, el('tr', {},
                el('th', {}, 'Proje'), el('th', {}, 'Senaryo'), el('th', {}, 'Durum'),
                el('th', {}, 'Adımlar'), el('th', {}, 'Tarih'), el('th', {}, ''))),
            tbody),
    );


    (async () => {
        const summary = await safeGet('/api/v1/dashboard/summary', { totalRuns: 0, activeSchedules: 0 });
        totalEl.textContent = summary.totalRuns ?? 0;
        schedEl.textContent = summary.activeSchedules ?? 0;

        const runs = await safeGet('/api/v1/runs/recent?limit=5', []);
        if (!runs || !runs.length) {
            tbody.replaceChildren(el('tr', {}, el('td', { colspan: '6' },
                el('div', { class: 'empty' }, icon('fileText', 40), el('div', {}, 'Henüz çalıştırma yok'),
                    el('div', { style: 'font-size:13px;margin-top:4px' }, 'Bir senaryo çalıştırınca burada görünecek.')))));
        } else {
            tbody.replaceChildren(...runs.slice(0, 5).map(runRow));
        }
    })();

    return appShell({
        active: 'dashboard',
        title: 'Ana Sayfa',
        content: el('div', {},
            el('div', { class: 'content__head' }, el('h2', {}, 'Ana Sayfa'), el('p', {}, 'Testlerinin genel durumu ve son çalıştırmalar.')),
            cards,
            panel,
        ),
    });
}