/**
 * Documentos — Unified file browser + document upload
 */
var _docsPager = new Paginator('documentos-pagination', { perPage: 20, onChange: function() { documentosRender(); } });
var _fileTree = [];
var _selectedFolder = null;
var _docsSortCol = 'modified';
var _docsSortAsc = false;
var _uploadFiles = [];

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

// ---- File type icon SVGs ----

function _fileTypeIcon(filename) {
    var ext = (filename || '').split('.').pop().toLowerCase();
    var cat = _fileCategory(filename);
    var svg = '';
    switch (cat) {
        case 'image':
            svg = '<svg class="file-icon file-icon-image" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
            break;
        case 'pdf':
            svg = '<svg class="file-icon file-icon-pdf" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
            break;
        case 'video':
            svg = '<svg class="file-icon file-icon-video" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
            break;
        case 'audio':
            svg = '<svg class="file-icon file-icon-audio" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
            break;
        case 'doc':
            svg = '<svg class="file-icon file-icon-doc" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
            break;
        default:
            svg = '<svg class="file-icon file-icon-other" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>';
    }
    return svg;
}

function _fileCategory(filename) {
    var ext = (filename || '').split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','webp','svg'].indexOf(ext) !== -1) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['mp4','webm','mov','ogg'].indexOf(ext) !== -1) return 'video';
    if (['mp3','wav','m4a'].indexOf(ext) !== -1) return 'audio';
    if (['doc','docx','xls','xlsx','ppt','pptx','txt','odt','ods'].indexOf(ext) !== -1) return 'doc';
    return 'other';
}

// ---- Preview ----

function documentosPreview(path, name) {
    var cat = _fileCategory(name);
    var url = uploadUrl(path);

    if (cat === 'image') {
        // Use existing lightbox — single image, no nav
        _lightboxPhotos = [url];
        _lightboxIndex = 0;
        _lightboxShow();
    } else if (cat === 'video' || cat === 'audio') {
        // Use lightbox video element (supports audio too)
        var lb = $('#lightbox');
        var img = $('#lightbox-img');
        var vid = $('#lightbox-video');
        var ytIframe = $('#lightbox-youtube');
        var counter = $('#lightbox-counter');
        var caption = $('#lightbox-caption');
        if (!lb) return;
        if (img) img.style.display = 'none';
        if (ytIframe) { ytIframe.removeAttribute('src'); ytIframe.style.display = 'none'; }
        if (vid) { vid.src = url; vid.style.display = ''; }
        if (counter) counter.style.display = 'none';
        if (caption) { caption.textContent = name; caption.style.display = ''; }
        // Hide nav buttons
        var prevBtn = lb.querySelector('.lightbox-prev');
        var nextBtn = lb.querySelector('.lightbox-next');
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        _lightboxPhotos = [];
        _lightboxIndex = 0;
        lb.classList.add('show');
    } else if (cat === 'pdf') {
        window.open(url, '_blank');
    } else {
        // Direct download
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

// ---- Render ----

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

    // Dynamic sort
    allFiles.sort(function(a, b) {
        var va, vb;
        if (_docsSortCol === 'size') {
            va = a.size || 0;
            vb = b.size || 0;
            return _docsSortAsc ? va - vb : vb - va;
        }
        va = (a[_docsSortCol] || '').toLowerCase();
        vb = (b[_docsSortCol] || '').toLowerCase();
        var cmp = va.localeCompare(vb);
        return _docsSortAsc ? cmp : -cmp;
    });

    if (allFiles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">' + t('sen_resultados') + '</td></tr>';
        _docsPager.setTotal(0);
        _docsPager.render();
        _updateSortIndicators();
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
            '<td><div class="file-name-cell">' + _fileTypeIcon(f.name) + '<a class="file-preview-link" href="javascript:void(0)" onclick="documentosPreview(\'' + esc(f.path).replace(/'/g, "\\'") + '\',\'' + esc(f.name).replace(/'/g, "\\'") + '\')">' + esc(f.name) + '</a></div></td>' +
            '<td><span class="badge">' + esc(f.folder) + '</span></td>' +
            '<td>' + formatFileSize(f.size) + '</td>' +
            '<td>' + esc(f.modified || '') + '</td>' +
            '<td class="actions-cell">' + actions + '</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
    _docsPager.render();
    _updateSortIndicators();
}

// ---- Sort indicators ----

function _updateSortIndicators() {
    var ths = document.querySelectorAll('#documentos-table th.sortable');
    ths.forEach(function(th) {
        var col = th.getAttribute('data-sort');
        // Remove existing arrow
        var arrow = th.querySelector('.sort-arrow');
        if (arrow) arrow.remove();
        if (col === _docsSortCol) {
            var span = document.createElement('span');
            span.className = 'sort-arrow';
            span.textContent = _docsSortAsc ? ' \u25B2' : ' \u25BC';
            th.appendChild(span);
        }
    });
}

function _docsSortBy(col) {
    if (_docsSortCol === col) {
        _docsSortAsc = !_docsSortAsc;
    } else {
        _docsSortCol = col;
        _docsSortAsc = true;
    }
    _docsPager.currentPage = 1;
    documentosRender();
}

// Bind sortable headers (called once after render)
(function() {
    document.addEventListener('click', function(e) {
        var th = e.target.closest('#documentos-table th.sortable');
        if (!th) return;
        var col = th.getAttribute('data-sort');
        if (col) _docsSortBy(col);
    });
})();

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

// ---- Upload modal (multi-file + drag & drop) ----

function documentosModal() {
    _uploadFiles = [];

    var title = t('subir_arquivos');
    $('#modal-title').textContent = title;

    // Build folder options from _fileTree
    var folderOpts = '';
    (_fileTree || []).forEach(function(g) {
        var sel = g.folder === 'documentos' ? ' selected' : '';
        folderOpts += '<option value="' + esc(g.folder) + '"' + sel + '>' + esc(g.folder) + '</option>';
    });
    if (!folderOpts) {
        folderOpts = '<option value="documentos">documentos</option>';
    }

    $('#modal-body').innerHTML =
        '<div class="form-group">' +
            '<label>' + t('carpeta') + '</label>' +
            '<select class="form-control" id="upload-folder">' + folderOpts + '</select>' +
        '</div>' +
        '<div class="drop-zone" id="upload-drop-zone">' +
            '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted)"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '<p>' + t('arrastra_arquivos') + '</p>' +
            '<button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById(\'upload-file-input\').click()">' + t('seleccionar_arquivos') + '</button>' +
            '<input type="file" multiple id="upload-file-input" style="display:none" onchange="_uploadAddFiles(this.files)">' +
        '</div>' +
        '<div id="upload-file-list"></div>' +
        '<div id="upload-summary" style="display:none"></div>' +
        '<div class="upload-progress" id="upload-progress" style="display:none">' +
            '<div class="upload-progress-bar" id="upload-progress-bar"></div>' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" id="upload-btn" onclick="documentosUploadAll()" disabled>' + t('subir') + '</button>';

    showModal('modal-overlay');
    _initDropZone();
}

function _initDropZone() {
    var zone = $('#upload-drop-zone');
    if (!zone) return;

    zone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files) {
            _uploadAddFiles(e.dataTransfer.files);
        }
    });
}

