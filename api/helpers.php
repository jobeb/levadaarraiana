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

// ---- File helpers ----
function save_base64_file($subdir, $filename, $b64data) {
    $dir = UPLOADS_DIR . '/' . $subdir;
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $path = $dir . '/' . $filename;
    file_put_contents($path, base64_decode($b64data));
    return $subdir . '/' . $filename;
}

function ensure_dirs() {
    $subs = ['fotos','noticias','albums','bolos','propostas',
             'actas','documentos','gastos','mensaxes',
             'ensaios','instrumentos','repertorio'];
    if (!is_dir(UPLOADS_DIR)) mkdir(UPLOADS_DIR, 0755, true);
    foreach ($subs as $s) {
        $d = UPLOADS_DIR . '/' . $s;
        if (!is_dir($d)) mkdir($d, 0755, true);
    }
}

// ---- SMTP helper ----
function smtp_send($cfg, $to, $subject, $body, $attachments = []) {
    $host = $cfg['smtp_host'];
    $port = (int)($cfg['smtp_port'] ?? 587);
    $user = $cfg['smtp_user'];
    $pass = $cfg['smtp_pass'];
    $from = $cfg['smtp_from'] ?: $user;
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
