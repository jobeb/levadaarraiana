/**
 * Utils — api(), fileToBase64(), esc(), today(), toast()
 */

async function api(endpoint, opts = {}) {
    const url = CONFIG.API_BASE + endpoint;
    const headers = { 'Content-Type': 'application/json' };
    if (AppState.token) {
        headers['Authorization'] = 'Bearer ' + AppState.token;
    }
    const res = await fetch(url, {
        method: opts.method || 'GET',
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Erro ' + res.status);
    }
    return data;
}

function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function now() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
            const base64 = r.result.split(',')[1];
            resolve({ name: file.name, data: base64, type: file.type });
        };
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

function toast(msg, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function formatDate(d) {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
    return d;
}

function uploadUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return CONFIG.UPLOADS + '/' + path;
}

function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
}
function $$(sel, ctx) {
    return [...(ctx || document).querySelectorAll(sel)];
}

function showModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('show');
}
function hideModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('show');
}

function confirmAction(msg, opts) {
    return _showConfirmDialog(msg || t('confirmar_accion'), opts);
}

function nl2br(str) {
    if (!str) return '';
    return esc(str).replace(/\n/g, '<br>');
}

function truncate(str, len = 100) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}
