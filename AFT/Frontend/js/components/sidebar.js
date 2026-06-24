// Sol navigasyon. active: aktif rota anahtarı. Daraltma store.sidebarOpen ile kabuk tarafından yönetilir.
import { el, icon } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { openSettings } from './settings.js';

const NAV = [
    { key: 'dashboard', label: 'Ana Sayfa', ic: 'home', path: '/dashboard' },
    { key: 'projects', label: 'Projeler', ic: 'folder', path: '/projects' },
    { key: 'reports', label: 'Raporlar', ic: 'fileText', path: '/reports' },
    { key: 'scheduled', label: 'Zamanlanmış Görevler', ic: 'clock', path: '/scheduled' },
];

export function sidebar(active) {
    const item = ({ key, label, ic, path }) =>
        el('button', { class: 'nav-item' + (active === key ? ' active' : ''), onClick: () => navigate(path) },
            icon(ic), el('span', {}, label));

    return el('aside', { class: 'sidebar' },
        el('div', { class: 'sidebar__brand' },
            el('div', { class: 'brand' }, el('span', { class: 'brand__mark' }, icon('zap', 18)), el('span', {}, 'AFT')),
        ),
        ...NAV.map(item),
        el('div', { class: 'sidebar__spacer' }),
        el('button', { class: 'nav-item', onClick: openSettings }, icon('settings'), el('span', {}, 'Ayarlar')),
    );
}