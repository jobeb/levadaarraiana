<?php
/**
 * Modulo Bolos — CRUD (unifica eventos + contratos)
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'bolos.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_bolos($method, $uri, $input) {
    $db = get_db();

    // Extract ID from URI: /bolos/123
    $id = null;
    if (preg_match('#^/bolos/(\d+)$#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all or single (public)
    if ($method === 'GET') {
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM bolos WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Bolo non atopado'], 404);
            send_json(fix_row($row, ['i18n'], ['publica'], ['importe']));
        }
        $rows = $db->query("SELECT * FROM bolos ORDER BY data DESC, hora DESC, id DESC")->fetchAll();
        send_json(fix_rows($rows, ['i18n'], ['publica'], ['importe']));
    }

    // POST — create (admin)
    if ($method === 'POST' && !$id) {
        require_socio();

        // Imaxe base64
        $imaxe_path = '';
        if (!empty($input['imaxe_data'])) {
            $ext = $input['imaxe_ext'] ?? 'jpg';
            $tmpName = 'bolo_' . time() . '.' . $ext;
            $imaxe_path = process_and_save_image('bolos', $tmpName, $input['imaxe_data']);
        }

        // Contrato arquivo base64
        $contrato_arquivo = '';
        if (!empty($input['contrato_arquivo_data']) && !empty($input['contrato_arquivo_nome'])) {
            validate_file_extension($input['contrato_arquivo_nome'], 'document');
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $input['contrato_arquivo_nome']);
            $contrato_arquivo = save_base64_file('bolos', $safe, $input['contrato_arquivo_data']);
        }

        $i18n = isset($input['i18n']) ? json_encode($input['i18n'], JSON_UNESCAPED_UNICODE) : null;
        $stmt = $db->prepare(
            "INSERT INTO bolos (titulo, descricion, data, hora, lugar, tipo, imaxe,
             cliente_nome, cliente_nif, cliente_telefono, importe, notas,
             contrato_arquivo, estado, publica, i18n)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            trim($input['titulo'] ?? ''),
            $input['descricion'] ?? '',
            $input['data'] ?? date('Y-m-d'),
            $input['hora'] ?? '',
            $input['lugar'] ?? '',
            $input['tipo'] ?? 'actuacion',
            $imaxe_path,
            $input['cliente_nome'] ?? '',
            $input['cliente_nif'] ?? '',
            $input['cliente_telefono'] ?? '',
            $input['importe'] ?? 0,
            $input['notas'] ?? '',
            $contrato_arquivo,
            $input['estado'] ?? 'borrador',
            !empty($input['publica']) ? 1 : 0,
            $i18n,
        ]);
        $newId = (int)$db->lastInsertId();

        // Rename image with real ID
        if (!empty($input['imaxe_data'])) {
            $ext = $input['imaxe_ext'] ?? 'jpg';
            $newPath = process_and_save_image('bolos', "bolo_{$newId}.{$ext}", $input['imaxe_data']);
            $db->prepare("UPDATE bolos SET imaxe = ? WHERE id = ?")->execute([$newPath, $newId]);
        }

        send_json(['ok' => true, 'id' => $newId], 201);
    }

    // PUT — update (admin)
    if ($method === 'PUT' && $id) {
        require_socio();

        $stmt = $db->prepare("SELECT * FROM bolos WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Bolo non atopado'], 404);

        $fields = [];
        $params = [];

        $updatable = ['titulo', 'descricion', 'data', 'hora', 'lugar', 'tipo',
                       'cliente_nome', 'cliente_nif', 'cliente_telefono',
                       'importe', 'notas', 'estado', 'publica'];
        foreach ($updatable as $col) {
            if (array_key_exists($col, $input)) {
                $fields[] = "$col = ?";
                $params[] = $col === 'publica' ? (!empty($input[$col]) ? 1 : 0) : $input[$col];
            }
        }

        if (array_key_exists('i18n', $input)) {
            $fields[] = "i18n = ?";
            $params[] = $input['i18n'] ? json_encode($input['i18n'], JSON_UNESCAPED_UNICODE) : null;
        }

        // Imaxe base64
        if (!empty($input['imaxe_data'])) {
            $ext = $input['imaxe_ext'] ?? 'jpg';
            $path = process_and_save_image('bolos', "bolo_{$id}.{$ext}", $input['imaxe_data']);
            $fields[] = "imaxe = ?";
            $params[] = $path;
        } elseif (array_key_exists('imaxe', $input)) {
            $fields[] = "imaxe = ?";
            $params[] = $input['imaxe'];
        }

        // Contrato arquivo
        if (!empty($input['contrato_arquivo_data']) && !empty($input['contrato_arquivo_nome'])) {
            validate_file_extension($input['contrato_arquivo_nome'], 'document');
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $input['contrato_arquivo_nome']);
            $path = save_base64_file('bolos', $safe, $input['contrato_arquivo_data']);
            $fields[] = "contrato_arquivo = ?";
            $params[] = $path;
        }

        if (empty($fields)) {
            send_json(['error' => 'Non hai campos para actualizar'], 400);
        }

        $params[] = $id;
        $sql = "UPDATE bolos SET " . implode(', ', $fields) . " WHERE id = ?";
        $db->prepare($sql)->execute($params);

        send_json(['ok' => true, 'id' => $id]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_socio();
        $stmt = $db->prepare("DELETE FROM bolos WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            send_json(['error' => 'Bolo non atopado'], 404);
        }
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Ruta de bolos non atopada'], 404);
}
