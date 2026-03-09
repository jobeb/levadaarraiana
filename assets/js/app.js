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

function rejectLopd() {
    doLogout();
}

async function acceptLopd() {
    var cb = document.getElementById('lopd-consent-check');
    var errEl = document.getElementById('lopd-error');
    if (!cb.checked) {
        errEl.textContent = t('lopd_obrigatorio');
        errEl.style.display = 'block';
        return;
    }
    errEl.style.display = 'none';
    try {
        var res = await api('/consent', { method: 'POST' });
        AppState.user.lopd_consentimento = res.lopd_consentimento;
        AppState.setUser(AppState.user);
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
    var lopdCb = document.getElementById('reg-lopd-check');
    if (!lopdCb.checked) {
        errEl.textContent = t('lopd_obrigatorio');
        errEl.style.display = 'block';
        return;
    }
    try {
        await doRegister({ username: user, password: pass, nome_completo: nome, lopd_consent: true });
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

    // Check LOPD consent — block dashboard until accepted
    if (!AppState.user.lopd_consentimento) {
        document.getElementById('lopd-consent-overlay').style.display = '';
        return;
    }
    document.getElementById('lopd-consent-overlay').style.display = 'none';

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
    // Greeting based on time of day
    var hour = new Date().getHours();
    var greeting = hour < 13 ? t('bo_dia') : (hour < 20 ? t('boas_tardes') : t('boas_noites'));
    document.getElementById('welcome-msg').textContent =
        (greeting || t('benvido')) + ', ' + (u.nome_completo || u.username) + '!';
    // Show current date
    var dateEl = document.getElementById('dashboard-date');
    if (dateEl) {
        var now = new Date();
        var meses = t('meses');
        var dias = t('dias_semana');
        if (Array.isArray(meses) && Array.isArray(dias)) {
            dateEl.textContent = dias[now.getDay()] + ', ' + now.getDate() + ' de ' + meses[now.getMonth()] + ' de ' + now.getFullYear();
        } else {
            dateEl.textContent = now.toLocaleDateString();
        }
    }

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
    Router.register('newsletter-admin', newsletterAdminLoad);
    Router.register('papeleira', papeleiraLoad);
    Router.register('auditoria', auditoriaLoad);

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
            api('/asistencia/mi-asistencia').catch(function() { return {}; }),
            api('/bolos/mi-asistencia').catch(function() { return {}; }),
        ]);
        var usuarios = results[0], noticias = results[1], bolos = results[2], ensaios = results[3], votacions = results[4];
        AppState.config = results[5] || {};
        // Populate my-attendance maps for confirm modals
        if (typeof _ensaiosAsistencia !== 'undefined') Object.assign(_ensaiosAsistencia, results[6] || {});
        if (typeof _bolosAsistencia !== 'undefined') Object.assign(_bolosAsistencia, results[7] || {});
        var activos = usuarios.filter(function(s) { return s.estado !== 'Desactivado'; }).length;
        var hoxe = today();
        var proxBol = bolos.filter(function(b) { return b.data >= hoxe; }).length;
        var pastBol = bolos.filter(function(b) { return b.data < hoxe; }).length;
        var proxEns = ensaios.filter(function(e) { return e.data >= hoxe && e.estado === 'programado'; }).length;
        var _statIcons = {
            usuarios: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            noticias: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
            bolos: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 3 9"/></svg>',
            ensaios: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
        };
        var numSocios = usuarios.filter(function(s) { return s.estado !== 'Desactivado' && s.role === 'Socio'; }).length;
        function _statCard(cls, icon, val, label, onclick) {
            return '<div class="stat-card ' + cls + '"' + (onclick ? ' onclick="' + onclick + '" style="cursor:pointer"' : '') + '>' +
                '<div class="stat-icon">' + icon + '</div>' +
                '<div class="stat-body"><div class="stat-value">' + val + '</div><div class="stat-label">' + label + '</div></div>' +
            '</div>';
        }
        statsEl.innerHTML =
            _statCard('stat-blue', _statIcons.usuarios, activos, t('usuarios'), '_dashNav(&#39;usuarios&#39;)') +
            _statCard('stat-cyan', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>', numSocios, t('socios'), '_dashNav(&#39;usuarios&#39;,&#39;socios&#39;)') +
            _statCard('stat-gold', _statIcons.noticias, noticias.length, t('noticias'), '_dashNav(&#39;noticias&#39;)') +
            _statCard('stat-red', _statIcons.bolos, proxBol, t('proximos_bolos'), '_dashNav(&#39;bolos&#39;,&#39;proximos&#39;)') +
            _statCard('stat-magenta', _statIcons.check, pastBol, t('bolos_realizados'), '_dashNav(&#39;bolos&#39;,&#39;realizados&#39;)') +
            _statCard('stat-green', _statIcons.ensaios, proxEns, t('ensaios'), '_dashNav(&#39;ensaios&#39;)');

        // Store in AppState so confirm modals can find the event
        AppState.ensaios = ensaios;
        AppState.bolos = bolos;

        // Next ensaio & next bolo with attendance
        _renderDashboardNextEnsaio(ensaios);
        _renderDashboardNextBolo(bolos);
        // Mini calendar
        _renderDashboardCalendar(ensaios, bolos, noticias, votacions);
        // Timeline
        _renderDashboardTimeline(ensaios, bolos);
        // Activity (mixed: noticias + bolos + ensaios)
        _renderDashboardActivity(noticias, bolos, ensaios);
        // Quick actions
        _renderDashboardActions();

    } catch(e) { /* ignore */ }
}

function _dashNav(section, filter) {
    AppState.dashboardFilter = filter || null;
    Router.navigate(section);
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
                // Click always works (needed for mobile/touch)
                _showCalendarDayPopup(date, events);
            },
            onDayHover: function(date, events, cell) {
                // Hover only on desktop (non-touch)
                if ('ontouchstart' in window) return;
                _showCalendarDayPopup(date, events);
            }
        });
    }
    var cc = _calColors();
    var isSocio = AppState.isSocio();
    var events = [];

    // Ensaios — todos
    (ensaios || []).forEach(function(e) {
        if (e.estado !== 'cancelado') {
            events.push({ date: e.data, title: t('ensaio') + (e.lugar ? ' — ' + e.lugar : ''), color: cc.ensaios, type: 'ensaio', id: e.id, hora: e.hora_inicio || '' });
        }
    });

    // Bolos — usuarios solo ven públicos
    (bolos || []).forEach(function(b) {
        if (isSocio || b.publica) {
            events.push({ date: b.data, title: b.titulo, color: cc.bolos, type: 'bolo', id: b.id, hora: b.hora || '' });
        }
    });

    // Noticias — todos
    (noticias || []).forEach(function(n) {
        if (n.data) {
            events.push({ date: n.data, title: n.titulo, color: cc.noticias, type: 'noticia', id: n.id });
        }
    });

    // Votacións — socio-only
    if (isSocio) {
        (votacions || []).forEach(function(v) {
            var inicio = (v.creado || '').substring(0, 10);
            if (inicio) {
                events.push({ date: inicio, title: t('votacion') + ': ' + v.titulo, color: cc.votacions, type: 'votacion', id: v.id, label: t('cal_inicio') });
            }
            if (v.data_limite) {
                events.push({ date: v.data_limite, title: t('votacion') + ': ' + v.titulo, color: cc.votacions, type: 'votacion', id: v.id, label: t('cal_peche') });
            }
        });
    }
    _dashboardCal.setEvents(events);

    // Legend — solo items visibles para este rol
    var legendItems = '';
    legendItems += '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + cc.ensaios + '"></span>' + t('ensaios') + '</span>';
    legendItems += '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + cc.bolos + '"></span>' + t('bolos') + '</span>';
    legendItems += '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + cc.noticias + '"></span>' + t('noticias') + '</span>';
    if (isSocio) legendItems += '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + cc.votacions + '"></span>' + t('votacions') + '</span>';
    _dashboardCal._legendHtml = '<div class="cal-legend" id="dashboard-cal-legend">' + legendItems + '</div>';

    _dashboardCal.render();
}

