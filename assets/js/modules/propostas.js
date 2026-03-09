/**
 * Propostas — Proposals module (CRUD, voting, comments, sorting)
 */

async function propostasLoad() {
    // Show/hide create button based on role
    var btnNova = $('#btn-nova-proposta');
    if (btnNova) btnNova.style.display = AppState.isSocio() ? '' : 'none';

    try {
        AppState.propostas = await api('/propostas');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.propostas = [];
    }
    propostasRender();
}

function propostasRender() {
    var grid = $('#propostas-grid');
    if (!grid) return;

    var list = (AppState.propostas || []).slice();

    // Search filter
    var search = (($('#propostas-search') || {}).value || '').toLowerCase();
    if (search) {
        list = list.filter(function(p) {
            return (p.titulo || '').toLowerCase().indexOf(search) !== -1 ||
                   (p.texto || '').toLowerCase().indexOf(search) !== -1 ||
                   (p.autor_nome || '').toLowerCase().indexOf(search) !== -1;
        });
    }

    // Estado filter
    var estadoFilter = (($('#propostas-estado-filter') || {}).value || 'todas');
    if (estadoFilter !== 'todas') {
        list = list.filter(function(p) { return (p.estado || 'aberta') === estadoFilter; });
    }

    // Sort
    var sortBy = (($('#propostas-sort') || {}).value || 'recentes');
    list.sort(function(a, b) {
        switch (sortBy) {
            case 'votadas':
                var va = (parseInt(a.votos_favor) || 0) - (parseInt(a.votos_contra) || 0);
                var vb = (parseInt(b.votos_favor) || 0) - (parseInt(b.votos_contra) || 0);
                return vb - va;
            case 'comentadas':
                return (parseInt(b.num_comentarios) || 0) - (parseInt(a.num_comentarios) || 0);
            case 'titulo':
                return (a.titulo || '').localeCompare(b.titulo || '');
            default: // recentes
                return (b.data || '').localeCompare(a.data || '');
        }
    });

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isSocio = AppState.isSocio();
    var isAdmin = AppState.isAdmin();
    var userId = AppState.user ? String(AppState.user.id) : '';

    var html = '';
    list.forEach(function(p) {
        var favor = parseInt(p.votos_favor) || 0;
        var contra = parseInt(p.votos_contra) || 0;
        var meuVoto = parseInt(p.meu_voto) || 0;
        var numComentarios = parseInt(p.num_comentarios) || 0;
        var estado = p.estado || 'aberta';
        var isOwner = userId && String(p.autor) === userId;

        var estadoBadge = estado === 'pechada'
            ? '<span class="badge badge-danger">' + t('proposta_pechada') + '</span>'
            : '<span class="badge badge-success">' + t('proposta_aberta') + '</span>';

        var voteHtml = '<div class="vote-buttons">' +
            '<button class="vote-btn' + (meuVoto === 1 ? ' voted' : '') + '" onclick="event.stopPropagation();propostasVotar(' + p.id + ',' + (meuVoto === 1 ? 0 : 1) + ')" title="' + t('a_favor') + '">' +
                '&#9650; ' + favor +
            '</button>' +
            '<button class="vote-btn' + (meuVoto === -1 ? ' voted-down' : '') + '" onclick="event.stopPropagation();propostasVotar(' + p.id + ',' + (meuVoto === -1 ? 0 : -1) + ')" title="' + t('en_contra') + '">' +
                '&#9660; ' + contra +
            '</button>' +
            '<span class="text-muted text-sm" style="margin-left:auto">&#128172; ' + numComentarios + '</span>' +
        '</div>';

        var actions = '';
        if (isSocio || isOwner) {
            actions += '<button class="btn-icon" onclick="event.stopPropagation();propostasModal(AppState.propostas.find(function(x){return x.id==' + p.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>';
        }
        if (isSocio) {
            actions += '<button class="btn-icon btn-whatsapp" onclick="event.stopPropagation();propostasShareWhatsapp(' + p.id + ')" title="' + t('compartir_whatsapp') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>';
        }
        if (isSocio || isOwner) {
            actions += '<button class="btn-icon btn-danger" onclick="event.stopPropagation();propostasDelete(' + p.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>';
        }

        html += '<div class="card" style="cursor:pointer" onclick="propostasDetail(' + p.id + ')">' +
            '<div class="card-body">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
                    '<h3 class="card-title" style="margin:0">' + esc(p.titulo) + '</h3>' +
                    estadoBadge +
                '</div>' +
                '<p class="card-meta">' + esc(p.autor_nome || p.autor || '') + ' &middot; ' + formatDate(p.data) + '</p>' +
                '<p class="card-text">' + esc(truncate(stripHtml(p.texto), 200)) + '</p>' +
                (p.ficheiros && p.ficheiros.length ? '<p class="card-meta">' + t('ficheiros') + ': ' + p.ficheiros.length + '</p>' : '') +
                voteHtml +
            '</div>' +
            (actions ? '<div class="card-actions">' + actions + '</div>' : '') +
        '</div>';
    });

    grid.innerHTML = html;
}

