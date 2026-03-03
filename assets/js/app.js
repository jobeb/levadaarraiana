/**
 * App — Init dashboard, permisos, login/register handlers
 */

function togglePw(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (inp.type === 'password') {
        inp.type = 'text';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    } else {
        inp.type = 'password';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    }
}

function showLogin() {
    document.getElementById('login-box').classList.remove('hidden');
    document.getElementById('register-box').classList.add('hidden');
}
function showRegister() {
    document.getElementById('login-box').classList.add('hidden');
    document.getElementById('register-box').classList.remove('hidden');
}

async function onLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'none';
    try {
        await doLogin(user, pass);
        initApp();
    } catch (e) {
        errEl.textContent = e.message;
        errEl.style.display = 'block';
    }
}

async function onRegister() {
    const user = document.getElementById('reg-user').value.trim();
    const nome = document.getElementById('reg-nome').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const errEl = document.getElementById('reg-error');
    const okEl = document.getElementById('reg-success');
    errEl.style.display = 'none';
    okEl.style.display = 'none';
    try {
        await doRegister({ username: user, password: pass, nome_completo: nome });
        okEl.textContent = t('rexistro_ok');
        okEl.style.display = 'block';
    } catch (e) {
        errEl.textContent = e.message;
        errEl.style.display = 'block';
    }
}

function toggleSidebar() {
    document.querySelector('.app-sidebar').classList.toggle('open');
    document.querySelector('.sidebar-overlay').classList.toggle('show');
}

function initApp() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('app-header').style.display = '';
    document.getElementById('hamburger-btn').style.display = '';
    document.getElementById('app-sidebar').style.display = '';
    document.getElementById('app-main').style.display = '';

    // Set user info in header
    const u = AppState.user;
    document.getElementById('header-username').textContent = u.nome_completo || u.username;
    const av = document.getElementById('header-avatar');
    if (u.foto) {
        av.src = uploadUrl(u.foto);
        av.style.display = '';
    } else {
        // Show initial as placeholder
        av.style.display = 'none';
        const placeholder = document.querySelector('.header-profile-btn .avatar-placeholder');
        if (!placeholder) {
            const ph = document.createElement('span');
            ph.className = 'avatar-placeholder';
            ph.textContent = (u.nome_completo || u.username || '?').charAt(0).toUpperCase();
            document.querySelector('.header-profile-btn').insertBefore(ph, document.querySelector('.header-profile-btn').firstChild);
        }
    }
    document.getElementById('welcome-msg').textContent =
        (AppState.lang === 'en' ? 'Welcome, ' : 'Benvido/a, ') + (u.nome_completo || u.username) + '!';

    // Admin-only elements
    const isAdmin = AppState.isAdmin();
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });

    // Socio-only elements (Admin + Socio)
    const isSocio = AppState.isSocio();
    document.querySelectorAll('.socio-only').forEach(el => {
        el.style.display = isSocio ? '' : 'none';
    });

    // Register routes
    Router.register('dashboard', loadDashboard);
    Router.register('usuarios', usuariosLoad);
    Router.register('noticias', noticiasLoad);
    Router.register('bolos', bolosLoad);
    Router.register('galeria', galeriaLoad);
    Router.register('propostas', propostasLoad);
    Router.register('actas', actasLoad);
    Router.register('documentos', documentosLoad);
    Router.register('votacions', votacionsLoad);

    Router.register('ensaios', ensaiosLoad);
    Router.register('instrumentos', instrumentosLoad);
    Router.register('repertorio', repertorioLoad);
    Router.register('comentarios', comentariosLoad);
    Router.register('configuracion', configuracionLoad);

    Router.init();
    applyLang(AppState.lang);
    restoreAppearance();
}

var _dashboardCal = null;

