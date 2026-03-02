/**
 * Noticias — News management module
 */

async function noticiasLoad() {
    try {
        AppState.noticias = await api('/noticias');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.noticias = [];
    }
    noticiasRender();
}

function noticiasRender() {
    var grid = $('#noticias-grid');
    if (!grid) return;

    var list = AppState.noticias || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isSocio();
    var html = '';

    list.forEach(function(n) {
        var imgHtml = '';
        if (n.imaxes && n.imaxes.length > 0) {
            var firstImg = typeof n.imaxes[0] === 'string' ? n.imaxes[0] : n.imaxes[0].path || n.imaxes[0].url || '';
            if (firstImg) {
                imgHtml = '<div class="card-img"><img src="' + esc(uploadUrl(firstImg)) + '" alt=""></div>';
            }
        }

        var estadoBadge = '';
        if (n.estado === 'publicada') {
            estadoBadge = '<span class="badge badge-success">' + t('publicada') + '</span>';
        } else {
            estadoBadge = '<span class="badge badge-warning">' + t('borrador') + '</span>';
        }

        var publicaBadge = '';
        if (n.publica) {
            publicaBadge = ' <span class="badge badge-primary">' + t('publica') + '</span>';
        }

        var actions = '';
        if (isAdmin) {
            actions = '<div class="card-actions">' +
                '<button class="btn-icon" onclick="noticiasModal(AppState.noticias.find(x=>x.id==' + n.id + '))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
                '<button class="btn-icon btn-danger" onclick="noticiasDelete(' + n.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>' +
                '</div>';
        }

        html += '<div class="card">' +
            imgHtml +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(n.titulo) + '</h3>' +
                '<p class="card-text">' + esc(truncate(stripHtml(n.texto), 120)) + '</p>' +
                '<div class="card-meta">' +
                    '<span>' + formatDate(n.data) + '</span>' +
                    '<span>' + esc(n.autor || '') + '</span>' +
                '</div>' +
                '<div class="card-badges">' + estadoBadge + publicaBadge + '</div>' +
                actions +
            '</div>' +
            '</div>';
    });

    grid.innerHTML = html;
}

function noticiasModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('noticias') : t('nova_noticia');

    $('#modal-title').textContent = title;

    var estadoOptions = ['borrador', 'publicada'].map(function(e) {
        var sel = (item && item.estado === e) ? ' selected' : '';
        var label = e === 'publicada' ? t('publicada') : t('borrador');
        return '<option value="' + e + '"' + sel + '>' + label + '</option>';
    }).join('');

    $('#modal-body').innerHTML =
        '<input type="hidden" id="noticia-id" value="' + (isEdit ? item.id : '') + '">' +
        _renderModalLangBar() +
        '<div class="form-group">' +
            '<label class="required">' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="noticia-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('texto') + '</label>' +
            '<div class="rt-wrap" id="noticia-texto-editor"></div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('data') + '</label>' +
            '<input type="date" class="form-control" id="noticia-data" value="' + (isEdit ? item.data || today() : today()) + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('estado') + '</label>' +
            '<select class="form-control" id="noticia-estado">' + estadoOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label><input type="checkbox" id="noticia-publica"' + (isEdit && item.publica ? ' checked' : '') + '> ' + t('publica') + '</label>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('imaxes') + '</label>' +
            '<input type="file" class="form-control" id="noticia-imaxes" accept="image/*" multiple>' +
            (isEdit && item.imaxes && item.imaxes.length > 0
                ? '<div class="preview-imgs" style="margin-top:8px">' +
                  item.imaxes.map(function(img) {
                      var src = typeof img === 'string' ? img : img.path || img.url || '';
                      return '<img src="' + esc(uploadUrl(src)) + '" class="avatar-sm" style="margin-right:4px">';
                  }).join('') +
                  '</div>'
                : '') +
        '</div>';

    initRichTextEditor('noticia-texto-editor', isEdit ? item.texto || '' : '', { uploadDir: 'noticias' });

    _initModalI18n([
        { key: 'titulo', inputId: 'noticia-titulo', type: 'input' },
        { key: 'texto', inputId: 'noticia-texto-editor', type: 'richtext', editorId: 'noticia-texto-editor' }
    ], isEdit ? item : null);

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="noticiasSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function noticiasSave() {
    var id = ($('#noticia-id') || {}).value;
    var isEdit = !!id;

    // Ensure current language values are saved before collecting
    _saveModalLangValues();
    var glData = _modalI18n.data.gl || {};

    var body = {
        titulo: glData.titulo || ($('#noticia-titulo') || {}).value || '',
        texto: glData.texto || getRichTextContent('noticia-texto-editor'),
        data: ($('#noticia-data') || {}).value || today(),
        estado: ($('#noticia-estado') || {}).value || 'borrador',
        publica: ($('#noticia-publica') || {}).checked || false,
        i18n: _collectModalI18n()
    };

    var fileInput = $('#noticia-imaxes');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        var imaxes = [];
        for (var i = 0; i < fileInput.files.length; i++) {
            imaxes.push(await imageToBase64(fileInput.files[i]));
        }
        body.imaxes = imaxes;
    }

    try {
        if (isEdit) {
            await api('/noticias/' + id, { method: 'PUT', body: body });
        } else {
            await api('/noticias', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        noticiasLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function noticiasExport(format) {
    var headers = [t('titulo'), t('data'), t('autor'), t('estado')];
    var rows = (AppState.noticias || []).map(function(n) {
        return [n.titulo, n.data || '', n.autor || '', n.estado || ''];
    });
    if (format === 'pdf') {
        exportPDF(t('noticias'), headers, rows);
    } else {
        exportCSV('noticias.csv', headers, rows);
    }
}

async function noticiasDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/noticias/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        noticiasLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
