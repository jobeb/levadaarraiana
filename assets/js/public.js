/**
 * Public — Carga contido na landing page (sen gate)
 */

// Cached public data
var _pubData = { noticias: [], bolos: [], instrumentos: [] };
// Cache de comentarios: { noticia: { id: [comments] }, bolo: { id: [comments] } }
var _pubComments = { noticia: {}, bolo: {} };

// Instrument icons fallback
var _pubInstrumentIcons = {
    surdo: 'assets/img/instrumentos/surdo.jpg',
    caixa: 'assets/img/instrumentos/caixa.jpg',
    repinique: 'assets/img/instrumentos/repinique.jpg',
    tamborim: 'assets/img/instrumentos/tamborim.jpg',
    timbao: 'assets/img/instrumentos/timbao.jpg',
    agogo: 'assets/img/instrumentos/agogo.jpg',
    ganza: 'assets/img/instrumentos/ganza.jpg',
    apito: 'assets/img/instrumentos/apito.jpg',
    outro: 'assets/img/instrumentos/outro.png'
};

function _renderBoloCard(b) {
    var count = (_pubComments.bolo[b.id] || []).length;
    var imgHtml = '';
    if (b.imaxe) {
        imgHtml = `<div class="pub-card-img"><img src="${uploadUrl(b.imaxe)}" alt="${esc(tc(b,'titulo'))}" loading="lazy"></div>`;
    } else {
        imgHtml = `<div class="pub-card-img pub-card-placeholder"><div class="pub-card-placeholder-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></div></div>`;
    }
    return `<div class="pub-card" data-type="bolo" onclick="_pubShowBolo(${b.id})">
        ${imgHtml}
        <div class="pub-card-body">
            <h3>${esc(tc(b,'titulo'))}</h3>
            <p>${esc(truncate(stripHtml(tc(b,'descricion')), 120))}</p>
            <div class="pub-card-date">${formatDate(b.data)} ${esc(b.hora || '')} — ${esc(b.lugar || '')}</div>
        </div>
        <div class="pub-comment-toggle" onclick="event.stopPropagation();_pubToggleComments('bolo',${b.id},this)">${t('comentarios')} (${count})</div>
        <div class="pub-comments-zone" id="comments-bolo-${b.id}" onclick="event.stopPropagation()"></div>
    </div>`;
}

function _renderNoticiaCard(n) {
    var count = (_pubComments.noticia[n.id] || []).length;
    var hasImages = n.imaxes && n.imaxes.length;
    var imgHtml = '';
    if (hasImages) {
        imgHtml = `<div class="pub-card-img"><img src="${uploadUrl(n.imaxes[0])}" alt="${esc(tc(n,'titulo'))}" loading="lazy"></div>`;
    }
    return `<div class="pub-card" data-type="noticia" onclick="_pubShowNoticia(${n.id})">
        ${imgHtml}
        <div class="pub-card-body">
            <h3>${esc(tc(n,'titulo'))}</h3>
            <p>${esc(truncate(stripHtml(tc(n,'texto')), 150))}</p>
            <div class="pub-card-date">${formatDate(n.data)}</div>
        </div>
        <div class="pub-comment-toggle" onclick="event.stopPropagation();_pubToggleComments('noticia',${n.id},this)">${t('comentarios')} (${count})</div>
        <div class="pub-comments-zone" id="comments-noticia-${n.id}" onclick="event.stopPropagation()"></div>
    </div>`;
}

// ---- Public detail modal ----
function _pubShowDetail(imgHtml, bodyHtml) {
    document.getElementById('pub-detail-img').innerHTML = imgHtml;
    document.getElementById('pub-detail-body').innerHTML = bodyHtml;
    document.getElementById('pub-detail-overlay').classList.add('show');
}
function hidePubDetail() {
    document.getElementById('pub-detail-overlay').classList.remove('show');
}

function _pubShowNoticia(id) {
    var n = _pubData.noticias.find(function(x) { return x.id === id; });
    if (!n) return;
    var hasImages = n.imaxes && n.imaxes.length;
    var imgHtml = '';
    if (hasImages) {
        imgHtml = '<div class="pub-detail-img-wrap">' +
            '<img src="' + uploadUrl(n.imaxes[0]) + '" alt="' + esc(tc(n,'titulo')) + '" onclick="openLightbox([' + n.imaxes.map(function(i) { return "'" + uploadUrl(i) + "'"; }).join(',') + '], 0)">' +
            (n.imaxes.length > 1 ? '<div class="pub-detail-gallery">' + n.imaxes.slice(1, 5).map(function(i, idx) {
                return '<img src="' + uploadUrl(i) + '" alt="" onclick="openLightbox([' + n.imaxes.map(function(x) { return "'" + uploadUrl(x) + "'"; }).join(',') + '],' + (idx + 1) + ')" loading="lazy">';
            }).join('') + (n.imaxes.length > 5 ? '<span class="pub-detail-more">+' + (n.imaxes.length - 5) + '</span>' : '') + '</div>' : '') +
        '</div>';
    }
    var bodyHtml = '<div class="pub-detail-header">' +
        '<span class="pub-detail-badge noticia">' + t('noticias') + '</span>' +
        '<span class="pub-detail-date">' + formatDate(n.data) + '</span>' +
    '</div>' +
    '<h2>' + esc(tc(n,'titulo')) + '</h2>' +
    '<div class="rt-content pub-detail-text">' + sanitizeHtml(tc(n,'texto')) + '</div>';
    _pubShowDetail(imgHtml, bodyHtml);
}

