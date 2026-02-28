<?php
/**
 * Módulo Mensaxes — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'mensaxes.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_mensaxes($method, $uri, $input) {
    $db = get_db();

    // PUT /mensaxes/ID/lido → marcar como lida (engadir user_id ao array lidos)
    if (preg_match('#^/mensaxes/(\d+)/lido$#', $uri, $m)) {
        if ($method !== 'PUT') send_json(['error' => 'Método non permitido'], 405);
        $user = require_auth();
        $id   = (int)$m[1];

        $stmt = $db->prepare("SELECT lidos FROM mensaxes WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) send_json(['error' => 'Mensaxe non atopada'], 404);

        $lidos = json_decode($row['lidos'], true) ?? [];
        $uid   = (int)$user['id'];
        if (!in_array($uid, $lidos)) {
            $lidos[] = $uid;
            $db->prepare("UPDATE mensaxes SET lidos = ? WHERE id = ?")
               ->execute([json_encode($lidos), $id]);
        }

        send_json(['ok' => true, 'lidos' => $lidos]);
    }

    // PUT /mensaxes/ID/oculto → ocultar para o usuario (engadir user_id ao array ocultos)
    if (preg_match('#^/mensaxes/(\d+)/oculto$#', $uri, $m)) {
        if ($method !== 'PUT') send_json(['error' => 'Método non permitido'], 405);
        $user = require_auth();
        $id   = (int)$m[1];

        $stmt = $db->prepare("SELECT ocultos FROM mensaxes WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) send_json(['error' => 'Mensaxe non atopada'], 404);

        $ocultos = json_decode($row['ocultos'], true) ?? [];
        $uid     = (int)$user['id'];
        if (!in_array($uid, $ocultos)) {
            $ocultos[] = $uid;
            $db->prepare("UPDATE mensaxes SET ocultos = ? WHERE id = ?")
               ->execute([json_encode($ocultos), $id]);
        }

        send_json(['ok' => true, 'ocultos' => $ocultos]);
    }

    // GET /mensaxes → listar todas
    if ($uri === '/mensaxes' && $method === 'GET') {
        require_auth();
        $rows = $db->query("SELECT * FROM mensaxes ORDER BY data DESC, id DESC")->fetchAll();
        $rows = fix_rows($rows, ['lidos', 'ficheiros', 'ocultos']);
        send_json($rows);
    }

    // GET /mensaxes/ID → unha mensaxe
    if (preg_match('#^/mensaxes/(\d+)$#', $uri, $m) && $method === 'GET') {
        require_auth();
        $stmt = $db->prepare("SELECT * FROM mensaxes WHERE id = ?");
        $stmt->execute([(int)$m[1]]);
        $row = $stmt->fetch();
        if (!$row) send_json(['error' => 'Mensaxe non atopada'], 404);
        $row = fix_row($row, ['lidos', 'ficheiros', 'ocultos']);
        send_json($row);
    }

    // POST /mensaxes → crear (calquera usuario autenticado)
    if ($uri === '/mensaxes' && $method === 'POST') {
        $user = require_auth();

        // Ficheiros base64
        $ficheiros = [];
        if (!empty($input['ficheiros']) && is_array($input['ficheiros'])) {
            foreach ($input['ficheiros'] as $i => $f) {
                if (!empty($f['data'])) {
                    $ext  = $f['ext'] ?? 'bin';
                    $nome = $f['nome'] ?? "ficheiro_{$i}.{$ext}";
                    $path = save_base64_file('mensaxes', $nome, $f['data']);
                    $ficheiros[] = ['nome' => $nome, 'path' => $path];
                } elseif (!empty($f['path'])) {
                    $ficheiros[] = $f;
                }
            }
        }

        $en_resposta_a = !empty($input['en_resposta_a']) ? (int)$input['en_resposta_a'] : null;

        $stmt = $db->prepare(
            "INSERT INTO mensaxes (titulo, texto, data, autor, autor_nome, tipo, estado, lidos, ficheiros, ocultos, en_resposta_a)
             VALUES (?, ?, NOW(), ?, ?, ?, 'Activa', '[]', ?, '[]', ?)"
        );
        $stmt->execute([
            trim($input['titulo'] ?? ''),
            $input['texto'] ?? '',
            (int)$user['id'],
            $user['nome_completo'] ?? $user['username'],
            $input['tipo'] ?? 'xeral',
            json_encode($ficheiros, JSON_UNESCAPED_UNICODE),
            $en_resposta_a,
        ]);

        send_json(['ok' => true, 'id' => (int)$db->lastInsertId()], 201);
    }

    // DELETE /mensaxes/ID → eliminar (só admin)
    if (preg_match('#^/mensaxes/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        require_admin();
        $id   = (int)$m[1];
        $stmt = $db->prepare("DELETE FROM mensaxes WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            send_json(['error' => 'Mensaxe non atopada'], 404);
        }
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Ruta de mensaxes non atopada'], 404);
}
