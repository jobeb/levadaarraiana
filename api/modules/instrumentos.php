<?php
/**
 * Módulo Instrumentos — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'instrumentos.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_instrumentos($method, $uri, $input) {
    $db = get_db();

    // POST /instrumentos/ID/mantemento — add maintenance entry
    if (preg_match('#^/instrumentos/(\d+)/mantemento$#', $uri, $m) && $method === 'POST') {
        require_admin();
        $inst_id = (int)$m[1];

        $stmt = $db->prepare("SELECT historial_mantemento FROM instrumentos WHERE id = ?");
        $stmt->execute([$inst_id]);
        $row = $stmt->fetch();
        if (!$row) send_json(['error' => 'Instrumento non atopado'], 404);

        $historial = json_decode($row['historial_mantemento'], true) ?? [];
        $historial[] = [
            'data' => $input['data'] ?? date('Y-m-d'),
            'tipo' => $input['tipo'] ?? '',
            'descricion' => $input['descricion'] ?? '',
            'autor' => $input['autor'] ?? ''
        ];

        $db->prepare("UPDATE instrumentos SET historial_mantemento = ? WHERE id = ?")
           ->execute([json_encode($historial, JSON_UNESCAPED_UNICODE), $inst_id]);

        send_json(['ok' => true, 'historial' => $historial]);
    }

    // Extract ID from URI: /instrumentos/123
    $id = null;
    if (preg_match('#^/instrumentos/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all (LEFT JOIN socios for asignado_a name) or single
    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare(
                "SELECT i.*, s.nome_completo AS asignado_nome
                 FROM instrumentos i
                 LEFT JOIN socios s ON s.id = i.asignado_a
                 WHERE i.id = ?"
            );
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Instrumento non atopado'], 404);
            send_json($row);
        }
        $rows = $db->query(
            "SELECT i.*, s.nome_completo AS asignado_nome
             FROM instrumentos i
             LEFT JOIN socios s ON s.id = i.asignado_a
             ORDER BY i.nome ASC"
        )->fetchAll();
        send_json($rows);
    }

    // POST — create (admin)
    if ($method === 'POST' && !$id) {
        require_admin();
        $stmt = $db->prepare(
            "INSERT INTO instrumentos (nome, tipo, numero_serie, estado, asignado_a, notas)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['nome'] ?? '',
            $input['tipo'] ?? '',
            $input['numero_serie'] ?? '',
            $input['estado'] ?? 'Dispoñible',
            $input['asignado_a'] ?? null,
            $input['notas'] ?? ''
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_admin();
        $stmt = $db->prepare("SELECT * FROM instrumentos WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Instrumento non atopado'], 404);

        $stmt = $db->prepare(
            "UPDATE instrumentos SET nome=?, tipo=?, numero_serie=?, estado=?, asignado_a=?, notas=? WHERE id=?"
        );
        $stmt->execute([
            $input['nome'] ?? $existing['nome'],
            $input['tipo'] ?? $existing['tipo'],
            $input['numero_serie'] ?? $existing['numero_serie'],
            $input['estado'] ?? $existing['estado'],
            array_key_exists('asignado_a', $input) ? $input['asignado_a'] : $existing['asignado_a'],
            $input['notas'] ?? $existing['notas'],
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM instrumentos WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
