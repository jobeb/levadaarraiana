/**
 * Galeria — Gallery / Albums management module
 * With advanced photo editor: DnD reorder, delete, metadata, cover selection, append
 */

async function galeriaLoad() {
    try {
        AppState.albums = await api('/albums');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.albums = [];
    }
    galeriaRender();
}

// ---- Helpers: defensive extractors for foto objects ----

function _fotoPath(foto) {
    if (typeof foto === 'string') return foto;
    return (foto && (foto.path || foto.url)) || '';
}

function _fotoTitulo(foto) {
    return (foto && typeof foto === 'object' && foto.titulo) || '';
}

function _fotoAlt(foto) {
    return (foto && typeof foto === 'object' && foto.alt) || '';
}

function _fotoDestacada(foto) {
    return (foto && typeof foto === 'object' && foto.destacada) ? true : false;
}

function _isYoutubeUrl(src) {
    return src && src.indexOf('youtube.com/embed/') !== -1;
}

function _youtubeIdFromUrl(src) {
    var m = src.match(/youtube\.com\/embed\/([^?&#]+)/);
    return m ? m[1] : '';
}

function _youtubeThumbUrl(src) {
    var id = _youtubeIdFromUrl(src);
    return id ? 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' : '';
}

// ---- Editor state ----

var _editorPhotos = [];     // [{path, titulo, alt, _data, _ext, _nome, _objectUrl}, ...]
var _editorPortada = null;  // path string of the cover photo
var _editorAlbumId = null;
var _editorSelectedIdx = -1;

// ---- Render album grid ----

function galeriaRender() {
    var grid = $('#galeria-grid');
    if (!grid) return;

    var list = AppState.albums || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isSocio();
    var html = '';

    list.forEach(function(album) {
        var coverSrc = '';
        if (album.portada) {
            coverSrc = uploadUrl(album.portada);
        } else if (album.fotos && album.fotos.length > 0) {
            coverSrc = uploadUrl(_fotoPath(album.fotos[0]));
        }

        var coverIsYT = _isYoutubeUrl(coverSrc);
        var imgHtml;
        if (coverSrc && coverIsYT) {
            imgHtml = '<div class="card-img card-img-yt" style="position:relative">' +
                '<iframe src="' + esc(coverSrc) + '?controls=0&modestbranding=1&rel=0" loading="lazy" allow="accelerometer;autoplay;encrypted-media;gyroscope" allowfullscreen style="width:100%;height:100%;border:none;pointer-events:none"></iframe>' +
                '<div style="position:absolute;inset:0;cursor:pointer" onclick="galeriaView(' + album.id + ')"></div>' +
                '</div>';
        } else if (coverSrc) {
            imgHtml = '<div class="card-img" onclick="galeriaView(' + album.id + ')"><img src="' + esc(coverSrc) + '" alt=""></div>';
        } else {
            imgHtml = '<div class="card-img card-img-placeholder" onclick="galeriaView(' + album.id + ')"><span>' + t('album') + '</span></div>';
        }

        var photoCount = album.fotos ? album.fotos.length : 0;

        var actions = '';
        if (isAdmin) {
            actions = '<div class="card-actions">' +
                '<button class="btn-icon" onclick="galeriaModal(AppState.albums.find(x=>x.id==' + album.id + '))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
                '<button class="btn-icon btn-danger" onclick="galeriaDelete(' + album.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>' +
                '</div>';
        }

        html += '<div class="card">' +
            imgHtml +
            '<div class="card-body">' +
                '<h3 class="card-title" style="cursor:pointer" onclick="galeriaView(' + album.id + ')">' + esc(album.titulo) + '</h3>' +
                (album.descricion ? '<p class="card-text">' + esc(truncate(album.descricion, 80)) + '</p>' : '') +
                '<div class="card-meta">' +
                    '<span>' + formatDate(album.data) + '</span>' +
                    '<span>' + photoCount + ' ' + t('fotos') + '</span>' +
                '</div>' +
                actions +
            '</div>' +
            '</div>';
    });

    grid.innerHTML = html;
}

// ---- View album (lightbox) ----

function galeriaView(id) {
    var album = (AppState.albums || []).find(function(a) { return a.id === id; });
    if (!album) return;

    var fotos = album.fotos || [];

    // Remove modal-lg if present from edit mode
    var modalBox = $('#modal-box');
    if (modalBox) modalBox.classList.remove('modal-lg');

    $('#modal-title').textContent = esc(album.titulo);

    if (fotos.length === 0) {
        $('#modal-body').innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
    } else {
        var photoUrls = fotos.map(function(foto) { return uploadUrl(_fotoPath(foto)); });
        // Store foto objects for caption access
        window._galeriaCurrentFotos = fotos;
        var html = '<div class="photo-grid">';
        photoUrls.forEach(function(fullSrc, idx) {
            var alt = _fotoAlt(fotos[idx]);
            var isYT = _isYoutubeUrl(fullSrc);
            var isVideo = /\.(mp4|webm|ogg)$/i.test(fullSrc);
            if (isYT) {
                html += '<div class="photo-thumb photo-thumb-video photo-thumb-yt" style="position:relative">' +
                    '<iframe src="' + esc(fullSrc) + '?controls=0&modestbranding=1&rel=0" loading="lazy" allow="accelerometer;autoplay;encrypted-media;gyroscope" style="width:100%;height:100%;border:none;pointer-events:none"></iframe>' +
                    '<div style="position:absolute;inset:0;cursor:pointer" onclick="galeriaLightbox(\'' + esc(fullSrc).replace(/'/g, "\\'") + '\', _galeriaCurrentPhotos, ' + idx + ')"></div>' +
                    '</div>';
            } else if (isVideo) {
                html += '<div class="photo-thumb photo-thumb-video" onclick="galeriaLightbox(\'' + esc(fullSrc).replace(/'/g, "\\'") + '\', _galeriaCurrentPhotos, ' + idx + ')">' +
                    '<video src="' + esc(fullSrc) + '" preload="metadata" muted style="width:100%;height:100%;object-fit:cover"></video>' +
                    '<span class="video-play-icon">&#9654;</span>' +
                    '</div>';
            } else {
                html += '<div class="photo-thumb" onclick="galeriaLightbox(\'' + esc(fullSrc).replace(/'/g, "\\'") + '\', _galeriaCurrentPhotos, ' + idx + ')">' +
                    '<img src="' + esc(fullSrc) + '" alt="' + esc(alt) + '">' +
                    '</div>';
            }
        });
        html += '</div>';
        window._galeriaCurrentPhotos = photoUrls;

        if (album.descricion) {
            html = '<p style="margin-bottom:16px">' + nl2br(album.descricion) + '</p>' + html;
        }

        $('#modal-body').innerHTML = html;
    }

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('voltar') + '</button>';

    showModal('modal-overlay');
}

// ---- Lightbox ----

var _lightboxPhotos = [];
var _lightboxIndex = 0;

function galeriaLightbox(src, photos, idx) {
    _lightboxPhotos = photos || [src];
    _lightboxIndex = idx || 0;
    _lightboxShow();
}

function _lightboxShow() {
    var lb = $('#lightbox');
    var img = $('#lightbox-img');
    var vid = $('#lightbox-video');
    var ytIframe = $('#lightbox-youtube');
    var counter = $('#lightbox-counter');
    var caption = $('#lightbox-caption');
    if (!lb || !img) return;

    var src = _lightboxPhotos[_lightboxIndex] || '';
    var isYT = _isYoutubeUrl(src);
    var isVideo = /\.(mp4|webm|ogg)$/i.test(src);

    if (isYT) {
        img.style.display = 'none';
        if (vid) { vid.pause(); vid.removeAttribute('src'); vid.style.display = 'none'; }
        if (ytIframe) { ytIframe.src = src + '?autoplay=1'; ytIframe.style.display = ''; }
    } else if (isVideo) {
        img.style.display = 'none';
        if (ytIframe) { ytIframe.removeAttribute('src'); ytIframe.style.display = 'none'; }
        if (vid) { vid.src = src; vid.style.display = ''; }
    } else {
        if (vid) { vid.pause(); vid.removeAttribute('src'); vid.style.display = 'none'; }
        if (ytIframe) { ytIframe.removeAttribute('src'); ytIframe.style.display = 'none'; }
        img.src = src;
        img.style.display = '';
    }

    lb.classList.add('show');

    if (counter) {
        counter.textContent = (_lightboxIndex + 1) + ' / ' + _lightboxPhotos.length;
        counter.style.display = _lightboxPhotos.length > 1 ? '' : 'none';
    }

    // Caption from foto metadata
    if (caption) {
        var fotoObj = window._galeriaCurrentFotos && window._galeriaCurrentFotos[_lightboxIndex];
        var titulo = _fotoTitulo(fotoObj);
        caption.textContent = titulo;
        caption.style.display = titulo ? '' : 'none';
    }

    var prevBtn = lb.querySelector('.lightbox-prev');
    var nextBtn = lb.querySelector('.lightbox-next');
    if (prevBtn) prevBtn.style.display = _lightboxPhotos.length > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = _lightboxPhotos.length > 1 ? '' : 'none';
}

function galeriaLightboxNav(dir) {
    _lightboxIndex += dir;
    if (_lightboxIndex < 0) _lightboxIndex = _lightboxPhotos.length - 1;
    if (_lightboxIndex >= _lightboxPhotos.length) _lightboxIndex = 0;
    _lightboxShow();
}

function galeriaCloseLightbox() {
    var lb = $('#lightbox');
    var vid = $('#lightbox-video');
    var ytIframe = $('#lightbox-youtube');
    if (vid) { vid.pause(); vid.removeAttribute('src'); vid.style.display = 'none'; }
    if (ytIframe) { ytIframe.removeAttribute('src'); ytIframe.style.display = 'none'; }
    if (lb) lb.classList.remove('show');
    var caption = $('#lightbox-caption');
    if (caption) { caption.textContent = ''; caption.style.display = 'none'; }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    var lb = $('#lightbox');
    if (!lb || !lb.classList.contains('show')) return;
    if (e.key === 'Escape') galeriaCloseLightbox();
    else if (e.key === 'ArrowLeft') galeriaLightboxNav(-1);
    else if (e.key === 'ArrowRight') galeriaLightboxNav(1);
});

// Touch swipe support
(function() {
    var touchStartX = 0;
    document.addEventListener('touchstart', function(e) {
        var lb = $('#lightbox');
        if (lb && lb.classList.contains('show')) touchStartX = e.changedTouches[0].screenX;
    });
    document.addEventListener('touchend', function(e) {
        var lb = $('#lightbox');
        if (!lb || !lb.classList.contains('show')) return;
        var diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) {
            galeriaLightboxNav(diff > 0 ? -1 : 1);
        }
    });
})();

// ---- Modal: Edit/Create Album with Photo Editor ----

function galeriaModal(album) {
    var isEdit = album && album.id;
    var title = isEdit ? t('editar') + ' ' + t('album') : t('novo_album');

    // Initialize editor state
    _editorAlbumId = isEdit ? album.id : null;
    _editorSelectedIdx = -1;
    _editorPhotos = [];
    _editorPortada = (isEdit && album.portada) ? album.portada : null;

    if (isEdit && album.fotos && album.fotos.length > 0) {
        album.fotos.forEach(function(foto) {
            _editorPhotos.push({
                path: _fotoPath(foto),
                titulo: _fotoTitulo(foto),
                alt: _fotoAlt(foto),
                destacada: _fotoDestacada(foto),
                _data: null,
                _ext: null,
                _nome: null,
                _objectUrl: null
            });
        });
    }

    // Make modal wide
    var modalBox = $('#modal-box');
    if (modalBox) modalBox.classList.add('modal-lg');

    $('#modal-title').textContent = title;

    $('#modal-body').innerHTML =
        '<input type="hidden" id="album-id" value="' + (isEdit ? album.id : '') + '">' +
        _renderModalLangBar() +
        '<div class="form-group">' +
            '<label class="required">' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="album-titulo" value="' + esc(isEdit ? album.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion') + '</label>' +
            '<textarea class="form-control" id="album-descricion" rows="2">' + esc(isEdit ? album.descricion || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('data') + '</label>' +
            '<input type="date" class="form-control" id="album-data" value="' + (isEdit ? album.data || today() : today()) + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('fotos') + '</label>' +
            '<div id="photo-editor-grid" class="photo-editor-grid"></div>' +
            '<p class="photo-editor-hint" id="photo-editor-hint">' + t('arrastra_reordenar') + '</p>' +
            '<div style="margin-top:8px">' +
                '<button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById(\'album-fotos-input\').click()">+ ' + t('engadir') + ' ' + t('fotos') + '</button>' +
                '<input type="file" id="album-fotos-input" accept="image/*,video/*" multiple style="display:none" onchange="_handleNewPhotos(this.files)">' +
            '</div>' +
        '</div>' +
        '<div id="photo-detail-panel"></div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="_galeriaModalClose()">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="galeriaSave()">' + t('gardar') + '</button>';

    _initModalI18n([
        { key: 'titulo', inputId: 'album-titulo', type: 'input' },
        { key: 'descricion', inputId: 'album-descricion', type: 'textarea' }
    ], isEdit ? album : null);

    showModal('modal-overlay');
    _renderEditorGrid();
}

function _galeriaModalClose() {
    // Revoke any created ObjectURLs
    _editorPhotos.forEach(function(p) {
        if (p._objectUrl) URL.revokeObjectURL(p._objectUrl);
    });
    _editorPhotos = [];
    _editorSelectedIdx = -1;
    var modalBox = $('#modal-box');
    if (modalBox) modalBox.classList.remove('modal-lg');
    hideModal('modal-overlay');
}

// ---- Render editor grid ----

function _renderEditorGrid() {
    var container = $('#photo-editor-grid');
    if (!container) return;

    if (_editorPhotos.length === 0) {
        container.innerHTML = '<p class="text-center text-dim" style="grid-column:1/-1;padding:20px 0">' + t('sen_resultados') + '</p>';
        var hint = $('#photo-editor-hint');
        if (hint) hint.style.display = 'none';
        return;
    }

    var hint = $('#photo-editor-hint');
    if (hint) hint.style.display = _editorPhotos.length > 1 ? '' : 'none';

    var html = '';
    _editorPhotos.forEach(function(foto, idx) {
        var thumbSrc = '';
        var isYT = false;
        if (foto._objectUrl) {
            thumbSrc = foto._objectUrl;
        } else if (foto.path) {
            var full = uploadUrl(foto.path);
            if (_isYoutubeUrl(full)) {
                isYT = true;
                thumbSrc = full;
            } else {
                thumbSrc = full;
            }
        }

        var isCover = _editorPortada && foto.path && foto.path === _editorPortada;
        var isFav = foto.destacada;
        var isSelected = idx === _editorSelectedIdx;
        var isVideo = foto._objectUrl && foto._isVideo;

        var thumbHtml;
        if (isYT) {
            thumbHtml = '<iframe src="' + esc(thumbSrc) + '?controls=0&modestbranding=1&rel=0" loading="lazy" style="width:100%;height:100%;border:none;pointer-events:none"></iframe>';
        } else if (isVideo) {
            thumbHtml = '<video src="' + esc(thumbSrc) + '" muted preload="metadata"></video>';
        } else {
            thumbHtml = '<img src="' + esc(thumbSrc) + '" alt="' + esc(foto.alt || '') + '">';
        }

        html += '<div class="photo-editor-item' + (isCover ? ' is-cover' : '') + (isSelected ? ' selected' : '') + '" ' +
            'draggable="true" data-photo-idx="' + idx + '">' +
            '<div class="photo-editor-thumb" onclick="_photoSelect(' + idx + ')">' + thumbHtml + '</div>' +
            '<div class="photo-editor-actions">' +
                '<button type="button" class="cover-btn' + (isCover ? ' active' : '') + '" onclick="_photoSetCover(' + idx + ')" title="' + t('definir_portada') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>' +
                '<button type="button" class="fav-btn' + (isFav ? ' active' : '') + '" onclick="_photoToggleFav(' + idx + ')" title="' + t('fotos_destacadas') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="' + (isFav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>' +
                '<button type="button" class="delete-btn" onclick="_photoRemove(' + idx + ')" title="' + t('eliminar_foto') + '">&times;</button>' +
            '</div>' +
            (foto.titulo ? '<div class="photo-editor-caption">' + esc(foto.titulo) + '</div>' : '') +
            '</div>';
    });

    container.innerHTML = html;
    _initPhotoDnD(container);
}

// ---- Photo selection / detail panel ----

function _photoSelect(idx) {
    _editorSelectedIdx = idx;
    _renderEditorGrid();

    var foto = _editorPhotos[idx];
    if (!foto) return;

    var panel = $('#photo-detail-panel');
    if (!panel) return;

    panel.innerHTML =
        '<div class="photo-detail-panel">' +
            '<div class="form-group">' +
                '<label>' + t('foto_titulo') + '</label>' +
                '<input type="text" class="form-control" id="photo-detail-titulo" value="' + esc(foto.titulo || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label>' + t('foto_alt') + '</label>' +
                '<input type="text" class="form-control" id="photo-detail-alt" value="' + esc(foto.alt || '') + '">' +
            '</div>' +
            '<div style="display:flex;gap:8px">' +
                '<button type="button" class="btn btn-sm btn-primary" onclick="_photoDetailSave()">' + t('gardar') + '</button>' +
                '<button type="button" class="btn btn-sm btn-secondary" onclick="_photoDetailClose()">' + t('cancelar') + '</button>' +
            '</div>' +
        '</div>';
}

function _photoDetailSave() {
    if (_editorSelectedIdx < 0 || !_editorPhotos[_editorSelectedIdx]) return;
    var tituloEl = $('#photo-detail-titulo');
    var altEl = $('#photo-detail-alt');
    _editorPhotos[_editorSelectedIdx].titulo = tituloEl ? tituloEl.value : '';
    _editorPhotos[_editorSelectedIdx].alt = altEl ? altEl.value : '';
    _editorSelectedIdx = -1;
    _photoDetailClose();
    _renderEditorGrid();
}

function _photoDetailClose() {
    _editorSelectedIdx = -1;
    var panel = $('#photo-detail-panel');
    if (panel) panel.innerHTML = '';
    _renderEditorGrid();
}

// ---- Set cover ----

function _photoSetCover(idx) {
    var foto = _editorPhotos[idx];
    if (!foto) return;
    // For new photos without a path yet, use index marker
    _editorPortada = foto.path || ('__new__' + idx);
    _renderEditorGrid();
}

// ---- Toggle favorite ----

function _photoToggleFav(idx) {
    var foto = _editorPhotos[idx];
    if (!foto) return;
    foto.destacada = !foto.destacada;
    _renderEditorGrid();
}

// ---- Remove photo ----

function _photoRemove(idx) {
    var foto = _editorPhotos[idx];
    if (!foto) return;
    if (foto._objectUrl) URL.revokeObjectURL(foto._objectUrl);
    // If removing the cover, clear it
    if (_editorPortada && foto.path && foto.path === _editorPortada) {
        _editorPortada = null;
    }
    _editorPhotos.splice(idx, 1);
    if (_editorSelectedIdx === idx) _editorSelectedIdx = -1;
    else if (_editorSelectedIdx > idx) _editorSelectedIdx--;
    _renderEditorGrid();
    _photoDetailClose();
}

// ---- Append new photos ----

async function _handleNewPhotos(files) {
    if (!files || files.length === 0) return;
    var videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var ext = (file.name.split('.').pop() || '').toLowerCase();
        var isVideoFile = videoExts.indexOf(ext) !== -1 || file.type.startsWith('video/');

        if (isVideoFile) {
            // Try YouTube upload, fallback to base64
            toast('Subindo vídeo ' + file.name + ' a YouTube...', 'info');
            try {
                var b64v = await fileToBase64(file);
                var titulo = ($('#album-titulo') || {}).value || 'Levada Arraiana';
                var ytResult = await api('/youtube/upload', {
                    method: 'POST',
                    body: {
                        title: titulo,
                        description: '',
                        video_data: b64v.data,
                        video_ext: ext || 'mp4'
                    }
                });
                if (ytResult.youtube_url) {
                    _editorPhotos.push({
                        path: ytResult.youtube_url,
                        titulo: '', alt: '', destacada: false,
                        _data: null, _ext: null, _nome: null, _objectUrl: null
                    });
                    toast('Vídeo subido a YouTube', 'success');
                }
            } catch (ytErr) {
                toast('Erro YouTube: ' + ytErr.message + '. Gardando como ficheiro.', 'error');
                var b64fallback = await fileToBase64(file);
                var objUrl = URL.createObjectURL(file);
                _editorPhotos.push({
                    path: '',
                    titulo: '', alt: '', destacada: false,
                    _data: b64fallback.data, _ext: ext, _nome: file.name,
                    _objectUrl: objUrl, _isVideo: true
                });
            }
        } else {
            var b64 = await imageToBase64(file);
            var objUrl2 = URL.createObjectURL(file);
            _editorPhotos.push({
                path: '',
                titulo: '', alt: '', destacada: false,
                _data: b64.data, _ext: ext, _nome: file.name,
                _objectUrl: objUrl2
            });
        }
    }

    // Clear the input so the same files can be selected again
    var inp = $('#album-fotos-input');
    if (inp) inp.value = '';

    _renderEditorGrid();
}

// ---- Drag and drop reorder ----

function _initPhotoDnD(container) {
    if (!container) return;
    var dragEl = null;

    container.addEventListener('dragstart', function(e) {
        dragEl = e.target.closest('.photo-editor-item');
        if (dragEl) {
            dragEl.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        var target = e.target.closest('.photo-editor-item');
        if (target && target !== dragEl) {
            var rect = target.getBoundingClientRect();
            var midX = rect.left + rect.width / 2;
            if (e.clientX < midX) {
                container.insertBefore(dragEl, target);
            } else {
                container.insertBefore(dragEl, target.nextSibling);
            }
        }
    });

    container.addEventListener('dragend', function() {
        if (dragEl) dragEl.classList.remove('dragging');
        dragEl = null;
        // Sync _editorPhotos array with new DOM order
        var newOrder = [];
        container.querySelectorAll('.photo-editor-item').forEach(function(el) {
            var idx = parseInt(el.dataset.photoIdx);
            if (_editorPhotos[idx]) newOrder.push(_editorPhotos[idx]);
        });
        _editorPhotos = newOrder;
        _editorSelectedIdx = -1;
        _renderEditorGrid();
    });
}

// ---- Save ----

async function galeriaSave() {
    var btn = $('#modal-footer .btn-primary');
    if (btn) { btn.disabled = true; btn.textContent = t('gardando'); }

    try {
        var id = ($('#album-id') || {}).value;
        var isEdit = !!id;

        _saveModalLangValues();
        var glData = _modalI18n.data.gl || {};

        var body = {
            titulo: glData.titulo || ($('#album-titulo') || {}).value || '',
            descricion: glData.descricion || ($('#album-descricion') || {}).value || '',
            data: ($('#album-data') || {}).value || today(),
            i18n: _collectModalI18n()
        };

        // Build fotos array from editor state
        var fotos = [];
        for (var i = 0; i < _editorPhotos.length; i++) {
            var p = _editorPhotos[i];
            if (p._data) {
                // New photo: send base64 data
                fotos.push({
                    data: p._data,
                    ext: p._ext || 'jpg',
                    nome: p._nome || ('foto_' + i + '.' + (p._ext || 'jpg')),
                    titulo: p.titulo || '',
                    alt: p.alt || '',
                    destacada: p.destacada || false
                });
            } else if (p.path) {
                // Existing photo or YouTube URL: send path + metadata
                fotos.push({
                    path: p.path,
                    titulo: p.titulo || '',
                    alt: p.alt || '',
                    destacada: p.destacada || false
                });
            }
        }
        if (fotos.length > 0) {
            body.fotos = fotos;
        }

        // Cover: if a specific cover was chosen, send portada_path
        if (_editorPortada && typeof _editorPortada === 'string' && _editorPortada.indexOf('__new__') !== 0) {
            body.portada_path = _editorPortada;
        }

        if (isEdit) {
            await api('/albums/' + id, { method: 'PUT', body: body });
        } else {
            await api('/albums', { method: 'POST', body: body });
        }
        _galeriaModalClose();
        toast(t('exito'), 'success');
        galeriaLoad();
    } catch (e) {
        console.error('galeriaSave error:', e);
        toast(t('erro') + ': ' + (e.message || e), 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = t('gardar'); }
    }
}

async function galeriaDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/albums/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        galeriaLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
