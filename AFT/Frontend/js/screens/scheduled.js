// Zamanlanmış Görevler: Proje -> Modül -> Senaryo seç, o senaryonun cron planlarını yönet.
// Backend uçları: GET/POST /api/v1/scenarios/{id}/schedules, PATCH/DELETE /api/v1/schedules/{id}
import { el, icon } from '../core/dom.js';
import { api } from '../core/api.js';
import { appShell } from '../components/appShell.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

// Haftanın günleri: [Spring kodu, kısa TR etiket]
const DOW = [['MON', 'Pzt'], ['TUE', 'Sal'], ['WED', 'Çar'], ['THU', 'Per'], ['FRI', 'Cum'], ['SAT', 'Cmt'], ['SUN', 'Paz']];

const pad = (n) => String(n).padStart(2, '0');

// Instant/ISO -> okunabilir yerel tarih
const fmtDate = (iso) => {
    if (!iso) return '—';
    try { return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); }
    catch { return iso; }
};

// 6 alanlı cron'u (san dk sa gün ay haftagünü) Türkçe metne çevirir; çözemezse cron'u döner
const describeCron = (cron) => {
    const p = String(cron || '').trim().split(/\s+/);
    if (p.length !== 6) return cron;
    const [, mi, h, dom, , dow] = p;
    const time = (hh, mm) => `${pad(+hh)}:${pad(+mm)}`;
    if (/^\*\/\d+$/.test(mi) && h === '*' && dom === '*' && dow === '*') return `Her ${mi.slice(2)} dakikada bir`;
    if (h === '*' && dom === '*' && dow === '*' && /^\d+$/.test(mi)) return `Her saat ${pad(+mi)}. dakikada`;
    if (dom === '*' && dow !== '*') {
        const names = dow.split(',').map((d) => DOW.find((x) => x[0] === d)?.[1] || d).join(', ');
        return `${names} ${time(h, mi)}`;
    }
    if (dom === '*' && /^\d+$/.test(h)) return `Her gün ${time(h, mi)}`;
    if (/^\d+$/.test(dom)) return `Her ayın ${dom}. günü ${time(h, mi)}`;
    return cron;
};

// İzin verilen en küçük tetikleme aralığı (backend policy ile aynı taban)
const MIN_INTERVAL_SEC = 60;

// İstemci ön doğrulaması; nihai karar backend'de. İhlalde hata metni, temizse null döner.
const validateCron = (cron) => {
    const p = String(cron || '').trim().split(/\s+/);
    if (p.length !== 6) return 'Cron 6 alan olmalı: san dk sa gün ay haftagünü.';
    if (!/^[0-5]?\d$/.test(p[0]))                                                        // saniye sabit tek değer olmalı (en sık 60sn)
        return `Saniye alanı sabit bir değer (0-59) olmalı; en sık ${MIN_INTERVAL_SEC} saniyede bir çalışabilir.`;
    return null;
};

// Sayfalı yanıt da düz dizi de gelse içeriği normalize et
const listOf = (res) => (Array.isArray(res) ? res : (res?.content ?? []));

