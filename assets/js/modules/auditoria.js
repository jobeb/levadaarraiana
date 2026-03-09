/**
 * Modulo Auditoria — Rexistro de actividade (admin-only)
 * Levada Arraiana
 */

var _auditData = [];
var _auditTotal = 0;
var _auditPage = 1;
var _auditPages = 1;
var _auditLimit = 50;
var _auditRetencion = 90;

async function auditoriaLoad() {
    // Load retention config
    try {
        var cfg = await api('/config');
        _auditRetencion = cfg.audit_retencion_dias || 90;
    } catch(e) {}
    await _auditoriaFetch();
}

async function _auditoriaFetch() {
    var params = new URLSearchParams();
    params.set('page', _auditPage);
    params.set('limit', _auditLimit);

    var modulo = ($('#audit-filter-modulo') || {}).value || '';
    var accion = ($('#audit-filter-accion') || {}).value || '';
    var desde  = ($('#audit-filter-desde') || {}).value || '';
    var ata    = ($('#audit-filter-ata') || {}).value || '';

    if (modulo) params.set('modulo', modulo);
    if (accion) params.set('accion', accion);
    if (desde) params.set('desde', desde);
    if (ata) params.set('ata', ata);

    try {
        var res = await api('/auditoria?' + params.toString());
        _auditData = res.data || [];
        _auditTotal = res.total || 0;
        _auditPage = res.page || 1;
        _auditPages = res.pages || 1;
    } catch(e) {
        _auditData = [];
        _auditTotal = 0;
    }
    _auditoriaRender();
}

function _auditoriaRender() {
    var container = document.getElementById('auditoria-content');
    if (!container) return;

    // Filters
    var filtersHtml =
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:var(--gap);align-items:center">' +
            '<select class="form-control" id="audit-filter-modulo" style="max-width:160px" onchange="_auditoriaFilter()">' +
                '<option value="">' + t('todos') + ' (' + t('modulo_label') + ')</option>' +
                _auditoriaModuloOptions() +
            '</select>' +
            '<select class="form-control" id="audit-filter-accion" style="max-width:160px" onchange="_auditoriaFilter()">' +
                '<option value="">' + t('todos') + ' (' + t('accion_label') + ')</option>' +
                _auditoriaAccionOptions() +
            '</select>' +
            '<input type="date" class="form-control" id="audit-filter-desde" style="max-width:150px" onchange="_auditoriaFilter()" placeholder="Desde">' +
            '<input type="date" class="form-control" id="audit-filter-ata" style="max-width:150px" onchange="_auditoriaFilter()" placeholder="Ata">' +
            '<div style="margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
                '<label style="font-size:0.85rem;color:var(--text-muted);white-space:nowrap">' + t('retencion_label') + '</label>' +
                '<input type="number" class="form-control" id="audit-retencion" value="' + _auditRetencion + '" min="0" style="max-width:80px" onchange="_auditoriaSaveRetencion()">' +
                '<span style="font-size:0.85rem;color:var(--text-muted)">' + t('dias') + '</span>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:var(--gap)">' +
            '<button class="btn btn-sm btn-secondary" onclick="_auditoriaLimparAntigos()">' + t('limpar_antigos') + '</button>' +
            '<button class="btn btn-sm btn-secondary" style="color:var(--danger)" onclick="_auditoriaLimparTodo()">' + t('limpar_todo') + '</button>' +
            '<span style="margin-left:auto;font-size:0.85rem;color:var(--text-muted);align-self:center">' + _auditTotal + ' ' + t('rexistros') + '</span>' +
        '</div>';

    // Table
    var tableHtml = '<div class="table-wrap"><table class="audit-table"><thead><tr>' +
        '<th>' + t('data') + '</th>' +
        '<th>' + t('usuario') + '</th>' +
        '<th>' + t('accion_label') + '</th>' +
        '<th>' + t('modulo_label') + '</th>' +
        '<th>ID</th>' +
        '<th>' + t('detalles') + '</th>' +
        '<th>IP</th>' +
        '</tr></thead><tbody>';

    if (_auditData.length === 0) {
        tableHtml += '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px">' + t('sen_resultados') + '</td></tr>';
    } else {
        _auditData.forEach(function(r) {
            var dt = (r.creado || '').replace('T', ' ').substring(0, 19);
            tableHtml += '<tr>' +
                '<td style="white-space:nowrap;font-size:0.85rem">' + esc(dt) + '</td>' +
                '<td>' + esc(r.usuario_nome || '-') + '</td>' +
                '<td><span class="badge badge-' + _auditAccionBadge(r.accion) + '">' + esc(r.accion) + '</span></td>' +
                '<td>' + esc(r.modulo || '') + '</td>' +
                '<td>' + (r.registro_id || '') + '</td>' +
                '<td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.85rem" title="' + esc(r.detalles || '') + '">' + esc(truncate(r.detalles || '', 80)) + '</td>' +
                '<td style="font-size:0.85rem">' + esc(r.ip || '') + '</td>' +
                '</tr>';
        });
    }
    tableHtml += '</tbody></table></div>';

    // Pagination
    var pagHtml = '';
    if (_auditPages > 1) {
        pagHtml = '<div class="pagination" style="margin-top:12px">';
        pagHtml += '<button ' + (_auditPage <= 1 ? 'disabled' : '') + ' onclick="_auditoriaGoPage(' + (_auditPage - 1) + ')">' + t('anterior') + '</button>';
        var startP = Math.max(1, _auditPage - 2);
        var endP = Math.min(_auditPages, _auditPage + 2);
        if (startP > 1) {
            pagHtml += '<button onclick="_auditoriaGoPage(1)">1</button>';
            if (startP > 2) pagHtml += '<span style="color:var(--text-dim)">...</span>';
        }
        for (var i = startP; i <= endP; i++) {
            pagHtml += '<button' + (i === _auditPage ? ' class="active"' : '') + ' onclick="_auditoriaGoPage(' + i + ')">' + i + '</button>';
        }
        if (endP < _auditPages) {
            if (endP < _auditPages - 1) pagHtml += '<span style="color:var(--text-dim)">...</span>';
            pagHtml += '<button onclick="_auditoriaGoPage(' + _auditPages + ')">' + _auditPages + '</button>';
        }
        pagHtml += '<button ' + (_auditPage >= _auditPages ? 'disabled' : '') + ' onclick="_auditoriaGoPage(' + (_auditPage + 1) + ')">' + t('seguinte') + '</button>';
        pagHtml += '</div>';
    }

    container.innerHTML = filtersHtml + tableHtml + pagHtml;
}

