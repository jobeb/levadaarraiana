/**
 * Votacions — Voting module
 * Supports: anonymous/non-anonymous, simple/multiple choice, images, comments
 */

async function votacionsLoad() {
    try {
        AppState.votacions = await api('/votacions');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.votacions = [];
    }
    votacionsRender();
}

function votacionsRender() {
    var grid = $('#votacions-grid');
    if (!grid) return;

    var list = (AppState.votacions || []).slice();

    // Filter: search
    var searchVal = ($('#votacions-search') || {}).value || '';
    if (searchVal) {
        var q = searchVal.toLowerCase();
        list = list.filter(function(v) {
            return (v.titulo || '').toLowerCase().indexOf(q) !== -1 ||
                   (v.descripcion || '').toLowerCase().indexOf(q) !== -1;
        });
    }

    // Filter: estado
    var estadoVal = ($('#votacions-estado-filter') || {}).value || '';
    if (estadoVal) {
        list = list.filter(function(v) { return v.estado === estadoVal; });
    }

    // Filter: tipo
    var tipoVal = ($('#votacions-tipo-filter') || {}).value || '';
    if (tipoVal === 'anonima') {
        list = list.filter(function(v) { return v.anonima; });
    } else if (tipoVal) {
        list = list.filter(function(v) { return v.tipo === tipoVal; });
    }

    // Sort
    var sortVal = ($('#votacions-sort') || {}).value || 'recentes';
    if (sortVal === 'recentes') {
        list.sort(function(a, b) { return (b.id || 0) - (a.id || 0); });
    } else if (sortVal === 'antigas') {
        list.sort(function(a, b) { return (a.id || 0) - (b.id || 0); });
    } else if (sortVal === 'titulo') {
        list.sort(function(a, b) { return (a.titulo || '').localeCompare(b.titulo || ''); });
    }

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isSocio = AppState.isSocio();
    var html = '';

    list.forEach(function(v) {
        // Badges
        var estadoBadge = v.estado === 'aberta'
            ? '<span class="badge badge-success">' + t('aberta') + '</span>'
            : '<span class="badge badge-danger">' + t('pechada') + '</span>';

        var tipoBadge = v.tipo === 'multiple'
            ? ' <span class="badge badge-info">' + t('seleccion_multiple') + (v.max_opcions ? ' (max ' + v.max_opcions + ')' : '') + '</span>'
            : '';

        var anonBadge = v.anonima
            ? ' <span class="badge badge-warning">' + t('anonima') + '</span>'
            : '';

        var limiteBadge = v.data_limite
            ? ' <span class="badge">' + t('data_limite') + ': ' + formatDate(v.data_limite) + '</span>'
            : '';

        // Image header
        var imaxeHtml = '';
        if (v.imaxe) {
            imaxeHtml = '<div class="votacion-imaxe"><img src="' + esc(uploadUrl(v.imaxe)) + '" alt=""></div>';
        }

        var opcions = v.opcions || [];
        var userVoted = v.user_voted || false;
        var bodyHtml = '';

        if (v.estado === 'aberta' && !userVoted) {
            // Show voting form
            var inputType = v.tipo === 'multiple' ? 'checkbox' : 'radio';
            var maxOpcions = v.max_opcions || 0;

            bodyHtml += '<div class="votacion-options" id="votacion-opts-' + v.id + '">';
            opcions.forEach(function(op) {
                var opLabel = typeof op === 'string' ? op : (op.texto || op.opcion || '');
                var onchangeAttr = '';
                if (v.tipo === 'multiple' && maxOpcions > 0) {
                    onchangeAttr = ' onchange="votacionsCheckMax(' + v.id + ',' + maxOpcions + ')"';
                }
                bodyHtml += '<label class="votacion-option">' +
                    '<input type="' + inputType + '" name="voto-' + v.id + '" value="' + esc(opLabel) + '"' + onchangeAttr + '> ' +
                    esc(opLabel) +
                '</label>';
            });
            bodyHtml += '</div>';

            // Comment textarea
            bodyHtml += '<div class="form-group" style="margin-top:8px">' +
                '<textarea class="form-control" id="votacion-comentario-' + v.id + '" rows="2" placeholder="' + t('comentario_opcional') + '"></textarea>' +
            '</div>';

            bodyHtml += '<button class="btn btn-primary btn-sm" onclick="votacionsVotar(' + v.id + ',\'' + esc(v.tipo || 'simple') + '\')" style="margin-top:4px">' + t('votar') + '</button>';
        } else if (v.estado === 'aberta' && userVoted && v.anonima) {
            // Anonymous + open + voted → only show count
            bodyHtml += '<p class="card-meta" style="margin-bottom:8px">' + t('xa_votaches') + '</p>';
            bodyHtml += '<p class="card-meta">' + (v.total_votantes || 0) + ' ' + t('votos_emitidos') + '</p>';
        } else {
            // Voted (non-anon) or closed → show results
            bodyHtml += '<div class="votacion-results" id="votacion-res-' + v.id + '">';
            if (userVoted) {
                bodyHtml += '<p class="card-meta" style="margin-bottom:8px">' + t('xa_votaches') + '</p>';
            }
            bodyHtml += '<div id="votacion-bars-' + v.id + '"><p class="card-meta">' + t('cargando') + '</p></div>';
            bodyHtml += '</div>';
        }

        html += '<div class="card">' +
            imaxeHtml +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(v.titulo) + ' ' + estadoBadge + tipoBadge + anonBadge + limiteBadge + '</h3>' +
                (v.descripcion ? '<div class="rt-content card-text">' + v.descripcion + '</div>' : '') +
                bodyHtml +
            '</div>' +
            '<div class="card-actions">' +
                (isSocio && v.estado === 'aberta'
                    ? '<button class="btn btn-sm btn-warning" onclick="votacionsPechar(' + v.id + ')" title="' + t('pechar') + '">' + t('pechar') + '</button>'
                    : '') +
                (isSocio
                    ? '<button class="btn-icon" onclick="votacionsModal(AppState.votacions.find(function(x){return x.id==' + v.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>' +
                      '<button class="btn-icon btn-danger" onclick="votacionsDelete(' + v.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>'
                    : '') +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;

    // Load results for voted (non-anon) or closed items
    list.forEach(function(v) {
        var shouldLoad = false;
        if (v.estado === 'pechada') shouldLoad = true;
        if (v.user_voted && !v.anonima) shouldLoad = true;
        if (v.user_voted && v.anonima && v.estado === 'pechada') shouldLoad = true;
        if (shouldLoad) {
            votacionsLoadResults(v.id, v.anonima);
        }
    });
}

function votacionsCheckMax(votacionId, max) {
    var inputs = $$('input[name="voto-' + votacionId + '"]');
    var checkedCount = 0;
    inputs.forEach(function(inp) { if (inp.checked) checkedCount++; });
    inputs.forEach(function(inp) {
        if (!inp.checked) {
            inp.disabled = checkedCount >= max;
        }
    });
}

async function votacionsLoadResults(id, isAnon) {
    var container = $('#votacion-bars-' + id);
    if (!container) return;

    try {
        var results = await api('/votos/' + id);

        // Anonymous + open → just show total
        if (results.anonima && results.aberta) {
            container.innerHTML = '<p class="card-meta">' + (results.total_votantes || 0) + ' ' + t('votos_emitidos') + '</p>';
            return;
        }

        var rawVotes = results.votos || [];
        var totalVotantes = results.total_votantes || 0;

        if (totalVotantes === 0) {
            container.innerHTML = '<p class="card-meta">' + t('sen_resultados') + '</p>';
            return;
        }

        // Aggregate by option
        var optionCounts = {};
        var comentarios = [];
        rawVotes.forEach(function(v) {
            var op = v.opcion || '';
            optionCounts[op] = (optionCounts[op] || 0) + 1;
            if (v.comentario) {
                comentarios.push({
                    texto: v.comentario,
                    autor: v.socio_nome || null
                });
            }
        });

        var votes = Object.keys(optionCounts).map(function(op) {
            return { opcion: op, count: optionCounts[op] };
        });

        // Build bars (percentage based on distinct voters)
        var barsHtml = '';
        votes.forEach(function(r) {
            var label = r.opcion || '';
            var count = r.count || 0;
            var pct = totalVotantes > 0 ? Math.round((count / totalVotantes) * 100) : 0;

            barsHtml += '<div class="vote-bar-row" style="margin-bottom:6px">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:2px">' +
                    '<span>' + esc(label) + '</span>' +
                    '<span>' + count + ' (' + pct + '%)</span>' +
                '</div>' +
                '<div class="vote-bar-bg" style="background:var(--bg-tertiary);border-radius:4px;height:12px;overflow:hidden">' +
                    '<div class="vote-bar-fill" style="background:var(--primary);height:100%;width:' + pct + '%;border-radius:4px;transition:width 0.3s"></div>' +
                '</div>' +
            '</div>';
        });

        // Comments section
        if (comentarios.length > 0) {
            barsHtml += '<div class="votacion-comentarios">';
            barsHtml += '<strong style="font-size:0.85rem">' + t('comentarios') + '</strong>';
            comentarios.forEach(function(c) {
                var autorStr = c.autor ? '<strong>' + esc(c.autor) + ':</strong> ' : '';
                barsHtml += '<div class="votacion-comentario-item">' + autorStr + esc(c.texto) + '</div>';
            });
            barsHtml += '</div>';
        }

        container.innerHTML = barsHtml;
    } catch (e) {
        container.innerHTML = '<p class="card-meta">' + t('erro') + '</p>';
    }
}

function votacionsModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('votacion') : t('nova_votacion');

    $('#modal-title').textContent = title;

    var opcionsTxt = '';
    if (isEdit && item.opcions) {
        opcionsTxt = item.opcions.map(function(o) {
            return typeof o === 'string' ? o : (o.texto || o.opcion || '');
        }).join('\n');
    }

    var tipo = isEdit ? (item.tipo || 'simple') : 'simple';
    var maxDisplay = tipo === 'multiple' ? '' : 'display:none';
    var anonima = isEdit ? item.anonima : false;

    $('#modal-body').innerHTML =
        '<input type="hidden" id="votacion-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label class="required">' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="votacion-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion') + '</label>' +
            '<div class="rt-wrap" id="votacion-descripcion-editor"></div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('opcions') + ' (' + t('unha_por_lina') + ')</label>' +
            '<textarea class="form-control" id="votacion-opcions" rows="5">' + esc(opcionsTxt) + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('imaxe') + '</label>' +
            (isEdit && item.imaxe ? '<div style="margin-bottom:6px"><img src="' + esc(uploadUrl(item.imaxe)) + '" style="max-height:80px;border-radius:var(--radius)"></div>' : '') +
            '<input type="file" class="form-control" id="votacion-imaxe" accept="image/*">' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1;min-width:200px">' +
                '<label>' + t('tipo_votacion') + '</label>' +
                '<div style="display:flex;gap:var(--gap);margin-top:4px">' +
                    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer">' +
                        '<input type="radio" name="votacion-tipo" value="simple"' + (tipo === 'simple' ? ' checked' : '') + ' onchange="votacionsToggleTipo()"> ' + t('seleccion_simple') +
                    '</label>' +
                    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer">' +
                        '<input type="radio" name="votacion-tipo" value="multiple"' + (tipo === 'multiple' ? ' checked' : '') + ' onchange="votacionsToggleTipo()"> ' + t('seleccion_multiple') +
                    '</label>' +
                '</div>' +
            '</div>' +
            '<div class="form-group" id="votacion-max-wrap" style="flex:0 0 150px;' + maxDisplay + '">' +
                '<label>' + t('max_opcions') + '</label>' +
                '<input type="number" class="form-control" id="votacion-max-opcions" min="2" placeholder="' + t('sen_limite') + '" value="' + (isEdit && item.max_opcions ? item.max_opcions : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label style="display:flex;align-items:center;gap:6px;cursor:pointer">' +
                '<input type="checkbox" id="votacion-anonima"' + (anonima ? ' checked' : '') + '> ' + t('anonima') +
            '</label>' +
            '<small style="color:var(--text-dim);display:block;margin-top:2px">' + t('anonima_desc') + '</small>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('data_limite') + '</label>' +
            '<input type="date" class="form-control" id="votacion-data-limite" value="' + (isEdit && item.data_limite ? item.data_limite : '') + '">' +
        '</div>';

    initRichTextEditor('votacion-descripcion-editor', isEdit ? item.descripcion || '' : '', { uploadDir: 'votacions' });

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="votacionsSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

function votacionsToggleTipo() {
    var tipoRadios = $$('input[name="votacion-tipo"]');
    var selected = 'simple';
    tipoRadios.forEach(function(r) { if (r.checked) selected = r.value; });
    var wrap = $('#votacion-max-wrap');
    if (wrap) wrap.style.display = selected === 'multiple' ? '' : 'none';
}

async function votacionsSave() {
    var id = ($('#votacion-id') || {}).value;
    var isEdit = !!id;

    var opcionsTxt = ($('#votacion-opcions') || {}).value || '';
    var opcions = opcionsTxt.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });

    var tipoRadios = $$('input[name="votacion-tipo"]');
    var tipo = 'simple';
    tipoRadios.forEach(function(r) { if (r.checked) tipo = r.value; });

    var body = {
        titulo: ($('#votacion-titulo') || {}).value || '',
        descripcion: getRichTextContent('votacion-descripcion-editor'),
        opcions: opcions,
        tipo: tipo,
        max_opcions: tipo === 'multiple' ? (($('#votacion-max-opcions') || {}).value || null) : null,
        anonima: ($('#votacion-anonima') || {}).checked ? 1 : 0,
        data_limite: ($('#votacion-data-limite') || {}).value || null
    };

    if (!isEdit) {
        body.estado = 'aberta';
    }

    // Handle image
    var fileInput = $('#votacion-imaxe');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
            var imgB64 = await imageToBase64(fileInput.files[0]);
            body.imaxe_data = imgB64.data;
        } catch (e) { /* ignore */ }
    }

    try {
        if (isEdit) {
            await api('/votacions/' + id, { method: 'PUT', body: body });
        } else {
            await api('/votacions', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        votacionsLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function votacionsExport(format) {
    var headers = [t('titulo'), t('tipo'), t('estado'), t('data_limite')];
    var rows = (AppState.votacions || []).map(function(v) {
        return [v.titulo, v.tipo || 'simple', v.estado || '', v.data_limite || ''];
    });
    if (format === 'pdf') {
        exportPDF(t('votacions'), headers, rows);
    } else {
        exportCSV('votacions.csv', headers, rows);
    }
}

async function votacionsDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/votacions/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        votacionsLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function votacionsVotar(id, tipo) {
    var inputs = $$('input[name="voto-' + id + '"]');
    var selected = [];
    inputs.forEach(function(r) { if (r.checked) selected.push(r.value); });

    if (selected.length === 0) {
        toast(t('selecciona_opcion'), 'error');
        return;
    }

    var comentario = ($('#votacion-comentario-' + id) || {}).value || '';

    try {
        await api('/votos', {
            method: 'POST',
            body: {
                votacion_id: id,
                opcions: selected,
                comentario: comentario || null
            }
        });
        toast(t('exito'), 'success');
        votacionsLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function votacionsPechar(id) {
    if (!await confirmAction(t('confirmar_accion'))) return;
    try {
        await api('/votacions/' + id, { method: 'PUT', body: { estado: 'pechada' } });
        toast(t('exito'), 'success');
        votacionsLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
