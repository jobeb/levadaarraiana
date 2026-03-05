<?php
/**
 * Modulo Auditoria — Rexistro de actividade
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'auditoria.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_auditoria($method, $uri, $input) {
    $db = get_db();

    // GET /auditoria/stats — estatisticas
    if ($method === 'GET' && $uri === '/auditoria/stats') {
        require_admin();
        $row = $db->query(
            "SELECT COUNT(*) AS total,
                    MIN(creado) AS primeiro,
                    MAX(creado) AS ultimo
             FROM audit_log"
        )->fetch();
        send_json($row);
    }

    // GET /auditoria — lista paxinada con filtros
    if ($method === 'GET' && $uri === '/auditoria') {
        require_admin();

        // Auto-purge se retencion > 0
        $cfg = $db->query("SELECT audit_retencion_dias FROM config WHERE id = 1")->fetch();
        $ret = (int)($cfg['audit_retencion_dias'] ?? 90);
        if ($ret > 0) {
            $db->prepare("DELETE FROM audit_log WHERE creado < DATE_SUB(NOW(), INTERVAL ? DAY)")
               ->execute([$ret]);
        }

        $page  = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $where = [];
        $params = [];

        if (!empty($_GET['modulo'])) {
            $where[] = "modulo = ?";
            $params[] = $_GET['modulo'];
        }
        if (!empty($_GET['accion'])) {
            $where[] = "accion = ?";
            $params[] = $_GET['accion'];
        }
        if (!empty($_GET['usuario_id'])) {
            $where[] = "usuario_id = ?";
            $params[] = (int)$_GET['usuario_id'];
        }
        if (!empty($_GET['desde'])) {
            $where[] = "creado >= ?";
            $params[] = $_GET['desde'] . ' 00:00:00';
        }
        if (!empty($_GET['ata'])) {
            $where[] = "creado <= ?";
            $params[] = $_GET['ata'] . ' 23:59:59';
        }

        $whereSQL = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        // Count
        $countStmt = $db->prepare("SELECT COUNT(*) FROM audit_log $whereSQL");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Data
        $dataParams = array_merge($params, [$limit, $offset]);
        $stmt = $db->prepare(
            "SELECT * FROM audit_log $whereSQL ORDER BY creado DESC LIMIT ? OFFSET ?"
        );
        $stmt->execute($dataParams);
        $rows = $stmt->fetchAll();

        send_json([
            'data'  => $rows,
            'total' => $total,
            'page'  => $page,
            'limit' => $limit,
            'pages' => max(1, ceil($total / $limit)),
        ]);
    }

    // DELETE /auditoria/antigos — borrar rexistros antigos
    if ($method === 'DELETE' && $uri === '/auditoria/antigos') {
        require_admin();
        $dias = (int)($_GET['dias'] ?? 0);
        if ($dias <= 0) {
            send_error('Parametro dias requerido (> 0)', 'erro_campos_obrigatorios', 400);
        }
        $stmt = $db->prepare("DELETE FROM audit_log WHERE creado < DATE_SUB(NOW(), INTERVAL ? DAY)");
        $stmt->execute([$dias]);
        $deleted = $stmt->rowCount();
        audit_log('DELETE', 'auditoria', null, "Purgados $deleted rexistros > $dias dias");
        send_json(['ok' => true, 'deleted' => $deleted]);
    }

    // DELETE /auditoria — borrar todo o log
    if ($method === 'DELETE' && $uri === '/auditoria') {
        require_admin();
        $count = (int)$db->query("SELECT COUNT(*) FROM audit_log")->fetchColumn();
        $db->exec("DELETE FROM audit_log");
        audit_log('DELETE', 'auditoria', null, "Limpeza total: $count rexistros eliminados");
        send_json(['ok' => true, 'deleted' => $count]);
    }

    // PUT /auditoria/retencion — actualizar dias de retencion
    if ($method === 'PUT' && $uri === '/auditoria/retencion') {
        require_admin();
        $dias = (int)($input['dias'] ?? 90);
        $db->prepare("UPDATE config SET audit_retencion_dias = ? WHERE id = 1")->execute([$dias]);
        audit_log('CONFIG', 'auditoria', null, "Retencion cambiada a $dias dias");
        send_json(['ok' => true, 'dias' => $dias]);
    }

    send_error('Ruta de auditoria non atopada', 'erro_non_atopado', 404);
}
