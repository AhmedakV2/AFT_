// Üst bar: hamburger + sayfa başlığı (sol), bildirim + profil menüsü (sağ).
import { el, icon } from '../core/dom.js';
import { store } from '../core/store.js';
import { logout } from '../core/session.js';
import { themeToggle } from './themeToggle.js';
import { openSettings } from './settings.js';

let prevOutside = null;                                           // tek global dış-tık dinleyicisi tut

export function topbar(title) {
    const user = store.get().user || { name: 'Kullanıcı', email: '' };
    const initials = (user.name || 'K').slice(0, 1).toUpperCase();

    // tek seferde tek açılır menü; dışarı tıklayınca kapanır
    let open = null;
    const closeAll = () => { document.querySelectorAll('.pop').forEach((p) => p.remove()); open = null; };
    if (prevOutside) document.removeEventListener('click', prevOutside); // eski dinleyiciyi temizle
    prevOutside = closeAll;
    document.addEventListener('click', closeAll);

    function popup(which, node, anchor) {
        if (open === which) return closeAll();
        closeAll(); open = which;
        anchor.append(node);
    }

    const notifBtn = el('button', { class: 'btn btn--ghost btn--icon', 'aria-label': 'Bildirimler' }, icon('bell'));
    const notifWrap = el('div', { class: 'pop-wrap' }, notifBtn);
    notifBtn.onclick = (e) => {
        e.stopPropagation();
        popup('notif', el('div', { class: 'pop' },
            el('div', { class: 'pop__head' }, el('strong', {}, 'Bildirimler')),
            el('div', { class: 'empty', style: 'padding:28px 16px' }, 'Yeni bildirim yok'),
        ), notifWrap);
    };

    const profBtn = el('button', { class: 'btn btn--ghost', style: 'gap:10px' },
        el('span', { class: 'avatar' }, initials), el('span', {}, user.name));
    const profWrap = el('div', { class: 'pop-wrap' }, profBtn);
    profBtn.onclick = (e) => {
        e.stopPropagation();
        popup('prof', el('div', { class: 'pop' },
            el('div', { class: 'pop__head' },
                el('div', { style: 'font-weight:700' }, user.name),
                el('div', { class: 'muted', style: 'font-size:13px' }, user.email),
            ),
            el('button', { class: 'pop__item', onClick: () => { closeAll(); openSettings(); } }, icon('settings', 18), 'Ayarlar'),
            el('button', { class: 'pop__item danger', onClick: () => { closeAll(); logout(); } }, icon('logout', 18), 'Çıkış Yap'),
        ), profWrap);
    };

    const burger = el('button', { class: 'btn btn--ghost btn--icon', 'aria-label': 'Menü', onClick: () => store.set({ sidebarOpen: !store.get().sidebarOpen }) }, icon('menu'));

    return el('header', { class: 'topbar' },
        burger,
        el('span', { class: 'topbar__title' }, title),
        el('div', { class: 'topbar__right' }, themeToggle(), notifWrap, profWrap),
    );
}