/**
 * Instrumentos — Showcase of instruments we use
 */

var _instrumentoIcons = {
    surdo: 'assets/img/instrumentos/surdo.jpg',
    caixa: 'assets/img/instrumentos/caixa.jpg',
    repinique: 'assets/img/instrumentos/repinique.jpg',
    tamborim: 'assets/img/instrumentos/tamborim.jpg',
    timbao: 'assets/img/instrumentos/timbao.jpg',
    agogo: 'assets/img/instrumentos/agogo.jpg',
    ganza: 'assets/img/instrumentos/ganza.jpg',
    apito: 'assets/img/instrumentos/apito.jpg',
    outro: 'assets/img/instrumentos/outro.png'
};

async function instrumentosLoad() {
    try {
        AppState.instrumentos = await api('/instrumentos');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.instrumentos = [];
    }
    instrumentosRender();
}

function instrumentosRender() {
    var grid = document.getElementById('instrumentos-grid');
    if (!grid) return;

    var list = (AppState.instrumentos || []).slice();

    // Filter: search
    var searchVal = ($('#instrumentos-search') || {}).value || '';
    if (searchVal) {
        var q = searchVal.toLowerCase();
        list = list.filter(function(i) {
            return (i.nome || '').toLowerCase().indexOf(q) !== -1 ||
                   (i.tipo || '').toLowerCase().indexOf(q) !== -1 ||
                   (i.notas || '').toLowerCase().indexOf(q) !== -1 ||
                   stripHtml(i.descricion || '').toLowerCase().indexOf(q) !== -1;
        });
    }

    // Sort by nome
    list.sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || ''); });

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center text-muted" style="grid-column:1/-1">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isSocio();
    var html = '';

    list.forEach(function(i) {
        var iconSrc = i.imaxe ? uploadUrl(i.imaxe) : (_instrumentoIcons[i.tipo] || _instrumentoIcons['outro']);

        var notasHtml = '';
        if (i.notas) {
            notasHtml = '<p class="card-meta instrumento-notas">' + esc(i.notas) + '</p>';
        }

        var descricionHtml = '';
        if (i.descricion) {
            descricionHtml = '<div class="rt-content instrumento-desc">' + i.descricion + '</div>';
        }

        var actions = '';
        if (isAdmin) {
            actions += '<button class="btn-icon" onclick="instrumentosModal(AppState.instrumentos.find(function(x){return x.id==' + i.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>';
            actions += '<button class="btn-icon btn-danger" onclick="instrumentosDelete(' + i.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>';
        }

        html += '<div class="card instrumento-card" onclick="instrumentosView(' + i.id + ')">' +
            '<div class="instrumento-card-header">' +
                '<img src="' + esc(iconSrc) + '" alt="' + esc(i.tipo || '') + '" class="instrumento-card-icon">' +
                '<div class="instrumento-card-info">' +
                    '<h4>' + esc(i.nome) + '</h4>' +
                    notasHtml +
                '</div>' +
                (actions ? '<div class="instrumento-card-actions" onclick="event.stopPropagation()">' + actions + '</div>' : '') +
            '</div>' +
            descricionHtml +
        '</div>';
    });

    grid.innerHTML = html;
}

function instrumentosModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('instrumento') : t('novo_instrumento');

    $('#modal-title').textContent = title;

    var imaxePreview = '';
    if (isEdit) {
        var previewSrc = item.imaxe ? uploadUrl(item.imaxe) : (_instrumentoIcons[item.tipo] || _instrumentoIcons['outro']);
        imaxePreview = '<img src="' + esc(previewSrc) + '" id="instrumento-imaxe-preview" style="margin-top:8px;max-width:120px;border-radius:8px">';
    }

    $('#modal-body').innerHTML =
        '<input type="hidden" id="instrumento-id" value="' + (isEdit ? item.id : '') + '">' +
        _renderModalLangBar() +
        '<div class="form-group">' +
            '<label class="required">' + t('nome') + '</label>' +
            '<input type="text" class="form-control" id="instrumento-nome" value="' + esc(isEdit ? item.nome : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('imaxe') + '</label>' +
            '<input type="file" class="form-control" id="instrumento-imaxe" accept="image/*">' +
            imaxePreview +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion_curta') + '</label>' +
            '<textarea class="form-control" id="instrumento-notas" rows="2">' + esc(isEdit ? item.notas || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion') + '</label>' +
            '<div class="rt-wrap" id="instrumento-descricion-editor"></div>' +
        '</div>';

    initRichTextEditor('instrumento-descricion-editor', isEdit ? item.descricion || '' : '', { uploadDir: 'instrumentos' });

    _initModalI18n([
        { key: 'nome', inputId: 'instrumento-nome', type: 'input' },
        { key: 'notas', inputId: 'instrumento-notas', type: 'textarea' },
        { key: 'descricion', inputId: 'instrumento-descricion-editor', type: 'richtext', editorId: 'instrumento-descricion-editor' }
    ], isEdit ? item : null);

    // Live preview when selecting a new image
    var imaxeInput = $('#instrumento-imaxe');
    if (imaxeInput) {
        imaxeInput.addEventListener('change', function() {
            if (imaxeInput.files && imaxeInput.files[0]) {
                var preview = $('#instrumento-imaxe-preview');
                if (!preview) {
                    preview = document.createElement('img');
                    preview.id = 'instrumento-imaxe-preview';
                    preview.style.cssText = 'margin-top:8px;max-width:120px;border-radius:8px';
                    imaxeInput.parentNode.appendChild(preview);
                }
                preview.src = URL.createObjectURL(imaxeInput.files[0]);
            }
        });
    }

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="instrumentosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function instrumentosSave() {
    var id = ($('#instrumento-id') || {}).value;
    var isEdit = !!id;

    _saveModalLangValues();
    var glData = _modalI18n.data.gl || {};

    var body = {
        nome: glData.nome || ($('#instrumento-nome') || {}).value || '',
        notas: glData.notas || ($('#instrumento-notas') || {}).value || '',
        descricion: glData.descricion || getRichTextContent('instrumento-descricion-editor'),
        i18n: _collectModalI18n()
    };

    var fileInput = $('#instrumento-imaxe');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        var imgB64 = await imageToBase64(fileInput.files[0]);
        body.imaxe_data = imgB64.data;
        body.imaxe_ext = 'jpg';
    }

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

function instrumentosView(id) {
    var item = (AppState.instrumentos || []).find(function(x) { return x.id === id; });
    if (!item) return;

    var iconSrc = item.imaxe ? uploadUrl(item.imaxe) : (_instrumentoIcons[item.tipo] || _instrumentoIcons['outro']);

    $('#modal-title').textContent = item.nome;

    var notasHtml = item.notas ? '<p class="text-muted" style="margin:0 0 8px">' + esc(item.notas) + '</p>' : '';
    var descHtml = item.descricion ? '<div class="rt-content instrumento-view-desc">' + item.descricion + '</div>' : '';

    $('#modal-body').innerHTML =
        '<img src="' + esc(iconSrc) + '" alt="' + esc(item.nome) + '" class="instrumento-view-img">' +
        notasHtml +
        descHtml;

    var footerHtml = '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('pechar') + '</button>';
    if (AppState.isSocio()) {
        footerHtml += '<button class="btn btn-primary" onclick="hideModal(\'modal-overlay\');instrumentosModal(AppState.instrumentos.find(function(x){return x.id==' + id + '}))">' + t('editar') + '</button>';
    }
    $('#modal-footer').innerHTML = footerHtml;

    showModal('modal-overlay');
}
