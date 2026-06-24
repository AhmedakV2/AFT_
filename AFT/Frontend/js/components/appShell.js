// Kabuk: sidebar + topbar + içerik. Daraltma durumunu store'dan okuyup kök data-attribute'a yansıtır.
import { el } from '../core/dom.js';
import { store } from '../core/store.js';
import { sidebar } from './sidebar.js';
import { topbar } from './topbar.js';

let unsub = null;                                                 // önceki aboneliği temizlemek için

export function appShell({ active, title, content }) {
    const root = el('div', { class: 'app' },
        sidebar(active),
        el('div', { class: 'app-main' }, topbar(title), el('main', { class: 'content' }, content)),
    );

    const apply = () => root.setAttribute('data-sidebar', store.get().sidebarOpen ? 'open' : 'collapsed');
    apply();
    if (unsub) unsub();                                             // eski ekranın aboneliğini kapat
    unsub = store.subscribe(apply);                                 // sidebar toggle'ında güncelle
    return root;
}