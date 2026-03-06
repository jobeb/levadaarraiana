<?php
/**
 * Módulo Actas — CRUD + Asistentes
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
            $row = fix_row($row, ['arquivos']);
            $row['asistentes'] = _actas_get_asistentes($db, [$id])[$id] ?? [];
            send_json($row);
        }
        $rows = $db->query("SELECT * FROM actas ORDER BY data DESC")->fetchAll();
        $rows = fix_rows($rows, ['arquivos']);
        $ids = array_map(function($r) { return $r['id']; }, $rows);
        $asistMap = _actas_get_asistentes($db, $ids);
        foreach ($rows as &$r) {
            $r['asistentes'] = $asistMap[$r['id']] ?? [];
        }
        send_json($rows);
    }

    // POST — create (socio+)
    if ($method === 'POST' && !$id) {
        require_socio();

        $arquivos_clean = [];
        if (!empty($input['arquivos'])) {
            foreach ($input['arquivos'] as $f) {
                if (is_array($f) && !empty($f['data']) && !empty($f['name'])) {
                    validate_file_extension($f['name'], 'attachment');
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

        // Save asistentes
        if (isset($input['asistentes']) && is_array($input['asistentes'])) {
            _actas_save_asistentes($db, $newId, $input['asistentes']);
        }

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
                    validate_file_extension($f['name'], 'attachment');
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

        // Update asistentes
        if (isset($input['asistentes']) && is_array($input['asistentes'])) {
            _actas_save_asistentes($db, $id, $input['asistentes']);
        }

        audit_log('UPDATE', 'actas', $id);
        send_json(['ok' => true]);
    }

    // DELETE — socio+
    if ($method === 'DELETE' && $id) {
        require_socio();
        $stmt = $db->prepare("DELETE FROM actas WHERE id = ?");
        $stmt->execute([$id]);
        audit_log('DELETE', 'actas', $id);
        send_json(['ok' => true]);
    }

    send_error('Método non permitido', 'erro_metodo', 405);
}

/**
 * Get asistentes for a batch of acta IDs
 * Returns [ acta_id => [ {socio_id, nome_completo}, ... ] ]
 */
function _actas_get_asistentes($db, $ids) {
    if (empty($ids)) return [];
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $db->prepare(
        "SELECT aa.acta_id, aa.socio_id, u.nome_completo
         FROM actas_asistentes aa
         JOIN usuarios u ON u.id = aa.socio_id
         WHERE aa.acta_id IN ($placeholders)
         ORDER BY u.nome_completo"
    );
    $stmt->execute(array_values($ids));
    $rows = $stmt->fetchAll();
    $map = [];
    foreach ($rows as $r) {
        $map[(int)$r['acta_id']][] = [
            'socio_id' => (int)$r['socio_id'],
            'nome_completo' => $r['nome_completo']
        ];
    }
    return $map;
}

/**
 * Replace asistentes for an acta: DELETE all + INSERT new
 */
function _actas_save_asistentes($db, $actaId, $socioIds) {
    $db->prepare("DELETE FROM actas_asistentes WHERE acta_id = ?")->execute([$actaId]);
    if (!empty($socioIds)) {
        $stmt = $db->prepare("INSERT INTO actas_asistentes (acta_id, socio_id) VALUES (?, ?)");
        foreach ($socioIds as $sid) {
            $sid = (int)$sid;
            if ($sid > 0) {
                try {
                    $stmt->execute([$actaId, $sid]);
                } catch (\PDOException $e) {
                    // Skip duplicates or invalid FKs
                }
            }
        }
    }
}
