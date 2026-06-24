// GEÇİCİ — sonraki kilometre taşında tam ekranla değişecek
import { el, icon } from '../core/dom.js';
import { appShell } from '../components/appShell.js';

export function reportsScreen() {
    return appShell({
        active: 'reports',
        title: 'Raporlar',
        content: el('div', {},
            el('div', { class: 'content__head' }, el('h2', {}, 'Raporlar')),
            el('div', { class: 'card' }, el('div', { class: 'empty' },
                icon('fileText', 40), el('div', {}, 'Bu ekran yakında'),
                el('div', { style: 'font-size:13px;margin-top:4px' }, 'Sıradaki adımda geliyor.'))),
        ),
    });
}