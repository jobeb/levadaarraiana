/**
 * i18n — Loader + t() + applyLang()
 * Idiomas: gl (galego), es (castellano), pt (português), en (english)
 *
 * Language files: i18n-gl.js, i18n-es.js, i18n-pt.js, i18n-en.js
 * Each defines a global var LANG_XX = { key: 'value', ... }
 * GL is loaded by default via <script> tag in HTML.
 */

// Active translations (flat key→value for the current language)
var TRANSLATIONS = (typeof LANG_GL !== 'undefined') ? LANG_GL : {};

/**
 * Load a language file dynamically via <script> tag.
 * If the file is already loaded (global LANG_XX exists), uses it immediately.
 */
function _loadLangFile(lang, callback) {
    var varName = 'LANG_' + lang.toUpperCase();
    if (window[varName]) {
        TRANSLATIONS = window[varName];
        if (callback) callback();
        return;
    }
    var s = document.createElement('script');
    s.src = 'assets/js/i18n-' + lang + '.js';
    s.onload = function() {
        TRANSLATIONS = window[varName];
        if (callback) callback();
    };
    document.head.appendChild(s);
}

function t(key) {
    var val = TRANSLATIONS[key];
    if (val === undefined || val === null) return key;
    return val;
}

function applyLang(lang) {
    AppState.lang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    _loadLangFile(lang, function() {
        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
            el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
        });
        // Update lang selector active state
        document.querySelectorAll('.lang-selector button').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    });
}

function initLangSelector() {
    document.querySelectorAll('.lang-selector button').forEach(function(btn) {
        btn.addEventListener('click', function() { applyLang(btn.dataset.lang); });
    });
}
