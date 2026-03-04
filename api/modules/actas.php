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
            if (!$row) send_error('Acta non atopada', 'erro_non_atopado', 404);
            send_json(fix_row($row, ['arquivos']));
        }
        $rows = $db->query("SELECT * FROM actas ORDER BY data DESC")->fetchAll();
        send_json(fix_rows($rows, ['arquivos']));
    }

    // POST — create (admin)
    if ($method === 'POST' && !$id) {
        require_socio();

        $arquivos_clean = [];
        if (!empty($input['arquivos'])) {
            foreach ($input['arquivos'] as $f) {
                if (is_array($f) && !empty($f['data']) && !empty($f['name'])) {
                    validate_file_extension($f['name'], 'document');
                    $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $f['name']);
                    $url = save_base64_file('actas', $safe, $f['data']);
                    $arquivos_clean[] = ['name' => $f['name'], 'url' => $url];
                } elseif (is_array($f) && !empty($f['url'])) {
                    $arquivos_clean[] = $f;
                }
            }
        }
        $arquivos = json_encode($arquivos_clean);

        $stmt = $db->prepare(
            "INSERT INTO actas (titulo, data, contido, estado, arquivos, creado)
             VALUES (?, ?, ?, ?, ?, NOW())"
        );
        $stmt->execute([
            $input['titulo'] ?? '',
            $input['data'] ?? date('Y-m-d'),
            $input['contido'] ?? '',
            $input['estado'] ?? 'borrador',
            $arquivos
        ]);
        $newId = (int)$db->lastInsertId();
        audit_log('CREATE', 'actas', $newId, $input['titulo'] ?? '');
        send_json(['ok' => true, 'id' => $newId], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_socio();

        $stmt = $db->prepare("SELECT * FROM actas WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_error('Acta non atopada', 'erro_non_atopado', 404);

        $arquivos_clean = [];
        if (isset($input['arquivos'])) {
            foreach ($input['arquivos'] as $f) {
                if (is_array($f) && !empty($f['data']) && !empty($f['name'])) {
                    validate_file_extension($f['name'], 'document');
                    $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $f['name']);
                    $url = save_base64_file('actas', $safe, $f['data']);
                    $arquivos_clean[] = ['name' => $f['name'], 'url' => $url];
                } elseif (is_array($f) && !empty($f['url'])) {
                    $arquivos_clean[] = $f;
                }
            }
            $arquivos = json_encode($arquivos_clean);
        } else {
            $arquivos = $existing['arquivos'];
        }

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
        audit_log('UPDATE', 'actas', $id);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_socio();
        $stmt = $db->prepare("DELETE FROM actas WHERE id = ?");
        $stmt->execute([$id]);
        audit_log('DELETE', 'actas', $id);
        send_json(['ok' => true]);
    }

    send_error('Método non permitido', 'erro_metodo', 405);
}
