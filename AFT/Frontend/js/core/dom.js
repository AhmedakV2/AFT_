// Minimal hyperscript: el('div', {class:'x', onClick:fn}, child1, 'metin')
import { icons } from './icons.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
// SVG ailesi etiketleri — bunlar doğru namespace'te üretilmeli, yoksa çizilmez
const SVG_TAGS = new Set([
    'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline',
    'polygon', 'text', 'tspan', 'defs', 'linearGradient', 'radialGradient',
    'stop', 'clipPath', 'mask', 'use', 'symbol', 'pattern'
]);

export function el(tag, attrs = {}, ...children) {
    const isSvg = SVG_TAGS.has(tag);                            // SVG mı, HTML mi?
    const node = isSvg ? document.createElementNS(SVG_NS, tag)  // SVG: NS ile oluştur
        : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;                 // null/false atla
        if (k === 'class') isSvg ? node.setAttribute('class', v) : (node.className = v); // SVG'de className read-only
        else if (k === 'style') node.style.cssText = v;
        else if (k === 'html') node.innerHTML = v;              // SVG kökünde içerik SVG namespace'inde parse edilir
        else if (k === 'ref' && typeof v === 'function') v(node); // node referansını dışarı ver
        else if (k === 'dataset') Object.assign(node.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function')
            node.addEventListener(k.slice(2).toLowerCase(), v);   // onClick -> click
        else node.setAttribute(k, v === true ? '' : v);
    }
    appendAll(node, children);
    return node;
}

function appendAll(node, children) {
    for (const c of children.flat(Infinity)) {
        if (c == null || c === false) continue;
        node.append(c.nodeType ? c : document.createTextNode(String(c))); // node ya da metin
    }
}

// İsimli ikonu currentColor ile çizer
export function icon(name, size = 20) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = icons[name] || '';
    return svg;
}

export const clear = (node) => node.replaceChildren();
export const mount = (node, child) => node.replaceChildren(child);