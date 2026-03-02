<?php
/**
 * Módulo Albums — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'albums.php') {
    http_response_code(403);
    exit('Forbidden');
}

/**
 * Normaliza fotos: strings legacy → objetos {path, titulo, alt}
 */
function normalize_fotos($fotos) {
    if (!is_array($fotos)) return [];
    $out = [];
    foreach ($fotos as $f) {
        if (is_string($f)) {
            $out[] = ['path' => $f, 'titulo' => '', 'alt' => ''];
        } elseif (is_array($f) && !empty($f['path'])) {
            $out[] = [
                'path'      => $f['path'],
                'titulo'    => $f['titulo'] ?? '',
                'alt'       => $f['alt'] ?? '',
                'destacada' => !empty($f['destacada']),
            ];
        }
    }
    return $out;
}

function handle_albums($method, $uri, $input) {
    $db = get_db();

    // GET /albums → listar todos (público)
    if ($uri === '/albums' && $method === 'GET') {
        $rows = $db->query("SELECT * FROM albums ORDER BY data DESC, id DESC")->fetchAll();
        $rows = fix_rows($rows, ['fotos', 'i18n']);
        foreach ($rows as &$r) {
            $r['fotos'] = normalize_fotos($r['fotos']);
        }
        unset($r);
        send_json($rows);
    }

    // GET /albums/ID → un album (público)
    if (preg_match('#^/albums/(\d+)$#', $uri, $m) && $method === 'GET') {
        $stmt = $db->prepare("SELECT * FROM albums WHERE id = ?");
        $stmt->execute([(int)$m[1]]);
        $row = $stmt->fetch();
        if (!$row) send_json(['error' => 'Album non atopado'], 404);
        $row = fix_row($row, ['fotos', 'i18n']);
        $row['fotos'] = normalize_fotos($row['fotos']);
        send_json($row);
    }

    // POST /albums → crear
    if ($uri === '/albums' && $method === 'POST') {
        require_socio();

        // Portada base64
        $portada_path = $input['portada'] ?? '';
        if (!empty($input['portada_data'])) {
            $ext = $input['portada_ext'] ?? 'jpg';
            $tmpName = 'portada_' . time() . '.' . $ext;
            $portada_path = process_and_save_image('albums', $tmpName, $input['portada_data'], 'cover');
        }

        $i18n = isset($input['i18n']) ? json_encode($input['i18n'], JSON_UNESCAPED_UNICODE) : null;
        $stmt = $db->prepare(
            "INSERT INTO albums (titulo, descricion, data, portada, fotos, i18n)
             VALUES (?, ?, ?, ?, '[]', ?)"
        );
        $stmt->execute([
            trim($input['titulo'] ?? ''),
            $input['descricion'] ?? '',
            $input['data'] ?? date('Y-m-d'),
            $portada_path,
            $i18n,
        ]);
        $id = (int)$db->lastInsertId();

        // Renomear portada co ID real
        if (!empty($input['portada_data'])) {
            $ext = $input['portada_ext'] ?? 'jpg';
            $newPath = process_and_save_image('albums', "portada_{$id}.{$ext}", $input['portada_data'], 'cover');
            $db->prepare("UPDATE albums SET portada = ? WHERE id = ?")->execute([$newPath, $id]);
        }

        // Procesar fotos array (como objetos)
        $fotos = [];
        if (!empty($input['fotos']) && is_array($input['fotos'])) {
            foreach ($input['fotos'] as $i => $foto) {
                if (is_string($foto)) {
                    // Legacy string format
                    $fotos[] = ['path' => $foto, 'titulo' => '', 'alt' => '', 'destacada' => false];
                } elseif (!empty($foto['data'])) {
                    $ext  = $foto['ext'] ?? 'jpg';
                    $nome = $foto['nome'] ?? "foto_{$i}.{$ext}";
                    $path = process_and_save_image("albums/{$id}", $nome, $foto['data'], 'gallery');
                    $fotos[] = ['path' => $path, 'titulo' => $foto['titulo'] ?? '', 'alt' => $foto['alt'] ?? '', 'destacada' => !empty($foto['destacada'])];
                } elseif (!empty($foto['path'])) {
                    $fotos[] = ['path' => $foto['path'], 'titulo' => $foto['titulo'] ?? '', 'alt' => $foto['alt'] ?? '', 'destacada' => !empty($foto['destacada'])];
                }
            }
            $db->prepare("UPDATE albums SET fotos = ? WHERE id = ?")
               ->execute([json_encode($fotos, JSON_UNESCAPED_UNICODE), $id]);

            // Auto-set first photo as portada if none was specified
            if (empty($portada_path) && !empty($fotos[0]['path'])) {
                $db->prepare("UPDATE albums SET portada = ? WHERE id = ?")
                   ->execute([$fotos[0]['path'], $id]);
            }
        }

        send_json(['ok' => true, 'id' => $id], 201);
    }

    // PUT /albums/ID → actualizar
    if (preg_match('#^/albums/(\d+)$#', $uri, $m) && $method === 'PUT') {
        require_socio();
        $id = (int)$m[1];

        $check = $db->prepare("SELECT id FROM albums WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) send_json(['error' => 'Album non atopado'], 404);

        $fields = [];
        $params = [];

        $updatable = ['titulo', 'descricion', 'data'];
        foreach ($updatable as $col) {
            if (array_key_exists($col, $input)) {
                $fields[] = "$col = ?";
                $params[] = $input[$col];
            }
        }
        if (array_key_exists('i18n', $input)) {
            $fields[] = "i18n = ?";
            $params[] = $input['i18n'] ? json_encode($input['i18n'], JSON_UNESCAPED_UNICODE) : null;
        }

        // Portada base64
        if (!empty($input['portada_data'])) {
            $ext = $input['portada_ext'] ?? 'jpg';
            $path = process_and_save_image('albums', "portada_{$id}.{$ext}", $input['portada_data'], 'cover');
            $fields[] = "portada = ?";
            $params[] = $path;
        } elseif (!empty($input['portada_path'])) {
            // Cambiar portada a una foto existente del álbum
            $fields[] = "portada = ?";
            $params[] = $input['portada_path'];
        } elseif (array_key_exists('portada', $input)) {
            $fields[] = "portada = ?";
            $params[] = $input['portada'];
        }

        // Procesar fotos array (como objetos)
        if (!empty($input['fotos']) && is_array($input['fotos'])) {
            $fotos = [];
            foreach ($input['fotos'] as $i => $foto) {
                if (is_string($foto)) {
                    $fotos[] = ['path' => $foto, 'titulo' => '', 'alt' => '', 'destacada' => false];
                } elseif (!empty($foto['data'])) {
                    $ext  = $foto['ext'] ?? 'jpg';
                    $nome = $foto['nome'] ?? "foto_{$i}.{$ext}";
                    $path = process_and_save_image("albums/{$id}", $nome, $foto['data'], 'gallery');
                    $fotos[] = ['path' => $path, 'titulo' => $foto['titulo'] ?? '', 'alt' => $foto['alt'] ?? '', 'destacada' => !empty($foto['destacada'])];
                } elseif (!empty($foto['path'])) {
                    $fotos[] = ['path' => $foto['path'], 'titulo' => $foto['titulo'] ?? '', 'alt' => $foto['alt'] ?? '', 'destacada' => !empty($foto['destacada'])];
                }
            }
            $fields[] = "fotos = ?";
            $params[] = json_encode($fotos, JSON_UNESCAPED_UNICODE);
        }

        if (empty($fields)) {
            send_json(['error' => 'Non hai campos para actualizar'], 400);
        }

        $params[] = $id;
        $sql = "UPDATE albums SET " . implode(', ', $fields) . " WHERE id = ?";
        $db->prepare($sql)->execute($params);

        send_json(['ok' => true, 'id' => $id]);
    }

    // DELETE /albums/ID → eliminar
    if (preg_match('#^/albums/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        require_socio();
        $id   = (int)$m[1];
        $stmt = $db->prepare("DELETE FROM albums WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            send_json(['error' => 'Album non atopado'], 404);
        }
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Ruta de albums non atopada'], 404);
}
