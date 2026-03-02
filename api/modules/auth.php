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

        $stmt = get_db()->prepare("SELECT * FROM usuarios WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !verify_password($password, $user['password'])) {
            send_json(['error' => 'Credenciais incorrectas'], 401);
        }
        if ($user['estado'] === 'Desactivado') {
            send_json(['error' => 'Conta desactivada'], 403);
        }

        // Generate session token
        $token   = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + SESSION_DURATION);

        $stmt = get_db()->prepare(
            "UPDATE usuarios SET session_token=?, session_expires=?, ultimo_login=NOW() WHERE id=?"
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
        $stmt = get_db()->prepare("SELECT id FROM usuarios WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            send_json(['error' => 'O username xa existe'], 409);
        }

        $hashed = hash_password($password);
        $stmt   = get_db()->prepare(
            "INSERT INTO usuarios (username, nome_completo, email, telefono, instrumento, password, role, data_alta, estado)
             VALUES (?, ?, ?, ?, ?, ?, 'Usuario', CURDATE(), 'Activo')"
        );
        $stmt->execute([$username, $nome, $email, $telefono, $instrumento, $hashed]);
        $id = (int)get_db()->lastInsertId();

        // Foto de perfil (base64)
        if (!empty($input['foto_data'])) {
            $ext = $input['foto_ext'] ?? 'jpg';
            $path = process_and_save_image('fotos', "usuario_{$id}.{$ext}", $input['foto_data'], 'avatar');
            get_db()->prepare("UPDATE usuarios SET foto = ? WHERE id = ?")->execute([$path, $id]);
        }

        send_json(['ok' => true, 'id' => $id], 201);
    }

    // ---- Forgot password ----
    if ($uri === '/forgot-password' && $method === 'POST') {
        $identifier = trim($input['identifier'] ?? '');
        if (empty($identifier)) {
            send_json(['error' => 'Introduce o teu usuario ou email'], 400);
        }

        // Find user by username or email
        $stmt = get_db()->prepare("SELECT id, username, email, estado FROM usuarios WHERE username = ? OR email = ?");
        $stmt->execute([$identifier, $identifier]);
        $user = $stmt->fetch();

        // Always respond with success to prevent user enumeration
        if (!$user || empty($user['email']) || $user['estado'] === 'Desactivado') {
            send_json(['ok' => true]);
        }

        // Generate token (expires in 1 hour)
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600);

        $stmt = get_db()->prepare("UPDATE usuarios SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?");
        $stmt->execute([$token, $expires, $user['id']]);

        // Build reset URL
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $basePath = str_replace('/api', '', dirname($_SERVER['SCRIPT_NAME']));
        $resetUrl = $protocol . '://' . $host . $basePath . '/index.html?reset_token=' . $token;

        // Send email
        $cfg = get_db()->query("SELECT * FROM config WHERE id = 1")->fetch();
        $from = ($cfg['smtp_from'] ?? '') ?: (($cfg['smtp_user'] ?? '') ?: 'noreply@levadaarraiana.gal');

        $subject = 'Restablecer contrasinal — Levada Arraiana';
        $body  = "Ola " . ($user['username']) . ",\n\n";
        $body .= "Recibiches esta mensaxe porque solicitaches restablecer o teu contrasinal.\n\n";
        $body .= "Preme na seguinte ligazon para crear un novo contrasinal:\n";
        $body .= $resetUrl . "\n\n";
        $body .= "Esta ligazon caduca en 1 hora.\n\n";
        $body .= "Se non solicitaches este cambio, ignora esta mensaxe.\n\n";
        $body .= "— Levada Arraiana";

        $headers  = "From: $from\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        @mail($user['email'], $subject, $body, $headers);

        send_json(['ok' => true]);
    }

    // ---- Reset password (with token) ----
    if ($uri === '/reset-password' && $method === 'POST') {
        $token    = trim($input['token'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($token) || empty($password)) {
            send_json(['error' => 'Token e contrasinal obrigatorios'], 400);
        }
        if (strlen($password) < 4) {
            send_json(['error' => 'O contrasinal debe ter polo menos 4 caracteres'], 400);
        }

        $stmt = get_db()->prepare(
            "SELECT id FROM usuarios WHERE password_reset_token = ? AND password_reset_expires > NOW() AND estado != 'Desactivado'"
        );
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            send_json(['error' => 'Token non valido ou caducado'], 400);
        }

        // Update password and clear token
        $hashed = hash_password($password);
        $stmt = get_db()->prepare(
            "UPDATE usuarios SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?"
        );
        $stmt->execute([$hashed, $user['id']]);

        send_json(['ok' => true]);
    }

    if ($uri === '/logout' && $method === 'POST') {
        $user = get_session_user();
        if ($user) {
            $stmt = get_db()->prepare("UPDATE usuarios SET session_token=NULL, session_expires=NULL WHERE id=?");
            $stmt->execute([$user['id']]);
        }
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