function _pubShowBolo(id) {
    var b = _pubData.bolos.find(function(x) { return x.id === id; });
    if (!b) return;
    var imgHtml = '';
    if (b.imaxe) {
        imgHtml = '<div class="pub-detail-img-wrap">' +
            '<img src="' + uploadUrl(b.imaxe) + '" alt="' + esc(tc(b,'titulo')) + '" onclick="openLightbox([\'' + uploadUrl(b.imaxe) + '\'], 0)">' +
        '</div>';
    }
    var bodyHtml = '<div class="pub-detail-header">' +
        '<span class="pub-detail-badge bolo">' + t('bolos') + '</span>' +
        '<span class="pub-detail-date">' + formatDate(b.data) + '</span>' +
    '</div>' +
    '<h2>' + esc(tc(b,'titulo')) + '</h2>' +
    '<div class="pub-detail-meta">' +
        (b.hora ? '<div class="pub-detail-meta-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' + esc(b.hora) + '</div>' : '') +
        (b.lugar ? '<div class="pub-detail-meta-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' + esc(b.lugar) + '</div>' : '') +
    '</div>' +
    '<div class="rt-content pub-detail-text">' + sanitizeHtml(tc(b,'descricion')) + '</div>';
    _pubShowDetail(imgHtml, bodyHtml);
}

function _pubShowInstrumento(id) {
    var i = _pubData.instrumentos.find(function(x) { return x.id === id; });
    if (!i) return;
    var iconSrc = i.imaxe ? uploadUrl(i.imaxe) : (_pubInstrumentIcons[i.tipo] || _pubInstrumentIcons['outro']);
    var imgHtml = '<div class="pub-detail-img-wrap pub-detail-img-instrument">' +
        '<img src="' + esc(iconSrc) + '" alt="' + esc(tc(i,'nome')) + '">' +
    '</div>';
    var bodyHtml = '<div class="pub-detail-header">' +
        '<span class="pub-detail-badge instrumento">' + t('instrumento') + '</span>' +
    '</div>' +
    '<h2>' + esc(tc(i,'nome')) + '</h2>' +
    (tc(i,'notas') ? '<p class="pub-detail-subtitle">' + esc(tc(i,'notas')) + '</p>' : '') +
    (tc(i,'descricion') ? '<div class="rt-content pub-detail-text">' + sanitizeHtml(tc(i,'descricion')) + '</div>' : '<p class="text-muted">' + t(('desc_' + (i.tipo || 'outro'))) + '</p>');
    _pubShowDetail(imgHtml, bodyHtml);
}

// Helper: get max_items for a section (0 = unlimited), mobile-aware
function _pubMaxItems(secId) {
    var cfg = _landingCfg[secId];
    if (!cfg) return 0;
    var isMobile = window.innerWidth < 768;
    if (isMobile && cfg.max_items_mobile > 0) return cfg.max_items_mobile;
    return cfg.max_items || 0;
}

// Helper: render a "Ver mais" button if items were truncated
function _pubVerMaisBtn(gridId, secId, total, shown) {
    if (shown >= total) return '';
    return '<div class="pub-ver-mais-wrap" style="text-align:center;margin-top:var(--gap-lg);grid-column:1/-1">' +
        '<button class="btn btn-outline-primary pub-ver-mais-btn" onclick="_pubExpandSection(\'' + gridId + '\',\'' + secId + '\')">' +
        t('ver_mais') + ' (' + (total - shown) + ')' +
        '</button></div>';
}

