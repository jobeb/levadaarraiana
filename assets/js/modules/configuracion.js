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
        '<button class="tab-btn active" data-tab="cfg-xeral" onclick="_configTab(\'cfg-xeral\')">' + t('sec_xeral') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-smtp" onclick="_configTab(\'cfg-smtp\')">' + t('smtp') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-fiscal" onclick="_configTab(\'cfg-fiscal\')">' + t('datos_fiscais') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-about" onclick="_configTab(\'cfg-about\')">' + t('sobre_nos') + '</button>' +
        '<button class="tab-btn" data-tab="cfg-youtube" onclick="_configTab(\'cfg-youtube\')">YouTube</button>' +
        '<button class="tab-btn" data-tab="cfg-backup" onclick="_configTab(\'cfg-backup\')">' + t('copias_seguridade') + '</button>' +
    '</div>';

    /* ---- General tab ---- */
    html += '<div class="config-tab-panel" id="cfg-xeral">' +
        '<div class="form-group">' +
            '<label>' + t('nome_asociacion') + '</label>' +
            '<input type="text" class="form-control" id="cfg-nome-asociacion" value="' + esc(cfg.nome_asociacion || '') + '">' +
        '</div>' +
    '</div>';

    /* ---- SMTP tab ---- */
    html += '<div class="config-tab-panel" id="cfg-smtp" style="display:none">' +
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
            '<label>Cifrado (tls/ssl/none)</label>' +
            '<input type="text" class="form-control" id="cfg-smtp-cifrado" value="' + esc(cfg.smtp_cifrado || 'tls') + '">' +
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
    // Hide save button on backup tab (no editable fields)
    var saveWrap = $('#cfg-save-wrap');
    if (saveWrap) saveWrap.style.display = tabId === 'cfg-backup' ? 'none' : '';
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
        smtp_cifrado: ($('#cfg-smtp-cifrado') || {}).value || 'tls',
        email_dest: ($('#cfg-email-dest') || {}).value || '',
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
        youtube_client_secret: ($('#cfg-yt-client-secret') || {}).value || ''
    };

    try {
        await api('/config', { method: 'PUT', body: body });
        toast(t('exito'), 'success');
        AppState.config = body;
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
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
