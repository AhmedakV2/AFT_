// Raporlar — 4 adımlı sihirbaz: Proje → Modül → Senaryo → Rapor.
// Tek state, render() adıma göre içeriği basar; veri gerçek backend uçlarından gelir.
// Excel export örnek formatta üretilir; proje/modül/senaryo kapsamında alınabilir.
import { el, icon } from '../core/dom.js';
import { api } from '../core/api.js';
import { appShell } from '../components/appShell.js';
import { toast } from '../components/toast.js';
import { config } from '../core/config.js';
import { getAccess } from '../core/tokens.js';

const STEPS = ['Proje', 'Modül', 'Senaryo', 'Rapor'];           // sihirbaz adımları (sıra sabit)

// Page zarfını da düz diziyi de tek tipe indirger
const listOf = (res) => Array.isArray(res) ? res : (res?.content ?? []);

async function safeGet(path, fallback) {
    try { return await api.get(path); } catch { return fallback; }
}

const fmtDate = (iso) => {
    try { return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); }
    catch { return iso || '—'; }
};

const fmtNum = (n) => Number(n || 0).toLocaleString('tr-TR');

// PASSED/FAILED/diğer durumlar için renkli rozet
function statusBadge(status) {
    const s = String(status).toUpperCase();
    if (s === 'PASSED') return el('span', { class: 'badge badge--success badge--dot' }, 'Başarılı');
    if (s === 'PARTIAL') return el('span', { class: 'badge badge--neutral badge--dot' }, 'Kısmi');
    return el('span', { class: 'badge badge--fail badge--dot' }, 'Başarısız');
}

