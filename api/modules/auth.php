<?php
/**
 * Auth module — Login + Register + Logout
 */

function handle_auth($uri, $method, $input) {
    if ($uri === '/login' && $method === 'POST') {
        rate_limit('login:' . ($_SERVER['REMOTE_ADDR'] ?? ''), 10, 300);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        if (empty($username) || empty($password)) {
            send_error('Faltan credenciais', 'erro_faltan_credenciais', 400);
        }

        $stmt = get_db()->prepare("SELECT * FROM usuarios WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !verify_password($password, $user['password'])) {
            send_error('Credenciais incorrectas', 'erro_credenciais', 401);
        }
        if ($user['estado'] === 'Desactivado') {
            send_error('Conta desactivada', 'erro_conta_desactivada', 403);
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
        audit_log('LOGIN', 'auth', (int)$user['id'], $user['username']);
        send_json($user);
    }

    if ($uri === '/check-username' && $method === 'POST') {
        $username = trim($input['username'] ?? '');
        if (empty($username)) {
            send_json(['available' => false]);
        }
        $stmt = get_db()->prepare("SELECT id FROM usuarios WHERE username = ?");
        $stmt->execute([$username]);
        send_json(['available' => !$stmt->fetch()]);
    }

    if ($uri === '/check-email' && $method === 'POST') {
        $email = trim($input['email'] ?? '');
        if (empty($email)) {
            send_json(['available' => false]);
        }
        $stmt = get_db()->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        send_json(['available' => !$stmt->fetch()]);
    }

    if ($uri === '/register' && $method === 'POST') {
        rate_limit('register:' . ($_SERVER['REMOTE_ADDR'] ?? ''), 5, 600);
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $nome     = trim($input['nome_completo'] ?? '');
        $email    = trim($input['email'] ?? '');
        $telefono = trim($input['telefono'] ?? '');
        $instrumento = trim($input['instrumento'] ?? '');

        if (empty($username) || empty($password)) {
            send_error('Username e contrasinal obrigatorios', 'erro_username_obrigatorio', 400);
        }
        if (strlen($password) < 8) {
            send_error('O contrasinal debe ter polo menos 8 caracteres', 'erro_contrasinal_curto', 400);
        }

        // Check unique username
        $stmt = get_db()->prepare("SELECT id FROM usuarios WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            send_error('O username xa existe', 'erro_username_existe', 409);
        }

        // Check unique email
        if (!empty($email)) {
            $stmt = get_db()->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                send_error('Ese email xa esta en uso', 'erro_email_existe', 409);
            }
        }

        $hashed = hash_password($password);
        $lopd_consent = !empty($input['lopd_consent']);
        $stmt   = get_db()->prepare(
            "INSERT INTO usuarios (username, nome_completo, email, telefono, instrumento, password, role, data_alta, estado, lopd_consentimento)
             VALUES (?, ?, ?, ?, ?, ?, 'Usuario', CURDATE(), 'Activo', " . ($lopd_consent ? "NOW()" : "NULL") . ")"
        );
        $stmt->execute([$username, $nome, $email, $telefono, $instrumento, $hashed]);
        $id = (int)get_db()->lastInsertId();

        // Foto de perfil (base64)
        if (!empty($input['foto_data'])) {
            $ext = $input['foto_ext'] ?? 'jpg';
            $path = process_and_save_image('fotos', "usuario_{$id}.{$ext}", $input['foto_data'], 'avatar');
            get_db()->prepare("UPDATE usuarios SET foto = ? WHERE id = ?")->execute([$path, $id]);
        }

        audit_log('REGISTER', 'auth', $id, $username);
        send_json(['ok' => true, 'id' => $id], 201);
    }

    // ---- Forgot password ----
    if ($uri === '/forgot-password' && $method === 'POST') {
        rate_limit('forgot:' . ($_SERVER['REMOTE_ADDR'] ?? ''), 3, 600);
        $identifier = trim($input['identifier'] ?? '');
        if (empty($identifier)) {
            send_error('Introduce o teu usuario ou email', 'erro_introduce_usuario', 400);
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
        $subject = 'Restablecer contrasinal — Levada Arraiana';
        $body  = "Ola " . ($user['username']) . ",\n\n";
        $body .= "Recibiches esta mensaxe porque solicitaches restablecer o teu contrasinal.\n\n";
        $body .= "Preme na seguinte ligazon para crear un novo contrasinal:\n";
        $body .= $resetUrl . "\n\n";
        $body .= "Esta ligazon caduca en 1 hora.\n\n";
        $body .= "Se non solicitaches este cambio, ignora esta mensaxe.\n\n";
        $body .= "— Levada Arraiana";

        send_email($user['email'], $subject, $body);

        send_json(['ok' => true]);
    }

    // ---- Reset password (with token) ----
    if ($uri === '/reset-password' && $method === 'POST') {
        $token    = trim($input['token'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($token) || empty($password)) {
            send_error('Token e contrasinal obrigatorios', 'erro_token_contrasinal_obrigatorios', 400);
        }
        if (strlen($password) < 8) {
            send_error('O contrasinal debe ter polo menos 8 caracteres', 'erro_contrasinal_curto', 400);
        }

        $stmt = get_db()->prepare(
            "SELECT id FROM usuarios WHERE password_reset_token = ? AND password_reset_expires > NOW() AND estado != 'Desactivado'"
        );
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            send_error('Token non valido ou caducado', 'erro_token_invalido', 400);
        }

        // Update password and clear token
        $hashed = hash_password($password);
        $stmt = get_db()->prepare(
            "UPDATE usuarios SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?"
        );
        $stmt->execute([$hashed, $user['id']]);

        send_json(['ok' => true]);
    }

    if ($uri === '/consent' && $method === 'POST') {
        $user = require_auth();
        $stmt = get_db()->prepare("UPDATE usuarios SET lopd_consentimento = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        audit_log('CONSENT', 'auth', (int)$user['id'], 'LOPD consent accepted');
        $now = date('Y-m-d H:i:s');
        send_json(['ok' => true, 'lopd_consentimento' => $now]);
    }

    if ($uri === '/logout' && $method === 'POST') {
        $user = get_session_user();
        if ($user) {
            audit_log('LOGOUT', 'auth', (int)$user['id'], $user['username']);
            $stmt = get_db()->prepare("UPDATE usuarios SET session_token=NULL, session_expires=NULL WHERE id=?");
            $stmt->execute([$user['id']]);
        }
        send_json(['ok' => true]);
    }

    send_error('Método non permitido', 'erro_metodo', 405);
}
