// Sağ altta otomatik kapanan bildirim
import { el, icon } from '../core/dom.js';

function host() {                                                 // tek seferlik kapsayıcı
    let h = document.getElementById('toast-host');
    if (!h) { h = el('div', { id: 'toast-host' }); document.body.append(h); }
    return h;
}

export function toast(message, type = 'info') {
    const ic = type === 'success' ? 'checkCircle' : type === 'error' ? 'x' : 'bell';
    const node = el('div', { class: `toast toast--${type}` }, icon(ic, 18), el('span', {}, message));
    host().append(node);
    setTimeout(() => { node.style.opacity = '0'; setTimeout(() => node.remove(), 200); }, 3200);
}