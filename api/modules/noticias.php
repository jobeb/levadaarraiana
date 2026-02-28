<?php
/**
 * Módulo Noticias — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'noticias.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_noticias($method, $uri, $input) {
    $db = get_db();

    // GET /noticias → listar todas (público)
    if ($uri === '/noticias' && $method === 'GET') {
        $rows = $db->query("SELECT * FROM noticias ORDER BY data DESC, id DESC")->fetchAll();
        $rows = fix_rows($rows, ['imaxes'], ['publica']);
        send_json($rows);
    }

    // GET /noticias/ID → unha noticia (público)
    if (preg_match('#^/noticias/(\d+)$#', $uri, $m) && $method === 'GET') {
        $stmt = $db->prepare("SELECT * FROM noticias WHERE id = ?");
        $stmt->execute([(int)$m[1]]);
        $row = $stmt->fetch();
        if (!$row) send_json(['error' => 'Noticia non atopada'], 404);
        $row = fix_row($row, ['imaxes'], ['publica']);
        send_json($row);
    }

    // POST /noticias → crear
    if ($uri === '/noticias' && $method === 'POST') {
        $user = require_admin();

        $stmt = $db->prepare(
            "INSERT INTO noticias (titulo, texto, data, autor, imaxes, estado, publica)
             VALUES (?, ?, NOW(), ?, '[]', ?, ?)"
        );
        $stmt->execute([
            trim($input['titulo'] ?? ''),
            $input['texto'] ?? '',
            $user['nome_completo'] ?? $user['username'],
            $input['estado'] ?? 'Publicada',
            isset($input['publica']) ? (int)(bool)$input['publica'] : 1,
        ]);
        $id = (int)$db->lastInsertId();

        // Gardar imaxes en base64 se as hai
        $imaxes = [];
        if (!empty($input['imaxes']) && is_array($input['imaxes'])) {
            foreach ($input['imaxes'] as $i => $img) {
                if (!empty($img['data'])) {
                    $ext  = $img['ext'] ?? 'jpg';
                    $nome = $img['nome'] ?? "img_{$i}.{$ext}";
                    $path = save_base64_file("noticias/{$id}", $nome, $img['data']);
                    $imaxes[] = $path;
                } elseif (!empty($img['path'])) {
                    $imaxes[] = $img['path'];
                }
            }
            $db->prepare("UPDATE noticias SET imaxes = ? WHERE id = ?")
               ->execute([json_encode($imaxes, JSON_UNESCAPED_UNICODE), $id]);
        }

        send_json(['ok' => true, 'id' => $id], 201);
    }

    // PUT /noticias/ID → actualizar
    if (preg_match('#^/noticias/(\d+)$#', $uri, $m) && $method === 'PUT') {
        require_admin();
        $id = (int)$m[1];

        $check = $db->prepare("SELECT id FROM noticias WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) send_json(['error' => 'Noticia non atopada'], 404);

        $fields = [];
        $params = [];

        $updatable = ['titulo', 'texto', 'estado'];
        foreach ($updatable as $col) {
            if (array_key_exists($col, $input)) {
                $fields[] = "$col = ?";
                $params[] = $input[$col];
            }
        }
        if (array_key_exists('publica', $input)) {
            $fields[] = "publica = ?";
            $params[] = (int)(bool)$input['publica'];
        }

        // Procesar imaxes novas
        if (!empty($input['imaxes']) && is_array($input['imaxes'])) {
            $imaxes = [];
            foreach ($input['imaxes'] as $i => $img) {
                if (!empty($img['data'])) {
                    $ext  = $img['ext'] ?? 'jpg';
                    $nome = $img['nome'] ?? "img_{$i}.{$ext}";
                    $path = save_base64_file("noticias/{$id}", $nome, $img['data']);
                    $imaxes[] = $path;
                } elseif (!empty($img['path'])) {
                    $imaxes[] = $img['path'];
                }
            }
            $fields[] = "imaxes = ?";
            $params[] = json_encode($imaxes, JSON_UNESCAPED_UNICODE);
        }

        if (empty($fields)) {
            send_json(['error' => 'Non hai campos para actualizar'], 400);
        }

        $params[] = $id;
        $sql = "UPDATE noticias SET " . implode(', ', $fields) . " WHERE id = ?";
        $db->prepare($sql)->execute($params);

        send_json(['ok' => true, 'id' => $id]);
    }

    // DELETE /noticias/ID → eliminar
    if (preg_match('#^/noticias/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        require_admin();
        $id   = (int)$m[1];
        $stmt = $db->prepare("DELETE FROM noticias WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            send_json(['error' => 'Noticia non atopada'], 404);
        }
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Ruta de noticias non atopada'], 404);
}
