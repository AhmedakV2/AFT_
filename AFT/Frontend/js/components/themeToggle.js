// Light/dark geçiş butonu
import { el, icon } from '../core/dom.js';
import { store } from '../core/store.js';
import { toggleTheme } from '../core/theme.js';

export function themeToggle() {
    const btn = el('button', {
        class: 'btn btn--ghost btn--icon',
        title: 'Temayı değiştir',
        'aria-label': 'Temayı değiştir',
        onClick: toggleTheme,
    });
    const paint = () => btn.replaceChildren(icon(store.get().theme === 'dark' ? 'sun' : 'moon'));
    paint();
    store.subscribe(paint);                                         // tema değişince ikonu güncelle
    return btn;
}