/**
 * Public — Carga contido na landing page (sen gate)
 */

async function loadPublicContent() {
    try {
        const [noticias, bolos, albums] = await Promise.all([
            api('/noticias').catch(() => []),
            api('/bolos').catch(() => []),
            api('/albums').catch(() => []),
        ]);

        // Noticias públicas
        const pubNoticias = noticias.filter(n => n.publica || n.estado === 'publicada').slice(-6).reverse();
        const ng = document.getElementById('pub-noticias-grid');
        if (ng) {
            ng.innerHTML = pubNoticias.length ? pubNoticias.map(n => `
                <div class="pub-card"${n.imaxes && n.imaxes.length ? ` onclick="openLightbox([${n.imaxes.map(i => "'" + uploadUrl(i) + "'").join(',')}], 0)"` : ''}>
                    ${n.imaxes && n.imaxes.length ? `<img src="${uploadUrl(n.imaxes[0])}" alt="">` : ''}
                    <div class="pub-card-body">
                        <h3>${esc(n.titulo)}</h3>
                        <p>${truncate(n.texto, 150)}</p>
                        <div class="pub-card-date">${formatDate(n.data)}</div>
                    </div>
                </div>
            `).join('') : `<p class="text-muted">${t('sen_resultados')}</p>`;
        }

        // Bolos públicos futuros
        const hoy = today();
        const pubBolos = bolos.filter(b => b.data >= hoy && b.publica).slice(0, 6);
        const eg = document.getElementById('pub-bolos-grid');
        if (eg) {
            eg.innerHTML = pubBolos.length ? pubBolos.map(b => `
                <div class="pub-card"${b.imaxe ? ` onclick="openLightbox(['${uploadUrl(b.imaxe)}'], 0)"` : ''}>
                    ${b.imaxe ? `<img src="${uploadUrl(b.imaxe)}" alt="">` : ''}
                    <div class="pub-card-body">
                        <h3>${esc(b.titulo)}</h3>
                        <p>${esc(b.descricion)}</p>
                        <div class="pub-card-date">${formatDate(b.data)} ${esc(b.hora || '')} — ${esc(b.lugar || '')}</div>
                    </div>
                </div>
            `).join('') : `<p class="text-muted">${t('sen_resultados')}</p>`;
        }

        // Galería con lightbox
        const gg = document.getElementById('pub-galeria-grid');
        if (gg) {
            const _pubIsYT = (s) => s && s.indexOf('youtube.com/embed/') !== -1;
            const _pubYTThumb = (s) => { const m = s.match(/youtube\.com\/embed\/([^?&#]+)/); return m ? 'https://img.youtube.com/vi/' + m[1] + '/hqdefault.jpg' : ''; };

            gg.innerHTML = albums.length ? albums.slice(-6).reverse().map(a => {
                const allFotos = (a.fotos || []).map(f => uploadUrl(typeof f === 'string' ? f : (f.path || '')));
                const clickAttr = allFotos.length ? ` onclick="openLightbox([${allFotos.map(f => "'" + f + "'").join(',')}], 0)"` : '';
                const coverSrc = a.portada ? uploadUrl(a.portada) : (allFotos.length ? allFotos[0] : '');
                const isYTCover = _pubIsYT(coverSrc);
                const isVidCover = /\.(mp4|webm|ogg)$/i.test(coverSrc);
                let coverHtml = '';
                if (coverSrc && isYTCover) {
                    coverHtml = `<div style="position:relative"><img src="${_pubYTThumb(coverSrc)}" alt="" style="width:100%;height:200px;object-fit:cover"><span class="video-play-icon">&#9654;</span></div>`;
                } else if (coverSrc && isVidCover) {
                    coverHtml = `<div style="position:relative"><video src="${coverSrc}" muted preload="metadata" style="width:100%;height:200px;object-fit:cover"></video><span class="video-play-icon">&#9654;</span></div>`;
                } else if (coverSrc) {
                    coverHtml = `<img src="${coverSrc}" alt="">`;
                }
                return `
                <div class="pub-card"${clickAttr}>
                    ${coverHtml}
                    <div class="pub-card-body">
                        <h3>${esc(a.titulo)}</h3>
                        <p>${esc(a.descricion || '')}</p>
                        <div class="pub-card-date">${formatDate(a.data)} — ${allFotos.length} ${t('fotos')}</div>
                    </div>
                </div>
            `}).join('') : `<p class="text-muted">${t('sen_resultados')}</p>`;
        }

        // Sobre nos
        try {
            const cfg = await api('/config');
            const key = 'sobre_nos_' + AppState.lang;
            const txt = cfg[key] || cfg['sobre_nos_gl'] || '';
            const sn = document.getElementById('pub-sobre-nos');
            if (sn) sn.innerHTML = nl2br(txt);
        } catch { /* ignore */ }

    } catch (err) {
        console.error('Error loading public content:', err);
    }
}
