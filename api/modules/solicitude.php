<?php
/**
 * Módulo Solicitude — POST /solicitude → enviar email de solicitude de unirse
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'solicitude.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_solicitude($method, $uri, $input) {
    if ($method !== 'POST') {
        send_error('Método non permitido', 'erro_metodo', 405);
    }

    rate_limit('solicitude:' . ($_SERVER['REMOTE_ADDR'] ?? ''), 3, 600);

    $db  = get_db();
    $cfg = $db->query("SELECT * FROM config WHERE id = 1")->fetch();
    if (!$cfg || empty($cfg['email_dest'])) {
        send_error('Email de destino non configurado', 'erro_email_destino', 500);
    }

    $to = $cfg['email_dest'];

    // Check if authenticated user
    $user = get_session_user();

    if ($user) {
        $nome       = $user['nome_completo'] ?: $user['username'];
        $email      = $user['email'] ?: '-';
        $telefono   = $user['telefono'] ?: '-';
        $instrumento = $user['instrumento'] ?: '-';
        $comentario = trim($input['comentario'] ?? '');

        $body  = "Solicitude de unirse (usuario rexistrado)\n";
        $body .= "==========================================\n\n";
        $body .= "Nome: $nome\n";
        $body .= "Email: $email\n";
        $body .= "Telefono: $telefono\n";
        $body .= "Instrumento: $instrumento\n";
        if ($comentario) {
            $body .= "Comentario: $comentario\n";
        }
    } else {
        // Anonymous — validate required fields
        $nome  = trim($input['nome'] ?? '');
        $email = trim($input['email'] ?? '');
        if (!$nome || !$email) {
            send_error('Nome e email son obrigatorios', 'erro_campos_obrigatorios', 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            send_error('Email non valido', 'erro_email_invalido', 400);
        }
        if (preg_match('/[\r\n]/', $email) || preg_match('/[\r\n]/', $nome)) {
            send_error('Datos non válidos', 'erro_datos_invalidos', 400);
        }

        $telefono   = trim($input['telefono'] ?? '');
        $comentario = trim($input['comentario'] ?? '');

        $body  = "Solicitude de unirse (visitante)\n";
        $body .= "=================================\n\n";
        $body .= "Nome: $nome\n";
        $body .= "Email: $email\n";
        if ($telefono) {
            $body .= "Telefono: $telefono\n";
        }
        if ($comentario) {
            $body .= "Comentario: $comentario\n";
        }
    }

    $subject = "Solicitude de unirse — Levada Arraiana";

    $replyTo = $user ? ($user['email'] ?: null) : $email;
    $ok = send_email($to, $subject, $body, $replyTo);
    if (!$ok) {
        send_error('Erro ao enviar o correo', 'erro_enviar_correo', 500);
    }

    send_json(['ok' => true]);
}
