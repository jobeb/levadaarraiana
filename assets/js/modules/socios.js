/**
 * Socios — Members management module
 */
var _sociosPager = new Paginator('socios-pagination', { perPage: 15, onChange: function() { sociosRender(); } });
var _sociosSortCol = null;
var _sociosSortAsc = true;

async function sociosLoad() {
    try {
        AppState.socios = await api('/socios');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.socios = [];
    }
    sociosRender();
}

function sociosRender() {
    var tbody = $('#socios-table tbody');
    if (!tbody) return;

    var search = ($('#socios-search') || {}).value || '';
    var term = search.toLowerCase();
    var list = AppState.socios || [];

    if (term) {
        list = list.filter(function(s) {
            return (s.username || '').toLowerCase().indexOf(term) !== -1 ||
                   (s.nome_completo || '').toLowerCase().indexOf(term) !== -1 ||
                   (s.instrumento || '').toLowerCase().indexOf(term) !== -1 ||
                   (s.email || '').toLowerCase().indexOf(term) !== -1;
        });
    }

    // Sort
    if (_sociosSortCol) {
        list = list.slice().sort(function(a, b) {
            var va = (a[_sociosSortCol] || '').toString().toLowerCase();
            var vb = (b[_sociosSortCol] || '').toString().toLowerCase();
            if (va < vb) return _sociosSortAsc ? -1 : 1;
            if (va > vb) return _sociosSortAsc ? 1 : -1;
            return 0;
        });
    }

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">' + t('sen_resultados') + '</td></tr>';
        _sociosPager.setTotal(0);
        _sociosPager.render();
        return;
    }

    // Paginate
    list = _sociosPager.slice(list);

    var html = '';
    var isAdmin = AppState.isAdmin();

    list.forEach(function(s) {
        var avatarSrc = s.foto ? uploadUrl(s.foto) : '';
        var avatarHtml = avatarSrc
            ? '<img class="avatar-sm" src="' + esc(avatarSrc) + '" alt="">'
            : '<span class="avatar-sm avatar-placeholder">' + esc((s.username || '?')[0].toUpperCase()) + '</span>';

        var roleBadge = '';
        if (s.role === 'Admin') {
            roleBadge = '<span class="badge badge-warning">' + t('admin') + '</span>';
        } else if (s.role === 'Director') {
            roleBadge = '<span class="badge badge-primary">' + t('director') + '</span>';
        } else {
            roleBadge = '<span class="badge">' + t('socio') + '</span>';
        }

        var estadoBadge = '';
        if (s.estado === 'Aprobado') {
            estadoBadge = '<span class="badge badge-success">' + t('aprobado') + '</span>';
        } else if (s.estado === 'Pendente') {
            estadoBadge = '<span class="badge badge-warning">' + t('pendente') + '</span>';
        } else if (s.estado === 'Rexeitado') {
            estadoBadge = '<span class="badge badge-danger">' + t('rexeitado') + '</span>';
        } else {
            estadoBadge = '<span class="badge">' + esc(s.estado || '') + '</span>';
        }

        var actions = '';
        if (isAdmin) {
            actions += '<button class="btn-icon" onclick="sociosModal(AppState.socios.find(x=>x.id==' + s.id + '))" title="' + t('editar') + '">&#9998;</button>';
            actions += '<button class="btn-icon btn-danger" onclick="sociosDelete(' + s.id + ')" title="' + t('eliminar') + '">&#128465;</button>';
            if (s.estado === 'Pendente') {
                actions += '<button class="btn btn-sm btn-success" onclick="sociosEstado(' + s.id + ',\'Aprobado\')">' + t('aprobar') + '</button>';
                actions += '<button class="btn btn-sm btn-danger" onclick="sociosEstado(' + s.id + ',\'Rexeitado\')">' + t('rexeitar') + '</button>';
            }
        }

        html += '<tr>' +
            '<td>' + avatarHtml + '</td>' +
            '<td>' + esc(s.username) + '</td>' +
            '<td>' + esc(s.nome_completo) + '</td>' +
            '<td>' + esc(s.instrumento || '') + '</td>' +
            '<td>' + roleBadge + '</td>' +
            '<td>' + estadoBadge + '</td>' +
            '<td class="actions-cell">' + actions + '</td>' +
            '</tr>';
    });

    tbody.innerHTML = html;
    _sociosPager.render();

    // Bind sort headers
    $$('#socios-table th.sortable').forEach(function(th) {
        th.style.cursor = 'pointer';
        th.onclick = function() {
            var col = th.dataset.sort;
            if (_sociosSortCol === col) {
                _sociosSortAsc = !_sociosSortAsc;
            } else {
                _sociosSortCol = col;
                _sociosSortAsc = true;
            }
            sociosRender();
        };
        // Sort indicator
        if (_sociosSortCol === th.dataset.sort) {
            th.textContent = t(th.getAttribute('data-i18n')) + (_sociosSortAsc ? ' \u25B2' : ' \u25BC');
        }
    });
}

