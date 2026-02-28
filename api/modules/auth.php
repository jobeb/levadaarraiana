<?php
/**
 * Auth module — Login + Register + Logout
 */

function handle_auth($uri, $method, $input) {
    if ($uri === '/login' && $method === 'POST') {
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        if (empty($username) || empty($password)) {
            send_json(['error' => 'Faltan credenciais'], 400);
        }

        $stmt = get_db()->prepare("SELECT * FROM socios WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !verify_password($password, $user['password'])) {
            send_json(['error' => 'Credenciais incorrectas'], 401);
        }
        if ($user['estado'] !== 'Aprobado') {
            send_json(['error' => 'Conta pendente de aprobación'], 403);
        }

        // Generate session token
        $token   = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + SESSION_DURATION);

        $stmt = get_db()->prepare(
            "UPDATE socios SET session_token=?, session_expires=?, ultimo_login=NOW() WHERE id=?"
        );
        $stmt->execute([$token, $expires, $user['id']]);

        unset($user['password'], $user['session_token'], $user['session_expires']);
        $user['token'] = $token;
        send_json($user);
    }

    if ($uri === '/register' && $method === 'POST') {
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $nome     = trim($input['nome_completo'] ?? '');
        $email    = trim($input['email'] ?? '');
        $telefono = trim($input['telefono'] ?? '');
        $instrumento = trim($input['instrumento'] ?? '');

        if (empty($username) || empty($password)) {
            send_json(['error' => 'Username e contrasinal obrigatorios'], 400);
        }

        // Check unique username
        $stmt = get_db()->prepare("SELECT id FROM socios WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            send_json(['error' => 'O username xa existe'], 409);
        }

        $hashed = hash_password($password);
        $stmt   = get_db()->prepare(
            "INSERT INTO socios (username, nome_completo, email, telefono, instrumento, password, data_alta, estado)
             VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'Pendente')"
        );
        $stmt->execute([$username, $nome, $email, $telefono, $instrumento, $hashed]);
        $id = (int)get_db()->lastInsertId();

        // Foto de perfil (base64)
        if (!empty($input['foto_data'])) {
            $ext = $input['foto_ext'] ?? 'jpg';
            $path = save_base64_file('fotos', "socio_{$id}.{$ext}", $input['foto_data']);
            get_db()->prepare("UPDATE socios SET foto = ? WHERE id = ?")->execute([$path, $id]);
        }

        send_json(['ok' => true, 'id' => $id], 201);
    }

    if ($uri === '/logout' && $method === 'POST') {
        $user = get_session_user();
        if ($user) {
            $stmt = get_db()->prepare("UPDATE socios SET session_token=NULL, session_expires=NULL WHERE id=?");
            $stmt->execute([$user['id']]);
        }
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