var _calPopupOutsideHandler = null;
var _calPopupHoverTimeout = null;
var _calPopupCurrentCell = null;

function _closeCalendarPopup() {
    var p = document.querySelector('.cal-day-popup');
    if (p) p.remove();
    if (_calPopupOutsideHandler) {
        document.removeEventListener('click', _calPopupOutsideHandler);
        _calPopupOutsideHandler = null;
    }
    if (_calPopupHoverTimeout) {
        clearTimeout(_calPopupHoverTimeout);
        _calPopupHoverTimeout = null;
    }
    _calPopupCurrentCell = null;
}

function _showCalendarDayPopup(date, events) {
    // If same cell already has popup open, skip
    var cell = document.querySelector('.calendar-cell[data-date="' + date + '"]');
    if (!cell) return;
    if (_calPopupCurrentCell === cell && document.querySelector('.cal-day-popup')) return;

    // Always clean up previous popup and listener
    _closeCalendarPopup();

    if (!events || events.length === 0) return;

    _calPopupCurrentCell = cell;

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
            html += '<button class="btn btn-sm btn-primary cal-day-popup-btn" onclick="event.stopPropagation(); _closeCalendarPopup(); ensaiosSolicitarAsistencia(' + ev.id + ')">' + t('solicitar_asistir') + '</button>';
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

    // Hover close: when mouse leaves both cell and popup, close after delay
    var isTouch = 'ontouchstart' in window;
    if (!isTouch) {
        var scheduleClose = function() {
            _calPopupHoverTimeout = setTimeout(function() {
                _closeCalendarPopup();
            }, 200);
        };
        var cancelClose = function() {
            if (_calPopupHoverTimeout) {
                clearTimeout(_calPopupHoverTimeout);
                _calPopupHoverTimeout = null;
            }
        };
        cell.addEventListener('mouseleave', scheduleClose, { once: true });
        popup.addEventListener('mouseenter', cancelClose);
        popup.addEventListener('mouseleave', scheduleClose);
    }

    // Close popup when clicking outside (works for both touch and desktop)
    setTimeout(function() {
        _calPopupOutsideHandler = function(e) {
            var p = document.querySelector('.cal-day-popup');
            if (!p) {
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

function _buildInstrumentCount(asistentes, opts) {
    var detail = opts && opts.detail;
    var present = asistentes.filter(function(a) { return a.estado === 'confirmado' || a.estado === 'chegarei_tarde'; });
    if (present.length === 0) return '';
    var imgExts = { surdo:'jpg', caixa:'jpg', repinique:'jpg', tamborim:'jpg', timbao:'jpg', agogo:'jpg', ganza:'jpg', apito:'jpg', outro:'png' };

    // Determine relevant instruments from ALL attendees (including absent) — any principal (orde=1)
    var principalKeys = {};
    asistentes.forEach(function(a) {
        var insts = Array.isArray(a.instrumentos) ? a.instrumentos : [];
        if (insts.length > 0) {
            insts.forEach(function(inst) {
                var nome = (inst.nome || '').trim();
                if (!nome) return;
                if (parseInt(inst.orde) === 1) principalKeys[nome.toLowerCase()] = nome;
            });
        } else {
            var legacy = (a.instrumento || '').trim();
            if (legacy) principalKeys[legacy.toLowerCase()] = legacy;
        }
    });

    // Build per-person assignment from PRESENT attendees only
    var people = [];
    present.forEach(function(a) {
        var insts = [];
        if (Array.isArray(a.instrumentos) && a.instrumentos.length > 0) {
            a.instrumentos.forEach(function(inst) {
                var nome = (inst.nome || '').trim();
                if (!nome) return;
                insts.push({ key: nome.toLowerCase(), nome: nome, orde: parseInt(inst.orde) || 1 });
            });
            insts.sort(function(x, y) { return x.orde - y.orde; });
        } else {
            var legacy = (a.instrumento || '').trim();
            if (legacy) insts.push({ key: legacy.toLowerCase(), nome: legacy, orde: 1 });
        }
        if (insts.length === 0) return;
        people.push({
            id: a.usuario_id || a.id,
            nome: a.nome_completo || a.socio_nome || a.nome || a.username || '',
            principal: insts[0].key,
            assigned: insts[0].key,
            allInsts: insts,
            moved: false,
            movedFrom: null
        });
    });

    if (people.length === 0) return '';

    // Step 1: everyone starts on principal — only count instruments that someone uses as principal
    var counts = {};
    Object.keys(principalKeys).forEach(function(k) { counts[k] = 0; });
    people.forEach(function(p) { counts[p.assigned] = (counts[p.assigned] || 0) + 1; });

    // Step 2: greedy gap-filling — fill instruments at 0 from secondary/tertiary players
    var zeroKeys = Object.keys(counts).filter(function(k) { return counts[k] === 0; });
    var moves = [];
    zeroKeys.forEach(function(targetKey) {
        if (counts[targetKey] > 0) return; // already filled by prior move
        // Find candidates: not moved, have targetKey at orde>1, their current assigned has >1
        var candidates = people.filter(function(p) {
            if (p.moved) return false;
            if (counts[p.assigned] <= 1) return false;
            return p.allInsts.some(function(i) { return i.key === targetKey && i.orde > 1; });
        });
        if (candidates.length === 0) return;
        // Sort: lower orde for target first, then higher excess at origin
        candidates.sort(function(a, b) {
            var aOrde = a.allInsts.find(function(i) { return i.key === targetKey; }).orde;
            var bOrde = b.allInsts.find(function(i) { return i.key === targetKey; }).orde;
            if (aOrde !== bOrde) return aOrde - bOrde;
            return counts[b.assigned] - counts[a.assigned];
        });
        var best = candidates[0];
        var fromKey = best.assigned;
        counts[fromKey]--;
        counts[targetKey] = (counts[targetKey] || 0) + 1;
        best.assigned = targetKey;
        best.moved = true;
        best.movedFrom = fromKey;
        moves.push({ person: best, from: fromKey, to: targetKey });
    });

    // Uncovered instruments: still at 0
    var uncovered = Object.keys(counts).filter(function(k) { return counts[k] === 0; });

    // Build map: instKey → [person names] (for popup)
    var peopleByInst = {};
    people.forEach(function(p) {
        var k = p.assigned;
        if (!peopleByInst[k]) peopleByInst[k] = [];
        var label = p.nome;
        if (p.moved) label += ' (' + principalKeys[p.movedFrom] + ' →)';
        peopleByInst[k].push(label);
    });

    // Render
    var instImg = function(k) {
        var ext = imgExts[k] || null;
        return ext ? '<img src="assets/img/instrumentos/' + k + '.' + ext + '" alt="" class="dashboard-inst-img">' : '';
    };

    var chipHtml = function(k, cls) {
        var names = (peopleByInst[k] || []).join('||');
        var dataAttr = names ? ' data-inst-people="' + esc(names) + '" data-inst-nome="' + esc(principalKeys[k]) + '"' : '';
        var clickAttr = names ? ' onclick="_instChipPopup(event,this)"' : '';
        var clickCls = names ? ' inst-chip-clickable' : '';
        return '<span class="' + cls + clickCls + '"' + dataAttr + clickAttr + '>' + instImg(k) + esc(principalKeys[k]) + ' <strong>' + counts[k] + '</strong></span>';
    };

    // Sorted keys by count desc
    var sortedKeys = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; });

    if (!detail) {
        // === COMPACT VIEW (dashboard) ===
        var html = '<div class="dashboard-instruments">';
        html += '<div class="dashboard-inst-level-row">';
        sortedKeys.forEach(function(k) {
            var cls = 'dashboard-inst-chip';
            if (counts[k] === 0) cls += ' dashboard-inst-chip--zero';
            else if (moves.some(function(m) { return m.to === k; })) cls += ' dashboard-inst-chip--filled';
            html += chipHtml(k, cls);
        });
        html += '</div>';
        if (moves.length > 0) {
            html += '<div class="dashboard-inst-moves">' + esc(t('reasignacions').replace('{n}', moves.length)) + '</div>';
        }
        html += '</div>';
        return html;
    }

    // === DETAIL VIEW (modal ensaios/bolos) ===
    var html = '<div class="dashboard-instruments dashboard-instruments--detail">';

    // Chips summary
    html += '<div class="inst-alloc-summary">';
    sortedKeys.forEach(function(k) {
        var cls = 'dashboard-inst-chip';
        if (counts[k] === 0) cls += ' dashboard-inst-chip--zero';
        else if (moves.some(function(m) { return m.to === k; })) cls += ' dashboard-inst-chip--filled';
        html += chipHtml(k, cls);
    });
    html += '</div>';

    // Per-person table
    html += '<table class="inst-alloc-table"><tbody>';
    // Sort: moved people first, then by name
    var sorted = people.slice().sort(function(a, b) {
        if (a.moved && !b.moved) return -1;
        if (!a.moved && b.moved) return 1;
        return a.nome.localeCompare(b.nome);
    });
    sorted.forEach(function(p) {
        var rowCls = p.moved ? ' class="inst-alloc-moved"' : '';
        html += '<tr' + rowCls + '><td>' + esc(p.nome) + '</td><td>';
        html += instImg(p.assigned) + esc(principalKeys[p.assigned]);
        if (p.moved) {
            html += ' <span class="inst-alloc-badge">' + esc(principalKeys[p.movedFrom]) + ' → ' + esc(principalKeys[p.assigned]) + '</span>';
        }
        html += '</td></tr>';
    });
    html += '</tbody></table>';

    // Uncovered instruments
    if (uncovered.length > 0) {
        html += '<div class="inst-alloc-uncovered"><span class="inst-alloc-uncovered-label">' + esc(t('sen_cobertura')) + ':</span> ';
        uncovered.forEach(function(k) {
            html += '<span class="dashboard-inst-chip dashboard-inst-chip--zero">' + instImg(k) + esc(principalKeys[k]) + ' <strong>0</strong></span>';
        });
        html += '</div>';
    }

    if (moves.length > 0) {
        html += '<div class="dashboard-inst-moves">' + esc(t('reasignacions').replace('{n}', moves.length)) + '</div>';
    }

    html += '</div>';
    return html;
}

// Instrument chip popup — inline onclick calls this, close on outside click
function _instChipPopup(ev, chip) {
    ev.stopPropagation();
    ev.preventDefault();
    var existing = document.querySelector('.inst-chip-popup');
    if (existing) { existing.remove(); if (existing.parentElement === chip) return; }
    var raw = chip.getAttribute('data-inst-people');
    var nome = chip.getAttribute('data-inst-nome') || '';
    if (!raw) return;
    var names = raw.split('||');
    var popup = document.createElement('div');
    popup.className = 'inst-chip-popup';
    popup.innerHTML = '<strong>' + esc(nome) + '</strong><ul>' + names.map(function(n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>';
    chip.style.position = 'relative';
    chip.appendChild(popup);
}
document.addEventListener('click', function() {
    var p = document.querySelector('.inst-chip-popup');
    if (p) p.remove();
});

var _whatsappSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

async function _renderDashboardNextEnsaio(ensaios) {
    var bodyEl = document.getElementById('dashboard-next-ensaio-body');
    if (!bodyEl) return;

    var todayStr = today();
    var next = (ensaios || []).filter(function(e) {
        return e.data >= todayStr && e.estado === 'programado';
    }).sort(function(a, b) { return a.data.localeCompare(b.data); })[0];

    if (!next) {
        bodyEl.innerHTML = '<p class="text-muted text-sm">' + t('sen_proximos') + '</p>';
        bodyEl.style.cursor = '';
        bodyEl.onclick = null;
        return;
    }

    bodyEl.style.cursor = '';
    bodyEl.onclick = null;

    var html = '<div class="dashboard-next-event">' +
        '<div class="dashboard-next-date">' + formatDate(next.data) + '</div>' +
        '<div class="dashboard-next-meta">' +
            (next.hora_inicio ? '<span>' + esc(next.hora_inicio) + (next.hora_fin ? ' - ' + esc(next.hora_fin) : '') + '</span>' : '') +
            (next.lugar ? '<span>' + esc(next.lugar) + '</span>' : '') +
        '</div>' +
    '</div>';

    bodyEl.innerHTML = html + '<p class="text-muted text-sm">' + t('cargando') + '</p>';

    try {
        var asist = await api('/asistencia/' + next.id);
        if (!Array.isArray(asist)) asist = asist.asistencia || [];
        var confirmados = asist.filter(function(a) { return a.estado === 'confirmado'; });
        var tardes = asist.filter(function(a) { return a.estado === 'chegarei_tarde'; });
        var ausentes = asist.filter(function(a) { return a.estado === 'ausente'; });

        var listHtml = '';
        if (confirmados.length > 0) {
            listHtml += '<div class="dashboard-asist-group"><span class="badge badge-success">' + t('confirmo') + ' (' + confirmados.length + ')</span>';
            listHtml += '<div class="dashboard-asist-names">' + confirmados.map(function(a) { return esc(a.socio_nome || ''); }).join(', ') + '</div></div>';
        }
        if (tardes.length > 0) {
            listHtml += '<div class="dashboard-asist-group"><span class="badge badge-warning">' + t('chegarei_tarde') + ' (' + tardes.length + ')</span>';
            listHtml += '<div class="dashboard-asist-names">' + tardes.map(function(a) { return esc(a.socio_nome || ''); }).join(', ') + '</div></div>';
        }
        if (ausentes.length > 0) {
            listHtml += '<div class="dashboard-asist-group"><span class="badge badge-danger">' + t('non_podo') + ' (' + ausentes.length + ')</span>';
            listHtml += '<div class="dashboard-asist-names">' + ausentes.map(function(a) { return esc(a.socio_nome || ''); }).join(', ') + '</div></div>';
        }
        if (!listHtml) {
            listHtml = '<p class="text-muted text-sm">' + t('ninguen_confirmou') + '</p>';
        }
        listHtml += _buildInstrumentCount(asist);
        listHtml += '<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">' +
            '<button class="btn btn-sm btn-primary" onclick="ensaiosConfirmModal(' + next.id + ')">' + t('confirmar_asistencia_link') + '</button>' +
            '<button class="btn-icon btn-whatsapp" onclick="ensaiosShareWhatsapp(' + next.id + ')" title="' + t('compartir_whatsapp') + '">' + _whatsappSvg + '</button>' +
            '</div>';
        bodyEl.innerHTML = html + listHtml;
    } catch (e) {
        bodyEl.innerHTML = html;
    }
}

async function _renderDashboardNextBolo(bolos) {
    var bodyEl = document.getElementById('dashboard-next-bolo-body');
    if (!bodyEl) return;

    var todayStr = today();
    var next = (bolos || []).filter(function(b) {
        return b.data >= todayStr && b.estado !== 'cancelado';
    }).sort(function(a, b) { return a.data.localeCompare(b.data); })[0];

    if (!next) {
        bodyEl.innerHTML = '<p class="text-muted text-sm">' + t('sen_proximos') + '</p>';
        bodyEl.style.cursor = '';
        bodyEl.onclick = null;
        return;
    }

    bodyEl.style.cursor = '';
    bodyEl.onclick = null;

    var html = '<div class="dashboard-next-event">' +
        '<div class="dashboard-next-title">' + esc(next.titulo) + '</div>' +
        '<div class="dashboard-next-date">' + formatDate(next.data) + '</div>' +
        '<div class="dashboard-next-meta">' +
            (next.hora ? '<span>' + esc(next.hora) + '</span>' : '') +
            (next.lugar ? '<span>' + esc(next.lugar) + '</span>' : '') +
        '</div>' +
    '</div>';

    bodyEl.innerHTML = html + '<p class="text-muted text-sm">' + t('cargando') + '</p>';

    try {
        var asist = await api('/bolos/asistencia/' + next.id);
        var confirmados = asist.filter(function(a) { return a.estado === 'confirmado'; });
        var nonPodo = asist.filter(function(a) { return a.estado === 'non_podo'; });

        var listHtml = '';
        if (confirmados.length > 0) {
            listHtml += '<div class="dashboard-asist-group"><span class="badge badge-success">' + t('confirmo') + ' (' + confirmados.length + ')</span>';
            listHtml += '<div class="dashboard-asist-names">' + confirmados.map(function(a) { return esc(a.nome_completo || ''); }).join(', ') + '</div></div>';
        }
        if (nonPodo.length > 0) {
            listHtml += '<div class="dashboard-asist-group"><span class="badge badge-danger">' + t('non_podo') + ' (' + nonPodo.length + ')</span>';
            listHtml += '<div class="dashboard-asist-names">' + nonPodo.map(function(a) { return esc(a.nome_completo || ''); }).join(', ') + '</div></div>';
        }
        if (!listHtml) {
            listHtml = '<p class="text-muted text-sm">' + t('ninguen_confirmou') + '</p>';
        }
        listHtml += _buildInstrumentCount(asist);
        listHtml += '<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">' +
            '<button class="btn btn-sm btn-primary" onclick="bolosConfirmModal(' + next.id + ')">' + t('confirmar_asistencia_link') + '</button>' +
            '<button class="btn-icon btn-whatsapp" onclick="bolosShareWhatsapp(' + next.id + ')" title="' + t('compartir_whatsapp') + '">' + _whatsappSvg + '</button>' +
            '</div>';
        bodyEl.innerHTML = html + listHtml;
    } catch (e) {
        bodyEl.innerHTML = html;
    }
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
    var isSocio = AppState.isSocio();
    (bolos || []).forEach(function(b) {
        if (b.data >= todayStr && b.estado !== 'cancelado' && (isSocio || b.publica)) {
            items.push({ data: b.data, title: b.titulo, meta: (b.hora || '') + ' ' + (b.lugar || ''), type: 'bolo' });
        }
    });

    items.sort(function(a, b) { return a.data.localeCompare(b.data); });
    items = items.slice(0, 6);

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
        var route = item.type === 'bolo' ? 'bolos' : 'ensaios';
        html += '<div class="dashboard-timeline-item" onclick="Router.navigate(\'' + route + '\')">' +
            '<div class="timeline-date timeline-' + item.type + '"><div class="day">' + day + '</div><div class="month">' + month + '</div></div>' +
            '<div class="timeline-info"><div class="title">' + esc(item.title) + '</div><div class="meta">' + esc(item.meta) + '</div></div>' +
            '<span class="badge badge-' + (item.type === 'bolo' ? 'warning' : 'primary') + '">' + t(item.type === 'bolo' ? 'bolo' : 'ensaio') + '</span>' +
        '</div>';
    });
    listEl.innerHTML = html;
}

function _renderDashboardActivity(noticias, bolos, ensaios) {
    var listEl = document.getElementById('dashboard-activity-list');
    if (!listEl) return;

    var _actIcons = {
        noticia: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        bolo: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        ensaio: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    };

    var items = [];
    (noticias || []).forEach(function(n) {
        items.push({ text: t('nova_noticia') + ': ' + (n.titulo || ''), date: n.data || n.creado, type: 'noticia', route: 'noticias' });
    });
    (bolos || []).forEach(function(b) {
        items.push({ text: t('novo_bolo') + ': ' + (b.titulo || ''), date: b.creado || b.data, type: 'bolo', route: 'bolos' });
    });
    (ensaios || []).forEach(function(e) {
        if (e.estado === 'programado') {
            items.push({ text: t('ensaio') + ': ' + (e.lugar || e.data || ''), date: e.creado || e.data, type: 'ensaio', route: 'ensaios' });
        }
    });
    items.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
    items = items.slice(0, 6);

    if (items.length === 0) {
        listEl.innerHTML = '<p class="text-muted text-sm">' + t('sen_resultados') + '</p>';
        return;
    }

    var html = '';
    items.forEach(function(item) {
        html += '<div class="dashboard-activity-item" onclick="Router.navigate(\'' + item.route + '\')">' +
            '<span class="activity-icon activity-' + item.type + '">' + (_actIcons[item.type] || '') + '</span>' +
            '<span class="activity-text">' + esc(truncate(item.text, 50)) + '</span>' +
            '<span class="activity-date">' + formatDate(item.date) + '</span>' +
        '</div>';
    });
    listEl.innerHTML = html;
}

function _renderDashboardActions() {
    var listEl = document.getElementById('dashboard-actions-list');
    if (!listEl || !AppState.isSocio()) return;

    var _actionIcons = {
        noticias:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        bolos:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        ensaios:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        galeria:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        propostas:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
        votacions:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        actas:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
        documentos: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
    };
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
        var icon = _actionIcons[a.section] || '';
        html += '<button class="btn btn-sm" style="background:' + a.color + ';color:#fff;border:none" ' +
            'onclick="Router.navigate(\'' + a.section + '\');setTimeout(' + a.fn + ',200)">' + icon + ' ' + t(a.key) + '</button>';
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
            '<label>' + t('meus_instrumentos') + '</label>' +
            '<div id="perfil-instruments-list" class="profile-instruments-list"></div>' +
            '<div class="instrument-add-row">' +
                '<select class="form-control" id="perfil-instrument-add"><option value="">—</option></select>' +
                '<button type="button" class="btn btn-sm btn-secondary" onclick="_profileAddInstrument()">+</button>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('foto_perfil') + '</label>' +
            '<input type="file" class="form-control" id="perfil-foto" accept="image/*">' +
        '</div>' +
        '<hr style="border-color:var(--border);margin:12px 0">' +
        '<div class="form-group" style="display:flex;align-items:center;justify-content:space-between">' +
            '<label style="margin:0">' + t('suscribir_newsletter') + '</label>' +
            '<label class="toggle-switch"><input type="checkbox" id="perfil-newsletter"><span class="toggle-slider"></span></label>' +
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

    // Populate multi-instrument list
    window._profileInstruments = (u.instrumentos || []).map(function(i) {
        return { instrumento_id: parseInt(i.instrumento_id), nome: i.nome, orde: parseInt(i.orde) };
    });
    window._allInstruments = [];
    api('/instrumentos').then(function(list) {
        window._allInstruments = list || [];
        _profileRenderInstruments();
    }).catch(function() {});

    // Load newsletter subscription status
    var nlCheckbox = document.getElementById('perfil-newsletter');
    if (nlCheckbox) {
        api('/newsletter/me').then(function(res) {
            nlCheckbox.checked = res.suscrito;
        }).catch(function() {});
        nlCheckbox.addEventListener('change', function() {
            var checked = nlCheckbox.checked;
            api('/newsletter/me', { method: 'PUT', body: { activo: checked } }).then(function() {
                toast(checked ? t('newsletter_activada') : t('newsletter_desactivada'), 'success');
            }).catch(function(e) {
                nlCheckbox.checked = !checked;
                toast(t('erro') + ': ' + e.message, 'error');
            });
        });
    }
}

function _profileRenderInstruments() {
    var listEl = document.getElementById('perfil-instruments-list');
    if (!listEl) return;
    var items = window._profileInstruments || [];
    var imgExts = { surdo:'jpg', caixa:'jpg', repinique:'jpg', tamborim:'jpg', timbao:'jpg', agogo:'jpg', ganza:'jpg', apito:'jpg', outro:'png' };
    var html = '';
    items.sort(function(a, b) { return a.orde - b.orde; });
    items.forEach(function(item, idx) {
        var key = (item.nome || '').toLowerCase();
        var ext = imgExts[key] || null;
        var img = ext ? '<img src="assets/img/instrumentos/' + key + '.' + ext + '" class="instrument-img">' : '';
        html += '<div class="instrument-item" data-idx="' + idx + '">' +
            '<span class="instrument-orde">' + item.orde + '</span>' +
            img +
            '<span class="instrument-nome">' + esc(item.nome) + '</span>' +
            (idx > 0 ? '<button type="button" class="btn-icon" onclick="_profileMoveInstrument(' + idx + ',-1)" title="Subir">&uarr;</button>' : '<span style="width:22px"></span>') +
            (idx < items.length - 1 ? '<button type="button" class="btn-icon" onclick="_profileMoveInstrument(' + idx + ',1)" title="Baixar">&darr;</button>' : '<span style="width:22px"></span>') +
            '<button type="button" class="btn-icon" onclick="_profileRemoveInstrument(' + idx + ')" title="' + t('eliminar') + '">&times;</button>' +
        '</div>';
    });
    listEl.innerHTML = html;

    // Update add-select to exclude already selected
    var sel = document.getElementById('perfil-instrument-add');
    if (!sel) return;
    var selectedIds = items.map(function(i) { return parseInt(i.instrumento_id); });
    sel.innerHTML = '<option value="">— ' + t('engadir_instrumento') + ' —</option>';
    (window._allInstruments || []).forEach(function(inst) {
        if (selectedIds.indexOf(parseInt(inst.id)) >= 0) return;
        var opt = document.createElement('option');
        opt.value = inst.id;
        opt.textContent = inst.nome;
        sel.appendChild(opt);
    });
}

function _profileAddInstrument() {
    var sel = document.getElementById('perfil-instrument-add');
    if (!sel || !sel.value) return;
    var instId = parseInt(sel.value);
    var inst = (window._allInstruments || []).find(function(i) { return parseInt(i.id) === instId; });
    if (!inst) return;
    var items = window._profileInstruments || [];
    var maxOrde = items.length > 0 ? Math.max.apply(null, items.map(function(i) { return i.orde; })) : 0;
    items.push({ instrumento_id: instId, nome: inst.nome, orde: maxOrde + 1 });
    window._profileInstruments = items;
    _profileRenderInstruments();
}

function _profileMoveInstrument(idx, dir) {
    var items = window._profileInstruments || [];
    var newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    var tmp = items[idx];
    items[idx] = items[newIdx];
    items[newIdx] = tmp;
    // Recalculate orde
    items.forEach(function(item, i) { item.orde = i + 1; });
    window._profileInstruments = items;
    _profileRenderInstruments();
}

function _profileRemoveInstrument(idx) {
    var items = window._profileInstruments || [];
    items.splice(idx, 1);
    items.forEach(function(item, i) { item.orde = i + 1; });
    window._profileInstruments = items;
    _profileRenderInstruments();
}

async function saveProfile() {
    var body = {
        nome_completo: ($('#perfil-nome') || {}).value || '',
        email: ($('#perfil-email') || {}).value || '',
        telefono: ($('#perfil-telefono') || {}).value || '',
        instrumentos: (window._profileInstruments || []).map(function(i) {
            return { instrumento_id: i.instrumento_id, orde: i.orde };
        }),
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
        var _h = new Date().getHours();
        var _g = _h < 13 ? t('bo_dia') : (_h < 20 ? t('boas_tardes') : t('boas_noites'));
        document.getElementById('welcome-msg').textContent =
            (_g || t('benvido')) + ', ' + (updated.nome_completo || updated.username) + '!';

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

    // Render LOPD label with link in register box
    var regLopdLabel = document.getElementById('app-reg-lopd-label');
    if (regLopdLabel) {
        regLopdLabel.innerHTML = t('lopd_checkbox_link').replace('{link}', '<a href="index.html#privacidade" target="_blank">' + t('lopd_ver_privacidade') + '</a>');
    }

    if (AppState.loadSession()) {
        initApp();
    }
})();
