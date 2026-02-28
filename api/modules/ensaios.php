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
                 FROM socios s
                 LEFT JOIN asistencia a ON a.socio_id = s.id
                 LEFT JOIN ensaios e ON e.id = a.ensaio_id AND e.estado = 'realizado'
                 WHERE s.estado = 'Aprobado'
                 GROUP BY s.id
                 ORDER BY s.nome_completo ASC"
            )->fetchAll();
            send_json($rows);
        }

        // GET /asistencia/ID — get attendance for ensaio ID (join with socios for nome)
        if ($method === 'GET') {
            require_auth();
            $ensaio_id = null;
            if (preg_match('#^/asistencia/(\d+)#', $uri, $m)) {
                $ensaio_id = (int)$m[1];
            }
            if (!$ensaio_id) send_json(['error' => 'ID de ensaio requerido'], 400);

            $stmt = $db->prepare(
                "SELECT a.*, s.nome_completo AS socio_nome
                 FROM asistencia a
                 LEFT JOIN socios s ON s.id = a.socio_id
                 WHERE a.ensaio_id = ?
                 ORDER BY s.nome_completo ASC"
            );
            $stmt->execute([$ensaio_id]);
            send_json($stmt->fetchAll());
        }

        // POST /asistencia — set attendance (INSERT ON DUPLICATE KEY UPDATE)
        if ($method === 'POST') {
            require_auth();

            $ensaio_id = $input['ensaio_id'] ?? null;
            $socio_id = $input['socio_id'] ?? null;
            $estado = $input['estado'] ?? null;

            if (!$ensaio_id || !$socio_id || $estado === null) {
                send_json(['error' => 'ensaio_id, socio_id e estado son obrigatorios'], 400);
            }

            $stmt = $db->prepare(
                "INSERT INTO asistencia (ensaio_id, socio_id, estado)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE estado = VALUES(estado)"
            );
            $stmt->execute([$ensaio_id, $socio_id, $estado]);
            send_json(['ok' => true], 201);
        }

        send_json(['error' => 'Método non permitido'], 405);
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
            if (!$row) send_json(['error' => 'Ensaio non atopado'], 404);
            send_json($row);
        }
        $rows = $db->query("SELECT * FROM ensaios ORDER BY data DESC")->fetchAll();
        send_json($rows);
    }

    // POST — create (admin), with optional recurrence
    if ($method === 'POST' && !$id) {
        require_admin();

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
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_admin();
        $stmt = $db->prepare("SELECT * FROM ensaios WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Ensaio non atopado'], 404);

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
        send_json(['ok' => true]);
    }

    // DELETE — admin (supports ?scope=future for recurring)
    if ($method === 'DELETE' && $id) {
        require_admin();
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
                send_json(['ok' => true]);
            }
        }

        // Single delete
        $stmt = $db->prepare("DELETE FROM asistencia WHERE ensaio_id = ?");
        $stmt->execute([$id]);
        $stmt = $db->prepare("DELETE FROM ensaios WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