async function loadDashboard() {
    var statsEl = document.getElementById('dashboard-stats');
    try {
        var results = await Promise.all([
            api('/usuarios').catch(function() { return []; }),
            api('/noticias').catch(function() { return []; }),
            api('/bolos').catch(function() { return []; }),
            api('/ensaios').catch(function() { return []; }),
            api('/votacions').catch(function() { return []; }),
            api('/config').catch(function() { return {}; }),
        ]);
        var usuarios = results[0], noticias = results[1], bolos = results[2], ensaios = results[3], votacions = results[4];
        AppState.config = results[5] || {};
        var activos = usuarios.filter(function(s) { return s.estado !== 'Desactivado'; }).length;
        var hoxe = today();
        var proxBol = bolos.filter(function(b) { return b.data >= hoxe; }).length;
        var pastBol = bolos.filter(function(b) { return b.data < hoxe; }).length;
        var proxEns = ensaios.filter(function(e) { return e.data >= hoxe && e.estado === 'programado'; }).length;
        statsEl.innerHTML =
            '<div class="stat-card stat-blue"><div class="stat-value">' + activos + '</div><div class="stat-label">' + t('usuarios') + '</div></div>' +
            '<div class="stat-card stat-gold"><div class="stat-value">' + noticias.length + '</div><div class="stat-label">' + t('noticias') + '</div></div>' +
            '<div class="stat-card stat-red"><div class="stat-value">' + proxBol + '</div><div class="stat-label">' + t('proximos_bolos') + '</div></div>' +
            '<div class="stat-card stat-magenta"><div class="stat-value">' + pastBol + '</div><div class="stat-label">' + t('bolos_realizados') + '</div></div>' +
            '<div class="stat-card stat-green"><div class="stat-value">' + proxEns + '</div><div class="stat-label">' + t('ensaios') + '</div></div>';

        // Mini calendar
        _renderDashboardCalendar(ensaios, bolos, noticias, votacions);
        // Timeline
        _renderDashboardTimeline(ensaios, bolos);
        // Activity
        _renderDashboardActivity(noticias);
        // Quick actions
        _renderDashboardActions();

    } catch(e) { /* ignore */ }
}

function _calColors() {
    var cfg = AppState.config || {};
    return {
        ensaios:  cfg.cal_cor_ensaios  || '#e3c300',
        bolos:    cfg.cal_cor_bolos    || '#ff9800',
        noticias: cfg.cal_cor_noticias || '#005f97',
        votacions: cfg.cal_cor_votacions || '#a50d3d'
    };
}

function _renderDashboardCalendar(ensaios, bolos, noticias, votacions) {
    var calContainer = document.getElementById('dashboard-calendar');
    if (!calContainer) return;
    if (!_dashboardCal) {
        _dashboardCal = new CalendarWidget('dashboard-calendar', {
            mini: true,
            onDayClick: function(date, events) {
                _showCalendarDayPopup(date, events);
            }
        });
    }
    var cc = _calColors();
    var events = [];
    (ensaios || []).forEach(function(e) {
        if (e.estado !== 'cancelado') {
            events.push({ date: e.data, title: t('ensaio') + (e.lugar ? ' — ' + e.lugar : ''), color: cc.ensaios, type: 'ensaio', id: e.id, hora: e.hora_inicio || '' });
        }
    });
    (bolos || []).forEach(function(b) {
        events.push({ date: b.data, title: b.titulo, color: cc.bolos, type: 'bolo', id: b.id, hora: b.hora || '' });
    });
    (noticias || []).forEach(function(n) {
        if (n.data) {
            events.push({ date: n.data, title: n.titulo, color: cc.noticias, type: 'noticia', id: n.id });
        }
    });
    (votacions || []).forEach(function(v) {
        var inicio = (v.creado || '').substring(0, 10);
        if (inicio) {
            events.push({ date: inicio, title: t('votacion') + ': ' + v.titulo, color: cc.votacions, type: 'votacion', id: v.id, label: t('cal_inicio') });
        }
        if (v.data_limite) {
            events.push({ date: v.data_limite, title: t('votacion') + ': ' + v.titulo, color: cc.votacions, type: 'votacion', id: v.id, label: t('cal_peche') });
        }
    });
    _dashboardCal.setEvents(events);

    // Set legend BEFORE render() so it appends it once
    _dashboardCal._legendHtml =
        '<div class="cal-legend" id="dashboard-cal-legend">' +
        '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + cc.ensaios + '"></span>' + t('ensaios') + '</span>' +
        '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + cc.bolos + '"></span>' + t('bolos') + '</span>' +
        '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + cc.noticias + '"></span>' + t('noticias') + '</span>' +
        '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + cc.votacions + '"></span>' + t('votacions') + '</span>' +
        '</div>';

    _dashboardCal.render();
}

var _calPopupOutsideHandler = null;

function _closeCalendarPopup() {
    var p = document.querySelector('.cal-day-popup');
    if (p) p.remove();
    if (_calPopupOutsideHandler) {
        document.removeEventListener('click', _calPopupOutsideHandler);
        _calPopupOutsideHandler = null;
    }
}