function sociosModal(socio) {
    var isEdit = socio && socio.id;
    var title = isEdit ? t('editar') + ' ' + t('socio') : t('engadir') + ' ' + t('socio');

    $('#modal-title').textContent = title;

    var instrumentos = ['surdo', 'caixa', 'repinique', 'tamborim', 'agogo', 'ganza', 'apito', 'outro'];
    var roles = ['Socio', 'Admin', 'Director'];

    var instOptions = instrumentos.map(function(i) {
        var sel = (socio && socio.instrumento === i) ? ' selected' : '';
        return '<option value="' + i + '"' + sel + '>' + i.charAt(0).toUpperCase() + i.slice(1) + '</option>';
    }).join('');

    var roleOptions = roles.map(function(r) {
        var sel = (socio && socio.role === r) ? ' selected' : '';
        return '<option value="' + r + '"' + sel + '>' + r + '</option>';
    }).join('');

    $('#modal-body').innerHTML =
        '<input type="hidden" id="socio-id" value="' + (isEdit ? socio.id : '') + '">' +
        '<div class="form-group">' +
            '<label>' + t('username') + '</label>' +
            '<input type="text" class="form-control" id="socio-username" value="' + esc(isEdit ? socio.username : '') + '"' + (isEdit ? ' readonly' : '') + '>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('nome_completo') + '</label>' +
            '<input type="text" class="form-control" id="socio-nome" value="' + esc(isEdit ? socio.nome_completo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('dni') + '</label>' +
            '<input type="text" class="form-control" id="socio-dni" value="' + esc(isEdit ? socio.dni || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('email') + '</label>' +
            '<input type="email" class="form-control" id="socio-email" value="' + esc(isEdit ? socio.email || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('telefono') + '</label>' +
            '<input type="text" class="form-control" id="socio-telefono" value="' + esc(isEdit ? socio.telefono || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('instrumento') + '</label>' +
            '<select class="form-control" id="socio-instrumento"><option value="">--</option>' + instOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('rol') + '</label>' +
            '<select class="form-control" id="socio-role">' + roleOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('fotos') + '</label>' +
            '<input type="file" class="form-control" id="socio-foto" accept="image/*">' +
            (isEdit && socio.foto ? '<img src="' + esc(uploadUrl(socio.foto)) + '" class="avatar-sm" style="margin-top:8px">' : '') +
        '</div>';

    if (!isEdit) {
        $('#modal-body').innerHTML +=
            '<div class="form-group">' +
                '<label>' + t('contrasinal') + '</label>' +
                '<input type="password" class="form-control" id="socio-pass">' +
            '</div>';
    }

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="sociosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function sociosSave() {
    var id = ($('#socio-id') || {}).value;
    var isEdit = !!id;

    var body = {
        username: ($('#socio-username') || {}).value || '',
        nome_completo: ($('#socio-nome') || {}).value || '',
        dni: ($('#socio-dni') || {}).value || '',
        email: ($('#socio-email') || {}).value || '',
        telefono: ($('#socio-telefono') || {}).value || '',
        instrumento: ($('#socio-instrumento') || {}).value || '',
        role: ($('#socio-role') || {}).value || 'Socio'
    };

    if (!isEdit) {
        body.password = ($('#socio-pass') || {}).value || '';
    }

    var fotoInput = $('#socio-foto');
    if (fotoInput && fotoInput.files && fotoInput.files.length > 0) {
        body.foto = await fileToBase64(fotoInput.files[0]);
    }

    try {
        if (isEdit) {
            await api('/socios/' + id, { method: 'PUT', body: body });
        } else {
            await api('/socios', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        sociosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function sociosDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/socios/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        sociosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function sociosExport() {
    var headers = [t('username'), t('nome_completo'), t('email'), t('telefono'), t('instrumento'), t('rol'), t('estado')];
    var rows = (AppState.socios || []).map(function(s) {
        return [s.username, s.nome_completo, s.email || '', s.telefono || '', s.instrumento || '', s.role, s.estado];
    });
    exportCSV('socios.csv', headers, rows);
}

async function sociosEstado(id, estado) {
    try {
        await api('/socios/' + id + '/estado', { method: 'PUT', body: { estado: estado } });
        toast(t('exito'), 'success');
        sociosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
