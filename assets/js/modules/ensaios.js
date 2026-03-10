/**
 * Ensaios — Rehearsals module
 */
var _ensaiosView = 'list';
var _ensaiosAsistencia = {};

var _ensaiosPager = new Paginator('ensaios-pagination', { perPage: 12, onChange: function() { ensaiosRender(); } });
var _ensaiosCalendar = new CalendarWidget('ensaios-calendar', {
    onDayClick: function(date, events) {
        if (events.length > 0) {
            _showDayPopup(date, events);
            _ensaiosRenderInstrumentCount(events[0].id);
        } else if (AppState.isSocio()) {
            ensaiosModal();
            setTimeout(function() { var d = $('#ensaio-data'); if (d) d.value = date; }, 50);
        }
    },
    onEventClick: function(id) {
        var e = (AppState.ensaios || []).find(function(x) { return x.id == id; });
        if (!e) return;
        _showDayPopup(e.data, _ensaiosCalendar._eventsForDay(e.data));
        _ensaiosRenderInstrumentCount(id);
    }
});

function _showDayPopup(date, events) {
    $('#modal-title').textContent = formatDate(date);
    var isSocio = AppState.isSocio();
    var html = '';

    events.forEach(function(ev) {
        var ensaio = (AppState.ensaios || []).find(function(x) { return x.id == ev.id; });
        var estado = ensaio ? ensaio.estado : '';

        html += '<div class="ensaio-popup-item">' +
            '<div class="ensaio-popup-info" style="border-left:3px solid ' + (ev.color || 'var(--primary)') + '">' +
                '<strong>' + esc(ev.title) + '</strong>' +
                (ev.time ? '<br><span style="color:var(--text-dim);font-size:0.85rem">' + esc(ev.time) + '</span>' : '') +
                (estado ? ' ' + _ensaioEstadoBadge(estado) : '') +
            '</div>' +
            '<div class="ensaio-popup-actions">' +
                (ensaio && isSocio ? '<button class="btn btn-sm btn-secondary" onclick="hideModal(\'modal-overlay\');ensaiosAsistencia(' + ev.id + ')">' + t('asistencia') + '</button>' : '') +
                (ensaio ? '<button class="btn btn-sm btn-success" onclick="ensaiosAsistenciaRapida(' + ev.id + ',\'confirmado\')">' + t('confirmo') + '</button>' : '') +
                (ensaio ? '<button class="btn btn-sm btn-danger" onclick="ensaiosAsistenciaRapida(' + ev.id + ',\'ausente\')">' + t('non_podo') + '</button>' : '') +
                (ensaio && isSocio ? '<button class="btn-icon" onclick="hideModal(\'modal-overlay\');ensaiosModal(AppState.ensaios.find(function(x){return x.id==' + ev.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' : '') +
                (ensaio && isSocio ? '<button class="btn-icon btn-danger" onclick="hideModal(\'modal-overlay\');ensaiosDelete(' + ev.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>' : '') +
            '</div>' +
        '</div>';
    });

    $('#modal-body').innerHTML = html;
    $('#modal-footer').innerHTML =
        (isSocio ? '<button class="btn btn-primary" onclick="hideModal(\'modal-overlay\');ensaiosModal();setTimeout(function(){var d=$(\'#ensaio-data\');if(d)d.value=\'' + date + '\';},50)">+ ' + t('novo_ensaio') + '</button> ' : '') +
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('voltar') + '</button>';
    showModal('modal-overlay');
}

/* ---- Quick attendance from calendar popup (Mejora 5) ---- */
function ensaiosAsistenciaRapida(id, estado) {
    api('/asistencia', { method: 'POST', body: { ensaio_id: id, socio_id: AppState.user.id, estado: estado } })
        .then(function() {
            hideModal('modal-overlay');
            toast(t('exito'), 'success');
        })
        .catch(function(e) {
            toast(e.message || 'Error', 'error');
        });
}

function ensaiosSolicitarAsistencia(id) {
    var ensaio = (AppState.ensaios || []).find(function(x) { return x.id == id; });
    if (!ensaio) return;

    var detail = '<strong>' + formatDate(ensaio.data) + '</strong>';
    if (ensaio.hora_inicio) detail += ' &mdash; ' + esc(ensaio.hora_inicio) + (ensaio.hora_fin ? ' - ' + esc(ensaio.hora_fin) : '');
    if (ensaio.lugar) detail += '<br>' + esc(ensaio.lugar);

    $('#modal-title').textContent = t('solicitar_asistir');
    $('#modal-body').innerHTML =
        '<p>' + t('confirmar_solicitar_asistencia') + '</p>' +
        '<div style="padding:12px;background:var(--bg-surface-2);border-radius:var(--radius);margin-top:8px">' + detail + '</div>';
    $('#modal-footer').innerHTML =
        '<button class="btn btn-primary" id="btn-confirmar-solicitude">' + t('enviar') + '</button> ' +
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>';
    showModal('modal-overlay');

    $('#btn-confirmar-solicitude').onclick = function() {
        this.disabled = true;
        this.textContent = '...';
        api('/asistencia/solicitar', { method: 'POST', body: { ensaio_id: id } })
            .then(function() {
                hideModal('modal-overlay');
                toast(t('solicitude_asistencia_enviada'), 'success');
            })
            .catch(function(e) {
                hideModal('modal-overlay');
                toast(e.message || 'Error', 'error');
            });
    };
}

function ensaiosSetView(view) {
    _ensaiosView = view;
    var btns = $$('#ensaios-view-toggle button');
    btns.forEach(function(b, i) { b.classList.toggle('active', (i === 0 && view === 'list') || (i === 1 && view === 'calendar') || (i === 2 && view === 'notas')); });
    $('#ensaios-grid').style.display = view === 'list' ? '' : 'none';
    var paginationEl = $('#ensaios-pagination');
    if (paginationEl) paginationEl.style.display = view === 'list' ? '' : 'none';
    var filtersEl = $('#ensaios-filters');
    if (filtersEl) filtersEl.style.display = view === 'list' ? '' : 'none';
    $('#ensaios-calendar').style.display = view === 'calendar' ? '' : 'none';
    var instCountEl = $('#ensaios-instrument-count');
    if (instCountEl) instCountEl.style.display = view === 'calendar' ? '' : 'none';
    $('#ensaios-notas-list').style.display = view === 'notas' ? '' : 'none';
    if (view === 'list') ensaiosRender();
    if (view === 'calendar') ensaiosRenderCalendar();
    if (view === 'notas') ensaiosRenderNotas();
}

function ensaiosRenderCalendar() {
    var cfgColor = ((AppState.config || {}).cal_cor_ensaios) || '#e3c300';
    var events = (AppState.ensaios || []).map(function(e) {
        var color = e.estado === 'cancelado' ? 'var(--danger)' : e.estado === 'realizado' ? 'var(--success)' : cfgColor;
        return { date: e.data, title: (e.hora_inicio || '') + ' ' + (e.lugar || ''), color: color, id: e.id, time: (e.hora_inicio || '') + '-' + (e.hora_fin || '') };
    });
    _ensaiosCalendar.setEvents(events);
    _ensaiosCalendar.render();
    _ensaiosRenderInstrumentCount();
}

async function _ensaiosRenderInstrumentCount(ensaioId) {
    var container = document.getElementById('ensaios-instrument-count');
    if (!container) return;
    container.style.display = 'none';

    var target = null;
    if (ensaioId) {
        target = (AppState.ensaios || []).find(function(e) { return e.id == ensaioId; });
    } else {
        // Default: next scheduled rehearsal
        var today = new Date().toISOString().slice(0, 10);
        var upcoming = (AppState.ensaios || []).filter(function(e) {
            return e.estado === 'programado' && e.data >= today;
        }).sort(function(a, b) { return (a.data + (a.hora_inicio || '')).localeCompare(b.data + (b.hora_inicio || '')); });
        if (upcoming.length > 0) target = upcoming[0];
    }

    if (!target) return;

    try {
        var asistentes = await api('/asistencia/' + target.id);
        var instHtml = _buildInstrumentCount(asistentes, { detail: false });
        if (!instHtml) return;
        var label = ensaioId ? formatDate(target.data) : t('proximo_ensaio') + ': ' + formatDate(target.data);
        container.innerHTML =
            '<div style="margin-top:var(--gap)">' +
                '<h3 style="font-size:1rem;margin-bottom:8px">' + esc(label) +
                    (target.lugar ? ' — ' + esc(target.lugar) : '') +
                    (target.hora_inicio ? ' · ' + esc(target.hora_inicio) : '') +
                '</h3>' +
                instHtml +
            '</div>';
        container.style.display = '';
    } catch (e) {
        // silently fail
    }
}

function ensaiosRenderNotas() {
    var container = $('#ensaios-notas-list');
    if (!container) return;

    var list = (AppState.ensaios || []).filter(function(e) {
        return e.notas && stripHtml(e.notas).trim();
    }).sort(function(a, b) { return (b.data || '').localeCompare(a.data || ''); });

    if (list.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">' + t('sen_resultados') + '</p>';
        return;
    }

    var html = '';
    list.forEach(function(e) {
        html += '<div class="ensaio-nota-entry" onclick="ensaiosViewNotas(' + e.id + ')">' +
            '<div class="ensaio-nota-header">' +
                '<div class="ensaio-nota-date">' + formatDate(e.data) + '</div>' +
                '<div class="ensaio-nota-meta">' +
                    esc(e.lugar || '') +
                    (e.hora_inicio ? ' &middot; ' + esc(e.hora_inicio) + ' - ' + esc(e.hora_fin || '') : '') +
                '</div>' +
                _ensaioEstadoBadge(e.estado) +
            '</div>' +
            '<div class="ensaio-nota-body rt-content">' + sanitizeHtml(e.notas) + '</div>' +
        '</div>';
    });

    container.innerHTML = html;
}

/* ---- Filters (Mejora 14) ---- */
function _ensaiosFilterChange() {
    _ensaiosPager.currentPage = 1;
    ensaiosRender();
}

function _ensaiosApplyFilters(list) {
    var searchEl = $('#ensaios-search');
    var estadoEl = $('#ensaios-estado-filter');
    var search = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var estado = estadoEl ? estadoEl.value : '';

    return list.filter(function(e) {
        if (estado && e.estado !== estado) return false;
        if (search) {
            var haystack = ((e.lugar || '') + ' ' + (e.data || '')).toLowerCase();
            if (haystack.indexOf(search) === -1) return false;
        }
        return true;
    });
}

async function ensaiosLoad() {
    try {
        var results = await Promise.all([
            api('/ensaios'),
            Object.keys(AppState.config || {}).length ? Promise.resolve(AppState.config) : api('/config').catch(function() { return {}; }),
            api('/asistencia/mi-asistencia').catch(function() { return {}; })
        ]);
        AppState.ensaios = results[0];
        AppState.config = results[1] || {};
        _ensaiosAsistencia = results[2] || {};
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.ensaios = AppState.ensaios || [];
    }

    // Deep link: #ensaios/ID → open confirm modal
    if (AppState.routeParam) {
        var targetId = parseInt(AppState.routeParam, 10);
        AppState.routeParam = null;
        if (targetId) {
            ensaiosSetView(_ensaiosView);
            ensaiosConfirmModal(targetId);
            return;
        }
    }

    // Usuario role: force calendar view only
    if (!AppState.isSocio() && _ensaiosView !== 'calendar') {
        ensaiosSetView('calendar');
        return;
    }
    // Bugfix A: Always go through ensaiosSetView so toggle buttons get .active
    ensaiosSetView(_ensaiosView);
}

function _ensaioEstadoBadge(estado) {
    switch (estado) {
        case 'programado': return '<span class="badge badge-primary">' + t('programado') + '</span>';
        case 'realizado':  return '<span class="badge badge-success">' + t('realizado') + '</span>';
        case 'cancelado':  return '<span class="badge badge-danger">' + t('cancelado') + '</span>';
        default:           return '<span class="badge">' + esc(estado || '') + '</span>';
    }
}

/* ---- Date box with i18n months (Mejora 12 + 13) ---- */
function _ensaioDateBox(dateStr) {
    var parts = (dateStr || '').split('-');
    var day = parts.length === 3 ? parts[2] : '';
    var monthNames = t('meses_curtos');
    if (!Array.isArray(monthNames)) monthNames = ['Xan','Feb','Mar','Abr','Mai','Xuñ','Xul','Ago','Set','Out','Nov','Dec'];
    var month = parts.length === 3 ? monthNames[parseInt(parts[1], 10) - 1] || '' : '';
    return '<div class="ensaio-date-box">' +
        '<div class="day">' + esc(day) + '</div>' +
        '<div class="month">' + esc(month) + '</div>' +
    '</div>';
}

/* ---- Card estado class helper (Mejora 3) ---- */
function _ensaioCardClass(estado) {
    switch (estado) {
        case 'programado': return ' ensaio-card-programado';
        case 'realizado':  return ' ensaio-card-realizado';
        case 'cancelado':  return ' ensaio-card-cancelado';
        default: return '';
    }
}

function ensaiosRender() {
    var grid = $('#ensaios-grid');
    if (!grid) return;

    var allList = AppState.ensaios || [];

    // Apply filters (Mejora 14)
    var list = _ensaiosApplyFilters(allList);

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        var pEl = $('#ensaios-pagination');
        if (pEl) pEl.innerHTML = '';
        return;
    }

    var isSocio = AppState.isSocio();

    // Separate: recurring groups vs single ensaios
    var groups = {};
    var singles = [];
    list.forEach(function(e) {
        if (e.grupo_recorrencia) {
            var g = e.grupo_recorrencia;
            if (!groups[g]) groups[g] = [];
            groups[g].push(e);
        } else {
            singles.push(e);
        }
    });

    // Sort each group by date
    Object.keys(groups).forEach(function(g) {
        groups[g].sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });
    });

    // Sort singles by date desc
    singles.sort(function(a, b) { return (b.data || '').localeCompare(a.data || ''); });

    // Build combined array for pagination: groups first, then singles
    var allCards = [];
    Object.keys(groups).forEach(function(g) { allCards.push({ type: 'group', key: g, items: groups[g] }); });
    singles.forEach(function(e) { allCards.push({ type: 'single', item: e }); });

    // Paginate
    var page = _ensaiosPager.slice(allCards);

    var html = '';
    var todayStr = today();

    page.forEach(function(card) {
        if (card.type === 'group') {
            var items = card.items;
            var first = items[0];
            var last = items[items.length - 1];
            var next = items.find(function(e) { return e.data >= todayStr; }) || last;
            var realizados = items.filter(function(e) { return e.estado === 'realizado'; }).length;
            var programados = items.filter(function(e) { return e.estado === 'programado'; }).length;
            var cancelados = items.filter(function(e) { return e.estado === 'cancelado'; }).length;
            // Color based on next ensaio estado
            var groupEstado = next.estado || 'programado';

            html += '<div class="card' + _ensaioCardClass(groupEstado) + '">' +
                '<div class="card-body" style="padding:16px">' +
                    '<div class="ensaio-card-layout">' +
                        '<div class="ensaio-recurrence-box">' +
                            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>' +
                        '</div>' +
                        '<div class="ensaio-card-info">' +
                            '<h3 style="font-size:1rem;margin:0">' + esc(first.lugar || t('ensaio')) + '</h3>' +
                            '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
                                '<span class="badge badge-info">' + t(first.recorrencia || 'semanal') + '</span>' +
                                '<span style="color:var(--text-dim);font-size:0.85rem">' + esc(first.hora_inicio || '') + ' - ' + esc(first.hora_fin || '') + '</span>' +
                            '</div>' +
                            '<div style="font-size:0.85rem;color:var(--text-dim)">' +
                                formatDate(first.data) + ' &rarr; ' + formatDate(last.data) +
                                ' &middot; ' + items.length + ' ' + t('sesions') +
                            '</div>' +
                            '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
                                (programados ? '<span class="badge badge-primary">' + programados + ' ' + t('programado') + '</span>' : '') +
                                (realizados ? '<span class="badge badge-success">' + realizados + ' ' + t('realizado') + '</span>' : '') +
                                (cancelados ? '<span class="badge badge-danger">' + cancelados + ' ' + t('cancelado') + '</span>' : '') +
                            '</div>' +
                            (first.notas ? '<div class="ensaio-notas-preview" onclick="event.stopPropagation();ensaiosViewNotas(' + first.id + ')">' + esc(truncate(stripHtml(first.notas), 150)) + '<span class="ensaio-notas-more">' + t('ver_mais') + '</span></div>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="card-actions">' +
                    '<button class="btn btn-sm btn-secondary" onclick="ensaiosExpandGroup(' + card.key + ')">' + t('ver_sesions') + '</button>' +
                    (isSocio
                        ? '<button class="btn-icon btn-whatsapp" onclick="ensaiosShareWhatsapp(' + next.id + ')" title="' + t('compartir_whatsapp') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>' +
                          '<button class="btn-icon" onclick="ensaiosModal(AppState.ensaios.find(function(x){return x.id==' + next.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
                          '<button class="btn-icon btn-danger" onclick="ensaiosDeleteGroup(' + card.key + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>'
                        : '') +
                '</div>' +
            '</div>';
        } else {
            var e = card.item;
            var eFuture = e.data >= todayStr;
            var eMyEstado = _ensaiosAsistencia[e.id] || null;
            html += '<div class="card' + _ensaioCardClass(e.estado) + '">' +
                '<div class="card-body" style="padding:16px">' +
                    '<div class="ensaio-card-layout">' +
                        _ensaioDateBox(e.data) +
                        '<div class="ensaio-card-info">' +
                            '<div style="font-size:0.9rem;font-weight:600">' + esc(e.lugar || '') + '</div>' +
                            '<div style="color:var(--text-dim);font-size:0.85rem">' + esc(e.hora_inicio || '') + ' - ' + esc(e.hora_fin || '') + '</div>' +
                            '<div>' + _ensaioEstadoBadge(e.estado) +
                                (eFuture && eMyEstado === 'confirmado' ? ' <span class="badge badge-success">' + t('confirmo') + '</span>' : '') +
                                (eFuture && eMyEstado === 'chegarei_tarde' ? ' <span class="badge badge-warning">' + t('chegarei_tarde') + '</span>' : '') +
                                (eFuture && eMyEstado === 'ausente' ? ' <span class="badge badge-danger">' + t('non_podo') + '</span>' : '') +
                            '</div>' +
                            (e.notas ? '<div class="ensaio-notas-preview" onclick="event.stopPropagation();ensaiosViewNotas(' + e.id + ')">' + esc(truncate(stripHtml(e.notas), 150)) + '<span class="ensaio-notas-more">' + t('ver_mais') + '</span></div>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="card-actions">' +
                    (eFuture
                        ? '<button class="btn-icon' + (eMyEstado === 'confirmado' ? ' btn-success' : '') + '" onclick="_ensaiosCardAsistencia(' + e.id + ',\'confirmado\')" title="' + t('confirmo') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>' +
                          '<button class="btn-icon' + (eMyEstado === 'chegarei_tarde' ? ' btn-warning' : '') + '" onclick="_ensaiosCardAsistencia(' + e.id + ',\'chegarei_tarde\')" title="' + t('chegarei_tarde') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></button>' +
                          '<button class="btn-icon' + (eMyEstado === 'ausente' ? ' btn-danger' : '') + '" onclick="_ensaiosCardAsistencia(' + e.id + ',\'ausente\')" title="' + t('non_podo') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
                        : '') +
                    '<button class="btn-icon" onclick="ensaiosInstrumentCount(' + e.id + ')" title="' + t('reconto_instrumentos') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></button>' +
                    (isSocio
                        ? '<button class="btn-icon btn-whatsapp" onclick="ensaiosShareWhatsapp(' + e.id + ')" title="' + t('compartir_whatsapp') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>' +
                          '<button class="btn btn-sm btn-secondary" onclick="ensaiosAsistencia(' + e.id + ')">' + t('asistencia') + '</button>' +
                          '<button class="btn-icon" onclick="ensaiosModal(AppState.ensaios.find(function(x){return x.id==' + e.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
                          '<button class="btn-icon btn-danger" onclick="ensaiosDelete(' + e.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>'
                        : '') +
                '</div>' +
            '</div>';
        }
    });

    grid.innerHTML = html;
    _ensaiosPager.render();
}

// Expand a recurring group — show all sessions in a modal
function ensaiosExpandGroup(grupo) {
    var items = (AppState.ensaios || []).filter(function(e) {
        return e.grupo_recorrencia == grupo;
    }).sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });

    if (!items.length) return;
    var isSocio = AppState.isSocio();
    var todayStr = today();

    $('#modal-title').textContent = esc(items[0].lugar || t('ensaio')) + ' — ' + t(items[0].recorrencia || 'semanal');

    var html = '<div class="table-wrap"><table><thead><tr>' +
        '<th>' + t('data') + '</th><th>' + t('horario') + '</th><th>' + t('estado') + '</th><th></th>' +
    '</tr></thead><tbody>';

    items.forEach(function(e) {
        var isPast = e.data < todayStr;
        var eMyEstado = _ensaiosAsistencia[e.id] || null;
        var estadoCol = _ensaioEstadoBadge(e.estado);
        if (!isPast && eMyEstado === 'confirmado') estadoCol += ' <span class="badge badge-success">' + t('confirmo') + '</span>';
        if (!isPast && eMyEstado === 'chegarei_tarde') estadoCol += ' <span class="badge badge-warning">' + t('chegarei_tarde') + '</span>';
        if (!isPast && eMyEstado === 'ausente') estadoCol += ' <span class="badge badge-danger">' + t('non_podo') + '</span>';
        html += '<tr style="' + (isPast ? 'opacity:0.5' : '') + '">' +
            '<td>' + formatDate(e.data) + '</td>' +
            '<td>' + esc(e.hora_inicio || '') + ' - ' + esc(e.hora_fin || '') + '</td>' +
            '<td>' + estadoCol + '</td>' +
            '<td style="text-align:right">' +
                (!isPast
                    ? '<button class="btn-icon' + (eMyEstado === 'confirmado' ? ' btn-success' : '') + '" onclick="_ensaiosGroupAsistencia(' + e.id + ',\'confirmado\',' + e.grupo_recorrencia + ')" title="' + t('confirmo') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>' +
                      '<button class="btn-icon' + (eMyEstado === 'chegarei_tarde' ? ' btn-warning' : '') + '" onclick="_ensaiosGroupAsistencia(' + e.id + ',\'chegarei_tarde\',' + e.grupo_recorrencia + ')" title="' + t('chegarei_tarde') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></button>' +
                      '<button class="btn-icon' + (eMyEstado === 'ausente' ? ' btn-danger' : '') + '" onclick="_ensaiosGroupAsistencia(' + e.id + ',\'ausente\',' + e.grupo_recorrencia + ')" title="' + t('non_podo') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
                    : '') +
                '<button class="btn-icon" onclick="ensaiosInstrumentCount(' + e.id + ')" title="' + t('reconto_instrumentos') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></button>' +
                (isSocio ? '<button class="btn-icon btn-whatsapp" onclick="ensaiosShareWhatsapp(' + e.id + ')" title="' + t('compartir_whatsapp') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>' : '') +
                (isSocio ? '<button class="btn btn-sm btn-secondary" onclick="hideModal(\'modal-overlay\');ensaiosAsistencia(' + e.id + ')">' + t('asistencia') + '</button>' : '') +
                (isSocio ? ' <button class="btn-icon" onclick="hideModal(\'modal-overlay\');ensaiosModal(AppState.ensaios.find(function(x){return x.id==' + e.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' : '') +
            '</td>' +
        '</tr>';
    });

    html += '</tbody></table></div>';
    $('#modal-body').innerHTML = html;
    $('#modal-footer').innerHTML = '<button class="btn btn-secondary" onclick="closeModal()">' + t('voltar') + '</button>';
    showModal('modal-overlay');
}

// View ensaio notes in detail modal
function ensaiosViewNotas(id) {
    var item = (AppState.ensaios || []).find(function(x) { return x.id === id; });
    if (!item || !item.notas) return;

    var title = (item.lugar || t('ensaio')) + ' — ' + formatDate(item.data);
    $('#modal-title').textContent = title;

    var html = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:var(--gap)">' +
            _ensaioEstadoBadge(item.estado) +
            '<span style="color:var(--text-dim);font-size:0.85rem">' +
                esc(item.hora_inicio || '') + ' - ' + esc(item.hora_fin || '') +
            '</span>' +
        '</div>' +
        '<div class="rt-content">' + sanitizeHtml(item.notas) + '</div>';

    $('#modal-body').innerHTML = html;

    var footerHtml = '';
    if (AppState.isSocio()) {
        footerHtml = '<button class="btn btn-primary" onclick="hideModal(\'modal-overlay\');ensaiosModal(AppState.ensaios.find(function(x){return x.id==' + id + '}))">' + t('editar') + '</button>';
    }
    $('#modal-footer').innerHTML = footerHtml;

    showModal('modal-overlay');
}

// Delete entire recurring group
async function ensaiosDeleteGroup(grupo) {
    var items = (AppState.ensaios || []).filter(function(e) {
        return e.grupo_recorrencia == grupo;
    });
    if (!items.length) return;
    if (!await confirmAction(t('confirmar_eliminar_grupo'), {danger:true})) return;
    try {
        var first = items.sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); })[0];
        await api('/ensaios/' + first.id + '?scope=future', { method: 'DELETE' });
        toast(t('exito'), 'success');
        ensaiosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

