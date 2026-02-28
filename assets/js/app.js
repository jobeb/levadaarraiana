/**
 * App — Init dashboard, permisos, login/register handlers
 */

function togglePw(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (inp.type === 'password') {
        inp.type = 'text';
        btn.innerHTML = '&#128064;';
    } else {
        inp.type = 'password';
        btn.innerHTML = '&#128065;';
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

    // Start notification polling
    updateNotifications();
    if (AppState._notifTimer) clearInterval(AppState._notifTimer);
    AppState._notifTimer = setInterval(updateNotifications, 60000);

    // Admin-only elements
    const isAdmin = AppState.isAdmin();
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });

    // Register routes
    Router.register('dashboard', loadDashboard);
    Router.register('socios', sociosLoad);
    Router.register('noticias', noticiasLoad);
    Router.register('bolos', bolosLoad);
    Router.register('galeria', galeriaLoad);
    Router.register('mensaxeria', mensaxeriaLoad);
    Router.register('propostas', propostasLoad);
    Router.register('actas', actasLoad);
    Router.register('documentos', documentosLoad);
    Router.register('votacions', votacionsLoad);
    Router.register('contabilidade', contabilidadeLoad);
    Router.register('ensaios', ensaiosLoad);
    Router.register('instrumentos', instrumentosLoad);
    Router.register('repertorio', repertorioLoad);
    Router.register('configuracion', configuracionLoad);

    Router.init();
    applyLang(AppState.lang);
}

var _dashboardCal = null;

async function loadDashboard() {
    var statsEl = document.getElementById('dashboard-stats');
    try {
        var results = await Promise.all([
            api('/socios').catch(function() { return []; }),
            api('/noticias').catch(function() { return []; }),
            api('/bolos').catch(function() { return []; }),
            api('/ensaios').catch(function() { return []; }),
            api('/mensaxes').catch(function() { return []; }),
        ]);
        var socios = results[0], noticias = results[1], bolos = results[2], ensaios = results[3], mensaxes = results[4];
        var aprobados = socios.filter(function(s) { return s.estado === 'Aprobado'; }).length;
        var proxBol = bolos.filter(function(b) { return b.data >= today(); }).length;
        var proxEns = ensaios.filter(function(e) { return e.data >= today() && e.estado === 'programado'; }).length;
        statsEl.innerHTML =
            '<div class="stat-card"><div class="stat-value">' + aprobados + '</div><div class="stat-label">' + t('socios') + '</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + noticias.length + '</div><div class="stat-label">' + t('noticias') + '</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + proxBol + '</div><div class="stat-label">' + t('bolos') + '</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + proxEns + '</div><div class="stat-label">' + t('ensaios') + '</div></div>';

        // Mini calendar
        _renderDashboardCalendar(ensaios, bolos);
        // Timeline
        _renderDashboardTimeline(ensaios, bolos);
        // Activity
        _renderDashboardActivity(noticias, mensaxes);
        // Quick actions
        _renderDashboardActions();

    } catch(e) { /* ignore */ }
}

function _renderDashboardCalendar(ensaios, bolos) {
    var calContainer = document.getElementById('dashboard-calendar');
    if (!calContainer) return;
    if (!_dashboardCal) {
        _dashboardCal = new CalendarWidget('dashboard-calendar', { mini: true });
    }
    var events = [];
    (ensaios || []).forEach(function(e) {
        if (e.estado !== 'cancelado') {
            events.push({ date: e.data, title: t('ensaio'), color: 'var(--primary)' });
        }
    });
    (bolos || []).forEach(function(b) {
        var color = b.tipo === 'festival' ? 'var(--success)' : 'var(--warning)';
        events.push({ date: b.data, title: b.titulo, color: color });
    });
    _dashboardCal.setEvents(events);
    _dashboardCal.render();
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

function _renderDashboardActivity(noticias, mensaxes) {
    var listEl = document.getElementById('dashboard-activity-list');
    if (!listEl) return;

    var items = [];
    (noticias || []).slice(0, 3).forEach(function(n) {
        items.push({ text: t('noticias') + ': ' + (n.titulo || ''), date: n.data });
    });
    (mensaxes || []).slice(0, 3).forEach(function(m) {
        items.push({ text: t('mensaxe') + ': ' + (m.titulo || ''), date: m.data });
    });
    items.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
    items = items.slice(0, 5);

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
    if (!listEl || !AppState.isAdmin()) return;

    listEl.innerHTML = '<div class="dashboard-actions-grid">' +
        '<button class="btn btn-sm btn-primary" onclick="Router.navigate(\'ensaios\');setTimeout(ensaiosModal,200)">+ ' + t('novo_ensaio') + '</button>' +
        '<button class="btn btn-sm btn-primary" onclick="Router.navigate(\'bolos\');setTimeout(bolosModal,200)">+ ' + t('novo_bolo') + '</button>' +
        '<button class="btn btn-sm btn-secondary" onclick="Router.navigate(\'noticias\');setTimeout(noticiasModal,200)">+ ' + t('nova_noticia') + '</button>' +
        '<button class="btn btn-sm btn-secondary" onclick="Router.navigate(\'mensaxeria\');setTimeout(mensaxeriaModal,200)">+ ' + t('nova_mensaxe') + '</button>' +
    '</div>';
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

// ---- Notifications ----
async function updateNotifications() {
    try {
        const mensaxes = await api('/mensaxes').catch(() => []);
        const currentUserId = AppState.user ? parseInt(AppState.user.id) : 0;
        let unread = 0;
        (mensaxes || []).forEach(function(m) {
            if (m.ocultos && Array.isArray(m.ocultos) && m.ocultos.indexOf(currentUserId) !== -1) return;
            const isRead = (m.lidos && Array.isArray(m.lidos)) ? m.lidos.indexOf(currentUserId) !== -1 : !!m.lida;
            if (!isRead) unread++;
        });
        const badge = document.getElementById('bell-badge');
        if (badge) {
            if (unread > 0) {
                badge.textContent = unread > 99 ? '99+' : unread;
                badge.style.display = '';
            } else {
                badge.style.display = 'none';
            }
        }
        AppState._unreadCount = unread;
    } catch { /* ignore */ }
}

function bellClick() {
    Router.navigate('mensaxeria');
}

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
        var f = await fileToBase64(fotoInput.files[0]);
        body.foto_data = f.data;
        body.foto_ext = fotoInput.files[0].name.split('.').pop() || 'jpg';
    }

    try {
        var updated = await api('/socios/me', { method: 'PUT', body: body });
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

// Enter key on login fields
document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') onLogin(); });
document.getElementById('login-user')?.addEventListener('keydown', e => { if (e.key === 'Enter') onLogin(); });

// Init
(function() {
    initLangSelector();
    applyLang(AppState.lang);
    if (AppState.loadSession()) {
        initApp();
    }
})();
