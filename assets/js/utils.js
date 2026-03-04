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
        // Session expired — redirect to login instead of showing error
        if (res.status === 401 && AppState.token) {
            AppState.clearSession();
            window.location.href = 'app.html';
            return;
        }
        throw new Error((data.error_key && t(data.error_key) !== data.error_key ? t(data.error_key) : data.error) || t('erro') + ' ' + res.status);
    }
    return data;
}

function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function sanitizeHtml(html) {
    if (!html) return '';
    if (typeof DOMPurify !== 'undefined') return DOMPurify.sanitize(html);
    return esc(html);
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

function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            const data = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
            URL.revokeObjectURL(img.src);
            resolve({ name: file.name.replace(/\.[^.]+$/, '.jpg'), data: data, type: 'image/jpeg' });
        };
        img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error(t('erro_cargar_imaxe'))); };
        img.src = URL.createObjectURL(file);
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

function stripHtml(html) {
    if (!html) return '';
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * tc(item, field) — Translated Content helper
 * Returns the translated value for `field` in the current language,
 * falling back to the original GL column value.
 */
function tc(item, field) {
    if (!item) return '';
    if (AppState.lang !== 'gl' && item.i18n && item.i18n[field] && item.i18n[field][AppState.lang]) {
        return item.i18n[field][AppState.lang];
    }
    return item[field] || '';
}

/**
 * Modal i18n — Language selector that switches the SAME modal fields between languages.
 *
 * Each field descriptor: { key:'titulo', inputId:'noticia-titulo', type:'input'|'textarea'|'richtext', editorId?:'noticia-texto-editor' }
 *   - type 'input'    → reads/writes .value on the element with id=inputId
 *   - type 'textarea' → same as input
 *   - type 'richtext' → uses getRichTextContent(editorId) / _rtSetContent(editorId, html)
 */
var _modalI18n = { fields: [], currentLang: 'gl', data: {} };

/** Render a lang selector bar (to be inserted in the modal HTML) */
function _renderModalLangBar() {
    return '<div class="modal-lang-bar">' +
        ['gl','es','pt','en'].map(function(l) {
            return '<button type="button" class="modal-lang-btn' + (l === 'gl' ? ' active' : '') +
                '" data-lang="' + l + '" onclick="_onModalLangSwitch(\'' + l + '\')">' + l.toUpperCase() + '</button>';
        }).join('') +
    '</div>';
}

/** Call after the modal is fully rendered (fields exist in DOM) */
function _initModalI18n(fields, item) {
    _modalI18n.fields = fields;
    _modalI18n.currentLang = 'gl';
    _modalI18n.data = { gl: {}, es: {}, pt: {}, en: {} };
    if (item) {
        var i18n = item.i18n || {};
        fields.forEach(function(f) {
            _modalI18n.data.gl[f.key] = item[f.key] || '';
            ['es','pt','en'].forEach(function(lang) {
                if (i18n[f.key] && i18n[f.key][lang]) {
                    _modalI18n.data[lang][f.key] = i18n[f.key][lang];
                }
            });
        });
    }
}

/** Save current field values into _modalI18n.data[currentLang] */
function _saveModalLangValues() {
    var lang = _modalI18n.currentLang;
    _modalI18n.fields.forEach(function(f) {
        if (f.type === 'richtext') {
            _modalI18n.data[lang][f.key] = getRichTextContent(f.editorId);
        } else {
            var el = document.getElementById(f.inputId);
            if (el) _modalI18n.data[lang][f.key] = el.value;
        }
    });
}

/** Load values from _modalI18n.data[lang] into the form fields */
function _loadModalLangValues(lang) {
    _modalI18n.fields.forEach(function(f) {
        var val = _modalI18n.data[lang][f.key] || '';
        if (f.type === 'richtext') {
            _rtSetContent(f.editorId, val);
        } else {
            var el = document.getElementById(f.inputId);
            if (el) el.value = val;
        }
    });
}

/** Set Quill editor content by container id */
function _rtSetContent(containerId, html) {
    var quill = _rtInstances[containerId];
    if (quill) {
        quill.root.innerHTML = html || '<p><br></p>';
    }
}

/** Handle language switch button click */
function _onModalLangSwitch(lang) {
    if (lang === _modalI18n.currentLang) return;
    _saveModalLangValues();
    _modalI18n.currentLang = lang;
    _loadModalLangValues(lang);
    document.querySelectorAll('.modal-lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

/** Collect GL values + i18n object for the save request */
function _collectModalI18n() {
    _saveModalLangValues();
    var i18n = {};
    ['es','pt','en'].forEach(function(lang) {
        _modalI18n.fields.forEach(function(f) {
            var val = (_modalI18n.data[lang][f.key] || '').trim();
            if (val) {
                if (!i18n[f.key]) i18n[f.key] = {};
                i18n[f.key][lang] = val;
            }
        });
    });
    return Object.keys(i18n).length ? i18n : null;
}
