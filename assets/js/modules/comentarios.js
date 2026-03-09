/**
 * Comentarios — Panel admin/socio (listar, moderar, eliminar)
 * Levada Arraiana
 */

var _comentariosData = [];

async function comentariosLoad() {
    try {
        _comentariosData = await api('/comentarios');
    } catch (e) {
        _comentariosData = [];
    }
    comentariosRender();
}

function comentariosRender() {
    var tbody = document.querySelector('#comentarios-table tbody');
    if (!tbody) return;

    var filterEl = document.getElementById('comentarios-estado-filter');
    var estadoFilter = filterEl ? filterEl.value : '';

    var filtered = _comentariosData;
    if (estadoFilter) {
        filtered = _comentariosData.filter(function(c) { return c.estado === estadoFilter; });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">' + t('sen_resultados') + '</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(function(c) {
        var tipoLabel = c.item_type === 'noticia' ? t('noticias') : (c.item_type === 'proposta' ? t('propostas') : t('bolos'));
        var tipoBadge = c.item_type === 'noticia' ? 'primary' : (c.item_type === 'proposta' ? 'info' : 'warning');
        var textoTrunc = truncate(c.texto || '', 80);
        var isReply = c.parent_id !== null && c.parent_id !== undefined;
        var textoDisplay = (isReply ? '<span style="color:var(--text-muted);font-size:0.8rem">\u21b3 ' + t('resposta') + ':</span> ' : '') + esc(textoTrunc);

        // Estado badge
        var estadoBadge = '';
        if (c.estado === 'pendente') {
            estadoBadge = '<span class="badge badge-warning">' + t('pendente') + '</span>';
        } else if (c.estado === 'aprobado') {
            estadoBadge = '<span class="badge badge-success">' + t('aprobado') + '</span>';
        } else {
            estadoBadge = '<span class="badge badge-danger">' + t('rexeitado') + '</span>';
        }

        // Accións
        var accions = '';
        if (c.estado === 'pendente') {
            accions = '<button class="btn btn-sm btn-success" onclick="comentariosAprobar(' + c.id + ')">' + t('aprobar') + '</button> ' +
                '<button class="btn btn-sm btn-warning" onclick="comentariosRexeitar(' + c.id + ')">' + t('rexeitar') + '</button> ';
        }
        accions += '<button class="btn btn-sm btn-danger" onclick="comentariosDelete(' + c.id + ')">' + t('eliminar') + '</button>';

        return '<tr>' +
            '<td><span class="badge badge-' + tipoBadge + '">' + esc(tipoLabel) + '</span></td>' +
            '<td>#' + c.item_id + '</td>' +
            '<td>' + esc(c.autor_nome || '') + '</td>' +
            '<td>' + textoDisplay + '</td>' +
            '<td>' + estadoBadge + '</td>' +
            '<td>' + formatDate(c.creado ? c.creado.substring(0, 10) : '') + '</td>' +
            '<td>' + accions + '</td>' +
        '</tr>';
    }).join('');
}

async function comentariosAprobar(id) {
    try {
        await api('/comentarios/' + id, { method: 'PUT', body: { estado: 'aprobado' } });
        toast(t('exito'), 'success');
        comentariosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function comentariosRexeitar(id) {
    try {
        await api('/comentarios/' + id, { method: 'PUT', body: { estado: 'rexeitado' } });
        toast(t('exito'), 'success');
        comentariosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function comentariosDelete(id) {
    if (!(await confirmAction(t('confirmar_eliminar')))) return;
    try {
        await api('/comentarios/' + id, { method: 'DELETE' });
        toast(t('comentario_eliminado'), 'success');
        comentariosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
