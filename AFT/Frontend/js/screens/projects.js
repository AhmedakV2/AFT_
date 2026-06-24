// GEÇİCİ — sonraki kilometre taşında tam ekranla değişecek
import { el, icon } from '../core/dom.js';
import { appShell } from '../components/appShell.js';

export function projectsScreen() {
    return appShell({
        active: 'projects',
        title: 'Projeler',
        content: el('div', {},
            el('div', { class: 'content__head' }, el('h2', {}, 'Projeler')),
            el('div', { class: 'card' }, el('div', { class: 'empty' },
                icon('folder', 40), el('div', {}, 'Bu ekran yakında'),
                el('div', { style: 'font-size:13px;margin-top:4px' }, 'Sıradaki adımda geliyor.'))),
        ),
    });
}