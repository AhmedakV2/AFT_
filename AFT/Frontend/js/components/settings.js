// Ayarlar modalı: tema + aksan rengi (prototipteki 5 renk)
import { el } from '../core/dom.js';
import { store } from '../core/store.js';
import { setAccent } from '../core/theme.js';
import { openModal } from './modal.js';

const ACCENTS = ['#ef6c1a', '#2f6fb0', '#1f9d57', '#7c5cdb', '#e0a106'];

export function openSettings() {
    const swatches = el('div', { class: 'swatches' });
    const paint = () => swatches.replaceChildren(...ACCENTS.map((hex) =>
        el('button', {
            class: 'swatch' + (store.get().accent === hex ? ' sel' : ''),
            style: `background:${hex}`, 'aria-label': hex,
            onClick: () => { setAccent(hex); paint(); },                // aksanı değiştir + işareti güncelle
        })));
    paint();

    const themeRow = el('div', { class: 'row', style: 'justify-content:space-between' },
        el('span', { style: 'font-weight:600' }, 'Karanlık tema'),
        el('button', { class: 'btn btn--ghost btn--sm', onClick: (e) => { store.set({ theme: store.get().theme === 'dark' ? 'light' : 'dark' }); e.target.textContent = store.get().theme === 'dark' ? 'Açık' : 'Koyu'; } },
            store.get().theme === 'dark' ? 'Açık' : 'Koyu'),
    );

    openModal(
        el('div', { class: 'col gap-6' },
            el('div', { class: 'col gap-3' }, el('span', { class: 'muted', style: 'font-size:13px;font-weight:600' }, 'AKSAN RENGİ'), swatches),
            el('div', { class: 'col gap-3' }, el('span', { class: 'muted', style: 'font-size:13px;font-weight:600' }, 'GÖRÜNÜM'), themeRow),
        ),
        { title: 'Ayarlar' },
    );
}