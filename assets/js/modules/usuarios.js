/**
 * Usuarios — Users management module
 */
var _usuariosPager = new Paginator('usuarios-pagination', { perPage: 15, onChange: function() { usuariosRender(); } });
var _usuariosSortCol = null;
var _usuariosSortAsc = true;
var _usuariosView = 'cards';

async function usuariosLoad() {
    try {
        AppState.usuarios = await api('/usuarios');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.usuarios = [];
    }
    usuariosRender();
}

function usuariosSetView(view) {
    _usuariosView = view;
    var btns = $$('#usuarios-view-toggle button');
    btns.forEach(function(b, i) { b.classList.toggle('active', (i === 0 && view === 'table') || (i === 1 && view === 'cards')); });
    var tableWrap = $('#usuarios-table').parentElement;
    tableWrap.style.display = view === 'table' ? '' : 'none';
    $('#usuarios-pagination').style.display = view === 'table' ? '' : 'none';
    $('#usuarios-cards').style.display = view === 'cards' ? '' : 'none';
    usuariosRender();
}

function usuariosRender() {
    var tbody = $('#usuarios-table tbody');
    if (!tbody) return;

    var search = ($('#usuarios-search') || {}).value || '';
    var term = search.toLowerCase();
    var list = AppState.usuarios || [];

    // Role filter
    var roleFilter = ($('#usuarios-role-filter') || {}).value || '';
    if (roleFilter) {
        list = list.filter(function(s) { return s.role === roleFilter; });
    }

    if (term) {
        list = list.filter(function(s) {
            return (s.username || '').toLowerCase().indexOf(term) !== -1 ||
                   (s.nome_completo || '').toLowerCase().indexOf(term) !== -1 ||
                   (s.instrumento || '').toLowerCase().indexOf(term) !== -1 ||
                   (s.email || '').toLowerCase().indexOf(term) !== -1;
        });
    }

    // Sort
    if (_usuariosSortCol) {
        list = list.slice().sort(function(a, b) {
            var va = (a[_usuariosSortCol] || '').toString().toLowerCase();
            var vb = (b[_usuariosSortCol] || '').toString().toLowerCase();
            if (va < vb) return _usuariosSortAsc ? -1 : 1;
            if (va > vb) return _usuariosSortAsc ? 1 : -1;
            return 0;
        });
    }

    var isAdmin = AppState.isAdmin();

    // Cards view
    if (_usuariosView === 'cards') {
        if (list.length === 0) {
            $('#usuarios-cards').innerHTML = '<p class="text-center text-muted">' + t('sen_resultados') + '</p>';
            return;
        }
        var cardsHtml = '';
        list.forEach(function(s) {
            var avatarSrc = s.foto ? uploadUrl(s.foto) : '';
            var avatarEl = avatarSrc
                ? '<img class="user-card-avatar" src="' + esc(avatarSrc) + '" alt="">'
                : '<div class="user-card-avatar avatar-placeholder">' + esc((s.username || '?')[0].toUpperCase()) + '</div>';

            var roleBadge = '';
            if (s.role === 'Admin') {
                roleBadge = '<span class="badge badge-warning">' + t('admin') + '</span>';
            } else if (s.role === 'Socio') {
                roleBadge = '<span class="badge badge-primary">' + t('socio') + '</span>';
            } else {
                roleBadge = '<span class="badge">' + t('usuario') + '</span>';
            }

            var estadoBadge = '';
            if (s.estado === 'Desactivado') {
                estadoBadge = '<span class="badge badge-danger">' + t('desactivado') + '</span>';
            } else {
                estadoBadge = '<span class="badge badge-success">' + t('activo') + '</span>';
            }

            var actions = '';
            if (isAdmin) {
                actions += '<button class="btn-icon" onclick="usuariosModal(AppState.usuarios.find(x=>x.id==' + s.id + '))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>';
                if (s.estado === 'Desactivado') {
                    actions += '<button class="btn-icon btn-success" onclick="usuariosEstado(' + s.id + ',\'Activo\')" title="' + t('activar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></button>';
                } else {
                    actions += '<button class="btn-icon btn-danger" onclick="usuariosEstado(' + s.id + ',\'Desactivado\')" title="' + t('desactivar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>';
                }
                actions += '<button class="btn-icon btn-danger" onclick="usuariosDelete(' + s.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>';
            }

            cardsHtml += '<div class="user-card">' +
                avatarEl +
                '<h4>' + esc(s.nome_completo || s.username) + '</h4>' +
                '<p class="user-card-username">@' + esc(s.username) + '</p>' +
                '<p class="user-card-instrument">' + esc(s.instrumento || '') + '</p>' +
                '<div class="user-card-badges">' + roleBadge + estadoBadge + '</div>' +
                (actions ? '<div class="user-card-actions">' + actions + '</div>' : '') +
                '</div>';
        });
        $('#usuarios-cards').innerHTML = cardsHtml;
        return;
    }

    // Table view
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">' + t('sen_resultados') + '</td></tr>';
        _usuariosPager.setTotal(0);
        _usuariosPager.render();
        return;
    }

    // Paginate
    list = _usuariosPager.slice(list);

    var html = '';

    list.forEach(function(s) {
        var avatarSrc = s.foto ? uploadUrl(s.foto) : '';
        var avatarHtml = avatarSrc
            ? '<img class="avatar-sm" src="' + esc(avatarSrc) + '" alt="">'
            : '<span class="avatar-sm avatar-placeholder">' + esc((s.username || '?')[0].toUpperCase()) + '</span>';

        var roleBadge = '';
        if (s.role === 'Admin') {
            roleBadge = '<span class="badge badge-warning">' + t('admin') + '</span>';
        } else if (s.role === 'Socio') {
            roleBadge = '<span class="badge badge-primary">' + t('socio') + '</span>';
        } else {
            roleBadge = '<span class="badge">' + t('usuario') + '</span>';
        }

        var estadoBadge = '';
        if (s.estado === 'Desactivado') {
            estadoBadge = '<span class="badge badge-danger">' + t('desactivado') + '</span>';
        } else {
            estadoBadge = '<span class="badge badge-success">' + t('activo') + '</span>';
        }

        var actions = '';
        if (isAdmin) {
            actions += '<button class="btn-icon" onclick="usuariosModal(AppState.usuarios.find(x=>x.id==' + s.id + '))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>';
            if (s.estado === 'Desactivado') {
                actions += '<button class="btn-icon btn-success" onclick="usuariosEstado(' + s.id + ',\'Activo\')" title="' + t('activar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></button>';
            } else {
                actions += '<button class="btn-icon btn-danger" onclick="usuariosEstado(' + s.id + ',\'Desactivado\')" title="' + t('desactivar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>';
            }
            actions += '<button class="btn-icon btn-danger" onclick="usuariosDelete(' + s.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>';
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
    _usuariosPager.render();

    // Bind sort headers
    $$('#usuarios-table th.sortable').forEach(function(th) {
        th.style.cursor = 'pointer';
        th.onclick = function() {
            var col = th.dataset.sort;
            if (_usuariosSortCol === col) {
                _usuariosSortAsc = !_usuariosSortAsc;
            } else {
                _usuariosSortCol = col;
                _usuariosSortAsc = true;
            }
            usuariosRender();
        };
        // Sort indicator
        if (_usuariosSortCol === th.dataset.sort) {
            th.textContent = t(th.getAttribute('data-i18n')) + (_usuariosSortAsc ? ' \u25B2' : ' \u25BC');
        }
    });
}

function usuariosModal(usuario) {
    var isEdit = usuario && usuario.id;
    var title = isEdit ? t('editar') + ' ' + t('usuario') : t('engadir') + ' ' + t('usuario');

    $('#modal-title').textContent = title;

    var instrumentos = ['surdo', 'caixa', 'repinique', 'tamborim', 'timbao', 'agogo', 'ganza', 'apito', 'outro'];
    var roles = ['Usuario', 'Socio', 'Admin'];

    var instOptions = instrumentos.map(function(i) {
        var sel = (usuario && usuario.instrumento === i) ? ' selected' : '';
        return '<option value="' + i + '"' + sel + '>' + i.charAt(0).toUpperCase() + i.slice(1) + '</option>';
    }).join('');

    var roleOptions = roles.map(function(r) {
        var sel = (usuario && usuario.role === r) ? ' selected' : '';
        return '<option value="' + r + '"' + sel + '>' + r + '</option>';
    }).join('');

    $('#modal-body').innerHTML =
        '<input type="hidden" id="usuario-id" value="' + (isEdit ? usuario.id : '') + '">' +
        '<div class="form-group">' +
            '<label class="required">' + t('username') + '</label>' +
            '<input type="text" class="form-control" id="usuario-username" value="' + esc(isEdit ? usuario.username : '') + '"' + (isEdit ? ' readonly' : '') + '>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('nome_completo') + '</label>' +
            '<input type="text" class="form-control" id="usuario-nome" value="' + esc(isEdit ? usuario.nome_completo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('dni') + '</label>' +
            '<input type="text" class="form-control" id="usuario-dni" value="' + esc(isEdit ? usuario.dni || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label class="required">' + t('email') + '</label>' +
            '<input type="email" class="form-control" id="usuario-email" value="' + esc(isEdit ? usuario.email || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('telefono') + '</label>' +
            '<input type="text" class="form-control" id="usuario-telefono" value="' + esc(isEdit ? usuario.telefono || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('instrumento') + '</label>' +
            '<select class="form-control" id="usuario-instrumento"><option value="">--</option>' + instOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('rol') + '</label>' +
            '<select class="form-control" id="usuario-role">' + roleOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('fotos') + '</label>' +
            '<input type="file" class="form-control" id="usuario-foto" accept="image/*" style="display:none">' +
            '<input type="hidden" id="usuario-foto-remove" value="">' +
            '<div class="avatar-picker">' +
                '<div class="avatar-picker-preview" id="usuario-foto-preview">' +
                    (isEdit && usuario.foto
                        ? '<img src="' + esc(uploadUrl(usuario.foto)) + '" alt="">'
                        : '<span class="avatar-picker-placeholder">' + esc(((usuario && usuario.username) || '?')[0].toUpperCase()) + '</span>') +
                '</div>' +
                '<div class="avatar-picker-actions">' +
                    '<button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById(\'usuario-foto\').click()">' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> ' +
                        t('seleccionar') +
                    '</button>' +
                    '<button type="button" class="btn btn-sm btn-danger" id="usuario-foto-remove-btn" onclick="usuariosRemoveFoto()"' +
                        (isEdit && usuario.foto ? '' : ' style="display:none"') + '>' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ' +
                        t('eliminar_foto') +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    if (!isEdit) {
        $('#modal-body').innerHTML +=
            '<div class="form-group">' +
                '<label class="required">' + t('contrasinal') + '</label>' +
                '<input type="password" class="form-control" id="usuario-pass">' +
            '</div>';
    }

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="usuariosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');

    // File input preview
    $('#usuario-foto').onchange = function() {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#usuario-foto-preview').innerHTML = '<img src="' + e.target.result + '" alt="">';
            $('#usuario-foto-remove-btn').style.display = '';
            $('#usuario-foto-remove').value = '';
        };
        reader.readAsDataURL(file);
    };
}

function usuariosRemoveFoto() {
    $('#usuario-foto-preview').innerHTML = '<span class="avatar-picker-placeholder">?</span>';
    $('#usuario-foto').value = '';
    $('#usuario-foto-remove').value = '1';
    $('#usuario-foto-remove-btn').style.display = 'none';
}

async function usuariosSave() {
    var id = ($('#usuario-id') || {}).value;
    var isEdit = !!id;

    var body = {
        username: ($('#usuario-username') || {}).value || '',
        nome_completo: ($('#usuario-nome') || {}).value || '',
        dni: ($('#usuario-dni') || {}).value || '',
        email: ($('#usuario-email') || {}).value || '',
        telefono: ($('#usuario-telefono') || {}).value || '',
        instrumento: ($('#usuario-instrumento') || {}).value || '',
        role: ($('#usuario-role') || {}).value || 'Socio'
    };

    if (!isEdit) {
        body.password = ($('#usuario-pass') || {}).value || '';
    }

    var fotoInput = $('#usuario-foto');
    if (fotoInput && fotoInput.files && fotoInput.files.length > 0) {
        var foto = await imageToBase64(fotoInput.files[0]);
        body.foto_data = foto.data;
        body.foto_ext = 'jpg';
    } else if (($('#usuario-foto-remove') || {}).value === '1') {
        body.foto = '';
    }

    try {
        if (isEdit) {
            await api('/usuarios/' + id, { method: 'PUT', body: body });
        } else {
            await api('/usuarios', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        usuariosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function usuariosDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/usuarios/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        usuariosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function usuariosExport(format) {
    var headers = [t('username'), t('nome_completo'), t('email'), t('telefono'), t('instrumento'), t('rol'), t('estado')];
    var rows = (AppState.usuarios || []).map(function(s) {
        return [s.username, s.nome_completo, s.email || '', s.telefono || '', s.instrumento || '', s.role, s.estado];
    });
    if (format === 'pdf') {
        exportPDF(t('usuarios'), headers, rows);
    } else {
        exportCSV('usuarios.csv', headers, rows);
    }
}

async function usuariosEstado(id, estado) {
    try {
        await api('/usuarios/' + id + '/estado', { method: 'PUT', body: { estado: estado } });
        toast(t('exito'), 'success');
        usuariosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}
