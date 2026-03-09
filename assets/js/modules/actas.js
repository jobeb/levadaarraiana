/**
 * Actas — Meeting minutes module
 * Features: CRUD, file management, asistentes, date range filter, WhatsApp share
 */

// Module-level state for file management in modal
var _actaExistingFiles = [];

// Audio recording state
var _actaRecorder = null;
var _actaRecChunks = [];
var _actaRecStream = null;
var _actaRecTimer = null;
var _actaRecElapsed = 0;
var _actaRecTimerStart = 0;
var _actaRecordedFiles = []; // recorded audio blobs pending upload

async function actasLoad() {
    try {
        AppState.actas = await api('/actas');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
        AppState.actas = [];
    }
    actasRender();
}

function actasRender() {
    var grid = $('#actas-grid');
    if (!grid) return;

    var list = (AppState.actas || []).slice();

    // Search filter
    var search = ($('#actas-search') || {}).value;
    if (search) {
        var q = search.toLowerCase();
        list = list.filter(function(a) {
            return (a.titulo || '').toLowerCase().indexOf(q) !== -1 ||
                   (a.contido || '').toLowerCase().indexOf(q) !== -1;
        });
    }

    // Estado filter
    var estadoFilter = ($('#actas-estado-filter') || {}).value || 'todas';
    if (estadoFilter !== 'todas') {
        list = list.filter(function(a) { return a.estado === estadoFilter; });
    }

    // Date range filter
    var desde = ($('#actas-data-desde') || {}).value || '';
    var ata = ($('#actas-data-ata') || {}).value || '';
    if (desde) {
        list = list.filter(function(a) { return (a.data || '') >= desde; });
    }
    if (ata) {
        list = list.filter(function(a) { return (a.data || '') <= ata; });
    }

    // Sort
    var sort = ($('#actas-sort') || {}).value || 'recentes';
    if (sort === 'recentes') {
        list.sort(function(a, b) { return (b.data || '').localeCompare(a.data || ''); });
    } else if (sort === 'antigas') {
        list.sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });
    } else if (sort === 'titulo') {
        list.sort(function(a, b) { return (a.titulo || '').localeCompare(b.titulo || ''); });
    }

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-center">' + t('sen_resultados') + '</p>';
        return;
    }

    var isAdmin = AppState.isSocio();
    var html = '';

    list.forEach(function(a) {
        var estadoBadge = '';
        if (a.estado === 'publicada') {
            estadoBadge = '<span class="badge badge-success">' + t('publicada') + '</span>';
        } else {
            estadoBadge = '<span class="badge badge-warning">' + t('borrador') + '</span>';
        }

        var asistCount = (a.asistentes && a.asistentes.length) ? a.asistentes.length : 0;
        var asistBadge = asistCount > 0
            ? ' <span class="badge" title="' + t('asistentes_reunion') + '">' + asistCount + ' <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></span>'
            : '';

        var actions = '';
        if (isAdmin) {
            actions += '<button class="btn-icon btn-whatsapp" onclick="event.stopPropagation();actasShareWhatsapp(' + a.id + ')" title="' + t('compartir_whatsapp') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>';
            actions += '<button class="btn-icon" onclick="event.stopPropagation();actasModal(AppState.actas.find(function(x){return x.id==' + a.id + '}))" title="' + t('editar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>';
            actions += '<button class="btn-icon btn-danger" onclick="event.stopPropagation();actasDelete(' + a.id + ')" title="' + t('eliminar') + '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>';
        }

        html += '<div class="card" style="cursor:pointer" onclick="actasView(' + a.id + ')">' +
            '<div class="card-body">' +
                '<h3 class="card-title">' + esc(a.titulo) + '</h3>' +
                '<p class="card-meta">' + formatDate(a.data) + ' ' + estadoBadge + asistBadge + '</p>' +
                '<p class="card-text">' + esc(truncate(stripHtml(a.contido), 120)) + '</p>' +
            '</div>' +
            (actions ? '<div class="card-actions">' + actions + '</div>' : '') +
        '</div>';
    });

    grid.innerHTML = html;
}

