<?php
/**
 * Módulo Documentos — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'documentos.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_documentos($method, $uri, $input) {
    $db = get_db();

    // Extract ID from URI: /documentos/123
    $id = null;
    if (preg_match('#^/documentos/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all or single
    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM documentos WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Documento non atopado'], 404);
            send_json($row);
        }
        $rows = $db->query("SELECT * FROM documentos ORDER BY creado DESC")->fetchAll();
        send_json($rows);
    }

    // POST — create (admin)
    if ($method === 'POST' && !$id) {
        require_socio();

        $arquivo = null;
        $arquivo_nome = null;
        if (!empty($input['arquivo']) && !empty($input['arquivo_nome'])) {
            $arquivo_nome = $input['arquivo_nome'];
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $arquivo_nome);
            $arquivo = save_base64_file('documentos', $safe, $input['arquivo']);
        }

        $stmt = $db->prepare(
            "INSERT INTO documentos (titulo, descricion, visibilidade, arquivo, arquivo_nome, creado)
             VALUES (?, ?, ?, ?, ?, NOW())"
        );
        $stmt->execute([
            $input['titulo'] ?? '',
            $input['descricion'] ?? '',
            $input['visibilidade'] ?? 'socios',
            $arquivo,
            $arquivo_nome
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_socio();

        $stmt = $db->prepare("SELECT * FROM documentos WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Documento non atopado'], 404);

        $arquivo = $existing['arquivo'];
        $arquivo_nome = $existing['arquivo_nome'];
        if (!empty($input['arquivo']) && !empty($input['arquivo_nome'])) {
            $arquivo_nome = $input['arquivo_nome'];
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $arquivo_nome);
            $arquivo = save_base64_file('documentos', $safe, $input['arquivo']);
        }

        $stmt = $db->prepare(
            "UPDATE documentos SET titulo=?, descricion=?, visibilidade=?, arquivo=?, arquivo_nome=? WHERE id=?"
        );
        $stmt->execute([
            $input['titulo'] ?? $existing['titulo'],
            $input['descricion'] ?? $existing['descricion'],
            $input['visibilidade'] ?? $existing['visibilidade'],
            $arquivo,
            $arquivo_nome,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE
    if ($method === 'DELETE' && $id) {
        require_socio();
        $stmt = $db->prepare("DELETE FROM documentos WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
