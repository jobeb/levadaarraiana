/**
 * Papeleira de reciclaxe — Admin only
 */

var _papeleiraData = [];

async function papeleiraLoad() {
    try {
        _papeleiraData = await api('/papeleira');
    } catch (e) {
        _papeleiraData = [];
        toast(t('erro') + ': ' + e.message, 'error');
    }
    papeleiraRender();
}

function papeleiraRender() {
    var tbody = document.querySelector('#papeleira-table tbody');
    if (!tbody) return;
    if (!_papeleiraData.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">' + t('papeleira_baleira') + '</td></tr>';
        return;
    }
    tbody.innerHTML = _papeleiraData.map(function(item) {
        return '<tr>' +
            '<td><span class="badge">' + esc(item.modulo) + '</span></td>' +
            '<td>' + esc(item.titulo || '-') + '</td>' +
            '<td>' + formatDate(item.eliminado) + '</td>' +
            '<td style="white-space:nowrap">' +
                '<button class="btn btn-sm btn-primary" onclick="papeleiraRestaurar(\'' + esc(item.modulo) + '\',' + item.id + ')">' + t('restaurar') + '</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="papeleiraEliminar(\'' + esc(item.modulo) + '\',' + item.id + ')">' + t('eliminar_definitivo') + '</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

async function papeleiraRestaurar(modulo, id) {
    try {
        await api('/papeleira/restaurar', { method: 'PUT', body: { modulo: modulo, id: id } });
        toast(t('restaurado'), 'success');
        papeleiraLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function papeleiraEliminar(modulo, id) {
    if (!confirm(t('confirmar_eliminar_definitivo'))) return;
    try {
        await api('/papeleira/definitivo', { method: 'DELETE', body: { modulo: modulo, id: id } });
        toast(t('eliminado_definitivo'), 'success');
        papeleiraLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
