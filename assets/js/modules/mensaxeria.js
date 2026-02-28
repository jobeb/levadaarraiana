/**
 * Mensaxeria — Internal messaging module
 */

async function mensaxeriaLoad() {
    try {
        AppState.mensaxes = await api('/mensaxes');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.mensaxes = [];
    }
    mensaxeriaRender();
}

function mensaxeriaRender() {
    var container = $('#mensaxes-list');
    if (!container) return;

    var currentUserId = AppState.user ? parseInt(AppState.user.id) : 0;
    var list = (AppState.mensaxes || []).filter(function(m) {
        if (m.ocultos && Array.isArray(m.ocultos) && m.ocultos.indexOf(currentUserId) !== -1) {
            return false;
        }
        return true;
    });

    // Search filter
    var searchTerm = ($('#mensaxeria-search') || {}).value || '';
    if (searchTerm) {
        var st = searchTerm.toLowerCase();
        list = list.filter(function(m) {
            return (m.titulo || '').toLowerCase().indexOf(st) !== -1 ||
                   (m.texto || '').toLowerCase().indexOf(st) !== -1 ||
                   (m.autor_nome || m.autor || '').toLowerCase().indexOf(st) !== -1;
        });
    }

    if (list.length === 0) {
        container.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var html = '';

    list.forEach(function(m) {
        var isRead = false;
        if (m.lidos && Array.isArray(m.lidos)) {
            isRead = m.lidos.indexOf(currentUserId) !== -1;
        } else if (m.lida) {
            isRead = true;
        }

        var lidaBadge = isRead
            ? '<span class="badge badge-success">' + t('lida') + '</span>'
            : '<span class="badge badge-warning">' + t('non_lida') + '</span>';

        var tipoBadge = '';
        if (m.tipo === 'direccion') {
            tipoBadge = '<span class="badge badge-primary">' + t('direccion') + '</span>';
        } else {
            tipoBadge = '<span class="badge">' + t('xeral') + '</span>';
        }

        var actions = '<div class="card-actions">';
        if (!isRead) {
            actions += '<button class="btn btn-sm btn-success" onclick="mensaxeriaLido(' + m.id + ')" title="' + t('marcar_lida') + '">' + t('marcar_lida') + '</button>';
        }
        actions += '<button class="btn btn-sm btn-secondary" onclick="mensaxeriaReply(' + m.id + ')">' + t('responder') + '</button>';
        actions += '<button class="btn-icon btn-danger" onclick="mensaxeriaOcultar(' + m.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
        actions += '</div>';

        var ficheirosHtml = '';
        if (m.ficheiros && m.ficheiros.length > 0) {
            ficheirosHtml = '<div class="msg-files">';
            m.ficheiros.forEach(function(f) {
                var fPath = typeof f === 'string' ? f : f.path || f.url || '';
                var fName = typeof f === 'string' ? f.split('/').pop() : f.name || f.path || '';
                ficheirosHtml += '<a href="' + esc(uploadUrl(fPath)) + '" target="_blank" class="badge">' + esc(fName) + '</a> ';
            });
            ficheirosHtml += '</div>';
        }

        html += '<div class="msg-card' + (isRead ? '' : ' msg-unread') + '">' +
            '<div class="msg-header">' +
                '<strong class="msg-title">' + esc(m.titulo) + '</strong>' +
                '<div class="msg-badges">' + tipoBadge + ' ' + lidaBadge + '</div>' +
            '</div>' +
            (m.en_resposta_a ? '<div class="msg-reply-quote">' + t('mensaxe_orixinal') + ': ' + esc(_getMsgTitle(m.en_resposta_a)) + '</div>' : '') +
            '<p class="msg-text' + ((m.texto || '').length > 200 ? ' msg-expandable' : '') + '" onclick="this.classList.contains(\'msg-expandable\') && mensaxeriaExpand(this, ' + m.id + ')">' + esc(truncate(m.texto, 200)) + '</p>' +
            ((m.texto || '').length > 200 ? '<button class="msg-expand-btn" onclick="mensaxeriaExpand(this.previousElementSibling, ' + m.id + ')">' + t('ver_mais') + '</button>' : '') +
            ficheirosHtml +
            '<div class="msg-meta">' +
                '<span>' + esc(m.autor || '') + '</span>' +
                '<span>' + formatDate(m.data) + '</span>' +
            '</div>' +
            actions +
            '</div>';
    });

    container.innerHTML = html;
}

function _getMsgTitle(id) {
    var m = (AppState.mensaxes || []).find(function(x) { return x.id == id; });
    return m ? m.titulo : '';
}

function mensaxeriaExpand(el, id) {
    var m = (AppState.mensaxes || []).find(function(x) { return x.id == id; });
    if (m && el) {
        el.textContent = m.texto;
        el.classList.remove('msg-expandable');
        var btn = el.nextElementSibling;
        if (btn && btn.classList.contains('msg-expand-btn')) btn.remove();
    }
}

function mensaxeriaReply(id) {
    var orig = (AppState.mensaxes || []).find(function(x) { return x.id == id; });
    mensaxeriaModal(orig ? id : null);
    if (orig) {
        setTimeout(function() {
            var titulo = $('#mensaxe-titulo');
            if (titulo && !titulo.value) titulo.value = 'Re: ' + (orig.titulo || '');
            var texto = $('#mensaxe-texto');
            if (texto && !texto.value) texto.value = '\n\n--- ' + t('mensaxe_orixinal') + ' ---\n' + (orig.texto || '');
        }, 50);
    }
}

function mensaxeriaModal(replyToId) {
    $('#modal-title').textContent = t('nova_mensaxe');

    var tipoOptions = ['xeral', 'direccion'].map(function(tp) {
        return '<option value="' + tp + '">' + t(tp) + '</option>';
    }).join('');

    $('#modal-body').innerHTML =
        '<input type="hidden" id="mensaxe-reply-to" value="' + (replyToId || '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="mensaxe-titulo">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('texto') + '</label>' +
            '<textarea class="form-control" id="mensaxe-texto" rows="5"></textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('tipo') + '</label>' +
            '<select class="form-control" id="mensaxe-tipo">' + tipoOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('ficheiros') + '</label>' +
            '<input type="file" class="form-control" id="mensaxe-ficheiros" multiple>' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="mensaxeriaSave()">' + t('enviar') + '</button>';

    showModal('modal-overlay');
}

async function mensaxeriaSave() {
    var body = {
        titulo: ($('#mensaxe-titulo') || {}).value || '',
        texto: ($('#mensaxe-texto') || {}).value || '',
        tipo: ($('#mensaxe-tipo') || {}).value || 'xeral'
    };
    var replyId = ($('#mensaxe-reply-to') || {}).value;
    if (replyId) body.en_resposta_a = parseInt(replyId);

    var fileInput = $('#mensaxe-ficheiros');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        var ficheiros = [];
        for (var i = 0; i < fileInput.files.length; i++) {
            ficheiros.push(await fileToBase64(fileInput.files[i]));
        }
        body.ficheiros = ficheiros;
    }

    try {
        await api('/mensaxes', { method: 'POST', body: body });
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        mensaxeriaLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function mensaxeriaLido(id) {
    try {
        await api('/mensaxes/' + id + '/lido', { method: 'PUT' });
        toast(t('exito'), 'success');
        mensaxeriaLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function mensaxeriaOcultar(id) {
    if (!await confirmAction(t('confirmar_accion'))) return;
    try {
        await api('/mensaxes/' + id + '/oculto', { method: 'PUT' });
        // Remove from local state immediately for responsiveness
        AppState.mensaxes = (AppState.mensaxes || []).filter(function(m) { return m.id !== id; });
        mensaxeriaRender();
        toast(t('exito'), 'success');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
