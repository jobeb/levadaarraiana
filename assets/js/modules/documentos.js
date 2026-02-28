/**
 * Documentos — Document management module
 */
var _docsPager = new Paginator('documentos-pagination', { perPage: 15, onChange: function() { documentosRender(); } });

async function documentosLoad() {
    try {
        AppState.documentos = await api('/documentos');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.documentos = [];
    }
    documentosRender();
}

function documentosRender() {
    var tbody = $('#documentos-table tbody');
    if (!tbody) return;

    var list = AppState.documentos || [];

    // Search filter
    var search = ($('#documentos-search') || {}).value || '';
    var term = search.toLowerCase();
    if (term) {
        list = list.filter(function(d) {
            return (d.titulo || '').toLowerCase().indexOf(term) !== -1 ||
                   (d.descricion || '').toLowerCase().indexOf(term) !== -1;
        });
    }

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">' + t('sen_resultados') + '</td></tr>';
        _docsPager.setTotal(0);
        _docsPager.render();
        return;
    }

    // Paginate
    list = _docsPager.slice(list);

    var isAdmin = AppState.isAdmin();
    var html = '';

    list.forEach(function(d) {
        var visBadge = '';
        if (d.visibilidade === 'todos') {
            visBadge = '<span class="badge badge-success">' + t('todos') + '</span>';
        } else if (d.visibilidade === 'direccion') {
            visBadge = '<span class="badge badge-primary">' + t('direccion') + '</span>';
        } else if (d.visibilidade === 'admin') {
            visBadge = '<span class="badge badge-warning">' + t('admin') + '</span>';
        } else {
            visBadge = '<span class="badge">' + esc(d.visibilidade || '') + '</span>';
        }

        var actions = '';
        if (d.arquivo) {
            actions += '<a href="' + esc(uploadUrl(d.arquivo)) + '" target="_blank" class="btn-icon" title="Download">&#8615;</a>';
        }
        if (isAdmin) {
            actions += '<button class="btn-icon" onclick="documentosModal(AppState.documentos.find(function(x){return x.id==' + d.id + '}))" title="' + t('editar') + '">&#9998;</button>';
            actions += '<button class="btn-icon btn-danger" onclick="documentosDelete(' + d.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
        }

        html += '<tr>' +
            '<td>' + esc(d.titulo) + '</td>' +
            '<td>' + visBadge + '</td>' +
            '<td>' + formatDate(d.creado || d.data || '') + '</td>' +
            '<td class="actions-cell">' + actions + '</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
    _docsPager.render();
}

function documentosModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('documento') : t('novo_documento');

    $('#modal-title').textContent = title;

    var visOptions = ['todos', 'direccion', 'admin'].map(function(v) {
        var sel = (isEdit && item.visibilidade === v) ? ' selected' : '';
        var label = v === 'todos' ? t('todos') : v === 'direccion' ? t('direccion') : t('admin');
        return '<option value="' + v + '"' + sel + '>' + label + '</option>';
    }).join('');

    $('#modal-body').innerHTML =
        '<input type="hidden" id="doc-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="doc-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion') + '</label>' +
            '<textarea class="form-control" id="doc-descricion" rows="3">' + esc(isEdit ? item.descricion || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('visibilidade') + '</label>' +
            '<select class="form-control" id="doc-visibilidade">' + visOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('ficheiros') + '</label>' +
            '<input type="file" class="form-control" id="doc-arquivo">' +
            (isEdit && item.arquivo ? '<p style="margin-top:4px"><a href="' + esc(uploadUrl(item.arquivo)) + '" target="_blank">' + esc(item.arquivo) + '</a></p>' : '') +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="documentosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function documentosSave() {
    var id = ($('#doc-id') || {}).value;
    var isEdit = !!id;

    var body = {
        titulo: ($('#doc-titulo') || {}).value || '',
        descricion: ($('#doc-descricion') || {}).value || '',
        visibilidade: ($('#doc-visibilidade') || {}).value || 'todos'
    };

    var arquivoInput = $('#doc-arquivo');
    if (arquivoInput && arquivoInput.files && arquivoInput.files.length > 0) {
        body.arquivo = await fileToBase64(arquivoInput.files[0]);
    }

    try {
        if (isEdit) {
            await api('/documentos/' + id, { method: 'PUT', body: body });
        } else {
            body.creado = today();
            await api('/documentos', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        documentosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function documentosDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/documentos/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        documentosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
