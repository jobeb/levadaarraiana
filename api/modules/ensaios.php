<?php
/**
 * Módulo Ensaios + Asistencia — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'ensaios.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_ensaios($method, $uri, $input) {
    $db = get_db();

    // ---- ASISTENCIA routes ----
    if (strpos($uri, '/asistencia') === 0) {
        // GET /asistencia/resumo — attendance summary per socio (must be before generic GET)
        if ($uri === '/asistencia/resumo' && $method === 'GET') {
            require_auth();
            $rows = $db->query(
                "SELECT s.id, s.nome_completo, s.username, s.instrumento,
                        COUNT(DISTINCT e.id) AS total_ensaios,
                        SUM(CASE WHEN a.estado = 'confirmado' THEN 1 ELSE 0 END) AS confirmados,
                        SUM(CASE WHEN a.estado = 'ausente' THEN 1 ELSE 0 END) AS ausentes,
                        SUM(CASE WHEN a.estado = 'xustificado' THEN 1 ELSE 0 END) AS xustificados
                 FROM usuarios s
                 LEFT JOIN asistencia a ON a.socio_id = s.id
                 LEFT JOIN ensaios e ON e.id = a.ensaio_id AND e.estado = 'realizado'
                 WHERE s.estado = 'Aprobado'
                 GROUP BY s.id
                 ORDER BY s.nome_completo ASC"
            )->fetchAll();
            send_json($rows);
        }

        // GET /asistencia/ID — get attendance for ensaio ID (join with usuarios for nome)
        if ($method === 'GET') {
            require_auth();
            $ensaio_id = null;
            if (preg_match('#^/asistencia/(\d+)#', $uri, $m)) {
                $ensaio_id = (int)$m[1];
            }
            if (!$ensaio_id) send_error('ID de ensaio requerido', 'erro_campos_obrigatorios', 400);

            $stmt = $db->prepare(
                "SELECT a.*, s.nome_completo AS socio_nome
                 FROM asistencia a
                 LEFT JOIN usuarios s ON s.id = a.socio_id
                 WHERE a.ensaio_id = ?
                 ORDER BY s.nome_completo ASC"
            );
            $stmt->execute([$ensaio_id]);
            send_json($stmt->fetchAll());
        }

        // POST /asistencia/solicitar — non-socio request to attend
        if ($uri === '/asistencia/solicitar' && $method === 'POST') {
            require_auth();
            $user = get_session_user();

            $ensaio_id = intval($input['ensaio_id'] ?? 0);
            if (!$ensaio_id) send_error('ensaio_id requerido', 'erro_campos_obrigatorios', 400);

            $stmt = $db->prepare("SELECT * FROM ensaios WHERE id = ?");
            $stmt->execute([$ensaio_id]);
            $ensaio = $stmt->fetch();
            if (!$ensaio) send_error('Ensaio non atopado', 'erro_non_atopado', 404);

            $cfg = $db->query("SELECT * FROM config WHERE id = 1")->fetch();
            if (!$cfg || empty($cfg['email_dest'])) {
                send_error('Email de destino non configurado', 'erro_email_destino', 500);
            }

            $nome = $user['nome_completo'] ?: $user['username'];
            $body  = "Solicitude de asistencia a ensaio\n";
            $body .= "==================================\n\n";
            $body .= "Usuario: $nome\n";
            $body .= "Email: " . ($user['email'] ?: '-') . "\n";
            $body .= "Ensaio: " . $ensaio['data'];
            if ($ensaio['hora_inicio']) $body .= " " . $ensaio['hora_inicio'];
            $body .= "\n";
            if ($ensaio['lugar']) $body .= "Lugar: " . $ensaio['lugar'] . "\n";

            $subject = "Solicitude asistencia ensaio — " . $nome;
            $replyTo = $user['email'] ?: null;
            $ok = send_email($cfg['email_dest'], $subject, $body, $replyTo);

            if (!$ok) send_error('Erro ao enviar o correo', 'erro_enviar_correo', 500);
            send_json(['ok' => true]);
        }

        // POST /asistencia — set attendance (INSERT ON DUPLICATE KEY UPDATE)
        if ($method === 'POST') {
            require_auth();

            $ensaio_id = $input['ensaio_id'] ?? null;
            $socio_id = $input['socio_id'] ?? null;
            $estado = $input['estado'] ?? null;

            if (!$ensaio_id || !$socio_id || $estado === null) {
                send_error('ensaio_id, socio_id e estado son obrigatorios', 'erro_campos_obrigatorios', 400);
            }

            $stmt = $db->prepare(
                "INSERT INTO asistencia (ensaio_id, socio_id, estado)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE estado = VALUES(estado)"
            );
            $stmt->execute([$ensaio_id, $socio_id, $estado]);
            send_json(['ok' => true], 201);
        }

        send_error('Método non permitido', 'erro_metodo', 405);
    }

    // ---- ENSAIOS routes ----
    $id = null;
    if (preg_match('#^/ensaios/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all or single
    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM ensaios WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_error('Ensaio non atopado', 'erro_non_atopado', 404);
            send_json($row);
        }
        $rows = $db->query("SELECT * FROM ensaios ORDER BY data DESC")->fetchAll();
        send_json($rows);
    }

    // POST — create (admin), with optional recurrence
    if ($method === 'POST' && !$id) {
        require_socio();

        $recorrencia = $input['recorrencia'] ?? null;
        $recorrencia_fin = $input['recorrencia_fin'] ?? null;
        $data_base = $input['data'] ?? date('Y-m-d');

        if ($recorrencia && $recorrencia_fin) {
            // Generate recurring ensaios
            $grupo = (int)$db->query("SELECT COALESCE(MAX(grupo_recorrencia),0)+1 AS g FROM ensaios")->fetch()['g'];
            $dates = [];
            $current = new DateTime($data_base);
            $end = new DateTime($recorrencia_fin);
            $max = 52;
            $count = 0;

            while ($current <= $end && $count < $max) {
                $dates[] = $current->format('Y-m-d');
                $count++;
                if ($recorrencia === 'semanal') $current->modify('+1 week');
                elseif ($recorrencia === 'bisemanal') $current->modify('+2 weeks');
                elseif ($recorrencia === 'mensual') $current->modify('+1 month');
                else break;
            }

            $stmt = $db->prepare(
                "INSERT INTO ensaios (data, hora_inicio, hora_fin, lugar, notas, estado, recorrencia, recorrencia_fin, grupo_recorrencia)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            foreach ($dates as $d) {
                $stmt->execute([
                    $d,
                    $input['hora_inicio'] ?? null,
                    $input['hora_fin'] ?? null,
                    $input['lugar'] ?? '',
                    $input['notas'] ?? '',
                    $input['estado'] ?? 'programado',
                    $recorrencia,
                    $recorrencia_fin,
                    $grupo
                ]);
            }
            audit_log('CREATE', 'ensaios', null, "Recorrencia: {$recorrencia}, " . count($dates) . " ensaios");
            send_json(['ok' => true, 'count' => count($dates), 'grupo' => $grupo], 201);
        }

        // Single ensaio
        $stmt = $db->prepare(
            "INSERT INTO ensaios (data, hora_inicio, hora_fin, lugar, notas, estado)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data_base,
            $input['hora_inicio'] ?? null,
            $input['hora_fin'] ?? null,
            $input['lugar'] ?? '',
            $input['notas'] ?? '',
            $input['estado'] ?? 'programado'
        ]);
        $newId = (int)$db->lastInsertId();
        audit_log('CREATE', 'ensaios', $newId, $data_base);
        send_json(['ok' => true, 'id' => $newId], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_socio();
        $stmt = $db->prepare("SELECT * FROM ensaios WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_error('Ensaio non atopado', 'erro_non_atopado', 404);

        // Update this single ensaio
        $stmt = $db->prepare(
            "UPDATE ensaios SET data=?, hora_inicio=?, hora_fin=?, lugar=?, notas=?, estado=? WHERE id=?"
        );
        $stmt->execute([
            $input['data'] ?? $existing['data'],
            $input['hora_inicio'] ?? $existing['hora_inicio'],
            $input['hora_fin'] ?? $existing['hora_fin'],
            $input['lugar'] ?? $existing['lugar'],
            $input['notas'] ?? $existing['notas'],
            $input['estado'] ?? $existing['estado'],
            $id
        ]);

        // Handle recurrence end date change for the entire group
        $new_fin = $input['recorrencia_fin'] ?? null;
        $grupo = $existing['grupo_recorrencia'];
        if ($new_fin && $grupo) {
            $old_fin = $existing['recorrencia_fin'];
            $recorrencia = $existing['recorrencia'] ?? 'semanal';

            if ($new_fin !== $old_fin) {
                // Update recorrencia_fin on all group members
                $stmt = $db->prepare("UPDATE ensaios SET recorrencia_fin=? WHERE grupo_recorrencia=?");
                $stmt->execute([$new_fin, $grupo]);

                if ($new_fin < $old_fin) {
                    // Trim: delete ensaios after new end date
                    $stmt = $db->prepare("DELETE FROM asistencia WHERE ensaio_id IN (SELECT id FROM ensaios WHERE grupo_recorrencia=? AND data > ?)");
                    $stmt->execute([$grupo, $new_fin]);
                    $stmt = $db->prepare("DELETE FROM ensaios WHERE grupo_recorrencia=? AND data > ?");
                    $stmt->execute([$grupo, $new_fin]);
                } elseif ($new_fin > $old_fin) {
                    // Extend: find the last existing date, generate new rows after it
                    $last_row = $db->prepare("SELECT * FROM ensaios WHERE grupo_recorrencia=? ORDER BY data DESC LIMIT 1");
                    $last_row->execute([$grupo]);
                    $last = $last_row->fetch();

                    if ($last) {
                        $current = new DateTime($last['data']);
                        $end = new DateTime($new_fin);
                        $max = 52;
                        $count = 0;

                        // Advance one interval from the last date
                        if ($recorrencia === 'semanal') $current->modify('+1 week');
                        elseif ($recorrencia === 'bisemanal') $current->modify('+2 weeks');
                        elseif ($recorrencia === 'mensual') $current->modify('+1 month');

                        $ins = $db->prepare(
                            "INSERT INTO ensaios (data, hora_inicio, hora_fin, lugar, notas, estado, recorrencia, recorrencia_fin, grupo_recorrencia)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
                        );
                        while ($current <= $end && $count < $max) {
                            $ins->execute([
                                $current->format('Y-m-d'),
                                $last['hora_inicio'],
                                $last['hora_fin'],
                                $last['lugar'],
                                $last['notas'] ?? '',
                                'programado',
                                $recorrencia,
                                $new_fin,
                                $grupo
                            ]);
                            $count++;
                            if ($recorrencia === 'semanal') $current->modify('+1 week');
                            elseif ($recorrencia === 'bisemanal') $current->modify('+2 weeks');
                            elseif ($recorrencia === 'mensual') $current->modify('+1 month');
                        }
                    }
                }
            }
        }

        audit_log('UPDATE', 'ensaios', $id);
        send_json(['ok' => true]);
    }

    // DELETE — admin (supports ?scope=future for recurring)
    if ($method === 'DELETE' && $id) {
        require_socio();
        $scope = $_GET['scope'] ?? 'single';

        if ($scope === 'future') {
            // Delete this and all future in same grupo
            $stmt = $db->prepare("SELECT * FROM ensaios WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row && $row['grupo_recorrencia']) {
                $stmt = $db->prepare("DELETE FROM asistencia WHERE ensaio_id IN (SELECT id FROM ensaios WHERE grupo_recorrencia = ? AND data >= ?)");
                $stmt->execute([$row['grupo_recorrencia'], $row['data']]);
                $stmt = $db->prepare("DELETE FROM ensaios WHERE grupo_recorrencia = ? AND data >= ?");
                $stmt->execute([$row['grupo_recorrencia'], $row['data']]);
                audit_log('DELETE', 'ensaios', $id, 'scope=future');
                send_json(['ok' => true]);
            }
        }

        // Single delete
        $stmt = $db->prepare("DELETE FROM asistencia WHERE ensaio_id = ?");
        $stmt->execute([$id]);
        $stmt = $db->prepare("DELETE FROM ensaios WHERE id = ?");
        $stmt->execute([$id]);
        audit_log('DELETE', 'ensaios', $id);
        send_json(['ok' => true]);
    }

    send_error('Método non permitido', 'erro_metodo', 405);
}