function _auditoriaModuloOptions() {
    var modulos = ['auth','noticias','bolos','albums','actas','propostas','votacions','ensaios',
                   'instrumentos','repertorio','usuarios','config','comentarios','documentos','youtube','landing','auditoria'];
    return modulos.map(function(m) { return '<option value="' + m + '">' + m + '</option>'; }).join('');
}

function _auditoriaAccionOptions() {
    var accions = ['LOGIN','LOGOUT','REGISTER','CREATE','UPDATE','DELETE','CONFIG','UPLOAD','DISCONNECT'];
    return accions.map(function(a) { return '<option value="' + a + '">' + a + '</option>'; }).join('');
}

function _auditAccionBadge(accion) {
    var map = {
        'LOGIN': 'primary', 'LOGOUT': 'secondary', 'REGISTER': 'success',
        'CREATE': 'success', 'UPDATE': 'warning', 'DELETE': 'danger',
        'CONFIG': 'warning', 'UPLOAD': 'primary', 'DISCONNECT': 'danger'
    };
    return map[accion] || 'secondary';
}

function _auditoriaFilter() {
    _auditPage = 1;
    _auditoriaFetch();
}

function _auditoriaGoPage(p) {
    _auditPage = Math.max(1, Math.min(p, _auditPages));
    _auditoriaFetch();
}

async function _auditoriaSaveRetencion() {
    var dias = parseInt(($('#audit-retencion') || {}).value || '90');
    if (isNaN(dias) || dias < 0) dias = 90;
    try {
        await api('/auditoria/retencion', { method: 'PUT', body: { dias: dias } });
        _auditRetencion = dias;
        toast(t('gardado'), 'success');
    } catch(e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function _auditoriaLimparAntigos() {
    var dias = prompt(t('limpar_antigos_prompt'), '90');
    if (dias === null) return;
    dias = parseInt(dias);
    if (isNaN(dias) || dias <= 0) {
        toast(t('erro') + ': valor non valido', 'error');
        return;
    }
    try {
        var res = await api('/auditoria/antigos?dias=' + dias, { method: 'DELETE' });
        toast(res.deleted + ' ' + t('rexistros_eliminados'), 'success');
        _auditPage = 1;
        _auditoriaFetch();
    } catch(e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function _auditoriaLimparTodo() {
    if (!(await confirmAction(t('confirmar_limpar_todo')))) return;
    try {
        var res = await api('/auditoria', { method: 'DELETE' });
        toast(res.deleted + ' ' + t('rexistros_eliminados'), 'success');
        _auditPage = 1;
        _auditoriaFetch();
    } catch(e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
