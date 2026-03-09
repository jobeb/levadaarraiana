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

    // Deep link: #votacions/ID → pre-fill search with that votacion's title
    if (AppState.routeParam) {
        var targetId = parseInt(AppState.routeParam, 10);
        var target = (AppState.votacions || []).find(function(v) { return v.id === targetId; });
        if (target) {
            var searchInput = $('#votacions-search');
            if (searchInput) searchInput.value = target.titulo;
        }
        AppState.routeParam = null;
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
                (v.descripcion ? '<div class="rt-content card-text">' + sanitizeHtml(v.descripcion) + '</div>' : '') +
                bodyHtml +
            '</div>' +
            '<div class="card-actions">' +
                '<button class="btn-icon btn-whatsapp" onclick="votacionsShare(' + v.id + ')" title="' + t('compartir_whatsapp') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>' +
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
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>' +
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

function votacionsShare(id) {
    var v = (AppState.votacions || []).find(function(x) { return x.id == id; });
    if (!v) return;

    var opcions = (v.opcions || []).map(function(o) {
        return typeof o === 'string' ? o : (o.texto || o.opcion || '');
    });
    var nome = (AppState.config || {}).nome_asociacion || 'Levada Arraiana';

    var l = [];
    l.push('\uD83D\uDDF3\uFE0F *' + nome + ' \u2014 ' + v.titulo + '*');
    l.push('');

    if (v.descripcion) {
        var desc = v.descripcion.replace(/<[^>]+>/g, '').trim();
        if (desc.length > 120) desc = desc.substring(0, 120) + '...';
        if (desc) { l.push('_' + desc + '_'); l.push(''); }
    }

    if (opcions.length > 0) {
        l.push('*' + t('opcions') + ':*');
        opcions.forEach(function(op, i) { l.push('   ' + (i + 1) + '. ' + op); });
        l.push('');
    }

    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    if (v.data_limite) l.push('\u23F0 ' + t('data_limite') + ': *' + formatDate(v.data_limite) + '*');
    if (v.estado === 'aberta') l.push('\uD83D\uDFE2 ' + t('aberta'));
    l.push('');

    var baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'app.html#votacions/' + v.id;
    l.push('\uD83D\uDC49 *' + t('votar') + ':*');
    l.push(baseUrl);

    var url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(l.join('\n'));
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
