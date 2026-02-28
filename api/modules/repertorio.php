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

    // GET — list all or single
    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM repertorio WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Peza non atopada'], 404);
            send_json($row);
        }
        $rows = $db->query("SELECT * FROM repertorio ORDER BY nome ASC")->fetchAll();
        send_json($rows);
    }

    // POST — create (admin), handle arquivo_audio and arquivo_partitura uploads
    if ($method === 'POST' && !$id) {
        require_admin();

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

        $stmt = $db->prepare(
            "INSERT INTO repertorio (nome, tipo, tempo_bpm, dificultade, notas, arquivo_audio, arquivo_partitura)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['nome'] ?? '',
            $input['tipo'] ?? '',
            $input['tempo_bpm'] ?? null,
            $input['dificultade'] ?? '',
            $input['notas'] ?? '',
            $arquivo_audio,
            $arquivo_partitura
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_admin();

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

        $stmt = $db->prepare(
            "UPDATE repertorio SET nome=?, tipo=?, tempo_bpm=?, dificultade=?, notas=?,
             arquivo_audio=?, arquivo_partitura=? WHERE id=?"
        );
        $stmt->execute([
            $input['nome'] ?? $existing['nome'],
            $input['tipo'] ?? $existing['tipo'],
            $input['tempo_bpm'] ?? $existing['tempo_bpm'],
            $input['dificultade'] ?? $existing['dificultade'],
            $input['notas'] ?? $existing['notas'],
            $arquivo_audio,
            $arquivo_partitura,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM repertorio WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
