/**
 * Votacions — Voting module
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

    var list = AppState.votacions || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isAdmin();
    var html = '';

    list.forEach(function(v) {
        var estadoBadge = '';
        if (v.estado === 'aberta') {
            estadoBadge = '<span class="badge badge-success">' + t('aberta') + '</span>';
        } else {
            estadoBadge = '<span class="badge badge-danger">' + t('pechada') + '</span>';
        }

        var limiteBadge = '';
        if (v.data_limite) {
            limiteBadge = ' <span class="badge">' + t('data_limite') + ': ' + formatDate(v.data_limite) + '</span>';
        }

        var opcions = v.opcions || [];
        var userVoted = v.user_voted || false;
        var bodyHtml = '';

        if (v.estado === 'aberta' && !userVoted) {
            // Show radio options and vote button
            bodyHtml += '<div class="votacion-options" id="votacion-opts-' + v.id + '">';
            opcions.forEach(function(op, idx) {
                var opLabel = typeof op === 'string' ? op : (op.texto || op.opcion || '');
                bodyHtml += '<label class="votacion-option">' +
                    '<input type="radio" name="voto-' + v.id + '" value="' + esc(opLabel) + '"> ' +
                    esc(opLabel) +
                '</label>';
            });
            bodyHtml += '</div>';
            bodyHtml += '<button class="btn btn-primary btn-sm" onclick="votacionsVotar(' + v.id + ')" style="margin-top:8px">' + t('votar') + '</button>';
        } else {
            // Show results
            bodyHtml += '<div class="votacion-results" id="votacion-res-' + v.id + '">';
            if (userVoted) {
                bodyHtml += '<p class="card-meta" style="margin-bottom:8px">' + t('xa_votaches') + '</p>';
            }
            bodyHtml += '<div id="votacion-bars-' + v.id + '"><p class="card-meta">' + t('cargando') + '</p></div>';
            bodyHtml += '</div>';
        }

        html += '<div class="card">' +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(v.titulo) + ' ' + estadoBadge + limiteBadge + '</h3>' +
                (v.descripcion ? '<p class="card-text">' + esc(v.descripcion) + '</p>' : '') +
                bodyHtml +
            '</div>' +
            '<div class="card-actions">' +
                (isAdmin && v.estado === 'aberta'
                    ? '<button class="btn btn-sm btn-warning" onclick="votacionsPechar(' + v.id + ')" title="' + t('pechar') + '">' + t('pechar') + '</button>'
                    : '') +
                (isAdmin
                    ? '<button class="btn-icon" onclick="votacionsModal(AppState.votacions.find(function(x){return x.id==' + v.id + '}))" title="' + t('editar') + '">&#9998;</button>' +
                      '<button class="btn-icon btn-danger" onclick="votacionsDelete(' + v.id + ')" title="' + t('eliminar') + '">&#128465;</button>'
                    : '') +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;

    // Load results for voted / closed items
    list.forEach(function(v) {
        if (v.user_voted || v.estado === 'pechada') {
            votacionsLoadResults(v.id);
        }
    });
}

async function votacionsLoadResults(id) {
    var container = $('#votacion-bars-' + id);
    if (!container) return;

    try {
        var results = await api('/votos/' + id);
        var rawVotes = results.votos || results || [];

        // Aggregate individual votes by option
        var optionCounts = {};
        rawVotes.forEach(function(v) {
            var op = v.opcion || '';
            optionCounts[op] = (optionCounts[op] || 0) + 1;
        });

        var votes = Object.keys(optionCounts).map(function(op) {
            return { opcion: op, count: optionCounts[op] };
        });

        var totalVotes = rawVotes.length;

        if (totalVotes === 0) {
            container.innerHTML = '<p class="card-meta">' + t('sen_resultados') + '</p>';
            return;
        }

        var barsHtml = '';
        votes.forEach(function(r) {
            var label = r.opcion || '';
            var count = r.count || 0;
            var pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

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

    $('#modal-body').innerHTML =
        '<input type="hidden" id="votacion-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="votacion-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion') + '</label>' +
            '<textarea class="form-control" id="votacion-descripcion" rows="3">' + esc(isEdit ? item.descripcion || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('opcions') + ' (' + (AppState.lang === 'en' ? 'one per line' : 'unha por liña') + ')</label>' +
            '<textarea class="form-control" id="votacion-opcions" rows="5">' + esc(opcionsTxt) + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('data_limite') + '</label>' +
            '<input type="date" class="form-control" id="votacion-data-limite" value="' + (isEdit && item.data_limite ? item.data_limite : '') + '">' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="votacionsSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function votacionsSave() {
    var id = ($('#votacion-id') || {}).value;
    var isEdit = !!id;

    var opcionsTxt = ($('#votacion-opcions') || {}).value || '';
    var opcions = opcionsTxt.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });

    var body = {
        titulo: ($('#votacion-titulo') || {}).value || '',
        descripcion: ($('#votacion-descripcion') || {}).value || '',
        opcions: opcions,
        data_limite: ($('#votacion-data-limite') || {}).value || null
    };

    if (!isEdit) {
        body.estado = 'aberta';
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

async function votacionsVotar(id) {
    var radios = $$('input[name="voto-' + id + '"]');
    var selected = null;
    radios.forEach(function(r) { if (r.checked) selected = r.value; });

    if (!selected) {
        toast(t('selecciona_opcion'), 'error');
        return;
    }

    try {
        await api('/votos', { method: 'POST', body: { votacion_id: id, opcion: selected } });
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
