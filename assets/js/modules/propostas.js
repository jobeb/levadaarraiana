/**
 * Propostas — Proposals module
 */

async function propostasLoad() {
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

    var list = AppState.propostas || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var html = '';
    list.forEach(function(p) {
        var favor = parseInt(p.votos_favor) || 0;
        var contra = parseInt(p.votos_contra) || 0;
        var meuVoto = parseInt(p.meu_voto) || 0;

        var voteHtml = '<div class="vote-buttons">' +
            '<button class="vote-btn' + (meuVoto === 1 ? ' voted' : '') + '" onclick="propostasVotar(' + p.id + ',' + (meuVoto === 1 ? 0 : 1) + ')" title="' + t('a_favor') + '">' +
                '&#9650; ' + favor +
            '</button>' +
            '<button class="vote-btn' + (meuVoto === -1 ? ' voted-down' : '') + '" onclick="propostasVotar(' + p.id + ',' + (meuVoto === -1 ? 0 : -1) + ')" title="' + t('en_contra') + '">' +
                '&#9660; ' + contra +
            '</button>' +
        '</div>';

        html += '<div class="card">' +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(p.titulo) + '</h3>' +
                '<p class="card-meta">' + esc(p.autor_nome || p.autor || '') + ' &middot; ' + formatDate(p.data) + '</p>' +
                '<p class="card-text">' + esc(truncate(p.texto, 150)) + '</p>' +
                (p.ficheiros && p.ficheiros.length ? '<p class="card-meta">' + t('ficheiros') + ': ' + p.ficheiros.length + '</p>' : '') +
                voteHtml +
            '</div>' +
            '<div class="card-actions">' +
                '<button class="btn-icon" onclick="propostasModal(AppState.propostas.find(function(x){return x.id==' + p.id + '}))" title="' + t('editar') + '">&#9998;</button>' +
                (AppState.isAdmin() || (AppState.user && AppState.user.username === p.autor)
                    ? '<button class="btn-icon btn-danger" onclick="propostasDelete(' + p.id + ')" title="' + t('eliminar') + '">&#128465;</button>'
                    : '') +
            '</div>' +
        '</div>';
    });

    grid.innerHTML = html;
}

function propostasModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('proposta') : t('nova_proposta');

    $('#modal-title').textContent = title;

    $('#modal-body').innerHTML =
        '<input type="hidden" id="proposta-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="proposta-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('texto') + '</label>' +
            '<textarea class="form-control" id="proposta-texto" rows="6">' + esc(isEdit ? item.texto || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('ficheiros') + '</label>' +
            '<input type="file" class="form-control" id="proposta-ficheiros" multiple>' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="propostasSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function propostasSave() {
    var id = ($('#proposta-id') || {}).value;
    var isEdit = !!id;

    var body = {
        titulo: ($('#proposta-titulo') || {}).value || '',
        texto: ($('#proposta-texto') || {}).value || ''
    };

    if (!isEdit) {
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

async function propostasVotar(id, voto) {
    try {
        if (voto === 0) {
            // Remove vote
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
