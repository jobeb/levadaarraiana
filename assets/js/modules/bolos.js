/**
 * Bolos — Actuacións management module (unified eventos + contratos)
 */
var _bolosView = 'list';
var _bolosAsistencia = {};
var _bolosCalendar = new CalendarWidget('bolos-calendar', {
    onDayClick: function(date, events) {
        if (events.length > 0) {
            _showDayPopup(date, events);
        }
    },
    onEventClick: function(id) {
        var b = (AppState.bolos || []).find(function(x) { return x.id == id; });
        if (b && AppState.isSocio()) bolosModal(b);
    }
});

function bolosSetView(view) {
    _bolosView = view;
    var btns = $$('#bolos-view-toggle button');
    btns.forEach(function(b, i) {
        b.classList.toggle('active',
            (i === 0 && view === 'list') ||
            (i === 1 && view === 'calendar') ||
            (i === 2 && view === 'solicitudes')
        );
    });
    $('#bolos-grid').style.display = view === 'list' ? '' : 'none';
    $('#bolos-calendar').style.display = view === 'calendar' ? '' : 'none';
    var solEl = $('#bolos-solicitudes');
    if (solEl) solEl.style.display = view === 'solicitudes' ? '' : 'none';
    if (view === 'calendar') bolosRenderCalendar();
    if (view === 'solicitudes') bolosSolicitudesLoad();
}

function bolosRenderCalendar() {
    var cfgColor = ((AppState.config || {}).cal_cor_bolos) || '#ff9800';
    var events = (AppState.bolos || []).map(function(b) {
        var color = b.tipo === 'festival' ? 'var(--success)' : b.tipo === 'taller' ? 'var(--warning)' : cfgColor;
        return { date: b.data, title: b.titulo, color: color, id: b.id, time: b.hora || '' };
    });
    _bolosCalendar.setEvents(events);
    _bolosCalendar.render();
}

async function bolosLoad() {
    try {
        var results = await Promise.all([
            api('/bolos'),
            Object.keys(AppState.config || {}).length ? Promise.resolve(AppState.config) : api('/config').catch(function() { return {}; }),
            api('/bolos/mi-asistencia').catch(function() { return {}; })
        ]);
        AppState.bolos = results[0];
        AppState.config = results[1] || {};
        _bolosAsistencia = results[2] || {};
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.bolos = AppState.bolos || [];
    }

    // Deep link: #bolos/ID → open confirm modal
    if (AppState.routeParam) {
        var targetId = parseInt(AppState.routeParam, 10);
        AppState.routeParam = null;
        if (targetId) {
            bolosRender();
            if (_bolosView === 'calendar') bolosRenderCalendar();
            bolosConfirmModal(targetId);
            return;
        }
    }

    bolosRender();
    if (_bolosView === 'calendar') bolosRenderCalendar();
}

