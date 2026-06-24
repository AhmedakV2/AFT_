// Minimal hyperscript: el('div', {class:'x', onClick:fn}, child1, 'metin')
import { icons } from './icons.js';

export function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;                 // null/false atla
        if (k === 'class') node.className = v;
        else if (k === 'style') node.style.cssText = v;
        else if (k === 'html') node.innerHTML = v;
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
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
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