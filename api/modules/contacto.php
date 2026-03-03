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
        send_json(['error' => 'Método non permitido'], 405);
    }

    rate_limit('contacto:' . ($_SERVER['REMOTE_ADDR'] ?? ''), 5, 600);

    $db  = get_db();
    $cfg = $db->query("SELECT * FROM config WHERE id = 1")->fetch();
    if (!$cfg || empty($cfg['email_dest'])) {
        send_json(['error' => 'Email de destino non configurado'], 500);
    }

    $nome     = trim($input['nome'] ?? '');
    $email    = trim($input['email'] ?? '');
    $asunto   = trim($input['asunto'] ?? '');
    $mensaxe  = trim($input['mensaxe'] ?? '');

    if (!$nome || !$email || !$mensaxe) {
        send_json(['error' => 'Nome, email e mensaxe son obrigatorios'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_json(['error' => 'Email non válido'], 400);
    }
    if (preg_match('/[\r\n]/', $email) || preg_match('/[\r\n]/', $nome)) {
        send_json(['error' => 'Datos non válidos'], 400);
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
        send_json(['error' => 'Erro ao enviar o correo'], 500);
    }

    send_json(['ok' => true]);
}