function bolosRender() {
    var grid = $('#bolos-grid');
    if (!grid) return;

    var list = AppState.bolos || [];

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isSocio();
    var html = '';

    list.forEach(function(b) {
        var imgHtml = '';
        if (b.imaxe) {
            imgHtml = '<div class="card-img"><img src="' + esc(uploadUrl(b.imaxe)) + '" alt=""></div>';
        }

        var tipoBadge = '';
        if (b.tipo === 'actuacion') {
            tipoBadge = '<span class="badge badge-primary">' + t('actuacion') + '</span>';
        } else if (b.tipo === 'festival') {
            tipoBadge = '<span class="badge badge-success">' + t('festival') + '</span>';
        } else if (b.tipo === 'taller') {
            tipoBadge = '<span class="badge badge-warning">' + t('taller') + '</span>';
        } else {
            tipoBadge = '<span class="badge">' + esc(b.tipo || '') + '</span>';
        }

        var estadoBadge = '';
        switch (b.estado) {
            case 'confirmado':
                estadoBadge = '<span class="badge badge-success">' + t('confirmado') + '</span>';
                break;
            case 'borrador':
                estadoBadge = '<span class="badge badge-warning">' + t('borrador') + '</span>';
                break;
            case 'asinado':
                estadoBadge = '<span class="badge badge-primary">' + t('asinado') + '</span>';
                break;
            case 'completado':
                estadoBadge = '<span class="badge badge-success">' + t('completado') + '</span>';
                break;
            case 'cancelado':
                estadoBadge = '<span class="badge badge-danger">' + t('cancelado') + '</span>';
                break;
            default:
                estadoBadge = '<span class="badge">' + esc(b.estado || '') + '</span>';
        }

        var metaHtml = '<span>' + formatDate(b.data) + (b.hora ? ' ' + esc(b.hora) : '') + '</span>';
        if (b.lugar) metaHtml += '<span>' + esc(b.lugar) + '</span>';
        if (b.importe && parseFloat(b.importe) > 0) {
            metaHtml += '<span>' + parseFloat(b.importe).toFixed(2) + ' &euro;</span>';
        }
        if (b.cliente_nome) {
            metaHtml += '<span>' + esc(b.cliente_nome) + '</span>';
        }

        var actions = '';

        // Attendance buttons for future/upcoming bolos
        var isFuture = b.data >= today();
        var myEstado = _bolosAsistencia[b.id] || null;
        if (isFuture) {
            actions += '<button class="btn-icon' + (myEstado === 'confirmado' ? ' btn-success' : '') + '" onclick="bolosAsistenciaRapida(' + b.id + ',\'confirmado\')" title="' + t('confirmo') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>';
            actions += '<button class="btn-icon' + (myEstado === 'non_podo' ? ' btn-danger' : '') + '" onclick="bolosAsistenciaRapida(' + b.id + ',\'non_podo\')" title="' + t('non_podo') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        }
        // Instrument count button
        actions += '<button class="btn-icon" onclick="bolosInstrumentCount(' + b.id + ')" title="' + t('reconto_instrumentos') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></button>';

        // WhatsApp share — always visible for socios
        if (isAdmin) {
            actions += '<button class="btn-icon btn-whatsapp" onclick="bolosShareWhatsapp(' + b.id + ')" title="' + t('compartir_whatsapp') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>';
        }

        if (b.contrato_arquivo) {
            actions += '<a href="' + esc(uploadUrl(b.contrato_arquivo)) + '" target="_blank" class="btn-icon" title="Download"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a>';
        }
        if (isAdmin) {
            actions += '<button class="btn-icon" onclick="bolosModal(AppState.bolos.find(function(x){return x.id==' + b.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>';
            actions += '<button class="btn-icon btn-danger" onclick="bolosDelete(' + b.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>';
        }

        html += '<div class="card">' +
            imgHtml +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(b.titulo) + '</h3>' +
                '<div class="card-meta">' + metaHtml + '</div>' +
                (b.descricion ? '<p class="card-text">' + esc(truncate(stripHtml(b.descricion), 100)) + '</p>' : '') +
                '<div class="card-badges">' + tipoBadge + ' ' + estadoBadge +
                    (b.publica ? ' <span class="badge badge-primary">' + t('publica') + '</span>' : '') +
                    (isFuture && myEstado === 'confirmado' ? ' <span class="badge badge-success">' + t('confirmo') + '</span>' : '') +
                    (isFuture && myEstado === 'non_podo' ? ' <span class="badge badge-danger">' + t('non_podo') + '</span>' : '') +
                '</div>' +
                (actions ? '<div class="card-actions">' + actions + '</div>' : '') +
            '</div>' +
            '</div>';
    });

    grid.innerHTML = html;
}

