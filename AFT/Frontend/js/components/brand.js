// Landing ile birebir aynı AFT logosu; tıklayınca ana sayfaya yönlendirir
import { el } from '../core/dom.js';
import { navigate } from '../core/router.js';

export function brand() {
    return el('button', { class: 'press', style: 'display:flex; align-items:center; gap:11px; background:none; border:none; cursor:pointer; padding:0;', onClick: () => navigate('/') },
        el('span', { style: 'width:34px; height:34px; border-radius:9px; background:var(--orange); display:grid; place-items:center; box-shadow:0 6px 16px color-mix(in srgb, var(--orange) 42%, transparent);' },
            el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', html: '<circle cx="12" cy="12" r="8.5" stroke="#fff" stroke-width="2"/><path d="M10.2 9 15 12l-4.8 3z" fill="#fff"/>' })
        ),
        el('span', { style: 'display:flex; flex-direction:column; align-items:flex-start; line-height:1;' },
            el('span', { style: "font:800 18px 'Sora'; letter-spacing:-.01em; color:var(--fg);" }, 'AFT'),
            el('span', { style: "font:700 8.5px 'Manrope'; letter-spacing:.2em; text-transform:uppercase; color:var(--fg-3); margin-top:3px;" }, 'Automation')
        )
    );
}