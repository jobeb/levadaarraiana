<?php
/**
 * Seed Drive — Inserta álbums, actas e documentos dende arquivos copiados.
 * Require admin autenticado (Bearer token).
 * Idempotente: non duplica se xa existe un rexistro co mesmo titulo.
 *
 * GET /api/seed_drive.php  (con Authorization: Bearer <token>)
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

cors();
$user = require_admin();

$db = get_db();
$result = ['albums' => [], 'actas' => [], 'documentos' => []];
$uploadsDir = dirname(__DIR__) . '/uploads';

// ---- Helper: check if title exists in table ----
function title_exists($db, $table, $titulo) {
    $stmt = $db->prepare("SELECT id FROM `$table` WHERE titulo = ? LIMIT 1");
    $stmt->execute([$titulo]);
    return $stmt->fetch() ? true : false;
}

// ---- Helper: list files in directory sorted ----
function list_files($dir) {
    if (!is_dir($dir)) return [];
    $files = [];
    foreach (scandir($dir) as $f) {
        if ($f === '.' || $f === '..') continue;
        $files[] = $f;
    }
    sort($files);
    return $files;
}

// ==================================================================
// 1. ALBUMS
// ==================================================================
$albumsDef = [
    [
        'titulo'    => 'Estrea da Levada na Gojam 2022',
        'descricion'=> 'Primeira actuación da Levada Arraiana no festival Gojam de Goián, xuño 2022.',
        'data'      => '2022-06-26',
        'dir'       => 'albums/estrea-gojam-2022',
    ],
    [
        'titulo'    => 'Semana Kultural Estás 2022',
        'descricion'=> 'Actuación na Semana Kultural de Estás, verán 2022.',
        'data'      => '2022-08-24',
        'dir'       => 'albums/semana-kultural-2022',
    ],
    [
        'titulo'    => 'Instagram Levada Arraiana',
        'descricion'=> 'Fotos e vídeos publicados no Instagram oficial da Levada Arraiana.',
        'data'      => '2025-01-01',
        'dir'       => 'albums/instagram',
    ],
];

foreach ($albumsDef as $aDef) {
    if (title_exists($db, 'albums', $aDef['titulo'])) {
        $result['albums'][] = $aDef['titulo'] . ' (xa existe)';
        continue;
    }

    $dirPath = $uploadsDir . '/' . $aDef['dir'];
    $files = list_files($dirPath);
    if (empty($files)) {
        $result['albums'][] = $aDef['titulo'] . ' (sen arquivos)';
        continue;
    }

    $fotoPaths = array_map(function($f) use ($aDef) {
        return $aDef['dir'] . '/' . $f;
    }, $files);

    $portada = $fotoPaths[0];

    $stmt = $db->prepare(
        "INSERT INTO albums (titulo, descricion, data, portada, fotos) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $aDef['titulo'],
        $aDef['descricion'],
        $aDef['data'],
        $portada,
        json_encode($fotoPaths, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
    $result['albums'][] = $aDef['titulo'] . ' (' . count($fotoPaths) . ' arquivos)';
}

// ==================================================================
// 2. ACTAS
// ==================================================================
$actasDef = [
    [
        'titulo'  => 'Acta asemblea 18 de xullo de 2022',
        'data'    => '2022-07-18',
        'arquivo' => 'actas/levadad-18-xullo-2022.pdf',
    ],
    [
        'titulo'  => 'Acta asemblea 30 de setembro de 2024',
        'data'    => '2024-09-30',
        'arquivo' => 'actas/acta-30-setembro-2024.pdf',
    ],
    [
        'titulo'  => 'Acta asemblea 17 de novembro de 2025',
        'data'    => '2025-11-17',
        'arquivo' => 'actas/acta-17-novembro-2025.pdf',
    ],
    [
        'titulo'  => 'Acta extraordinaria (B) 17 de novembro de 2025',
        'data'    => '2025-11-17',
        'arquivo' => 'actas/acta-b-17-novembro-2025.pdf',
    ],
];

foreach ($actasDef as $act) {
    if (title_exists($db, 'actas', $act['titulo'])) {
        $result['actas'][] = $act['titulo'] . ' (xa existe)';
        continue;
    }

    $fullPath = $uploadsDir . '/' . $act['arquivo'];
    if (!file_exists($fullPath)) {
        $result['actas'][] = $act['titulo'] . ' (arquivo non atopado)';
        continue;
    }

    $stmt = $db->prepare(
        "INSERT INTO actas (titulo, data, contido, estado, arquivos, creado) VALUES (?, ?, '', 'aprobada', ?, NOW())"
    );
    $stmt->execute([
        $act['titulo'],
        $act['data'],
        json_encode([$act['arquivo']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
    $result['actas'][] = $act['titulo'];
}

// ==================================================================
// 3. DOCUMENTOS
// ==================================================================
$docsDef = [
    ['titulo' => 'Estatutos Levada Arraiana',               'arquivo' => 'documentos/estatutos.pdf',                        'vis' => 'todos'],
    ['titulo' => 'Acta Constitucional Levada Arraiana',      'arquivo' => 'documentos/acta-constitucional.pdf',              'vis' => 'todos'],
    ['titulo' => 'Resolución Constitución Asociación',       'arquivo' => 'documentos/resolucion-constitucion.pdf',          'vis' => 'todos'],
    ['titulo' => 'Dilixencia Constitución Levada Arraiana',  'arquivo' => 'documentos/dilixencia-constitucion.pdf',          'vis' => 'todos'],
    ['titulo' => 'Estatutos — Compulsa 2024',               'arquivo' => 'documentos/estatutos-compulsa-2024.pdf',          'vis' => 'todos'],
    ['titulo' => 'Acta Constitucional — Compulsa 2024',     'arquivo' => 'documentos/acta-constitucional-compulsa-2024.pdf','vis' => 'todos'],
    ['titulo' => 'Anexo II — Compulsa 2024',                'arquivo' => 'documentos/anexo-ii-compulsa-2024.pdf',           'vis' => 'todos'],
    ['titulo' => 'Solicitude PR308A (nov 2024)',             'arquivo' => 'documentos/solicitud-pr308a-2024.pdf',            'vis' => 'todos'],
    ['titulo' => 'Xustificante PR308A (nov 2024)',          'arquivo' => 'documentos/justificante-pr308a-2024.pdf',         'vis' => 'todos'],
    ['titulo' => 'Xustificante Rexistro Asociacións 2024',  'arquivo' => 'documentos/xustificante-rexistro-2024.pdf',       'vis' => 'todos'],
    ['titulo' => 'Dosier Levada Arraiana',                   'arquivo' => 'documentos/dosier-levada-arraiana.pdf',           'vis' => 'todos'],
    ['titulo' => 'Mensualidades batukes 2022',               'arquivo' => 'documentos/mensualidades-2022.pdf',              'vis' => 'direccion'],
    ['titulo' => 'Mensualidades batukes 2023',               'arquivo' => 'documentos/mensualidades-2023.pdf',              'vis' => 'direccion'],
    ['titulo' => 'Mensualidades batukes 2024',               'arquivo' => 'documentos/mensualidades-2024.docx',             'vis' => 'direccion'],
];

foreach ($docsDef as $doc) {
    if (title_exists($db, 'documentos', $doc['titulo'])) {
        $result['documentos'][] = $doc['titulo'] . ' (xa existe)';
        continue;
    }

    $fullPath = $uploadsDir . '/' . $doc['arquivo'];
    if (!file_exists($fullPath)) {
        $result['documentos'][] = $doc['titulo'] . ' (arquivo non atopado)';
        continue;
    }

    $stmt = $db->prepare(
        "INSERT INTO documentos (titulo, descricion, visibilidade, arquivo, arquivo_nome, creado) VALUES (?, '', ?, ?, ?, NOW())"
    );
    $stmt->execute([
        $doc['titulo'],
        $doc['vis'],
        $doc['arquivo'],
        basename($doc['arquivo']),
    ]);
    $result['documentos'][] = $doc['titulo'];
}

// ==================================================================
// RESULT
// ==================================================================
send_json([
    'ok'    => true,
    'admin' => $user['username'],
    'inserted' => $result,
    'totals' => [
        'albums'     => count(array_filter($result['albums'], function($r) { return strpos($r, 'xa existe') === false && strpos($r, 'sen arquivos') === false; })),
        'actas'      => count(array_filter($result['actas'], function($r) { return strpos($r, 'xa existe') === false && strpos($r, 'non atopado') === false; })),
        'documentos' => count(array_filter($result['documentos'], function($r) { return strpos($r, 'xa existe') === false && strpos($r, 'non atopado') === false; })),
    ],
]);
