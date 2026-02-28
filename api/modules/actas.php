<?php
/**
 * Módulo Actas — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'actas.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_actas($method, $uri, $input) {
    $db = get_db();

    // Extract ID from URI: /actas/123
    $id = null;
    if (preg_match('#^/actas/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all or single
    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM actas WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Acta non atopada'], 404);
            send_json(fix_row($row, ['arquivos']));
        }
        $rows = $db->query("SELECT * FROM actas ORDER BY data DESC")->fetchAll();
        send_json(fix_rows($rows, ['arquivos']));
    }

    // POST — create (admin)
    if ($method === 'POST' && !$id) {
        require_admin();

        $arquivos = isset($input['arquivos']) ? json_encode($input['arquivos']) : '[]';

        $stmt = $db->prepare(
            "INSERT INTO actas (titulo, data, contido, estado, arquivos, creado)
             VALUES (?, ?, ?, ?, ?, NOW())"
        );
        $stmt->execute([
            $input['titulo'] ?? '',
            $input['data'] ?? date('Y-m-d'),
            $input['contido'] ?? '',
            $input['estado'] ?? 'Borrador',
            $arquivos
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_admin();

        $stmt = $db->prepare("SELECT * FROM actas WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Acta non atopada'], 404);

        $arquivos = isset($input['arquivos']) ? json_encode($input['arquivos']) : $existing['arquivos'];

        $stmt = $db->prepare(
            "UPDATE actas SET titulo=?, data=?, contido=?, estado=?, arquivos=? WHERE id=?"
        );
        $stmt->execute([
            $input['titulo'] ?? $existing['titulo'],
            $input['data'] ?? $existing['data'],
            $input['contido'] ?? $existing['contido'],
            $input['estado'] ?? $existing['estado'],
            $arquivos,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM actas WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
