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
        send_json(['error' => 'Método non permitido'], 405);
    }

    $db  = get_db();
    $cfg = $db->query("SELECT * FROM config WHERE id = 1")->fetch();
    if (!$cfg || empty($cfg['email_dest'])) {
        send_json(['error' => 'Email de destino non configurado'], 500);
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
            send_json(['error' => 'Nome e email son obrigatorios'], 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            send_json(['error' => 'Email non valido'], 400);
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
        send_json(['error' => 'Erro ao enviar o correo'], 500);
    }

    send_json(['ok' => true]);
}
