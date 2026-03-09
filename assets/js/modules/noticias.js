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
    var searchEl = $('#noticias-search');
    if (searchEl && !searchEl._deb) {
        searchEl._deb = true;
        searchEl.addEventListener('input', debounce(noticiasRender, 300));
    }
}

function noticiasRender() {
    var grid = $('#noticias-grid');
    if (!grid) return;

    var list = AppState.noticias || [];

    var searchEl = $('#noticias-search');
    var searchTerm = searchEl ? searchEl.value.trim().toLowerCase() : '';
    if (searchTerm) {
        list = list.filter(function(n) {
            return (n.titulo || '').toLowerCase().indexOf(searchTerm) !== -1 ||
                   (n.texto || '').toLowerCase().indexOf(searchTerm) !== -1;
        });
    }

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
                '<button class="btn-icon btn-whatsapp" onclick="event.stopPropagation();noticiasShareWhatsapp(' + n.id + ')" title="' + t('compartir_whatsapp') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>' +
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
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>' +
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

function noticiasShareWhatsapp(id) {
    var n = (AppState.noticias || []).find(function(x) { return x.id == id; });
    if (!n) return;

    var nome = (AppState.config || {}).nome_asociacion || 'Levada Arraiana';
    var l = [];

    l.push(String.fromCodePoint(0x1F4F0) + ' *' + nome + ' \u2014 ' + t('noticias') + '*');
    l.push('*' + (n.titulo || '') + '*');
    l.push(String.fromCodePoint(0x1F4C5) + ' ' + (n.data ? formatDate(n.data) : ''));

    if (n.texto) {
        var desc = n.texto.replace(/<[^>]+>/g, '').trim();
        if (desc.length > 200) desc = desc.substring(0, 200) + '...';
        if (desc) { l.push(''); l.push('_' + desc + '_'); }
    }

    l.push('');
    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    var baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'app.html#noticias';
    l.push(String.fromCodePoint(0x1F449) + ' ' + baseUrl);

    var url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(l.join('\n'));
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