export function scheduledScreen() {
    const state = { project: null, module: null, scenario: null, tasks: [] };
    const holder = el('div', {});

    // Üst başlık + "Yeni Görev" butonu (senaryo seçilmeden pasif)
    const newBtn = el('button', { class: 'btn btn--primary press', disabled: true, onClick: () => openCreateModal() },
        icon('plus', 16), 'Yeni Görev');

    function head() {
        return el('div', { class: 'content__head', style: 'display:flex;align-items:center;justify-content:space-between;gap:16px' },
            el('div', {},
                el('h2', {}, 'Zamanlanmış Görevler'),
                el('div', { class: 'muted', style: 'font-size:13px;margin-top:2px' }, 'Bir senaryo seçip ona tekrarlayan çalıştırma planları tanımla.')),
            newBtn);
    }

    // Bağımlı seçim kutusu üreticisi (label + select)
    function selectField(labelText, opts, value, onChange, disabled) {
        const sel = el('select', { class: 'input', disabled: disabled || false, onChange: (e) => onChange(e.target.value) },
            el('option', { value: '' }, opts.placeholder),
            ...opts.items.map((o) => el('option', { value: o.id, selected: o.id === value ? '' : null }, o.name || '—')));
        return el('div', { class: 'field' }, el('label', {}, labelText), sel);
    }

    // ---- Veri çekiciler ----
    async function loadProjects() {
        try { return listOf(await api.get('/api/v1/projects')); }
        catch (err) { toast(err.message || 'Projeler yüklenemedi.', 'error'); return []; }
    }
    async function loadModules(projectId) {
        try { return listOf(await api.get(`/api/v1/modules?projectId=${projectId}`)); }
        catch (err) { toast(err.message || 'Modüller yüklenemedi.', 'error'); return []; }
    }
    async function loadScenarios(moduleId) {
        try { return listOf(await api.get(`/api/v1/scenarios?moduleId=${moduleId}`)); }
        catch (err) { toast(err.message || 'Senaryolar yüklenemedi.', 'error'); return []; }
    }
    async function loadTasks(scenarioId) {
        try { return await api.get(`/api/v1/scenarios/${scenarioId}/schedules`); }
        catch (err) { toast(err.message || 'Planlar yüklenemedi.', 'error'); return []; }
    }

    // Aktif/pasif rozeti
    function statusBadge(active) {
        return active
            ? el('span', { class: 'badge badge--success badge--dot' }, 'Aktif')
            : el('span', { class: 'badge badge--neutral badge--dot' }, 'Pasif');
    }

    // Tek bir plan satırı (toggle + sil aksiyonlu)
    function taskRow(t) {
        const toggleBtn = el('button', { class: 'btn btn--ghost btn--sm press', title: t.active ? 'Duraklat' : 'Etkinleştir', onClick: () => toggleTask(t) },
            t.active ? 'Duraklat' : 'Etkinleştir');
        const delBtn = el('button', { class: 'btn btn--ghost btn--icon btn--sm press', title: 'Sil', onClick: () => askDelete(t) }, icon('x', 15));
        return el('tr', {},
            el('td', {},
                el('div', { style: 'font-weight:600;color:var(--fg)' }, describeCron(t.cron)),
                el('div', { class: 'muted', style: 'font-size:12px;font-family:monospace' }, t.cron)),
            el('td', {}, statusBadge(t.active)),
            el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(t.nextFireAt)),
            el('td', { class: 'muted', style: 'white-space:nowrap' }, fmtDate(t.lastFiredAt)),
            el('td', {}, el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, toggleBtn, delBtn)));
    }

    // Plan tablosu (boşsa empty state)
    function tasksCard() {
        const rows = state.tasks.length
            ? state.tasks.map(taskRow)
            : [el('tr', {}, el('td', { colspan: 5 }, el('div', { class: 'empty', style: 'padding:36px' },
                icon('calendar', 36), 'Bu senaryoda zamanlanmış görev yok.')))];
        return el('div', { class: 'card panel' },
            el('div', { class: 'panel__head' }, el('h3', {}, `Planlar — ${state.scenario.name}`), ''),
            el('table', { class: 'table' },
                el('thead', {}, el('tr', {},
                    el('th', {}, 'Zamanlama'), el('th', {}, 'Durum'),
                    el('th', {}, 'Sonraki Çalışma'), el('th', {}, 'Son Çalışma'),
                    el('th', { style: 'text-align:right' }, 'İşlem'))),
                el('tbody', {}, ...rows)));
    }

    // Planı aktif/pasif yap (PATCH /schedules/{id})
    async function toggleTask(t) {
        try {
            const updated = await api.patch(`/api/v1/schedules/${t.id}`, { active: !t.active });
            Object.assign(t, updated);
            toast(updated.active ? 'Plan etkinleştirildi.' : 'Plan duraklatıldı.', 'success');
            render();
        } catch (err) { toast(err.message || 'Durum güncellenemedi.', 'error'); }
    }

    // Silme onayı modalı
    function askDelete(t) {
        const yes = el('button', { class: 'btn btn--danger press' }, 'Sil');
        const no = el('button', { class: 'btn btn--ghost press' }, 'Vazgeç');
        const close = openModal(el('div', { class: 'col gap-5' },
            el('p', {}, `"${describeCron(t.cron)}" planı silinecek. Onaylıyor musun?`),
            el('div', { class: 'row gap-2', style: 'justify-content:flex-end' }, no, yes)), { title: 'Planı Sil' });
        no.onclick = close;
        yes.onclick = async () => {
            yes.disabled = true; yes.textContent = 'Siliniyor...';
            try {
                await api.del(`/api/v1/schedules/${t.id}`);
                state.tasks = state.tasks.filter((x) => x.id !== t.id);
                close(); toast('Plan silindi.', 'success'); render();
            } catch (err) { yes.disabled = false; yes.textContent = 'Sil'; toast(err.message || 'Plan silinemedi.', 'error'); }
        };
    }

    // Modal durumundan 6 alanlı Spring cron üretir
    function buildCron(m) {
        const [H, M] = (m.time || '00:00').split(':').map(Number);
        if (m.mode === 'interval') return `0 */${Math.max(1, m.interval)} * * * *`;     // her N dakikada
        if (m.mode === 'hourly') return `0 ${m.hourMin} * * * *`;                        // her saat, belirli dakika
        if (m.mode === 'daily') return `0 ${M} ${H} * * *`;                              // her gün, saat:dk
        if (m.mode === 'weekly') return `0 ${M} ${H} * * ${[...m.days].join(',')}`;      // seçili günler, saat:dk
        if (m.mode === 'monthly') return `0 ${M} ${H} ${m.dom} * *`;                     // ayın belirli günü
        return m.custom.trim();                                                          // özel
    }

    // Yeni plan modalı: tam kontrollü zamanlama oluşturucu
    function openCreateModal() {
        const m = { mode: 'daily', time: '09:00', days: new Set(['MON']), dom: 1, hourMin: 0, interval: 15, custom: '0 0 9 * * *' };

        const dyn = el('div', { class: 'col gap-4' });                                   // moda göre değişen alanlar
        const cronOut = el('code', { style: 'font-size:13px;color:var(--fg-2)' });
        const human = el('div', { class: 'muted', style: 'font-size:13px' });

        // Önizlemeyi güncelle (cron + okunabilir metin)
        const refresh = () => { const c = buildCron(m); cronOut.textContent = c || '—'; human.textContent = c ? describeCron(c) : 'Cron girilmedi'; };

        // Saat:dakika girişi (daily/weekly/monthly)
        const timeField = () => el('div', { class: 'field' }, el('label', {}, 'Saat'),
            el('input', { class: 'input', type: 'time', value: m.time, onInput: (e) => { m.time = e.target.value; refresh(); } }));

        // Haftanın günleri seçici (çoklu)
        const weekdayField = () => el('div', { class: 'field' }, el('label', {}, 'Günler'),
            el('div', { class: 'row gap-2', style: 'flex-wrap:wrap' },
                ...DOW.map(([code, label]) => el('button', {
                    type: 'button',
                    class: 'btn btn--sm press ' + (m.days.has(code) ? 'btn--soft' : 'btn--ghost'),
                    onClick: () => { m.days.has(code) ? m.days.delete(code) : m.days.add(code); paint(); },
                }, label))));

        // Ayın günü girişi (1-31)
        const domField = () => el('div', { class: 'field' }, el('label', {}, 'Ayın günü (1-31)'),
            el('input', { class: 'input', type: 'number', min: 1, max: 31, value: m.dom, onInput: (e) => { m.dom = Math.min(31, Math.max(1, +e.target.value || 1)); refresh(); } }));

        // Saatlik mod için dakika girişi (0-59)
        const hourMinField = () => el('div', { class: 'field' }, el('label', {}, 'Dakika (0-59)'),
            el('input', { class: 'input', type: 'number', min: 0, max: 59, value: m.hourMin, onInput: (e) => { m.hourMin = Math.min(59, Math.max(0, +e.target.value || 0)); refresh(); } }));

        // Dakikalık mod için aralık girişi
        const intervalField = () => el('div', { class: 'field' }, el('label', {}, 'Kaç dakikada bir (1-59)'),
            el('input', { class: 'input', type: 'number', min: 1, max: 59, value: m.interval, onInput: (e) => { m.interval = Math.min(59, Math.max(1, +e.target.value || 1)); refresh(); } }));

        // Özel cron serbest girişi
        const customField = () => el('div', { class: 'field' }, el('label', {}, 'Cron İfadesi (6 alan: san dk sa gün ay haftagünü)'),
            el('input', { class: 'input', style: 'font-family:monospace', value: m.custom, placeholder: '0 0 9 * * MON-FRI', onInput: (e) => { m.custom = e.target.value; refresh(); } }),
            el('div', { class: 'muted', style: 'font-size:12px' }, `Saniye sabit olmalı; en sık ${MIN_INTERVAL_SEC} saniyede bir tetiklenebilir.`));

        // Seçili moda göre ilgili alanları çiz
        function paint() {
            const fields = { daily: [timeField], weekly: [weekdayField, timeField], monthly: [domField, timeField], hourly: [hourMinField], interval: [intervalField], custom: [customField] };
            dyn.replaceChildren(...(fields[m.mode] || []).map((f) => f()));
            refresh();
        }

        const modeSel = el('select', { class: 'input', onChange: (e) => { m.mode = e.target.value; paint(); } },
            el('option', { value: 'daily' }, 'Her gün'),
            el('option', { value: 'weekly' }, 'Haftanın belirli günleri'),
            el('option', { value: 'monthly' }, 'Her ay (belirli gün)'),
            el('option', { value: 'hourly' }, 'Her saat'),
            el('option', { value: 'interval' }, 'Belirli dakika aralığı'),
            el('option', { value: 'custom' }, 'Özel cron ifadesi'));

        const submit = el('button', { class: 'btn btn--primary btn--block press' }, 'Planı Oluştur');
        submit.onclick = async () => {
            if (m.mode === 'weekly' && m.days.size === 0) return toast('En az bir gün seç.', 'error');
            const cron = buildCron(m);
            if (!cron) return toast('Cron ifadesi zorunlu.', 'error');
            const policyErr = validateCron(cron);                                        // sıklık/sözdizim ön kontrolü
            if (policyErr) return toast(policyErr, 'error');                             // nihai doğrulama yine backend'de
            submit.disabled = true; submit.textContent = 'Oluşturuluyor...';
            try {
                const created = await api.post(`/api/v1/scenarios/${state.scenario.id}/schedules`, { cron });
                state.tasks = [created, ...state.tasks];
                close(); toast('Zamanlanmış görev oluşturuldu.', 'success'); render();
            } catch (err) {
                submit.disabled = false; submit.textContent = 'Planı Oluştur';
                toast(err.message || 'Plan oluşturulamadı.', 'error');                   // örn. geçersiz cron -> 400
            }
        };

        paint();   // ilk açılışta daily alanlarını çiz

        const close = openModal(el('div', { class: 'col gap-4' },
            el('div', { class: 'field' }, el('label', {}, 'Sıklık'), modeSel),
            dyn,
            el('div', { class: 'card', style: 'padding:12px 14px;background:var(--bg-2)' },
                el('div', { class: 'row', style: 'justify-content:space-between;align-items:center;gap:10px' },
                    human, cronOut)),
            submit), { title: `Yeni Görev — ${state.scenario.name}` });
    }

    // Seçim kademeleri değiştikçe alt seçimleri sıfırlayıp veriyi yeniden çiz
    async function onProject(id) {
        state.project = id ? { id } : null; state.module = null; state.scenario = null; state.tasks = [];
        state.modules = id ? await loadModules(id) : [];
        newBtn.disabled = true; render();
    }
    async function onModule(id) {
        state.module = id ? { id } : null; state.scenario = null; state.tasks = [];
        state.scenarios = id ? await loadScenarios(id) : [];
        newBtn.disabled = true; render();
    }
    async function onScenario(id) {
        const sc = (state.scenarios || []).find((x) => x.id === id);
        state.scenario = sc || null; state.tasks = sc ? await loadTasks(sc.id) : [];
        newBtn.disabled = !sc; render();
    }

    // Seçici kartı: üç bağımlı select
    function selectorCard() {
        return el('div', { class: 'card', style: 'padding:18px' },
            el('div', { class: 'row gap-4', style: 'flex-wrap:wrap' },
                el('div', { style: 'flex:1;min-width:200px' },
                    selectField('Proje', { placeholder: 'Proje seç', items: state.projects || [] }, state.project?.id, onProject)),
                el('div', { style: 'flex:1;min-width:200px' },
                    selectField('Modül', { placeholder: 'Modül seç', items: state.modules || [] }, state.module?.id, onModule, !state.project)),
                el('div', { style: 'flex:1;min-width:200px' },
                    selectField('Senaryo', { placeholder: 'Senaryo seç', items: state.scenarios || [] }, state.scenario?.id, onScenario, !state.module))));
    }

    // Ekranı baştan çiz
    function render() {
        holder.replaceChildren(el('div', { class: 'col gap-5' },
            head(),
            selectorCard(),
            state.scenario ? tasksCard() : ''));
    }

    // İlk yükleme: projeleri getir, sonra çiz
    (async () => { state.projects = await loadProjects(); render(); })();
    render();   // projeler gelene kadar iskeleti göster

    return appShell({ active: 'scheduled', title: 'Zamanlanmış Görevler', content: holder });
}