// Expand section: show all items (remove limit)
function _pubExpandSection(gridId, secId) {
    // Temporarily set max_items to 0 (unlimited) and re-render that section
    if (_landingCfg[secId]) {
        _landingCfg[secId].max_items = 0;
        _landingCfg[secId].max_items_mobile = 0;
    }

    var grid = document.getElementById(gridId);
    if (!grid) return;

    if (secId === 'noticias') {
        var items = _pubData._allNoticias || [];
        grid.innerHTML = items.length ? items.map(function(n) { return _renderNoticiaCard(n); }).join('')
            : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
    } else if (secId === 'bolos') {
        var items = _pubData._allBolosFuturos || [];
        grid.innerHTML = items.length ? items.map(function(b) { return _renderBoloCard(b); }).join('')
            : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
    } else if (secId === 'bolos_pasados') {
        var items = _pubData._allBolosPasados || [];
        grid.innerHTML = items.length ? items.map(function(b) { return _renderBoloCard(b); }).join('')
            : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
    } else if (secId === 'galeria') {
        _pubRenderFotosDestacadas(_pubData._allAlbums || []);
        var items = _pubData._allAlbums || [];
        var _pubIsYT = function(s) { return s && s.indexOf('youtube.com/embed/') !== -1; };
        var _pubYTThumb = function(s) { var m = s.match(/youtube\.com\/embed\/([^?&#]+)/); return m ? 'https://img.youtube.com/vi/' + m[1] + '/hqdefault.jpg' : ''; };
        grid.innerHTML = items.length ? items.map(function(a) {
            var allFotos = (a.fotos || []).map(function(f) { return uploadUrl(typeof f === 'string' ? f : (f.path || '')); });
            var clickAttr = allFotos.length ? ' onclick="openLightbox([' + allFotos.map(function(f) { return "'" + f + "'"; }).join(',') + '], 0)"' : '';
            var coverSrc = a.portada ? uploadUrl(a.portada) : (allFotos.length ? allFotos[0] : '');
            var isYTCover = _pubIsYT(coverSrc);
            var isVidCover = /\.(mp4|webm|ogg)$/i.test(coverSrc);
            var coverHtml = '';
            if (coverSrc && isYTCover) {
                coverHtml = '<div class="pub-card-img" style="position:relative"><img src="' + _pubYTThumb(coverSrc) + '" alt="' + esc(tc(a,'titulo')) + '" loading="lazy"><span class="video-play-icon">&#9654;</span></div>';
            } else if (coverSrc && isVidCover) {
                coverHtml = '<div class="pub-card-img" style="position:relative"><video src="' + coverSrc + '" muted preload="metadata" style="width:100%;height:220px;object-fit:cover"></video><span class="video-play-icon">&#9654;</span></div>';
            } else if (coverSrc) {
                coverHtml = '<div class="pub-card-img"><img src="' + coverSrc + '" alt="' + esc(tc(a,'titulo')) + '" loading="lazy"></div>';
            }
            return '<div class="pub-card" data-type="album"' + clickAttr + '>' +
                coverHtml +
                '<div class="pub-card-body">' +
                    '<h3>' + esc(tc(a,'titulo')) + '</h3>' +
                    '<p>' + esc(tc(a,'descricion')) + '</p>' +
                    '<div class="pub-card-date">' + formatDate(a.data) + ' — ' + allFotos.length + ' ' + t('fotos') + '</div>' +
                '</div></div>';
        }).join('') : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
    } else if (secId === 'instrumentos') {
        _renderInstrumentCards();
    }

    // Re-trigger reveal animations on new cards
    var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.pub-card, .instrument-pub-card').forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        revealObserver.observe(el);
        // Trigger immediately since grid is already visible
        setTimeout(function() { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 50);
    });
}

// Render instrument cards from API data
function _renderInstrumentCards() {
    var grid = document.getElementById('pub-instrumentos-grid');
    if (!grid) return;
    var list = _pubData.instrumentos;
    if (!list.length) {
        grid.innerHTML = '<p class="text-muted" style="text-align:center;grid-column:1/-1">' + t('sen_resultados') + '</p>';
        return;
    }
    var max = _pubMaxItems('instrumentos');
    var shown = (max > 0) ? list.slice(0, max) : list;
    grid.innerHTML = shown.map(function(i) {
        var iconSrc = i.imaxe ? uploadUrl(i.imaxe) : (_pubInstrumentIcons[i.tipo] || _pubInstrumentIcons['outro']);
        var tipoClass = i.tipo || 'outro';
        return '<div class="instrument-pub-card" onclick="_pubShowInstrumento(' + i.id + ')">' +
            '<div class="instrument-pub-icon ' + esc(tipoClass) + '"><img src="' + esc(iconSrc) + '" alt="' + esc(tc(i,'nome')) + '"></div>' +
            '<h3>' + esc(tc(i,'nome')) + '</h3>' +
            '<p>' + esc(truncate(stripHtml(tc(i,'notas') || tc(i,'descricion')), 80)) + '</p>' +
        '</div>';
    }).join('') + _pubVerMaisBtn('pub-instrumentos-grid', 'instrumentos', list.length, shown.length);
}

async function _pubLoadAllComments() {
    try {
        var [cNoticias, cBolos] = await Promise.all([
            api('/comentarios?item_type=noticia').catch(function() { return []; }),
            api('/comentarios?item_type=bolo').catch(function() { return []; }),
        ]);
        _pubComments = { noticia: {}, bolo: {} };
        cNoticias.forEach(function(c) {
            if (!_pubComments.noticia[c.item_id]) _pubComments.noticia[c.item_id] = [];
            _pubComments.noticia[c.item_id].push(c);
        });
        cBolos.forEach(function(c) {
            if (!_pubComments.bolo[c.item_id]) _pubComments.bolo[c.item_id] = [];
            _pubComments.bolo[c.item_id].push(c);
        });
    } catch (e) { /* ignore */ }
}

function _pubToggleComments(type, id, btn) {
    var zone = document.getElementById('comments-' + type + '-' + id);
    if (!zone) return;
    var isOpen = zone.classList.contains('show');
    if (isOpen) {
        zone.classList.remove('show');
    } else {
        zone.classList.add('show');
        _pubRenderComments(type, id);
    }
}

function _pubFormatDatetime(dt) {
    if (!dt) return '';
    var d = dt.substring(0, 10);
    var t = dt.substring(11, 16);
    return formatDate(d) + ' ' + t;
}

function _pubRenderCommentItem(c, type, id, currentUserId, isAdmin, isSocio, canReply) {
    var canDelete = (currentUserId === parseInt(c.autor_id)) || isAdmin || isSocio;
    var html = '<div class="pub-comment">' +
        (c.autor_foto
            ? '<img class="pub-comment-avatar" src="' + esc(uploadUrl(c.autor_foto)) + '" alt="">'
            : '<div class="pub-comment-avatar pub-comment-avatar-ph">' + esc((c.autor_nome || '?').charAt(0).toUpperCase()) + '</div>') +
        '<div class="pub-comment-content">' +
            '<div class="pub-comment-meta"><strong>' + esc(c.autor_nome || '') + '</strong> <span class="pub-comment-date">' + _pubFormatDatetime(c.creado) + '</span></div>' +
            '<div class="pub-comment-text">' + nl2br(c.texto) + '</div>' +
            (canReply ? '<button class="pub-comment-reply-btn" onclick="_pubToggleReplyForm(\'' + type + '\',' + id + ',' + c.id + ')">' + t('responder') + '</button>' : '') +
        '</div>' +
        (canDelete ? '<button class="pub-comment-delete" onclick="_pubDeleteComment(' + c.id + ',\'' + type + '\',' + id + ')" title="' + t('eliminar') + '">&times;</button>' : '') +
    '</div>';
    return html;
}

function _pubRenderComments(type, id) {
    var zone = document.getElementById('comments-' + type + '-' + id);
    if (!zone) return;
    var comments = _pubComments[type] && _pubComments[type][id] ? _pubComments[type][id] : [];
    var currentUserId = AppState.user ? parseInt(AppState.user.id) : 0;
    var isAdmin = AppState.user && AppState.user.role === 'Admin';
    var isSocio = AppState.user && AppState.user.role === 'Socio';
    var isAuthenticated = !!AppState.token;

    // Separate roots and replies
    var roots = comments.filter(function(c) { return !c.parent_id; });
    var replies = comments.filter(function(c) { return !!c.parent_id; });
    var repliesByParent = {};
    replies.forEach(function(r) {
        if (!repliesByParent[r.parent_id]) repliesByParent[r.parent_id] = [];
        repliesByParent[r.parent_id].push(r);
    });

    var html = '<div class="pub-comments-list">';
    if (roots.length === 0 && replies.length === 0) {
        html += '<p class="pub-comment-empty">' + t('sen_resultados') + '</p>';
    } else {
        roots.forEach(function(c) {
            // Root comment — can reply if authenticated
            html += _pubRenderCommentItem(c, type, id, currentUserId, isAdmin, isSocio, isAuthenticated);
            // Reply form placeholder
            html += '<div id="reply-form-' + c.id + '"></div>';
            // Replies to this root
            var childReplies = repliesByParent[c.id] || [];
            childReplies.forEach(function(r) {
                html += '<div class="pub-comment-reply">';
                html += _pubRenderCommentItem(r, type, id, currentUserId, isAdmin, isSocio, false);
                html += '</div>';
            });
        });
    }
    html += '</div>';

    // Formulario principal ou mensaxe de login
    if (AppState.token) {
        html += '<div class="pub-comment-form">' +
            '<textarea id="pub-comment-input-' + type + '-' + id + '" class="form-control" rows="2" placeholder="' + t('escribir_comentario') + '"></textarea>' +
            '<button class="btn btn-primary btn-sm" onclick="_pubPostComment(\'' + type + '\',' + id + ')">' + t('enviar') + '</button>' +
        '</div>';
    } else {
        html += '<div class="pub-comment-login">' +
            '<a href="#" onclick="showOverlay(\'login\');return false">' + t('iniciar_sesion_comentar') + '</a>' +
        '</div>';
    }

    zone.innerHTML = html;
}

function _pubToggleReplyForm(type, itemId, commentId) {
    var container = document.getElementById('reply-form-' + commentId);
    if (!container) return;
    // Toggle: if already has form, remove it
    if (container.innerHTML.trim() !== '') {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = '<div class="pub-comment-reply-form">' +
        '<textarea id="pub-reply-input-' + commentId + '" class="form-control" rows="1" placeholder="' + t('escribir_comentario') + '"></textarea>' +
        '<button class="btn btn-primary btn-sm" onclick="_pubPostReply(\'' + type + '\',' + itemId + ',' + commentId + ')">' + t('enviar') + '</button>' +
        '<button class="btn btn-sm" onclick="document.getElementById(\'reply-form-' + commentId + '\').innerHTML=\'\'">' + t('cancelar') + '</button>' +
    '</div>';
    var ta = document.getElementById('pub-reply-input-' + commentId);
    if (ta) ta.focus();
}

async function _pubPostReply(type, itemId, parentId) {
    var input = document.getElementById('pub-reply-input-' + parentId);
    if (!input) return;
    var texto = input.value.trim();
    if (!texto) return;
    try {
        var result = await api('/comentarios', {
            method: 'POST',
            body: { item_type: type, item_id: itemId, texto: texto, parent_id: parentId }
        });
        // Recargar comentarios deste item
        var updated = await api('/comentarios?item_type=' + type + '&item_id=' + itemId).catch(function() { return []; });
        _pubComments[type][itemId] = updated;
        _pubRenderComments(type, itemId);
        _pubUpdateToggleCount(type, itemId);
        // Toast según moderación
        if (result.estado === 'pendente') {
            toast(t('comentario_pendente_moderacion'), 'info');
        } else {
            toast(t('comentario_engadido'), 'success');
        }
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function _pubPostComment(type, id) {
    var input = document.getElementById('pub-comment-input-' + type + '-' + id);
    if (!input) return;
    var texto = input.value.trim();
    if (!texto) return;
    try {
        var result = await api('/comentarios', {
            method: 'POST',
            body: { item_type: type, item_id: id, texto: texto }
        });
        // Recargar comentarios deste item
        var updated = await api('/comentarios?item_type=' + type + '&item_id=' + id).catch(function() { return []; });
        _pubComments[type][id] = updated;
        _pubRenderComments(type, id);
        // Actualizar contador no toggle
        _pubUpdateToggleCount(type, id);
        // Toast según moderación
        if (result.estado === 'pendente') {
            toast(t('comentario_pendente_moderacion'), 'info');
        } else {
            toast(t('comentario_engadido'), 'success');
        }
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

async function _pubDeleteComment(commentId, type, itemId) {
    if (!confirm(t('confirmar_eliminar'))) return;
    try {
        await api('/comentarios/' + commentId, { method: 'DELETE' });
        // Recargar comentarios deste item
        var updated = await api('/comentarios?item_type=' + type + '&item_id=' + itemId).catch(function() { return []; });
        _pubComments[type][itemId] = updated;
        _pubRenderComments(type, itemId);
        _pubUpdateToggleCount(type, itemId);
        toast(t('comentario_eliminado'), 'success');
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function _pubUpdateToggleCount(type, id) {
    var count = (_pubComments[type][id] || []).length;
    var zone = document.getElementById('comments-' + type + '-' + id);
    if (zone && zone.previousElementSibling && zone.previousElementSibling.classList.contains('pub-comment-toggle')) {
        zone.previousElementSibling.textContent = t('comentarios') + ' (' + count + ')';
    }
}

// ---- Featured photos helper ----
function _pubRenderFotosDestacadas(albums) {
    var container = document.getElementById('pub-fotos-destacadas');
    if (!container) return;
    var favFotos = [];
    (albums || []).forEach(function(a) {
        (a.fotos || []).forEach(function(f) {
            if (f.destacada) {
                favFotos.push({ src: uploadUrl(typeof f === 'string' ? f : (f.path || '')), titulo: f.titulo || '', alt: f.alt || '' });
            }
        });
    });
    if (favFotos.length === 0) {
        container.innerHTML = '';
        return;
    }
    // Shuffle (Fisher-Yates)
    for (var s = favFotos.length - 1; s > 0; s--) {
        var j = Math.floor(Math.random() * (s + 1));
        var tmp = favFotos[s]; favFotos[s] = favFotos[j]; favFotos[j] = tmp;
    }
    // Apply max featured photos limit
    var maxDest = (_landingCfg['galeria'] && _landingCfg['galeria'].max_fotos_destacadas) || 0;
    if (maxDest > 0) favFotos = favFotos.slice(0, maxDest);
    var favUrls = favFotos.map(function(f) { return f.src; });
    container.innerHTML = '<h3 class="pub-fotos-destacadas-title reveal">' + t('fotos_destacadas') + '</h3>' +
        '<div class="pub-fotos-destacadas stagger-children">' +
        favFotos.map(function(f, i) {
            var angle = Math.round(Math.random() * 8 - 4);
            var sizes = ['size-xl','size-sm','size-lg','size-md','size-xl','size-sm','size-wide'];
            var sizeClass = sizes[Math.floor(Math.random() * sizes.length)];
            var frames = ['frame-polaroid','frame-clean','frame-tape','frame-tape2','frame-tape3','frame-pin','frame-pin2','frame-rounded','frame-thin','frame-shadow','frame-vintage','frame-torn'];
            var frameClass = frames[Math.floor(Math.random() * frames.length)];
            var m = Math.round(Math.random() * 24 - 10);
            var y = Math.round(Math.random() * 44 - 22);
            // Generar variables aleatorias para cintas (posicion en borde la fija el CSS)
            var tapeColors = [
                ['#ffebb0c0','#ffe18ca0'],  // amarillo
                ['#c8e1ffb3','#b4d2f58d'],  // azul
                ['#d2ffd2b3','#b9f0b98d']   // verde
            ];
            var tapeVars = '';
            for (var ti = 1; ti <= 3; ti++) {
                tapeVars += ';--t' + ti + '-pos:' + Math.round(Math.random() * 50 + 15) + '%';
                tapeVars += ';--t' + ti + '-rot:' + Math.round(Math.random() * 30 - 15) + 'deg';
                tapeVars += ';--t' + ti + '-w:' + Math.round(Math.random() * 30 + 40) + 'px';
                var col = tapeColors[Math.floor(Math.random() * tapeColors.length)];
                tapeVars += ';--t' + ti + '-ca:' + col[0] + ';--t' + ti + '-cb:' + col[1];
            }
            // Generar color aleatorio para chinchetas
            var pinColors = [
                ['#e84040','#991a1a'],  // rojo
                ['#3b8bdb','#1a5a99'],  // azul
                ['#4caf50','#2e7d32'],  // verde
                ['#ff9800','#e65100'],  // naranja
                ['#e3c300','#b8960a'],  // dorado
                ['#9c27b0','#6a1b80']   // morado
            ];
            var pc = pinColors[Math.floor(Math.random() * pinColors.length)];
            tapeVars += ';--pin-ca:' + pc[0] + ';--pin-cb:' + pc[1];
            var tape3Extra = (frameClass === 'frame-tape3') ? '<span class="tape-3rd"></span>' : '';
            return '<div class="pub-foto-destacada ' + sizeClass + ' ' + frameClass + '" style="--rot:' + angle + 'deg;--m:' + m + 'px;--y:' + y + 'px' + tapeVars + '" onclick="openLightbox([' +
                favUrls.map(function(u) { return "'" + u + "'"; }).join(',') + '],' + i + ')">' +
                tape3Extra +
                '<img src="' + esc(f.src) + '" alt="' + esc(f.alt || f.titulo) + '" loading="lazy">' +
                (f.titulo ? '<span class="pub-foto-titulo">' + esc(f.titulo) + '</span>' : '') +
            '</div>';
        }).join('') + '</div>';
    // Register reveal observer on dynamically created elements
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    container.querySelectorAll('.reveal, .stagger-children').forEach(function(el) {
        obs.observe(el);
    });
}

// Landing config keyed by section id (populated by _applyLandingBackgrounds)
var _landingCfg = {};

// Re-render sections when crossing mobile/desktop breakpoint
var _pubWasMobile = window.innerWidth < 768;
window.addEventListener('resize', (function() {
    var timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            var isMobile = window.innerWidth < 768;
            if (isMobile !== _pubWasMobile) {
                _pubWasMobile = isMobile;
                _pubRefreshLang();
            }
        }, 200);
    };
})());

async function _applyLandingBackgrounds() {
    try {
        var seccions = await api('/landing-seccions').catch(function() { return []; });

        // Reorder sections in DOM based on API order + insert dividers
        var parent = document.getElementById('pub-content');
        if (parent) {
            // Remove any existing dynamic dividers
            parent.querySelectorAll('.geo-divider-dynamic').forEach(function(d) { d.remove(); });
            var footer = parent.querySelector('footer');
            seccions.forEach(function(s) {
                var el = document.querySelector('[data-landing-section="' + s.id + '"]');
                if (!el) return;
                // Hide/show based on activa flag
                if (s.activa === false) { el.style.display = 'none'; return; }
                el.style.display = '';
                if (el !== parent.firstElementChild) parent.insertBefore(el, footer);
                // Insert divider after this section if configured
                if (s.divisor) {
                    var div = document.createElement('div');
                    div.className = 'geo-divider geo-divider-dynamic';
                    el.after(div);
                }
            });
        }

        seccions.forEach(function(s) {
            _landingCfg[s.id] = s;
            var el = document.querySelector('[data-landing-section="' + s.id + '"]');
            if (!el) return;

            // If nothing configured, skip
            if (!s.bg_imaxe && !s.bg_video && !s.bg_cor) return;

            // Background color
            if (s.bg_cor) el.style.backgroundColor = s.bg_cor;

            // Create .landing-bg div
            if (s.bg_imaxe || s.bg_video) {
                var bg = document.createElement('div');
                bg.className = 'landing-bg' + (s.parallax ? ' parallax' : '');

                if (s.bg_video) {
                    var video = document.createElement('video');
                    video.src = uploadUrl(s.bg_video);
                    video.autoplay = true;
                    video.muted = true;
                    video.loop = true;
                    video.playsInline = true;
                    video.setAttribute('playsinline', '');
                    bg.appendChild(video);
                } else if (s.bg_imaxe) {
                    bg.style.backgroundImage = 'url(' + uploadUrl(s.bg_imaxe) + ')';
                    bg.style.backgroundSize = s.bg_size || 'cover';
                    bg.style.backgroundRepeat = s.bg_repeat || 'no-repeat';
                    bg.style.backgroundPosition = s.bg_position || 'center';
                }
                el.prepend(bg);
            }

            // Overlay (for image/video AND color-only)
            if (s.bg_imaxe || s.bg_video || s.bg_cor) {
                var existing = el.querySelector('.landing-overlay');
                if (!existing) {
                    var ov = document.createElement('div');
                    ov.className = 'landing-overlay';
                    ov.style.setProperty('--overlay-opacity', s.overlay_opacidade != null ? s.overlay_opacidade : 0.7);
                    var bgEl = el.querySelector('.landing-bg');
                    if (bgEl) el.insertBefore(ov, bgEl.nextSibling);
                    else el.prepend(ov);
                }
            }

            // For hero: hide original ::before when any custom bg is set
            if (s.id === 'hero' && (s.bg_imaxe || s.bg_video || s.bg_cor)) {
                el.classList.add('hero-custom-bg');
            }
            // For CTA sections: hide ::before/::after when custom bg is set
            if (s.bg_imaxe || s.bg_video || s.bg_cor) {
                var cta = el.querySelector('.cta-section');
                if (cta) cta.classList.add('cta-custom-bg');
            }
        });
    } catch (e) { /* ignore */ }
}

// Re-render all dynamic content when language changes (uses cached data)
async function _pubRefreshLang() {
    // Noticias
    var allNot = _pubData._allNoticias || [];
    var maxNot = _pubMaxItems('noticias');
    var pubNot = (maxNot > 0) ? allNot.slice(0, maxNot) : allNot;
    var ng = document.getElementById('pub-noticias-grid');
    if (ng) {
        ng.innerHTML = pubNot.length ? pubNot.map(_renderNoticiaCard).join('')
            + _pubVerMaisBtn('pub-noticias-grid', 'noticias', allNot.length, pubNot.length)
            : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
    }

    // Bolos futuros
    var allBol = _pubData._allBolosFuturos || [];
    var maxBol = _pubMaxItems('bolos');
    var pubBol = (maxBol > 0) ? allBol.slice(0, maxBol) : allBol;
    var eg = document.getElementById('pub-bolos-grid');
    if (eg) {
        eg.innerHTML = pubBol.length ? pubBol.map(_renderBoloCard).join('')
            + _pubVerMaisBtn('pub-bolos-grid', 'bolos', allBol.length, pubBol.length)
            : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
    }

    // Bolos pasados
    var allPas = _pubData._allBolosPasados || [];
    var maxPas = _pubMaxItems('bolos_pasados');
    var pubPas = (maxPas > 0) ? allPas.slice(0, maxPas) : allPas;
    var pg = document.getElementById('pub-bolos-pasados-grid');
    if (pg) {
        pg.innerHTML = pubPas.length ? pubPas.map(_renderBoloCard).join('')
            + _pubVerMaisBtn('pub-bolos-pasados-grid', 'bolos_pasados', allPas.length, pubPas.length)
            : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
    }

    // Galeria
    var allAlb = _pubData._allAlbums || [];
    _pubRenderFotosDestacadas(allAlb);
    var maxGal = _pubMaxItems('galeria');
    var pubAlb = (maxGal > 0) ? allAlb.slice(0, maxGal) : allAlb;
    var gg = document.getElementById('pub-galeria-grid');
    if (gg) {
        var _pubIsYT = function(s) { return s && s.indexOf('youtube.com/embed/') !== -1; };
        var _pubYTThumb = function(s) { var m = s.match(/youtube\.com\/embed\/([^?&#]+)/); return m ? 'https://img.youtube.com/vi/' + m[1] + '/hqdefault.jpg' : ''; };
        gg.innerHTML = pubAlb.length ? pubAlb.map(function(a) {
            var allFotos = (a.fotos || []).map(function(f) { return uploadUrl(typeof f === 'string' ? f : (f.path || '')); });
            var clickAttr = allFotos.length ? ' onclick="openLightbox([' + allFotos.map(function(f) { return "'" + f + "'"; }).join(',') + '], 0)"' : '';
            var coverSrc = a.portada ? uploadUrl(a.portada) : (allFotos.length ? allFotos[0] : '');
            var isYTCover = _pubIsYT(coverSrc);
            var isVidCover = /\.(mp4|webm|ogg)$/i.test(coverSrc);
            var coverHtml = '';
            if (coverSrc && isYTCover) {
                coverHtml = '<div class="pub-card-img" style="position:relative"><img src="' + _pubYTThumb(coverSrc) + '" alt="' + esc(tc(a,'titulo')) + '" loading="lazy"><span class="video-play-icon">&#9654;</span></div>';
            } else if (coverSrc && isVidCover) {
                coverHtml = '<div class="pub-card-img" style="position:relative"><video src="' + coverSrc + '" muted preload="metadata" style="width:100%;height:220px;object-fit:cover"></video><span class="video-play-icon">&#9654;</span></div>';
            } else if (coverSrc) {
                coverHtml = '<div class="pub-card-img"><img src="' + coverSrc + '" alt="' + esc(tc(a,'titulo')) + '" loading="lazy"></div>';
            }
            return '<div class="pub-card" data-type="album"' + clickAttr + '>' +
                coverHtml +
                '<div class="pub-card-body">' +
                    '<h3>' + esc(tc(a,'titulo')) + '</h3>' +
                    '<p>' + esc(tc(a,'descricion')) + '</p>' +
                    '<div class="pub-card-date">' + formatDate(a.data) + ' — ' + allFotos.length + ' ' + t('fotos') + '</div>' +
                '</div></div>';
        }).join('') + _pubVerMaisBtn('pub-galeria-grid', 'galeria', allAlb.length, pubAlb.length)
            : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
    }

    // Instrumentos
    _renderInstrumentCards();

    // Sobre nos (language-dependent from config)
    try {
        var cfg = await api('/config');
        var key = 'sobre_nos_' + AppState.lang;
        var txt = cfg[key] || cfg['sobre_nos_gl'] || '';
        var sn = document.getElementById('pub-sobre-nos');
        if (sn) sn.innerHTML = nl2br(txt);
        // Re-render legal pages in new language
        _renderLegalPages(cfg);
    } catch (e) {}
}

async function loadPublicContent() {
    try {
        // Apply configurable backgrounds (also loads max_items config)
        await _applyLandingBackgrounds();
        // Cargar todo en paralelo
        const [noticias, bolos, albums, instrumentos] = await Promise.all([
            api('/noticias').catch(() => []),
            api('/bolos').catch(() => []),
            api('/albums').catch(() => []),
            api('/instrumentos').catch(() => []),
        ]);

        // Store globally for modal access
        _pubData.noticias = noticias;
        _pubData.bolos = bolos;
        _pubData.instrumentos = instrumentos;

        // Cargar comentarios antes de renderizar cards
        await _pubLoadAllComments();

        // Noticias publicas
        const allPubNoticias = noticias.filter(n => n.publica || n.estado === 'publicada').reverse();
        _pubData._allNoticias = allPubNoticias;
        var maxNot = _pubMaxItems('noticias');
        const pubNoticias = (maxNot > 0) ? allPubNoticias.slice(0, maxNot) : allPubNoticias;
        const ng = document.getElementById('pub-noticias-grid');
        if (ng) {
            ng.innerHTML = pubNoticias.length ? pubNoticias.map(n => _renderNoticiaCard(n)).join('')
                + _pubVerMaisBtn('pub-noticias-grid', 'noticias', allPubNoticias.length, pubNoticias.length)
                : `<p class="text-muted" style="text-align:center">${t('sen_resultados')}</p>`;
        }

        // Bolos publicos: futuros + pasados
        const hoy = today();
        const allBolosFuturos = bolos.filter(b => b.data >= hoy && b.publica);
        const allBolosPasados = bolos.filter(b => b.data < hoy && b.publica).sort((a,b) => b.data.localeCompare(a.data));
        _pubData._allBolosFuturos = allBolosFuturos;
        _pubData._allBolosPasados = allBolosPasados;

        var maxBol = _pubMaxItems('bolos');
        const pubBolosFuturos = (maxBol > 0) ? allBolosFuturos.slice(0, maxBol) : allBolosFuturos;
        const eg = document.getElementById('pub-bolos-grid');
        if (eg) {
            eg.innerHTML = pubBolosFuturos.length ? pubBolosFuturos.map(b => _renderBoloCard(b)).join('')
                + _pubVerMaisBtn('pub-bolos-grid', 'bolos', allBolosFuturos.length, pubBolosFuturos.length)
                : `<p class="text-muted" style="text-align:center">${t('sen_resultados')}</p>`;
        }

        // Past bolos
        var maxPas = _pubMaxItems('bolos_pasados');
        const pubBolosPasados = (maxPas > 0) ? allBolosPasados.slice(0, maxPas) : allBolosPasados;
        const pg = document.getElementById('pub-bolos-pasados-grid');
        if (pg) {
            pg.innerHTML = pubBolosPasados.length ? pubBolosPasados.map(b => _renderBoloCard(b)).join('')
                + _pubVerMaisBtn('pub-bolos-pasados-grid', 'bolos_pasados', allBolosPasados.length, pubBolosPasados.length)
                : `<p class="text-muted" style="text-align:center">${t('sen_resultados')}</p>`;
        }

        // Galeria con lightbox
        const gg = document.getElementById('pub-galeria-grid');
        if (gg) {
            const _pubIsYT = (s) => s && s.indexOf('youtube.com/embed/') !== -1;
            const _pubYTThumb = (s) => { const m = s.match(/youtube\.com\/embed\/([^?&#]+)/); return m ? 'https://img.youtube.com/vi/' + m[1] + '/hqdefault.jpg' : ''; };

            const allAlbums = albums.slice().reverse();
            _pubData._allAlbums = allAlbums;

            // Featured photos grid above albums
            _pubRenderFotosDestacadas(allAlbums);

            var maxGal = _pubMaxItems('galeria');
            const shownAlbums = (maxGal > 0) ? allAlbums.slice(0, maxGal) : allAlbums;

            gg.innerHTML = shownAlbums.length ? shownAlbums.map(a => {
                const allFotos = (a.fotos || []).map(f => uploadUrl(typeof f === 'string' ? f : (f.path || '')));
                const clickAttr = allFotos.length ? ` onclick="openLightbox([${allFotos.map(f => "'" + f + "'").join(',')}], 0)"` : '';
                const coverSrc = a.portada ? uploadUrl(a.portada) : (allFotos.length ? allFotos[0] : '');
                const isYTCover = _pubIsYT(coverSrc);
                const isVidCover = /\.(mp4|webm|ogg)$/i.test(coverSrc);
                let coverHtml = '';
                if (coverSrc && isYTCover) {
                    coverHtml = `<div class="pub-card-img" style="position:relative"><img src="${_pubYTThumb(coverSrc)}" alt="${esc(tc(a,'titulo'))}" loading="lazy"><span class="video-play-icon">&#9654;</span></div>`;
                } else if (coverSrc && isVidCover) {
                    coverHtml = `<div class="pub-card-img" style="position:relative"><video src="${coverSrc}" muted preload="metadata" style="width:100%;height:220px;object-fit:cover"></video><span class="video-play-icon">&#9654;</span></div>`;
                } else if (coverSrc) {
                    coverHtml = `<div class="pub-card-img"><img src="${coverSrc}" alt="${esc(tc(a,'titulo'))}" loading="lazy"></div>`;
                }
                return `
                <div class="pub-card" data-type="album"${clickAttr}>
                    ${coverHtml}
                    <div class="pub-card-body">
                        <h3>${esc(tc(a,'titulo'))}</h3>
                        <p>${esc(tc(a,'descricion'))}</p>
                        <div class="pub-card-date">${formatDate(a.data)} — ${allFotos.length} ${t('fotos')}</div>
                    </div>
                </div>
            `}).join('') + _pubVerMaisBtn('pub-galeria-grid', 'galeria', allAlbums.length, shownAlbums.length)
                : `<p class="text-muted" style="text-align:center">${t('sen_resultados')}</p>`;
        }

        // Instrumentos (dynamic from API)
        _renderInstrumentCards();

        // Sobre nos + Contacto
        try {
            const cfg = await api('/config');
            const key = 'sobre_nos_' + AppState.lang;
            const txt = cfg[key] || cfg['sobre_nos_gl'] || '';
            const sn = document.getElementById('pub-sobre-nos');
            if (sn) sn.innerHTML = nl2br(txt);

            // Legal pages
            _renderLegalPages(cfg);

            // Contacto: email y telefono from config
            var emailEl = document.getElementById('contacto-email');
            if (emailEl && cfg.email_dest) {
                emailEl.innerHTML = '<a href="mailto:' + esc(cfg.email_dest) + '">' + esc(cfg.email_dest) + '</a>';
            } else if (emailEl) {
                document.getElementById('contacto-email-row').style.display = 'none';
            }
            var telEl = document.getElementById('contacto-tel');
            if (telEl && cfg.fiscal_telefono) {
                telEl.textContent = cfg.fiscal_telefono;
            } else if (telEl) {
                document.getElementById('contacto-tel-row').style.display = 'none';
            }
        } catch (e) { /* ignore */ }

    } catch (err) {
        console.error('Error loading public content:', err);
    }
}

// ---- Legal pages rendering ----
function _renderLegalPages(cfg) {
    var titular = cfg.fiscal_nome || cfg.nome_asociacion || 'Levada Arraiana';
    var nif = cfg.fiscal_nif || '';
    var enderezo = cfg.fiscal_enderezo || '';
    var email = cfg.email_dest || '';

    // Aviso Legal
    var aviso = document.getElementById('legal-aviso-content');
    if (aviso) {
        aviso.innerHTML =
            '<p>' + t('legal_aviso_p1') + '</p>' +
            '<p><strong>' + t('legal_titular') + ':</strong> ' + esc(titular) + '</p>' +
            (nif ? '<p><strong>' + t('legal_nif') + ':</strong> ' + esc(nif) + '</p>' : '') +
            (enderezo ? '<p><strong>' + t('legal_enderezo') + ':</strong> ' + esc(enderezo) + '</p>' : '') +
            (email ? '<p><strong>' + t('legal_email_contacto') + ':</strong> ' + esc(email) + '</p>' : '') +
            '<h3>' + t('legal_prop_intelectual') + '</h3>' +
            '<p>' + t('legal_aviso_prop_p1') + '</p>' +
            '<h3>' + t('legal_lei_aplicable') + '</h3>' +
            '<p>' + t('legal_aviso_lei_p1') + '</p>';
    }

    // Politica de Privacidade
    var priv = document.getElementById('legal-privacidade-content');
    if (priv) {
        priv.innerHTML =
            '<p>' + t('legal_privacidade_intro') + '</p>' +
            '<h3>' + t('legal_titular') + '</h3>' +
            '<p><strong>' + esc(titular) + '</strong>' +
            (nif ? ' — ' + t('legal_nif') + ': ' + esc(nif) : '') +
            (email ? '<br>' + t('legal_email_contacto') + ': ' + esc(email) : '') + '</p>' +
            '<h3>' + t('legal_finalidade') + '</h3>' +
            '<p>' + t('legal_privacidade_finalidade_p1') + '</p>' +
            '<h3>' + t('legal_datos_recollidos') + '</h3>' +
            '<p>' + t('legal_privacidade_datos_p1') + '</p>' +
            '<h3>' + t('legal_base_legal') + '</h3>' +
            '<p>' + t('legal_privacidade_base_p1') + '</p>' +
            '<h3>' + t('legal_dereitos') + '</h3>' +
            '<p>' + t('legal_privacidade_dereitos_p1') + '</p>' +
            '<h3>' + t('legal_retencion') + '</h3>' +
            '<p>' + t('legal_privacidade_retencion_p1') + '</p>';
    }

    // Politica de Cookies
    var cook = document.getElementById('legal-cookies-content');
    if (cook) {
        cook.innerHTML =
            '<p>' + t('legal_cookies_intro') + '</p>' +
            '<h3>' + t('legal_que_almacenamos') + '</h3>' +
            '<ul>' + t('legal_cookies_list') + '</ul>' +
            '<h3>' + t('legal_terceiros') + '</h3>' +
            '<p>' + t('legal_cookies_terceiros_p1') + '</p>';
    }
}

// ---- Cookie banner ----
function initCookieBanner() {
    if (localStorage.getItem('cookieConsent')) return;
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = '';
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
}

// ---- Contacto form ----
function _enviarContacto(e) {
    e.preventDefault();
    var btn = document.getElementById('contacto-submit-btn');
    var oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '...';

    var data = {
        nome: document.getElementById('contacto-nome').value.trim(),
        email: document.getElementById('contacto-form-email').value.trim(),
        asunto: document.getElementById('contacto-asunto').value.trim(),
        mensaxe: document.getElementById('contacto-mensaxe').value.trim()
    };

    api('/contacto', { method: 'POST', body: data })
        .then(function() {
            document.getElementById('contacto-form').reset();
            toast(t('mensaxe_enviada'), 'success');
        })
        .catch(function(err) {
            toast(err.message || 'Error', 'error');
        })
        .finally(function() {
            btn.disabled = false;
            btn.textContent = oldText;
        });
    return false;
}