// Export uçları binary döner; api.js zarf açtığı için ayrı blob indirici kullanılır
async function downloadBlob(path, { method = 'GET', body = null, filename }) {
    if (config.USE_MOCK) { toast('Dışa aktarma yalnızca gerçek backend ile çalışır.', 'info'); return; }
    const res = await fetch(config.API_ORIGIN + path, {
        method,
        headers: { ...(getAccess() && { Authorization: `Bearer ${getAccess()}` }), ...(body && { 'Content-Type': 'application/json' }) },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw { message: `İndirme başarısız (${res.status})` };
    const url = URL.createObjectURL(await res.blob());           // blob'u indirilebilir URL'e çevir
    const a = el('a', { href: url, download: filename });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);            // belleği geri ver
}

// Kapsamlı Excel export yardımcıları (örnek formatta xlsx)
const exportProject = (id) => downloadBlob(`/api/v1/export/excel/projects/${id}`, { filename: 'rapor.xlsx' });
const exportModules = (ids) => downloadBlob('/api/v1/export/excel/modules', { method: 'POST', body: ids, filename: 'rapor.xlsx' });
const exportScenarios = (ids) => downloadBlob('/api/v1/export/excel/scenarios', { method: 'POST', body: ids, filename: 'rapor.xlsx' });

// Buton tıklamasını yükleniyor durumuyla sarmalar (export butonları için)
async function withBusy(btn, label, fn) {
    if (btn.disabled) return;
    const old = btn.textContent; btn.disabled = true; btn.textContent = label;
    try { await fn(); } catch (err) { toast(err.message || 'İşlem başarısız.', 'error'); }
    finally { btn.disabled = false; btn.textContent = old; }
}

export function reportsScreen() {
    // Tek kaynak sihirbaz durumu; render() bu duruma göre adımı basar
    const state = { step: 0, project: null, module: null, scenario: null };
    const holder = el('div', {});

    const render = () => {
        const views = [viewProjects, viewModules, viewScenarios, viewReport];
        holder.replaceChildren(stepper(), views[state.step]());
    };

    const go = (step) => { state.step = step; render(); };       // belirli adıma atla

    // Üst adım göstergesi: tamamlanan/aktif/bekleyen adımları görselleştirir
    function stepper() {
        const dot = (i) => {
            const done = i < state.step, active = i === state.step;
            const canGo = i < state.step;                        // yalnız geri tıklanabilir
            const bg = done ? 'var(--green)' : active ? 'var(--orange)' : 'var(--bg-3)';
            const fg = done || active ? '#fff' : 'var(--fg-3)';
            const circle = el('span', { style: `width:30px;height:30px;border-radius:99px;display:grid;place-items:center;background:${bg};color:${fg};font:700 13px var(--font-ui);flex-shrink:0;transition:background .2s` },
                done ? icon('check', 16) : String(i + 1));
            const label = el('span', { style: `font:600 13px var(--font-ui);color:${active ? 'var(--fg)' : 'var(--fg-3)'}` }, STEPS[i]);
            return el(canGo ? 'button' : 'div', {
                class: canGo ? 'press' : '', onClick: canGo ? () => go(i) : null,
                style: `display:flex;align-items:center;gap:9px;border:none;background:none;cursor:${canGo ? 'pointer' : 'default'};padding:0`,
            }, circle, label);
        };
        const line = () => el('span', { style: 'flex:1;height:2px;background:var(--border);min-width:18px' });
        return el('div', { class: 'card card--pad', style: 'display:flex;align-items:center;gap:10px;margin-bottom:20px;overflow-x:auto' },
            ...STEPS.flatMap((_, i) => i ? [line(), dot(i)] : [dot(i)]));
    }

    // Başlık + opsiyonel geri butonu + sağ aksiyon alanı
    const head = (title, sub, action) => el('div', { class: 'content__head row', style: 'justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap' },
        el('div', {}, el('h2', {}, title), sub && el('p', {}, sub)),
        el('div', { class: 'row gap-2', style: 'flex-wrap:wrap' },
            action || '',
            state.step > 0 ? el('button', { class: 'btn btn--ghost press', onClick: () => go(state.step - 1) }, icon('chevronL', 18), 'Geri') : ''),
    );

    const empty = (text, ic) => el('div', { class: 'card' }, el('div', { class: 'empty', style: 'padding:40px' }, icon(ic, 40), el('div', {}, text)));

    // Checkbox üreticisi: tıklama satıra yayılmaz (satır tıklaması drill-in için)
    const checkbox = (checked, onToggle) => {
        const cb = el('input', { type: 'checkbox', style: 'width:17px;height:17px;cursor:pointer;accent-color:var(--orange)' });
        cb.checked = checked;
        cb.onclick = (e) => { e.stopPropagation(); onToggle(cb.checked); };
        return el('td', { style: 'width:44px;text-align:center', onClick: (e) => e.stopPropagation() }, cb);
    };

    // ---------- 1) Proje seçimi ----------
    function viewProjects() {
        const grid = el('div', { class: 'proj-grid' }, el('div', { class: 'muted', style: 'padding:24px' }, 'Yükleniyor...'));
        (async () => {
            const rows = listOf(await safeGet('/api/v1/projects?page=0&size=100&sort=createdAt,desc', []));
            grid.replaceChildren(...(rows.length ? rows.map(card) : [empty('Henüz projen yok.', 'folder')]));
        })();
        // Proje kartı; gövdeye tıklayınca modül adımına geçer, alttaki buton tüm projeyi export eder
        function card(p) {
            const color = p.cardColor || p.card_color || 'var(--orange)';
            const xls = el('button', { class: 'btn btn--ghost btn--sm press', style: 'margin:0 14px 14px', onClick: (e) => e.stopPropagation() }, icon('fileText', 15), 'Tüm Projeyi Excel');
            xls.addEventListener('click', () => withBusy(xls, 'İndiriliyor...', () => exportProject(p.id)));
            return el('div', { class: 'proj-card' },
                el('button', { class: 'press', style: 'all:unset;cursor:pointer;display:block', onClick: () => { state.project = p; go(1); } },
                    el('div', { class: 'proj-card__bar', style: `background:${color}` }),
                    el('div', { class: 'proj-card__body' },
                        el('div', { class: 'proj-card__icon', style: `background:${color}` }, (p.name || '?').charAt(0).toUpperCase()),
                        el('h3', { class: 'proj-card__name' }, p.name || '—'),
                        el('p', { class: 'proj-card__desc' }, p.description || 'Açıklama yok'),
                        el('div', { class: 'proj-card__url' }, icon('layers', 14), p.baseUrl || p.base_url || '—'))),
                xls);
        }
        return el('div', {}, head('Rapor için proje seç'), grid);
    }

    // ---------- 2) Modül seçimi (çoklu seçim + arama) ----------
    function viewModules() {
        const p = state.project;
        const sel = new Set();                                   // seçili modül id'leri
        const tbody = el('tbody', {}, el('tr', {}, el('td', { colspan: 4, class: 'muted', style: 'padding:24px' }, 'Yükleniyor...')));
        let all = [];

        const search = el('input', { class: 'input', style: 'max-width:280px', placeholder: 'Modül ara...' });
        search.oninput = () => paint(all.filter((m) => (m.name || '').toLowerCase().includes(search.value.toLowerCase())));

        // Export butonları: tüm proje + seçili modüller
        const allBtn = el('button', { class: 'btn btn--ghost press' }, icon('fileText', 16), 'Tüm Projeyi Excel');
        allBtn.onclick = () => withBusy(allBtn, 'İndiriliyor...', () => exportProject(p.id));
        const selBtn = el('button', { class: 'btn btn--primary press' }, icon('fileText', 16), 'Seçili Modülleri Excel');
        const refreshSel = () => { selBtn.disabled = sel.size === 0; selBtn.lastChild.textContent = sel.size ? `Seçili Modüller (${sel.size})` : 'Seçili Modülleri Excel'; };
        selBtn.onclick = () => withBusy(selBtn, 'İndiriliyor...', () => exportModules([...sel]));
        refreshSel();

        (async () => { all = listOf(await safeGet(`/api/v1/modules?projectId=${p.id}&page=0&size=100`, [])); paint(all); })();

        // Modül satırları; checkbox seçer, satır tıklaması senaryo adımına geçer
        function paint(rows) {
            tbody.replaceChildren(...(rows.length
                ? rows.map((m) => el('tr', { class: 'row-link', onClick: () => { state.module = m; go(2); } },
                    checkbox(sel.has(m.id), (on) => { on ? sel.add(m.id) : sel.delete(m.id); refreshSel(); }),
                    el('td', { style: 'font-weight:600;color:var(--fg)' }, m.name || '—'),
                    el('td', { class: 'muted' }, m.description || '—'),
                    el('td', {}, el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, icon('chevronR', 16)))))
                : [el('tr', {}, el('td', { colspan: 4 }, el('div', { class: 'empty', style: 'padding:36px' }, icon('layers', 36), 'Bu projede modül yok.')))]));
        }

        const table = el('div', { class: 'card panel' },
            el('div', { class: 'panel__head' }, el('h3', {}, 'Modüller'), search),
            el('table', { class: 'table' },
                el('thead', {}, el('tr', {}, el('th', {}, ''), el('th', {}, 'Ad'), el('th', {}, 'Açıklama'), el('th', {}, ''))), tbody));

        return el('div', {}, head(p.name, 'Modül seç ya da tüm projeyi/seçili modülleri Excel al', el('div', { class: 'row gap-2' }, allBtn, selBtn)), table);
    }

    // ---------- 3) Senaryo seçimi (çoklu seçim) ----------
    function viewScenarios() {
        const { project: p, module: m } = state;
        const sel = new Set();                                   // seçili senaryo id'leri
        const tbody = el('tbody', {}, el('tr', {}, el('td', { colspan: 4, class: 'muted', style: 'padding:24px' }, 'Yükleniyor...')));

        const allBtn = el('button', { class: 'btn btn--ghost press' }, icon('fileText', 16), 'Tüm Modülü Excel');
        allBtn.onclick = () => withBusy(allBtn, 'İndiriliyor...', () => exportModules([m.id]));
        const selBtn = el('button', { class: 'btn btn--primary press' }, icon('fileText', 16), 'Seçili Senaryoları Excel');
        const refreshSel = () => { selBtn.disabled = sel.size === 0; selBtn.lastChild.textContent = sel.size ? `Seçili Senaryolar (${sel.size})` : 'Seçili Senaryoları Excel'; };
        selBtn.onclick = () => withBusy(selBtn, 'İndiriliyor...', () => exportScenarios([...sel]));
        refreshSel();

        (async () => {
            const rows = listOf(await safeGet(`/api/v1/scenarios?moduleId=${m.id}&page=0&size=100&sort=createdAt,desc`, []));
            tbody.replaceChildren(...(rows.length
                ? rows.map((s) => el('tr', { class: 'row-link', onClick: () => { state.scenario = s; go(3); } },
                    checkbox(sel.has(s.id), (on) => { on ? sel.add(s.id) : sel.delete(s.id); refreshSel(); }),
                    el('td', { style: 'font-weight:600;color:var(--fg)' }, s.name || '—'),
                    el('td', { class: 'muted' }, s.description || '—'),
                    el('td', {}, el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, icon('chevronR', 16)))))
                : [el('tr', {}, el('td', { colspan: 4 }, el('div', { class: 'empty', style: 'padding:36px' }, icon('fileText', 36), 'Bu modülde senaryo yok.')))]));
        })();

        const table = el('div', { class: 'card panel' },
            el('div', { class: 'panel__head' }, el('h3', {}, 'Senaryolar'), ''),
            el('table', { class: 'table' },
                el('thead', {}, el('tr', {}, el('th', {}, ''), el('th', {}, 'Ad'), el('th', {}, 'Açıklama'), el('th', {}, ''))), tbody));

        return el('div', {}, head(m.name, 'Senaryo seç ya da tüm modülü/seçili senaryoları Excel al', el('div', { class: 'row gap-2' }, allBtn, selBtn)), table);
    }

    // ---------- 4) Rapor (metrikler + en çok hata veren adım + çalıştırmalar + export) ----------
    function viewReport() {
        const s = state.scenario;
        const body = el('div', { class: 'col gap-5' }, el('div', { class: 'card card--pad muted' }, 'Rapor yükleniyor...'));

        // Bu senaryoyu tek satırlık Excel'e aktarır (örnek format)
        const excelBtn = el('button', { class: 'btn btn--ghost press' }, icon('fileText', 18), 'Excel');
        excelBtn.onclick = () => withBusy(excelBtn, 'İndiriliyor...', () => exportScenarios([s.id]));

        (async () => {
            // Gerçek uç: GET /api/v1/scenarios/{id}/report → ScenarioReport
            let r;
            try { r = await api.get(`/api/v1/scenarios/${s.id}/report`); }
            catch (err) { body.replaceChildren(empty(err.message || 'Rapor alınamadı.', 'fileText')); return; }

            const failed = (r.totalRuns || 0) - (r.passedRuns || 0);
            const rate = Number(r.successRate || 0);

            const metric = (label, value, accent) => el('div', { class: 'card card--pad', style: 'flex:1;min-width:180px' },
                el('div', { class: 'muted', style: 'font-size:13px;font-weight:600' }, label),
                el('div', { style: `font-family:var(--font-display);font-weight:800;font-size:30px;line-height:1.1;margin-top:6px;color:${accent || 'var(--fg)'}` }, value));

            const metrics = el('div', { class: 'row gap-4', style: 'flex-wrap:wrap' },
                metric('Toplam Çalıştırma', fmtNum(r.totalRuns)),
                metric('Başarılı', fmtNum(r.passedRuns), 'var(--green-strong)'),
                metric('Başarısız', fmtNum(failed), 'var(--red-strong)'),
                metric('Başarı Oranı', `%${rate.toFixed(1)}`, 'var(--orange)'));

            const worst = r.mostFailingStep
                ? el('div', { class: 'card card--pad', style: 'display:flex;align-items:center;gap:14px' },
                    el('span', { class: 'badge badge--fail' }, icon('x', 14), `Adım #${r.mostFailingStep.stepOrder}`),
                    el('span', { style: 'font-weight:600' }, 'En çok hata veren adım'),
                    el('span', { class: 'muted', style: 'margin-left:auto;font-size:13px' }, `${fmtNum(r.mostFailingStep.failCount)} kez başarısız`))
                : el('div', { class: 'card card--pad muted' }, 'Henüz başarısız adım kaydı yok.');

            const runRow = (run) => {
                const total = run.totalSteps ?? 0, passed = run.passedSteps ?? 0;
                const pct = total ? Math.round((passed / total) * 100) : 0;
                const isFail = String(run.status).toUpperCase() !== 'PASSED';
                const pdfBtn = el('button', { class: 'btn btn--ghost btn--icon btn--sm press', title: 'PDF indir' }, icon('fileText', 16));
                pdfBtn.onclick = () => withBusy(pdfBtn, '...', () => downloadBlob(`/api/v1/export/runs/${run.testRunId}/pdf`, { filename: `rapor-${run.testRunId}.pdf` }));
                return el('tr', {},
                    el('td', {}, statusBadge(run.status)),
                    el('td', { style: 'min-width:160px' }, el('div', { class: 'row gap-3' },
                        el('div', { class: 'progress' + (isFail ? ' progress--fail' : ''), style: 'flex:1' }, el('i', { style: `width:${pct}%` })),
                        el('span', { class: 'muted', style: 'font-size:12px;white-space:nowrap' }, `${passed}/${total}`))),
                    el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(run.startedAt)),
                    el('td', { class: 'muted', style: 'white-space:nowrap' }, run.finishedAt ? fmtDate(run.finishedAt) : '—'),
                    el('td', {}, el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, pdfBtn)));
            };

            const runs = (r.recentRuns || []);
            const table = el('div', { class: 'card panel' },
                el('div', { class: 'panel__head' }, el('h3', {}, 'Son Çalıştırmalar'), el('div', { class: 'row gap-2' }, excelBtn)),
                runs.length
                    ? el('table', { class: 'table' },
                        el('thead', {}, el('tr', {}, el('th', {}, 'Durum'), el('th', {}, 'İlerleme'), el('th', {}, 'Başladı'), el('th', {}, 'Bitti'), el('th', { style: 'text-align:right' }, 'PDF'))),
                        el('tbody', {}, ...runs.map(runRow)))
                    : el('div', { class: 'empty', style: 'padding:36px' }, icon('play', 36), 'Bu senaryo henüz çalıştırılmamış.'));

            body.replaceChildren(metrics, worst, table);
        })();

        return el('div', {}, head(s.name, s.description || 'Senaryo raporu'), body);
    }

    render();
    return appShell({ active: 'reports', title: 'Raporlar', content: holder });
}