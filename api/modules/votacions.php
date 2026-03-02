<?php
/**
 * Módulo Votacións + Votos — CRUD
 * Levada Arraiana
 *
 * Soporta: anónima/non-anónima, simple/múltiple, imaxe, comentarios
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
            $user = require_socio();
            $votacion_id = null;
            if (preg_match('#^/votos/(\d+)#', $uri, $m)) {
                $votacion_id = (int)$m[1];
            }
            if (!$votacion_id) send_json(['error' => 'ID de votación requerido'], 400);

            // Fetch votacion metadata
            $stmt = $db->prepare("SELECT anonima, estado FROM votacions WHERE id = ?");
            $stmt->execute([$votacion_id]);
            $votacion = $stmt->fetch();
            if (!$votacion) send_json(['error' => 'Votación non atopada'], 404);

            $anonima = (bool)$votacion['anonima'];
            $aberta = $votacion['estado'] === 'aberta';

            // Check if current user voted
            $stmt = $db->prepare("SELECT COUNT(*) FROM votos WHERE votacion_id = ? AND socio_id = ?");
            $stmt->execute([$votacion_id, $user['id']]);
            $user_voted = (int)$stmt->fetchColumn() > 0;

            // Total distinct voters
            $stmt = $db->prepare("SELECT COUNT(DISTINCT socio_id) FROM votos WHERE votacion_id = ?");
            $stmt->execute([$votacion_id]);
            $total_votantes = (int)$stmt->fetchColumn();

            // Anonymous + open → hide all votes
            if ($anonima && $aberta) {
                send_json([
                    'anonima' => true,
                    'aberta' => true,
                    'total_votantes' => $total_votantes,
                    'user_voted' => $user_voted,
                    'votos' => []
                ]);
            }

            // Anonymous + closed → votes without names
            if ($anonima) {
                $stmt = $db->prepare(
                    "SELECT v.id, v.votacion_id, v.socio_id, v.opcion, v.comentario, v.creado
                     FROM votos v
                     WHERE v.votacion_id = ?
                     ORDER BY v.creado ASC"
                );
                $stmt->execute([$votacion_id]);
                $votos = $stmt->fetchAll();
                // Strip socio_id for anonymity
                foreach ($votos as &$voto) {
                    unset($voto['socio_id']);
                }
                unset($voto);
                send_json([
                    'anonima' => true,
                    'aberta' => false,
                    'total_votantes' => $total_votantes,
                    'user_voted' => $user_voted,
                    'votos' => $votos
                ]);
            }

            // Non-anonymous → full data with names
            $stmt = $db->prepare(
                "SELECT v.*, s.nome_completo AS socio_nome
                 FROM votos v
                 LEFT JOIN socios s ON s.id = v.socio_id
                 WHERE v.votacion_id = ?
                 ORDER BY v.creado ASC"
            );
            $stmt->execute([$votacion_id]);
            send_json([
                'anonima' => false,
                'aberta' => $aberta,
                'total_votantes' => $total_votantes,
                'user_voted' => $user_voted,
                'votos' => $stmt->fetchAll()
            ]);
        }

        // POST /votos — cast vote
        if ($method === 'POST') {
            $user = require_socio();

            $votacion_id = $input['votacion_id'] ?? null;
            // Accept opcions (array) or opcion (string → array of 1)
            $opcions = $input['opcions'] ?? null;
            if ($opcions === null && isset($input['opcion'])) {
                $opcions = [$input['opcion']];
            }
            $comentario = $input['comentario'] ?? null;

            if (!$votacion_id || !$opcions || !is_array($opcions) || count($opcions) === 0) {
                send_json(['error' => 'votacion_id e opcions son obrigatorios'], 400);
            }

            // Check votacion exists and is open
            $stmt = $db->prepare("SELECT * FROM votacions WHERE id = ?");
            $stmt->execute([$votacion_id]);
            $votacion = $stmt->fetch();
            if (!$votacion) send_json(['error' => 'Votación non atopada'], 404);
            if ($votacion['estado'] !== 'aberta') {
                send_json(['error' => 'A votación está pechada'], 403);
            }

            // Check user hasn't voted yet
            $stmt = $db->prepare("SELECT COUNT(*) FROM votos WHERE votacion_id = ? AND socio_id = ?");
            $stmt->execute([$votacion_id, $user['id']]);
            if ((int)$stmt->fetchColumn() > 0) {
                send_json(['error' => 'Xa votaches nesta votación'], 409);
            }

            // Validate options exist in the votacion's option list
            $valid_opcions = json_decode($votacion['opcions'], true) ?? [];
            foreach ($opcions as $op) {
                if (!in_array($op, $valid_opcions)) {
                    send_json(['error' => 'Opción non válida: ' . $op], 400);
                }
            }

            // Validate type constraints
            $tipo = $votacion['tipo'] ?? 'simple';
            if ($tipo === 'simple' && count($opcions) > 1) {
                send_json(['error' => 'Votación simple: só 1 opción permitida'], 400);
            }
            if ($tipo === 'multiple') {
                $max = $votacion['max_opcions'] ? (int)$votacion['max_opcions'] : null;
                if ($max && count($opcions) > $max) {
                    send_json(['error' => 'Máximo ' . $max . ' opcións permitidas'], 400);
                }
            }

            // Insert one row per selected option, comentario only on the first
            $stmt = $db->prepare(
                "INSERT INTO votos (votacion_id, socio_id, opcion, comentario, creado) VALUES (?, ?, ?, ?, NOW())"
            );
            foreach ($opcions as $i => $op) {
                $stmt->execute([
                    $votacion_id,
                    $user['id'],
                    $op,
                    $i === 0 ? $comentario : null
                ]);
            }
            send_json(['ok' => true], 201);
        }

        send_json(['error' => 'Método non permitido'], 405);
    }

    // ---- VOTACIONS routes ----
    $id = null;
    if (preg_match('#^/votacions/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all votacions or single
    if ($method === 'GET') {
        $user = require_socio();

        // Auto-close expired votacións
        $db->exec(
            "UPDATE votacions SET estado = 'pechada', pechado_en = NOW()
             WHERE estado = 'aberta' AND data_limite IS NOT NULL AND data_limite < CURDATE()"
        );

        $uid = $user['id'];

        if ($id) {
            $stmt = $db->prepare(
                "SELECT v.*,
                    (SELECT COUNT(DISTINCT socio_id) FROM votos WHERE votacion_id = v.id) AS total_votantes,
                    (SELECT COUNT(*) FROM votos WHERE votacion_id = v.id) AS total_votos,
                    EXISTS(SELECT 1 FROM votos WHERE votacion_id = v.id AND socio_id = ?) AS user_voted
                 FROM votacions v WHERE v.id = ?"
            );
            $stmt->execute([$uid, $id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Votación non atopada'], 404);
            $row = fix_row($row, ['opcions'], ['anonima', 'user_voted']);
            send_json($row);
        }

        $stmt = $db->prepare(
            "SELECT v.*,
                (SELECT COUNT(DISTINCT socio_id) FROM votos WHERE votacion_id = v.id) AS total_votantes,
                (SELECT COUNT(*) FROM votos WHERE votacion_id = v.id) AS total_votos,
                EXISTS(SELECT 1 FROM votos WHERE votacion_id = v.id AND socio_id = ?) AS user_voted
             FROM votacions v ORDER BY v.creado DESC"
        );
        $stmt->execute([$uid]);
        $rows = $stmt->fetchAll();
        $rows = fix_rows($rows, ['opcions'], ['anonima', 'user_voted']);
        send_json($rows);
    }

    // POST — create
    if ($method === 'POST' && !$id) {
        require_socio();

        $opcions = isset($input['opcions']) ? json_encode($input['opcions']) : '[]';

        // Handle image upload
        $imaxe = '';
        if (!empty($input['imaxe_data'])) {
            $tmpId = $db->lastInsertId() ?: time();
            $imaxe = process_and_save_image('votacions', "votacion_{$tmpId}.jpg", $input['imaxe_data'], 'cover');
        }

        $stmt = $db->prepare(
            "INSERT INTO votacions (titulo, descripcion, opcions, estado, anonima, tipo, max_opcions, imaxe, data_limite, creado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"
        );
        $stmt->execute([
            $input['titulo'] ?? '',
            $input['descripcion'] ?? '',
            $opcions,
            $input['estado'] ?? 'aberta',
            !empty($input['anonima']) ? 1 : 0,
            $input['tipo'] ?? 'simple',
            ($input['tipo'] ?? 'simple') === 'multiple' && !empty($input['max_opcions']) ? (int)$input['max_opcions'] : null,
            $imaxe,
            !empty($input['data_limite']) ? $input['data_limite'] : null
        ]);

        $newId = $db->lastInsertId();

        // Re-save image with proper ID if we used a temp name
        if (!empty($input['imaxe_data'])) {
            $imaxe = process_and_save_image('votacions', "votacion_{$newId}.jpg", $input['imaxe_data'], 'cover');
            $db->prepare("UPDATE votacions SET imaxe = ? WHERE id = ?")->execute([$imaxe, $newId]);
        }

        send_json(['ok' => true, 'id' => $newId], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_socio();

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

        // Handle image
        $imaxe = $existing['imaxe'];
        if (!empty($input['imaxe_data'])) {
            $imaxe = process_and_save_image('votacions', "votacion_{$id}.jpg", $input['imaxe_data'], 'cover');
        }

        $stmt = $db->prepare(
            "UPDATE votacions SET titulo=?, descripcion=?, opcions=?, estado=?, anonima=?, tipo=?, max_opcions=?, imaxe=?, pechado_en=?, data_limite=? WHERE id=?"
        );
        $stmt->execute([
            $input['titulo'] ?? $existing['titulo'],
            $input['descripcion'] ?? $existing['descripcion'],
            $opcions,
            $new_estado,
            array_key_exists('anonima', $input ?? []) ? (!empty($input['anonima']) ? 1 : 0) : $existing['anonima'],
            $input['tipo'] ?? $existing['tipo'],
            ($input['tipo'] ?? $existing['tipo']) === 'multiple' && !empty($input['max_opcions']) ? (int)$input['max_opcions'] : null,
            $imaxe,
            $pechado_en,
            $data_limite,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE
    if ($method === 'DELETE' && $id) {
        require_socio();
        // Delete associated votes first (FK cascade should handle, but explicit is safer)
        $stmt = $db->prepare("DELETE FROM votos WHERE votacion_id = ?");
        $stmt->execute([$id]);
        $stmt = $db->prepare("DELETE FROM votacions WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