function _uploadAddFiles(fileList) {
    for (var i = 0; i < fileList.length; i++) {
        // Avoid duplicates by name+size
        var f = fileList[i];
        var exists = _uploadFiles.some(function(u) { return u.name === f.name && u.size === f.size; });
        if (!exists) _uploadFiles.push(f);
    }
    _renderUploadList();
    // Reset input so same file can be re-added
    var inp = $('#upload-file-input');
    if (inp) inp.value = '';
}

function _uploadRemoveFile(idx) {
    _uploadFiles.splice(idx, 1);
    _renderUploadList();
}

function _renderUploadList() {
    var list = $('#upload-file-list');
    var summary = $('#upload-summary');
    var btn = $('#upload-btn');
    if (!list) return;

    if (_uploadFiles.length === 0) {
        list.innerHTML = '';
        if (summary) summary.style.display = 'none';
        if (btn) btn.disabled = true;
        return;
    }

    var html = '';
    var totalSize = 0;
    _uploadFiles.forEach(function(f, i) {
        totalSize += f.size || 0;
        html += '<div class="upload-file-item">' +
            _fileTypeIcon(f.name) +
            '<span class="upload-file-name">' + esc(f.name) + '</span>' +
            '<span class="upload-file-size">' + formatFileSize(f.size) + '</span>' +
            '<button type="button" class="btn-icon btn-danger btn-sm" onclick="_uploadRemoveFile(' + i + ')" title="' + t('eliminar') + '">&times;</button>' +
        '</div>';
    });
    list.innerHTML = html;

    if (summary) {
        summary.style.display = '';
        summary.textContent = _uploadFiles.length + ' ' + t('ficheiros') + ' — ' + formatFileSize(totalSize);
    }
    if (btn) btn.disabled = false;
}

async function documentosUploadAll() {
    if (_uploadFiles.length === 0) return;

    var folder = ($('#upload-folder') || {}).value || 'documentos';
    var progress = $('#upload-progress');
    var bar = $('#upload-progress-bar');
    var btn = $('#upload-btn');
    if (btn) btn.disabled = true;
    if (progress) progress.style.display = '';

    var total = _uploadFiles.length;
    var done = 0;
    var errors = 0;

    for (var i = 0; i < total; i++) {
        if (bar) bar.style.width = Math.round((done / total) * 100) + '%';

        var f = _uploadFiles[i];
        try {
            var b64 = await fileToBase64(f);
            await api('/arquivos/upload', {
                method: 'POST',
                body: {
                    dir: folder,
                    name: f.name,
                    data: b64.data,
                    type: f.type || ''
                }
            });
            done++;
        } catch (e) {
            errors++;
            done++;
        }
    }

    if (bar) bar.style.width = '100%';

    if (errors > 0) {
        toast(t('subidos') + ': ' + (total - errors) + '/' + total, 'warning');
    } else {
        toast(t('subidos') + ': ' + total + ' ' + t('ficheiros'), 'success');
    }

    hideModal('modal-overlay');
    _uploadFiles = [];
    documentosLoad();
}
