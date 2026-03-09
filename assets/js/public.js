/**
 * Public — Carga contido na landing page (sen gate)
 */

// Cached public data
var _pubData = { noticias: [], bolos: [], instrumentos: [] };
// Currently playing instrument audio
var _pubInstrAudio = null;
var _pubInstrAudioId = null;
// Cache de comentarios: { noticia: { id: [comments] }, bolo: { id: [comments] } }
var _pubComments = { noticia: {}, bolo: {} };

// Countdown interval
var _pubCountdownInterval = null;

// Skeleton loader helper
function _pubShowSkeletons() {
    var skeletonCard = '<div class="skeleton-card skeleton"><div class="skeleton-img skeleton"></div><div class="skeleton-line skeleton"></div><div class="skeleton-line short skeleton"></div><div class="skeleton-line xs skeleton"></div></div>';
    var grids = ['pub-noticias-grid', 'pub-bolos-grid', 'pub-bolos-pasados-grid', 'pub-galeria-grid'];
    grids.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && !el.children.length) {
            el.innerHTML = skeletonCard + skeletonCard + skeletonCard;
        }
    });
}

// Social share buttons
function _pubShareHtml(title, url) {
    var encoded = encodeURIComponent(title + ' — ' + url);
    var encodedUrl = encodeURIComponent(url);
    return '<div class="pub-share-btns">' +
        '<button class="pub-share-btn whatsapp" onclick="event.stopPropagation();window.open(\'https://api.whatsapp.com/send?text=' + encoded + '\',\'_blank\')" title="WhatsApp">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.513 5.838L0 24l6.336-1.478A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.98 0-3.82-.558-5.39-1.524l-.387-.229-3.758.877.92-3.634-.253-.4A9.698 9.698 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75z"/></svg>' +
        '</button>' +
        '<button class="pub-share-btn facebook" onclick="event.stopPropagation();window.open(\'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '\',\'_blank\')" title="Facebook">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
        '</button>' +
        '<button class="pub-share-btn twitter" onclick="event.stopPropagation();window.open(\'https://twitter.com/intent/tweet?text=' + encoded + '\',\'_blank\')" title="X/Twitter">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
        '</button>' +
        '<button class="pub-share-btn instagram" onclick="event.stopPropagation();navigator.clipboard.writeText(\'' + url.replace(/'/g, "\\'") + '\').then(function(){toast(t(\'enlace_copiado\'),\'success\')})" title="Instagram">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>' +
        '</button>' +
    '</div>';
}

// Countdown for next event
function _pubStartCountdown(bolos) {
    if (_pubCountdownInterval) clearInterval(_pubCountdownInterval);
    var now = new Date();
    var next = null;
    for (var i = 0; i < bolos.length; i++) {
        var b = bolos[i];
        if (!b.publica) continue;
        var d = new Date(b.data + 'T' + (b.hora || '00:00') + ':00');
        if (d > now) {
            if (!next || d < next.date) next = { date: d, bolo: b };
        }
    }
    var el = document.getElementById('pub-countdown');
    if (!el || !next) {
        if (el) el.style.display = 'none';
        return;
    }
    el.style.display = '';
    function update() {
        var diff = next.date - new Date();
        if (diff <= 0) {
            el.style.display = 'none';
            clearInterval(_pubCountdownInterval);
            return;
        }
        var days = Math.floor(diff / 86400000);
        var hours = Math.floor((diff % 86400000) / 3600000);
        var mins = Math.floor((diff % 3600000) / 60000);
        el.innerHTML = '<h3 style="text-align:center;margin-bottom:8px;color:var(--text)">' + esc(tc(next.bolo,'titulo')) + '</h3>' +
            '<div class="pub-countdown">' +
            '<div class="pub-countdown-unit"><div class="pub-countdown-num">' + days + '</div><div class="pub-countdown-label">' + t('dias') + '</div></div>' +
            '<div class="pub-countdown-unit"><div class="pub-countdown-num">' + hours + '</div><div class="pub-countdown-label">' + t('horas') + '</div></div>' +
            '<div class="pub-countdown-unit"><div class="pub-countdown-num">' + mins + '</div><div class="pub-countdown-label">' + t('minutos') + '</div></div>' +
            '</div>';
    }
    update();
    _pubCountdownInterval = setInterval(update, 60000);
}

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
    var shareUrl = location.origin + location.pathname + '#bolos-pub';
    return `<div class="pub-card" data-type="bolo" onclick="_pubShowBolo(${b.id})">
        ${imgHtml}
        <div class="pub-card-body">
            <h3>${esc(tc(b,'titulo'))}</h3>
            <p>${esc(truncate(stripHtml(tc(b,'descricion')), 120))}</p>
            <div class="pub-card-date">${formatDate(b.data)} ${esc(b.hora || '')} — ${esc(b.lugar || '')}</div>
            ${_pubShareHtml(tc(b,'titulo'), shareUrl)}
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
    var shareUrl = location.origin + location.pathname + '#noticias-pub';
    return `<div class="pub-card" data-type="noticia" onclick="_pubShowNoticia(${n.id})">
        ${imgHtml}
        <div class="pub-card-body">
            <h3>${esc(tc(n,'titulo'))}</h3>
            <p>${esc(truncate(stripHtml(tc(n,'texto')), 150))}</p>
            <div class="pub-card-date">${formatDate(n.data)}</div>
            ${_pubShareHtml(tc(n,'titulo'), shareUrl)}
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

function _pubMediaPlayer(path) {
    if (!path) return '';
    if (path.indexOf('youtube.com/embed/') !== -1) {
        return '<iframe src="' + esc(path) + '?rel=0&modestbranding=1" class="instrumento-media-player instrumento-yt-embed" allowfullscreen></iframe>';
    }
    var url = uploadUrl(path);
    var ext = (path.split('.').pop() || '').toLowerCase();
    if (['mp4','webm','mov'].indexOf(ext) !== -1) {
        return '<video controls class="instrumento-media-player"><source src="' + esc(url) + '"></video>';
    }
    return '<audio controls class="instrumento-media-player"><source src="' + esc(url) + '"></audio>';
}

var _instrPlaySvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>';
var _instrPauseSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>';

function _instrBtnIcon(card, playing) {
    if (!card) return;
    var btn = card.querySelector('.instr-audio-btn');
    if (btn) btn.innerHTML = playing ? _instrPauseSvg : _instrPlaySvg;
}

function _pubPlayInstrAudio(id, event) {
    if (event) event.stopPropagation();
    var i = _pubData.instrumentos.find(function(x) { return x.id == id; });
    if (!i || !i.audio_mostra) return;

    var card = document.getElementById('instr-card-' + id);

    // If already playing this instrument, toggle pause/play
    if (_pubInstrAudioId == id && _pubInstrAudio) {
        if (_pubInstrAudio.paused) {
            _pubInstrAudio.play();
            if (card) { card.classList.add('instr-playing'); _instrBtnIcon(card, true); }
        } else {
            _pubInstrAudio.pause();
            if (card) { card.classList.remove('instr-playing'); _instrBtnIcon(card, false); }
        }
        return;
    }

    // Stop any previously playing audio
    if (_pubInstrAudio) {
        _pubInstrAudio.pause();
        var oldCard = document.getElementById('instr-card-' + _pubInstrAudioId);
        if (oldCard) { oldCard.classList.remove('instr-playing'); _instrBtnIcon(oldCard, false); }
        _pubInstrAudio = null;
        _pubInstrAudioId = null;
    }

    var url = uploadUrl(i.audio_mostra);
    _pubInstrAudio = new Audio(url);
    _pubInstrAudioId = id;

    _pubInstrAudio.addEventListener('ended', function() {
        if (card) { card.classList.remove('instr-playing'); _instrBtnIcon(card, false); }
        _pubInstrAudio = null;
        _pubInstrAudioId = null;
    });

    _pubInstrAudio.play();
    if (card) { card.classList.add('instr-playing'); _instrBtnIcon(card, true); }
}

function _pubShowInstrumento(id) {
    var i = _pubData.instrumentos.find(function(x) { return x.id == id; });
    if (!i) return;
    var iconSrc = i.imaxe ? uploadUrl(i.imaxe) : (_pubInstrumentIcons[i.tipo] || _pubInstrumentIcons['outro']);
    var imgHtml = '<div class="pub-detail-img-wrap pub-detail-img-instrument">' +
        '<img src="' + esc(iconSrc) + '" alt="' + esc(tc(i,'nome')) + '">' +
    '</div>';
    var audioHtml = i.audio_mostra ? '<div style="margin-top:12px"><label style="font-size:0.85rem;color:var(--text-dim);display:block;margin-bottom:4px">' + t('audio_mostra') + '</label>' + _pubMediaPlayer(i.audio_mostra) + '</div>' : '';
    var bodyHtml = '<div class="pub-detail-header">' +
        '<span class="pub-detail-badge instrumento">' + t('instrumento') + '</span>' +
    '</div>' +
    '<h2>' + esc(tc(i,'nome')) + '</h2>' +
    (tc(i,'notas') ? '<p class="pub-detail-subtitle">' + esc(tc(i,'notas')) + '</p>' : '') +
    (tc(i,'descricion') ? '<div class="rt-content pub-detail-text">' + sanitizeHtml(tc(i,'descricion')) + '</div>' : '<p class="text-muted">' + t(('desc_' + (i.tipo || 'outro'))) + '</p>') +
    audioHtml;
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

// Helper: apply card_width percentage to a grid
function _pubApplyCardWidth(gridId, secId) {
    var grid = document.getElementById(gridId);
    if (!grid) return;
    var cfg = _landingCfg[secId];
    var w = cfg && cfg.card_width ? cfg.card_width : 0;
    if (w > 0 && w <= 100) {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(calc(' + w + '% - 24px), 1fr))';
    } else {
        grid.style.gridTemplateColumns = '';
    }
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
        var isYoutube = i.audio_mostra && i.audio_mostra.indexOf('youtube.com/embed/') !== -1;
        var isAudio = i.audio_mostra && !isYoutube;
        var playBtn = isAudio ? '<button class="instr-audio-btn" onclick="event.stopPropagation();_pubPlayInstrAudio(' + i.id + ',event)" title="' + t('escoitar') + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg></button>' : '';
        return '<div class="instrument-pub-card" id="instr-card-' + i.id + '" onclick="_pubShowInstrumento(' + i.id + ')">' +
            '<div class="instrument-pub-icon ' + esc(tipoClass) + '"><img src="' + esc(iconSrc) + '" alt="' + esc(tc(i,'nome')) + '"></div>' +
            '<h3>' + esc(tc(i,'nome')) + '</h3>' +
            '<p>' + esc(truncate(stripHtml(tc(i,'notas') || tc(i,'descricion')), 80)) + '</p>' +
            playBtn +
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
    var canDelete = currentUserId && (currentUserId === parseInt(c.autor_id));
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

    var COMMENTS_INITIAL = 3;
    var zoneKey = type + '-' + id;
    var expanded = zone.dataset.expanded === '1';

    var html = '<div class="pub-comments-list">';
    if (roots.length === 0 && replies.length === 0) {
        html += '<p class="pub-comment-empty">' + t('sen_resultados') + '</p>';
    } else {
        var visibleRoots = expanded ? roots : roots.slice(0, COMMENTS_INITIAL);
        visibleRoots.forEach(function(c) {
            html += _pubRenderCommentItem(c, type, id, currentUserId, isAdmin, isSocio, isAuthenticated);
            html += '<div id="reply-form-' + c.id + '"></div>';
            var childReplies = repliesByParent[c.id] || [];
            childReplies.forEach(function(r) {
                html += '<div class="pub-comment-reply">';
                html += _pubRenderCommentItem(r, type, id, currentUserId, isAdmin, isSocio, false);
                html += '</div>';
            });
        });
        if (!expanded && roots.length > COMMENTS_INITIAL) {
            var remaining = roots.length - COMMENTS_INITIAL;
            html += '<button class="pub-comments-more" onclick="this.closest(\'.pub-comments-zone\').dataset.expanded=\'1\';_pubRenderComments(\'' + type + '\',' + id + ')">' + t('ver_mais_comentarios') + ' (' + remaining + ')</button>';
        }
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
    if (!(await confirmAction(t('confirmar_eliminar')))) return;
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
        _pubApplyCardWidth('pub-noticias-grid', 'noticias');
    }

    // Bolos futuros
    var allBol = _pubData._allBolosFuturos || [];
    var maxBol = _pubMaxItems('bolos');
    var pubBol = (maxBol > 0) ? allBol.slice(0, maxBol) : allBol;
    var eg = document.getElementById('pub-bolos-grid');
    if (eg) {
        eg.innerHTML = pubBol.length ? pubBol.map(_renderBoloCard).join('')
            + _pubVerMaisBtn('pub-bolos-grid', 'bolos', allBol.length, pubBol.length)
            : '';
        _pubApplyCardWidth('pub-bolos-grid', 'bolos');
    }
    var bolosSec = document.querySelector('[data-landing-section="bolos"]');
    if (bolosSec) bolosSec.style.display = allBol.length ? '' : 'none';

    // Bolos pasados
    var allPas = _pubData._allBolosPasados || [];
    var maxPas = _pubMaxItems('bolos_pasados');
    var pubPas = (maxPas > 0) ? allPas.slice(0, maxPas) : allPas;
    var pg = document.getElementById('pub-bolos-pasados-grid');
    if (pg) {
        pg.innerHTML = pubPas.length ? pubPas.map(_renderBoloCard).join('')
            + _pubVerMaisBtn('pub-bolos-pasados-grid', 'bolos_pasados', allPas.length, pubPas.length)
            : '<p class="text-muted" style="text-align:center">' + t('sen_resultados') + '</p>';
        _pubApplyCardWidth('pub-bolos-pasados-grid', 'bolos_pasados');
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
        _pubApplyCardWidth('pub-galeria-grid', 'galeria');
    }

    // Instrumentos
    _renderInstrumentCards();
    _pubApplyCardWidth('pub-instrumentos-grid', 'instrumentos');

    // Sobre nos (language-dependent from config)
    try {
        var cfg = await api('/config');
        var key = 'sobre_nos_' + AppState.lang;
        var txt = cfg[key] || cfg['sobre_nos_gl'] || '';
        var sn = document.getElementById('pub-sobre-nos');
        if (sn) sn.innerHTML = sanitizeHtml(txt);
        // Re-render legal pages in new language
        _renderLegalPages(cfg);
    } catch (e) {}
}

async function loadPublicContent() {
    try {
        // Show skeleton loaders while data loads
        _pubShowSkeletons();

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
            _pubApplyCardWidth('pub-noticias-grid', 'noticias');
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
                : '';
            _pubApplyCardWidth('pub-bolos-grid', 'bolos');
        }
        var bolosSec = document.querySelector('[data-landing-section="bolos"]');
        if (bolosSec) bolosSec.style.display = allBolosFuturos.length ? '' : 'none';

        // Start countdown for next public bolo
        _pubStartCountdown(bolos);

        // Past bolos
        var maxPas = _pubMaxItems('bolos_pasados');
        const pubBolosPasados = (maxPas > 0) ? allBolosPasados.slice(0, maxPas) : allBolosPasados;
        const pg = document.getElementById('pub-bolos-pasados-grid');
        if (pg) {
            pg.innerHTML = pubBolosPasados.length ? pubBolosPasados.map(b => _renderBoloCard(b)).join('')
                + _pubVerMaisBtn('pub-bolos-pasados-grid', 'bolos_pasados', allBolosPasados.length, pubBolosPasados.length)
                : `<p class="text-muted" style="text-align:center">${t('sen_resultados')}</p>`;
            _pubApplyCardWidth('pub-bolos-pasados-grid', 'bolos_pasados');
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
            _pubApplyCardWidth('pub-galeria-grid', 'galeria');
        }

        // Instrumentos (dynamic from API)
        _renderInstrumentCards();
        _pubApplyCardWidth('pub-instrumentos-grid', 'instrumentos');

        // Sobre nos + Contacto
        try {
            const cfg = await api('/config');
            const key = 'sobre_nos_' + AppState.lang;
            const txt = cfg[key] || cfg['sobre_nos_gl'] || '';
            const sn = document.getElementById('pub-sobre-nos');
            if (sn) sn.innerHTML = sanitizeHtml(txt);

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
            '<h3>' + t('legal_titular') + '</h3>' +
            '<p><strong>' + esc(titular) + '</strong>' +
            (nif ? '<br>' + t('legal_nif') + ': ' + esc(nif) : '') +
            (enderezo ? '<br>' + t('legal_enderezo') + ': ' + esc(enderezo) : '') +
            (email ? '<br>' + t('legal_email_contacto') + ': ' + esc(email) : '') + '</p>' +
            '<h3>' + t('legal_aviso_obxecto') + '</h3>' +
            '<p>' + t('legal_aviso_obxecto_p1') + '</p>' +
            '<h3>' + t('legal_aviso_condicions') + '</h3>' +
            '<p>' + t('legal_aviso_condicions_p1') + '</p>' +
            '<h3>' + t('legal_aviso_responsabilidade') + '</h3>' +
            '<p>' + t('legal_aviso_responsabilidade_p1') + '</p>' +
            '<h3>' + t('legal_prop_intelectual') + '</h3>' +
            '<p>' + t('legal_aviso_prop_p1') + '</p>' +
            '<h3>' + t('legal_lei_aplicable') + '</h3>' +
            '<p>' + t('legal_aviso_lei_p1') + '</p>' +
            '<h3>' + t('legal_aviso_modificacions') + '</h3>' +
            '<p>' + t('legal_aviso_modificacions_p1') + '</p>';
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
            '<h3>' + t('legal_cesion') + '</h3>' +
            '<p>' + t('legal_privacidade_cesion_p1') + '</p>' +
            '<h3>' + t('legal_seguridade') + '</h3>' +
            '<p>' + t('legal_privacidade_seguridade_p1') + '</p>' +
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
            '<h3>' + t('legal_cookies_diferenza') + '</h3>' +
            '<p>' + t('legal_cookies_diferenza_p1') + '</p>' +
            '<h3>' + t('legal_que_almacenamos') + '</h3>' +
            '<ul>' + t('legal_cookies_list') + '</ul>' +
            '<h3>' + t('legal_cookies_como_borrar') + '</h3>' +
            '<p>' + t('legal_cookies_como_borrar_p1') + '</p>' +
            '<h3>' + t('legal_terceiros') + '</h3>' +
            '<p>' + t('legal_cookies_terceiros_p1') + '</p>' +
            '<h3>' + t('legal_cookies_actualizacion') + '</h3>' +
            '<p>' + t('legal_cookies_actualizacion_p1') + '</p>';
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

// ---- Newsletter subscribe ----
async function _pubNewsletter() {
    var email = document.getElementById('newsletter-email').value.trim();
    var msg = document.getElementById('newsletter-msg');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.className = 'newsletter-msg error';
        msg.textContent = t('email_invalido');
        return;
    }
    try {
        await api('/newsletter', { method: 'POST', body: { email: email } });
        msg.className = 'newsletter-msg success';
        msg.textContent = t('newsletter_ok');
        document.getElementById('newsletter-email').value = '';
        setTimeout(function() { msg.textContent = ''; msg.className = 'newsletter-msg'; }, 5000);
    } catch (e) {
        msg.className = 'newsletter-msg error';
        msg.textContent = e.message || 'Error';
    }
}

// ---- Form validation (real-time) ----
function _initFormValidation() {
    var forms = document.querySelectorAll('#contacto-form, #form-unirse, #form-presuposto, .auth-box');
    forms.forEach(function(form) {
        var inputs = form.querySelectorAll('input[required], textarea[required], input[type="email"]');
        inputs.forEach(function(inp) {
            // Add error message element if not present
            if (!inp.parentElement.querySelector('.field-error')) {
                var err = document.createElement('div');
                err.className = 'field-error';
                inp.parentElement.appendChild(err);
            }
            inp.addEventListener('blur', function() { _validateField(inp); });
            inp.addEventListener('input', function() {
                if (inp.classList.contains('invalid')) _validateField(inp);
            });
        });
    });
}

function _validateField(inp) {
    var err = inp.parentElement.querySelector('.field-error');
    var val = inp.value.trim();
    var valid = true;
    var msg = '';

    if (inp.required && !val) {
        valid = false;
        msg = t('campo_obrigatorio');
    } else if (inp.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        valid = false;
        msg = t('email_invalido');
    } else if (inp.minLength && inp.minLength > 0 && val.length < inp.minLength) {
        valid = false;
        msg = t('min_caracteres').replace('{n}', inp.minLength);
    }

    inp.classList.toggle('valid', valid && val.length > 0);
    inp.classList.toggle('invalid', !valid);
    if (err) {
        err.textContent = msg;
        err.classList.toggle('visible', !valid);
    }
    return valid;
}

// ---- Contacto form ----
function _enviarContacto(e) {
    e.preventDefault();
    var lopdCb = document.getElementById('contacto-lopd-check');
    if (lopdCb && !lopdCb.checked) {
        toast(t('lopd_obrigatorio'), 'error');
        return false;
    }
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
