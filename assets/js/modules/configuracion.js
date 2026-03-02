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

    /* ---- Tabs ---- */
    var html = '<div class="tabs" id="config-tabs">' +
        '<button class="tab-btn" data-tab="cfg-landing" onclick="_configTab(\'cfg-landing\')">' + t('paxina_inicio') + '</button>' +
        '<button class="tab-btn active" data-tab="cfg-xeral" onclick="_configTab(\'cfg-xeral\')">' + t('sec_xeral') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-smtp" onclick="_configTab(\'cfg-smtp\')">' + t('smtp') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-fiscal" onclick="_configTab(\'cfg-fiscal\')">' + t('datos_fiscais') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-about" onclick="_configTab(\'cfg-about\')">' + t('sobre_nos') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-calendario" onclick="_configTab(\'cfg-calendario\')">' + t('calendario') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-youtube" onclick="_configTab(\'cfg-youtube\')">YouTube</button>' +
        '<button class="tab-btn" data-tab="cfg-backup" onclick="_configTab(\'cfg-backup\')">' + t('copias_seguridade') + '</button>' +
    '</div>';

    /* ---- Landing tab ---- */
    html += '<div class="config-tab-panel" id="cfg-landing" style="display:none">' +
        '<p style="color:var(--text-muted);margin-bottom:16px">' + t('cargando') + '</p>' +
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

    /* ---- SMTP tab ---- */
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
                    '<label>SMTP Host</label>' +
                    '<input type="text" class="form-control" id="cfg-smtp-host" value="' + esc(cfg.smtp_host || '') + '">' +
                '</div>' +
                '<div class="form-group" style="flex:1">' +
                    '<label>SMTP Port</label>' +
                    '<input type="number" class="form-control" id="cfg-smtp-port" value="' + (cfg.smtp_port || 587) + '">' +
                '</div>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>SMTP User</label>' +
                '<input type="text" class="form-control" id="cfg-smtp-user" value="' + esc(cfg.smtp_user || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label>SMTP Pass</label>' +
                '<input type="password" class="form-control" id="cfg-smtp-pass" value="' + esc(cfg.smtp_pass || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label>SMTP From</label>' +
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
            '<label>Email destino</label>' +
            '<input type="email" class="form-control" id="cfg-email-dest" value="' + esc(cfg.email_dest || '') + '">' +
        '</div>' +
    '</div>';

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
                '<label>CP</label>' +
                '<input type="text" class="form-control" id="cfg-fiscal-cp" value="' + esc(cfg.fiscal_cp || '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:2">' +
                '<label>Localidade</label>' +
                '<input type="text" class="form-control" id="cfg-fiscal-localidade" value="' + esc(cfg.fiscal_localidade || '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>Provincia</label>' +
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

    /* ---- About tab ---- */
    html += '<div class="config-tab-panel" id="cfg-about" style="display:none">' +
        '<div class="form-group">' +
            '<label>' + t('sobre_nos') + ' (Galego)</label>' +
            '<textarea class="form-control" id="cfg-sobre-nos-gl" rows="4">' + esc(cfg.sobre_nos_gl || '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('sobre_nos') + ' (Castellano)</label>' +
            '<textarea class="form-control" id="cfg-sobre-nos-es" rows="4">' + esc(cfg.sobre_nos_es || '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('sobre_nos') + ' (Portugues)</label>' +
            '<textarea class="form-control" id="cfg-sobre-nos-pt" rows="4">' + esc(cfg.sobre_nos_pt || '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('sobre_nos') + ' (English)</label>' +
            '<textarea class="form-control" id="cfg-sobre-nos-en" rows="4">' + esc(cfg.sobre_nos_en || '') + '</textarea>' +
        '</div>' +
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

    /* ---- YouTube tab ---- */
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
    '</div>';

    /* ---- Backup tab ---- */
    html += '<div class="config-tab-panel" id="cfg-backup" style="display:none">' +
        '<p style="color:var(--text-muted);margin-bottom:16px">' + t('descargar_backup_desc') + '</p>' +
        '<button class="btn btn-primary" onclick="_downloadBackup()">' + t('descargar_backup') + '</button>' +
    '</div>';

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

    // Check YouTube status after render
    _loadYoutubeStatus();
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
    // Hide save button on backup and landing tabs (they have their own save)
    var saveWrap = $('#cfg-save-wrap');
    if (saveWrap) saveWrap.style.display = (tabId === 'cfg-backup' || tabId === 'cfg-landing') ? 'none' : '';
    // Load landing data when switching to that tab
    if (tabId === 'cfg-landing') _loadLandingSeccions();
}

async function configuracionSave() {
    var body = {
        // General
        nome_asociacion: ($('#cfg-nome-asociacion') || {}).value || '',
        // SMTP
        smtp_host: ($('#cfg-smtp-host') || {}).value || '',
        smtp_port: parseInt(($('#cfg-smtp-port') || {}).value) || 587,
        smtp_user: ($('#cfg-smtp-user') || {}).value || '',
        smtp_pass: ($('#cfg-smtp-pass') || {}).value || '',
        smtp_from: ($('#cfg-smtp-from') || {}).value || '',
        smtp_cifrado: ($('#cfg-smtp-cifrado') || {}).value || 'TLS',
        email_dest: ($('#cfg-email-dest') || {}).value || '',
        email_metodo: ($('#cfg-email-metodo') || {}).value || 'php_mail',
        // Fiscal
        fiscal_nome: ($('#cfg-fiscal-nome') || {}).value || '',
        fiscal_nif: ($('#cfg-fiscal-nif') || {}).value || '',
        fiscal_enderezo: ($('#cfg-fiscal-enderezo') || {}).value || '',
        fiscal_cp: ($('#cfg-fiscal-cp') || {}).value || '',
        fiscal_localidade: ($('#cfg-fiscal-localidade') || {}).value || '',
        fiscal_provincia: ($('#cfg-fiscal-provincia') || {}).value || '',
        fiscal_telefono: ($('#cfg-fiscal-telefono') || {}).value || '',
        fiscal_email: ($('#cfg-fiscal-email') || {}).value || '',
        // About
        sobre_nos_gl: ($('#cfg-sobre-nos-gl') || {}).value || '',
        sobre_nos_es: ($('#cfg-sobre-nos-es') || {}).value || '',
        sobre_nos_pt: ($('#cfg-sobre-nos-pt') || {}).value || '',
        sobre_nos_en: ($('#cfg-sobre-nos-en') || {}).value || '',
        // YouTube
        youtube_client_id: ($('#cfg-yt-client-id') || {}).value || '',
        youtube_client_secret: ($('#cfg-yt-client-secret') || {}).value || '',
        // Moderación
        comentarios_moderacion: parseInt(($('#cfg-comentarios-moderacion') || {}).value) || 0,
        // Calendar colors
        cal_cor_ensaios: ($('#cfg-cal-cor-ensaios') || {}).value || '#e3c300',
        cal_cor_bolos: ($('#cfg-cal-cor-bolos') || {}).value || '#ff9800',
        cal_cor_noticias: ($('#cfg-cal-cor-noticias') || {}).value || '#005f97',
        cal_cor_votacions: ($('#cfg-cal-cor-votacions') || {}).value || '#a50d3d'
    };

    try {
        await api('/config', { method: 'PUT', body: body });
        toast(t('exito'), 'success');
        AppState.config = body;
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Calendar color helpers ----

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

async function _loadLandingSeccions() {
    try {
        _landingSeccions = await api('/landing-seccions');
        _renderLandingTab(_landingSeccions);
    } catch (e) {
        var panel = $('#cfg-landing');
        if (panel) panel.innerHTML = '<p style="color:var(--danger)">' + t('erro') + ': ' + esc(e.message) + '</p>';
    }
}

function _renderLandingTab(seccions) {
    var panel = $('#cfg-landing');
    if (!panel) return;

    var html = '<p style="color:var(--text-muted);margin-bottom:16px">' + t('paxina_inicio') + '</p>';

    seccions.forEach(function(s) {
        var name = _landingSecNames[s.id] || s.id;
        var hasImg = !!s.bg_imaxe;
        var hasVid = !!s.bg_video;

        html += '<div class="card landing-sec-card" draggable="true" data-sec-id="' + s.id + '" style="margin-bottom:16px;padding:16px' + (s.activa === false ? ';opacity:0.5' : '') + '">' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;cursor:grab">' +
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
            '</div>' : '') +
            (s.id === 'galeria' ? '<div class="form-group" style="flex:0 0 auto;min-width:140px">' +
                '<label>' + t('max_fotos_destacadas') + '</label>' +
                '<input type="number" class="form-control" id="landing-max-destacadas-' + s.id + '" value="' + (s.max_fotos_destacadas || 0) + '" min="0" step="1" style="width:80px" placeholder="0 = ' + t('todos') + '">' +
            '</div>' : '') +
        '</div>';

        // Save button per section
        html += '<button class="btn btn-primary btn-sm" onclick="_landingSaveSec(\'' + s.id + '\')">' + t('gardar') + '</button>' +
        '</div>';
    });

    panel.innerHTML = html;

    // Init drag-and-drop for section reordering
    var dragEl = null;
    panel.addEventListener('dragstart', function(e) {
        dragEl = e.target.closest('.landing-sec-card');
        if (dragEl) dragEl.classList.add('dragging');
    });
    panel.addEventListener('dragover', function(e) {
        e.preventDefault();
        var target = e.target.closest('.landing-sec-card');
        if (target && target !== dragEl) {
            var rect = target.getBoundingClientRect();
            var midY = rect.top + rect.height / 2;
            if (e.clientY < midY) panel.insertBefore(dragEl, target);
            else panel.insertBefore(dragEl, target.nextSibling);
        }
    });
    panel.addEventListener('dragend', function() {
        if (dragEl) dragEl.classList.remove('dragging');
        dragEl = null;
        _landingSaveOrder();
    });
}

function _landingToggleBgSizeCustom(secId) {
    var sel = $('#landing-bgsize-' + secId);
    var inp = $('#landing-bgsize-custom-' + secId);
    if (sel && inp) inp.style.display = sel.value === 'custom' ? 'block' : 'none';
}

async function _landingSaveOrder() {
    var cards = $$('#cfg-landing .landing-sec-card');
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

    try {
        await api('/landing-seccions/' + secId, { method: 'PUT', body: body });
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
