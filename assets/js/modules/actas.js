/**
 * Actas — Meeting minutes module
 */

async function actasLoad() {
    try {
        AppState.actas = await api('/actas');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.actas = [];
    }
    actasRender();
}

function actasRender() {
    var grid = $('#actas-grid');
    if (!grid) return;

    var list = AppState.actas || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isAdmin();
    var html = '';

    list.forEach(function(a) {
        var estadoBadge = '';
        if (a.estado === 'publicada') {
            estadoBadge = '<span class="badge badge-success">' + t('publicada') + '</span>';
        } else {
            estadoBadge = '<span class="badge badge-warning">' + t('borrador') + '</span>';
        }

        html += '<div class="card">' +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(a.titulo) + '</h3>' +
                '<p class="card-meta">' + formatDate(a.data) + ' ' + estadoBadge + '</p>' +
                '<p class="card-text">' + esc(truncate(a.contido, 120)) + '</p>' +
            '</div>' +
            '<div class="card-actions">' +
                '<button class="btn-icon" onclick="actasView(' + a.id + ')" title="' + t('ver') + '">&#128065;</button>' +
                (isAdmin
                    ? '<button class="btn-icon" onclick="actasModal(AppState.actas.find(function(x){return x.id==' + a.id + '}))" title="' + t('editar') + '">&#9998;</button>' +
                      '<button class="btn-icon btn-danger" onclick="actasDelete(' + a.id + ')" title="' + t('eliminar') + '">&#128465;</button>'
                    : '') +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;
}

function actasView(id) {
    var acta = (AppState.actas || []).find(function(a) { return a.id === id; });
    if (!acta) return;

    $('#modal-title').textContent = esc(acta.titulo);

    var arquivosHtml = '';
    if (acta.arquivos && acta.arquivos.length) {
        arquivosHtml = '<div style="margin-top:16px"><strong>' + t('ficheiros') + ':</strong><ul>';
        acta.arquivos.forEach(function(f) {
            var name = typeof f === 'string' ? f : f.name || f;
            arquivosHtml += '<li><a href="' + esc(uploadUrl(name)) + '" target="_blank">' + esc(name) + '</a></li>';
        });
        arquivosHtml += '</ul></div>';
    }

    $('#modal-body').innerHTML =
        '<p class="card-meta">' + formatDate(acta.data) + '</p>' +
        '<div style="white-space:pre-wrap;margin-top:12px">' + nl2br(acta.contido || '') + '</div>' +
        arquivosHtml;

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('voltar') + '</button>';

    showModal('modal-overlay');
}

function actasModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('acta') : t('nova_acta');

    $('#modal-title').textContent = title;

    var estadoOptions = ['borrador', 'publicada'].map(function(e) {
        var sel = (isEdit && item.estado === e) ? ' selected' : '';
        return '<option value="' + e + '"' + sel + '>' + t(e) + '</option>';
    }).join('');

    $('#modal-body').innerHTML =
        '<input type="hidden" id="acta-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="acta-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('data') + '</label>' +
            '<input type="date" class="form-control" id="acta-data" value="' + esc(isEdit ? item.data || '' : today()) + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('contido') + '</label>' +
            '<textarea class="form-control" id="acta-contido" rows="12">' + esc(isEdit ? item.contido || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('estado') + '</label>' +
            '<select class="form-control" id="acta-estado">' + estadoOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('ficheiros') + '</label>' +
            '<input type="file" class="form-control" id="acta-arquivos" multiple>' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="actasSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function actasSave() {
    var id = ($('#acta-id') || {}).value;
    var isEdit = !!id;

    var body = {
        titulo: ($('#acta-titulo') || {}).value || '',
        data: ($('#acta-data') || {}).value || today(),
        contido: ($('#acta-contido') || {}).value || '',
        estado: ($('#acta-estado') || {}).value || 'borrador'
    };

    var arquivosInput = $('#acta-arquivos');
    if (arquivosInput && arquivosInput.files && arquivosInput.files.length > 0) {
        var arquivos = [];
        for (var i = 0; i < arquivosInput.files.length; i++) {
            arquivos.push(await fileToBase64(arquivosInput.files[i]));
        }
        body.arquivos = arquivos;
    }

    try {
        if (isEdit) {
            await api('/actas/' + id, { method: 'PUT', body: body });
        } else {
            await api('/actas', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        actasLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function actasDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/actas/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        actasLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