function actasView(id) {
    var acta = (AppState.actas || []).find(function(a) { return a.id == id; });
    if (!acta) return;

    $('#modal-title').textContent = esc(acta.titulo);

    var arquivosHtml = '';
    if (acta.arquivos && acta.arquivos.length) {
        arquivosHtml = '<div style="margin-top:16px"><strong>' + t('ficheiros') + ':</strong><ul style="list-style:none;padding:0">';
        acta.arquivos.forEach(function(f) {
            var name = typeof f === 'string' ? f : f.name || f;
            var url = typeof f === 'object' && f.url ? f.url : name;
            var fullUrl = uploadUrl(url);
            var ext = (name || '').split('.').pop().toLowerCase();
            var isAudio = ['mp3','wav','ogg','m4a','webm','mp4'].indexOf(ext) !== -1;
            if (isAudio) {
                arquivosHtml += '<li style="margin-bottom:8px">' +
                    '<div>' + esc(name) + '</div>' +
                    '<audio controls preload="none" style="width:100%;max-width:400px"><source src="' + esc(fullUrl) + '"></audio>' +
                '</li>';
            } else {
                arquivosHtml += '<li style="margin-bottom:4px"><a href="' + esc(fullUrl) + '" target="_blank">' + esc(name) + '</a></li>';
            }
        });
        arquivosHtml += '</ul></div>';
    }

    // Asistentes section
    var asistHtml = '';
    if (acta.asistentes && acta.asistentes.length) {
        asistHtml = '<div style="margin-top:16px"><strong>' + t('asistentes_reunion') + ' (' + acta.asistentes.length + '):</strong><ul>';
        acta.asistentes.forEach(function(a) {
            asistHtml += '<li>' + esc(a.nome_completo) + '</li>';
        });
        asistHtml += '</ul></div>';
    }

    $('#modal-body').innerHTML =
        '<p class="card-meta">' + formatDate(acta.data) + '</p>' +
        '<div class="rt-content" style="margin-top:12px">' + sanitizeHtml(acta.contido) + '</div>' +
        asistHtml +
        arquivosHtml;

    $('#modal-footer').innerHTML =
        '<button class="btn btn-sm btn-secondary" onclick="actaExportPDF(' + id + ')" style="margin-right:auto">' + t('exportar_pdf') + '</button>' +
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('voltar') + '</button>';

    showModal('modal-overlay');
}

