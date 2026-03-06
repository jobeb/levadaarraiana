<?php
/**
 * Funcións auxiliares — Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'helpers.php') {
    http_response_code(403);
    exit('Forbidden');
}

// ---- Fix MySQL rows (JSON decode, booleans, decimals) ----
function fix_row($row, $json_cols = [], $bool_cols = [], $decimal_cols = []) {
    if (!$row) return null;
    foreach ($json_cols as $col) {
        if (isset($row[$col]) && is_string($row[$col])) {
            $row[$col] = json_decode($row[$col], true) ?? [];
        } elseif (!isset($row[$col]) || $row[$col] === null) {
            $row[$col] = [];
        }
    }
    foreach ($bool_cols as $col) {
        if (array_key_exists($col, $row)) {
            $row[$col] = (bool)$row[$col];
        }
    }
    foreach ($decimal_cols as $col) {
        if (array_key_exists($col, $row) && $row[$col] !== null) {
            $v = (float)$row[$col];
            $row[$col] = ($v == (int)$v) ? (int)$v : $v;
        }
    }
    return $row;
}

function fix_rows($rows, $json_cols = [], $bool_cols = [], $decimal_cols = []) {
    return array_map(function($r) use ($json_cols, $bool_cols, $decimal_cols) {
        return fix_row($r, $json_cols, $bool_cols, $decimal_cols);
    }, $rows);
}

// ---- File validation ----
function validate_file_extension($filename, $type = 'document') {
    $allowed = [
        'image'    => ['jpg','jpeg','png','gif','webp'],
        'document' => ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','odt','ods'],
        'video'    => ['mp4','webm','ogg','mov','avi'],
        'audio'    => ['mp3','wav','ogg','m4a','webm'],
        'media'    => ['mp3','wav','ogg','m4a','mp4','webm','mov'],
        'attachment'=> ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','odt','ods','jpg','jpeg','png','gif','webp','mp3','wav','ogg','m4a','webm','mp4'],
    ];
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $list = $allowed[$type] ?? $allowed['document'];
    if (!in_array($ext, $list)) {
        send_error('Tipo de arquivo non permitido: .' . $ext, 'erro_tipo_arquivo', 400);
    }
}

// ---- File helpers ----
function save_base64_file($subdir, $filename, $b64data) {
    $decoded = base64_decode($b64data);
    if (strlen($decoded) > 50 * 1024 * 1024) {
        send_error('Arquivo demasiado grande (máx 50MB)', 'erro_arquivo_grande', 400);
    }
    $dir = UPLOADS_DIR . '/' . $subdir;
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $path = $dir . '/' . $filename;
    file_put_contents($path, $decoded);
    return $subdir . '/' . $filename;
}

function process_and_save_image($subdir, $filename, $b64data, $preset = 'default') {
    $presets = [
        'avatar'  => ['max_w' => 200,  'max_h' => 200,  'quality' => 80],
        'cover'   => ['max_w' => 1200, 'max_h' => 800,  'quality' => 85],
        'gallery' => ['max_w' => 1920, 'max_h' => 1920, 'quality' => 88],
        'default' => ['max_w' => 1200, 'max_h' => 1200, 'quality' => 82],
    ];
    $p = $presets[$preset] ?? $presets['default'];

    $raw = base64_decode($b64data);
    $src = @imagecreatefromstring($raw);
    if (!$src) {
        return save_base64_file($subdir, $filename, $b64data);
    }

    // Fix EXIF orientation (photos from phones)
    $tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'exif_' . uniqid() . '.jpg';
    file_put_contents($tmp, $raw);
    $exif = @exif_read_data($tmp);
    @unlink($tmp);
    $orientation = 1;
    if ($exif) {
        $orientation = $exif['Orientation'] ?? $exif['orientation'] ?? 1;
    }
    switch ($orientation) {
        case 2: imageflip($src, IMG_FLIP_HORIZONTAL); break;
        case 3: $src = imagerotate($src, 180, 0); break;
        case 4: imageflip($src, IMG_FLIP_VERTICAL); break;
        case 5: imageflip($src, IMG_FLIP_HORIZONTAL); $src = imagerotate($src, 270, 0); break;
        case 6: $src = imagerotate($src, 270, 0); break;
        case 7: imageflip($src, IMG_FLIP_HORIZONTAL); $src = imagerotate($src, 90, 0); break;
        case 8: $src = imagerotate($src, 90, 0); break;
    }

    $w = imagesx($src);
    $h = imagesy($src);
    if ($w > $p['max_w'] || $h > $p['max_h']) {
        $ratio = min($p['max_w'] / $w, $p['max_h'] / $h);
        $nw = (int)($w * $ratio);
        $nh = (int)($h * $ratio);
        $dst = imagecreatetruecolor($nw, $nh);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($src);
        $src = $dst;
    }

    $filename = preg_replace('/\.[^.]+$/', '.jpg', $filename);
    $dir = UPLOADS_DIR . '/' . $subdir;
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $path = $dir . '/' . $filename;
    imagejpeg($src, $path, $p['quality']);
    imagedestroy($src);

    return $subdir . '/' . $filename;
}

function ensure_dirs() {
    $subs = ['fotos','noticias','albums','bolos','propostas',
             'actas','documentos','votacions',
             'ensaios','instrumentos','repertorio','repertorio/medios','landing'];
    if (!is_dir(UPLOADS_DIR)) mkdir(UPLOADS_DIR, 0755, true);
    foreach ($subs as $s) {
        $d = UPLOADS_DIR . '/' . $s;
        if (!is_dir($d)) mkdir($d, 0755, true);
    }
}

// ---- Audit log ----
function get_current_user_safe() {
    $header = $_SERVER['HTTP_AUTHORIZATION']
           ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
           ?? '';
    if (empty($header) && function_exists('getallheaders')) {
        $all = getallheaders();
        $header = $all['Authorization'] ?? $all['authorization'] ?? '';
    }
    if (strpos($header, 'Bearer ') !== 0) return null;
    $token = substr($header, 7);
    if (empty($token)) return null;
    $stmt = get_db()->prepare("SELECT id, nome_completo, username FROM usuarios WHERE session_token = ?");
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

function audit_log($accion, $modulo, $registro_id = null, $detalles = null) {
    try {
        $user = get_current_user_safe();
        $uid = $user ? (int)$user['id'] : null;
        $nome = $user ? ($user['nome_completo'] ?: $user['username']) : '';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $stmt = get_db()->prepare(
            "INSERT INTO audit_log (usuario_id, usuario_nome, accion, modulo, registro_id, detalles, ip)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$uid, $nome, $accion, $modulo, $registro_id, $detalles, $ip]);
    } catch (Exception $e) {
        error_log('Audit log error: ' . $e->getMessage());
    }
}

// ---- Multi-instrument enrichment ----
function enrich_user_instruments(&$user, $db) {
    if (!$user || empty($user['id'])) return;
    $stmt = $db->prepare(
        "SELECT ui.instrumento_id, ui.orde, i.nome, i.imaxe
         FROM usuario_instrumentos ui
         JOIN instrumentos i ON i.id = ui.instrumento_id
         WHERE ui.usuario_id = ?
         ORDER BY ui.orde ASC"
    );
    $stmt->execute([$user['id']]);
    $user['instrumentos'] = $stmt->fetchAll();
    // Sync legacy field with principal (orde=1)
    if (!empty($user['instrumentos'])) {
        $user['instrumento'] = $user['instrumentos'][0]['nome'];
    }
}

function enrich_users_instruments(&$users, $db) {
    if (empty($users)) return;
    $ids = array_unique(array_column($users, 'id'));
    if (empty($ids)) return;
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $db->prepare(
        "SELECT ui.usuario_id, ui.instrumento_id, ui.orde, i.nome, i.imaxe
         FROM usuario_instrumentos ui
         JOIN instrumentos i ON i.id = ui.instrumento_id
         WHERE ui.usuario_id IN ($placeholders)
         ORDER BY ui.usuario_id, ui.orde ASC"
    );
    $stmt->execute(array_values($ids));
    $rows = $stmt->fetchAll();
    $map = [];
    foreach ($rows as $r) {
        $map[$r['usuario_id']][] = $r;
    }
    foreach ($users as &$u) {
        $u['instrumentos'] = $map[$u['id']] ?? [];
        if (!empty($u['instrumentos'])) {
            $u['instrumento'] = $u['instrumentos'][0]['nome'];
        }
    }
    unset($u);
}

// ---- Email header injection prevention ----
function sanitize_email_header($value) {
    return preg_replace('/[\r\n]/', '', $value);
}

// ---- Email dispatcher (php_mail or smtp based on config) ----
function send_email($to, $subject, $body, $replyTo = null) {
    $cfg = get_db()->query("SELECT * FROM config WHERE id = 1")->fetch();
    if (!$cfg) return false;

    $from = sanitize_email_header(($cfg['smtp_from'] ?: $cfg['smtp_user']) ?: 'noreply@levadaarraiana.gal');
    $metodo = $cfg['email_metodo'] ?? 'php_mail';
    $subject = sanitize_email_header($subject);

    if ($metodo === 'smtp') {
        try {
            smtp_send($cfg, $to, $subject, $body);
            return true;
        } catch (Exception $e) {
            error_log("SMTP send failed: " . $e->getMessage());
            return false;
        }
    }

    // Default: PHP mail()
    $headers  = "From: $from\r\n";
    if ($replyTo) $headers .= "Reply-To: " . sanitize_email_header($replyTo) . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    return @mail(sanitize_email_header($to), $subject, $body, $headers);
}

// ---- SMTP helper ----
function smtp_send($cfg, $to, $subject, $body, $attachments = []) {
    $host = $cfg['smtp_host'];
    $port = (int)($cfg['smtp_port'] ?? 587);
    $user = $cfg['smtp_user'];
    $pass = $cfg['smtp_pass'];
    $from = sanitize_email_header($cfg['smtp_from'] ?: $user);
    $to = sanitize_email_header($to);
    $subject = sanitize_email_header($subject);
    $cifrado = $cfg['smtp_cifrado'] ?? 'TLS';

    $prefix = ($cifrado === 'SSL') ? 'ssl://' : '';
    $fp = @fsockopen($prefix . $host, $port, $errno, $errstr, 30);
    if (!$fp) throw new Exception("SMTP connect failed: $errstr");

    $read  = function() use ($fp) {
        $resp = '';
        while ($line = fgets($fp, 512)) {
            $resp .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $resp;
    };
    $write = function($cmd) use ($fp) { fputs($fp, $cmd . "\r\n"); };

    $read();
    $write("EHLO " . gethostname());
    $read();

    if ($cifrado === 'TLS') {
        $write("STARTTLS");
        $read();
        stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT);
        $write("EHLO " . gethostname());
        $read();
    }

    $write("AUTH LOGIN");
    $read();
    $write(base64_encode($user));
    $read();
    $write(base64_encode($pass));
    $resp = $read();
    if (substr($resp, 0, 3) !== '235') throw new Exception("SMTP auth failed");

    $write("MAIL FROM:<$from>");
    $read();
    $write("RCPT TO:<$to>");
    $read();
    $write("DATA");
    $read();

    $boundary = md5(uniqid(time()));
    $headers  = "From: $from\r\n";
    $headers .= "To: $to\r\n";
    $headers .= "Subject: $subject\r\n";
    $headers .= "MIME-Version: 1.0\r\n";

    if (!empty($attachments)) {
        $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
        fputs($fp, $headers . "\r\n");
        fputs($fp, "--$boundary\r\n");
        fputs($fp, "Content-Type: text/plain; charset=UTF-8\r\n\r\n");
        fputs($fp, $body . "\r\n");
        foreach ($attachments as $att) {
            fputs($fp, "--$boundary\r\n");
            fputs($fp, "Content-Type: application/octet-stream\r\n");
            fputs($fp, "Content-Transfer-Encoding: base64\r\n");
            $nome = $att['nome'] ?? 'adxunto';
            fputs($fp, "Content-Disposition: attachment; filename=\"$nome\"\r\n\r\n");
            fputs($fp, chunk_split($att['data']) . "\r\n");
        }
        fputs($fp, "--$boundary--\r\n");
    } else {
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        fputs($fp, $headers . "\r\n");
        fputs($fp, $body . "\r\n");
    }

    fputs($fp, ".\r\n");
    $read();
    $write("QUIT");
    fclose($fp);
}
