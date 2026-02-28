/**
 * Contabilidade — Accounting module (facturas, gastos, clientes, proveedores)
 */

var _contaCurrentTab = 'facturas';

async function contabilidadeLoad() {
    try {
        var results = await Promise.all([
            api('/facturas').catch(function() { return []; }),
            api('/gastos').catch(function() { return []; }),
            api('/clientes').catch(function() { return []; }),
            api('/proveedores').catch(function() { return []; })
        ]);
        AppState.facturas = results[0];
        AppState.gastos = results[1];
        AppState.clientes = results[2];
        AppState.proveedores = results[3];
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
    _renderFinanceSummary();
    contaTab(_contaCurrentTab);
}

function _renderFinanceSummary() {
    var el = $('#finance-summary');
    if (!el) return;

    var facturas = AppState.facturas || [];
    var gastos = AppState.gastos || [];

    var totalIngresos = 0;
    facturas.forEach(function(f) {
        if (f.estado === 'pagada') {
            totalIngresos += _facturaTotal(f);
        }
    });

    var totalGastos = 0;
    gastos.forEach(function(g) {
        totalGastos += parseFloat(g.importe) || 0;
    });

    var balance = totalIngresos - totalGastos;
    var balanceClass = balance >= 0 ? 'badge-success' : 'badge-danger';

    el.innerHTML =
        '<div class="stat-card"><div class="stat-value">' + totalIngresos.toFixed(2) + ' &euro;</div><div class="stat-label">' + t('ingresos') + '</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + totalGastos.toFixed(2) + ' &euro;</div><div class="stat-label">' + t('gastos_label') + '</div></div>' +
        '<div class="stat-card"><div class="stat-value"><span class="' + balanceClass + '">' + balance.toFixed(2) + ' &euro;</span></div><div class="stat-label">' + t('balance') + '</div></div>';
}

function _facturaTotal(f) {
    var lines = f.lines || f.lineas || [];
    var total = 0;
    lines.forEach(function(l) {
        var subtotal = (parseFloat(l.cantidade) || 0) * (parseFloat(l.prezo) || 0);
        var iva = parseFloat(l.iva) || 0;
        total += subtotal + (subtotal * iva / 100);
    });
    return total;
}

function contaTab(tab) {
    _contaCurrentTab = tab;

    // Update tab buttons
    $$('#conta-tabs .tab-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'facturas') facturasRender();
    else if (tab === 'gastos') gastosRender();
    else if (tab === 'clientes') clientesRender();
    else if (tab === 'proveedores') proveedoresRender();
    else if (tab === 'resumo') resumoRender();
}

/* ---- Resumo (Charts) ---- */
function resumoRender() {
    var content = $('#conta-content');
    if (!content) return;

    content.innerHTML =
        '<div class="form-row" style="margin-bottom:16px">' +
            '<div class="form-group" style="flex:1"><label>' + t('desde') + '</label><input type="date" class="form-control" id="resumo-desde"></div>' +
            '<div class="form-group" style="flex:1"><label>' + t('ata') + '</label><input type="date" class="form-control" id="resumo-ata"></div>' +
            '<div class="form-group" style="flex:0;align-self:flex-end"><button class="btn btn-primary btn-sm" onclick="resumoRenderCharts()">' + t('filtrar') + '</button></div>' +
        '</div>' +
        '<h4 style="margin-bottom:8px">' + t('ingresos_gastos_mensuais') + '</h4>' +
        '<div class="chart-container"><canvas id="chart-bar"></canvas></div>' +
        '<h4 style="margin:16px 0 8px">' + t('gastos_por_categoria') + '</h4>' +
        '<div class="chart-container" style="max-width:400px"><canvas id="chart-pie"></canvas></div>';

    resumoRenderCharts();
}

function resumoRenderCharts() {
    var desde = ($('#resumo-desde') || {}).value || '';
    var ata = ($('#resumo-ata') || {}).value || '';

    var facturas = (AppState.facturas || []).filter(function(f) {
        if (desde && f.data < desde) return false;
        if (ata && f.data > ata) return false;
        return f.estado === 'pagada';
    });
    var gastos = (AppState.gastos || []).filter(function(g) {
        if (desde && g.data < desde) return false;
        if (ata && g.data > ata) return false;
        return true;
    });

    // Monthly data
    var months = {};
    facturas.forEach(function(f) {
        var m = (f.data || '').substring(0, 7);
        if (!months[m]) months[m] = { income: 0, expense: 0 };
        months[m].income += _facturaTotal(f);
    });
    gastos.forEach(function(g) {
        var m = (g.data || '').substring(0, 7);
        if (!months[m]) months[m] = { income: 0, expense: 0 };
        months[m].expense += parseFloat(g.importe) || 0;
    });

    var sortedMonths = Object.keys(months).sort();
    var labels = sortedMonths.map(function(m) { return m.substring(5) + '/' + m.substring(2, 4); });
    var incomeVals = sortedMonths.map(function(m) { return months[m].income; });
    var expenseVals = sortedMonths.map(function(m) { return months[m].expense; });

    Charts.bar('chart-bar', {
        labels: labels,
        datasets: [
            { label: t('ingresos'), values: incomeVals, color: '#4caf50' },
            { label: t('gastos_label'), values: expenseVals, color: '#e05a3a' }
        ]
    });

    // Category data
    var cats = {};
    gastos.forEach(function(g) {
        var cat = g.categoria || 'Outros';
        if (!cats[cat]) cats[cat] = 0;
        cats[cat] += parseFloat(g.importe) || 0;
    });

    var pieData = Object.keys(cats).map(function(k) {
        return { label: k, value: cats[k] };
    });

    Charts.pie('chart-pie', pieData);
}

/* ---- Export functions ---- */
function facturasExport() {
    var headers = ['#', t('data'), t('cliente'), t('total'), t('estado')];
    var rows = (AppState.facturas || []).map(function(f) {
        var clienteNome = '';
        if (f.cliente_id) {
            var cli = (AppState.clientes || []).find(function(c) { return c.id === f.cliente_id; });
            clienteNome = cli ? cli.nome : '';
        }
        return [f.numero || f.id, f.data, clienteNome || f.cliente_nome || '', _facturaTotal(f).toFixed(2), f.estado];
    });
    exportCSV('facturas.csv', headers, rows);
}

function gastosExport() {
    var headers = [t('data'), t('concepto'), t('importe'), t('categoria')];
    var rows = (AppState.gastos || []).map(function(g) {
        return [g.data, g.concepto, (parseFloat(g.importe) || 0).toFixed(2), g.categoria || ''];
    });
    exportCSV('gastos.csv', headers, rows);
}

/* ---- Facturas ---- */
function facturasRender() {
    var content = $('#conta-content');
    if (!content) return;

    var list = AppState.facturas || [];
    var isAdmin = AppState.isAdmin();

    var html = '<div class="section-header" style="margin-bottom:12px">' +
        (isAdmin ? '<button class="btn btn-primary" onclick="facturaModal()">+ ' + t('nova_factura') + '</button>' : '<span></span>') +
    '</div>';

    html += '<div class="table-wrap"><table><thead><tr>' +
        '<th>#</th><th>' + t('data') + '</th><th>' + t('cliente') + '</th>' +
        '<th>' + t('total') + '</th><th>' + t('estado') + '</th><th>' + t('accions') + '</th>' +
    '</tr></thead><tbody>';

    if (list.length === 0) {
        html += '<tr><td colspan="6" class="text-center">' + t('sen_resultados') + '</td></tr>';
    } else {
        list.forEach(function(f) {
            var total = _facturaTotal(f);
            var estadoBadge = f.estado === 'pagada'
                ? '<span class="badge badge-success">' + t('pagada') + '</span>'
                : '<span class="badge badge-warning">' + t('pendente_pago') + '</span>';

            var clienteNome = '';
            if (f.cliente_id) {
                var cli = (AppState.clientes || []).find(function(c) { return c.id === f.cliente_id; });
                clienteNome = cli ? cli.nome : '';
            }
            clienteNome = clienteNome || f.cliente_nome || '';

            var actions = '';
            if (isAdmin) {
                actions += '<button class="btn-icon" onclick="facturaModal(AppState.facturas.find(function(x){return x.id==' + f.id + '}))" title="' + t('editar') + '">&#9998;</button>';
                actions += '<button class="btn-icon btn-danger" onclick="facturaDelete(' + f.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
            }

            html += '<tr>' +
                '<td>' + esc(f.numero || f.id) + '</td>' +
                '<td>' + formatDate(f.data) + '</td>' +
                '<td>' + esc(clienteNome) + '</td>' +
                '<td>' + total.toFixed(2) + ' &euro;</td>' +
                '<td>' + estadoBadge + '</td>' +
                '<td class="actions-cell">' + actions + '</td>' +
            '</tr>';
        });
    }

    html += '</tbody></table></div>';
    content.innerHTML = html;
}

function facturaModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('factura') : t('nova_factura');

    $('#modal-title').textContent = title;

    var clienteOptions = '<option value="">--</option>';
    (AppState.clientes || []).forEach(function(c) {
        var sel = (isEdit && item.cliente_id === c.id) ? ' selected' : '';
        clienteOptions += '<option value="' + c.id + '"' + sel + '>' + esc(c.nome) + '</option>';
    });

    var estadoOptions = ['pendente', 'pagada'].map(function(e) {
        var sel = (isEdit && item.estado === e) ? ' selected' : '';
        var label = e === 'pagada' ? t('pagada') : t('pendente_pago');
        return '<option value="' + e + '"' + sel + '>' + label + '</option>';
    }).join('');

    var lines = (isEdit && (item.lines || item.lineas)) ? (item.lines || item.lineas) : [];

    $('#modal-body').innerHTML =
        '<input type="hidden" id="factura-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>#</label>' +
                '<input type="text" class="form-control" id="factura-numero" value="' + esc(isEdit ? item.numero || '' : '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('data') + '</label>' +
                '<input type="date" class="form-control" id="factura-data" value="' + esc(isEdit ? item.data || '' : today()) + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('cliente') + '</label>' +
                '<select class="form-control" id="factura-cliente">' + clienteOptions + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('estado') + '</label>' +
                '<select class="form-control" id="factura-estado">' + estadoOptions + '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('concepto') + '</label>' +
            '<div id="factura-lines"></div>' +
            '<button type="button" class="btn btn-sm btn-secondary" onclick="_addFacturaLine()" style="margin-top:8px">+ ' + t('engadir') + '</button>' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="facturaSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');

    // Render existing lines or one empty
    var linesContainer = $('#factura-lines');
    if (lines.length > 0) {
        lines.forEach(function(l) { _addFacturaLine(l); });
    } else {
        _addFacturaLine();
    }
}

function _addFacturaLine(data) {
    var container = $('#factura-lines');
    if (!container) return;

    var idx = container.children.length;
    var div = document.createElement('div');
    div.className = 'form-row factura-line';
    div.style.marginBottom = '6px';
    div.style.alignItems = 'flex-end';
    div.innerHTML =
        '<div class="form-group" style="flex:3">' +
            (idx === 0 ? '<label>' + t('concepto') + '</label>' : '') +
            '<input type="text" class="form-control line-concepto" value="' + esc(data ? data.concepto || '' : '') + '" placeholder="' + t('concepto') + '">' +
        '</div>' +
        '<div class="form-group" style="flex:1">' +
            (idx === 0 ? '<label>Cant.</label>' : '') +
            '<input type="number" class="form-control line-cantidade" value="' + (data ? data.cantidade || 1 : 1) + '" min="0" step="1">' +
        '</div>' +
        '<div class="form-group" style="flex:1">' +
            (idx === 0 ? '<label>' + t('importe') + '</label>' : '') +
            '<input type="number" class="form-control line-prezo" value="' + (data ? data.prezo || 0 : '') + '" min="0" step="0.01" placeholder="0.00">' +
        '</div>' +
        '<div class="form-group" style="flex:1">' +
            (idx === 0 ? '<label>' + t('iva') + ' %</label>' : '') +
            '<input type="number" class="form-control line-iva" value="' + (data ? data.iva || 21 : 21) + '" min="0" step="1">' +
        '</div>' +
        '<div class="form-group" style="flex:0">' +
            '<button type="button" class="btn-icon btn-danger" onclick="this.closest(\'.factura-line\').remove()" title="' + t('eliminar') + '">&times;</button>' +
        '</div>';

    container.appendChild(div);
}

async function facturaSave() {
    var id = ($('#factura-id') || {}).value;
    var isEdit = !!id;

    var lines = [];
    $$('.factura-line').forEach(function(row) {
        lines.push({
            concepto: ($('.line-concepto', row) || {}).value || '',
            cantidade: parseFloat(($('.line-cantidade', row) || {}).value) || 0,
            prezo: parseFloat(($('.line-prezo', row) || {}).value) || 0,
            iva: parseFloat(($('.line-iva', row) || {}).value) || 0
        });
    });

    var body = {
        numero: ($('#factura-numero') || {}).value || '',
        data: ($('#factura-data') || {}).value || today(),
        cliente_id: ($('#factura-cliente') || {}).value || null,
        estado: ($('#factura-estado') || {}).value || 'pendente',
        lines: lines
    };

    try {
        if (isEdit) {
            await api('/facturas/' + id, { method: 'PUT', body: body });
        } else {
            await api('/facturas', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        contabilidadeLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function facturaDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/facturas/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        contabilidadeLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

/* ---- Gastos ---- */
function gastosRender() {
    var content = $('#conta-content');
    if (!content) return;

    var list = AppState.gastos || [];
    var isAdmin = AppState.isAdmin();

    var html = '<div class="section-header" style="margin-bottom:12px">' +
        (isAdmin ? '<button class="btn btn-primary" onclick="gastoModal()">+ ' + t('novo_gasto') + '</button>' : '<span></span>') +
    '</div>';

    html += '<div class="table-wrap"><table><thead><tr>' +
        '<th>' + t('data') + '</th><th>' + t('concepto') + '</th>' +
        '<th>' + t('importe') + '</th><th>' + t('categoria') + '</th><th>' + t('accions') + '</th>' +
    '</tr></thead><tbody>';

    if (list.length === 0) {
        html += '<tr><td colspan="5" class="text-center">' + t('sen_resultados') + '</td></tr>';
    } else {
        list.forEach(function(g) {
            var actions = '';
            if (isAdmin) {
                actions += '<button class="btn-icon" onclick="gastoModal(AppState.gastos.find(function(x){return x.id==' + g.id + '}))" title="' + t('editar') + '">&#9998;</button>';
                actions += '<button class="btn-icon btn-danger" onclick="gastoDelete(' + g.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
            }

            html += '<tr>' +
                '<td>' + formatDate(g.data) + '</td>' +
                '<td>' + esc(g.concepto) + '</td>' +
                '<td>' + (parseFloat(g.importe) || 0).toFixed(2) + ' &euro;</td>' +
                '<td>' + esc(g.categoria || '') + '</td>' +
                '<td class="actions-cell">' + actions + '</td>' +
            '</tr>';
        });
    }

    html += '</tbody></table></div>';
    content.innerHTML = html;
}

function gastoModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('gasto') : t('novo_gasto');

    $('#modal-title').textContent = title;

    $('#modal-body').innerHTML =
        '<input type="hidden" id="gasto-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('data') + '</label>' +
            '<input type="date" class="form-control" id="gasto-data" value="' + esc(isEdit ? item.data || '' : today()) + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('concepto') + '</label>' +
            '<input type="text" class="form-control" id="gasto-concepto" value="' + esc(isEdit ? item.concepto : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('importe') + '</label>' +
            '<input type="number" class="form-control" id="gasto-importe" step="0.01" min="0" value="' + (isEdit ? item.importe || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('categoria') + '</label>' +
            '<input type="text" class="form-control" id="gasto-categoria" value="' + esc(isEdit ? item.categoria || '' : '') + '">' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="gastoSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function gastoSave() {
    var id = ($('#gasto-id') || {}).value;
    var isEdit = !!id;

    var body = {
        data: ($('#gasto-data') || {}).value || today(),
        concepto: ($('#gasto-concepto') || {}).value || '',
        importe: parseFloat(($('#gasto-importe') || {}).value) || 0,
        categoria: ($('#gasto-categoria') || {}).value || ''
    };

    try {
        if (isEdit) {
            await api('/gastos/' + id, { method: 'PUT', body: body });
        } else {
            await api('/gastos', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        contabilidadeLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function gastoDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/gastos/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        contabilidadeLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

/* ---- Clientes ---- */
function clientesRender() {
    var content = $('#conta-content');
    if (!content) return;

    var list = AppState.clientes || [];
    var isAdmin = AppState.isAdmin();

    var html = '<div class="section-header" style="margin-bottom:12px">' +
        (isAdmin ? '<button class="btn btn-primary" onclick="clienteModal()">+ ' + t('novo_cliente') + '</button>' : '<span></span>') +
    '</div>';

    html += '<div class="table-wrap"><table><thead><tr>' +
        '<th>' + t('nome') + '</th><th>' + t('nif') + '</th><th>' + t('enderezo') + '</th>' +
        '<th>' + t('email') + '</th><th>' + t('telefono') + '</th><th>' + t('accions') + '</th>' +
    '</tr></thead><tbody>';

    if (list.length === 0) {
        html += '<tr><td colspan="6" class="text-center">' + t('sen_resultados') + '</td></tr>';
    } else {
        list.forEach(function(c) {
            var actions = '';
            if (isAdmin) {
                actions += '<button class="btn-icon" onclick="clienteModal(AppState.clientes.find(function(x){return x.id==' + c.id + '}))" title="' + t('editar') + '">&#9998;</button>';
                actions += '<button class="btn-icon btn-danger" onclick="clienteDelete(' + c.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
            }

            html += '<tr>' +
                '<td>' + esc(c.nome) + '</td>' +
                '<td>' + esc(c.nif || '') + '</td>' +
                '<td>' + esc(c.enderezo || '') + '</td>' +
                '<td>' + esc(c.email || '') + '</td>' +
                '<td>' + esc(c.telefono || '') + '</td>' +
                '<td class="actions-cell">' + actions + '</td>' +
            '</tr>';
        });
    }

    html += '</tbody></table></div>';
    content.innerHTML = html;
}

function clienteModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('cliente') : t('novo_cliente');

    $('#modal-title').textContent = title;

    $('#modal-body').innerHTML =
        '<input type="hidden" id="cliente-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('nome') + '</label>' +
            '<input type="text" class="form-control" id="cliente-nome" value="' + esc(isEdit ? item.nome : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('nif') + '</label>' +
            '<input type="text" class="form-control" id="cliente-nif" value="' + esc(isEdit ? item.nif || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('enderezo') + '</label>' +
            '<input type="text" class="form-control" id="cliente-enderezo" value="' + esc(isEdit ? item.enderezo || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('email') + '</label>' +
            '<input type="email" class="form-control" id="cliente-email" value="' + esc(isEdit ? item.email || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('telefono') + '</label>' +
            '<input type="text" class="form-control" id="cliente-telefono" value="' + esc(isEdit ? item.telefono || '' : '') + '">' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="clienteSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function clienteSave() {
    var id = ($('#cliente-id') || {}).value;
    var isEdit = !!id;

    var body = {
        nome: ($('#cliente-nome') || {}).value || '',
        nif: ($('#cliente-nif') || {}).value || '',
        enderezo: ($('#cliente-enderezo') || {}).value || '',
        email: ($('#cliente-email') || {}).value || '',
        telefono: ($('#cliente-telefono') || {}).value || ''
    };

    try {
        if (isEdit) {
            await api('/clientes/' + id, { method: 'PUT', body: body });
        } else {
            await api('/clientes', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        contabilidadeLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function clienteDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/clientes/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        contabilidadeLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

/* ---- Proveedores ---- */
function proveedoresRender() {
    var content = $('#conta-content');
    if (!content) return;

    var list = AppState.proveedores || [];
    var isAdmin = AppState.isAdmin();

    var html = '<div class="section-header" style="margin-bottom:12px">' +
        (isAdmin ? '<button class="btn btn-primary" onclick="proveedorModal()">+ ' + t('novo_proveedor') + '</button>' : '<span></span>') +
    '</div>';

    html += '<div class="table-wrap"><table><thead><tr>' +
        '<th>' + t('nome') + '</th><th>' + t('nif') + '</th><th>' + t('enderezo') + '</th>' +
        '<th>' + t('email') + '</th><th>' + t('telefono') + '</th><th>' + t('accions') + '</th>' +
    '</tr></thead><tbody>';

    if (list.length === 0) {
        html += '<tr><td colspan="6" class="text-center">' + t('sen_resultados') + '</td></tr>';
    } else {
        list.forEach(function(p) {
            var actions = '';
            if (isAdmin) {
                actions += '<button class="btn-icon" onclick="proveedorModal(AppState.proveedores.find(function(x){return x.id==' + p.id + '}))" title="' + t('editar') + '">&#9998;</button>';
                actions += '<button class="btn-icon btn-danger" onclick="proveedorDelete(' + p.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
            }

            html += '<tr>' +
                '<td>' + esc(p.nome) + '</td>' +
                '<td>' + esc(p.nif || '') + '</td>' +
                '<td>' + esc(p.enderezo || '') + '</td>' +
                '<td>' + esc(p.email || '') + '</td>' +
                '<td>' + esc(p.telefono || '') + '</td>' +
                '<td class="actions-cell">' + actions + '</td>' +
            '</tr>';
        });
    }

    html += '</tbody></table></div>';
    content.innerHTML = html;
}

function proveedorModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('proveedor') : t('novo_proveedor');

    $('#modal-title').textContent = title;

    $('#modal-body').innerHTML =
        '<input type="hidden" id="proveedor-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('nome') + '</label>' +
            '<input type="text" class="form-control" id="proveedor-nome" value="' + esc(isEdit ? item.nome : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('nif') + '</label>' +
            '<input type="text" class="form-control" id="proveedor-nif" value="' + esc(isEdit ? item.nif || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('enderezo') + '</label>' +
            '<input type="text" class="form-control" id="proveedor-enderezo" value="' + esc(isEdit ? item.enderezo || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('email') + '</label>' +
            '<input type="email" class="form-control" id="proveedor-email" value="' + esc(isEdit ? item.email || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('telefono') + '</label>' +
            '<input type="text" class="form-control" id="proveedor-telefono" value="' + esc(isEdit ? item.telefono || '' : '') + '">' +
        '</div>';

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="proveedorSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function proveedorSave() {
    var id = ($('#proveedor-id') || {}).value;
    var isEdit = !!id;

    var body = {
        nome: ($('#proveedor-nome') || {}).value || '',
        nif: ($('#proveedor-nif') || {}).value || '',
        enderezo: ($('#proveedor-enderezo') || {}).value || '',
        email: ($('#proveedor-email') || {}).value || '',
        telefono: ($('#proveedor-telefono') || {}).value || ''
    };

    try {
        if (isEdit) {
            await api('/proveedores/' + id, { method: 'PUT', body: body });
        } else {
            await api('/proveedores', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        contabilidadeLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function proveedorDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/proveedores/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        contabilidadeLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
