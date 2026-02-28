/**
 * Instrumentos — Instruments inventory module
 */

var _instrumentoIcons = {
    surdo: 'S',
    caixa: 'C',
    repinique: 'R',
    tamborim: 'T',
    agogo: 'A',
    ganza: 'G',
    apito: 'P',
    outro: 'O'
};

async function instrumentosLoad() {
    try {
        AppState.instrumentos = await api('/instrumentos');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.instrumentos = [];
    }
    // Also load socios for assignment dropdown
    if (!AppState.socios || AppState.socios.length === 0) {
        try {
            AppState.socios = await api('/socios');
        } catch (e) {
            AppState.socios = [];
        }
    }
    instrumentosRender();
}

function instrumentosRender() {
    var tbody = $('#instrumentos-table tbody');
    if (!tbody) return;

    var list = AppState.instrumentos || [];

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">' + t('sen_resultados') + '</td></tr>';
        return;
    }

    var isAdmin = AppState.isAdmin();
    var html = '';

    list.forEach(function(i) {
        var icon = _instrumentoIcons[i.tipo] || _instrumentoIcons['outro'];

        var tipoBadge = '<span class="badge">' + esc((i.tipo || '').charAt(0).toUpperCase() + (i.tipo || '').slice(1)) + '</span>';

        var estadoBadge = '';
        switch (i.estado) {
            case 'bo':
                estadoBadge = '<span class="badge badge-success">' + t('bo') + '</span>';
                break;
            case 'reparacion':
                estadoBadge = '<span class="badge badge-warning">' + t('reparacion') + '</span>';
                break;
            case 'baixa':
                estadoBadge = '<span class="badge badge-danger">' + t('baixa') + '</span>';
                break;
            default:
                estadoBadge = '<span class="badge">' + esc(i.estado || '') + '</span>';
        }

        var asignado = '';
        if (i.asignado_a) {
            var socio = (AppState.socios || []).find(function(s) {
                return s.id === i.asignado_a || s.id === parseInt(i.asignado_a) || s.username === i.asignado_a;
            });
            asignado = socio ? (socio.nome_completo || socio.username) : i.asignado_a;
        } else {
            asignado = '<span class="text-muted">' + t('sen_asignar') + '</span>';
        }

        var actions = '';
        if (isAdmin) {
            actions += '<button class="btn-icon" onclick="instrumentosModal(AppState.instrumentos.find(function(x){return x.id==' + i.id + '}))" title="' + t('editar') + '">&#9998;</button>';
            actions += '<button class="btn btn-sm btn-secondary" onclick="instrumentosHistorial(' + i.id + ')" title="' + t('historial_mantemento') + '">&#128295;</button>';
            actions += '<button class="btn-icon btn-danger" onclick="instrumentosDelete(' + i.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
        }

        html += '<tr>' +
            '<td style="font-size:1.3em">' + icon + '</td>' +
            '<td>' + esc(i.nome) + '</td>' +
            '<td>' + tipoBadge + '</td>' +
            '<td>' + estadoBadge + '</td>' +
            '<td>' + asignado + '</td>' +
            '<td class="actions-cell">' + actions + '</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
}

function instrumentosModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('instrumento') : t('novo_instrumento');

    $('#modal-title').textContent = title;

    var tipoOptions = ['surdo', 'caixa', 'repinique', 'tamborim', 'agogo', 'ganza', 'apito', 'outro'].map(function(tp) {
        var sel = (isEdit && item.tipo === tp) ? ' selected' : '';
        return '<option value="' + tp + '"' + sel + '>' + tp.charAt(0).toUpperCase() + tp.slice(1) + '</option>';
    }).join('');

    var estadoOptions = ['bo', 'reparacion', 'baixa'].map(function(e) {
        var sel = (isEdit && item.estado === e) ? ' selected' : '';
        return '<option value="' + e + '"' + sel + '>' + t(e) + '</option>';
    }).join('');

    var socios = (AppState.socios || []).filter(function(s) { return s.estado === 'Aprobado'; });
    var socioOptions = '<option value="">' + t('sen_asignar') + '</option>';
    socios.forEach(function(s) {
        var val = s.id;
        var sel = (isEdit && (item.asignado_a === s.id || item.asignado_a === String(s.id) || item.asignado_a === s.username)) ? ' selected' : '';
        socioOptions += '<option value="' + val + '"' + sel + '>' + esc(s.nome_completo || s.username) + '</option>';
    });

    $('#modal-body').innerHTML =
        '<input type="hidden" id="instrumento-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('nome') + '</label>' +
            '<input type="text" class="form-control" id="instrumento-nome" value="' + esc(isEdit ? item.nome : '') + '">' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('tipo') + '</label>' +
                '<select class="form-control" id="instrumento-tipo">' + tipoOptions + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('numero_serie') + '</label>' +
                '<input type="text" class="form-control" id="instrumento-serie" value="' + esc(isEdit ? item.numero_serie || '' : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('estado') + '</label>' +
                '<select class="form-control" id="instrumento-estado">' + estadoOptions + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('asignado_a') + '</label>' +
                '<select class="form-control" id="instrumento-asignado">' + socioOptions + '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('notas') + '</label>' +
            '<textarea class="form-control" id="instrumento-notas" rows="3">' + esc(isEdit ? item.notas || '' : '') + '</textarea>' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="instrumentosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function instrumentosSave() {
    var id = ($('#instrumento-id') || {}).value;
    var isEdit = !!id;

    var body = {
        nome: ($('#instrumento-nome') || {}).value || '',
        tipo: ($('#instrumento-tipo') || {}).value || 'outro',
        numero_serie: ($('#instrumento-serie') || {}).value || '',
        estado: ($('#instrumento-estado') || {}).value || 'bo',
        asignado_a: ($('#instrumento-asignado') || {}).value || null,
        notas: ($('#instrumento-notas') || {}).value || ''
    };

    try {
        if (isEdit) {
            await api('/instrumentos/' + id, { method: 'PUT', body: body });
        } else {
            await api('/instrumentos', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        instrumentosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function instrumentosDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/instrumentos/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        instrumentosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function instrumentosHistorial(id) {
    var inst = (AppState.instrumentos || []).find(function(x) { return x.id == id; });
    if (!inst) return;

    var historial = [];
    if (inst.historial_mantemento) {
        historial = typeof inst.historial_mantemento === 'string'
            ? JSON.parse(inst.historial_mantemento) || []
            : inst.historial_mantemento;
    }

    $('#modal-title').textContent = t('historial_mantemento') + ' — ' + (inst.nome || '');

    var html = '';
    if (historial.length === 0) {
        html += '<p class="text-center">' + t('sen_resultados') + '</p>';
    } else {
        html += '<div class="historial-list">';
        historial.forEach(function(h) {
            html += '<div class="historial-entry">' +
                '<strong>' + formatDate(h.data) + '</strong> — ' +
                '<span class="badge">' + esc(h.tipo || '') + '</span> ' +
                esc(h.descricion || '') +
                (h.autor ? ' <span class="text-muted">(' + esc(h.autor) + ')</span>' : '') +
            '</div>';
        });
        html += '</div>';
    }

    html += '<hr style="margin:12px 0;border-color:var(--border)">';
    html += '<div class="form-group">' +
        '<label>' + t('data') + '</label>' +
        '<input type="date" class="form-control" id="mantemento-data" value="' + today() + '">' +
    '</div>' +
    '<div class="form-group">' +
        '<label>' + t('tipo') + '</label>' +
        '<select class="form-control" id="mantemento-tipo">' +
            '<option value="revision">Revisión</option>' +
            '<option value="reparacion">' + t('reparacion') + '</option>' +
            '<option value="limpeza">Limpeza</option>' +
            '<option value="substitucion">Substitución</option>' +
        '</select>' +
    '</div>' +
    '<div class="form-group">' +
        '<label>' + t('descricion') + '</label>' +
        '<input type="text" class="form-control" id="mantemento-desc" placeholder="...">' +
    '</div>';

    $('#modal-body').innerHTML = html;
    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('voltar') + '</button>' +
        '<button class="btn btn-primary" onclick="instrumentosAddMantemento(' + id + ')">' + t('engadir') + '</button>';

    showModal('modal-overlay');
}

async function instrumentosAddMantemento(id) {
    var body = {
        data: ($('#mantemento-data') || {}).value || today(),
        tipo: ($('#mantemento-tipo') || {}).value || '',
        descricion: ($('#mantemento-desc') || {}).value || '',
        autor: AppState.user ? (AppState.user.nome_completo || AppState.user.username) : ''
    };

    try {
        var res = await api('/instrumentos/' + id + '/mantemento', { method: 'POST', body: body });
        // Update local state
        var inst = (AppState.instrumentos || []).find(function(x) { return x.id == id; });
        if (inst && res.historial) inst.historial_mantemento = res.historial;
        toast(t('exito'), 'success');
        instrumentosHistorial(id); // Refresh modal
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
