<?php
/**
 * Módulo Newsletter — Suscrición e envío
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'newsletter.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_newsletter($method, $uri, $input) {
    $db = get_db();

    // GET /newsletter/baixa/TOKEN — desuscribir (público, link desde email)
    if ($method === 'GET' && preg_match('#^/newsletter/baixa/([a-zA-Z0-9]+)$#', $uri, $m)) {
        $token = $m[1];
        $stmt = $db->prepare("UPDATE newsletter SET activo = 0 WHERE token_baixa = ? AND activo = 1");
        $stmt->execute([$token]);
        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px">';
        if ($stmt->rowCount() > 0) {
            echo '<h2>Desuscrito correctamente</h2><p>Non recibirás máis correos da newsletter.</p>';
        } else {
            echo '<h2>Enlace non válido</h2><p>Este enlace xa foi usado ou non é válido.</p>';
        }
        echo '</body></html>';
        exit;
    }

    // GET /newsletter/me — check my subscription status (auth)
    if ($uri === '/newsletter/me' && $method === 'GET') {
        require_auth();
        $user = get_current_user_safe();
        $email = $user['email'] ?? '';
        if (!$email) send_json(['suscrito' => false]);
        $stmt = $db->prepare("SELECT activo FROM newsletter WHERE email = ?");
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        send_json(['suscrito' => $row && $row['activo'] == 1]);
    }

    // PUT /newsletter/me — toggle my subscription (auth)
    if ($uri === '/newsletter/me' && $method === 'PUT') {
        require_auth();
        $user = get_current_user_safe();
        $email = $user['email'] ?? '';
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            send_error('Necesitas ter un email no teu perfil', 'erro_email_invalido', 400);
        }
        $activo = $input['activo'] ? 1 : 0;
        if ($activo) {
            $token = bin2hex(random_bytes(16));
            $stmt = $db->prepare(
                "INSERT INTO newsletter (email, activo, token_baixa) VALUES (?, 1, ?)
                 ON DUPLICATE KEY UPDATE activo = 1, token_baixa = VALUES(token_baixa)"
            );
            $stmt->execute([$email, $token]);
            audit_log('CREATE', 'newsletter', null, $email);
        } else {
            $stmt = $db->prepare("UPDATE newsletter SET activo = 0 WHERE email = ?");
            $stmt->execute([$email]);
            audit_log('UPDATE', 'newsletter', null, 'desuscrito: ' . $email);
        }
        send_json(['ok' => true, 'suscrito' => (bool)$activo]);
    }

    // POST /newsletter — suscribir (público)
    if ($uri === '/newsletter' && $method === 'POST') {
        $email = trim($input['email'] ?? '');
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            send_error('Email non válido', 'erro_email_invalido', 400);
        }

        $token = bin2hex(random_bytes(16));

        // Insert or reactivate
        $stmt = $db->prepare(
            "INSERT INTO newsletter (email, activo, token_baixa) VALUES (?, 1, ?)
             ON DUPLICATE KEY UPDATE activo = 1, token_baixa = VALUES(token_baixa)"
        );
        $stmt->execute([$email, $token]);

        audit_log('CREATE', 'newsletter', null, $email);
        send_json(['ok' => true]);
    }

    // GET /newsletter — listar suscritores (admin)
    if ($uri === '/newsletter' && $method === 'GET') {
        require_admin();
        $rows = $db->query("SELECT id, email, activo, creado FROM newsletter ORDER BY creado DESC")->fetchAll();
        send_json($rows);
    }

    // DELETE /newsletter/ID — eliminar suscritor (admin)
    if (preg_match('#^/newsletter/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        require_admin();
        $id = (int)$m[1];
        $db->prepare("DELETE FROM newsletter WHERE id = ?")->execute([$id]);
        audit_log('DELETE', 'newsletter', $id);
        send_json(['ok' => true]);
    }

    send_error('Ruta de newsletter non atopada', 'erro_non_atopado', 404);
}
