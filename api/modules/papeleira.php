<?php
/**
 * Módulo Papeleira de reciclaxe — Restaurar / Eliminar definitivo
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'papeleira.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_papeleira($method, $uri, $input) {
    $db = get_db();

    $tables = [
        'noticias'     => ['titulo'],
        'bolos'        => ['titulo'],
        'albums'       => ['titulo'],
        'actas'        => ['titulo'],
        'propostas'    => ['titulo'],
        'votacions'    => ['titulo'],
        'ensaios'      => ['data', 'lugar'],
        'instrumentos' => ['nome'],
        'repertorio'   => ['nome'],
    ];

    // GET /papeleira — listar todos os elementos eliminados
    if ($uri === '/papeleira' && $method === 'GET') {
        require_socio();

        // Auto-purge: delete items older than 30 days
        foreach (array_keys($tables) as $tbl) {
            $db->exec("DELETE FROM $tbl WHERE eliminado IS NOT NULL AND eliminado < DATE_SUB(NOW(), INTERVAL 30 DAY)");
        }

        $items = [];
        foreach ($tables as $tbl => $cols) {
            $select = 'id, eliminado';
            foreach ($cols as $c) $select .= ", $c";
            $rows = $db->query("SELECT $select FROM $tbl WHERE eliminado IS NOT NULL ORDER BY eliminado DESC")->fetchAll();
            foreach ($rows as $r) {
                $label = '';
                foreach ($cols as $c) {
                    if (!empty($r[$c])) { $label = $r[$c]; break; }
                }
                $items[] = [
                    'modulo'    => $tbl,
                    'id'        => (int)$r['id'],
                    'titulo'    => $label,
                    'eliminado' => $r['eliminado'],
                ];
            }
        }

        // Sort by eliminado DESC
        usort($items, function($a, $b) {
            return strcmp($b['eliminado'], $a['eliminado']);
        });

        send_json($items);
    }

    // PUT /papeleira/restaurar — restaurar un elemento {modulo, id}
    if ($uri === '/papeleira/restaurar' && $method === 'PUT') {
        require_socio();
        $modulo = $input['modulo'] ?? '';
        $id = (int)($input['id'] ?? 0);
        if (!isset($tables[$modulo]) || !$id) {
            send_error('Datos incorrectos', 'erro_campos_obrigatorios', 400);
        }
        $stmt = $db->prepare("UPDATE $modulo SET eliminado = NULL WHERE id = ?");
        $stmt->execute([$id]);
        audit_log('UPDATE', 'papeleira', $id, "Restaurado: $modulo");
        send_json(['ok' => true]);
    }

    // DELETE /papeleira/definitivo — eliminar definitivamente {modulo, id}
    if ($uri === '/papeleira/definitivo' && $method === 'DELETE') {
        require_socio();
        $modulo = $input['modulo'] ?? '';
        $id = (int)($input['id'] ?? 0);
        if (!isset($tables[$modulo]) || !$id) {
            send_error('Datos incorrectos', 'erro_campos_obrigatorios', 400);
        }
        $stmt = $db->prepare("DELETE FROM $modulo WHERE id = ? AND eliminado IS NOT NULL");
        $stmt->execute([$id]);
        audit_log('DELETE', 'papeleira', $id, "Definitivo: $modulo");
        send_json(['ok' => true]);
    }

    send_error('Ruta de papeleira non atopada', 'erro_non_atopado', 404);
}
