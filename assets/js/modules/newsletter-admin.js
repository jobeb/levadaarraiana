/**
 * Newsletter Admin — Xestion de suscritores
 */

var _newsletterData = [];

async function newsletterAdminLoad() {
    try {
        _newsletterData = await api('/newsletter');
    } catch (e) {
        _newsletterData = [];
        toast(t('erro') + ': ' + e.message, 'error');
    }
    newsletterAdminRender();
}

function newsletterAdminRender() {
    var tbody = document.querySelector('#newsletter-admin-table tbody');
    if (!tbody) return;

    var countEl = document.getElementById('newsletter-admin-count');
    var activos = _newsletterData.filter(function(s) { return s.activo == 1; });
    if (countEl) countEl.textContent = activos.length + ' ' + t('activos');

    if (!_newsletterData.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">' + t('sen_resultados') + '</td></tr>';
        return;
    }

    tbody.innerHTML = _newsletterData.map(function(s) {
        var estadoBadge = s.activo == 1
            ? '<span class="badge badge-success">' + t('activo') + '</span>'
            : '<span class="badge badge-danger">' + t('inactivo') + '</span>';
        return '<tr>' +
            '<td>' + esc(s.email) + '</td>' +
            '<td>' + estadoBadge + '</td>' +
            '<td>' + formatDate(s.creado) + '</td>' +
            '<td>' +
                '<button class="btn-icon btn-danger" onclick="newsletterAdminDelete(' + s.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>' +
            '</td>' +
            '</tr>';
    }).join('');
}

async function newsletterAdminDelete(id) {
    if (!confirm(t('confirmar_eliminar'))) return;
    try {
        await api('/newsletter/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        newsletterAdminLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
