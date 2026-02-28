/**
 * Bolos — Actuacións management module (unified eventos + contratos)
 */
var _bolosView = 'list';
var _bolosCalendar = new CalendarWidget('bolos-calendar', {
    onDayClick: function(date, events) {
        if (events.length > 0) {
            _showDayPopup(date, events);
        }
    },
    onEventClick: function(id) {
        var b = (AppState.bolos || []).find(function(x) { return x.id == id; });
        if (b && AppState.isAdmin()) bolosModal(b);
    }
});

function bolosSetView(view) {
    _bolosView = view;
    var btns = $$('#bolos-view-toggle button');
    btns.forEach(function(b, i) { b.classList.toggle('active', (i === 0 && view === 'list') || (i === 1 && view === 'calendar')); });
    $('#bolos-grid').style.display = view === 'list' ? '' : 'none';
    $('#bolos-calendar').style.display = view === 'calendar' ? '' : 'none';
    if (view === 'calendar') bolosRenderCalendar();
}

function bolosRenderCalendar() {
    var events = (AppState.bolos || []).map(function(b) {
        var color = b.tipo === 'festival' ? 'var(--success)' : b.tipo === 'taller' ? 'var(--warning)' : 'var(--primary)';
        return { date: b.data, title: b.titulo, color: color, id: b.id, time: b.hora || '' };
    });
    _bolosCalendar.setEvents(events);
    _bolosCalendar.render();
}

async function bolosLoad() {
    try {
        AppState.bolos = await api('/bolos');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.bolos = [];
    }
    bolosRender();
    if (_bolosView === 'calendar') bolosRenderCalendar();
}

function bolosRender() {
    var grid = $('#bolos-grid');
    if (!grid) return;

    var list = AppState.bolos || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isAdmin();
    var html = '';

    list.forEach(function(b) {
        var imgHtml = '';
        if (b.imaxe) {
            imgHtml = '<div class="card-img"><img src="' + esc(uploadUrl(b.imaxe)) + '" alt=""></div>';
        }

        var tipoBadge = '';
        if (b.tipo === 'actuacion') {
            tipoBadge = '<span class="badge badge-primary">' + t('actuacion') + '</span>';
        } else if (b.tipo === 'festival') {
            tipoBadge = '<span class="badge badge-success">' + t('festival') + '</span>';
        } else if (b.tipo === 'taller') {
            tipoBadge = '<span class="badge badge-warning">' + t('taller') + '</span>';
        } else {
            tipoBadge = '<span class="badge">' + esc(b.tipo || '') + '</span>';
        }

        var estadoBadge = '';
        switch (b.estado) {
            case 'confirmado':
                estadoBadge = '<span class="badge badge-success">' + t('confirmado') + '</span>';
                break;
            case 'borrador':
                estadoBadge = '<span class="badge badge-warning">' + t('borrador') + '</span>';
                break;
            case 'asinado':
                estadoBadge = '<span class="badge badge-primary">' + t('asinado') + '</span>';
                break;
            case 'completado':
                estadoBadge = '<span class="badge badge-success">' + t('completado') + '</span>';
                break;
            case 'cancelado':
                estadoBadge = '<span class="badge badge-danger">' + t('cancelado') + '</span>';
                break;
            default:
                estadoBadge = '<span class="badge">' + esc(b.estado || '') + '</span>';
        }

        var metaHtml = '<span>' + formatDate(b.data) + (b.hora ? ' ' + esc(b.hora) : '') + '</span>';
        if (b.lugar) metaHtml += '<span>' + esc(b.lugar) + '</span>';
        if (b.importe && parseFloat(b.importe) > 0) {
            metaHtml += '<span>' + parseFloat(b.importe).toFixed(2) + ' &euro;</span>';
        }
        if (b.cliente_nome) {
            metaHtml += '<span>' + esc(b.cliente_nome) + '</span>';
        }

        var actions = '';
        if (b.contrato_arquivo) {
            actions += '<a href="' + esc(uploadUrl(b.contrato_arquivo)) + '" target="_blank" class="btn-icon" title="Download">&#8615;</a>';
        }
        if (isAdmin) {
            actions += '<button class="btn-icon" onclick="bolosModal(AppState.bolos.find(function(x){return x.id==' + b.id + '}))" title="' + t('editar') + '">&#9998;</button>';
            actions += '<button class="btn-icon btn-danger" onclick="bolosDelete(' + b.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
        }

        html += '<div class="card">' +
            imgHtml +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(b.titulo) + '</h3>' +
                '<div class="card-meta">' + metaHtml + '</div>' +
                (b.descricion ? '<p class="card-text">' + esc(truncate(b.descricion, 100)) + '</p>' : '') +
                '<div class="card-badges">' + tipoBadge + ' ' + estadoBadge +
                    (b.publica ? ' <span class="badge badge-primary">' + t('publica') + '</span>' : '') +
                '</div>' +
                (actions ? '<div class="card-actions">' + actions + '</div>' : '') +
            '</div>' +
            '</div>';
    });

    grid.innerHTML = html;
}

function bolosModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('bolo') : t('novo_bolo');

    $('#modal-title').textContent = title;

    var tipoOptions = ['actuacion', 'festival', 'taller'].map(function(tp) {
        var sel = (isEdit && item.tipo === tp) ? ' selected' : '';
        return '<option value="' + tp + '"' + sel + '>' + t(tp) + '</option>';
    }).join('');

    var estadoOptions = ['borrador', 'confirmado', 'asinado', 'completado', 'cancelado'].map(function(e) {
        var sel = (isEdit && item.estado === e) ? ' selected' : '';
        return '<option value="' + e + '"' + sel + '>' + t(e) + '</option>';
    }).join('');

    var publicaChecked = (isEdit && item.publica) ? ' checked' : '';

    $('#modal-body').innerHTML =
        '<input type="hidden" id="bolo-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="bolo-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion') + '</label>' +
            '<textarea class="form-control" id="bolo-descricion" rows="3">' + esc(isEdit ? item.descricion || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('data') + '</label>' +
                '<input type="date" class="form-control" id="bolo-data" value="' + (isEdit ? item.data || today() : today()) + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('hora') + '</label>' +
                '<input type="time" class="form-control" id="bolo-hora" value="' + (isEdit ? item.hora || '' : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('lugar') + '</label>' +
            '<input type="text" class="form-control" id="bolo-lugar" value="' + esc(isEdit ? item.lugar || '' : '') + '">' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('tipo') + '</label>' +
                '<select class="form-control" id="bolo-tipo">' + tipoOptions + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('estado') + '</label>' +
                '<select class="form-control" id="bolo-estado">' + estadoOptions + '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label><input type="checkbox" id="bolo-publica"' + publicaChecked + '> ' + t('publica') + '</label>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('imaxes') + '</label>' +
            '<input type="file" class="form-control" id="bolo-imaxe" accept="image/*">' +
            (isEdit && item.imaxe ? '<img src="' + esc(uploadUrl(item.imaxe)) + '" class="avatar-sm" style="margin-top:8px">' : '') +
        '</div>' +
        '<hr style="border-color:var(--border);margin:12px 0">' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('cliente') + ' (' + t('nome') + ')</label>' +
                '<input type="text" class="form-control" id="bolo-cliente-nome" value="' + esc(isEdit ? item.cliente_nome || '' : '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('nif') + '</label>' +
                '<input type="text" class="form-control" id="bolo-cliente-nif" value="' + esc(isEdit ? item.cliente_nif || '' : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('telefono') + '</label>' +
                '<input type="text" class="form-control" id="bolo-cliente-telefono" value="' + esc(isEdit ? item.cliente_telefono || '' : '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('importe') + '</label>' +
                '<input type="number" class="form-control" id="bolo-importe" step="0.01" min="0" value="' + (isEdit ? item.importe || '' : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('notas') + '</label>' +
            '<textarea class="form-control" id="bolo-notas" rows="2">' + esc(isEdit ? item.notas || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('contrato') + ' (' + t('ficheiros') + ')</label>' +
            '<input type="file" class="form-control" id="bolo-contrato-arquivo">' +
            (isEdit && item.contrato_arquivo ? '<p style="margin-top:4px"><a href="' + esc(uploadUrl(item.contrato_arquivo)) + '" target="_blank">' + esc(item.contrato_arquivo) + '</a></p>' : '') +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="bolosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function bolosSave() {
    var id = ($('#bolo-id') || {}).value;
    var isEdit = !!id;

    var body = {
        titulo: ($('#bolo-titulo') || {}).value || '',
        descricion: ($('#bolo-descricion') || {}).value || '',
        data: ($('#bolo-data') || {}).value || today(),
        hora: ($('#bolo-hora') || {}).value || '',
        lugar: ($('#bolo-lugar') || {}).value || '',
        tipo: ($('#bolo-tipo') || {}).value || 'actuacion',
        estado: ($('#bolo-estado') || {}).value || 'borrador',
        publica: $('#bolo-publica') ? $('#bolo-publica').checked : false,
        cliente_nome: ($('#bolo-cliente-nome') || {}).value || '',
        cliente_nif: ($('#bolo-cliente-nif') || {}).value || '',
        cliente_telefono: ($('#bolo-cliente-telefono') || {}).value || '',
        importe: parseFloat(($('#bolo-importe') || {}).value) || 0,
        notas: ($('#bolo-notas') || {}).value || ''
    };

    // Image file
    var fileInput = $('#bolo-imaxe');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        body.imaxe_data = await fileToBase64(fileInput.files[0]);
        body.imaxe_ext = fileInput.files[0].name.split('.').pop() || 'jpg';
    }

    // Contract file
    var contratoInput = $('#bolo-contrato-arquivo');
    if (contratoInput && contratoInput.files && contratoInput.files.length > 0) {
        body.contrato_arquivo_data = await fileToBase64(contratoInput.files[0]);
        body.contrato_arquivo_nome = contratoInput.files[0].name;
    }

    try {
        if (isEdit) {
            await api('/bolos/' + id, { method: 'PUT', body: body });
        } else {
            await api('/bolos', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        bolosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function bolosDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/bolos/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        bolosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
