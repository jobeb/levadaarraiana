/**
 * Repertorio — Repertoire / rhythms module
 */

var _repPendingUploads = [];

async function repertorioLoad() {
    try {
        AppState.repertorio = await api('/repertorio');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.repertorio = [];
    }
    repertorioRender();
}

function _estructuraLabel(tipo) {
    switch (tipo) {
        case 'inicio': return t('inicio');
        case 'andamento': return t('andamento');
        case 'corte': return t('corte');
        case 'final': return t('final_cierre');
        default: return esc(tipo || '');
    }
}

function _estructuraBadgeClass(tipo) {
    switch (tipo) {
        case 'inicio': return 'badge-success';
        case 'final': return 'badge-danger';
        case 'corte': return 'badge-warning';
        default: return 'badge-info';
    }
}

function repertorioRender() {
    var grid = $('#repertorio-grid');
    if (!grid) return;

    var list = AppState.repertorio || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isSocio();
    var html = '';

    list.forEach(function(r) {
        var dificultadeBadge = '';
        switch (r.dificultade) {
            case 'facil':
                dificultadeBadge = '<span class="badge badge-success">' + t('facil') + '</span>';
                break;
            case 'media':
                dificultadeBadge = '<span class="badge badge-warning">' + t('media') + '</span>';
                break;
            case 'dificil':
                dificultadeBadge = '<span class="badge badge-danger">' + t('dificil') + '</span>';
                break;
            default:
                dificultadeBadge = '<span class="badge">' + esc(r.dificultade || '') + '</span>';
        }



        // Estructura sections
        var estructuraHtml = '';
        var partes = r.estructura || [];
        if (partes.length > 0) {
            estructuraHtml = '<div class="estructura-list">';
            var andIdx = 0;
            var corteIdx = 0;
            partes.forEach(function(p) {
                var label = _estructuraLabel(p.tipo);
                if (p.tipo === 'andamento') { andIdx++; label += ' ' + andIdx; }
                if (p.tipo === 'corte') { corteIdx++; label += ' ' + corteIdx; }
                estructuraHtml += '<div class="estructura-item">' +
                    '<span class="badge ' + _estructuraBadgeClass(p.tipo) + '">' + label + '</span>' +
                    (p.contido ? ' <span class="estructura-text">' + esc(p.contido) + '</span>' : '') +
                '</div>';
            });
            estructuraHtml += '</div>';
        }

        var audioHtml = '';
        if (r.arquivo_audio) {
            audioHtml = '<div style="margin-top:8px"><audio controls preload="none" style="width:100%"><source src="' + esc(uploadUrl(r.arquivo_audio)) + '"></audio></div>';
        }

        var partituraHtml = '';
        if (r.arquivo_partitura) {
            partituraHtml = '<div style="margin-top:6px"><a href="' + esc(uploadUrl(r.arquivo_partitura)) + '" target="_blank" class="btn btn-sm btn-secondary">' + t('partitura') + ' <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a></div>';
        }

        html += '<div class="card">' +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(r.nome) + '</h3>' +
                '<p class="card-meta">' + dificultadeBadge + '</p>' +
                (r.notas ? '<p class="card-text">' + esc(r.notas) + '</p>' : '') +
                estructuraHtml +
                audioHtml +
                partituraHtml +
            '</div>' +
            '<div class="card-actions">' +
                '<button class="btn-icon" onclick="repertorioMediosModal(' + r.id + ')" title="' + t('medios') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>' +
                (isAdmin ? '<button class="btn-icon" onclick="_repDownloadZip(' + r.id + ')" title="' + t('descargar_medios') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>' : '') +
                (isAdmin
                    ? '<button class="btn-icon" onclick="repertorioModal(AppState.repertorio.find(function(x){return x.id==' + r.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
                      '<button class="btn-icon btn-danger" onclick="repertorioDelete(' + r.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>'
                    : '') +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;
}

var _repEstructura = [];

function _repRenderEstructura() {
    var container = $('#rep-estructura-list');
    if (!container) return;
    var html = '';
    _repEstructura.forEach(function(p, idx) {
        var label = _estructuraLabel(p.tipo);
        var canRemove = (p.tipo === 'andamento' || p.tipo === 'corte');
        html += '<div class="estructura-editor-row" style="display:flex;gap:6px;align-items:center;margin-bottom:6px">' +
            '<span class="badge ' + _estructuraBadgeClass(p.tipo) + '" style="min-width:90px;text-align:center">' + label + '</span>' +
            '<input type="text" class="form-control" value="' + esc(p.contido || '') + '" oninput="_repEstructura[' + idx + '].contido=this.value" placeholder="...">' +
            (canRemove ? '<button type="button" class="btn-icon btn-danger" onclick="_repRemoveSection(' + idx + ')" title="' + t('eliminar') + '">&times;</button>' : '<span style="width:28px"></span>') +
        '</div>';
    });
    container.innerHTML = html;
}

function _repAddSection(tipo) {
    // Insert andamentos before cortes, cortes before final
    var insertIdx = _repEstructura.length;
    if (tipo === 'andamento') {
        // After last andamento or after inicio
        for (var i = _repEstructura.length - 1; i >= 0; i--) {
            if (_repEstructura[i].tipo === 'andamento') { insertIdx = i + 1; break; }
            if (_repEstructura[i].tipo === 'inicio') { insertIdx = i + 1; break; }
        }
    } else if (tipo === 'corte') {
        // Before final
        for (var j = _repEstructura.length - 1; j >= 0; j--) {
            if (_repEstructura[j].tipo === 'final') { insertIdx = j; break; }
        }
    }
    _repEstructura.splice(insertIdx, 0, {tipo: tipo, contido: ''});
    _repRenderEstructura();
}

function _repRemoveSection(idx) {
    _repEstructura.splice(idx, 1);
    _repRenderEstructura();
}

function repertorioModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('ritmo') : t('novo_ritmo');

    $('#modal-title').textContent = title;


    var dificOptions = ['facil', 'media', 'dificil'].map(function(d) {
        var sel = (isEdit && item.dificultade === d) ? ' selected' : '';
        return '<option value="' + d + '"' + sel + '>' + t(d) + '</option>';
    }).join('');

    // Init estructura
    if (isEdit && item.estructura && item.estructura.length > 0) {
        _repEstructura = JSON.parse(JSON.stringify(item.estructura));
    } else {
        _repEstructura = [
            {tipo: 'inicio', contido: ''},
            {tipo: 'andamento', contido: ''},
            {tipo: 'final', contido: ''}
        ];
    }

    $('#modal-body').innerHTML =
        '<input type="hidden" id="repertorio-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label class="required">' + t('nome') + '</label>' +
            '<input type="text" class="form-control" id="repertorio-nome" value="' + esc(isEdit ? item.nome : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('dificultade') + '</label>' +
            '<select class="form-control" id="repertorio-dificultade">' + dificOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('notas') + '</label>' +
            '<textarea class="form-control" id="repertorio-notas" rows="2">' + esc(isEdit ? item.notas || '' : '') + '</textarea>' +
        '</div>' +
        '<hr style="border-color:var(--border);margin:12px 0">' +
        '<div class="form-group">' +
            '<label>' + t('estructura') + '</label>' +
            '<div id="rep-estructura-list"></div>' +
            '<div style="display:flex;gap:8px;margin-top:6px">' +
                '<button type="button" class="btn btn-sm btn-secondary" onclick="_repAddSection(\'andamento\')">+ ' + t('andamento') + '</button>' +
                '<button type="button" class="btn btn-sm btn-secondary" onclick="_repAddSection(\'corte\')">+ ' + t('corte') + '</button>' +
            '</div>' +
        '</div>' +
        '<hr style="border-color:var(--border);margin:12px 0">' +
        '<div class="form-group">' +
            '<label>' + t('audio') + '</label>' +
            '<input type="file" class="form-control" id="repertorio-audio" accept="audio/*">' +
            (isEdit && item.arquivo_audio ? '<p style="margin-top:4px"><a href="' + esc(uploadUrl(item.arquivo_audio)) + '" target="_blank">' + esc(item.arquivo_audio) + '</a></p>' : '') +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('partitura') + '</label>' +
            '<input type="file" class="form-control" id="repertorio-partitura">' +
            (isEdit && item.arquivo_partitura ? '<p style="margin-top:4px"><a href="' + esc(uploadUrl(item.arquivo_partitura)) + '" target="_blank">' + esc(item.arquivo_partitura) + '</a></p>' : '') +
        '</div>';

    _repRenderEstructura();

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="repertorioSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function repertorioSave() {
    var id = ($('#repertorio-id') || {}).value;
    var isEdit = !!id;

    var body = {
        nome: ($('#repertorio-nome') || {}).value || '',
        dificultade: ($('#repertorio-dificultade') || {}).value || 'media',
        notas: ($('#repertorio-notas') || {}).value || '',
        estructura: _repEstructura
    };

    var audioInput = $('#repertorio-audio');
    if (audioInput && audioInput.files && audioInput.files.length > 0) {
        body.arquivo_audio = await fileToBase64(audioInput.files[0]);
    }

    var partituraInput = $('#repertorio-partitura');
    if (partituraInput && partituraInput.files && partituraInput.files.length > 0) {
        body.arquivo_partitura = await fileToBase64(partituraInput.files[0]);
    }

    try {
        if (isEdit) {
            await api('/repertorio/' + id, { method: 'PUT', body: body });
        } else {
            await api('/repertorio', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        repertorioLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function repertorioExport(format) {
    var headers = [t('nome'), t('dificultade')];
    var rows = (AppState.repertorio || []).map(function(r) {
        return [r.nome, r.dificultade || ''];
    });
    if (format === 'pdf') {
        exportPDF(t('repertorio'), headers, rows);
    } else {
        exportCSV('repertorio.csv', headers, rows);
    }
}

async function repertorioDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/repertorio/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        repertorioLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Medios (audio/video per ritmo, parte, instrumento) ----

var _repInstrumentosCache = null;

async function _repLoadInstrumentos() {
    if (_repInstrumentosCache) return _repInstrumentosCache;
    try {
        _repInstrumentosCache = await api('/instrumentos');
    } catch (e) {
        _repInstrumentosCache = [];
    }
    return _repInstrumentosCache;
}

async function repertorioMediosModal(repId) {
    var ritmo = (AppState.repertorio || []).find(function(x) { return x.id == repId; });
    if (!ritmo) return;

    $('#modal-title').textContent = t('medios') + ' — ' + ritmo.nome;
    $('#modal-body').innerHTML = '<p class="text-center">' + t('cargando') + '</p>';
    _repPendingUploads = [];
    var footerHtml = '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>';
    if (AppState.isSocio()) {
        footerHtml += '<button class="btn btn-primary" onclick="_repMediosSaveAll(' + repId + ')">' + t('gardar') + '</button>';
    }
    $('#modal-footer').innerHTML = footerHtml;
    showModal('modal-overlay');

    var medios = [];
    try {
        medios = await api('/repertorio/' + repId + '/medios');
    } catch (e) {
        $('#modal-body').innerHTML = '<p class="text-center" style="color:var(--danger)">' + t('erro') + '</p>';
        return;
    }

    var instrumentos = await _repLoadInstrumentos();
    _repMediosRender(repId, ritmo, medios, instrumentos);
}

function _repMediosRender(repId, ritmo, medios, instrumentos) {
    var canEdit = AppState.isSocio();
    var html = '';

    // Helper: find medio by slot and type
    function findMedio(parteIdx, instrId, tipoMedia) {
        return medios.find(function(m) { return m.parte_idx == parteIdx && m.instrumento_id == instrId && m.tipo_media === tipoMedia; });
    }

    // --- Xeral (ritmo-level, parte_idx=-1, instrumento_id=0) ---
    html += '<div class="medios-section">';
    html += '<h4 class="medios-section-title">' + t('xeral') + ' — ' + esc(ritmo.nome) + '</h4>';
    html += _repMedioDualSlotHtml(repId, -1, 0, findMedio(-1, 0, 'audio'), findMedio(-1, 0, 'youtube'), canEdit);
    html += '</div>';

    // --- Estructura (one card per parte) ---
    var partes = ritmo.estructura || [];
    if (partes.length > 0) {
        html += '<div class="medios-section">';
        html += '<h4 class="medios-section-title">' + t('estructura') + '</h4>';

        var andIdx = 0;
        var corteIdx = 0;
        partes.forEach(function(p, idx) {
            var label = _estructuraLabel(p.tipo);
            if (p.tipo === 'andamento') { andIdx++; label += ' ' + andIdx; }
            if (p.tipo === 'corte') { corteIdx++; label += ' ' + corteIdx; }

            html += '<div class="medios-parte">';
            html += '<div class="medios-parte-header">' +
                '<span class="badge ' + _estructuraBadgeClass(p.tipo) + '">' + label + '</span>' +
                (p.contido ? ' <span class="estructura-text">' + esc(p.contido) + '</span>' : '') +
            '</div>';

            // Parte-level slot (parte_idx=idx, instrumento_id=0)
            html += _repMedioDualSlotHtml(repId, idx, 0, findMedio(idx, 0, 'audio'), findMedio(idx, 0, 'youtube'), canEdit);

            // Per-instrument (collapsible)
            if (instrumentos.length > 0) {
                html += '<details class="medios-instrumentos">';
                html += '<summary>' + t('por_instrumento') + '</summary>';
                html += '<div class="medios-instrumentos-grid">';
                instrumentos.forEach(function(inst) {
                    html += '<div class="medios-instrumento-item">';
                    html += '<span class="medios-instrumento-label">' + esc(inst.nome) + '</span>';
                    html += _repMedioDualSlotHtml(repId, idx, inst.id, findMedio(idx, inst.id, 'audio'), findMedio(idx, inst.id, 'youtube'), canEdit);
                    html += '</div>';
                });
                html += '</div></details>';
            }

            html += '</div>';
        });

        html += '</div>';
    }

    $('#modal-body').innerHTML = html;
}

function _repIsYoutubeUrl(src) {
    return src && src.indexOf('youtube.com/embed/') !== -1;
}

function _repYoutubeIdFromUrl(src) {
    var m = src.match(/youtube\.com\/embed\/([^?&#]+)/);
    return m ? m[1] : '';
}

function _repMedioDualSlotHtml(repId, parteIdx, instrId, medioAudio, medioYT, canEdit) {
    var html = '';

    var _dlIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    var _delIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>';

    // --- Audio slot ---
    if (medioAudio && medioAudio.arquivo) {
        var url = uploadUrl(medioAudio.arquivo);
        var player = '<audio controls preload="none" style="height:36px;flex:1;min-width:0"><source src="' + esc(url) + '"></audio>';
        var dlBtn = '<a class="btn-icon btn-sm" href="' + esc(url) + '" download="' + esc(medioAudio.arquivo_nome) + '" title="' + t('descargar') + '">' + _dlIcon + '</a>';
        var deleteBtn = canEdit
            ? '<button class="btn-icon btn-danger btn-sm" onclick="_repMedioDelete(' + repId + ',' + medioAudio.id + ')" title="' + t('eliminar') + '">' + _delIcon + '</button>'
            : '';
        html += '<div class="medios-slot"><label class="medios-slot-label">' + t('audio') + '</label>' + player +
            '<span class="medios-slot-name" title="' + esc(medioAudio.arquivo_nome) + '">' + esc(medioAudio.arquivo_nome) + '</span>' +
            dlBtn + deleteBtn + '</div>';
    } else if (canEdit) {
        var inputId = 'medio-audio-' + parteIdx + '-' + instrId;
        var recAudioId = 'rec-audio-' + parteIdx + '-' + instrId;
        html += '<div class="medios-slot"><label class="medios-slot-label">' + t('audio') + '</label>' +
            '<input type="file" class="form-control" id="' + inputId + '" accept="audio/*" ' +
            'onchange="_repMedioQueue(' + parteIdx + ',' + instrId + ',this,\'audio\')">' +
            '<button class="btn-icon btn-sm" id="' + recAudioId + '" onclick="_repStartRec(' + parteIdx + ',' + instrId + ',\'audio\',this)" title="' + t('gravar') + '">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
            '</button>' +
            '</div>';
    }

    // --- YouTube/Video slot ---
    if (medioYT && medioYT.arquivo) {
        var isYT = _repIsYoutubeUrl(medioYT.arquivo);
        var dlBtn2 = isYT
            ? '<a class="btn-icon btn-sm" href="https://www.youtube.com/watch?v=' + esc(_repYoutubeIdFromUrl(medioYT.arquivo)) + '" target="_blank" title="' + t('abrir_youtube') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>'
            : '<a class="btn-icon btn-sm" href="' + esc(uploadUrl(medioYT.arquivo)) + '" download title="' + t('descargar') + '">' + _dlIcon + '</a>';
        var deleteBtn2 = canEdit
            ? '<button class="btn-icon btn-danger btn-sm" onclick="_repMedioDelete(' + repId + ',' + medioYT.id + ')" title="' + t('eliminar') + '">' + _delIcon + '</button>'
            : '';
        html += '<div class="medios-slot"><label class="medios-slot-label">' + t('video') + '</label>' +
            '<iframe width="280" height="158" src="' + esc(medioYT.arquivo) + '" frameborder="0" allowfullscreen style="border-radius:var(--radius);max-width:100%"></iframe>' +
            dlBtn2 + deleteBtn2 + '</div>';
    } else if (canEdit) {
        var vidInputId = 'medio-video-' + parteIdx + '-' + instrId;
        var recVideoId = 'rec-video-' + parteIdx + '-' + instrId;
        html += '<div class="medios-slot"><label class="medios-slot-label">' + t('video') + '</label>' +
            '<input type="file" class="form-control" id="' + vidInputId + '" accept="video/*" ' +
            'onchange="_repMedioQueue(' + parteIdx + ',' + instrId + ',this,\'video\')">' +
            '<button class="btn-icon btn-sm" id="' + recVideoId + '" onclick="_repStartRec(' + parteIdx + ',' + instrId + ',\'video\',this)" title="' + t('gravar') + '">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>' +
            '</button>' +
            '</div>';
    }

    return html;
}

function _repMedioQueue(parteIdx, instrId, input, tipo) {
    if (!input.files || !input.files.length) return;
    // Remove any previous pending for same slot
    _repPendingUploads = _repPendingUploads.filter(function(p) {
        return !(p.parteIdx === parteIdx && p.instrId === instrId && p.tipo === tipo);
    });
    _repPendingUploads.push({ parteIdx: parteIdx, instrId: instrId, file: input.files[0], tipo: tipo });
}

async function _repMediosSaveAll(repId) {
    if (_repPendingUploads.length === 0) {
        hideModal('modal-overlay');
        return;
    }

    var btn = $('#modal-footer .btn-primary');
    if (btn) { btn.disabled = true; btn.textContent = t('gardando'); }

    var ritmo = (AppState.repertorio || []).find(function(x) { return x.id == repId; });
    var title = ritmo ? ritmo.nome : 'Levada Arraiana';

    try {
        for (var i = 0; i < _repPendingUploads.length; i++) {
            var pending = _repPendingUploads[i];
            var f = await fileToBase64(pending.file);

            if (pending.tipo === 'video') {
                var ext = (pending.file.name.split('.').pop() || 'mp4').toLowerCase();
                toast('Subindo vídeo a YouTube...', 'info');
                var ytResult = await api('/youtube/upload', {
                    method: 'POST',
                    body: { title: title, description: 'Levada Arraiana — ' + title, video_data: f.data, video_ext: ext }
                });
                if (ytResult.youtube_url) {
                    await api('/repertorio/' + repId + '/medios', {
                        method: 'PUT',
                        body: { parte_idx: pending.parteIdx, instrumento_id: pending.instrId, youtube_url: ytResult.youtube_url, nome: f.name, tipo_media: 'youtube' }
                    });
                }
            } else {
                await api('/repertorio/' + repId + '/medios', {
                    method: 'PUT',
                    body: { parte_idx: pending.parteIdx, instrumento_id: pending.instrId, data: f.data, nome: f.name, tipo_media: 'audio' }
                });
            }
        }
        _repPendingUploads = [];
        toast(t('exito'), 'success');
        repertorioMediosModal(repId);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        if (btn) { btn.disabled = false; btn.textContent = t('gardar'); }
    }
}

async function _repMedioDelete(repId, medioId) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger: true})) return;
    try {
        await api('/repertorio/' + repId + '/medios/' + medioId, { method: 'DELETE' });
        toast(t('exito'), 'success');
        repertorioMediosModal(repId);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function _repDownloadZip(repId) {
    if (typeof JSZip === 'undefined') { toast(t('erro') + ': JSZip non dispoñible', 'error'); return; }

    var ritmo = (AppState.repertorio || []).find(function(x) { return x.id == repId; });
    if (!ritmo) return;

    toast(t('preparando_descarga'), 'info');

    var medios = [];
    try { medios = await api('/repertorio/' + repId + '/medios'); } catch (e) { toast(t('erro') + ': ' + e.message, 'error'); return; }

    if (medios.length === 0 && !ritmo.arquivo_audio && !ritmo.arquivo_partitura) {
        toast(t('sen_medios'), 'info');
        return;
    }

    var instrumentos = await _repLoadInstrumentos();
    var instrMap = {};
    instrumentos.forEach(function(inst) { instrMap[inst.id] = inst.nome; });

    var partes = ritmo.estructura || [];
    var zip = new JSZip();
    var ytLinks = [];

    // Helper: build folder name for a medio
    function medioFolder(m) {
        var folder = '';
        if (m.parte_idx === -1) {
            folder = 'Xeral';
        } else if (partes[m.parte_idx]) {
            var p = partes[m.parte_idx];
            var label = _estructuraLabel(p.tipo);
            var count = 0;
            for (var j = 0; j <= m.parte_idx; j++) {
                if (partes[j].tipo === p.tipo) count++;
            }
            if (['andamento', 'corte'].indexOf(p.tipo) !== -1) label += ' ' + count;
            folder = label;
        } else {
            folder = 'Parte ' + m.parte_idx;
        }
        if (m.instrumento_id && instrMap[m.instrumento_id]) {
            folder += '/' + instrMap[m.instrumento_id];
        }
        return folder;
    }

    // Fetch and add files
    async function addFile(url, zipPath) {
        try {
            var resp = await fetch(url);
            if (!resp.ok) return;
            var blob = await resp.blob();
            zip.file(zipPath, blob);
        } catch (e) { /* skip failed files */ }
    }

    // Main audio & partitura
    if (ritmo.arquivo_audio) {
        var ext = ritmo.arquivo_audio.split('.').pop() || 'mp3';
        await addFile(uploadUrl(ritmo.arquivo_audio), 'audio_xeral.' + ext);
    }
    if (ritmo.arquivo_partitura) {
        var ext2 = ritmo.arquivo_partitura.split('.').pop() || 'pdf';
        await addFile(uploadUrl(ritmo.arquivo_partitura), 'partitura.' + ext2);
    }

    // Medios
    for (var i = 0; i < medios.length; i++) {
        var m = medios[i];
        if (!m.arquivo) continue;
        var folder = medioFolder(m);

        if (_repIsYoutubeUrl(m.arquivo)) {
            var ytId = _repYoutubeIdFromUrl(m.arquivo);
            ytLinks.push(folder + ': https://www.youtube.com/watch?v=' + ytId);
        } else {
            var fname = m.arquivo_nome || ('medio_' + m.id + '.' + (m.arquivo.split('.').pop() || 'mp3'));
            await addFile(uploadUrl(m.arquivo), folder + '/' + fname);
        }
    }

    // YouTube links file
    if (ytLinks.length > 0) {
        zip.file('videos_youtube.txt', ytLinks.join('\n'));
    }

    // Generate and download
    try {
        var blob = await zip.generateAsync({ type: 'blob' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (ritmo.nome || 'repertorio') + '_medios.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        toast(t('exito'), 'success');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Recording ----

var _repRecorder = null;
var _repRecChunks = [];
var _repRecStream = null;

async function _repStartRec(parteIdx, instrId, tipo, btn) {
    // If already recording, stop
    if (_repRecorder && _repRecorder.state === 'recording') {
        _repRecorder.stop();
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast(t('erro_permiso_micro') + ' (getUserMedia non dispoñible — require HTTPS)', 'error');
        return;
    }
    var constraints = tipo === 'video' ? { audio: true, video: true } : { audio: true };
    try {
        _repRecStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
        toast(t('erro_permiso_micro') + ': ' + e.message, 'error');
        return;
    }

    _repRecChunks = [];
    var mimeType = tipo === 'video'
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm');

    _repRecorder = new MediaRecorder(_repRecStream, { mimeType: mimeType });

    _repRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) _repRecChunks.push(e.data);
    };

    _repRecorder.onstop = function() {
        _repRecStream.getTracks().forEach(function(tk) { tk.stop(); });

        var ext = 'webm';
        var blob = new Blob(_repRecChunks, { type: mimeType });
        var file = new File([blob], 'gravacion_' + Date.now() + '.' + ext, { type: mimeType });

        // Show preview in the slot
        var slotDiv = btn.closest('.medios-slot');
        if (slotDiv) {
            var existing = slotDiv.querySelector('.rec-preview');
            if (existing) existing.remove();
            var preview = document.createElement('div');
            preview.className = 'rec-preview';

            var player = document.createElement(tipo === 'video' ? 'video' : 'audio');
            player.controls = true;
            player.className = 'rec-preview-player';
            player.src = URL.createObjectURL(blob);

            var nameSpan = document.createElement('span');
            nameSpan.className = 'medios-slot-name';
            nameSpan.textContent = file.name;

            preview.appendChild(player);
            preview.appendChild(nameSpan);
            slotDiv.appendChild(preview);
        }

        // Queue the file
        _repPendingUploads = _repPendingUploads.filter(function(p) {
            return !(p.parteIdx === parteIdx && p.instrId === instrId && p.tipo === tipo);
        });
        _repPendingUploads.push({ parteIdx: parteIdx, instrId: instrId, file: file, tipo: tipo });

        btn.classList.remove('rec-active');
        btn.title = t('gravar');
        _repRecorder = null;
        _repRecStream = null;
    };

    _repRecorder.start(1000);
    btn.classList.add('rec-active');
    btn.title = t('gravando_pulsa_parar');
    toast(t('gravando'), 'info');
}

