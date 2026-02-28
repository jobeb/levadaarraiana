<?php
/**
 * Módulo Configuración — GET/PUT config row
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'configuracion.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_configuracion($method, $uri, $input) {
    $db = get_db();

    // GET /config — return config row (id=1) — público
    if ($method === 'GET') {
        $row = $db->query("SELECT * FROM config WHERE id = 1")->fetch();
        if (!$row) send_json(['error' => 'Configuración non atopada'], 404);
        // Mask SMTP password and YouTube secret for non-admin users
        $user = get_session_user();
        if (!in_array($user['role'] ?? '', ['Admin', 'Director'])) {
            if (isset($row['smtp_pass']) && $row['smtp_pass']) {
                $row['smtp_pass'] = '********';
            }
            if (isset($row['youtube_client_secret']) && $row['youtube_client_secret']) {
                $row['youtube_client_secret'] = '********';
            }
        }
        send_json($row);
    }

    // PUT /config — update all fields (admin only)
    if ($method === 'PUT') {
        require_admin();

        $row = $db->query("SELECT * FROM config WHERE id = 1")->fetch();
        if (!$row) send_json(['error' => 'Configuración non atopada'], 404);

        // Do not overwrite smtp_pass if the masked value is sent back
        $smtp_pass = $input['smtp_pass'] ?? $row['smtp_pass'];
        if ($smtp_pass === '********') {
            $smtp_pass = $row['smtp_pass'];
        }

        // Do not overwrite youtube_client_secret if the masked value is sent back
        $yt_secret = $input['youtube_client_secret'] ?? $row['youtube_client_secret'] ?? '';
        if ($yt_secret === '********') {
            $yt_secret = $row['youtube_client_secret'] ?? '';
        }

        $stmt = $db->prepare(
            "UPDATE config SET
                nome_asociacion=?, smtp_host=?, smtp_port=?, smtp_user=?, smtp_pass=?,
                smtp_from=?, smtp_cifrado=?, email_dest=?,
                fiscal_nome=?, fiscal_nif=?, fiscal_enderezo=?, fiscal_cp=?,
                fiscal_localidade=?, fiscal_provincia=?, fiscal_telefono=?, fiscal_email=?,
                sobre_nos_gl=?, sobre_nos_es=?, sobre_nos_pt=?, sobre_nos_en=?,
                youtube_client_id=?, youtube_client_secret=?
             WHERE id = 1"
        );
        $stmt->execute([
            $input['nome_asociacion'] ?? $row['nome_asociacion'],
            $input['smtp_host'] ?? $row['smtp_host'],
            $input['smtp_port'] ?? $row['smtp_port'],
            $input['smtp_user'] ?? $row['smtp_user'],
            $smtp_pass,
            $input['smtp_from'] ?? $row['smtp_from'],
            $input['smtp_cifrado'] ?? $row['smtp_cifrado'],
            $input['email_dest'] ?? $row['email_dest'],
            $input['fiscal_nome'] ?? $row['fiscal_nome'],
            $input['fiscal_nif'] ?? $row['fiscal_nif'],
            $input['fiscal_enderezo'] ?? $row['fiscal_enderezo'],
            $input['fiscal_cp'] ?? $row['fiscal_cp'],
            $input['fiscal_localidade'] ?? $row['fiscal_localidade'],
            $input['fiscal_provincia'] ?? $row['fiscal_provincia'],
            $input['fiscal_telefono'] ?? $row['fiscal_telefono'],
            $input['fiscal_email'] ?? $row['fiscal_email'],
            $input['sobre_nos_gl'] ?? $row['sobre_nos_gl'],
            $input['sobre_nos_es'] ?? $row['sobre_nos_es'],
            $input['sobre_nos_pt'] ?? $row['sobre_nos_pt'],
            $input['sobre_nos_en'] ?? $row['sobre_nos_en'],
            $input['youtube_client_id'] ?? $row['youtube_client_id'] ?? '',
            $yt_secret,
        ]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