// ---- Detail view with comments ----
async function propostasDetail(id) {
    var p = (AppState.propostas || []).find(function(x) { return x.id == id; });
    if (!p) return;

    var favor = parseInt(p.votos_favor) || 0;
    var contra = parseInt(p.votos_contra) || 0;
    var meuVoto = parseInt(p.meu_voto) || 0;
    var estado = p.estado || 'aberta';
    var isSocio = AppState.isSocio();
    var isAdmin = AppState.isAdmin();
    var userId = AppState.user ? String(AppState.user.id) : '';
    var isOwner = userId && String(p.autor) === userId;

    var estadoBadge = estado === 'pechada'
        ? '<span class="badge badge-danger">' + t('proposta_pechada') + '</span>'
        : '<span class="badge badge-success">' + t('proposta_aberta') + '</span>';

    $('#modal-title').textContent = p.titulo;

    var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
        estadoBadge +
        '<span class="text-muted text-sm">' + esc(p.autor_nome || p.autor || '') + ' &middot; ' + formatDate(p.data) + '</span>';

    // Toggle estado button (socio/admin/owner)
    if (isSocio || isOwner) {
        if (estado === 'aberta') {
            html += '<button class="btn btn-sm btn-secondary" style="margin-left:auto" onclick="propostasToggleEstado(' + id + ',\'pechada\')">' + t('pechar') + '</button>';
        } else {
            html += '<button class="btn btn-sm btn-primary" style="margin-left:auto" onclick="propostasToggleEstado(' + id + ',\'aberta\')">' + t('proposta_aberta') + '</button>';
        }
    }
    html += '</div>';

    // Full text
    html += '<div class="rt-content" style="margin-bottom:16px">' + sanitizeHtml(p.texto) + '</div>';

    // Files
    if (p.ficheiros && p.ficheiros.length) {
        html += '<div style="margin-bottom:16px">';
        html += '<strong>' + t('ficheiros') + ':</strong><br>';
        p.ficheiros.forEach(function(f, idx) {
            var fname = f.name || f.filename || ('ficheiro_' + (idx + 1));
            if (f.url) {
                html += '<a href="' + esc(uploadUrl(f.url)) + '" target="_blank" style="color:var(--primary)">' + esc(fname) + '</a><br>';
            } else {
                html += '<span class="text-muted">' + esc(fname) + '</span><br>';
            }
        });
        html += '</div>';
    }

    // Voting
    html += '<div class="vote-buttons" style="margin-bottom:16px">' +
        '<button class="vote-btn' + (meuVoto === 1 ? ' voted' : '') + '" onclick="propostasVotar(' + id + ',' + (meuVoto === 1 ? 0 : 1) + ');propostasDetail(' + id + ')" title="' + t('a_favor') + '">' +
            '&#9650; ' + t('a_favor') + ' (' + favor + ')' +
        '</button>' +
        '<button class="vote-btn' + (meuVoto === -1 ? ' voted-down' : '') + '" onclick="propostasVotar(' + id + ',' + (meuVoto === -1 ? 0 : -1) + ');propostasDetail(' + id + ')" title="' + t('en_contra') + '">' +
            '&#9660; ' + t('en_contra') + ' (' + contra + ')' +
        '</button>' +
    '</div>';

    // Comments section
    html += '<hr style="border-color:var(--border);margin:12px 0">';
    html += '<h4 style="margin-bottom:12px">' + t('comentarios') + '</h4>';
    html += '<div id="proposta-comments-list" style="margin-bottom:12px"><p class="text-muted text-sm">' + t('cargando') + '</p></div>';

    // Comment form
    html += '<div style="display:flex;gap:8px;align-items:flex-start">' +
        '<textarea class="form-control" id="proposta-comment-text" rows="2" placeholder="' + t('escribir_comentario') + '" style="flex:1"></textarea>' +
        '<button class="btn btn-primary btn-sm" onclick="propostasAddComment(' + id + ')" style="align-self:flex-end">' + t('enviar') + '</button>' +
    '</div>';

    $('#modal-body').innerHTML = html;

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('voltar') + '</button>';

    showModal('modal-overlay');

    // Load comments async
    _propostasLoadComments(id);
}

