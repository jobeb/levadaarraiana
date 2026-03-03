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

    // Extract ID from URI: /instrumentos/123
    $id = null;
    if (preg_match('#^/instrumentos/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all or single (público — showcase)
    if ($method === 'GET') {
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM instrumentos WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Instrumento non atopado'], 404);
            send_json(fix_row($row, ['i18n']));
        }
        $rows = $db->query("SELECT * FROM instrumentos ORDER BY nome ASC")->fetchAll();
        send_json(fix_rows($rows, ['i18n']));
    }

    // POST — create (socio+)
    if ($method === 'POST' && !$id) {
        require_socio();

        $imaxe_path = '';
        if (!empty($input['imaxe_data'])) {
            $ext = $input['imaxe_ext'] ?? 'jpg';
            $tmpName = 'instrumento_' . time() . '.' . $ext;
            $imaxe_path = process_and_save_image('instrumentos', $tmpName, $input['imaxe_data']);
        }

        // Audio/video sample
        $audio_path = '';
        if (!empty($input['audio_mostra_youtube'])) {
            // YouTube URL (video uploaded to YouTube by client)
            $audio_path = $input['audio_mostra_youtube'];
        } elseif (!empty($input['audio_mostra_data']) && !empty($input['audio_mostra_name'])) {
            validate_file_extension($input['audio_mostra_name'], 'media');
            $aext = pathinfo($input['audio_mostra_name'], PATHINFO_EXTENSION);
            $audio_path = save_base64_file('instrumentos', 'mostra_' . time() . '.' . $aext, $input['audio_mostra_data']);
        }

        $i18n = isset($input['i18n']) ? json_encode($input['i18n'], JSON_UNESCAPED_UNICODE) : null;
        $stmt = $db->prepare(
            "INSERT INTO instrumentos (nome, tipo, notas, descricion, imaxe, audio_mostra, i18n)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['nome'] ?? '',
            $input['tipo'] ?? '',
            $input['notas'] ?? '',
            $input['descricion'] ?? null,
            $imaxe_path,
            $audio_path,
            $i18n
        ]);
        $newId = $db->lastInsertId();

        // Re-save image with proper ID
        if (!empty($input['imaxe_data'])) {
            $imaxe_path = process_and_save_image('instrumentos', "instrumento_{$newId}.{$ext}", $input['imaxe_data']);
            $db->prepare("UPDATE instrumentos SET imaxe = ? WHERE id = ?")->execute([$imaxe_path, $newId]);
        }
        // Re-save audio with proper ID (skip for YouTube URLs)
        if (empty($input['audio_mostra_youtube']) && !empty($input['audio_mostra_data']) && !empty($input['audio_mostra_name'])) {
            $aext = pathinfo($input['audio_mostra_name'], PATHINFO_EXTENSION);
            $audio_path = save_base64_file('instrumentos', "mostra_{$newId}.{$aext}", $input['audio_mostra_data']);
            $db->prepare("UPDATE instrumentos SET audio_mostra = ? WHERE id = ?")->execute([$audio_path, $newId]);
        }

        send_json(['ok' => true, 'id' => $newId], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_socio();
        $stmt = $db->prepare("SELECT * FROM instrumentos WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Instrumento non atopado'], 404);

        $imaxe = $existing['imaxe'];
        if (!empty($input['imaxe_data'])) {
            $ext = $input['imaxe_ext'] ?? 'jpg';
            $imaxe = process_and_save_image('instrumentos', "instrumento_{$id}.{$ext}", $input['imaxe_data']);
        }

        $audio = $existing['audio_mostra'];
        if (!empty($input['audio_mostra_youtube'])) {
            // YouTube URL (video uploaded to YouTube by client)
            $audio = $input['audio_mostra_youtube'];
        } elseif (!empty($input['audio_mostra_data']) && !empty($input['audio_mostra_name'])) {
            validate_file_extension($input['audio_mostra_name'], 'media');
            $aext = pathinfo($input['audio_mostra_name'], PATHINFO_EXTENSION);
            $audio = save_base64_file('instrumentos', "mostra_{$id}.{$aext}", $input['audio_mostra_data']);
        }
        if (isset($input['audio_mostra_remove']) && $input['audio_mostra_remove']) {
            // Delete file if exists
            if ($audio && file_exists(UPLOADS_DIR . '/' . $audio)) {
                unlink(UPLOADS_DIR . '/' . $audio);
            }
            $audio = '';
        }

        $i18n_val = $existing['i18n'];
        if (array_key_exists('i18n', $input)) {
            $i18n_val = $input['i18n'] ? json_encode($input['i18n'], JSON_UNESCAPED_UNICODE) : null;
        }

        $stmt = $db->prepare(
            "UPDATE instrumentos SET nome=?, tipo=?, notas=?, descricion=?, imaxe=?, audio_mostra=?, i18n=? WHERE id=?"
        );
        $stmt->execute([
            $input['nome'] ?? $existing['nome'],
            $input['tipo'] ?? $existing['tipo'],
            $input['notas'] ?? $existing['notas'],
            array_key_exists('descricion', $input) ? $input['descricion'] : $existing['descricion'],
            $imaxe,
            $audio,
            $i18n_val,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_socio();
        $stmt = $db->prepare("DELETE FROM instrumentos WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
