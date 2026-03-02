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
    header('Access-Control-Allow-Origin: *');
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
        send_json(['error' => 'Non autorizado'], 401);
    }
    return $user;
}

// ---- Require Admin role ----
function require_admin() {
    $user = require_auth();
    if ($user['role'] !== 'Admin') {
        send_json(['error' => 'Acceso denegado'], 403);
    }
    return $user;
}

// ---- Require Socio or Admin role ----
function require_socio() {
    $user = require_auth();
    if (!in_array($user['role'], ['Admin', 'Socio'])) {
        send_json(['error' => 'Acceso denegado'], 403);
    }
    return $user;
}
