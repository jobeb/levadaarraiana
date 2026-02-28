/**
 * Ensaios — Rehearsals module
 */
var _ensaiosView = 'list';
var _ensaiosCalendar = new CalendarWidget('ensaios-calendar', {
    onDayClick: function(date, events) {
        if (events.length === 0 && AppState.isAdmin()) {
            ensaiosModal(); // Open new ensaio on empty day
            setTimeout(function() { var d = $('#ensaio-data'); if (d) d.value = date; }, 50);
        } else if (events.length > 0) {
            _showDayPopup(date, events);
        }
    },
    onEventClick: function(id) {
        var e = (AppState.ensaios || []).find(function(x) { return x.id == id; });
        if (e && AppState.isAdmin()) ensaiosModal(e);
        else if (e) ensaiosAsistencia(e.id);
    }
});

function _showDayPopup(date, events) {
    $('#modal-title').textContent = formatDate(date);
    var html = '';
    events.forEach(function(ev) {
        html += '<div class="card" style="margin-bottom:8px;padding:12px">' +
            '<strong>' + esc(ev.title) + '</strong>' +
            (ev.time ? '<br><span class="text-muted text-sm">' + esc(ev.time) + '</span>' : '') +
        '</div>';
    });
    $('#modal-body').innerHTML = html;
    $('#modal-footer').innerHTML = '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('voltar') + '</button>';
    showModal('modal-overlay');
}

function ensaiosSetView(view) {
    _ensaiosView = view;
    var btns = $$('#ensaios-view-toggle button');
    btns.forEach(function(b, i) { b.classList.toggle('active', (i === 0 && view === 'list') || (i === 1 && view === 'calendar')); });
    $('#ensaios-grid').style.display = view === 'list' ? '' : 'none';
    $('#ensaios-calendar').style.display = view === 'calendar' ? '' : 'none';
    if (view === 'calendar') ensaiosRenderCalendar();
}

function ensaiosRenderCalendar() {
    var events = (AppState.ensaios || []).map(function(e) {
        var color = e.estado === 'cancelado' ? 'var(--danger)' : e.estado === 'realizado' ? 'var(--success)' : 'var(--primary)';
        return { date: e.data, title: (e.hora_inicio || '') + ' ' + (e.lugar || ''), color: color, id: e.id, time: (e.hora_inicio || '') + '-' + (e.hora_fin || '') };
    });
    _ensaiosCalendar.setEvents(events);
    _ensaiosCalendar.render();
}

async function ensaiosLoad() {
    try {
        AppState.ensaios = await api('/ensaios');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.ensaios = [];
    }
    ensaiosRender();
    if (_ensaiosView === 'calendar') ensaiosRenderCalendar();
}

