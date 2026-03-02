<?php
/**
 * Módulo YouTube — OAuth flow + upload de vídeos
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'youtube.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_youtube($method, $uri, $input) {
    // GET /youtube/callback — Google redirixe aquí (público, sen auth)
    if ($method === 'GET' && preg_match('#/youtube/callback#', $uri)) {
        _youtube_callback();
    }

    // GET /youtube/auth — Xera URL de autorización OAuth
    if ($method === 'GET' && preg_match('#/youtube/auth$#', $uri)) {
        require_admin();
        _youtube_auth();
    }

    // GET /youtube/status — Estado da conexión
    if ($method === 'GET' && preg_match('#/youtube/status$#', $uri)) {
        require_admin();
        _youtube_status();
    }

    // POST /youtube/upload — Sube vídeo a YouTube
    if ($method === 'POST' && preg_match('#/youtube/upload$#', $uri)) {
        require_socio();
        _youtube_upload($input);
    }

    // DELETE /youtube/disconnect — Desconectar (borrar tokens)
    if ($method === 'DELETE' && preg_match('#/youtube/disconnect$#', $uri)) {
        require_admin();
        _youtube_disconnect();
    }

    send_json(['error' => 'Ruta YouTube non atopada'], 404);
}

// ---- GET /youtube/auth ----
function _youtube_auth() {
    $db = get_db();
    $cfg = $db->query("SELECT youtube_client_id, youtube_client_secret FROM config WHERE id = 1")->fetch();

    if (empty($cfg['youtube_client_id']) || empty($cfg['youtube_client_secret'])) {
        send_json(['error' => 'Configura primeiro o Client ID e Client Secret de YouTube'], 400);
    }

    $redirect_uri = _youtube_redirect_uri();

    $params = http_build_query([
        'client_id'     => $cfg['youtube_client_id'],
        'redirect_uri'  => $redirect_uri,
        'response_type' => 'code',
        'scope'         => 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
        'access_type'   => 'offline',
        'prompt'        => 'consent',
    ]);

    send_json(['url' => 'https://accounts.google.com/o/oauth2/v2/auth?' . $params]);
}

// ---- GET /youtube/callback ----
function _youtube_callback() {
    $code = $_GET['code'] ?? '';
    $error = $_GET['error'] ?? '';

    if ($error || empty($code)) {
        header('Location: ../../app.html#configuracion?yt=error');
        exit;
    }

    $db = get_db();
    $cfg = $db->query("SELECT youtube_client_id, youtube_client_secret FROM config WHERE id = 1")->fetch();

    if (empty($cfg['youtube_client_id'])) {
        header('Location: ../../app.html#configuracion?yt=error');
        exit;
    }

    $redirect_uri = _youtube_redirect_uri();

    // Intercambiar code por tokens
    $tokenData = _youtube_http_post('https://oauth2.googleapis.com/token', [
        'code'          => $code,
        'client_id'     => $cfg['youtube_client_id'],
        'client_secret' => $cfg['youtube_client_secret'],
        'redirect_uri'  => $redirect_uri,
        'grant_type'    => 'authorization_code',
    ]);

    if (empty($tokenData['access_token'])) {
        header('Location: ../../app.html#configuracion?yt=error');
        exit;
    }

    $expires_at = date('Y-m-d H:i:s', time() + ($tokenData['expires_in'] ?? 3600));

    // Obter nome do canal
    $channelName = _youtube_get_channel_name($tokenData['access_token']);

    // Gardar tokens
    $stmt = $db->prepare(
        "REPLACE INTO youtube_tokens (id, access_token, refresh_token, expires_at, channel_name)
         VALUES (1, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $tokenData['access_token'],
        $tokenData['refresh_token'] ?? '',
        $expires_at,
        $channelName,
    ]);

    header('Location: ../../app.html#configuracion?yt=ok');
    exit;
}

// ---- GET /youtube/status ----
function _youtube_status() {
    $db = get_db();
    $row = $db->query("SELECT * FROM youtube_tokens WHERE id = 1")->fetch();

    if (!$row || empty($row['refresh_token'])) {
        send_json(['connected' => false]);
    }

    $expired = $row['expires_at'] && strtotime($row['expires_at']) < time();

    send_json([
        'connected'    => true,
        'channel_name' => $row['channel_name'] ?? '',
        'expired'      => $expired,
    ]);
}

// ---- POST /youtube/upload ----
function _youtube_upload($input) {
    $title       = $input['title'] ?? 'Levada Arraiana';
    $description = $input['description'] ?? '';
    $video_data  = $input['video_data'] ?? '';
    $video_ext   = $input['video_ext'] ?? 'mp4';

    if (empty($video_data)) {
        send_json(['error' => 'Falta video_data'], 400);
    }

    $db = get_db();
    $accessToken = _youtube_get_valid_token($db);

    if (!$accessToken) {
        send_json(['error' => 'YouTube non conectado ou token inválido'], 401);
    }

    // Decodificar vídeo
    $videoBytes = base64_decode($video_data);
    if ($videoBytes === false) {
        send_json(['error' => 'Datos de vídeo inválidos'], 400);
    }

    $mimeTypes = [
        'mp4'  => 'video/mp4',
        'webm' => 'video/webm',
        'ogg'  => 'video/ogg',
        'mov'  => 'video/quicktime',
        'avi'  => 'video/x-msvideo',
    ];
    $contentType = $mimeTypes[strtolower($video_ext)] ?? 'video/mp4';

    // Step 1: Iniciar resumable upload
    $metadata = json_encode([
        'snippet' => [
            'title'       => $title,
            'description' => $description,
            'tags'        => ['Levada Arraiana', 'batucada'],
            'categoryId'  => '10', // Music
        ],
        'status' => [
            'privacyStatus' => 'unlisted',
        ],
    ]);

    $initHeaders = [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json; charset=UTF-8',
        'X-Upload-Content-Length: ' . strlen($videoBytes),
        'X-Upload-Content-Type: ' . $contentType,
    ];

    $ch = curl_init('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $metadata,
        CURLOPT_HTTPHEADER     => $initHeaders,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER         => true,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $initResponse = curl_exec($ch);
    $initHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($initHttpCode !== 200) {
        send_json(['error' => 'Erro ao iniciar upload a YouTube', 'detail' => $initResponse], 500);
    }

    // Extraer upload URI da cabeceira Location
    $uploadUri = '';
    if (preg_match('/^Location:\s*(.+)/mi', $initResponse, $m)) {
        $uploadUri = trim($m[1]);
    }
    if (empty($uploadUri)) {
        send_json(['error' => 'Non se obtivo URI de upload'], 500);
    }

    // Step 2: Subir o vídeo
    $ch = curl_init($uploadUri);
    curl_setopt_array($ch, [
        CURLOPT_PUT            => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: ' . $contentType,
            'Content-Length: ' . strlen($videoBytes),
        ],
        CURLOPT_POSTFIELDS     => $videoBytes,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $uploadResponse = curl_exec($ch);
    $uploadHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($uploadHttpCode < 200 || $uploadHttpCode >= 300) {
        send_json(['error' => 'Erro ao subir vídeo a YouTube', 'detail' => $uploadResponse], 500);
    }

    $result = json_decode($uploadResponse, true);
    $videoId = $result['id'] ?? '';

    if (empty($videoId)) {
        send_json(['error' => 'Non se obtivo ID do vídeo'], 500);
    }

    send_json([
        'youtube_id'  => $videoId,
        'youtube_url' => 'https://www.youtube.com/embed/' . $videoId,
    ]);
}

// ---- DELETE /youtube/disconnect ----
function _youtube_disconnect() {
    $db = get_db();
    $db->exec("DELETE FROM youtube_tokens WHERE id = 1");
    send_json(['ok' => true]);
}

// ======== Helpers ========

function _youtube_redirect_uri() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $protocol . '://' . $host . '/Levadaarraiana/api/youtube/callback';
}

function _youtube_get_valid_token($db) {
    $row = $db->query("SELECT * FROM youtube_tokens WHERE id = 1")->fetch();
    if (!$row || empty($row['access_token'])) return null;

    // Se o token expirou, refrescar
    if ($row['expires_at'] && strtotime($row['expires_at']) < time()) {
        if (empty($row['refresh_token'])) return null;
        return _youtube_refresh_token($db, $row['refresh_token']);
    }

    return $row['access_token'];
}

function _youtube_refresh_token($db, $refreshToken) {
    $cfg = $db->query("SELECT youtube_client_id, youtube_client_secret FROM config WHERE id = 1")->fetch();

    $tokenData = _youtube_http_post('https://oauth2.googleapis.com/token', [
        'client_id'     => $cfg['youtube_client_id'],
        'client_secret' => $cfg['youtube_client_secret'],
        'refresh_token' => $refreshToken,
        'grant_type'    => 'refresh_token',
    ]);

    if (empty($tokenData['access_token'])) return null;

    $expires_at = date('Y-m-d H:i:s', time() + ($tokenData['expires_in'] ?? 3600));

    $stmt = $db->prepare(
        "UPDATE youtube_tokens SET access_token = ?, expires_at = ? WHERE id = 1"
    );
    $stmt->execute([$tokenData['access_token'], $expires_at]);

    return $tokenData['access_token'];
}

function _youtube_get_channel_name($accessToken) {
    $ch = curl_init('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true');
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $accessToken],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($resp, true);
    return $data['items'][0]['snippet']['title'] ?? '';
}

function _youtube_http_post($url, $params) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($params),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
    return json_decode($resp, true) ?? [];
}
