<?php
/**
 * Módulo Votacións + Votos — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'votacions.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_votacions($method, $uri, $input) {
    $db = get_db();

    // ---- VOTOS routes ----
    if (strpos($uri, '/votos') === 0) {
        // GET /votos/ID — get votes for votacion ID
        if ($method === 'GET') {
            require_auth();
            $votacion_id = null;
            if (preg_match('#^/votos/(\d+)#', $uri, $m)) {
                $votacion_id = (int)$m[1];
            }
            if (!$votacion_id) send_json(['error' => 'ID de votación requerido'], 400);

            $stmt = $db->prepare(
                "SELECT v.*, s.nome_completo AS socio_nome
                 FROM votos v
                 LEFT JOIN socios s ON s.id = v.socio_id
                 WHERE v.votacion_id = ?
                 ORDER BY v.creado ASC"
            );
            $stmt->execute([$votacion_id]);
            send_json($stmt->fetchAll());
        }

        // POST /votos — cast vote
        if ($method === 'POST') {
            $user = require_auth();

            $votacion_id = $input['votacion_id'] ?? null;
            $opcion = $input['opcion'] ?? null;

            if (!$votacion_id || $opcion === null) {
                send_json(['error' => 'votacion_id e opcion son obrigatorios'], 400);
            }

            // Check votacion exists and is open
            $stmt = $db->prepare("SELECT * FROM votacions WHERE id = ?");
            $stmt->execute([$votacion_id]);
            $votacion = $stmt->fetch();
            if (!$votacion) send_json(['error' => 'Votación non atopada'], 404);
            if ($votacion['estado'] !== 'aberta') {
                send_json(['error' => 'A votación está pechada'], 403);
            }

            // Check unique vote
            $stmt = $db->prepare("SELECT id FROM votos WHERE votacion_id = ? AND socio_id = ?");
            $stmt->execute([$votacion_id, $user['id']]);
            if ($stmt->fetch()) {
                send_json(['error' => 'Xa votaches nesta votación'], 409);
            }

            $stmt = $db->prepare(
                "INSERT INTO votos (votacion_id, socio_id, opcion, creado) VALUES (?, ?, ?, NOW())"
            );
            $stmt->execute([$votacion_id, $user['id'], $opcion]);
            send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
        }

        send_json(['error' => 'Método non permitido'], 405);
    }

    // ---- VOTACIONS routes ----
    $id = null;
    if (preg_match('#^/votacions/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all votacions with vote counts, or single
    if ($method === 'GET') {
        require_auth();

        // Auto-close expired votacións
        $db->exec(
            "UPDATE votacions SET estado = 'pechada', pechado_en = NOW()
             WHERE estado = 'aberta' AND data_limite IS NOT NULL AND data_limite < CURDATE()"
        );

        if ($id) {
            $stmt = $db->prepare(
                "SELECT v.*, (SELECT COUNT(*) FROM votos WHERE votacion_id = v.id) AS total_votos
                 FROM votacions v WHERE v.id = ?"
            );
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Votación non atopada'], 404);
            if (isset($row['opcions']) && is_string($row['opcions'])) {
                $row['opcions'] = json_decode($row['opcions'], true) ?? [];
            }
            send_json($row);
        }

        $rows = $db->query(
            "SELECT v.*, (SELECT COUNT(*) FROM votos WHERE votacion_id = v.id) AS total_votos
             FROM votacions v ORDER BY v.creado DESC"
        )->fetchAll();
        foreach ($rows as &$r) {
            if (isset($r['opcions']) && is_string($r['opcions'])) {
                $r['opcions'] = json_decode($r['opcions'], true) ?? [];
            }
        }
        unset($r);
        send_json($rows);
    }

    // POST — create (admin)
    if ($method === 'POST' && !$id) {
        require_admin();

        $opcions = isset($input['opcions']) ? json_encode($input['opcions']) : '[]';

        $stmt = $db->prepare(
            "INSERT INTO votacions (titulo, descripcion, opcions, estado, data_limite, creado)
             VALUES (?, ?, ?, ?, ?, NOW())"
        );
        $stmt->execute([
            $input['titulo'] ?? '',
            $input['descripcion'] ?? '',
            $opcions,
            $input['estado'] ?? 'aberta',
            !empty($input['data_limite']) ? $input['data_limite'] : null
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    // PUT — update (close/open)
    if ($method === 'PUT' && $id) {
        require_admin();

        $stmt = $db->prepare("SELECT * FROM votacions WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Votación non atopada'], 404);

        $opcions = isset($input['opcions']) ? json_encode($input['opcions']) : $existing['opcions'];
        $pechado_en = $existing['pechado_en'];

        // If closing the votacion, set pechado_en
        $new_estado = $input['estado'] ?? $existing['estado'];
        if ($new_estado === 'pechada' && $existing['estado'] !== 'pechada') {
            $pechado_en = date('Y-m-d H:i:s');
        } elseif ($new_estado === 'aberta') {
            $pechado_en = null;
        }

        $data_limite = array_key_exists('data_limite', $input ?? []) ? ($input['data_limite'] ?: null) : ($existing['data_limite'] ?? null);

        $stmt = $db->prepare(
            "UPDATE votacions SET titulo=?, descripcion=?, opcions=?, estado=?, pechado_en=?, data_limite=? WHERE id=?"
        );
        $stmt->execute([
            $input['titulo'] ?? $existing['titulo'],
            $input['descripcion'] ?? $existing['descripcion'],
            $opcions,
            $new_estado,
            $pechado_en,
            $data_limite,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_admin();
        // Delete associated votes first
        $stmt = $db->prepare("DELETE FROM votos WHERE votacion_id = ?");
        $stmt->execute([$id]);
        $stmt = $db->prepare("DELETE FROM votacions WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
