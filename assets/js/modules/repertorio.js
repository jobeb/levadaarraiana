/**
 * Repertorio — Repertoire / rhythms module
 */

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

        var tipoLabel = (r.tipo || '').charAt(0).toUpperCase() + (r.tipo || '').slice(1);

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
                '<p class="card-meta">' +
                    esc(tipoLabel) +
                    (r.tempo_bpm ? ' &middot; ' + r.tempo_bpm + ' BPM' : '') +
                    ' &middot; ' + dificultadeBadge +
                '</p>' +
                (r.notas ? '<p class="card-text">' + esc(r.notas) + '</p>' : '') +
                estructuraHtml +
                audioHtml +
                partituraHtml +
            '</div>' +
            '<div class="card-actions">' +
                '<button class="btn-icon" onclick="repertorioMediosModal(' + r.id + ')" title="' + t('medios') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>' +
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

    var tipoOptions = ['samba', 'funk', 'maracatu', 'axe', 'samba-reggae', 'outro'].map(function(tp) {
        var sel = (isEdit && item.tipo === tp) ? ' selected' : '';
        var label = tp.charAt(0).toUpperCase() + tp.slice(1);
        if (tp === 'axe') label = 'Axe';
        if (tp === 'samba-reggae') label = 'Samba-Reggae';
        return '<option value="' + tp + '"' + sel + '>' + label + '</option>';
    }).join('');

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
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('tipo') + '</label>' +
                '<select class="form-control" id="repertorio-tipo">' + tipoOptions + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('tempo_bpm') + '</label>' +
                '<input type="number" class="form-control" id="repertorio-bpm" min="1" max="300" value="' + (isEdit ? item.tempo_bpm || '' : '') + '">' +
            '</div>' +
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
        tipo: ($('#repertorio-tipo') || {}).value || 'samba',
        tempo_bpm: parseInt(($('#repertorio-bpm') || {}).value) || null,
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
    var headers = [t('nome'), t('tipo'), t('tempo_bpm'), t('dificultade')];
    var rows = (AppState.repertorio || []).map(function(r) {
        return [r.nome, r.tipo || '', r.tempo_bpm || '', r.dificultade || ''];
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
    $('#modal-footer').innerHTML = '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('voltar') + '</button>';
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

    // Helper: find medio by slot
    function findMedio(parteIdx, instrId) {
        return medios.find(function(m) { return m.parte_idx == parteIdx && m.instrumento_id == instrId; });
    }

    // --- Xeral (ritmo-level, parte_idx=-1, instrumento_id=0) ---
    html += '<div class="medios-section">';
    html += '<h4 class="medios-section-title">' + t('xeral') + ' — ' + esc(ritmo.nome) + '</h4>';
    html += _repMedioSlotHtml(repId, -1, 0, findMedio(-1, 0), canEdit);
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
            html += _repMedioSlotHtml(repId, idx, 0, findMedio(idx, 0), canEdit);

            // Per-instrument (collapsible)
            if (instrumentos.length > 0) {
                html += '<details class="medios-instrumentos">';
                html += '<summary>' + t('por_instrumento') + '</summary>';
                html += '<div class="medios-instrumentos-grid">';
                instrumentos.forEach(function(inst) {
                    html += '<div class="medios-instrumento-item">';
                    html += '<span class="medios-instrumento-label">' + esc(inst.nome) + '</span>';
                    html += _repMedioSlotHtml(repId, idx, inst.id, findMedio(idx, inst.id), canEdit);
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

function _repMedioSlotHtml(repId, parteIdx, instrId, medio, canEdit) {
    if (medio && medio.arquivo) {
        var isYT = _repIsYoutubeUrl(medio.arquivo);
        var player;

        if (isYT) {
            var ytId = _repYoutubeIdFromUrl(medio.arquivo);
            player = '<iframe width="280" height="158" src="' + esc(medio.arquivo) + '" frameborder="0" allowfullscreen style="border-radius:var(--radius);max-width:100%"></iframe>';
        } else if (medio.tipo_media === 'video') {
            var url = uploadUrl(medio.arquivo);
            player = '<video controls preload="none" style="max-height:200px;max-width:100%;border-radius:var(--radius)"><source src="' + esc(url) + '"></video>';
        } else {
            var url = uploadUrl(medio.arquivo);
            player = '<audio controls preload="none" style="height:36px;flex:1;min-width:0"><source src="' + esc(url) + '"></audio>';
        }

        var deleteBtn = canEdit
            ? '<button class="btn-icon btn-danger btn-sm" onclick="_repMedioDelete(' + repId + ',' + medio.id + ')" title="' + t('eliminar') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>'
            : '';

        return '<div class="medios-slot">' + player +
            '<span class="medios-slot-name" title="' + esc(medio.arquivo_nome) + '">' + esc(medio.arquivo_nome) + '</span>' +
            deleteBtn + '</div>';
    }

    if (canEdit) {
        var inputId = 'medio-input-' + parteIdx + '-' + instrId;
        return '<div class="medios-slot">' +
            '<input type="file" class="form-control" id="' + inputId + '" accept="audio/*,video/*" ' +
            'onchange="_repMedioUpload(' + repId + ',' + parteIdx + ',' + instrId + ',this)">' +
            '</div>';
    }

    return '';
}

var _repVideoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];

async function _repMedioUpload(repId, parteIdx, instrId, input) {
    if (!input.files || !input.files.length) return;
    var file = input.files[0];
    input.disabled = true;

    var ext = (file.name.split('.').pop() || '').toLowerCase();
    var isVideo = _repVideoExts.indexOf(ext) !== -1 || file.type.startsWith('video/');

    try {
        var f = await fileToBase64(file);

        if (isVideo) {
            // Upload video to YouTube
            var ritmo = (AppState.repertorio || []).find(function(x) { return x.id == repId; });
            var title = ritmo ? ritmo.nome : 'Levada Arraiana';
            toast('Subindo vídeo a YouTube...', 'info');

            var ytResult = await api('/youtube/upload', {
                method: 'POST',
                body: {
                    title: title,
                    description: 'Levada Arraiana — ' + title,
                    video_data: f.data,
                    video_ext: ext || 'mp4'
                }
            });

            if (ytResult.youtube_url) {
                await api('/repertorio/' + repId + '/medios', {
                    method: 'PUT',
                    body: {
                        parte_idx: parteIdx,
                        instrumento_id: instrId,
                        youtube_url: ytResult.youtube_url,
                        nome: f.name,
                        tipo_media: 'youtube'
                    }
                });
                toast(t('exito'), 'success');
                repertorioMediosModal(repId);
                return;
            }
        }

        // Audio file — store locally
        await api('/repertorio/' + repId + '/medios', {
            method: 'PUT',
            body: {
                parte_idx: parteIdx,
                instrumento_id: instrId,
                data: f.data,
                nome: f.name,
                tipo_media: 'audio'
            }
        });
        toast(t('exito'), 'success');
        repertorioMediosModal(repId);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        input.disabled = false;
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