function _showCalendarDayPopup(date, events) {
    // Always clean up previous popup and listener
    _closeCalendarPopup();

    if (!events || events.length === 0) return;

    // Find the clicked cell
    var cell = document.querySelector('.calendar-cell[data-date="' + date + '"]');
    if (!cell) return;

    // Format date
    var parts = date.split('-');
    var dayNum = parseInt(parts[2], 10);
    var monthNames = t('meses');
    var monthName = Array.isArray(monthNames) ? monthNames[parseInt(parts[1], 10) - 1] : parts[1];

    var html = '<div class="cal-day-popup">';
    html += '<div class="cal-day-popup-header">';
    html += '<span>' + dayNum + ' ' + monthName + '</span>';
    html += '<button class="cal-day-popup-close" onclick="event.stopPropagation(); _closeCalendarPopup()">&times;</button>';
    html += '</div>';
    html += '<div class="cal-day-popup-list">';
    var _calIcons = {
        ensaio:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
        bolo:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        noticia:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M18 18h-8M18 10h-8"/></svg>',
        votacion: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>'
    };
    var _calRoutes = { ensaio: 'ensaios', bolo: 'bolos', noticia: 'noticias', votacion: 'votacions' };
    var _isSocio = AppState.isSocio();
    events.forEach(function(ev) {
        var icon = _calIcons[ev.type] || _calIcons.noticia;
        var route = _calRoutes[ev.type] || 'dashboard';
        html += '<div class="cal-day-popup-item" onclick="event.stopPropagation(); _closeCalendarPopup(); Router.navigate(\'' + route + '\')">';
        html += '<span class="cal-day-popup-dot" style="background:' + (ev.color || 'var(--primary)') + '"></span>';
        html += '<span class="cal-day-popup-icon">' + icon + '</span>';
        html += '<div class="cal-day-popup-info">';
        html += '<span class="cal-day-popup-title">' + esc(ev.title) + '</span>';
        var meta = ev.hora || '';
        if (ev.label) meta = (meta ? meta + ' · ' : '') + ev.label;
        if (meta) html += '<span class="cal-day-popup-hora">' + esc(meta) + '</span>';
        html += '</div>';
        if (ev.type === 'ensaio' && !_isSocio) {
            html += '<button class="btn btn-sm btn-primary" style="margin-left:auto;flex-shrink:0;font-size:0.75rem;padding:2px 8px" onclick="event.stopPropagation(); _closeCalendarPopup(); ensaiosSolicitarAsistencia(' + ev.id + ')">' + t('solicitar_asistir') + '</button>';
        }
        html += '</div>';
    });
    html += '</div></div>';

    // Append popup to body with fixed positioning to avoid overflow clipping
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var popup = wrapper.firstElementChild;
    document.body.appendChild(popup);

    // Position below the cell using fixed coordinates
    var cellRect = cell.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = cellRect.bottom + 'px';
    popup.style.left = (cellRect.left + cellRect.width / 2) + 'px';
    popup.style.transform = 'translateX(-50%)';

    // Adjust if overflows viewport
    var popRect = popup.getBoundingClientRect();
    if (popRect.right > window.innerWidth - 8) {
        popup.style.left = 'auto';
        popup.style.right = '8px';
        popup.style.transform = 'none';
    }
    if (popRect.left < 8) {
        popup.style.left = '8px';
        popup.style.right = 'auto';
        popup.style.transform = 'none';
    }
    // If overflows bottom, show above the cell
    if (popRect.bottom > window.innerHeight - 8) {
        popup.style.top = (cellRect.top - popRect.height) + 'px';
    }

    // Close popup when clicking outside
    setTimeout(function() {
        _calPopupOutsideHandler = function(e) {
            var p = document.querySelector('.cal-day-popup');
            if (!p) {
                // Popup already gone, clean up
                document.removeEventListener('click', _calPopupOutsideHandler);
                _calPopupOutsideHandler = null;
                return;
            }
            if (!p.contains(e.target) && !cell.contains(e.target)) {
                _closeCalendarPopup();
            }
        };
        document.addEventListener('click', _calPopupOutsideHandler);
    }, 10);
}

