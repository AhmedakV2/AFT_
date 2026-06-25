import { el, icon } from '../core/dom.js';
import { api } from '../core/api.js';
import { store } from '../core/store.js';
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

const fmtNum = (n) => Number(n || 0).toLocaleString('tr-TR');

function statusBadge(status) {
    const s = String(status).toUpperCase();
    if (s === 'PASSED') return el('span', { class: 'badge badge--success badge--dot' }, 'Başarılı');
    if (s === 'PARTIAL') return el('span', { class: 'badge badge--neutral badge--dot' }, 'Kısmi');
    return el('span', { class: 'badge badge--fail badge--dot' }, 'Başarısız');
}

function runRow(r) {
    const total = r.totalSteps ?? 0, passed = r.passedSteps ?? 0;
    const pct = total ? Math.round((passed / total) * 100) : 0;
    const failed = String(r.status).toUpperCase() !== 'PASSED';
    return el('tr', {},
        el('td', {},
            el('div', { style: 'font-weight:600;color:var(--fg)' }, r.scenario || '—'),
            el('div', { class: 'muted', style: 'font-size:12px' }, r.project || '—'),
        ),
        el('td', {}, statusBadge(r.status)),
        el('td', { style: 'min-width:150px' },
            el('div', { class: 'row gap-3' },
                el('div', { class: 'progress' + (failed ? ' progress--fail' : ''), style: 'flex:1' }, el('i', { style: `width:${pct}%` })),
                el('span', { class: 'muted', style: 'font-size:12px;white-space:nowrap' }, `${passed}/${total}`),
            )),
        el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(r.runAt)),
        el('td', {}, el('button', { class: 'btn btn--ghost btn--icon btn--sm press', title: 'Raporu aç', onClick: () => navigate('/reports') }, icon('chevronR', 16))),
    );
}

// Delta rozeti — yalnız API değeri verince görünür
function deltaBadge(delta) {
    if (delta == null) return '';
    const up = delta >= 0;
    return el('span', {
        style: `font:700 11.5px var(--font-ui); padding:3px 8px; border-radius:7px; ${up ? 'color:var(--green-strong);background:var(--green-tint)' : 'color:var(--red);background:var(--red-tint)'}`
    }, `${up ? '▲' : '▼'} %${Math.abs(delta)}`);
}

// Sağ panel kartı
const railCard = (title, body) =>
    el('div', { class: 'card hover-lift anim-rise', style: 'padding:18px;' },
        el('h3', { style: 'font:700 14.5px var(--font-display); color:var(--fg); margin:0 0 14px;' }, title),
        body,
    );

const emptyMini = (text) => el('div', { class: 'muted', style: 'font-size:13px; padding:6px 0;' }, text);

