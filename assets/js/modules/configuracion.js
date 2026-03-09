/**
 * Configuracion — Settings module (admin only)
 */

async function configuracionLoad() {
    try {
        AppState.config = await api('/config');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.config = {};
    }

    // Check for ?yt=ok / ?yt=error (returning from Google OAuth)
    if (location.search.indexOf('yt=ok') !== -1) {
        toast(t('youtube_ok'), 'success');
        history.replaceState(null, '', location.pathname + location.hash);
    } else if (location.search.indexOf('yt=error') !== -1) {
        toast(t('youtube_erro'), 'error');
        history.replaceState(null, '', location.pathname + location.hash);
    }

    configuracionRender();
}

function configuracionRender() {
    var container = $('#config-form');
    if (!container) return;

    var cfg = AppState.config || {};

    var _isAdmin = AppState.user && AppState.user.role === 'Admin';

    /* ---- Tabs ---- */
    var html = '<div class="tabs" id="config-tabs">' +
        '<button class="tab-btn active" data-tab="cfg-xeral" onclick="_configTab(\'cfg-xeral\')">' + t('sec_xeral') + '</button>' +
        (_isAdmin ? '<button class="tab-btn" data-tab="cfg-smtp" onclick="_configTab(\'cfg-smtp\')">' + t('smtp') + '</button>' : '') +
        '<button class="tab-btn" data-tab="cfg-fiscal" onclick="_configTab(\'cfg-fiscal\')">' + t('datos_fiscais') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-calendario" onclick="_configTab(\'cfg-calendario\')">' + t('calendario') + '</button>' +
        (_isAdmin ? '<button class="tab-btn" data-tab="cfg-youtube" onclick="_configTab(\'cfg-youtube\')">' + t('servizos_externos') + '</button>' : '') +
        (_isAdmin ? '<button class="tab-btn" data-tab="cfg-backup" onclick="_configTab(\'cfg-backup\')">' + t('copias_seguridade') + '</button>' : '') +
    '</div>';

    /* ---- General tab ---- */
    html += '<div class="config-tab-panel" id="cfg-xeral">' +
        '<div class="form-group">' +
            '<label>' + t('nome_asociacion') + '</label>' +
            '<input type="text" class="form-control" id="cfg-nome-asociacion" value="' + esc(cfg.nome_asociacion || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('moderacion_comentarios') + '</label>' +
            '<select class="form-control" id="cfg-comentarios-moderacion">' +
                '<option value="0"' + (cfg.comentarios_moderacion == 0 ? ' selected' : '') + '>' + t('publicar_automaticamente') + '</option>' +
                '<option value="1"' + (cfg.comentarios_moderacion == 1 ? ' selected' : '') + '>' + t('requirir_aprobacion') + '</option>' +
            '</select>' +
        '</div>' +
    '</div>';

    /* ---- SMTP tab (admin only) ---- */
    if (_isAdmin) {
    var metodo = cfg.email_metodo || 'php_mail';
    html += '<div class="config-tab-panel" id="cfg-smtp" style="display:none">' +
        '<div class="form-group">' +
            '<label>' + t('metodo_envio') + '</label>' +
            '<select class="form-control" id="cfg-email-metodo" onchange="_cfgToggleSmtp()">' +
                '<option value="php_mail"' + (metodo === 'php_mail' ? ' selected' : '') + '>PHP mail()</option>' +
                '<option value="smtp"' + (metodo === 'smtp' ? ' selected' : '') + '>SMTP</option>' +
            '</select>' +
        '</div>' +
        '<div id="cfg-smtp-fields" style="' + (metodo === 'smtp' ? '' : 'display:none') + '">' +
            '<div class="form-row">' +
                '<div class="form-group" style="flex:2">' +
                    '<label>' + t('smtp_host') + '</label>' +
                    '<input type="text" class="form-control" id="cfg-smtp-host" value="' + esc(cfg.smtp_host || '') + '">' +
                '</div>' +
                '<div class="form-group" style="flex:1">' +
                    '<label>' + t('smtp_port') + '</label>' +
                    '<input type="number" class="form-control" id="cfg-smtp-port" value="' + (cfg.smtp_port || 587) + '">' +
                '</div>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>' + t('smtp_user') + '</label>' +
                '<input type="text" class="form-control" id="cfg-smtp-user" value="' + esc(cfg.smtp_user || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label>' + t('smtp_pass') + '</label>' +
                '<input type="password" class="form-control" id="cfg-smtp-pass" value="' + esc(cfg.smtp_pass || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label>' + t('smtp_from') + '</label>' +
                '<input type="text" class="form-control" id="cfg-smtp-from" value="' + esc(cfg.smtp_from || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label>' + t('cifrado') + '</label>' +
                '<select class="form-control" id="cfg-smtp-cifrado">' +
                    '<option value="TLS"' + ((cfg.smtp_cifrado || 'TLS').toUpperCase() === 'TLS' ? ' selected' : '') + '>TLS</option>' +
                    '<option value="SSL"' + ((cfg.smtp_cifrado || '').toUpperCase() === 'SSL' ? ' selected' : '') + '>SSL</option>' +
                    '<option value="none"' + ((cfg.smtp_cifrado || '').toLowerCase() === 'none' ? ' selected' : '') + '>' + t('ningunha') + '</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('email_destino') + '</label>' +
            '<input type="email" class="form-control" id="cfg-email-dest" value="' + esc(cfg.email_dest || '') + '">' +
        '</div>' +
        '<button class="btn btn-sm btn-secondary" id="cfg-test-smtp-btn" onclick="_cfgTestSmtp()" style="margin-top:8px">' + t('probar_smtp') + '</button>' +
    '</div>';
    }

    /* ---- Fiscal tab ---- */
    html += '<div class="config-tab-panel" id="cfg-fiscal" style="display:none">' +
        '<div class="form-group">' +
            '<label>' + t('nome') + '</label>' +
            '<input type="text" class="form-control" id="cfg-fiscal-nome" value="' + esc(cfg.fiscal_nome || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('nif') + '</label>' +
            '<input type="text" class="form-control" id="cfg-fiscal-nif" value="' + esc(cfg.fiscal_nif || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('enderezo') + '</label>' +
            '<input type="text" class="form-control" id="cfg-fiscal-enderezo" value="' + esc(cfg.fiscal_enderezo || '') + '">' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('cp') + '</label>' +
                '<input type="text" class="form-control" id="cfg-fiscal-cp" value="' + esc(cfg.fiscal_cp || '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:2">' +
                '<label>' + t('localidade') + '</label>' +
                '<input type="text" class="form-control" id="cfg-fiscal-localidade" value="' + esc(cfg.fiscal_localidade || '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('provincia') + '</label>' +
                '<input type="text" class="form-control" id="cfg-fiscal-provincia" value="' + esc(cfg.fiscal_provincia || '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('telefono') + '</label>' +
                '<input type="text" class="form-control" id="cfg-fiscal-telefono" value="' + esc(cfg.fiscal_telefono || '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('email') + '</label>' +
                '<input type="email" class="form-control" id="cfg-fiscal-email" value="' + esc(cfg.fiscal_email || '') + '">' +
            '</div>' +
        '</div>' +
    '</div>';

    /* ---- About (hidden panel — textareas live here for save, visible in landing tab) ---- */
    html += '<div style="display:none">' +
        '<textarea id="cfg-sobre-nos-gl">' + esc(cfg.sobre_nos_gl || '') + '</textarea>' +
        '<textarea id="cfg-sobre-nos-es">' + esc(cfg.sobre_nos_es || '') + '</textarea>' +
        '<textarea id="cfg-sobre-nos-pt">' + esc(cfg.sobre_nos_pt || '') + '</textarea>' +
        '<textarea id="cfg-sobre-nos-en">' + esc(cfg.sobre_nos_en || '') + '</textarea>' +
    '</div>';

    /* ---- Calendar colors tab ---- */
    var _calDefaults = { ensaios: '#e3c300', bolos: '#ff9800', noticias: '#005f97', votacions: '#a50d3d' };
    html += '<div class="config-tab-panel" id="cfg-calendario" style="display:none">' +
        '<p style="color:var(--text-muted);margin-bottom:16px">' + t('cal_cores_desc') + '</p>' +
        '<div class="cal-color-grid">';
    ['ensaios', 'bolos', 'noticias', 'votacions'].forEach(function(key) {
        var val = cfg['cal_cor_' + key] || _calDefaults[key];
        html += '<div class="cal-color-item">' +
            '<label class="cal-color-label">' +
                '<input type="color" class="cal-color-input" id="cfg-cal-cor-' + key + '" value="' + esc(val) + '">' +
                '<span class="cal-color-preview" id="cfg-cal-preview-' + key + '" style="background:' + esc(val) + '"></span>' +
                '<span>' + t(key) + '</span>' +
            '</label>' +
        '</div>';
    });
    html += '</div>' +
        '<button class="btn btn-sm" style="margin-top:12px" onclick="_calResetColors()">' + t('restablecer') + '</button>' +
    '</div>';

    /* ---- YouTube tab (admin only) ---- */
    if (_isAdmin) {
    html += '<div class="config-tab-panel" id="cfg-youtube" style="display:none">' +
        '<div class="form-group">' +
            '<label>' + t('youtube_client_id') + '</label>' +
            '<input type="text" class="form-control" id="cfg-yt-client-id" value="' + esc(cfg.youtube_client_id || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('youtube_client_secret') + '</label>' +
            '<input type="password" class="form-control" id="cfg-yt-client-secret" value="' + esc(cfg.youtube_client_secret || '') + '">' +
        '</div>' +
        '<div class="form-group" id="cfg-yt-status">' +
            '<p style="color:var(--text-muted)">' + t('cargando') + '</p>' +
        '</div>' +
        '<div class="flex gap-sm" style="margin-top:12px">' +
            '<button class="btn btn-primary" id="cfg-yt-connect-btn" onclick="youtubeConnect()">' + t('youtube_conectar') + '</button>' +
            '<button class="btn btn-danger" id="cfg-yt-disconnect-btn" onclick="youtubeDisconnect()" style="display:none">' + t('youtube_desconectar') + '</button>' +
        '</div>' +
        '<hr style="margin:20px 0;border-color:var(--border)">' +
        '<div class="form-group">' +
            '<label>' + t('groq_api_key') + '</label>' +
            '<input type="password" class="form-control" id="cfg-groq-api-key" value="' + esc(cfg.groq_api_key || '') + '">' +
        '</div>' +
    '</div>';
    }

    /* ---- Backup tab (admin only) ---- */
    if (_isAdmin) {
    html += '<div class="config-tab-panel" id="cfg-backup" style="display:none">' +
        '<p style="color:var(--text-muted);margin-bottom:16px">' + t('descargar_backup_desc') + '</p>' +
        '<button class="btn btn-primary" onclick="_downloadBackup()">' + t('descargar_backup') + '</button>' +
    '</div>';
    }

    /* ---- Save button (not shown in backup tab) ---- */
    html += '<div style="margin-top:20px" id="cfg-save-wrap">' +
        '<button class="btn btn-primary" onclick="configuracionSave()">' + t('gardar') + '</button>' +
    '</div>';

    container.innerHTML = html;

    // Live preview for color pickers
    ['ensaios', 'bolos', 'noticias', 'votacions'].forEach(function(key) {
        var input = $('#cfg-cal-cor-' + key);
        var preview = $('#cfg-cal-preview-' + key);
        if (input && preview) {
            input.addEventListener('input', function() { preview.style.background = input.value; });
        }
    });

    // Check YouTube status after render (admin only)
    if (_isAdmin) _loadYoutubeStatus();
}

function _configTab(tabId) {
    // Toggle panel visibility
    $$('.config-tab-panel').forEach(function(panel) {
        panel.style.display = panel.id === tabId ? '' : 'none';
    });
    // Toggle tab button active state
    $$('#config-tabs .tab-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    // Hide save button on backup tab (it has its own save)
    var saveWrap = $('#cfg-save-wrap');
    if (saveWrap) saveWrap.style.display = (tabId === 'cfg-backup') ? 'none' : '';
}

async function configuracionSave() {
    var isAdmin = AppState.user && AppState.user.role === 'Admin';

    var body = {
        // General
        nome_asociacion: ($('#cfg-nome-asociacion') || {}).value || '',
        // Fiscal
        fiscal_nome: ($('#cfg-fiscal-nome') || {}).value || '',
        fiscal_nif: ($('#cfg-fiscal-nif') || {}).value || '',
        fiscal_enderezo: ($('#cfg-fiscal-enderezo') || {}).value || '',
        fiscal_cp: ($('#cfg-fiscal-cp') || {}).value || '',
        fiscal_localidade: ($('#cfg-fiscal-localidade') || {}).value || '',
        fiscal_provincia: ($('#cfg-fiscal-provincia') || {}).value || '',
        fiscal_telefono: ($('#cfg-fiscal-telefono') || {}).value || '',
        fiscal_email: ($('#cfg-fiscal-email') || {}).value || '',
        // About (prefer rich text editors if available, fall back to hidden textareas)
        sobre_nos_gl: getRichTextContent('cfg-sobre-nos-editor-gl') || ($('#cfg-sobre-nos-gl') || {}).value || '',
        sobre_nos_es: getRichTextContent('cfg-sobre-nos-editor-es') || ($('#cfg-sobre-nos-es') || {}).value || '',
        sobre_nos_pt: getRichTextContent('cfg-sobre-nos-editor-pt') || ($('#cfg-sobre-nos-pt') || {}).value || '',
        sobre_nos_en: getRichTextContent('cfg-sobre-nos-editor-en') || ($('#cfg-sobre-nos-en') || {}).value || '',
        // Moderación
        comentarios_moderacion: parseInt(($('#cfg-comentarios-moderacion') || {}).value) || 0,
        // Calendar colors
        cal_cor_ensaios: ($('#cfg-cal-cor-ensaios') || {}).value || '#e3c300',
        cal_cor_bolos: ($('#cfg-cal-cor-bolos') || {}).value || '#ff9800',
        cal_cor_noticias: ($('#cfg-cal-cor-noticias') || {}).value || '#005f97',
        cal_cor_votacions: ($('#cfg-cal-cor-votacions') || {}).value || '#a50d3d'
    };

    // Admin-only fields (SMTP, YouTube)
    if (isAdmin) {
        body.smtp_host = ($('#cfg-smtp-host') || {}).value || '';
        body.smtp_port = parseInt(($('#cfg-smtp-port') || {}).value) || 587;
        body.smtp_user = ($('#cfg-smtp-user') || {}).value || '';
        body.smtp_pass = ($('#cfg-smtp-pass') || {}).value || '';
        body.smtp_from = ($('#cfg-smtp-from') || {}).value || '';
        body.smtp_cifrado = ($('#cfg-smtp-cifrado') || {}).value || 'TLS';
        body.email_dest = ($('#cfg-email-dest') || {}).value || '';
        body.email_metodo = ($('#cfg-email-metodo') || {}).value || 'php_mail';
        body.youtube_client_id = ($('#cfg-yt-client-id') || {}).value || '';
        body.youtube_client_secret = ($('#cfg-yt-client-secret') || {}).value || '';
        body.groq_api_key = ($('#cfg-groq-api-key') || {}).value || '';
    }

    try {
        await api('/config', { method: 'PUT', body: body });
        toast(t('exito'), 'success');
        // Merge into config state (keep existing values for fields not sent)
        Object.assign(AppState.config, body);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Calendar color helpers ----

async function _cfgTestSmtp() {
    var btn = $('#cfg-test-smtp-btn');
    if (btn) { btn.disabled = true; btn.textContent = t('cargando'); }
    try {
        await api('/config/test-smtp', { method: 'POST' });
        toast(t('email_proba_enviado') || 'Email de proba enviado correctamente', 'success');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = t('probar_smtp'); }
    }
}

function _cfgToggleSmtp() {
    var metodo = ($('#cfg-email-metodo') || {}).value || 'php_mail';
    var fields = $('#cfg-smtp-fields');
    if (fields) fields.style.display = metodo === 'smtp' ? '' : 'none';
}

function _calResetColors() {
    var defaults = { ensaios: '#e3c300', bolos: '#ff9800', noticias: '#005f97', votacions: '#a50d3d' };
    ['ensaios', 'bolos', 'noticias', 'votacions'].forEach(function(key) {
        var input = $('#cfg-cal-cor-' + key);
        var preview = $('#cfg-cal-preview-' + key);
        if (input) input.value = defaults[key];
        if (preview) preview.style.background = defaults[key];
    });
}

// ---- Backup helper ----

async function _downloadBackup() {
    try {
        var res = await fetch(CONFIG.API_BASE + '/backup', {
            headers: { 'Authorization': 'Bearer ' + AppState.token }
        });
        if (!res.ok) throw new Error('Erro ' + res.status);
        var blob = await res.blob();
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var disposition = res.headers.get('Content-Disposition') || '';
        var match = disposition.match(/filename="?([^"]+)"?/);
        a.download = match ? match[1] : 'levadaarraiana_backup.sql';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- YouTube helpers ----

async function _loadYoutubeStatus() {
    var statusEl = $('#cfg-yt-status');
    var connectBtn = $('#cfg-yt-connect-btn');
    var disconnectBtn = $('#cfg-yt-disconnect-btn');
    if (!statusEl) return;

    try {
        var data = await api('/youtube/status');
        if (data.connected) {
            var channelText = data.channel_name ? ' (' + esc(data.channel_name) + ')' : '';
            statusEl.innerHTML = '<p style="color:var(--success)">' + t('youtube_conectado') + channelText + '</p>';
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = '';
        } else {
            statusEl.innerHTML = '<p style="color:var(--text-muted)">' + t('youtube_non_conectado') + '</p>';
            if (connectBtn) connectBtn.style.display = '';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
        }
    } catch (e) {
        statusEl.innerHTML = '<p style="color:var(--text-muted)">' + t('youtube_non_conectado') + '</p>';
    }
}

async function youtubeConnect() {
    var clientId = ($('#cfg-yt-client-id') || {}).value || '';
    var clientSecret = ($('#cfg-yt-client-secret') || {}).value || '';
    if (!clientId || !clientSecret) {
        toast(t('youtube_intro_credenciais'), 'error');
        return;
    }

    // Save config before redirecting
    await configuracionSave();

    try {
        var data = await api('/youtube/auth');
        if (data.url) {
            window.location.href = data.url;
        }
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function youtubeDisconnect() {
    try {
        await api('/youtube/disconnect', { method: 'DELETE' });
        toast(t('youtube_desconectar') + ' - OK', 'success');
        _loadYoutubeStatus();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Landing sections (fondos configurables) ----

var _landingSecNames = {
    hero: 'Hero / Cabeceira',
    noticias: 'Noticias',
    bolos: 'Proximos bolos',
    bolos_pasados: 'Bolos realizados',
    presuposto: 'Pedir presuposto',
    galeria: 'Galeria',
    instrumentos: 'Instrumentos',
    sobre_nos: 'Sobre nos',
    unirse: 'Queres tocar con nos?',
    contacto: 'Contacto'
};

var _landingSeccions = [];

async function paxinaInicioLoad() {
    try {
        AppState.config = await api('/config');
    } catch (e) {
        AppState.config = AppState.config || {};
    }
    _loadLandingSeccions();
}

async function _loadLandingSeccions() {
    try {
        _landingSeccions = await api('/landing-seccions');
        _renderLandingTab(_landingSeccions);
    } catch (e) {
        var panel = $('#landing-config-container');
        if (panel) panel.innerHTML = '<p style="color:var(--danger)">' + t('erro') + ': ' + esc(e.message) + '</p>';
    }
}

function _renderLandingTab(seccions) {
    var panel = $('#landing-config-container');
    if (!panel) return;

    var html = '';

    seccions.forEach(function(s) {
        var name = _landingSecNames[s.id] || s.id;
        var hasImg = !!s.bg_imaxe;
        var hasVid = !!s.bg_video;

        html += '<div class="card landing-sec-card" data-sec-id="' + s.id + '" style="margin-bottom:16px;padding:16px' + (s.activa === false ? ';opacity:0.5' : '') + '">' +
            '<div class="landing-sec-handle" style="display:flex;align-items:center;gap:10px;margin-bottom:12px;cursor:grab">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
                '<h4 style="margin:0;color:var(--primary);flex:1">' + esc(name) + '</h4>' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;color:var(--text-muted)">' +
                    '<input type="checkbox" id="landing-activa-' + s.id + '"' + (s.activa !== false ? ' checked' : '') + '> ' + t('seccion_activa') +
                '</label>' +
            '</div>';

        // Preview
        if (hasVid) {
            html += '<div style="margin-bottom:12px"><video src="' + uploadUrl(s.bg_video) + '" muted loop style="width:200px;height:120px;object-fit:cover;border-radius:var(--radius)"></video></div>';
        } else if (hasImg) {
            html += '<div style="margin-bottom:12px"><img src="' + uploadUrl(s.bg_imaxe) + '" style="width:200px;height:120px;object-fit:cover;border-radius:var(--radius)" alt=""></div>';
        } else if (s.bg_cor) {
            html += '<div style="margin-bottom:12px;width:200px;height:60px;border-radius:var(--radius);background:' + esc(s.bg_cor) + ';border:1px solid var(--border)"></div>';
        }

        // Image upload
        html += '<div class="form-group">' +
            '<label>' + t('fondo_imaxe') + '</label>' +
            '<input type="file" class="form-control" id="landing-img-' + s.id + '" accept="image/*">' +
            (hasImg ? '<button class="btn btn-sm btn-danger" style="margin-top:4px" onclick="_landingRemoveImaxe(\'' + s.id + '\')">' + t('quitar_imaxe') + '</button>' : '') +
        '</div>';

        // Video upload
        html += '<div class="form-group">' +
            '<label>' + t('fondo_video') + '</label>' +
            '<input type="file" class="form-control" id="landing-vid-' + s.id + '" accept="video/*">' +
            (hasVid ? '<button class="btn btn-sm btn-danger" style="margin-top:4px" onclick="_landingRemoveVideo(\'' + s.id + '\')">' + t('quitar_video') + '</button>' : '') +
        '</div>';

        // Color picker + options row
        var _hasItems = ['noticias','bolos','bolos_pasados','galeria','instrumentos'].indexOf(s.id) !== -1;
        html += '<div class="form-row" style="align-items:flex-end;gap:12px;flex-wrap:wrap">' +
            '<div class="form-group" style="flex:0 0 auto">' +
                '<label>' + t('fondo_cor') + '</label>' +
                '<input type="color" id="landing-cor-' + s.id + '" value="' + esc(s.bg_cor || '#0c0e14') + '" style="width:50px;height:36px;padding:2px;cursor:pointer">' +
            '</div>' +
            '<div class="form-group" style="flex:0 0 auto">' +
                '<label>' + t('parallax') + '</label>' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer">' +
                    '<input type="checkbox" id="landing-parallax-' + s.id + '"' + (s.parallax ? ' checked' : '') + '> ' + t('parallax') +
                '</label>' +
            '</div>' +
            '<div class="form-group" style="flex:0 0 auto">' +
                '<label>' + t('divisor_debaixo') + '</label>' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer">' +
                    '<input type="checkbox" id="landing-divisor-' + s.id + '"' + (s.divisor ? ' checked' : '') + '> ' + t('divisor_debaixo') +
                '</label>' +
            '</div>' +
            '<div class="form-group" style="flex:1;min-width:150px">' +
                '<label>' + t('overlay_opacidade') + ': <span id="landing-opa-val-' + s.id + '">' + (s.overlay_opacidade || 0.7) + '</span></label>' +
                '<input type="range" id="landing-opa-' + s.id + '" min="0" max="1" step="0.05" value="' + (s.overlay_opacidade || 0.7) + '" style="width:100%" oninput="document.getElementById(\'landing-opa-val-' + s.id + '\').textContent=this.value">' +
            '</div>' +
        '</div>' +
        '<div class="form-row" style="align-items:flex-end;gap:12px;flex-wrap:wrap;margin-top:8px">' +
            '<div class="form-group" style="flex:0 0 auto;min-width:120px">' +
                '<label>' + t('bg_tamano') + '</label>' +
                '<div style="display:flex;gap:6px;align-items:center">' +
                    '<select class="form-control" id="landing-bgsize-' + s.id + '" style="width:auto" onchange="_landingToggleBgSizeCustom(\'' + s.id + '\')">' +
                        '<option value="cover"' + ((s.bg_size || 'cover') === 'cover' ? ' selected' : '') + '>cover</option>' +
                        '<option value="contain"' + (s.bg_size === 'contain' ? ' selected' : '') + '>contain</option>' +
                        '<option value="auto"' + (s.bg_size === 'auto' ? ' selected' : '') + '>auto</option>' +
                        '<option value="custom"' + (['cover','contain','auto'].indexOf(s.bg_size) === -1 && s.bg_size ? ' selected' : '') + '>' + t('personalizado') + '</option>' +
                    '</select>' +
                    '<input type="number" class="form-control" id="landing-bgsize-custom-' + s.id + '" min="50" max="5000" step="10" placeholder="px" style="width:80px;display:' + (['cover','contain','auto',''].indexOf(s.bg_size) === -1 ? 'block' : 'none') + '" value="' + (['cover','contain','auto',''].indexOf(s.bg_size) === -1 ? parseInt(s.bg_size) || '' : '') + '">' +
                '</div>' +
            '</div>' +
            '<div class="form-group" style="flex:0 0 auto;min-width:120px">' +
                '<label>' + t('bg_repeticion') + '</label>' +
                '<select class="form-control" id="landing-bgrepeat-' + s.id + '" style="width:auto">' +
                    '<option value="no-repeat"' + ((s.bg_repeat || 'no-repeat') === 'no-repeat' ? ' selected' : '') + '>no-repeat</option>' +
                    '<option value="repeat"' + (s.bg_repeat === 'repeat' ? ' selected' : '') + '>repeat</option>' +
                    '<option value="repeat-x"' + (s.bg_repeat === 'repeat-x' ? ' selected' : '') + '>repeat-x</option>' +
                    '<option value="repeat-y"' + (s.bg_repeat === 'repeat-y' ? ' selected' : '') + '>repeat-y</option>' +
                '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:0 0 auto;min-width:120px">' +
                '<label>' + t('bg_posicion') + '</label>' +
                '<select class="form-control" id="landing-bgpos-' + s.id + '" style="width:auto">' +
                    '<option value="center"' + ((s.bg_position || 'center') === 'center' ? ' selected' : '') + '>center</option>' +
                    '<option value="top"' + (s.bg_position === 'top' ? ' selected' : '') + '>top</option>' +
                    '<option value="bottom"' + (s.bg_position === 'bottom' ? ' selected' : '') + '>bottom</option>' +
                    '<option value="left"' + (s.bg_position === 'left' ? ' selected' : '') + '>left</option>' +
                    '<option value="right"' + (s.bg_position === 'right' ? ' selected' : '') + '>right</option>' +
                    '<option value="top left"' + (s.bg_position === 'top left' ? ' selected' : '') + '>top left</option>' +
                    '<option value="top right"' + (s.bg_position === 'top right' ? ' selected' : '') + '>top right</option>' +
                    '<option value="bottom left"' + (s.bg_position === 'bottom left' ? ' selected' : '') + '>bottom left</option>' +
                    '<option value="bottom right"' + (s.bg_position === 'bottom right' ? ' selected' : '') + '>bottom right</option>' +
                '</select>' +
            '</div>' +
            (_hasItems ? '<div class="form-group" style="flex:0 0 auto;min-width:120px">' +
                '<label>' + t('max_elementos') + '</label>' +
                '<input type="number" class="form-control" id="landing-max-' + s.id + '" value="' + (s.max_items || 0) + '" min="0" step="1" style="width:80px" placeholder="0 = ' + t('todos') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:0 0 auto;min-width:120px">' +
                '<label>' + t('max_elementos_movil') + '</label>' +
                '<input type="number" class="form-control" id="landing-max-mobile-' + s.id + '" value="' + (s.max_items_mobile || 0) + '" min="0" step="1" style="width:80px" placeholder="0 = ' + t('todos') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:0 0 auto;min-width:130px">' +
                '<label>' + t('ancho_card') + ' (%)</label>' +
                '<input type="number" class="form-control" id="landing-cardwidth-' + s.id + '" value="' + (s.card_width || 0) + '" min="0" max="100" step="5" style="width:80px" placeholder="0 = auto">' +
            '</div>' : '') +
            (s.id === 'galeria' ? '<div class="form-group" style="flex:0 0 auto;min-width:140px">' +
                '<label>' + t('max_fotos_destacadas') + '</label>' +
                '<input type="number" class="form-control" id="landing-max-destacadas-' + s.id + '" value="' + (s.max_fotos_destacadas || 0) + '" min="0" step="1" style="width:80px" placeholder="0 = ' + t('todos') + '">' +
            '</div>' : '') +
        '</div>';

        // Sobre nós: inject language tabs with text editing inside this card
        if (s.id === 'sobre_nos') {
            var _cfg = AppState.config || {};
            var _langs = [
                { code: 'gl', label: 'Galego' },
                { code: 'es', label: 'Castellano' },
                { code: 'pt', label: 'Português' },
                { code: 'en', label: 'English' }
            ];
            html += '<div class="form-group" style="margin-top:12px">' +
                '<label>' + t('sobre_nos') + '</label>' +
                '<div class="tabs" style="margin-bottom:8px">';
            _langs.forEach(function(l, i) {
                html += '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="cfg-about-' + l.code + '" onclick="_cfgAboutLang(\'' + l.code + '\')">' + l.label + '</button>';
            });
            html += '</div>';
            _langs.forEach(function(l, i) {
                html += '<div class="cfg-about-lang-panel" id="cfg-about-' + l.code + '" style="' + (i !== 0 ? 'display:none' : '') + '">' +
                    '<div class="rt-wrap" id="cfg-sobre-nos-editor-' + l.code + '"></div>' +
                '</div>';
            });
            html += '</div>';
        }

        // Save button per section
        html += '<button class="btn btn-primary btn-sm" onclick="_landingSaveSec(\'' + s.id + '\')">' + t('gardar') + '</button>' +
        '</div>';
    });

    panel.innerHTML = html;

    // Init Sobre Nós rich text editors
    var _cfgAbout = AppState.config || {};
    ['gl','es','pt','en'].forEach(function(l) {
        var edId = 'cfg-sobre-nos-editor-' + l;
        if (document.getElementById(edId)) {
            initRichTextEditor(edId, _cfgAbout['sobre_nos_' + l] || '');
        }
    });

    // Init drag-and-drop: only draggable from the handle area
    var dragEl = null;
    panel.onmousedown = panel.ontouchstart = function(e) {
        var handle = e.target.closest('.landing-sec-handle');
        var card = e.target.closest('.landing-sec-card');
        if (handle && card) {
            card.draggable = true;
        } else if (card) {
            card.draggable = false;
        }
    };
    panel.ondragstart = function(e) {
        dragEl = e.target.closest('.landing-sec-card');
        if (!dragEl || !dragEl.draggable) { e.preventDefault(); return; }
        dragEl.classList.add('dragging');
    };
    panel.ondragover = function(e) {
        e.preventDefault();
        var target = e.target.closest('.landing-sec-card');
        if (target && target !== dragEl) {
            var rect = target.getBoundingClientRect();
            var midY = rect.top + rect.height / 2;
            if (e.clientY < midY) panel.insertBefore(dragEl, target);
            else panel.insertBefore(dragEl, target.nextSibling);
        }
    };
    panel.ondragend = function() {
        if (dragEl) { dragEl.classList.remove('dragging'); dragEl.draggable = false; }
        dragEl = null;
        _landingSaveOrder();
    };
}

function _cfgAboutLang(code) {
    var panels = document.querySelectorAll('.cfg-about-lang-panel');
    panels.forEach(function(p) { p.style.display = 'none'; });
    var active = $('#cfg-about-' + code);
    if (active) active.style.display = '';
    // Update tab buttons
    var btns = active ? active.closest('.card').querySelectorAll('.tab-btn') : [];
    btns.forEach(function(b) {
        b.classList.toggle('active', b.dataset.tab === 'cfg-about-' + code);
    });
}

function _landingToggleBgSizeCustom(secId) {
    var sel = $('#landing-bgsize-' + secId);
    var inp = $('#landing-bgsize-custom-' + secId);
    if (sel && inp) inp.style.display = sel.value === 'custom' ? 'block' : 'none';
}

async function _landingSaveOrder() {
    var cards = $$('#landing-config-container .landing-sec-card');
    var ids = cards.map(function(c) { return c.dataset.secId; });
    try {
        await api('/landing-seccions/reorder', { method: 'PUT', body: { ids: ids } });
        toast(t('orden_gardado'), 'success');
    } catch (e) { toast(e.message, 'error'); }
}

async function _landingSaveSec(secId) {
    var body = {};

    // Image file
    var imgInput = $('#landing-img-' + secId);
    if (imgInput && imgInput.files && imgInput.files[0]) {
        var imgData = await fileToBase64(imgInput.files[0]);
        body.bg_imaxe_data = imgData.data;
        body.bg_imaxe_ext = imgData.name.split('.').pop() || 'jpg';
    }

    // Video file
    var vidInput = $('#landing-vid-' + secId);
    if (vidInput && vidInput.files && vidInput.files[0]) {
        var vidData = await fileToBase64(vidInput.files[0]);
        body.bg_video_data = vidData.data;
        body.bg_video_ext = vidData.name.split('.').pop() || 'mp4';
    }

    // Color
    var corInput = $('#landing-cor-' + secId);
    body.bg_cor = corInput ? corInput.value : '';

    // Activa
    var activaInput = $('#landing-activa-' + secId);
    body.activa = activaInput ? activaInput.checked : true;

    // Parallax
    var parInput = $('#landing-parallax-' + secId);
    body.parallax = parInput ? parInput.checked : false;

    // Divisor
    var divInput = $('#landing-divisor-' + secId);
    body.divisor = divInput ? divInput.checked : false;

    // Overlay opacity
    var opaInput = $('#landing-opa-' + secId);
    body.overlay_opacidade = opaInput ? parseFloat(opaInput.value) : 0.7;

    // Background options
    var bgsizeInput = $('#landing-bgsize-' + secId);
    if (bgsizeInput) {
        if (bgsizeInput.value === 'custom') {
            var customPx = parseInt($('#landing-bgsize-custom-' + secId)?.value) || 500;
            body.bg_size = customPx + 'px auto';
        } else {
            body.bg_size = bgsizeInput.value;
        }
    }

    var bgrepeatInput = $('#landing-bgrepeat-' + secId);
    if (bgrepeatInput) body.bg_repeat = bgrepeatInput.value;

    var bgposInput = $('#landing-bgpos-' + secId);
    if (bgposInput) body.bg_position = bgposInput.value;

    // Max items
    var maxInput = $('#landing-max-' + secId);
    if (maxInput) body.max_items = parseInt(maxInput.value) || 0;

    // Max items mobile
    var maxMobileInput = $('#landing-max-mobile-' + secId);
    if (maxMobileInput) body.max_items_mobile = parseInt(maxMobileInput.value) || 0;

    // Max fotos destacadas (galeria only)
    var maxDestInput = $('#landing-max-destacadas-' + secId);
    if (maxDestInput) body.max_fotos_destacadas = parseInt(maxDestInput.value) || 0;

    // Card width (percentage)
    var cardWidthInput = $('#landing-cardwidth-' + secId);
    if (cardWidthInput) body.card_width = parseInt(cardWidthInput.value) || 0;

    try {
        await api('/landing-seccions/' + secId, { method: 'PUT', body: body });

        // Also save sobre_nos texts when saving the sobre_nos section
        if (secId === 'sobre_nos') {
            var aboutBody = {
                sobre_nos_gl: getRichTextContent('cfg-sobre-nos-editor-gl') || '',
                sobre_nos_es: getRichTextContent('cfg-sobre-nos-editor-es') || '',
                sobre_nos_pt: getRichTextContent('cfg-sobre-nos-editor-pt') || '',
                sobre_nos_en: getRichTextContent('cfg-sobre-nos-editor-en') || ''
            };
            await api('/config', { method: 'PUT', body: aboutBody });
            ['gl','es','pt','en'].forEach(function(l) {
                var hidden = $('#cfg-sobre-nos-' + l);
                if (hidden) hidden.value = aboutBody['sobre_nos_' + l];
            });
            Object.assign(AppState.config, aboutBody);
        }

        toast(t('gardado'), 'success');
        _loadLandingSeccions();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function _landingRemoveImaxe(secId) {
    try {
        await api('/landing-seccions/' + secId, { method: 'PUT', body: { remove_imaxe: true } });
        toast(t('gardado'), 'success');
        _loadLandingSeccions();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function _landingRemoveVideo(secId) {
    try {
        await api('/landing-seccions/' + secId, { method: 'PUT', body: { remove_video: true } });
        toast(t('gardado'), 'success');
        _loadLandingSeccions();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