function ensaiosRender() {
    var grid = $('#ensaios-grid');
    if (!grid) return;

    var list = AppState.ensaios || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isAdmin();
    var html = '';

    list.forEach(function(e) {
        var estadoBadge = '';
        switch (e.estado) {
            case 'programado':
                estadoBadge = '<span class="badge badge-primary">' + t('programado') + '</span>';
                break;
            case 'realizado':
                estadoBadge = '<span class="badge badge-success">' + t('realizado') + '</span>';
                break;
            case 'cancelado':
                estadoBadge = '<span class="badge badge-danger">' + t('cancelado') + '</span>';
                break;
            default:
                estadoBadge = '<span class="badge">' + esc(e.estado || '') + '</span>';
        }

        // Parse date for display
        var dateParts = (e.data || '').split('-');
        var dayDisplay = dateParts.length === 3 ? dateParts[2] : '';
        var monthNames = ['Xan', 'Feb', 'Mar', 'Abr', 'Mai', 'Xun', 'Xul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
        var monthDisplay = dateParts.length === 3 ? monthNames[parseInt(dateParts[1], 10) - 1] || '' : '';

        html += '<div class="card">' +
            '<div class="card-body">' +
                '<div style="display:flex;gap:16px;align-items:flex-start">' +
                    '<div style="text-align:center;min-width:50px;padding:8px;background:var(--bg-tertiary);border-radius:8px">' +
                        '<div style="font-size:1.5em;font-weight:700;line-height:1">' + esc(dayDisplay) + '</div>' +
                        '<div style="font-size:0.85em;text-transform:uppercase;color:var(--text-secondary)">' + esc(monthDisplay) + '</div>' +
                    '</div>' +
                    '<div style="flex:1">' +
                        '<p class="card-meta">' + esc(e.hora_inicio || '') + ' - ' + esc(e.hora_fin || '') + '</p>' +
                        '<p>' + esc(e.lugar || '') + '</p>' +
                        '<p>' + estadoBadge +
                            (e.recorrencia ? ' <span class="badge badge-info">' + t(e.recorrencia) + '</span>' : '') +
                        '</p>' +
                        (e.notas ? '<p class="card-text" style="margin-top:4px">' + esc(truncate(e.notas, 100)) + '</p>' : '') +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="card-actions">' +
                (isAdmin
                    ? '<button class="btn btn-sm btn-secondary" onclick="ensaiosAsistencia(' + e.id + ')">' + t('asistencia') + '</button>' +
                      '<button class="btn-icon" onclick="ensaiosModal(AppState.ensaios.find(function(x){return x.id==' + e.id + '}))" title="' + t('editar') + '">&#9998;</button>' +
                      '<button class="btn-icon btn-danger" onclick="ensaiosDelete(' + e.id + ')" title="' + t('eliminar') + '">&#128465;</button>'
                    : '<button class="btn btn-sm btn-secondary" onclick="ensaiosAsistencia(' + e.id + ')">' + t('asistencia') + '</button>') +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;
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
            '<textarea class="form-control" id="ensaio-notas" rows="3">' + esc(isEdit ? item.notas || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('estado') + '</label>' +
            '<select class="form-control" id="ensaio-estado">' + estadoOptions + '</select>' +
        '</div>' +
        (!isEdit ? (
        '<hr style="border-color:var(--border);margin:12px 0">' +
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
        '</div>'
        ) : '') +
        (isEdit && item.grupo_recorrencia ? '<div class="badge badge-info" style="margin-top:8px">' + t('recorrencia') + ': ' + esc(item.recorrencia || '') + '</div>' : '');

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="ensaiosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');

    // Toggle recurrence end date visibility
    var recSel = $('#ensaio-recorrencia');
    if (recSel) {
        recSel.addEventListener('change', function() {
            var fg = $('#recorrencia-fin-group');
            if (fg) fg.style.display = recSel.value ? '' : 'none';
        });
    }
}

async function ensaiosSave() {
    var id = ($('#ensaio-id') || {}).value;
    var isEdit = !!id;

    var body = {
        data: ($('#ensaio-data') || {}).value || today(),
        hora_inicio: ($('#ensaio-hora-inicio') || {}).value || '',
        hora_fin: ($('#ensaio-hora-fin') || {}).value || '',
        lugar: ($('#ensaio-lugar') || {}).value || '',
        notas: ($('#ensaio-notas') || {}).value || '',
        estado: ($('#ensaio-estado') || {}).value || 'programado'
    };

    if (!isEdit) {
        var rec = ($('#ensaio-recorrencia') || {}).value || '';
        var recFin = ($('#ensaio-recorrencia-fin') || {}).value || '';
        if (rec && recFin) {
            body.recorrencia = rec;
            body.recorrencia_fin = recFin;
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
        // Ask user for scope
        var msg = t('solo_este') + ' / ' + t('este_e_futuros') + '?';
        var choice = await _showConfirmDialog(msg, { confirmText: t('este_e_futuros'), cancelText: t('solo_este') });
        if (choice === null) return; // cancelled via escape — we'll treat it as cancel
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

    // Load socios if not cached
    if (!AppState.socios || AppState.socios.length === 0) {
        try {
            AppState.socios = await api('/socios');
        } catch (e) {
            AppState.socios = [];
        }
    }

    var socios = (AppState.socios || []).filter(function(s) { return s.estado === 'Aprobado'; });

    // Load existing attendance
    var asistencia = [];
    try {
        asistencia = await api('/asistencia/' + id);
        if (!Array.isArray(asistencia)) asistencia = asistencia.asistencia || [];
    } catch (e) {
        asistencia = [];
    }

    // Build a lookup map
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
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
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
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('voltar') + '</button>';
    showModal('modal-overlay');
}

/* ---- Export Attendance CSV ---- */
async function ensaiosExportAsistencia() {
    try {
        var data = await api('/asistencia/resumo');
        var headers = [t('socio'), t('instrumento'), t('confirmado'), t('ausente'), t('xustificado'), t('porcentaxe')];
        var rows = (data || []).map(function(s) {
            var total = (parseInt(s.confirmados) || 0) + (parseInt(s.ausentes) || 0) + (parseInt(s.xustificados) || 0);
            var pct = total > 0 ? Math.round((parseInt(s.confirmados) || 0) / total * 100) : 0;
            return [s.nome_completo || s.username, s.instrumento || '', s.confirmados || 0, s.ausentes || 0, s.xustificados || 0, pct + '%'];
        });
        exportCSV('asistencia.csv', headers, rows);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
