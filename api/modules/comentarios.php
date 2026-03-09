<?php
/**
 * Módulo Comentarios — CRUD polimórfico (noticias + bolos)
 * Con moderación + respuestas (subcomentarios 1 nivel)
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'comentarios.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_comentarios($method, $uri, $input) {
    $db = get_db();

    // PUT /comentarios/ID → aprobar/rexeitar (require socio)
    if (preg_match('#^/comentarios/(\d+)$#', $uri, $m) && $method === 'PUT') {
        $user = require_socio();
        $id = (int)$m[1];
        $nuevo_estado = trim($input['estado'] ?? '');
        if (!in_array($nuevo_estado, ['aprobado', 'rexeitado'])) {
            send_error('Estado non válido', 'erro_datos_invalidos', 400);
        }
        $stmt = $db->prepare("UPDATE comentarios SET estado = ? WHERE id = ?");
        $stmt->execute([$nuevo_estado, $id]);
        if ($stmt->rowCount() === 0) send_error('Non atopado', 'erro_non_atopado', 404);
        send_json(['ok' => true]);
    }

    // GET /comentarios?item_type=X&item_id=Y → comentarios dun item (público, só aprobados)
    // GET /comentarios?item_type=X             → todos dese tipo (público, só aprobados)
    // GET /comentarios                          → todos (admin/socio, con filtro opcional)
    if ($uri === '/comentarios' && $method === 'GET') {
        $item_type = $_GET['item_type'] ?? null;
        $item_id   = $_GET['item_id']   ?? null;

        if ($item_type && $item_id) {
            // Público: comentarios aprobados dun item concreto
            $stmt = $db->prepare(
                "SELECT c.*, s.nome_completo AS autor_nome, s.foto AS autor_foto
                 FROM comentarios c
                 JOIN usuarios s ON s.id = c.autor_id
                 WHERE c.item_type = ? AND c.item_id = ? AND c.estado = 'aprobado'
                 ORDER BY c.creado ASC"
            );
            $stmt->execute([$item_type, (int)$item_id]);
            send_json($stmt->fetchAll());
        }

        if ($item_type) {
            // Público: todos os comentarios aprobados dun tipo
            $allowed = ['noticia', 'bolo', 'proposta'];
            if (!in_array($item_type, $allowed)) {
                send_error('item_type non válido', 'erro_datos_invalidos', 400);
            }
            $stmt = $db->prepare(
                "SELECT c.*, s.nome_completo AS autor_nome, s.foto AS autor_foto
                 FROM comentarios c
                 JOIN usuarios s ON s.id = c.autor_id
                 WHERE c.item_type = ? AND c.estado = 'aprobado'
                 ORDER BY c.creado ASC"
            );
            $stmt->execute([$item_type]);
            send_json($stmt->fetchAll());
        }

        // Sen filtro: admin/socio ve todos (con filtro opcional por estado)
        require_socio();
        $estado_filter = $_GET['estado'] ?? null;
        if ($estado_filter && in_array($estado_filter, ['pendente', 'aprobado', 'rexeitado'])) {
            $stmt = $db->prepare(
                "SELECT c.*, s.nome_completo AS autor_nome, s.foto AS autor_foto
                 FROM comentarios c
                 JOIN usuarios s ON s.id = c.autor_id
                 WHERE c.estado = ?
                 ORDER BY c.creado DESC"
            );
            $stmt->execute([$estado_filter]);
        } else {
            $stmt = $db->query(
                "SELECT c.*, s.nome_completo AS autor_nome, s.foto AS autor_foto
                 FROM comentarios c
                 JOIN usuarios s ON s.id = c.autor_id
                 ORDER BY c.creado DESC"
            );
        }
        send_json($stmt->fetchAll());
    }

    // POST /comentarios → crear comentario (require auth)
    if ($uri === '/comentarios' && $method === 'POST') {
        rate_limit('comentarios', 10, 600);
        $user = require_auth();

        $item_type = trim($input['item_type'] ?? '');
        $item_id   = (int)($input['item_id'] ?? 0);
        $texto     = trim($input['texto'] ?? '');
        $parent_id = isset($input['parent_id']) ? (int)$input['parent_id'] : null;

        if (!in_array($item_type, ['noticia', 'bolo', 'proposta'])) {
            send_error('item_type non válido', 'erro_datos_invalidos', 400);
        }
        if ($item_id <= 0) {
            send_error('item_id non válido', 'erro_datos_invalidos', 400);
        }
        if ($texto === '') {
            send_error('O texto é obrigatorio', 'erro_campos_obrigatorios', 400);
        }

        // Validar parent_id
        if ($parent_id) {
            $pstmt = $db->prepare("SELECT parent_id FROM comentarios WHERE id = ?");
            $pstmt->execute([$parent_id]);
            $parent = $pstmt->fetch();
            if (!$parent) send_error('Comentario pai non atopado', 'erro_non_atopado', 404);
            if ($parent['parent_id'] !== null) send_error('Non se pode responder a unha resposta', 'erro_datos_invalidos', 400);
        }

        // Determinar estado según moderación
        $cfg = $db->query("SELECT comentarios_moderacion FROM config WHERE id = 1")->fetch();
        $moderacion = (int)($cfg['comentarios_moderacion'] ?? 0);
        if ($moderacion && !in_array($user['role'], ['Admin', 'Socio'])) {
            $estado = 'pendente';
        } else {
            $estado = 'aprobado';
        }

        $stmt = $db->prepare(
            "INSERT INTO comentarios (item_type, item_id, texto, autor_id, parent_id, estado)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$item_type, $item_id, $texto, (int)$user['id'], $parent_id, $estado]);
        $id = (int)$db->lastInsertId();

        audit_log('CREATE', 'comentarios', $id, "$item_type#$item_id");
        send_json(['ok' => true, 'id' => $id, 'estado' => $estado], 201);
    }

    // DELETE /comentarios/ID → eliminar (owner ou admin/socio)
    if (preg_match('#^/comentarios/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $user = require_auth();
        $id   = (int)$m[1];

        $stmt = $db->prepare("SELECT * FROM comentarios WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            send_error('Comentario non atopado', 'erro_non_atopado', 404);
        }

        // O autor pode eliminar o seu; admin/socio pode eliminar calquera
        $isMod = in_array($user['role'], ['Admin', 'Socio']);
        if ((int)$row['autor_id'] !== (int)$user['id'] && !$isMod) {
            send_error('Acceso denegado', 'erro_acceso_denegado', 403);
        }

        $db->prepare("DELETE FROM comentarios WHERE id = ?")->execute([$id]);
        audit_log('DELETE', 'comentarios', $id);
        send_json(['ok' => true]);
    }

    send_error('Ruta de comentarios non atopada', 'erro_non_atopado', 404);
}
