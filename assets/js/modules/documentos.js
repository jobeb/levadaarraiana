/**
 * Documentos — Unified file browser + document upload
 */
var _docsPager = new Paginator('documentos-pagination', { perPage: 20, onChange: function() { documentosRender(); } });
var _fileTree = [];
var _selectedFolder = null;

async function documentosLoad() {
    try {
        _fileTree = await api('/arquivos');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        _fileTree = [];
    }
    _docsPager.currentPage = 1;
    documentosRender();
}

function documentosRender() {
    var foldersEl = $('#documentos-folders');
    var tbody = $('#documentos-table tbody');
    if (!foldersEl || !tbody) return;

    // Count total files first
    var totalFiles = 0;
    (_fileTree || []).forEach(function(g) { totalFiles += g.files ? g.files.length : 0; });

    // Build folder list
    var folderSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
    var foldersHtml = '<div class="folder-item' + (_selectedFolder === null ? ' active' : '') + '" onclick="documentosSelectFolder(null)">' +
        folderSvg + '<span>' + t('todas_carpetas') + '</span><span class="folder-count">' + totalFiles + '</span></div>';

    (_fileTree || []).forEach(function(g) {
        var count = g.files ? g.files.length : 0;
        foldersHtml += '<div class="folder-item' + (_selectedFolder === g.folder ? ' active' : '') + '" onclick="documentosSelectFolder(\'' + esc(g.folder) + '\')">' +
            folderSvg + '<span>' + esc(g.folder) + '</span><span class="folder-count">' + count + '</span></div>';
    });

    foldersEl.innerHTML = foldersHtml;

    // Gather files for selected folder
    var allFiles = [];
    (_fileTree || []).forEach(function(g) {
        if (_selectedFolder !== null && g.folder !== _selectedFolder) return;
        (g.files || []).forEach(function(f) {
            allFiles.push({ name: f.name, path: f.path, size: f.size, modified: f.modified, folder: g.folder });
        });
    });

    // Search filter
    var search = ($('#documentos-search') || {}).value || '';
    var term = search.toLowerCase();
    if (term) {
        allFiles = allFiles.filter(function(f) {
            return f.name.toLowerCase().indexOf(term) !== -1 ||
                   f.folder.toLowerCase().indexOf(term) !== -1;
        });
    }

    // Sort by modified desc
    allFiles.sort(function(a, b) { return (b.modified || '').localeCompare(a.modified || ''); });

    if (allFiles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">' + t('sen_resultados') + '</td></tr>';
        _docsPager.setTotal(0);
        _docsPager.render();
        return;
    }

    // Paginate
    _docsPager.setTotal(allFiles.length);
    var paged = _docsPager.slice(allFiles);

    var isSocio = AppState.isSocio();
    var html = '';

    paged.forEach(function(f) {
        var downloadSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
        var deleteSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>';

        var actions = '<a href="' + esc(uploadUrl(f.path)) + '" target="_blank" class="btn-icon" title="Download">' + downloadSvg + '</a>';
        if (isSocio) {
            actions += '<button class="btn-icon btn-danger" onclick="documentosDeleteFile(this.dataset.path)" data-path="' + esc(f.path) + '" title="' + t('eliminar') + '">' + deleteSvg + '</button>';
        }

        html += '<tr>' +
            '<td>' + esc(f.name) + '</td>' +
            '<td><span class="badge">' + esc(f.folder) + '</span></td>' +
            '<td>' + formatFileSize(f.size) + '</td>' +
            '<td>' + esc(f.modified || '') + '</td>' +
            '<td class="actions-cell">' + actions + '</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
    _docsPager.render();
}

function documentosSelectFolder(folder) {
    _selectedFolder = folder;
    _docsPager.currentPage = 1;
    documentosRender();
}

async function documentosDeleteFile(path) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/arquivos', { method: 'DELETE', body: { path: path } });
        toast(t('exito'), 'success');
        documentosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function formatFileSize(bytes) {
    if (bytes == null) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// ---- Upload modal (existing document CRUD — uploads to documentos/) ----

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