async function _propostasLoadComments(id) {
    var listEl = $('#proposta-comments-list');
    if (!listEl) return;
    try {
        var comments = await api('/comentarios?item_type=proposta&item_id=' + id);
        if (comments.length === 0) {
            listEl.innerHTML = '<p class="text-muted text-sm">' + t('sen_resultados') + '</p>';
            return;
        }
        var userId = AppState.user ? String(AppState.user.id) : '';
        var isAdmin = AppState.isAdmin();
        var html = '';
        comments.forEach(function(c) {
            var canDelete = isAdmin || String(c.autor_id) === userId;
            html += '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
                '<div style="width:32px;height:32px;border-radius:50%;background:var(--primary-dim);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0">' +
                    esc((c.autor_nome || '?').charAt(0).toUpperCase()) +
                '</div>' +
                '<div style="flex:1;min-width:0">' +
                    '<div style="font-size:0.8rem;margin-bottom:2px"><strong style="color:var(--text)">' + esc(c.autor_nome || '') + '</strong> <span class="text-muted" style="font-size:0.75rem">' + formatDate(c.creado) + '</span></div>' +
                    '<div style="font-size:0.9rem;color:var(--text-dim);word-break:break-word">' + esc(c.texto) + '</div>' +
                '</div>' +
                (canDelete ? '<button style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:2px 4px;opacity:0.5" onmouseover="this.style.opacity=1;this.style.color=\'var(--danger)\'" onmouseout="this.style.opacity=0.5;this.style.color=\'var(--text-muted)\'" onclick="propostasDeleteComment(' + c.id + ',' + (c.item_id || 0) + ')" title="' + t('eliminar') + '">&times;</button>' : '') +
            '</div>';
        });
        listEl.innerHTML = html;
    } catch (e) {
        listEl.innerHTML = '<p class="text-muted text-sm">' + t('erro') + '</p>';
    }
}

