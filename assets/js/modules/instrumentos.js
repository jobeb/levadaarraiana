/**
 * Instrumentos — Showcase of instruments we use
 */

var _recordedBlob = null;
var _mediaRecorder = null;
var _mediaStream = null;

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

function _instrumentoMediaPlayer(path) {
    if (!path) return '';
    if (path.indexOf('youtube.com/embed/') !== -1) {
        return '<iframe src="' + esc(path) + '?rel=0&modestbranding=1" class="instrumento-media-player instrumento-yt-embed" allowfullscreen></iframe>';
    }
    var url = uploadUrl(path);
    var ext = (path.split('.').pop() || '').toLowerCase();
    if (['mp4','webm','mov'].indexOf(ext) !== -1) {
        return '<video controls class="instrumento-media-player"><source src="' + esc(url) + '"></video>';
    }
    return '<audio controls class="instrumento-media-player"><source src="' + esc(url) + '"></audio>';
}

function _instrumentoRecord(type) {
    var constraints = type === 'video' ? { audio: true, video: true } : { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        _mediaStream = stream;
        _recordedBlob = null;

        var mime = type === 'video' ? 'video/webm' : 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mime)) mime = '';
        _mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
        var chunks = [];
        _mediaRecorder.ondataavailable = function(e) { if (e.data.size > 0) chunks.push(e.data); };
        _mediaRecorder.onstop = function() {
            _recordedBlob = new Blob(chunks, { type: _mediaRecorder.mimeType || (type === 'video' ? 'video/webm' : 'audio/webm') });
            _recordedBlob._recType = type;
            _instrumentoStopRecord();
        };
        _mediaRecorder.start();

        // Show live preview + stop button
        var preview = $('#instrumento-audio-preview');
        if (preview) {
            var tag = type === 'video' ? 'video' : 'audio';
            preview.innerHTML = '<div class="instrumento-rec-live">' +
                '<' + tag + ' id="instrumento-rec-live" autoplay muted class="instrumento-media-player"></' + tag + '>' +
                '</div>' +
                '<button type="button" class="btn-rec btn-rec--recording" onclick="_instrumentoStopRecordBtn()" style="margin-top:8px">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg> ' +
                t('parar_gravacion') + '</button>';
            var liveEl = document.getElementById('instrumento-rec-live');
            if (liveEl) liveEl.srcObject = stream;
        }

        // Update record buttons state
        var btnsWrap = document.querySelector('.instrumento-rec-btns');
        if (btnsWrap) btnsWrap.style.display = 'none';
    }).catch(function(err) {
        toast(t('erro') + ': ' + err.message, 'error');
    });
}

function _instrumentoStopRecordBtn() {
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
        _mediaRecorder.stop();
    }
    if (_mediaStream) {
        _mediaStream.getTracks().forEach(function(t) { t.stop(); });
        _mediaStream = null;
    }
}

function _instrumentoStopRecord() {
    var preview = $('#instrumento-audio-preview');
    if (!preview || !_recordedBlob) return;

    var objUrl = URL.createObjectURL(_recordedBlob);
    var isVideo = _recordedBlob._recType === 'video';
    if (isVideo) {
        preview.innerHTML = '<video controls class="instrumento-media-player"><source src="' + objUrl + '"></video>';
    } else {
        preview.innerHTML = '<audio controls class="instrumento-media-player"><source src="' + objUrl + '"></audio>';
    }
    preview.innerHTML += '<button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="_instrumentoClearRecording()">' + t('eliminar') + '</button>';

    // Show record buttons again
    var btnsWrap = document.querySelector('.instrumento-rec-btns');
    if (btnsWrap) btnsWrap.style.display = 'flex';
}

function _instrumentoClearRecording() {
    _recordedBlob = null;
    var preview = $('#instrumento-audio-preview');
    if (preview) preview.innerHTML = '';
}

var _instrumentoUserCounts = {};

