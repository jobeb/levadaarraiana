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
                'path'   => $f['path'],
                'titulo' => $f['titulo'] ?? '',
                'alt'    => $f['alt'] ?? '',
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
        $rows = fix_rows($rows, ['fotos']);
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
        $row = fix_row($row, ['fotos']);
        $row['fotos'] = normalize_fotos($row['fotos']);
        send_json($row);
    }

    // POST /albums → crear
    if ($uri === '/albums' && $method === 'POST') {
        require_admin();

        // Portada base64
        $portada_path = $input['portada'] ?? null;
        if (!empty($input['portada_data'])) {
            $ext = $input['portada_ext'] ?? 'jpg';
            $tmpName = 'portada_' . time() . '.' . $ext;
            $portada_path = save_base64_file('albums', $tmpName, $input['portada_data']);
        }

        $stmt = $db->prepare(
            "INSERT INTO albums (titulo, descricion, data, portada, fotos)
             VALUES (?, ?, ?, ?, '[]')"
        );
        $stmt->execute([
            trim($input['titulo'] ?? ''),
            $input['descricion'] ?? '',
            $input['data'] ?? date('Y-m-d'),
            $portada_path,
        ]);
        $id = (int)$db->lastInsertId();

        // Renomear portada co ID real
        if (!empty($input['portada_data'])) {
            $ext = $input['portada_ext'] ?? 'jpg';
            $newPath = save_base64_file('albums', "portada_{$id}.{$ext}", $input['portada_data']);
            $db->prepare("UPDATE albums SET portada = ? WHERE id = ?")->execute([$newPath, $id]);
        }

        // Procesar fotos array (como objetos)
        $fotos = [];
        if (!empty($input['fotos']) && is_array($input['fotos'])) {
            foreach ($input['fotos'] as $i => $foto) {
                if (is_string($foto)) {
                    // Legacy string format
                    $fotos[] = ['path' => $foto, 'titulo' => '', 'alt' => ''];
                } elseif (!empty($foto['data'])) {
                    $ext  = $foto['ext'] ?? 'jpg';
                    $nome = $foto['nome'] ?? "foto_{$i}.{$ext}";
                    $path = save_base64_file("albums/{$id}", $nome, $foto['data']);
                    $fotos[] = ['path' => $path, 'titulo' => $foto['titulo'] ?? '', 'alt' => $foto['alt'] ?? ''];
                } elseif (!empty($foto['path'])) {
                    $fotos[] = ['path' => $foto['path'], 'titulo' => $foto['titulo'] ?? '', 'alt' => $foto['alt'] ?? ''];
                }
            }
            $db->prepare("UPDATE albums SET fotos = ? WHERE id = ?")
               ->execute([json_encode($fotos, JSON_UNESCAPED_UNICODE), $id]);
        }

        send_json(['ok' => true, 'id' => $id], 201);
    }

    // PUT /albums/ID → actualizar
    if (preg_match('#^/albums/(\d+)$#', $uri, $m) && $method === 'PUT') {
        require_admin();
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

        // Portada base64
        if (!empty($input['portada_data'])) {
            $ext = $input['portada_ext'] ?? 'jpg';
            $path = save_base64_file('albums', "portada_{$id}.{$ext}", $input['portada_data']);
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
                    $fotos[] = ['path' => $foto, 'titulo' => '', 'alt' => ''];
                } elseif (!empty($foto['data'])) {
                    $ext  = $foto['ext'] ?? 'jpg';
                    $nome = $foto['nome'] ?? "foto_{$i}.{$ext}";
                    $path = save_base64_file("albums/{$id}", $nome, $foto['data']);
                    $fotos[] = ['path' => $path, 'titulo' => $foto['titulo'] ?? '', 'alt' => $foto['alt'] ?? ''];
                } elseif (!empty($foto['path'])) {
                    $fotos[] = ['path' => $foto['path'], 'titulo' => $foto['titulo'] ?? '', 'alt' => $foto['alt'] ?? ''];
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
        require_admin();
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