export function dashboardScreen() {
    const name = store.get().user?.name || 'Kullanıcı';

    // --- Üst stat kartları ---
    const totalEl = el('div', { class: 'stat__val' }, '—');
    const totalDelta = el('span', {});
    const schedEl = el('div', { class: 'stat__val' }, '—');
    const rateEl = el('div', { class: 'stat__val' }, '—');
    const rateBar = el('i', { style: 'width:0%' });
    const monthEl = el('div', { class: 'stat__val' }, '—');
    const monthSub = el('div', { class: 'stat__label', style: 'margin-top:8px' }, '');
    const monthDelta = el('span', {});

    const cardTotal = el('div', { class: 'card stat hover-lift' },
        el('div', { class: 'stat__top' }, el('div', { class: 'stat__ic stat__ic--o' }, icon('zap')), totalDelta),
        totalEl,
        el('div', { class: 'stat__label' }, 'Toplam Test'),
        el('button', { class: 'stat__link press', onClick: () => openModal(el('p', { class: 'muted' }, 'Detaylı test istatistikleri raporlama modülüyle gelecek.'), { title: 'Test İstatistikleri' }) }, 'Detaylar'),
    );

    const cardSched = el('div', { class: 'card stat hover-lift' },
        el('div', { class: 'stat__top' },
            el('div', { class: 'stat__ic stat__ic--b' }, icon('clock')),
            el('span', { style: 'font:700 11.5px var(--font-ui); color:var(--blue-strong); background:var(--blue-tint); padding:3px 8px; border-radius:7px;' }, 'aktif')),
        schedEl,
        el('div', { class: 'stat__label' }, 'Zamanlanmış Görev'),
        el('button', { class: 'stat__link press',onClick:() => openModal(el('p', { class: 'muted' }, 'Detaylar zamanlanmış görevler modülü ile gelecek.'), { title: 'Zamanlanmış Görevler' }) }, 'Detaylar'),
    );

    const cardRate = el('div', { class: 'card stat hover-lift' },
        el('div', { class: 'stat__top' }, el('div', { class: 'stat__ic stat__ic--g' }, icon('checkCircle'))),
        rateEl,
        el('div', { class: 'stat__label' }, 'Başarı Oranı'),
        el('div', { class: 'progress', style: 'margin-top:12px' }, rateBar),
    );

    const cardMonth = el('div', { class: 'card stat hover-lift' },
        el('div', { class: 'stat__top' }, el('div', { class: 'stat__ic stat__ic--o' }, icon('calendar')), monthDelta),
        monthEl,
        el('div', { class: 'stat__label' }, 'Bu Ay Çalıştırma'),
        monthSub,
    );

    const cards = el('div', { class: 'stat-grid anim-stagger' }, cardTotal, cardSched, cardRate, cardMonth);

    // --- Son çalıştırmalar tablosu ---
    const tbody = el('tbody', {}, el('tr', {}, el('td', { colspan: '5', class: 'muted', style: 'padding:24px;text-align:center' }, 'Yükleniyor...')));
    const panel = el('div', { class: 'card panel anim-rise' },
        el('div', { class: 'panel__head' }, el('h3', {}, 'Son Çalıştırmalar'),
            el('button', { class: 'btn btn--soft btn--sm press', onClick: () => navigate('/reports') }, 'Tümünü gör')),
        el('table', { class: 'table' },
            el('thead', {}, el('tr', {},
                el('th', {}, 'Proje / Senaryo'), el('th', {}, 'Durum'),
                el('th', {}, 'Adımlar'), el('th', {}, 'Tarih'), el('th', {}, ''))),
            tbody),
    );

    // --- Sağ panel gövdeleri (async doldurulur) ---
    const alertsBody = el('div', {}, emptyMini('Yükleniyor...'));
    const upcomingBody = el('div', {}, emptyMini('Yükleniyor...'));
    const popularBody = el('div', {}, emptyMini('Yükleniyor...'));

    const rail = el('div', { style: 'display:flex; flex-direction:column; gap:18px;' },
        railCard('Kritik Uyarılar', alertsBody),
        railCard('Gelecek Çalıştırmalar', upcomingBody),
        railCard('Popüler Projeler', popularBody),
    );

    const grid = el('div', { style: 'display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:18px; align-items:start;' }, panel, rail);

    // --- Veri yükleme ---
    (async () => {
        const s = await safeGet('/api/v1/dashboard/summary', {});
        totalEl.textContent = fmtNum(s.totalRuns);
        totalDelta.replaceWith(deltaBadge(s.totalDelta) || el('span', {}));
        schedEl.textContent = fmtNum(s.activeSchedules);
        if (s.successRate != null) {
            rateEl.textContent = '%' + Number(s.successRate).toLocaleString('tr-TR');
            rateBar.style.width = Math.max(0, Math.min(100, Number(s.successRate))) + '%';
        }
        monthEl.textContent = fmtNum(s.monthlyRuns);
        if (s.prevMonthRuns != null) monthSub.textContent = 'Geçen ay: ' + fmtNum(s.prevMonthRuns);
        if (s.monthlyDelta != null) monthDelta.replaceWith(deltaBadge(s.monthlyDelta));

        const runs = await safeGet('/api/v1/runs/recent?limit=8', []);
        if (!runs || !runs.length) {
            tbody.replaceChildren(el('tr', {}, el('td', { colspan: '5' },
                el('div', { class: 'empty' }, icon('fileText', 40), el('div', {}, 'Henüz çalıştırma yok'),
                    el('div', { style: 'font-size:13px;margin-top:4px' }, 'Bir senaryo çalıştırınca burada görünecek.')))));
        } else {
            tbody.replaceChildren(...runs.slice(0, 8).map(runRow));
        }

        // Kritik uyarılar
        const alerts = await safeGet('/api/v1/alerts?limit=4', []);
        alertsBody.replaceChildren(...(alerts && alerts.length
            ? alerts.map((a) => el('div', { style: 'display:flex; gap:11px; padding:10px 0; border-top:1px solid var(--border);' },
                el('span', { style: `flex:none; width:8px; height:8px; border-radius:50%; margin-top:5px; background:${String(a.severity).toUpperCase() === 'HIGH' ? 'var(--red)' : 'var(--orange)'};` }),
                el('div', {},
                    el('div', { style: 'font:700 13px var(--font-ui); color:var(--fg)' }, a.title || '—'),
                    el('div', { class: 'muted', style: 'font:500 12px/1.45 var(--font-ui); margin-top:2px' }, a.message || ''),
                )))
            : [emptyMini('Aktif kritik uyarı yok.')]));

        // Gelecek çalıştırmalar
        const upcoming = await safeGet('/api/v1/schedules/upcoming?limit=4', []);
        upcomingBody.replaceChildren(...(upcoming && upcoming.length
            ? upcoming.map((u) => el('div', { style: 'display:flex; align-items:center; gap:11px; padding:9px 0;' },
                el('span', { class: 'stat__ic stat__ic--b', style: 'width:34px; height:34px; border-radius:9px;' }, icon('clock', 17)),
                el('div', { style: 'flex:1; min-width:0' },
                    el('div', { style: 'font:700 13px var(--font-ui); color:var(--fg)' }, u.name || '—'),
                    el('div', { class: 'muted', style: 'font:500 12px var(--font-ui)' }, `${u.project || '—'} · ${u.scenarioCount ?? 0} senaryo`),
                ),
                el('span', { class: 'muted', style: 'font:700 12px var(--font-ui); white-space:nowrap' }, u.nextRunLabel || fmtDate(u.nextRunAt))))
            : [emptyMini('Planlanmış çalıştırma yok.')]));

        // Popüler projeler
        const popular = await safeGet('/api/v1/projects/popular?limit=3', []);
        popularBody.replaceChildren(...(popular && popular.length
            ? popular.map((p) => el('div', { style: 'display:flex; align-items:center; gap:11px; padding:9px 0;' },
                el('span', { style: `flex:none; width:30px; height:30px; border-radius:8px; background:${p.color || 'var(--orange)'}; color:#fff; display:grid; place-items:center; font:800 12px var(--font-display);` }, (p.name || '?').charAt(0).toUpperCase()),
                el('span', { style: 'flex:1; font:700 13.5px var(--font-ui); color:var(--fg)' }, p.name || '—'),
                el('span', { class: 'muted', style: 'font:600 12px var(--font-ui)' }, `${fmtNum(p.runCount)} koşu`)))
            : [emptyMini('Henüz proje verisi yok.')]));
    })();

    return appShell({
        active: 'dashboard',
        title: 'Ana Sayfa',
        content: el('div', {},
            el('div', { class: 'content__head' },
                el('h2', {}, 'Merhaba, ' + name.toUpperCase()),
                el('p', {}, 'Otomasyonunun bugünkü özeti aşağıda.')),
            cards,
            grid,
        ),
    });
}