async function instrumentosLoad() {
    try {
        AppState.instrumentos = await api('/instrumentos');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.instrumentos = [];
    }
    _instrumentoUserCounts = {};
    if (AppState.isSocio()) {
        try {
            var users = await api('/usuarios');
            users.forEach(function(u) {
                if (u.instrumentos && u.instrumentos.length) {
                    u.instrumentos.forEach(function(inst) {
                        var iid = inst.instrumento_id;
                        _instrumentoUserCounts[iid] = (_instrumentoUserCounts[iid] || 0) + 1;
                    });
                } else if (u.instrumento) {
                    var match = (AppState.instrumentos || []).find(function(i) { return i.nome === u.instrumento; });
                    if (match) _instrumentoUserCounts[match.id] = (_instrumentoUserCounts[match.id] || 0) + 1;
                }
            });
        } catch (e) { /* ignore */ }
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
            descricionHtml = '<div class="rt-content instrumento-desc">' + sanitizeHtml(i.descricion) + '</div>';
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
                    '<h4>' + esc(i.nome) + (i.audio_mostra ? ' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;opacity:0.7" title="' + t('audio_mostra') + '"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>' : '') + (AppState.isSocio() && _instrumentoUserCounts[i.id] ? ' <span class="badge badge-info">' + _instrumentoUserCounts[i.id] + ' socios</span>' : '') + '</h4>' +
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
    _recordedBlob = null;
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
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('audio_mostra') + '</label>' +
            '<input type="file" class="form-control" id="instrumento-audio" accept="audio/*,video/mp4,video/webm">' +
            '<div class="instrumento-rec-btns">' +
                '<button type="button" class="btn-rec" onclick="_instrumentoRecord(\'audio\')">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg> ' +
                    t('gravar_audio') +
                '</button>' +
                '<button type="button" class="btn-rec" onclick="_instrumentoRecord(\'video\')">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> ' +
                    t('gravar_video') +
                '</button>' +
            '</div>' +
            (isEdit && item.audio_mostra ? '<div id="instrumento-audio-preview" class="instrumento-audio-preview">' + _instrumentoMediaPlayer(item.audio_mostra) + '<button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="$(\'#instrumento-audio-remove\').value=\'1\';this.parentNode.innerHTML=\'<em class=text-muted>' + t('eliminado') + '</em>\'">' + t('eliminar') + '</button><input type="hidden" id="instrumento-audio-remove" value=""></div>' : '<div id="instrumento-audio-preview"></div>') +
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

    // Live preview when selecting audio/video (clears any recording)
    var audioInput = $('#instrumento-audio');
    if (audioInput) {
        audioInput.addEventListener('change', function() {
            _recordedBlob = null;
            var preview = $('#instrumento-audio-preview');
            if (!preview) return;
            if (audioInput.files && audioInput.files[0]) {
                var file = audioInput.files[0];
                var objUrl = URL.createObjectURL(file);
                var isVideo = file.type.startsWith('video/');
                if (isVideo) {
                    preview.innerHTML = '<video controls class="instrumento-media-player"><source src="' + objUrl + '"></video>';
                } else {
                    preview.innerHTML = '<audio controls class="instrumento-media-player"><source src="' + objUrl + '"></audio>';
                }
            }
        });
    }

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>' +
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

    // Audio/video sample (from file input or recorded blob)
    var audioInput = $('#instrumento-audio');
    var mediaFile = null;
    if (_recordedBlob) {
        var recExt = _recordedBlob._recType === 'video' ? 'webm' : 'webm';
        mediaFile = new File([_recordedBlob], 'recording.' + recExt, { type: _recordedBlob.type });
    } else if (audioInput && audioInput.files && audioInput.files.length > 0) {
        mediaFile = audioInput.files[0];
    }
    if (mediaFile) {
        var mediaExt = (mediaFile.name.split('.').pop() || '').toLowerCase();
        var isVideoFile = mediaFile.type.startsWith('video/') || ['mp4','webm','ogg','mov','avi'].indexOf(mediaExt) !== -1;

        if (isVideoFile) {
            // Videos go to YouTube
            toast('Subindo vídeo a YouTube...', 'info');
            try {
                var vidB64 = await fileToBase64(mediaFile);
                var ytResult = await api('/youtube/upload', {
                    method: 'POST',
                    body: {
                        title: body.nome || 'Levada Arraiana',
                        description: 'Levada Arraiana — ' + (body.nome || ''),
                        video_data: vidB64.data,
                        video_ext: mediaExt || 'mp4'
                    }
                });
                if (ytResult.youtube_url) {
                    body.audio_mostra_youtube = ytResult.youtube_url;
                    toast('Vídeo subido a YouTube', 'success');
                }
            } catch (ytErr) {
                toast('Erro YouTube: ' + ytErr.message, 'error');
                return;
            }
        } else {
            // Audio files stay local
            var audioB64 = await fileToBase64(mediaFile);
            body.audio_mostra_data = audioB64.data;
            body.audio_mostra_name = audioB64.name;
        }
    }
    var removeAudio = ($('#instrumento-audio-remove') || {}).value;
    if (removeAudio === '1') {
        body.audio_mostra_remove = true;
    }

    try {
        if (isEdit) {
            await api('/instrumentos/' + id, { method: 'PUT', body: body });
        } else {
            await api('/instrumentos', { method: 'POST', body: body });
        }
        _recordedBlob = null;
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
    var descHtml = item.descricion ? '<div class="rt-content instrumento-view-desc">' + sanitizeHtml(item.descricion) + '</div>' : '';
    var audioHtml = item.audio_mostra ? '<div class="instrumento-view-audio"><label style="font-size:0.85rem;color:var(--text-dim);display:block;margin-bottom:4px">' + t('audio_mostra') + '</label>' + _instrumentoMediaPlayer(item.audio_mostra) + '</div>' : '';

    $('#modal-body').innerHTML =
        '<img src="' + esc(iconSrc) + '" alt="' + esc(item.nome) + '" class="instrumento-view-img">' +
        notasHtml +
        descHtml +
        audioHtml;

    var footerHtml = '';
    if (AppState.isSocio()) {
        footerHtml = '<button class="btn btn-primary" onclick="hideModal(\'modal-overlay\');instrumentosModal(AppState.instrumentos.find(function(x){return x.id==' + id + '}))">' + t('editar') + '</button>';
    }
    $('#modal-footer').innerHTML = footerHtml;

    showModal('modal-overlay');
}