function _renderDashboardTimeline(ensaios, bolos) {
    var listEl = document.getElementById('dashboard-timeline-list');
    if (!listEl) return;

    var todayStr = today();
    var items = [];

    (ensaios || []).forEach(function(e) {
        if (e.data >= todayStr && e.estado === 'programado') {
            items.push({ data: e.data, title: t('ensaio') + (e.lugar ? ' - ' + e.lugar : ''), meta: (e.hora_inicio || '') + '-' + (e.hora_fin || ''), type: 'ensaio' });
        }
    });
    (bolos || []).forEach(function(b) {
        if (b.data >= todayStr && b.estado !== 'cancelado') {
            items.push({ data: b.data, title: b.titulo, meta: (b.hora || '') + ' ' + (b.lugar || ''), type: 'bolo' });
        }
    });

    items.sort(function(a, b) { return a.data.localeCompare(b.data); });
    items = items.slice(0, 5);

    if (items.length === 0) {
        listEl.innerHTML = '<p class="text-muted text-sm">' + t('sen_eventos') + '</p>';
        return;
    }

    var monthNames = ['Xan','Feb','Mar','Abr','Mai','Xun','Xul','Ago','Set','Out','Nov','Dec'];
    var html = '';
    items.forEach(function(item) {
        var parts = item.data.split('-');
        var day = parts[2] || '';
        var month = monthNames[parseInt(parts[1], 10) - 1] || '';
        html += '<div class="dashboard-timeline-item">' +
            '<div class="timeline-date"><div class="day">' + day + '</div><div class="month">' + month + '</div></div>' +
            '<div class="timeline-info"><div class="title">' + esc(item.title) + '</div><div class="meta">' + esc(item.meta) + '</div></div>' +
            '<span class="badge badge-' + (item.type === 'bolo' ? 'warning' : 'primary') + '">' + t(item.type === 'bolo' ? 'bolo' : 'ensaio') + '</span>' +
        '</div>';
    });
    listEl.innerHTML = html;
}

function _renderDashboardActivity(noticias) {
    var listEl = document.getElementById('dashboard-activity-list');
    if (!listEl) return;

    var items = [];
    (noticias || []).slice(0, 5).forEach(function(n) {
        items.push({ text: t('noticias') + ': ' + (n.titulo || ''), date: n.data });
    });
    items.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });

    if (items.length === 0) {
        listEl.innerHTML = '<p class="text-muted text-sm">' + t('sen_resultados') + '</p>';
        return;
    }

    var html = '';
    items.forEach(function(item) {
        html += '<div class="dashboard-activity-item">' +
            '<span>' + esc(truncate(item.text, 60)) + '</span>' +
            '<span class="text-muted text-sm" style="float:right">' + formatDate(item.date) + '</span>' +
        '</div>';
    });
    listEl.innerHTML = html;
}

function _renderDashboardActions() {
    var listEl = document.getElementById('dashboard-actions-list');
    if (!listEl || !AppState.isSocio()) return;

    var actions = [
        { key: 'nova_noticia',   section: 'noticias',   fn: 'noticiasModal',   color: '#005f97' },
        { key: 'novo_bolo',      section: 'bolos',      fn: 'bolosModal',      color: '#e3c300' },
        { key: 'novo_ensaio',    section: 'ensaios',    fn: 'ensaiosModal',    color: '#009564' },
        { key: 'novo_album',     section: 'galeria',    fn: 'galeriaModal',    color: '#a50d3d' },
        { key: 'nova_proposta',  section: 'propostas',  fn: 'propostasModal',  color: '#e67e22' },
        { key: 'nova_votacion',  section: 'votacions',  fn: 'votacionsModal',  color: '#8e44ad' },
        { key: 'nova_acta',      section: 'actas',      fn: 'actasModal',      color: '#2980b9' },
        { key: 'novo_documento', section: 'documentos', fn: 'documentosModal', color: '#16a085' }
    ];
    var html = '<div class="dashboard-actions-grid">';
    actions.forEach(function(a) {
        html += '<button class="btn btn-sm" style="background:' + a.color + ';color:#fff;border:none" ' +
            'onmouseenter="this.style.opacity=\'0.85\'" onmouseleave="this.style.opacity=\'1\'" ' +
            'onclick="Router.navigate(\'' + a.section + '\');setTimeout(' + a.fn + ',200)">+ ' + t(a.key) + '</button>';
    });
    html += '</div>';
    listEl.innerHTML = html;
}

// ---- Profile dropdown ----
function toggleProfileMenu() {
    const dd = document.getElementById('profile-dropdown');
    dd.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dd = document.getElementById('profile-dropdown');
    const profileArea = document.getElementById('header-profile');
    if (dd && profileArea && !profileArea.contains(e.target)) {
        dd.classList.remove('show');
    }
});

