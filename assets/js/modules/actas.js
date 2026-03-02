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

    var list = (AppState.actas || []).slice();

    // Search filter
    var search = ($('#actas-search') || {}).value;
    if (search) {
        var q = search.toLowerCase();
        list = list.filter(function(a) {
            return (a.titulo || '').toLowerCase().indexOf(q) !== -1 ||
                   (a.contido || '').toLowerCase().indexOf(q) !== -1;
        });
    }

    // Estado filter
    var estadoFilter = ($('#actas-estado-filter') || {}).value || 'todas';
    if (estadoFilter !== 'todas') {
        list = list.filter(function(a) { return a.estado === estadoFilter; });
    }

    // Sort
    var sort = ($('#actas-sort') || {}).value || 'recentes';
    if (sort === 'recentes') {
        list.sort(function(a, b) { return (b.data || '').localeCompare(a.data || ''); });
    } else if (sort === 'antigas') {
        list.sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });
    } else if (sort === 'titulo') {
        list.sort(function(a, b) { return (a.titulo || '').localeCompare(b.titulo || ''); });
    }

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isSocio();
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
                '<p class="card-text">' + esc(truncate(stripHtml(a.contido), 120)) + '</p>' +
            '</div>' +
            '<div class="card-actions">' +
                '<button class="btn-icon" onclick="actasView(' + a.id + ')" title="' + t('ver') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
                (isAdmin
                    ? '<button class="btn-icon" onclick="actasModal(AppState.actas.find(function(x){return x.id==' + a.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
                      '<button class="btn-icon btn-danger" onclick="actasDelete(' + a.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>'
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
            var url = typeof f === 'object' && f.url ? f.url : name;
            arquivosHtml += '<li><a href="' + esc(uploadUrl(url)) + '" target="_blank">' + esc(name) + '</a></li>';
        });
        arquivosHtml += '</ul></div>';
    }

    $('#modal-body').innerHTML =
        '<p class="card-meta">' + formatDate(acta.data) + '</p>' +
        '<div class="rt-content" style="margin-top:12px">' + (acta.contido || '') + '</div>' +
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
            '<label class="required">' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="acta-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('data') + '</label>' +
            '<input type="date" class="form-control" id="acta-data" value="' + esc(isEdit ? item.data || '' : today()) + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('contido') + '</label>' +
            '<div class="rt-wrap" id="acta-contido-editor"></div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('estado') + '</label>' +
            '<select class="form-control" id="acta-estado">' + estadoOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('ficheiros') + '</label>' +
            '<input type="file" class="form-control" id="acta-arquivos" multiple>' +
        '</div>';

    initRichTextEditor('acta-contido-editor', isEdit ? item.contido || '' : '', { uploadDir: 'actas' });

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
        contido: getRichTextContent('acta-contido-editor'),
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

function actasExport(format) {
    var headers = [t('titulo'), t('data'), t('estado')];
    var rows = (AppState.actas || []).map(function(a) {
        return [a.titulo, a.data || '', a.estado || ''];
    });
    if (format === 'pdf') {
        exportPDF(t('actas'), headers, rows);
    } else {
        exportCSV('actas.csv', headers, rows);
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
