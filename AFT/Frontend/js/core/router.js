// Hash router: ekran = element döndüren fonksiyon. Korumalı rotalar guard'dan geçer.
import { store } from './store.js';

const routes = {};
let outlet = null;

// path:'/dashboard', screen: fn, opts:{auth:true}
export function route(path, screen, opts = {}) {
    routes[path] = { screen, auth: !!opts.auth };
}

export const navigate = (path) => { location.hash = '#' + path; };
export const currentPath = () => location.hash.replace(/^#/, '') || '/';

export function startRouter(node) {
    outlet = node;
    addEventListener('hashchange', render);
    render();
}

function render() {
    const path = currentPath();
    const user = store.get().user;
    const publicAuthPages = ['/', '/login', '/register'];

    let r = routes[path] || routes['/404'] || routes['/'];

    if (r.auth && !user) return navigate('/login');               // korumalı sayfa, giriş yok
    if (publicAuthPages.includes(path) && user) return navigate('/dashboard'); // girişliyi içeri al

    outlet.replaceChildren(r.screen());
    window.scrollTo(0, 0);
}