// ---- Profile modal ----
function openProfileModal() {
    document.getElementById('profile-dropdown').classList.remove('show');
    const u = AppState.user;

    $('#modal-title').textContent = t('meu_perfil');

    $('#modal-body').innerHTML =
        '<div style="text-align:center;margin-bottom:16px">' +
            (u.foto
                ? '<img src="' + esc(uploadUrl(u.foto)) + '" class="avatar-lg" style="border-radius:50%;width:72px;height:72px;object-fit:cover">'
                : '<div style="width:72px;height:72px;border-radius:50%;background:var(--primary-dim);color:var(--primary);display:inline-flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700">' + esc((u.nome_completo || u.username || '?').charAt(0).toUpperCase()) + '</div>') +
            '<div style="margin-top:8px;color:var(--text-muted);font-size:0.85rem">@' + esc(u.username) + '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('nome_completo') + '</label>' +
            '<input type="text" class="form-control" id="perfil-nome" value="' + esc(u.nome_completo || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('email') + '</label>' +
            '<input type="email" class="form-control" id="perfil-email" value="' + esc(u.email || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('telefono') + '</label>' +
            '<input type="tel" class="form-control" id="perfil-telefono" value="' + esc(u.telefono || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('instrumento') + '</label>' +
            '<input type="text" class="form-control" id="perfil-instrumento" value="' + esc(u.instrumento || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('foto_perfil') + '</label>' +
            '<input type="file" class="form-control" id="perfil-foto" accept="image/*">' +
        '</div>' +
        '<hr style="border-color:var(--border);margin:12px 0">' +
        '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px">' + t('cambiar_contrasinal') + '</p>' +
        '<div class="form-group">' +
            '<label>' + t('contrasinal_actual') + '</label>' +
            '<input type="password" class="form-control" id="perfil-pw-old" autocomplete="current-password">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('contrasinal_nova') + '</label>' +
            '<input type="password" class="form-control" id="perfil-pw-new" autocomplete="new-password">' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="saveProfile()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function saveProfile() {
    var body = {
        nome_completo: ($('#perfil-nome') || {}).value || '',
        email: ($('#perfil-email') || {}).value || '',
        telefono: ($('#perfil-telefono') || {}).value || '',
        instrumento: ($('#perfil-instrumento') || {}).value || '',
    };

    var pwOld = ($('#perfil-pw-old') || {}).value || '';
    var pwNew = ($('#perfil-pw-new') || {}).value || '';
    if (pwNew) {
        body.password_old = pwOld;
        body.password_new = pwNew;
    }

    var fotoInput = $('#perfil-foto');
    if (fotoInput && fotoInput.files && fotoInput.files.length > 0) {
        var f = await imageToBase64(fotoInput.files[0]);
        body.foto_data = f.data;
        body.foto_ext = 'jpg';
    }

    try {
        var updated = await api('/usuarios/me', { method: 'PUT', body: body });
        // Update session with new data
        updated.token = AppState.token;
        AppState.setUser(updated);
        // Refresh header
        document.getElementById('header-username').textContent = updated.nome_completo || updated.username;
        var av = document.getElementById('header-avatar');
        if (updated.foto) {
            av.src = uploadUrl(updated.foto);
            av.style.display = '';
            var ph = document.querySelector('.header-profile-btn .avatar-placeholder');
            if (ph) ph.remove();
        }
        document.getElementById('welcome-msg').textContent =
            (AppState.lang === 'en' ? 'Welcome, ' : 'Benvido/a, ') + (updated.nome_completo || updated.username) + '!';

        hideModal('modal-overlay');
        toast(t('perfil_actualizado'), 'success');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Appearance: Font Size ----
function setFontSize(size) {
    document.documentElement.classList.remove('fs-small', 'fs-normal', 'fs-large');
    if (size !== 'normal') document.documentElement.classList.add('fs-' + size);
    localStorage.setItem('fontSize', size);
    document.querySelectorAll('.font-size-control button').forEach(function(b) {
        b.classList.toggle('active', b.id === 'fs-' + size);
    });
}

// ---- Appearance: Compact Mode ----
function toggleCompactMode(on) {
    document.documentElement.classList.toggle('compact-mode', on);
    localStorage.setItem('compactMode', on ? '1' : '0');
}

// ---- Appearance: Theme (dark/light) ----
function setTheme(theme) {
    document.documentElement.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('theme', theme);
    var toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.checked = (theme === 'light');
}

// ---- Restore appearance preferences ----
function restoreAppearance() {
    var fs = localStorage.getItem('fontSize') || 'normal';
    setFontSize(fs);
    var compact = localStorage.getItem('compactMode') === '1';
    var toggle = document.getElementById('compact-toggle');
    if (toggle) toggle.checked = compact;
    toggleCompactMode(compact);
    var theme = localStorage.getItem('theme') || 'dark';
    setTheme(theme);
}

// Enter key on login fields
document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') onLogin(); });
document.getElementById('login-user')?.addEventListener('keydown', e => { if (e.key === 'Enter') onLogin(); });

// Init
(function() {
    // Apply theme early so login screen respects it
    var savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') document.documentElement.classList.add('light-mode');

    initLangSelector();
    applyLang(AppState.lang);
    if (AppState.loadSession()) {
        initApp();
    }
})();
