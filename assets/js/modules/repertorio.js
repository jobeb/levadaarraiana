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

function repertorioRender() {
    var grid = $('#repertorio-grid');
    if (!grid) return;

    var list = AppState.repertorio || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isAdmin();
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

        var audioHtml = '';
        if (r.arquivo_audio) {
            audioHtml = '<div style="margin-top:8px"><audio controls preload="none" style="width:100%"><source src="' + esc(uploadUrl(r.arquivo_audio)) + '"></audio></div>';
        }

        var partituraHtml = '';
        if (r.arquivo_partitura) {
            partituraHtml = '<div style="margin-top:6px"><a href="' + esc(uploadUrl(r.arquivo_partitura)) + '" target="_blank" class="btn btn-sm btn-secondary">' + t('partitura') + ' &#8615;</a></div>';
        }

        html += '<div class="card">' +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(r.nome) + '</h3>' +
                '<p class="card-meta">' +
                    esc(tipoLabel) +
                    (r.tempo_bpm ? ' &middot; ' + r.tempo_bpm + ' BPM' : '') +
                    ' &middot; ' + dificultadeBadge +
                '</p>' +
                (r.notas ? '<p class="card-text">' + esc(truncate(r.notas, 120)) + '</p>' : '') +
                audioHtml +
                partituraHtml +
            '</div>' +
            '<div class="card-actions">' +
                (isAdmin
                    ? '<button class="btn-icon" onclick="repertorioModal(AppState.repertorio.find(function(x){return x.id==' + r.id + '}))" title="' + t('editar') + '">&#9998;</button>' +
                      '<button class="btn-icon btn-danger" onclick="repertorioDelete(' + r.id + ')" title="' + t('eliminar') + '">&#128465;</button>'
                    : '') +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;
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

    $('#modal-body').innerHTML =
        '<input type="hidden" id="repertorio-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('nome') + '</label>' +
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
            '<textarea class="form-control" id="repertorio-notas" rows="3">' + esc(isEdit ? item.notas || '' : '') + '</textarea>' +
        '</div>' +
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
        notas: ($('#repertorio-notas') || {}).value || ''
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

// ---- Tab switching ----
var _repertorioActiveTab = 'ritmos';

function repertorioTab(tab) {
    _repertorioActiveTab = tab;
    var tabs = $$('#repertorio-tabs .tab-btn');
    tabs.forEach(function(b, i) { b.classList.toggle('active', (i === 0 && tab === 'ritmos') || (i === 1 && tab === 'setlists')); });
    var ritmos = $('#repertorio-tab-ritmos');
    var setlists = $('#repertorio-tab-setlists');
    var btnRitmo = $('#btn-novo-ritmo');
    var btnSetlist = $('#btn-nova-setlist');
    if (ritmos) ritmos.style.display = tab === 'ritmos' ? '' : 'none';
    if (setlists) setlists.style.display = tab === 'setlists' ? '' : 'none';
    if (btnRitmo) btnRitmo.style.display = tab === 'ritmos' ? '' : 'none';
    if (btnSetlist) btnSetlist.style.display = tab === 'setlists' ? '' : 'none';
    if (tab === 'setlists') setlistsLoad();
}

// ---- Setlists ----
async function setlistsLoad() {
    try {
        AppState.setlists = await api('/setlists');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.setlists = [];
    }
    setlistsRender();
}

function setlistsRender() {
    var grid = $('#setlists-grid');
    if (!grid) return;

    var list = AppState.setlists || [];
    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isAdmin();
    var html = '';

    list.forEach(function(s) {
        html += '<div class="card">' +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(s.nome) + '</h3>' +
                '<p class="card-meta">' +
                    (s.num_items || 0) + ' ' + t('repertorio').toLowerCase() +
                    (s.bolo_nome ? ' &middot; ' + esc(s.bolo_nome) : '') +
                '</p>' +
                (s.descricion ? '<p class="card-text">' + esc(truncate(s.descricion, 100)) + '</p>' : '') +
            '</div>' +
            '<div class="card-actions">' +
                '<button class="btn btn-sm btn-secondary" onclick="setlistView(' + s.id + ')">' + t('ver') + '</button>' +
                (isAdmin
                    ? '<button class="btn-icon" onclick="setlistModal(AppState.setlists.find(function(x){return x.id==' + s.id + '}))" title="' + t('editar') + '">&#9998;</button>' +
                      '<button class="btn-icon btn-danger" onclick="setlistDelete(' + s.id + ')" title="' + t('eliminar') + '">&#128465;</button>'
                    : '') +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;
}

function setlistModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' setlist' : t('nova_setlist');

    $('#modal-title').textContent = title;

    var boloOptions = '<option value="">--</option>';
    (AppState.bolos || []).forEach(function(b) {
        var sel = (isEdit && item.bolo_id == b.id) ? ' selected' : '';
        boloOptions += '<option value="' + b.id + '"' + sel + '>' + esc(b.titulo) + '</option>';
    });

    $('#modal-body').innerHTML =
        '<input type="hidden" id="setlist-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('nome') + '</label>' +
            '<input type="text" class="form-control" id="setlist-nome" value="' + esc(isEdit ? item.nome : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion') + '</label>' +
            '<textarea class="form-control" id="setlist-descricion" rows="3">' + esc(isEdit ? item.descricion || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('bolo') + '</label>' +
            '<select class="form-control" id="setlist-bolo">' + boloOptions + '</select>' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="setlistSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function setlistSave() {
    var id = ($('#setlist-id') || {}).value;
    var isEdit = !!id;

    var body = {
        nome: ($('#setlist-nome') || {}).value || '',
        descricion: ($('#setlist-descricion') || {}).value || '',
        bolo_id: ($('#setlist-bolo') || {}).value || null
    };

    try {
        if (isEdit) {
            await api('/setlists/' + id, { method: 'PUT', body: body });
        } else {
            await api('/setlists', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        setlistsLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function setlistDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/setlists/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        setlistsLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Setlist detail view (items) ----
var _currentSetlistId = null;

async function setlistView(id) {
    _currentSetlistId = id;
    var sl = (AppState.setlists || []).find(function(x) { return x.id == id; });

    try {
        var items = await api('/setlists/' + id + '/items');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        return;
    }

    var isAdmin = AppState.isAdmin();

    $('#modal-title').textContent = sl ? sl.nome : 'Setlist';

    var html = '<div class="setlist-items" id="setlist-items-list">';
    if (items.length === 0) {
        html += '<p class="text-center">' + t('sen_resultados') + '</p>';
    } else {
        items.forEach(function(item, idx) {
            html += '<div class="setlist-item" draggable="' + (isAdmin ? 'true' : 'false') + '" data-item-id="' + item.id + '">' +
                '<span class="setlist-item-num">' + (idx + 1) + '</span>' +
                '<span class="setlist-item-name">' + esc(item.peza_nome || '?') + '</span>' +
                '<span class="setlist-item-meta">' + esc(item.peza_tipo || '') + (item.tempo_bpm ? ' ' + item.tempo_bpm + ' BPM' : '') + '</span>' +
                (item.notas ? '<span class="setlist-item-notes">' + esc(item.notas) + '</span>' : '') +
                (isAdmin ? '<button class="btn-icon btn-danger btn-sm" onclick="setlistRemoveItem(' + id + ',' + item.id + ')" title="' + t('eliminar') + '">&times;</button>' : '') +
            '</div>';
        });
    }
    html += '</div>';

    if (isAdmin) {
        var pezaOptions = '<option value="">-- ' + t('engadir_peza') + ' --</option>';
        (AppState.repertorio || []).forEach(function(r) {
            pezaOptions += '<option value="' + r.id + '">' + esc(r.nome) + '</option>';
        });
        html += '<div class="form-group" style="margin-top:12px">' +
            '<select class="form-control" id="setlist-add-peza">' + pezaOptions + '</select>' +
            '<button class="btn btn-sm btn-primary" onclick="setlistAddItem(' + id + ')" style="margin-top:6px">' + t('engadir_peza') + '</button>' +
        '</div>';
    }

    $('#modal-body').innerHTML = html;
    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('voltar') + '</button>';

    showModal('modal-overlay');

    // Drag-and-drop reorder
    if (isAdmin) {
        _initSetlistDnD(id);
    }
}

function _initSetlistDnD(setlistId) {
    var container = $('#setlist-items-list');
    if (!container) return;
    var dragEl = null;

    container.addEventListener('dragstart', function(e) {
        dragEl = e.target.closest('.setlist-item');
        if (dragEl) {
            dragEl.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        var target = e.target.closest('.setlist-item');
        if (target && target !== dragEl) {
            var rect = target.getBoundingClientRect();
            var mid = rect.top + rect.height / 2;
            if (e.clientY < mid) {
                container.insertBefore(dragEl, target);
            } else {
                container.insertBefore(dragEl, target.nextSibling);
            }
        }
    });

    container.addEventListener('dragend', function() {
        if (dragEl) dragEl.classList.remove('dragging');
        dragEl = null;
        // Save new order
        var items = [];
        container.querySelectorAll('.setlist-item').forEach(function(el) {
            items.push(parseInt(el.dataset.itemId));
        });
        api('/setlists/' + setlistId + '/reorder', { method: 'PUT', body: { items: items } });
        // Update numbering
        container.querySelectorAll('.setlist-item-num').forEach(function(el, i) {
            el.textContent = i + 1;
        });
    });
}

async function setlistAddItem(setlistId) {
    var select = $('#setlist-add-peza');
    var repertorioId = select ? select.value : '';
    if (!repertorioId) return;

    try {
        await api('/setlists/' + setlistId + '/items', { method: 'POST', body: { repertorio_id: parseInt(repertorioId) } });
        setlistView(setlistId);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function setlistRemoveItem(setlistId, itemId) {
    try {
        await api('/setlists/' + setlistId + '/items/' + itemId, { method: 'DELETE' });
        setlistView(setlistId);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