function bolosModal(item) {
    var isEdit = item && item.id;
    var hasData = !!item;
    var title = isEdit ? t('editar') + ' ' + t('bolo') : t('novo_bolo');

    $('#modal-title').textContent = title;

    var tipoOptions = ['actuacion', 'festival', 'taller'].map(function(tp) {
        var sel = (hasData && item.tipo === tp) ? ' selected' : '';
        return '<option value="' + tp + '"' + sel + '>' + t(tp) + '</option>';
    }).join('');

    var estadoOptions = ['borrador', 'confirmado', 'asinado', 'completado', 'cancelado'].map(function(e) {
        var sel = (hasData && item.estado === e) ? ' selected' : '';
        return '<option value="' + e + '"' + sel + '>' + t(e) + '</option>';
    }).join('');

    var publicaChecked = (hasData && item.publica) ? ' checked' : '';

    $('#modal-body').innerHTML =
        '<input type="hidden" id="bolo-id" value="' + (isEdit ? item.id : '') + '">' +
        _renderModalLangBar() +
        '<div class="form-group">' +
            '<label class="required">' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="bolo-titulo" value="' + esc(hasData ? item.titulo || '' : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('descricion') + '</label>' +
            '<div class="rt-wrap" id="bolo-descricion-editor"></div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('data') + '</label>' +
                '<input type="date" class="form-control" id="bolo-data" value="' + (hasData ? item.data || today() : today()) + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('hora') + '</label>' +
                '<input type="time" class="form-control" id="bolo-hora" value="' + (hasData ? item.hora || '' : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('lugar') + '</label>' +
            '<input type="text" class="form-control" id="bolo-lugar" value="' + esc(hasData ? item.lugar || '' : '') + '">' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('tipo') + '</label>' +
                '<select class="form-control" id="bolo-tipo">' + tipoOptions + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('estado') + '</label>' +
                '<select class="form-control" id="bolo-estado">' + estadoOptions + '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label><input type="checkbox" id="bolo-publica"' + publicaChecked + '> ' + t('publica') + '</label>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('imaxes') + '</label>' +
            '<input type="file" class="form-control" id="bolo-imaxe" accept="image/*">' +
            (isEdit && item.imaxe ? '<img src="' + esc(uploadUrl(item.imaxe)) + '" class="avatar-sm" style="margin-top:8px">' : '') +
        '</div>' +
        '<hr style="border-color:var(--border);margin:12px 0">' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('cliente') + ' (' + t('nome') + ')</label>' +
                '<input type="text" class="form-control" id="bolo-cliente-nome" value="' + esc(hasData ? item.cliente_nome || '' : '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('nif') + '</label>' +
                '<input type="text" class="form-control" id="bolo-cliente-nif" value="' + esc(hasData ? item.cliente_nif || '' : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('telefono') + '</label>' +
                '<input type="text" class="form-control" id="bolo-cliente-telefono" value="' + esc(hasData ? item.cliente_telefono || '' : '') + '">' +
            '</div>' +
            '<div class="form-group" style="flex:1">' +
                '<label>' + t('importe') + '</label>' +
                '<input type="number" class="form-control" id="bolo-importe" step="0.01" min="0" value="' + (hasData ? item.importe || '' : '') + '">' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('notas') + '</label>' +
            '<textarea class="form-control" id="bolo-notas" rows="2">' + esc(hasData ? item.notas || '' : '') + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('contrato') + ' (' + t('ficheiros') + ')</label>' +
            '<input type="file" class="form-control" id="bolo-contrato-arquivo">' +
            (isEdit && item.contrato_arquivo ? '<p style="margin-top:4px"><a href="' + esc(uploadUrl(item.contrato_arquivo)) + '" target="_blank">' + esc(item.contrato_arquivo) + '</a></p>' : '') +
        '</div>';

    initRichTextEditor('bolo-descricion-editor', hasData ? item.descricion || '' : '', { uploadDir: 'bolos' });

    _initModalI18n([
        { key: 'titulo', inputId: 'bolo-titulo', type: 'input' },
        { key: 'descricion', inputId: 'bolo-descricion-editor', type: 'richtext', editorId: 'bolo-descricion-editor' }
    ], isEdit ? item : null);

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="bolosSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

async function bolosSave() {
    var id = ($('#bolo-id') || {}).value;
    var isEdit = !!id;

    _saveModalLangValues();
    var glData = _modalI18n.data.gl || {};

    var body = {
        titulo: glData.titulo || ($('#bolo-titulo') || {}).value || '',
        descricion: glData.descricion || getRichTextContent('bolo-descricion-editor'),
        data: ($('#bolo-data') || {}).value || today(),
        hora: ($('#bolo-hora') || {}).value || '',
        lugar: ($('#bolo-lugar') || {}).value || '',
        tipo: ($('#bolo-tipo') || {}).value || 'actuacion',
        estado: ($('#bolo-estado') || {}).value || 'borrador',
        publica: $('#bolo-publica') ? $('#bolo-publica').checked : false,
        cliente_nome: ($('#bolo-cliente-nome') || {}).value || '',
        cliente_nif: ($('#bolo-cliente-nif') || {}).value || '',
        cliente_telefono: ($('#bolo-cliente-telefono') || {}).value || '',
        importe: parseFloat(($('#bolo-importe') || {}).value) || 0,
        notas: ($('#bolo-notas') || {}).value || '',
        i18n: _collectModalI18n()
    };

    // Image file
    var fileInput = $('#bolo-imaxe');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        var imgB64 = await imageToBase64(fileInput.files[0]);
        body.imaxe_data = imgB64.data;
        body.imaxe_ext = 'jpg';
    }

    // Contract file
    var contratoInput = $('#bolo-contrato-arquivo');
    if (contratoInput && contratoInput.files && contratoInput.files.length > 0) {
        body.contrato_arquivo_data = await fileToBase64(contratoInput.files[0]);
        body.contrato_arquivo_nome = contratoInput.files[0].name;
    }

    try {
        if (isEdit) {
            await api('/bolos/' + id, { method: 'PUT', body: body });
        } else {
            await api('/bolos', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        bolosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function bolosExport(format) {
    var headers = [t('titulo'), t('data'), t('hora'), t('lugar'), t('tipo'), t('estado')];
    var rows = (AppState.bolos || []).map(function(b) {
        return [b.titulo, b.data || '', b.hora || '', b.lugar || '', b.tipo || '', b.estado || ''];
    });
    if (format === 'pdf') {
        exportPDF(t('bolos'), headers, rows);
    } else {
        exportCSV('bolos.csv', headers, rows);
    }
}

async function bolosDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/bolos/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        bolosLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

/* ==========================================================
   Asistencia a bolos — WhatsApp + confirm modal
   ========================================================== */

async function bolosAsistenciaRapida(boloId, estado) {
    try {
        await api('/bolos/asistencia', { method: 'POST', body: { bolo_id: boloId, estado: estado } });
        _bolosAsistencia[boloId] = estado;
        toast(t('exito'), 'success');
        if (AppState.currentSection === 'dashboard') {
            _renderDashboardNextBolo(AppState.bolos || []);
        } else {
            bolosRender();
        }
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function bolosShareWhatsapp(id) {
    var b = (AppState.bolos || []).find(function(x) { return x.id == id; });
    if (!b) return;

    var asistentes = [];
    try {
        asistentes = await api('/bolos/asistencia/' + id);
    } catch (e) { /* ignore */ }

    var confirmados = asistentes.filter(function(a) { return a.estado === 'confirmado'; });
    var declinados = asistentes.filter(function(a) { return a.estado === 'non_podo'; });
    var nome = (AppState.config || {}).nome_asociacion || 'Levada Arraiana';

    var l = [];
    l.push('\uD83C\uDFB6 *' + nome + ' \u2014 ' + b.titulo + '*');
    l.push('');
    l.push('\uD83D\uDCC5 ' + (b.data ? formatDate(b.data) : ''));
    if (b.hora) l.push('\uD83D\uDD52 ' + b.hora);
    if (b.lugar) l.push('\uD83D\uDCCD ' + b.lugar);

    if (b.descricion) {
        var desc = b.descricion.replace(/<[^>]+>/g, '').trim();
        if (desc.length > 120) desc = desc.substring(0, 120) + '...';
        if (desc) { l.push(''); l.push('_' + desc + '_'); }
    }
    l.push('');
    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    if (confirmados.length > 0) {
        l.push('\u2705 *' + t('confirmados_bolo') + '* (' + confirmados.length + ')');
        confirmados.forEach(function(a) {
            var inst = a.instrumento ? ' \u2022 _' + a.instrumento + '_' : '';
            l.push('   ' + (a.nome_completo || '') + inst);
        });
    }
    if (declinados.length > 0) {
        l.push('\u274C *' + t('non_podo') + '* (' + declinados.length + ')');
        declinados.forEach(function(a) {
            l.push('   ' + (a.nome_completo || ''));
        });
    }
    if (confirmados.length === 0 && declinados.length === 0) {
        l.push(t('ninguen_confirmou'));
    }

    l.push('');
    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    var baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'app.html#bolos/' + id;
    l.push('\uD83D\uDC49 *' + t('confirmar_asistencia_link') + ':*');
    l.push(baseUrl);

    var url = 'https://wa.me/?text=' + encodeURIComponent(l.join('\n'));
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function bolosConfirmModal(boloId) {
    var b = (AppState.bolos || []).find(function(x) { return x.id == boloId; });
    if (!b) return;

    var asistentes = [];
    try {
        asistentes = await api('/bolos/asistencia/' + boloId);
    } catch (e) { /* ignore */ }

    var confirmados = asistentes.filter(function(a) { return a.estado === 'confirmado'; });
    var declinados = asistentes.filter(function(a) { return a.estado === 'non_podo'; });
    var myEstado = _bolosAsistencia[boloId] || null;

    $('#modal-title').textContent = b.titulo;

    var html = '';

    // Bolo info
    html += '<div class="card-meta" style="margin-bottom:12px">';
    if (b.data) html += '<span>' + formatDate(b.data) + (b.hora ? ' ' + b.hora : '') + '</span>';
    if (b.lugar) html += '<span>' + esc(b.lugar) + '</span>';
    html += '</div>';
    if (b.descricion) {
        html += '<div class="rt-content" style="margin-bottom:12px">' + sanitizeHtml(b.descricion) + '</div>';
    }

    // My status
    if (myEstado) {
        var badgeClass = myEstado === 'confirmado' ? 'badge-success' : 'badge-danger';
        var badgeText = myEstado === 'confirmado' ? t('confirmo') : t('non_podo');
        html += '<p style="margin-bottom:12px"><strong>' + t('o_teu_estado') + ':</strong> <span class="badge ' + badgeClass + '">' + badgeText + '</span></p>';
    }

    // Confirmed list
    html += '<h4 style="margin:12px 0 8px">' + t('confirmados_bolo') + ' (' + confirmados.length + ')</h4>';
    if (confirmados.length > 0) {
        html += '<ul style="list-style:none;padding:0;margin:0">';
        confirmados.forEach(function(a) {
            html += '<li style="padding:4px 0">' + esc(a.nome_completo) +
                (a.instrumento ? ' <span class="badge">' + esc(a.instrumento) + '</span>' : '') + '</li>';
        });
        html += '</ul>';
    } else {
        html += '<p class="text-muted">' + t('ninguen_confirmou') + '</p>';
    }

    // Declined list
    if (declinados.length > 0) {
        html += '<h4 style="margin:12px 0 8px">' + t('non_podo') + ' (' + declinados.length + ')</h4>';
        html += '<ul style="list-style:none;padding:0;margin:0">';
        declinados.forEach(function(a) {
            html += '<li style="padding:4px 0">' + esc(a.nome_completo) +
                (a.instrumento ? ' <span class="badge">' + esc(a.instrumento) + '</span>' : '') + '</li>';
        });
        html += '</ul>';
    }

    $('#modal-body').innerHTML = html;

    var isFuture = b.data >= today();
    $('#modal-footer').innerHTML =
        (isFuture ? '<button class="btn btn-success" onclick="bolosAsistenciaRapida(' + boloId + ',\'confirmado\');hideModal(\'modal-overlay\')">' + t('confirmo') + '</button>' +
        '<button class="btn btn-danger" onclick="bolosAsistenciaRapida(' + boloId + ',\'non_podo\');hideModal(\'modal-overlay\')">' + t('non_podo') + '</button>' : '') +
        '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('pechar') + '</button>';

    showModal('modal-overlay');
}

/* ==========================================================
   Solicitudes de contratacion
   ========================================================== */
var _solicitudesBolos = [];

async function bolosSolicitudesLoad() {
    try {
        _solicitudesBolos = await api('/solicitudes-bolos');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        _solicitudesBolos = [];
    }
    bolosSolicitudesRender();
}

function bolosSolicitudesRender() {
    var container = $('#bolos-solicitudes');
    if (!container) return;

    if (_solicitudesBolos.length === 0) {
        container.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var html = '<div class="card-grid">';
    _solicitudesBolos.forEach(function(s) {
        var estadoBadge = '';
        switch (s.estado) {
            case 'pendente':
                estadoBadge = '<span class="badge badge-warning">' + t('sol_pendente') + '</span>';
                break;
            case 'contactado':
                estadoBadge = '<span class="badge badge-primary">' + t('sol_contactado') + '</span>';
                break;
            case 'aceptado':
                estadoBadge = '<span class="badge badge-success">' + t('sol_aceptado') + '</span>';
                break;
            case 'rexeitado':
                estadoBadge = '<span class="badge badge-danger">' + t('sol_rexeitado') + '</span>';
                break;
            default:
                estadoBadge = '<span class="badge">' + esc(s.estado) + '</span>';
        }

        var estadoSelect =
            '<select class="form-control" style="max-width:160px;display:inline-block" onchange="bolosSolCambiarEstado(' + s.id + ', this.value)">' +
                '<option value="pendente"' + (s.estado === 'pendente' ? ' selected' : '') + '>' + t('sol_pendente') + '</option>' +
                '<option value="contactado"' + (s.estado === 'contactado' ? ' selected' : '') + '>' + t('sol_contactado') + '</option>' +
                '<option value="aceptado"' + (s.estado === 'aceptado' ? ' selected' : '') + '>' + t('sol_aceptado') + '</option>' +
                '<option value="rexeitado"' + (s.estado === 'rexeitado' ? ' selected' : '') + '>' + t('sol_rexeitado') + '</option>' +
            '</select>';

        var actions = '';
        actions += '<button class="btn-icon" onclick="bolosSolConverter(' + s.id + ')" title="' + t('sol_converter_bolo') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
        actions += '<button class="btn-icon btn-danger" onclick="bolosSolDelete(' + s.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>';

        // Structured info rows
        var infoHtml = '<div class="sol-info">';
        infoHtml += '<div class="sol-info-row"><span class="sol-label">' + t('email') + '</span><span>' + esc(s.email) + '</span></div>';
        if (s.telefono) infoHtml += '<div class="sol-info-row"><span class="sol-label">' + t('telefono') + '</span><span>' + esc(s.telefono) + '</span></div>';
        if (s.data_evento) infoHtml += '<div class="sol-info-row"><span class="sol-label">' + t('data') + '</span><span>' + formatDate(s.data_evento) + '</span></div>';
        if (s.lugar) infoHtml += '<div class="sol-info-row"><span class="sol-label">' + t('lugar') + '</span><span>' + esc(s.lugar) + '</span></div>';
        infoHtml += '</div>';

        html += '<div class="card">' +
            '<div class="card-body">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">' +
                    '<h3 class="card-title" style="margin:0">' + esc(s.nome) + '</h3>' +
                    estadoBadge +
                '</div>' +
                infoHtml +
                (s.descricion ? '<div class="sol-descricion">' + esc(s.descricion) + '</div>' : '') +
                '<div style="display:flex;align-items:center;gap:8px;margin-top:10px">' +
                    '<span class="sol-label">' + t('estado') + '</span>' + estadoSelect +
                '</div>' +
                '<div class="form-group" style="margin-top:8px">' +
                    '<textarea class="form-control" rows="2" placeholder="' + t('notas') + '" onblur="bolosSolGuardarNotas(' + s.id + ', this)">' + esc(s.notas || '') + '</textarea>' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">' +
                    '<span style="font-size:0.75rem;color:var(--text-muted)">' + formatDate(s.creado) + '</span>' +
                    '<div class="card-actions" style="margin:0">' + actions + '</div>' +
                '</div>' +
            '</div>' +
            '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

async function bolosSolCambiarEstado(id, estado) {
    try {
        await api('/solicitudes-bolos/' + id, { method: 'PUT', body: { estado: estado } });
        var sol = _solicitudesBolos.find(function(s) { return s.id == id; });
        if (sol) sol.estado = estado;
        toast(t('exito'), 'success');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function bolosSolGuardarNotas(id, textarea) {
    var notas = textarea.value.trim();
    try {
        await api('/solicitudes-bolos/' + id, { method: 'PUT', body: { notas: notas } });
        var sol = _solicitudesBolos.find(function(s) { return s.id == id; });
        if (sol) sol.notas = notas;
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function bolosSolDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), { danger: true })) return;
    try {
        await api('/solicitudes-bolos/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        bolosSolicitudesLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function bolosSolConverter(id) {
    var sol = _solicitudesBolos.find(function(s) { return s.id == id; });
    if (!sol) return;

    // Open bolos modal with prefilled data from the solicitude
    var prefill = {
        titulo: '',
        descricion: sol.descricion || '',
        data: sol.data_evento || today(),
        hora: '',
        lugar: sol.lugar || '',
        tipo: sol.tipo || 'actuacion',
        estado: 'borrador',
        publica: false,
        cliente_nome: sol.nome || '',
        cliente_nif: '',
        cliente_telefono: sol.telefono || '',
        importe: 0,
        notas: (sol.notas ? sol.notas + '\n' : '') + 'Email: ' + (sol.email || ''),
        imaxe: '',
        contrato_arquivo: ''
    };

    bolosModal(prefill);
}

/* ---- Instrument Count Modal ---- */
async function bolosInstrumentCount(id) {
    var b = (AppState.bolos || []).find(function(x) { return x.id == id; });
    if (!b) return;

    $('#modal-title').textContent = t('reconto_instrumentos');
    $('#modal-body').innerHTML = '<p class="text-muted text-sm">' + t('cargando') + '</p>';
    $('#modal-footer').innerHTML = '<button class="btn btn-secondary" onclick="hideModal(\'modal-overlay\')">' + t('pechar') + '</button>';
    showModal('modal-overlay');

    var asistentes = [];
    try {
        asistentes = await api('/bolos/asistencia/' + id);
        if (!Array.isArray(asistentes)) asistentes = [];
    } catch (err) { asistentes = []; }

    var html = '<div class="card-meta" style="margin-bottom:12px">' +
        '<span>' + esc(b.titulo) + '</span>' +
        '<span>' + formatDate(b.data) + '</span>' +
        (b.lugar ? '<span>' + esc(b.lugar) + '</span>' : '') +
    '</div>';

    var instHtml = _buildInstrumentCount(asistentes);
    if (instHtml) {
        html += instHtml;
    } else {
        html += '<p class="text-muted">' + t('sen_confirmados_instrumentos') + '</p>';
    }

    $('#modal-body').innerHTML = html;
}