/* ---- Recurrence preview (Mejora 4) ---- */
function _updateRecurrenciaPreview() {
    var previewEl = $('#recorrencia-preview');
    if (!previewEl) return;

    var rec = ($('#ensaio-recorrencia') || {}).value || '';
    var startStr = ($('#ensaio-data') || {}).value || '';
    var finStr = ($('#ensaio-recorrencia-fin') || {}).value || '';

    if (!rec || !startStr || !finStr) {
        previewEl.innerHTML = '';
        return;
    }

    var start = new Date(startStr);
    var fin = new Date(finStr);
    if (isNaN(start.getTime()) || isNaN(fin.getTime()) || fin <= start) {
        previewEl.innerHTML = '';
        return;
    }

    var dates = [];
    var current = new Date(start);
    var max = 52;
    while (current <= fin && dates.length < max) {
        dates.push(new Date(current));
        if (rec === 'semanal') current.setDate(current.getDate() + 7);
        else if (rec === 'bisemanal') current.setDate(current.getDate() + 14);
        else if (rec === 'mensual') current.setMonth(current.getMonth() + 1);
        else break;
    }

    if (dates.length === 0) {
        previewEl.innerHTML = '';
        return;
    }

    var html = '<div class="recorrencia-preview">' +
        '<div style="margin-bottom:6px"><span class="badge badge-info">' + t('n_sesions_previstas').replace('{n}', dates.length) + '</span></div>';
    dates.forEach(function(d) {
        html += '<div class="recorrencia-preview-item">' + formatDate(d.toISOString().split('T')[0]) + '</div>';
    });
    html += '</div>';

    previewEl.innerHTML = html;
}

function ensaiosModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('ensaio') : t('novo_ensaio');

    $('#modal-title').textContent = title;

    var estadoOptions = ['programado', 'realizado', 'cancelado'].map(function(e) {
        var sel = (isEdit && item.estado === e) ? ' selected' : '';
        return '<option value="' + e + '"' + sel + '>' + t(e) + '</option>';
    }).join('');

    $('#modal-body').innerHTML =
        '<input type="hidden" id="ensaio-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('data') + '</label>' +
            '<input type="date" class="form-control" id="ensaio-data" value="' + esc(isEdit ? item.data || '' : today()) + '">' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('hora_inicio') + '</label>' +
                '<input type="time" class="form-control" id="ensaio-hora-inicio" value="' + esc(isEdit ? item.hora_inicio || '' : '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('hora_fin') + '</label>' +
                '<input type="time" class="form-control" id="ensaio-hora-fin" value="' + esc(isEdit ? item.hora_fin || '' : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('lugar') + '</label>' +
            '<input type="text" class="form-control" id="ensaio-lugar" value="' + esc(isEdit ? item.lugar || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('notas') + '</label>' +
            '<div class="rt-wrap" id="ensaio-notas-editor"></div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('estado') + '</label>' +
            '<select class="form-control" id="ensaio-estado">' + estadoOptions + '</select>' +
        '</div>' +
        '<hr style="border-color:var(--border);margin:12px 0">' +
        (isEdit && item.grupo_recorrencia ? (
        '<div style="padding:10px;background:var(--bg-surface-2);border-radius:var(--radius);margin-bottom:12px">' +
            '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">' +
                '<span class="badge badge-info">' + t(item.recorrencia || 'semanal') + '</span>' +
                '<span style="color:var(--text-dim);font-size:0.85rem">' + t('recorrencia') + '</span>' +
            '</div>' +
            '<div class="form-group" style="margin-bottom:0">' +
                '<label>' + t('data_fin_recorrencia') + '</label>' +
                '<input type="date" class="form-control" id="ensaio-recorrencia-fin" value="' + esc(item.recorrencia_fin || '') + '">' +
            '</div>' +
        '</div>'
        ) : !isEdit ? (
        '<div class="form-group">' +
            '<label>' + t('recorrencia') + '</label>' +
            '<select class="form-control" id="ensaio-recorrencia">' +
                '<option value="">' + t('sen_recorrencia') + '</option>' +
                '<option value="semanal">' + t('semanal') + '</option>' +
                '<option value="bisemanal">' + t('bisemanal') + '</option>' +
                '<option value="mensual">' + t('mensual') + '</option>' +
            '</select>' +
        '</div>' +
        '<div class="form-group" id="recorrencia-fin-group" style="display:none">' +
            '<label>' + t('data_fin_recorrencia') + '</label>' +
            '<input type="date" class="form-control" id="ensaio-recorrencia-fin">' +
        '</div>' +
        '<div id="recorrencia-preview"></div>'
        ) : '');

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="ensaiosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');

    initRichTextEditor('ensaio-notas-editor', isEdit ? item.notas || '' : '', { uploadDir: 'ensaios' });

    // Toggle recurrence end date visibility + auto-fill 6 months ahead + preview
    var recSel = $('#ensaio-recorrencia');
    if (recSel) {
        recSel.addEventListener('change', function() {
            var fg = $('#recorrencia-fin-group');
            if (fg) fg.style.display = recSel.value ? '' : 'none';
            if (recSel.value) {
                var finInput = $('#ensaio-recorrencia-fin');
                if (finInput && !finInput.value) {
                    var start = ($('#ensaio-data') || {}).value || today();
                    var d = new Date(start);
                    d.setMonth(d.getMonth() + 6);
                    finInput.value = d.toISOString().split('T')[0];
                }
            }
            _updateRecorrenciaPreview();
        });
    }
    // Update preview when date or end date changes
    var dataInput = $('#ensaio-data');
    var finInput = $('#ensaio-recorrencia-fin');
    if (dataInput) dataInput.addEventListener('change', _updateRecorrenciaPreview);
    if (finInput) finInput.addEventListener('change', _updateRecorrenciaPreview);
}

/* ---- Time validation + conflict check (Mejora 8) ---- */
function _ensaiosCheckTimeConflict(body, currentId) {
    var existing = (AppState.ensaios || []).filter(function(e) {
        if (currentId && e.id == currentId) return false;
        if (e.data !== body.data) return false;
        if (!e.lugar || !body.lugar) return false;
        if (e.lugar.toLowerCase() !== body.lugar.toLowerCase()) return false;
        // Check time overlap
        if (!e.hora_inicio || !body.hora_inicio) return false;
        var eStart = e.hora_inicio;
        var eEnd = e.hora_fin || '23:59';
        var bStart = body.hora_inicio;
        var bEnd = body.hora_fin || '23:59';
        return bStart < eEnd && bEnd > eStart;
    });
    return existing.length > 0;
}

async function ensaiosSave() {
    var id = ($('#ensaio-id') || {}).value;
    var isEdit = !!id;

    var body = {
        data: ($('#ensaio-data') || {}).value || today(),
        hora_inicio: ($('#ensaio-hora-inicio') || {}).value || '',
        hora_fin: ($('#ensaio-hora-fin') || {}).value || '',
        lugar: ($('#ensaio-lugar') || {}).value || '',
        notas: getRichTextContent('ensaio-notas-editor'),
        estado: ($('#ensaio-estado') || {}).value || 'programado'
    };

    // Mejora 8: Validate end time > start time
    if (body.hora_inicio && body.hora_fin && body.hora_fin <= body.hora_inicio) {
        toast(t('hora_fin_antes'), 'error');
        return;
    }

    // Mejora 8: Check for schedule conflicts
    if (_ensaiosCheckTimeConflict(body, id)) {
        if (!await confirmAction(t('conflicto_horario'))) return;
    }

    var recFinInput = $('#ensaio-recorrencia-fin');
    if (recFinInput && recFinInput.value) {
        if (!isEdit) {
            var rec = ($('#ensaio-recorrencia') || {}).value || '';
            if (rec) {
                body.recorrencia = rec;
                body.recorrencia_fin = recFinInput.value;
            }
        } else {
            body.recorrencia_fin = recFinInput.value;
        }
    }

    try {
        if (isEdit) {
            await api('/ensaios/' + id, { method: 'PUT', body: body });
        } else {
            await api('/ensaios', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        ensaiosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function ensaiosDelete(id) {
    var ensaio = (AppState.ensaios || []).find(function(x) { return x.id === id; });
    var scope = 'single';

    if (ensaio && ensaio.grupo_recorrencia) {
        var msg = t('solo_este') + ' / ' + t('este_e_futuros') + '?';
        var choice = await _showConfirmDialog(msg, { confirmText: t('este_e_futuros'), cancelText: t('solo_este') });
        if (choice === null) return;
        scope = choice ? 'future' : 'single';
    } else {
        if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    }

    try {
        await api('/ensaios/' + id + '?scope=' + scope, { method: 'DELETE' });
        toast(t('exito'), 'success');
        ensaiosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function ensaiosAsistencia(id) {
    $('#modal-title').textContent = t('asistencia');

    if (!AppState.usuarios || AppState.usuarios.length === 0) {
        try {
            AppState.usuarios = await api('/usuarios');
        } catch (e) {
            AppState.usuarios = [];
        }
    }

    var socios = (AppState.usuarios || []).filter(function(s) { return s.estado === 'Activo'; });

    var asistencia = [];
    try {
        asistencia = await api('/asistencia/' + id);
        if (!Array.isArray(asistencia)) asistencia = asistencia.asistencia || [];
    } catch (e) {
        asistencia = [];
    }

    var asistMap = {};
    asistencia.forEach(function(a) {
        asistMap[a.socio_id || a.username] = a.estado || '';
    });

    var html = '<div id="asistencia-ensaio-id" data-id="' + id + '"></div>';
    html += '<div class="table-wrap"><table><thead><tr>' +
        '<th>' + t('socio') + '</th><th>' + t('estado') + '</th>' +
    '</tr></thead><tbody>';

    socios.forEach(function(s) {
        var key = s.id || s.username;
        var current = asistMap[key] || asistMap[s.username] || '';

        var options = ['confirmado', 'ausente', 'xustificado'].map(function(e) {
            var sel = (current === e) ? ' selected' : '';
            return '<option value="' + e + '"' + sel + '>' + t(e) + '</option>';
        }).join('');

        html += '<tr>' +
            '<td>' + esc(s.nome_completo || s.username) + '</td>' +
            '<td><select class="form-control asist-select" data-socio="' + key + '"><option value="">--</option>' + options + '</select></td>' +
        '</tr>';
    });

    html += '</tbody></table></div>';

    $('#modal-body').innerHTML = html;
    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="_saveAsistencia()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function _saveAsistencia() {
    var ensaioIdEl = $('#asistencia-ensaio-id');
    if (!ensaioIdEl) return;
    var ensaioId = ensaioIdEl.dataset.id;

    var selects = $$('.asist-select');
    var entries = [];

    selects.forEach(function(sel) {
        if (sel.value) {
            entries.push({
                ensaio_id: parseInt(ensaioId),
                socio_id: sel.dataset.socio,
                estado: sel.value
            });
        }
    });

    try {
        for (var i = 0; i < entries.length; i++) {
            await api('/asistencia', { method: 'POST', body: entries[i] });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

/* ---- Attendance Summary ---- */
async function ensaiosAsistenciaResumo() {
    $('#modal-title').textContent = t('resumo_asistencia');

    try {
        var data = await api('/asistencia/resumo');

        var html = '<div class="table-wrap"><table><thead><tr>' +
            '<th>' + t('socio') + '</th><th>' + t('instrumento') + '</th>' +
            '<th>' + t('confirmado') + '</th><th>' + t('ausente') + '</th><th>' + t('xustificado') + '</th>' +
            '<th>' + t('porcentaxe') + '</th>' +
        '</tr></thead><tbody>';

        (data || []).forEach(function(s) {
            var total = (parseInt(s.confirmados) || 0) + (parseInt(s.ausentes) || 0) + (parseInt(s.xustificados) || 0);
            var pct = total > 0 ? Math.round((parseInt(s.confirmados) || 0) / total * 100) : 0;
            var pctClass = pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger';

            html += '<tr>' +
                '<td>' + esc(s.nome_completo || s.username) + '</td>' +
                '<td>' + esc(s.instrumento || '') + '</td>' +
                '<td>' + (s.confirmados || 0) + '</td>' +
                '<td>' + (s.ausentes || 0) + '</td>' +
                '<td>' + (s.xustificados || 0) + '</td>' +
                '<td><span class="badge ' + pctClass + '">' + pct + '%</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        $('#modal-body').innerHTML = html;
    } catch (e) {
        $('#modal-body').innerHTML = '<p class="text-center">' + t('erro') + ': ' + esc(e.message) + '</p>';
    }

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('voltar') + '</button>';
    showModal('modal-overlay');
}

/* ---- Card quick attendance + WhatsApp share + Confirm modal ---- */

async function _ensaiosGroupAsistencia(id, estado, grupo) {
    try {
        await api('/asistencia', { method: 'POST', body: { ensaio_id: id, socio_id: AppState.user.id, estado: estado } });
        _ensaiosAsistencia[id] = estado;
        toast(t('exito'), 'success');
        hideModal('modal-overlay');
        ensaiosExpandGroup(grupo);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function _ensaiosCardAsistencia(id, estado) {
    try {
        await api('/asistencia', { method: 'POST', body: { ensaio_id: id, socio_id: AppState.user.id, estado: estado } });
        _ensaiosAsistencia[id] = estado;
        toast(t('exito'), 'success');
        if (AppState.currentSection === 'dashboard') {
            _renderDashboardNextEnsaio(AppState.ensaios || []);
        } else {
            ensaiosRender();
        }
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function ensaiosShareWhatsapp(id) {
    var e = (AppState.ensaios || []).find(function(x) { return x.id == id; });
    if (!e) return;

    var asistentes = [];
    try {
        asistentes = await api('/asistencia/' + id);
        if (!Array.isArray(asistentes)) asistentes = asistentes.asistencia || [];
    } catch (err) { /* ignore */ }

    var confirmados = asistentes.filter(function(a) { return a.estado === 'confirmado'; });
    var tardes = asistentes.filter(function(a) { return a.estado === 'chegarei_tarde'; });
    var ausentes = asistentes.filter(function(a) { return a.estado === 'ausente'; });
    var nome = (AppState.config || {}).nome_asociacion || 'Levada Arraiana';

    var l = [];
    l.push('\uD83E\uDD41 *' + nome + ' \u2014 ' + t('ensaio') + '*');
    l.push('');
    l.push('\uD83D\uDCC5 ' + (e.data ? formatDate(e.data) : ''));
    if (e.hora_inicio) l.push('\uD83D\uDD52 ' + e.hora_inicio + (e.hora_fin ? ' a ' + e.hora_fin : ''));
    if (e.lugar) l.push('\uD83D\uDCCD ' + e.lugar);
    if (e.notas) {
        var notas = e.notas.replace(/<[^>]+>/g, '').trim();
        if (notas.length > 120) notas = notas.substring(0, 120) + '...';
        if (notas) { l.push(''); l.push('_' + notas + '_'); }
    }
    l.push('');
    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    if (confirmados.length > 0) {
        l.push('\u2705 *' + t('confirmados_bolo') + '* (' + confirmados.length + ')');
        confirmados.forEach(function(a) {
            var nome = a.socio_nome || a.nome_completo || '';
            var inst = a.instrumento ? ' \u2022 _' + a.instrumento + '_' : '';
            l.push('   ' + nome + inst);
        });
    }
    if (tardes.length > 0) {
        l.push('\uD83D\uDD51 *' + t('chegarei_tarde') + '* (' + tardes.length + ')');
        tardes.forEach(function(a) {
            l.push('   ' + (a.socio_nome || a.nome_completo || ''));
        });
    }
    if (ausentes.length > 0) {
        l.push('\u274C *' + t('non_podo') + '* (' + ausentes.length + ')');
        ausentes.forEach(function(a) {
            l.push('   ' + (a.socio_nome || a.nome_completo || ''));
        });
    }
    if (confirmados.length === 0 && tardes.length === 0 && ausentes.length === 0) {
        l.push(t('ninguen_confirmou'));
    }

    l.push('');
    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    var baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'app.html#ensaios/' + id;
    l.push('\uD83D\uDC49 *' + t('confirmar_asistencia_link') + ':*');
    l.push(baseUrl);

    var url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(l.join('\n'));
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function ensaiosConfirmModal(ensaioId) {
    var e = (AppState.ensaios || []).find(function(x) { return x.id == ensaioId; });
    if (!e) return;

    var asistentes = [];
    try {
        asistentes = await api('/asistencia/' + ensaioId);
        if (!Array.isArray(asistentes)) asistentes = asistentes.asistencia || [];
    } catch (err) { /* ignore */ }

    var confirmados = asistentes.filter(function(a) { return a.estado === 'confirmado'; });
    var ausentes = asistentes.filter(function(a) { return a.estado === 'ausente'; });
    var myEstado = _ensaiosAsistencia[ensaioId] || null;

    $('#modal-title').textContent = t('ensaio') + ' — ' + formatDate(e.data);

    var html = '';

    // Ensaio info
    html += '<div class="card-meta" style="margin-bottom:12px">';
    if (e.data) html += '<span>' + formatDate(e.data) + (e.hora_inicio ? ' ' + esc(e.hora_inicio) + (e.hora_fin ? ' - ' + esc(e.hora_fin) : '') : '') + '</span>';
    if (e.lugar) html += '<span>' + esc(e.lugar) + '</span>';
    html += '</div>';

    // My status
    if (myEstado) {
        var badgeClass = myEstado === 'confirmado' ? 'badge-success' : myEstado === 'chegarei_tarde' ? 'badge-warning' : 'badge-danger';
        var badgeText = myEstado === 'confirmado' ? t('confirmo') : myEstado === 'chegarei_tarde' ? t('chegarei_tarde') : t('non_podo');
        html += '<p style="margin-bottom:12px"><strong>' + t('o_teu_estado') + ':</strong> <span class="badge ' + badgeClass + '">' + badgeText + '</span></p>';
    }

    // Confirmed list
    html += '<h4 style="margin:12px 0 8px">' + t('confirmados_bolo') + ' (' + confirmados.length + ')</h4>';
    if (confirmados.length > 0) {
        html += '<ul style="list-style:none;padding:0;margin:0">';
        confirmados.forEach(function(a) {
            html += '<li style="padding:4px 0">' + esc(a.socio_nome || a.nome_completo || '') + '</li>';
        });
        html += '</ul>';
    } else {
        html += '<p class="text-muted">' + t('ninguen_confirmou') + '</p>';
    }

    // Late list
    var tardes = asistentes.filter(function(a) { return a.estado === 'chegarei_tarde'; });
    if (tardes.length > 0) {
        html += '<h4 style="margin:12px 0 8px">' + t('chegarei_tarde') + ' (' + tardes.length + ')</h4>';
        html += '<ul style="list-style:none;padding:0;margin:0">';
        tardes.forEach(function(a) {
            html += '<li style="padding:4px 0">' + esc(a.socio_nome || a.nome_completo || '') + '</li>';
        });
        html += '</ul>';
    }

    // Absent list
    if (ausentes.length > 0) {
        html += '<h4 style="margin:12px 0 8px">' + t('non_podo') + ' (' + ausentes.length + ')</h4>';
        html += '<ul style="list-style:none;padding:0;margin:0">';
        ausentes.forEach(function(a) {
            html += '<li style="padding:4px 0">' + esc(a.socio_nome || a.nome_completo || '') + '</li>';
        });
        html += '</ul>';
    }

    $('#modal-body').innerHTML = html;

    var isFuture = e.data >= today();
    $('#modal-footer').innerHTML =
        (isFuture ? '<button class="btn btn-success" onclick="_ensaiosCardAsistencia(' + ensaioId + ',\'confirmado\');hideModal(\'modal-overlay\')">' + t('confirmo') + '</button>' +
        '<button class="btn btn-warning" onclick="_ensaiosCardAsistencia(' + ensaioId + ',\'chegarei_tarde\');hideModal(\'modal-overlay\')">' + t('chegarei_tarde') + '</button>' +
        '<button class="btn btn-danger" onclick="_ensaiosCardAsistencia(' + ensaioId + ',\'ausente\');hideModal(\'modal-overlay\')">' + t('non_podo') + '</button>' : '');

    showModal('modal-overlay');
}

/* ---- Export Ensaios ---- */
function ensaiosExport(format) {
    var headers = [t('data'), t('hora_inicio'), t('hora_fin'), t('lugar'), t('estado')];
    var rows = (AppState.ensaios || []).map(function(e) {
        return [e.data || '', e.hora_inicio || '', e.hora_fin || '', e.lugar || '', e.estado || ''];
    });
    if (format === 'pdf') {
        exportPDF(t('ensaios'), headers, rows);
    } else {
        exportCSV('ensaios.csv', headers, rows);
    }
}

/* ---- Export Attendance CSV/PDF ---- */
async function ensaiosExportAsistencia(format) {
    try {
        var data = await api('/asistencia/resumo');
        var headers = [t('socio'), t('instrumento'), t('confirmado'), t('ausente'), t('xustificado'), t('porcentaxe')];
        var rows = (data || []).map(function(s) {
            var total = (parseInt(s.confirmados) || 0) + (parseInt(s.ausentes) || 0) + (parseInt(s.xustificados) || 0);
            var pct = total > 0 ? Math.round((parseInt(s.confirmados) || 0) / total * 100) : 0;
            return [s.nome_completo || s.username, s.instrumento || '', s.confirmados || 0, s.ausentes || 0, s.xustificados || 0, pct + '%'];
        });
        if (format === 'pdf') {
            exportPDF(t('asistencia'), headers, rows);
        } else {
            exportCSV('asistencia.csv', headers, rows);
        }
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

/* ---- Instrument Count Modal ---- */
async function ensaiosInstrumentCount(id) {
    var e = (AppState.ensaios || []).find(function(x) { return x.id == id; });
    if (!e) return;

    $('#modal-title').textContent = t('reconto_instrumentos');
    $('#modal-body').innerHTML = '<p class="text-muted text-sm">' + t('cargando') + '</p>';
    $('#modal-footer').innerHTML = '';
    showModal('modal-overlay');

    var asistentes = [];
    try {
        asistentes = await api('/asistencia/' + id);
        if (!Array.isArray(asistentes)) asistentes = [];
    } catch (err) { asistentes = []; }

    var html = '<div class="card-meta" style="margin-bottom:12px">' +
        '<span>' + formatDate(e.data) + '</span>' +
        (e.lugar ? '<span>' + esc(e.lugar) + '</span>' : '') +
        (e.hora_inicio ? '<span>' + esc(e.hora_inicio) + '</span>' : '') +
    '</div>';

    var instHtml = _buildInstrumentCount(asistentes, {detail: true});
    if (instHtml) {
        html += instHtml;
    } else {
        html += '<p class="text-muted">' + t('sen_confirmados_instrumentos') + '</p>';
    }

    $('#modal-body').innerHTML = html;
}
