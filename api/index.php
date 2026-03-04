<?php
/**
 * Router API — Levada Arraiana
 * Todas as peticions /api/* chegan aquí vía .htaccess
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/middleware.php';

cors();
ensure_dirs();

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize: remove base path to get just /api/... (auto-detect base)
$scriptDir = dirname($_SERVER['SCRIPT_NAME']); // e.g. /Levadaarraiana/api or /levada/api
if ($scriptDir !== '/' && strpos($uri, $scriptDir) === 0) {
    $uri = substr($uri, strlen($scriptDir));
}
$uri = '/' . ltrim($uri, '/');

$input = null;
if (in_array($method, ['POST', 'PUT'])) {
    $input = read_body();
}

try {
    // Auth routes
    if ($uri === '/login' || $uri === '/logout' || $uri === '/register' || $uri === '/forgot-password' || $uri === '/reset-password' || $uri === '/consent' || $uri === '/check-username' || $uri === '/check-email') {
        require __DIR__ . '/modules/auth.php';
        handle_auth($uri, $method, $input);
    }

    // Map URI to module
    $routes = [
        '/arquivos'      => 'arquivos',
        '/usuarios'      => 'usuarios',
        '/noticias'      => 'noticias',
        '/bolos'         => 'bolos',
        '/albums'        => 'albums',
        '/documentos'    => 'documentos',
        '/actas'         => 'actas',
        '/propostas'     => 'propostas',
        '/votacions'     => 'votacions',
        '/votos'         => 'votacions',

        '/config'        => 'configuracion',
        '/ensaios'       => 'ensaios',
        '/asistencia'    => 'ensaios',
        '/instrumentos'  => 'instrumentos',
        '/repertorio'    => 'repertorio',

        '/comentarios'   => 'comentarios',
        '/landing-seccions' => 'landing',
        '/solicitude'    => 'solicitude',
        '/solicitudes-bolos' => 'solicitudes_bolos',
        '/contacto'      => 'contacto',
        '/backup'        => 'backup',
        '/youtube'       => 'youtube',
        '/auditoria'     => 'auditoria',
    ];

    // Find matching route (longest prefix match)
    $matched = null;
    $matchLen = 0;
    foreach ($routes as $prefix => $module) {
        if (strpos($uri, $prefix) === 0 && strlen($prefix) > $matchLen) {
            $matched  = $module;
            $matchLen = strlen($prefix);
        }
    }

    if ($matched) {
        require __DIR__ . '/modules/' . $matched . '.php';
        $fnName = 'handle_' . $matched;
        $fnName($method, $uri, $input);
    }

    send_error('Ruta non atopada: ' . $uri, 'erro_non_atopado', 404);

} catch (PDOException $e) {
    error_log('PDO Error: ' . $e->getMessage());
    send_error('Erro de base de datos', 'erro_base_datos', 500);
} catch (Exception $e) {
    send_json(['error' => $e->getMessage()], 500);
}
