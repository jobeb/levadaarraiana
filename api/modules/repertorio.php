<?php
/**
 * Módulo Repertorio — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'repertorio.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_repertorio($method, $uri, $input) {
    $db = get_db();

    // Extract ID from URI: /repertorio/123
    $id = null;
    if (preg_match('#^/repertorio/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // ---- Medios sub-resource: /repertorio/{id}/medios ----
    if ($id && preg_match('#^/repertorio/\d+/medios(?:/(\d+))?$#', $uri, $mm)) {
        $medioId = isset($mm[1]) ? (int)$mm[1] : null;

        // GET — list all medios for a ritmo
        if ($method === 'GET') {
            require_auth();
            $stmt = $db->prepare("SELECT * FROM repertorio_medios WHERE repertorio_id = ? ORDER BY parte_idx ASC, instrumento_id ASC");
            $stmt->execute([$id]);
            send_json($stmt->fetchAll());
        }

        // PUT — upload/replace a medio slot
        if ($method === 'PUT') {
            require_socio();
            $parte_idx = (int)($input['parte_idx'] ?? -1);
            $instrumento_id = (int)($input['instrumento_id'] ?? 0);
            $nome = $input['nome'] ?? '';
            $tipo_media = $input['tipo_media'] ?? 'audio';
            $youtube_url = $input['youtube_url'] ?? '';
            $data = $input['data'] ?? '';

            if (!$youtube_url && (!$data || !$nome)) send_json(['error' => 'Faltan data ou nome'], 400);

            // Check if slot exists — delete old local file
            $stmt = $db->prepare("SELECT * FROM repertorio_medios WHERE repertorio_id = ? AND parte_idx = ? AND instrumento_id = ?");
            $stmt->execute([$id, $parte_idx, $instrumento_id]);
            $existing = $stmt->fetch();
            if ($existing && $existing['arquivo'] && strpos($existing['arquivo'], 'youtube.com/') === false) {
                $old = UPLOADS_DIR . '/' . $existing['arquivo'];
                if (file_exists($old)) @unlink($old);
            }

            if ($youtube_url) {
                // YouTube video — store URL directly, no local file
                $arquivo = $youtube_url;
                $tipo_media = 'youtube';
            } else {
                // Local file (audio or video fallback)
                $safe = $id . '_' . $parte_idx . '_' . $instrumento_id . '_' . time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $nome);
                $arquivo = save_base64_file('repertorio/medios', $safe, $data);
            }

            // Upsert
            $stmt = $db->prepare(
                "INSERT INTO repertorio_medios (repertorio_id, parte_idx, instrumento_id, arquivo, arquivo_nome, tipo_media)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE arquivo = VALUES(arquivo), arquivo_nome = VALUES(arquivo_nome), tipo_media = VALUES(tipo_media), creado = CURRENT_TIMESTAMP"
            );
            $stmt->execute([$id, $parte_idx, $instrumento_id, $arquivo, $nome, $tipo_media]);
            send_json(['ok' => true]);
        }

        // DELETE — remove a specific medio by id
        if ($method === 'DELETE' && $medioId) {
            require_socio();
            $stmt = $db->prepare("SELECT * FROM repertorio_medios WHERE id = ? AND repertorio_id = ?");
            $stmt->execute([$medioId, $id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Medio non atopado'], 404);
            if ($row['arquivo'] && strpos($row['arquivo'], 'youtube.com/') === false) {
                $path = UPLOADS_DIR . '/' . $row['arquivo'];
                if (file_exists($path)) @unlink($path);
            }
            $stmt = $db->prepare("DELETE FROM repertorio_medios WHERE id = ?");
            $stmt->execute([$medioId]);
            send_json(['ok' => true]);
        }

        send_json(['error' => 'Método non permitido'], 405);
    }

    // GET — list all or single
    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM repertorio WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Peza non atopada'], 404);
            send_json(fix_row($row, ['estructura']));
        }
        $rows = $db->query("SELECT * FROM repertorio ORDER BY nome ASC")->fetchAll();
        send_json(fix_rows($rows, ['estructura']));
    }

    // POST — create (admin), handle arquivo_audio and arquivo_partitura uploads
    if ($method === 'POST' && !$id) {
        require_socio();

        $arquivo_audio = null;
        if (!empty($input['arquivo_audio']) && !empty($input['arquivo_audio_nome'])) {
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $input['arquivo_audio_nome']);
            $arquivo_audio = save_base64_file('repertorio', $safe, $input['arquivo_audio']);
        }

        $arquivo_partitura = null;
        if (!empty($input['arquivo_partitura']) && !empty($input['arquivo_partitura_nome'])) {
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $input['arquivo_partitura_nome']);
            $arquivo_partitura = save_base64_file('repertorio', $safe, $input['arquivo_partitura']);
        }

        $estructura = isset($input['estructura']) ? json_encode($input['estructura'], JSON_UNESCAPED_UNICODE) : null;

        $stmt = $db->prepare(
            "INSERT INTO repertorio (nome, tipo, tempo_bpm, dificultade, notas, arquivo_audio, arquivo_partitura, estructura)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['nome'] ?? '',
            $input['tipo'] ?? '',
            $input['tempo_bpm'] ?? null,
            $input['dificultade'] ?? '',
            $input['notas'] ?? '',
            $arquivo_audio,
            $arquivo_partitura,
            $estructura
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_socio();

        $stmt = $db->prepare("SELECT * FROM repertorio WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Peza non atopada'], 404);

        $arquivo_audio = $existing['arquivo_audio'];
        if (!empty($input['arquivo_audio']) && !empty($input['arquivo_audio_nome'])) {
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $input['arquivo_audio_nome']);
            $arquivo_audio = save_base64_file('repertorio', $safe, $input['arquivo_audio']);
        }

        $arquivo_partitura = $existing['arquivo_partitura'];
        if (!empty($input['arquivo_partitura']) && !empty($input['arquivo_partitura_nome'])) {
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $input['arquivo_partitura_nome']);
            $arquivo_partitura = save_base64_file('repertorio', $safe, $input['arquivo_partitura']);
        }

        $estructura = array_key_exists('estructura', $input ?? [])
            ? json_encode($input['estructura'], JSON_UNESCAPED_UNICODE)
            : $existing['estructura'];

        $stmt = $db->prepare(
            "UPDATE repertorio SET nome=?, tipo=?, tempo_bpm=?, dificultade=?, notas=?,
             arquivo_audio=?, arquivo_partitura=?, estructura=? WHERE id=?"
        );
        $stmt->execute([
            $input['nome'] ?? $existing['nome'],
            $input['tipo'] ?? $existing['tipo'],
            $input['tempo_bpm'] ?? $existing['tempo_bpm'],
            $input['dificultade'] ?? $existing['dificultade'],
            $input['notas'] ?? $existing['notas'],
            $arquivo_audio,
            $arquivo_partitura,
            $estructura,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_socio();
        // Remove medio files from disk before CASCADE deletes DB rows
        $mStmt = $db->prepare("SELECT arquivo FROM repertorio_medios WHERE repertorio_id = ?");
        $mStmt->execute([$id]);
        foreach ($mStmt->fetchAll() as $m) {
            if ($m['arquivo'] && strpos($m['arquivo'], 'youtube.com/') === false) {
                $p = UPLOADS_DIR . '/' . $m['arquivo'];
                if (file_exists($p)) @unlink($p);
            }
        }
        $stmt = $db->prepare("DELETE FROM repertorio WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
