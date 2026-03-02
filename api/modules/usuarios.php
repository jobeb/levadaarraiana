<?php
/**
 * Módulo Usuarios — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'usuarios.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_usuarios($method, $uri, $input) {
    $db = get_db();

    // GET /usuarios/me → datos propios
    if ($uri === '/usuarios/me' && $method === 'GET') {
        $user = require_auth();
        unset($user['password'], $user['session_token'], $user['session_expires']);
        send_json(fix_row($user));
    }

    // PUT /usuarios/me → actualizar perfil propio
    if ($uri === '/usuarios/me' && $method === 'PUT') {
        $user = require_auth();
        $id = $user['id'];

        $fields = [];
        $params = [];

        $updatable = ['nome_completo', 'email', 'telefono', 'instrumento'];
        foreach ($updatable as $col) {
            if (array_key_exists($col, $input)) {
                $fields[] = "$col = ?";
                $params[] = $input[$col];
            }
        }

        // Foto base64
        if (!empty($input['foto_data'])) {
            $ext = $input['foto_ext'] ?? 'jpg';
            $path = process_and_save_image('fotos', "usuario_{$id}.{$ext}", $input['foto_data'], 'avatar');
            $fields[] = "foto = ?";
            $params[] = $path;
        }

        // Cambio de contrasinal
        if (!empty($input['password_new'])) {
            if (empty($input['password_old']) || !verify_password($input['password_old'], $user['password'])) {
                send_json(['error' => 'Contrasinal actual incorrecta'], 400);
            }
            $fields[] = "password = ?";
            $params[] = hash_password($input['password_new']);
        }

        if (empty($fields)) {
            send_json(['error' => 'Non hai campos para actualizar'], 400);
        }

        $params[] = $id;
        $sql = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = ?";
        $db->prepare($sql)->execute($params);

        // Return updated user data
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        $updated = $stmt->fetch();
        unset($updated['password'], $updated['session_token'], $updated['session_expires']);
        $updated['token'] = $user['session_token'];
        send_json($updated);
    }

    // PUT /usuarios/ID/estado → cambiar estado (Activo/Desactivado)
    if (preg_match('#^/usuarios/(\d+)/estado$#', $uri, $m)) {
        if ($method !== 'PUT') send_json(['error' => 'Método non permitido'], 405);
        require_admin();
        $id     = (int)$m[1];
        $estado = $input['estado'] ?? '';
        if (!in_array($estado, ['Activo', 'Desactivado'])) {
            send_json(['error' => 'Estado non válido. Usa Activo ou Desactivado'], 400);
        }
        $stmt = $db->prepare("UPDATE usuarios SET estado = ? WHERE id = ?");
        $stmt->execute([$estado, $id]);
        if ($stmt->rowCount() === 0) {
            send_json(['error' => 'Usuario non atopado'], 404);
        }
        send_json(['ok' => true, 'id' => $id, 'estado' => $estado]);
    }

    // GET /usuarios → listar todos
    if ($uri === '/usuarios' && $method === 'GET') {
        require_auth();
        $rows = $db->query("SELECT * FROM usuarios ORDER BY id")->fetchAll();
        foreach ($rows as &$row) {
            unset($row['password'], $row['session_token'], $row['session_expires']);
        }
        unset($row);
        $rows = fix_rows($rows);
        send_json($rows);
    }

    // GET /usuarios/ID → un usuario
    if (preg_match('#^/usuarios/(\d+)$#', $uri, $m) && $method === 'GET') {
        require_auth();
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE id = ?");
        $stmt->execute([(int)$m[1]]);
        $row = $stmt->fetch();
        if (!$row) send_json(['error' => 'Usuario non atopado'], 404);
        unset($row['password'], $row['session_token'], $row['session_expires']);
        $row = fix_row($row);
        send_json($row);
    }

    // POST /usuarios → crear
    if ($uri === '/usuarios' && $method === 'POST') {
        require_admin();
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        if (empty($username) || empty($password)) {
            send_json(['error' => 'Username e contrasinal obrigatorios'], 400);
        }

        // Comprobar username único
        $check = $db->prepare("SELECT id FROM usuarios WHERE username = ?");
        $check->execute([$username]);
        if ($check->fetch()) {
            send_json(['error' => 'O username xa existe'], 409);
        }

        $hashed = hash_password($password);
        $stmt = $db->prepare(
            "INSERT INTO usuarios (username, nome_completo, dni, email, telefono, instrumento, role, estado, password, foto, data_alta)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())"
        );
        $stmt->execute([
            $username,
            trim($input['nome_completo'] ?? ''),
            trim($input['dni'] ?? ''),
            trim($input['email'] ?? ''),
            trim($input['telefono'] ?? ''),
            trim($input['instrumento'] ?? ''),
            $input['role'] ?? 'Usuario',
            $input['estado'] ?? 'Activo',
            $hashed,
            null,
        ]);
        $newId = (int)$db->lastInsertId();

        // Procesar foto base64 despois de ter o ID
        if (!empty($input['foto_data'])) {
            $ext = $input['foto_ext'] ?? 'jpg';
            $foto_path = process_and_save_image('fotos', "foto_{$newId}.{$ext}", $input['foto_data'], 'avatar');
            $db->prepare("UPDATE usuarios SET foto = ? WHERE id = ?")->execute([$foto_path, $newId]);
        }

        send_json(['ok' => true, 'id' => $newId], 201);
    }

    // PUT /usuarios/ID → actualizar
    if (preg_match('#^/usuarios/(\d+)$#', $uri, $m) && $method === 'PUT') {
        require_admin();
        $id = (int)$m[1];

        // Comprobar que existe
        $check = $db->prepare("SELECT id FROM usuarios WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) send_json(['error' => 'Usuario non atopado'], 404);

        // Foto base64
        $foto_path = $input['foto'] ?? null;
        if (!empty($input['foto_data'])) {
            $ext = $input['foto_ext'] ?? 'jpg';
            $foto_path = process_and_save_image('fotos', "foto_{$id}.{$ext}", $input['foto_data'], 'avatar');
        }

        $fields = [];
        $params = [];

        $updatable = ['username', 'nome_completo', 'dni', 'email', 'telefono', 'instrumento', 'role', 'estado'];
        foreach ($updatable as $col) {
            if (array_key_exists($col, $input)) {
                $fields[] = "$col = ?";
                $params[] = $input[$col];
            }
        }

        if ($foto_path !== null) {
            $fields[] = "foto = ?";
            $params[] = $foto_path;
        }

        // Actualizar password se se proporciona
        if (!empty($input['password'])) {
            $fields[] = "password = ?";
            $params[] = hash_password($input['password']);
        }

        if (empty($fields)) {
            send_json(['error' => 'Non hai campos para actualizar'], 400);
        }

        $params[] = $id;
        $sql = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = ?";
        $db->prepare($sql)->execute($params);

        send_json(['ok' => true, 'id' => $id]);
    }

    // DELETE /usuarios/ID → eliminar
    if (preg_match('#^/usuarios/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        require_admin();
        $id   = (int)$m[1];
        $stmt = $db->prepare("DELETE FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            send_json(['error' => 'Usuario non atopado'], 404);
        }
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Ruta de usuarios non atopada'], 404);
}
