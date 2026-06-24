// Ortak modal: openModal(node) overlay'i açar, kapatma fonksiyonu döndürür. Esc + overlay tıkla ile kapanır.
import { el, icon } from '../core/dom.js';

export function openModal(content, { title } = {}) {
    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };

    const body = el('div', { class: 'modal', onClick: (e) => e.stopPropagation() },
        title && el('div', { class: 'modal__head' },
            el('h3', { class: 'modal__title' }, title),
            el('button', { class: 'btn btn--ghost btn--icon btn--sm', 'aria-label': 'Kapat', onClick: close }, icon('x', 18)),
        ),
        el('div', { class: 'modal__body' }, content),
    );

    const overlay = el('div', { class: 'modal-overlay', onClick: close }, body);
    document.body.append(overlay);
    document.addEventListener('keydown', onKey);
    return close;
}