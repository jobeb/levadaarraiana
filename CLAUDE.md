# Levada Arraiana — Regras de desenvolvemento

## Videos
- **Todos os videos que se suban deben ir a YouTube** via `POST /youtube/upload`
- Nunca gardar arquivos de video localmente no servidor
- Patrón JS: `fileToBase64(file)` → `api('/youtube/upload', { title, video_data: b64.data, video_ext })` → gardar `youtube_url` na BD
- A API de YouTube devolve: `{ youtube_id, youtube_url: 'https://www.youtube.com/embed/ID' }`
- Para amosar videos de YouTube en HTML: usar `<iframe>` con `allowfullscreen`
- **Excepción:** `bg_video` en `landing_seccions` (videos de fondo decorativos que precisan `<video autoplay muted loop>`)