function actaExportPDF(id) {
    var acta = (AppState.actas || []).find(function(a) { return a.id == id; });
    if (!acta) return;
    if (!window.jspdf || !window.jspdf.jsPDF) {
        toast('PDF library not loaded.', 'error');
        return;
    }
    var doc = new jspdf.jsPDF({ unit: 'mm', format: 'a4' });
    var pageWidth = doc.internal.pageSize.getWidth();
    var margin = 14;
    var maxWidth = pageWidth - margin * 2;
    var y = 18;

    doc.setFontSize(16);
    var titleLines = doc.splitTextToSize(acta.titulo || '', maxWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7 + 4;

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(formatDate(acta.data), margin, y);
    y += 8;
    doc.setTextColor(0);

    var plainText = stripHtml(acta.contido || '');
    if (plainText) {
        doc.setFontSize(11);
        var lines = doc.splitTextToSize(plainText, maxWidth);
        lines.forEach(function(line) {
            if (y > 275) { doc.addPage(); y = 18; }
            doc.text(line, margin, y);
            y += 5.5;
        });
    }

    if (acta.asistentes && acta.asistentes.length) {
        y += 6;
        if (y > 260) { doc.addPage(); y = 18; }
        doc.setFontSize(12);
        doc.text(t('asistentes_reunion') + ' (' + acta.asistentes.length + '):', margin, y);
        y += 6;
        doc.setFontSize(10);
        acta.asistentes.forEach(function(a) {
            if (y > 280) { doc.addPage(); y = 18; }
            doc.text('- ' + (a.nome_completo || ''), margin + 4, y);
            y += 5;
        });
    }

    doc.save((acta.titulo || 'acta').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
}

async function actasModal(item) {
    var isEdit = item && item.id;
    var title = isEdit ? t('editar') + ' ' + t('acta') : t('nova_acta');

    // Init existing files
    _actaExistingFiles = isEdit && item.arquivos ? item.arquivos.slice() : [];

    $('#modal-title').textContent = title;

    var estadoOptions = ['borrador', 'publicada'].map(function(e) {
        var sel = (isEdit && item.estado === e) ? ' selected' : '';
        return '<option value="' + e + '"' + sel + '>' + t(e) + '</option>';
    }).join('');

    // Fetch active users for asistentes checkboxes
    var usuarios = [];
    try {
        usuarios = await api('/usuarios');
        usuarios = usuarios.filter(function(u) { return u.estado === 'Activo' && u.role !== 'Admin' && (u.nome_completo || '').trim(); });
        usuarios.sort(function(a, b) { return (a.nome_completo || '').localeCompare(b.nome_completo || ''); });
    } catch (e) { /* ignore */ }

    var existingAsistIds = {};
    if (isEdit && item.asistentes) {
        item.asistentes.forEach(function(a) { existingAsistIds[a.socio_id] = true; });
    }

    var asistCheckboxes = usuarios.map(function(u) {
        var checked = existingAsistIds[u.id] ? ' checked' : '';
        return '<label style="display:flex;align-items:center;gap:6px;padding:2px 0;cursor:pointer">' +
            '<input type="checkbox" class="acta-asistente-cb" value="' + u.id + '"' + checked + '> ' +
            esc(u.nome_completo) +
        '</label>';
    }).join('');

    $('#modal-body').innerHTML =
        '<input type="hidden" id="acta-id" value="' + (isEdit ? item.id : '') + '">' +
        '<div class="form-group">' +
            '<label class="required">' + t('titulo') + '</label>' +
            '<input type="text" class="form-control" id="acta-titulo" value="' + esc(isEdit ? item.titulo : '') + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('data') + '</label>' +
            '<input type="date" class="form-control" id="acta-data" value="' + esc(isEdit ? item.data || '' : today()) + '">' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('contido') + '</label>' +
            '<div class="rt-wrap" id="acta-contido-editor"></div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('estado') + '</label>' +
            '<select class="form-control" id="acta-estado">' + estadoOptions + '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('asistentes_reunion') + '</label>' +
            '<div id="acta-asistentes-list" style="max-height:180px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:8px">' +
                (asistCheckboxes || '<p class="text-muted">' + t('sen_resultados') + '</p>') +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>' + t('ficheiros') + '</label>' +
            '<div id="acta-files-existing"></div>' +
            '<div id="acta-rec-container"></div>' +
            '<div style="display:flex;gap:8px;align-items:start">' +
                '<input type="file" class="form-control" id="acta-arquivos" multiple style="flex:1">' +
                '<button type="button" class="btn btn-secondary" id="acta-rec-btn" onclick="_actaStartRec()" title="' + t('gravar_audio') + '" style="white-space:nowrap;display:flex;align-items:center;gap:4px">' +
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> ' +
                    t('gravar_audio') +
                '</button>' +
            '</div>' +
        '</div>';

    // Init recording state
    _actaRecordedFiles = [];

    // Render existing files
    _actaRenderFiles();

    initRichTextEditor('acta-contido-editor', isEdit ? item.contido || '' : '', { uploadDir: 'actas' });

    $('#modal-footer').innerHTML =
        '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancelar') + '</button>' +
        '<button class="btn btn-primary" onclick="actasSave()">' + t('gardar') + '</button>';

    showModal('modal-overlay');
}

function _actaRenderFiles() {
    var container = $('#acta-files-existing');
    if (!container) return;
    if (!_actaExistingFiles.length) {
        container.innerHTML = '';
        return;
    }
    var html = '';
    _actaExistingFiles.forEach(function(f, idx) {
        var name = typeof f === 'string' ? f : f.name || '';
        html += '<div class="file-list-item">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>' +
            '<span>' + esc(name) + '</span>' +
            '<button type="button" class="btn-icon btn-danger" onclick="_actaRemoveFile(' + idx + ')" title="' + t('eliminar') + '">&times;</button>' +
        '</div>';
    });
    container.innerHTML = html;
}

function _actaRemoveFile(idx) {
    _actaExistingFiles.splice(idx, 1);
    _actaRenderFiles();
}

async function actasSave() {
    var id = ($('#acta-id') || {}).value;
    var isEdit = !!id;

    var body = {
        titulo: ($('#acta-titulo') || {}).value || '',
        data: ($('#acta-data') || {}).value || today(),
        contido: getRichTextContent('acta-contido-editor'),
        estado: ($('#acta-estado') || {}).value || 'borrador'
    };

    // Collect asistentes
    var asistentes = [];
    document.querySelectorAll('.acta-asistente-cb:checked').forEach(function(cb) {
        asistentes.push(parseInt(cb.value));
    });
    body.asistentes = asistentes;

    // Merge existing files (with url) + new files (with data)
    var arquivos = _actaExistingFiles.map(function(f) {
        return { name: f.name, url: f.url };
    });

    var arquivosInput = $('#acta-arquivos');
    if (arquivosInput && arquivosInput.files && arquivosInput.files.length > 0) {
        for (var i = 0; i < arquivosInput.files.length; i++) {
            var f64 = await fileToBase64(arquivosInput.files[i]);
            arquivos.push({ name: f64.name, data: f64.data });
        }
    }

    // Include recorded audio files
    for (var r = 0; r < _actaRecordedFiles.length; r++) {
        if (!_actaRecordedFiles[r]) continue; // removed
        var rf = await fileToBase64(_actaRecordedFiles[r]);
        arquivos.push({ name: rf.name, data: rf.data });
    }

    // Always send arquivos so backend knows about removals
    body.arquivos = arquivos;

    try {
        if (isEdit) {
            await api('/actas/' + id, { method: 'PUT', body: body });
        } else {
            await api('/actas', { method: 'POST', body: body });
        }
        hideModal('modal-overlay');
        toast(t('exito'), 'success');
        actasLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function actasExport(format) {
    var headers = [t('titulo'), t('data'), t('estado')];
    var rows = (AppState.actas || []).map(function(a) {
        return [a.titulo, a.data || '', a.estado || ''];
    });
    if (format === 'pdf') {
        exportPDF(t('actas'), headers, rows);
    } else {
        exportCSV('actas.csv', headers, rows);
    }
}

async function actasDelete(id) {
    if (!await confirmAction(t('confirmar_eliminar'), {danger:true})) return;
    try {
        await api('/actas/' + id, { method: 'DELETE' });
        toast(t('exito'), 'success');
        actasLoad();
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function actasShareWhatsapp(id) {
    var acta = (AppState.actas || []).find(function(a) { return a.id == id; });
    if (!acta) return;

    var nome = (AppState.config || {}).nome_asociacion || 'Levada Arraiana';
    var l = [];

    l.push(String.fromCodePoint(0x1F4CB) + ' *' + nome + ' \u2014 ' + t('acta') + '*');
    l.push(String.fromCodePoint(0x1F4C5) + ' ' + (acta.data ? formatDate(acta.data) : ''));
    l.push('*' + (acta.titulo || '') + '*');

    if (acta.contido) {
        var desc = acta.contido.replace(/<[^>]+>/g, '').trim();
        if (desc.length > 120) desc = desc.substring(0, 120) + '...';
        if (desc) l.push('_' + desc + '_');
    }

    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    // Asistentes
    if (acta.asistentes && acta.asistentes.length) {
        l.push(String.fromCodePoint(0x1F465) + ' *' + t('asistentes_reunion') + '* (' + acta.asistentes.length + ')');
        var nomes = acta.asistentes.map(function(a) { return a.nome_completo; }).join(', ');
        l.push('   ' + nomes);
    }

    // Ficheiros adxuntos
    if (acta.arquivos && acta.arquivos.length) {
        l.push(String.fromCodePoint(0x1F4CE) + ' *' + t('ficheiros') + '* (' + acta.arquivos.length + ')');
        acta.arquivos.forEach(function(f) {
            l.push('   ' + (f.name || f));
        });
    }

    l.push('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    var baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'app.html#actas/' + id;
    l.push(String.fromCodePoint(0x1F449) + ' *' + t('ver_acta') + ':*');
    l.push(baseUrl);

    var url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(l.join('\n'));
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ---- Audio recording ----

function _actaTimerTick(timerSpan) {
    var elapsed = _actaRecElapsed + (Date.now() - _actaRecTimerStart);
    var secs = Math.floor(elapsed / 1000);
    var m = String(Math.floor(secs / 60)).padStart(2, '0');
    var s = String(secs % 60).padStart(2, '0');
    timerSpan.textContent = m + ':' + s;
}

function _actaTimerPause() {
    if (_actaRecTimer) { clearInterval(_actaRecTimer); _actaRecTimer = null; }
    if (_actaRecTimerStart) _actaRecElapsed += Date.now() - _actaRecTimerStart;
    _actaRecTimerStart = 0;
}

function _actaTimerResume(timerSpan) {
    _actaRecTimerStart = Date.now();
    _actaRecTimer = setInterval(function() { _actaTimerTick(timerSpan); }, 1000);
}

async function _actaStartRec() {
    // If already recording, stop
    if (_actaRecorder && (_actaRecorder.state === 'recording' || _actaRecorder.state === 'paused')) {
        _actaRecorder.stop();
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast(t('erro_permiso_micro') + ' (getUserMedia non dispoñible — require HTTPS)', 'error');
        return;
    }

    var container = $('#acta-rec-container');
    if (!container) return;

    // If preview already open, close it
    var existing = container.querySelector('.rec-live-preview');
    if (existing) {
        var oldStream = existing._previewStream;
        if (oldStream) oldStream.getTracks().forEach(function(tk) { tk.stop(); });
        existing.remove();
        return;
    }

    try {
        _actaRecStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        toast(t('erro_permiso_micro') + ': ' + e.message, 'error');
        return;
    }

    var preview = document.createElement('div');
    preview.className = 'rec-live rec-live-preview';
    preview._previewStream = _actaRecStream;

    preview.innerHTML =
        '<div class="rec-live-indicator"><span class="rec-live-dot"></span><span class="rec-live-text">' + t('listo') + '</span></div>' +
        '<div class="rec-live-controls">' +
            '<button class="btn btn-sm btn-danger rec-live-start">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="7"/></svg> ' +
                t('gravar') +
            '</button>' +
            '<button class="btn btn-sm btn-secondary rec-live-cancel">' + t('cancelar') + '</button>' +
        '</div>';

    container.appendChild(preview);

    preview.querySelector('.rec-live-cancel').addEventListener('click', function() {
        _actaRecStream.getTracks().forEach(function(tk) { tk.stop(); });
        _actaRecStream = null;
        preview.remove();
    });

    preview.querySelector('.rec-live-start').addEventListener('click', function() {
        preview.remove();
        _actaDoRecord();
    });
}

function _actaDoRecord() {
    _actaRecChunks = [];

    var mimeType = '';
    var tryTypes = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    for (var i = 0; i < tryTypes.length; i++) {
        if (MediaRecorder.isTypeSupported(tryTypes[i])) { mimeType = tryTypes[i]; break; }
    }

    _actaRecorder = mimeType
        ? new MediaRecorder(_actaRecStream, { mimeType: mimeType })
        : new MediaRecorder(_actaRecStream);

    if (!mimeType) mimeType = _actaRecorder.mimeType || 'audio/webm';

    _actaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) _actaRecChunks.push(e.data);
    };

    _actaRecorder.onstop = function() {
        _actaTimerPause();
        var liveEl = document.querySelector('#acta-rec-container .rec-live');
        if (liveEl) liveEl.remove();

        _actaRecStream.getTracks().forEach(function(tk) { tk.stop(); });

        var blob = new Blob(_actaRecChunks, { type: mimeType });
        var ext = mimeType.indexOf('mp4') !== -1 ? 'mp4'
                : mimeType.indexOf('ogg') !== -1 ? 'ogg'
                : 'webm';
        var file = new File([blob], 'gravacion_' + Date.now() + '.' + ext, { type: mimeType });

        // Add to recorded files
        _actaRecordedFiles.push(file);

        // Show preview
        var container = $('#acta-rec-container');
        if (container) {
            var blobUrl = URL.createObjectURL(blob);
            var previewDiv = document.createElement('div');
            previewDiv.className = 'rec-preview';
            previewDiv.style.marginBottom = '8px';

            var idx = _actaRecordedFiles.length - 1;

            var player = document.createElement('audio');
            player.controls = true;
            player.className = 'rec-preview-audio';
            player.src = blobUrl;

            var nameSpan = document.createElement('span');
            nameSpan.className = 'medios-slot-name';
            nameSpan.textContent = file.name;

            var removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-icon btn-danger';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = t('eliminar');
            removeBtn.setAttribute('data-rec-idx', idx);
            removeBtn.addEventListener('click', function() {
                var ri = parseInt(this.getAttribute('data-rec-idx'));
                _actaRecordedFiles[ri] = null; // mark as removed
                previewDiv.remove();
            });

            // Transcribe button
            var transcribeBtn = document.createElement('button');
            transcribeBtn.type = 'button';
            transcribeBtn.className = 'btn btn-sm btn-secondary';
            transcribeBtn.style.marginTop = '4px';
            transcribeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> ' + t('transcribir');
            transcribeBtn.addEventListener('click', function() {
                _actaTranscribe(file, previewDiv);
            });

            previewDiv.appendChild(player);
            previewDiv.appendChild(nameSpan);
            previewDiv.appendChild(removeBtn);
            previewDiv.appendChild(transcribeBtn);
            container.appendChild(previewDiv);
        }

        var btn = $('#acta-rec-btn');
        if (btn) btn.classList.remove('rec-active');
        _actaRecorder = null;
        _actaRecStream = null;
        _actaRecElapsed = 0;
    };

    _actaRecorder.start();
    var btn = $('#acta-rec-btn');
    if (btn) btn.classList.add('rec-active');
    toast(t('gravando'), 'info');

    // Live recording UI
    var container = $('#acta-rec-container');
    if (container) {
        var recLive = document.createElement('div');
        recLive.className = 'rec-live';

        recLive.innerHTML =
            '<div class="rec-live-indicator">' +
                '<span class="rec-live-dot"></span>' +
                '<span class="rec-live-text">' + t('gravando') + '</span>' +
                '<span class="rec-live-timer">00:00</span>' +
            '</div>' +
            '<div class="rec-live-controls">' +
                '<button class="btn btn-sm btn-secondary rec-live-pause" title="' + t('pausa') + '">' +
                    '<svg class="rec-pause-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' +
                    '<svg class="rec-resume-icon" style="display:none" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>' +
                '</button>' +
                '<button class="btn btn-sm btn-danger rec-live-stop">' + t('parar') + '</button>' +
            '</div>';

        container.appendChild(recLive);

        recLive.querySelector('.rec-live-stop').addEventListener('click', function() {
            if (_actaRecorder && (_actaRecorder.state === 'recording' || _actaRecorder.state === 'paused')) _actaRecorder.stop();
        });

        var pauseBtn = recLive.querySelector('.rec-live-pause');
        var timerSpan = recLive.querySelector('.rec-live-timer');
        var dotEl = recLive.querySelector('.rec-live-dot');
        var textEl = recLive.querySelector('.rec-live-text');

        pauseBtn.addEventListener('click', function() {
            if (!_actaRecorder) return;
            if (_actaRecorder.state === 'recording') {
                _actaRecorder.pause();
                _actaTimerPause();
                pauseBtn.querySelector('.rec-pause-icon').style.display = 'none';
                pauseBtn.querySelector('.rec-resume-icon').style.display = '';
                pauseBtn.title = t('continuar');
                if (dotEl) dotEl.classList.add('rec-live-dot-paused');
                if (textEl) textEl.textContent = t('pausa');
                recLive.classList.add('rec-live-paused');
            } else if (_actaRecorder.state === 'paused') {
                _actaRecorder.resume();
                _actaTimerResume(timerSpan);
                pauseBtn.querySelector('.rec-pause-icon').style.display = '';
                pauseBtn.querySelector('.rec-resume-icon').style.display = 'none';
                pauseBtn.title = t('pausa');
                if (dotEl) dotEl.classList.remove('rec-live-dot-paused');
                if (textEl) textEl.textContent = t('gravando');
                recLive.classList.remove('rec-live-paused');
            }
        });

        _actaRecElapsed = 0;
        _actaTimerResume(timerSpan);
    }
}

// ---- Audio transcription (Groq Whisper) ----

async function _actaTranscribe(file, previewDiv) {
    // Remove any previous transcript result in this preview
    var oldResult = previewDiv.querySelector('.rec-transcript-result');
    if (oldResult) oldResult.remove();

    // Find and disable the transcribe button
    var btn = previewDiv.querySelector('.btn-sm.btn-secondary');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="btn-spinner"></span> ' + t('transcribindo');
    }

    try {
        var f64 = await fileToBase64(file);
        var ext = (file.name || '').split('.').pop().toLowerCase() || 'webm';

        var result = await api('/whisper/transcribe', {
            method: 'POST',
            body: {
                audio_data: f64.data,
                audio_ext: ext,
                lang: AppState.lang || 'gl'
            }
        });

        var text = (result.text || '').trim();
        if (!text) {
            toast(t('sen_resultados'), 'info');
            return;
        }

        // Show transcript result
        var resultDiv = document.createElement('div');
        resultDiv.className = 'rec-transcript-result';

        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.rows = 4;

        var insertBtn = document.createElement('button');
        insertBtn.type = 'button';
        insertBtn.className = 'btn btn-sm btn-primary';
        insertBtn.textContent = t('inserir_contido');
        insertBtn.addEventListener('click', function() {
            _actaInsertTranscript(textarea.value);
        });

        var summaryBtn = document.createElement('button');
        summaryBtn.type = 'button';
        summaryBtn.className = 'btn btn-sm btn-secondary';
        summaryBtn.textContent = t('xerar_resumo');
        summaryBtn.addEventListener('click', function() {
            _actaSummarize(textarea, summaryBtn);
        });

        var btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '6px';
        btnRow.style.marginTop = '6px';
        btnRow.appendChild(insertBtn);
        btnRow.appendChild(summaryBtn);

        resultDiv.appendChild(textarea);
        resultDiv.appendChild(btnRow);
        previewDiv.appendChild(resultDiv);

    } catch (e) {
        toast(t('erro_transcricion') + ': ' + e.message, 'error');
    } finally {
        // Restore button
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> ' + t('transcribir');
        }
    }
}

async function _actaSummarize(textarea, btn) {
    var text = (textarea.value || '').trim();
    if (!text) {
        toast(t('erro_resumo'), 'error');
        return;
    }

    var originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> ' + t('xerando_resumo');

    try {
        var result = await api('/whisper/summarize', {
            method: 'POST',
            body: {
                text: text,
                lang: AppState.lang || 'gl'
            }
        });

        var summary = (result.summary || '').trim();
        if (summary) {
            _actaInsertTranscript(summary);
            toast(t('resumo_inserido'), 'success');
        }
    } catch (e) {
        toast(t('erro_resumo') + ': ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function _actaInsertTranscript(text) {
    if (!text) return;
    var editor = _rtInstances['acta-contido-editor'];
    if (editor) {
        var len = editor.getLength();
        editor.insertText(len - 1, '\n' + text);
        toast(t('transcricion_inserida'), 'success');
    }
}
