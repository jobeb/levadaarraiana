<?php
/**
 * Middleware — Auth server-side + CORS
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'middleware.php') {
    http_response_code(403);
    exit('Forbidden');
}

// ---- CORS ----
function cors() {
    $allowed = ['https://levada.fordema.es', 'http://localhost', 'http://localhost:80'];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header('Access-Control-Allow-Origin: https://levada.fordema.es');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// ---- Validate session token → returns socio row or null ----
function get_session_user() {
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

    $stmt = get_db()->prepare(
        "SELECT * FROM usuarios WHERE session_token = ? AND session_expires > NOW() AND estado != 'Desactivado'"
    );
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    return $user ?: null;
}

// ---- Require authenticated user ----
function require_auth() {
    $user = get_session_user();
    if (!$user) {
        send_error('Non autorizado', 'erro_non_autorizado', 401);
    }
    return $user;
}

// ---- Require Admin role ----
function require_admin() {
    $user = require_auth();
    if ($user['role'] !== 'Admin') {
        send_error('Acceso denegado', 'erro_acceso_denegado', 403);
    }
    return $user;
}

// ---- Require Socio or Admin role ----
function require_socio() {
    $user = require_auth();
    if (!in_array($user['role'], ['Admin', 'Socio'])) {
        send_error('Acceso denegado', 'erro_acceso_denegado', 403);
    }
    return $user;
}

// ---- Rate limiting (file-based) ----
function rate_limit($key, $max = 5, $window = 300) {
    $dir = sys_get_temp_dir() . '/levada_rate/';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $file = $dir . md5($key) . '.json';
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    if (!is_array($data)) $data = [];
    $now = time();
    $data = array_filter($data, function($t) use ($now, $window) { return $t > $now - $window; });
    if (count($data) >= $max) {
        send_error('Demasiados intentos. Agarda uns minutos.', 'erro_rate_limit', 429);
    }
    $data[] = $now;
    file_put_contents($file, json_encode(array_values($data)));
}
