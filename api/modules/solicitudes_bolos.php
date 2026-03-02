<?php
/**
 * Modulo Solicitudes de Bolos — CRUD
 * POST   /solicitudes-bolos       (publica)  — crear solicitude + email
 * GET    /solicitudes-bolos       (socio+)   — listar todas
 * PUT    /solicitudes-bolos/:id   (socio+)   — cambiar estado/notas
 * DELETE /solicitudes-bolos/:id   (socio+)   — eliminar
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'solicitudes_bolos.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_solicitudes_bolos($method, $uri, $input) {
    // Extract ID from URI
    $id = null;
    if (preg_match('#/solicitudes-bolos/(\d+)#', $uri, $m)) {
        $id = (int) $m[1];
    }

    // POST — public: create new solicitude
    if ($method === 'POST' && !$id) {
        $nome  = trim($input['nome'] ?? '');
        $email = trim($input['email'] ?? '');
        if (!$nome || !$email) {
            send_json(['error' => 'Nome e email son obrigatorios'], 400);
        }
        if (strpos($email, '@') === false) {
            send_json(['error' => 'Email non valido'], 400);
        }

        $telefono    = trim($input['telefono'] ?? '');
        $data_evento = trim($input['data_evento'] ?? '') ?: null;
        $lugar       = trim($input['lugar'] ?? '');
        $tipo        = trim($input['tipo'] ?? '');
        $descricion  = trim($input['descricion'] ?? '');

        $db = get_db();
        $st = $db->prepare("INSERT INTO solicitudes_bolos (nome, email, telefono, data_evento, lugar, tipo, descricion) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $st->execute([$nome, $email, $telefono, $data_evento, $lugar, $tipo, $descricion]);
        $newId = $db->lastInsertId();

        // Send notification email
        _sol_bolos_send_email($db, $nome, $email, $telefono, $data_evento, $lugar, $tipo, $descricion);

        send_json(['ok' => true, 'id' => (int) $newId]);
    }

    // All other methods require socio+
    $user = require_socio();

    // GET — list all
    if ($method === 'GET' && !$id) {
        $db = get_db();
        $rows = $db->query("SELECT * FROM solicitudes_bolos ORDER BY creado DESC")->fetchAll();
        send_json($rows);
    }

    // PUT — update estado/notas
    if ($method === 'PUT' && $id) {
        $db = get_db();
        $sets = [];
        $vals = [];

        if (isset($input['estado'])) {
            $sets[] = 'estado = ?';
            $vals[] = trim($input['estado']);
        }
        if (isset($input['notas'])) {
            $sets[] = 'notas = ?';
            $vals[] = trim($input['notas']);
        }

        if (empty($sets)) {
            send_json(['error' => 'Nada que actualizar'], 400);
        }

        $vals[] = $id;
        $db->prepare("UPDATE solicitudes_bolos SET " . implode(', ', $sets) . " WHERE id = ?")->execute($vals);
        send_json(['ok' => true]);
    }

    // DELETE
    if ($method === 'DELETE' && $id) {
        $db = get_db();
        $db->prepare("DELETE FROM solicitudes_bolos WHERE id = ?")->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Ruta non atopada'], 404);
}

function _sol_bolos_send_email($db, $nome, $email, $telefono, $data_evento, $lugar, $tipo, $descricion) {
    $cfg = $db->query("SELECT * FROM config WHERE id = 1")->fetch();
    if (!$cfg || empty($cfg['email_dest'])) return;

    $to = $cfg['email_dest'];

    $body  = "Nova solicitude de contratacion\n";
    $body .= "================================\n\n";
    $body .= "Nome: $nome\n";
    $body .= "Email: $email\n";
    if ($telefono) $body .= "Telefono: $telefono\n";
    if ($data_evento) $body .= "Data evento: $data_evento\n";
    if ($lugar) $body .= "Lugar: $lugar\n";
    if ($tipo) $body .= "Tipo: $tipo\n";
    if ($descricion) $body .= "Descricion: $descricion\n";

    $subject = "Solicitude de contratacion — Levada Arraiana";

    send_email($to, $subject, $body, $email);
}
