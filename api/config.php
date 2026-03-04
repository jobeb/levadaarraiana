<?php
/**
 * Configuración da base de datos e funcións auxiliares
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'config.php') {
    http_response_code(403);
    exit('Forbidden');
}

// ---- Base de datos (localhost XAMPP) ----
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'levadaarraiana');
define('DB_USER', 'root');
define('DB_PASS', '');

// ---- Uploads ----
define('UPLOADS_DIR', dirname(__DIR__) . '/uploads');

// ---- Session ----
define('SESSION_DURATION', 7 * 86400); // 7 days

// ---- Conexión BD ----
function get_db() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

// ---- JSON response ----
function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// ---- JSON error response with i18n key ----
function send_error($message, $error_key, $status = 400) {
    send_json(['error' => $message, 'error_key' => $error_key], $status);
}

// ---- Read JSON body ----
function read_body() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ---- Passwords (PBKDF2) ----
function hash_password($plain) {
    $salt = bin2hex(random_bytes(16));
    $dk   = hash_pbkdf2('sha256', $plain, $salt, 260000, 64, false);
    return $salt . '$' . $dk;
}

function verify_password($plain, $stored) {
    if (strpos($stored, '$') === false) return false;
    list($salt, $dk_hex) = explode('$', $stored, 2);
    $dk = hash_pbkdf2('sha256', $plain, $salt, 260000, strlen($dk_hex), false);
    return hash_equals($dk, $dk_hex);
}

