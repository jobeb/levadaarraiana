<?php
/**
 * Módulo Contacto — POST /contacto → enviar email de contacto
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'contacto.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_contacto($method, $uri, $input) {
    if ($method !== 'POST') {
        send_error('Método non permitido', 'erro_metodo', 405);
    }

    rate_limit('contacto:' . ($_SERVER['REMOTE_ADDR'] ?? ''), 5, 600);

    $db  = get_db();
    $cfg = $db->query("SELECT * FROM config WHERE id = 1")->fetch();
    if (!$cfg || empty($cfg['email_dest'])) {
        send_error('Email de destino non configurado', 'erro_email_destino', 500);
    }

    $nome     = trim($input['nome'] ?? '');
    $email    = trim($input['email'] ?? '');
    $asunto   = trim($input['asunto'] ?? '');
    $mensaxe  = trim($input['mensaxe'] ?? '');

    if (!$nome || !$email || !$mensaxe) {
        send_error('Nome, email e mensaxe son obrigatorios', 'erro_campos_obrigatorios', 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_error('Email non válido', 'erro_email_invalido', 400);
    }
    if (preg_match('/[\r\n]/', $email) || preg_match('/[\r\n]/', $nome)) {
        send_error('Datos non válidos', 'erro_datos_invalidos', 400);
    }

    $body  = "Mensaxe de contacto\n";
    $body .= "====================\n\n";
    $body .= "Nome: $nome\n";
    $body .= "Email: $email\n";
    if ($asunto) $body .= "Asunto: $asunto\n";
    $body .= "\nMensaxe:\n$mensaxe\n";

    $subject = ($asunto ? $asunto : "Mensaxe de contacto") . " — " . $nome;

    $ok = send_email($cfg['email_dest'], $subject, $body, $email);
    if (!$ok) {
        send_error('Erro ao enviar o correo', 'erro_enviar_correo', 500);
    }

    send_json(['ok' => true]);
}