async function propostasAddComment(propostaId) {
    var textEl = $('#proposta-comment-text');
    var texto = (textEl ? textEl.value : '').trim();
    if (!texto) return;
    try {
        await api('/comentarios', { method: 'POST', body: { item_type: 'proposta', item_id: propostaId, texto: texto } });
        textEl.value = '';
        // Update local comment count
        var p = (AppState.propostas || []).find(function(x) { return x.id == propostaId; });
        if (p) p.num_comentarios = (parseInt(p.num_comentarios) || 0) + 1;
        _propostasLoadComments(propostaId);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function propostasDeleteComment(commentId, propostaId) {
    try {
        await api('/comentarios/' + commentId, { method: 'DELETE' });
        var p = (AppState.propostas || []).find(function(x) { return x.id == propostaId; });
        if (p) p.num_comentarios = Math.max(0, (parseInt(p.num_comentarios) || 0) - 1);
        _propostasLoadComments(propostaId);
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Toggle estado ----
async function propostasToggleEstado(id, newEstado) {
    try {
        await api('/propostas/' + id, { method: 'PUT', body: { estado: newEstado } });
        var p = (AppState.propostas || []).find(function(x) { return x.id == id; });
        if (p) p.estado = newEstado;
        propostasRender();
        propostasDetail(id); // refresh modal
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

// ---- Create/Edit modal ----
function propostasModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('proposta') : t('nova_proposta');

    $('#modal-title').textContent = title;

    var estadoOpts = '';
    if (isEdit) {
        estadoOpts = '<div class="form-group">' +
            '<label>' + t('estado') + '</label>' +
            '<select class="form-control" id="proposta-estado">' +
                '<option value="aberta"' + ((item.estado || 'aberta') === 'aberta' ? ' selected' : '') + '>' + t('proposta_aberta') + '</option>' +
                '<option value="pechada"' + (item.estado === 'pechada' ? ' selected' : '') + '>' + t('proposta_pechada') + '</option>' +
            '</select>' +
        '</div>';
    }

    $('#modal-body').innerHTML =
        '<input type="hidden" id="proposta-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label class="required">' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="proposta-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('texto') + '</label>' +
            '<div class="rt-wrap" id="proposta-texto-editor"></div>' +
        '</div>' +
        estadoOpts +
        '<div class="form-group">' +
            '<label>' + t('ficheiros') + '</label>' +
            '<input type="file" class="form-control" id="proposta-ficheiros" multiple>' +
        '</div>';

    initRichTextEditor('proposta-texto-editor', isEdit ? item.texto || '' : '', { uploadDir: 'propostas' });

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="propostasSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function propostasSave() {
    var id = ($('#proposta-id') || {}).value;
    var isEdit = !!id;

    var body = {
        titulo: ($('#proposta-titulo') || {}).value || '',
        texto: getRichTextContent('proposta-texto-editor')
    };

    if (isEdit) {
        var estadoEl = $('#proposta-estado');
        if (estadoEl) body.estado = estadoEl.value;
    } else {
        body.autor = AppState.user.username;
        body.autor_nome = AppState.user.nome_completo;
        body.data = today();
    }

    var ficheirosInput = $('#proposta-ficheiros');
    if (ficheirosInput && ficheirosInput.files && ficheirosInput.files.length > 0) {
        var ficheiros = [];
        for (var i = 0; i < ficheirosInput.files.length; i++) {
            ficheiros.push(await fileToBase64(ficheirosInput.files[i]));
        }
        body.ficheiros = ficheiros;
    }

    try {
        if (isEdit) {
            await api('/propostas/' + id, { method: 'PUT', body: body });
        } else {
            await api('/propostas', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        propostasLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function propostasExport(format) {
    var headers = [t('titulo'), t('autor'), t('data'), t('a_favor'), t('en_contra'), t('estado')];
    var rows = (AppState.propostas || []).map(function(p) {
        return [p.titulo, p.autor_nome || p.autor || '', p.data || '', parseInt(p.votos_favor) || 0, parseInt(p.votos_contra) || 0, p.estado || 'aberta'];
    });
    if (format === 'pdf') {
        exportPDF(t('propostas'), headers, rows);
    } else {
        exportCSV('propostas.csv', headers, rows);
    }
}

async function propostasDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/propostas/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        propostasLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function propostasShareWhatsapp(id) {
    var p = (AppState.propostas || []).find(function(x) { return x.id == id; });
    if (!p) return;

    var nome = (AppState.config || {}).nome_asociacion || 'Levada Arraiana';
    var favor = parseInt(p.votos_favor) || 0;
    var contra = parseInt(p.votos_contra) || 0;
    var numComentarios = parseInt(p.num_comentarios) || 0;
    var estado = (p.estado || 'aberta');
    var l = [];

    l.push(String.fromCodePoint(0x1F4AC) + ' *' + nome + ' \u2014 ' + t('proposta') + '*');
    l.push(String.fromCodePoint(0x1F4C5) + ' ' + (p.data ? formatDate(p.data) : ''));
    l.push('*' + (p.titulo || '') + '*');

    if (p.texto) {
        var desc = p.texto.replace(/<[^>]+>/g, '').trim();
        if (desc.length > 150) desc = desc.substring(0, 150) + '...';
        if (desc) l.push('_' + desc + '_');
    }

    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    l.push(String.fromCodePoint(0x1F44D) + ' ' + t('a_favor') + ': ' + favor + '  ' + String.fromCodePoint(0x1F44E) + ' ' + t('en_contra') + ': ' + contra);
    if (numComentarios > 0) {
        l.push(String.fromCodePoint(0x1F4AC) + ' ' + t('comentarios') + ': ' + numComentarios);
    }
    l.push(estado === 'pechada' ? String.fromCodePoint(0x1F512) + ' ' + t('proposta_pechada') : String.fromCodePoint(0x1F513) + ' ' + t('proposta_aberta'));

    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    var baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'app.html#propostas/' + id;
    l.push(String.fromCodePoint(0x1F449) + ' *' + t('ver') + ':*');
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

async function propostasVotar(id, voto) {
    try {
        if (voto === 0) {
            await api('/propostas/' + id + '/voto', { method: 'DELETE' });
        } else {
            await api('/propostas/' + id + '/voto', { method: 'POST', body: { voto: voto } });
        }
        // Update local state for responsiveness
        var p = (AppState.propostas || []).find(function(x) { return x.id == id; });
        if (p) {
            var oldVoto = parseInt(p.meu_voto) || 0;
            if (oldVoto === 1) p.votos_favor = Math.max(0, (parseInt(p.votos_favor) || 0) - 1);
            if (oldVoto === -1) p.votos_contra = Math.max(0, (parseInt(p.votos_contra) || 0) - 1);
            if (voto === 1) p.votos_favor = (parseInt(p.votos_favor) || 0) + 1;
            if (voto === -1) p.votos_contra = (parseInt(p.votos_contra) || 0) + 1;
            p.meu_voto = voto;
        }
        propostasRender();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
