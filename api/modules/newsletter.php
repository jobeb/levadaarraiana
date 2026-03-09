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
        $lang = $_GET['lang'] ?? 'gl';
        $i18n_unsub = [
            'gl' => ['ok_title' => 'Desuscrito correctamente', 'ok_msg' => 'Non recibirás máis correos da newsletter.', 'err_title' => 'Enlace non válido', 'err_msg' => 'Este enlace xa foi usado ou non é válido.'],
            'es' => ['ok_title' => 'Desuscrito correctamente', 'ok_msg' => 'No recibirás más correos de la newsletter.', 'err_title' => 'Enlace no válido', 'err_msg' => 'Este enlace ya fue usado o no es válido.'],
            'pt' => ['ok_title' => 'Cancelado com sucesso', 'ok_msg' => 'Não receberá mais emails da newsletter.', 'err_title' => 'Link inválido', 'err_msg' => 'Este link já foi usado ou não é válido.'],
            'en' => ['ok_title' => 'Unsubscribed successfully', 'ok_msg' => 'You will no longer receive newsletter emails.', 'err_title' => 'Invalid link', 'err_msg' => 'This link has already been used or is not valid.'],
        ];
        $txt = $i18n_unsub[$lang] ?? $i18n_unsub['gl'];
        $stmt = $db->prepare("UPDATE newsletter SET activo = 0 WHERE token_baixa = ? AND activo = 1");
        $stmt->execute([$token]);
        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html><html lang="' . htmlspecialchars($lang) . '"><body style="font-family:sans-serif;text-align:center;padding:60px">';
        if ($stmt->rowCount() > 0) {
            echo '<h2>' . $txt['ok_title'] . '</h2><p>' . $txt['ok_msg'] . '</p>';
        } else {
            echo '<h2>' . $txt['err_title'] . '</h2><p>' . $txt['err_msg'] . '</p>';
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
        rate_limit('newsletter', 5, 600);
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

    // GET /newsletter — listar suscritores (socio+)
    if ($uri === '/newsletter' && $method === 'GET') {
        require_socio();
        $rows = $db->query("SELECT id, email, activo, creado FROM newsletter ORDER BY creado DESC")->fetchAll();
        send_json($rows);
    }

    // DELETE /newsletter/ID — eliminar suscritor (socio+)
    if (preg_match('#^/newsletter/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        require_socio();
        $id = (int)$m[1];
        $db->prepare("DELETE FROM newsletter WHERE id = ?")->execute([$id]);
        audit_log('DELETE', 'newsletter', $id);
        send_json(['ok' => true]);
    }

    send_error('Ruta de newsletter non atopada', 'erro_non_atopado', 404);
}
