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

    // --- Asistencia a bolos ---

    // GET /bolos/mi-asistencia — mapa {bolo_id: estado} do usuario actual
    if ($method === 'GET' && $uri === '/bolos/mi-asistencia') {
        $user = require_auth();
        $stmt = $db->prepare("SELECT bolo_id, estado FROM bolos_asistencia WHERE socio_id = ?");
        $stmt->execute([$user['id']]);
        $rows = $stmt->fetchAll();
        $map = [];
        foreach ($rows as $r) {
            $map[$r['bolo_id']] = $r['estado'];
        }
        send_json($map);
    }

    // GET /bolos/asistencia/123 — lista de confirmados/declinados para un bolo
    if ($method === 'GET' && preg_match('#^/bolos/asistencia/(\d+)$#', $uri, $m)) {
        require_auth();
        $boloId = (int)$m[1];
        $stmt = $db->prepare(
            "SELECT ba.socio_id, ba.socio_id AS id, ba.estado, u.nome_completo, u.instrumento
             FROM bolos_asistencia ba
             JOIN usuarios u ON u.id = ba.socio_id
             WHERE ba.bolo_id = ?
             ORDER BY ba.estado ASC, u.nome_completo ASC"
        );
        $stmt->execute([$boloId]);
        $rows = $stmt->fetchAll();
        enrich_users_instruments($rows, $db);
        send_json($rows);
    }

    // POST /bolos/asistencia — confirmar/declinar {bolo_id, estado}
    if ($method === 'POST' && $uri === '/bolos/asistencia') {
        $user = require_auth();
        $boloId = (int)($input['bolo_id'] ?? 0);
        $estado = $input['estado'] ?? 'confirmado';
        if (!$boloId || !in_array($estado, ['confirmado', 'non_podo'])) {
            send_error('Datos incorrectos', 'erro_campos_obrigatorios', 400);
        }
        $stmt = $db->prepare(
            "INSERT INTO bolos_asistencia (bolo_id, socio_id, estado)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE estado = VALUES(estado)"
        );
        $stmt->execute([$boloId, $user['id'], $estado]);
        audit_log('UPDATE', 'bolos_asistencia', $boloId, $estado);
        send_json(['ok' => true, 'estado' => $estado]);
    }

    // Extract ID from URI: /bolos/123
    $id = null;
    if (preg_match('#^/bolos/(\d+)$#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all or single (public, con paxinación opcional)
    if ($method === 'GET') {
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM bolos WHERE id = ? AND eliminado IS NULL");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_error('Bolo non atopado', 'erro_non_atopado', 404);
            send_json(fix_row($row, ['i18n'], ['publica'], ['importe']));
        }
        $page = $_GET['page'] ?? null;
        $limit = $_GET['limit'] ?? 20;
        if ($page) {
            $result = paginate_query($db,
                "SELECT * FROM bolos WHERE eliminado IS NULL ORDER BY data DESC, hora DESC, id DESC",
                [], $page, $limit);
            $result['data'] = fix_rows($result['data'], ['i18n'], ['publica'], ['importe']);
            send_json($result);
        }
        $rows = $db->query("SELECT * FROM bolos WHERE eliminado IS NULL ORDER BY data DESC, hora DESC, id DESC")->fetchAll();
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

        audit_log('CREATE', 'bolos', $newId, trim($input['titulo'] ?? ''));

        // Notify socios + newsletter when public
        $titulo = trim($input['titulo'] ?? '');
        if (!empty($input['publica'])) {
            newsletter_send(
                'Novo bolo: ' . $titulo,
                "Publicouse un novo bolo en Levada Arraiana:\n\n" . $titulo .
                "\nData: " . ($input['data'] ?? '') . "\nLugar: " . ($input['lugar'] ?? '')
            );
        }
        notify_socios(
            'Novo bolo: ' . $titulo,
            "Creouse un novo bolo:\n\n" . $titulo .
            "\nData: " . ($input['data'] ?? '') . "\nLugar: " . ($input['lugar'] ?? '') .
            "\nHora: " . ($input['hora'] ?? '') . "\nEstado: " . ($input['estado'] ?? 'borrador')
        );

        send_json(['ok' => true, 'id' => $newId], 201);
    }

    // PUT — update (admin)
    if ($method === 'PUT' && $id) {
        require_socio();

        $stmt = $db->prepare("SELECT * FROM bolos WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_error('Bolo non atopado', 'erro_non_atopado', 404);

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
            send_error('Non hai campos para actualizar', 'erro_campos_obrigatorios', 400);
        }

        $params[] = $id;
        $sql = "UPDATE bolos SET " . implode(', ', $fields) . " WHERE id = ?";
        $db->prepare($sql)->execute($params);

        audit_log('UPDATE', 'bolos', $id);

        // Notify socios if estado changed
        $newEstado = $input['estado'] ?? null;
        $oldEstado = $existing['estado'] ?? '';
        if ($newEstado && $newEstado !== $oldEstado) {
            $titulo = $input['titulo'] ?? $existing['titulo'];
            notify_socios(
                'Bolo actualizado: ' . $titulo,
                "O bolo cambiou de estado:\n\n" . $titulo .
                "\nEstado: " . $oldEstado . " → " . $newEstado .
                "\nData: " . ($input['data'] ?? $existing['data']) .
                "\nLugar: " . ($input['lugar'] ?? $existing['lugar']) .
                "\nHora: " . ($input['hora'] ?? $existing['hora'])
            );
        }

        send_json(['ok' => true, 'id' => $id]);
    }

    // DELETE — soft delete
    if ($method === 'DELETE' && $id) {
        require_socio();
        $stmt = $db->prepare("UPDATE bolos SET eliminado = NOW() WHERE id = ? AND eliminado IS NULL");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            send_error('Bolo non atopado', 'erro_non_atopado', 404);
        }
        audit_log('DELETE', 'bolos', $id);
        send_json(['ok' => true]);
    }

    send_error('Ruta de bolos non atopada', 'erro_non_atopado', 404);
}
