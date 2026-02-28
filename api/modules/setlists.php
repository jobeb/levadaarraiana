<?php
/**
 * Módulo Setlists — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'setlists.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_setlists($method, $uri, $input) {
    $db = get_db();

    // /setlists/ID/items — manage items within a setlist
    if (preg_match('#^/setlists/(\d+)/items(?:/(\d+))?$#', $uri, $m)) {
        $setlist_id = (int)$m[1];
        $item_id = isset($m[2]) ? (int)$m[2] : null;

        // GET /setlists/ID/items — list items with repertorio info
        if ($method === 'GET') {
            require_auth();
            $stmt = $db->prepare(
                "SELECT si.*, r.nome AS peza_nome, r.tipo AS peza_tipo, r.tempo_bpm
                 FROM setlist_items si
                 LEFT JOIN repertorio r ON r.id = si.repertorio_id
                 WHERE si.setlist_id = ?
                 ORDER BY si.orde ASC"
            );
            $stmt->execute([$setlist_id]);
            send_json($stmt->fetchAll());
        }

        // POST /setlists/ID/items — add item
        if ($method === 'POST') {
            require_admin();
            $maxOrde = $db->prepare("SELECT COALESCE(MAX(orde),0)+1 FROM setlist_items WHERE setlist_id = ?");
            $maxOrde->execute([$setlist_id]);
            $nextOrde = (int)$maxOrde->fetchColumn();

            $stmt = $db->prepare(
                "INSERT INTO setlist_items (setlist_id, repertorio_id, orde, notas) VALUES (?, ?, ?, ?)"
            );
            $stmt->execute([
                $setlist_id,
                (int)($input['repertorio_id'] ?? 0),
                $input['orde'] ?? $nextOrde,
                $input['notas'] ?? ''
            ]);
            send_json(['ok' => true, 'id' => (int)$db->lastInsertId()], 201);
        }

        // PUT /setlists/ID/items/ITEM_ID — update item (reorder/notes)
        if ($method === 'PUT' && $item_id) {
            require_admin();
            $stmt = $db->prepare("UPDATE setlist_items SET orde=?, notas=? WHERE id=? AND setlist_id=?");
            $stmt->execute([
                (int)($input['orde'] ?? 0),
                $input['notas'] ?? '',
                $item_id,
                $setlist_id
            ]);
            send_json(['ok' => true]);
        }

        // DELETE /setlists/ID/items/ITEM_ID — remove item
        if ($method === 'DELETE' && $item_id) {
            require_admin();
            $stmt = $db->prepare("DELETE FROM setlist_items WHERE id = ? AND setlist_id = ?");
            $stmt->execute([$item_id, $setlist_id]);
            send_json(['ok' => true]);
        }

        send_json(['error' => 'Método non permitido'], 405);
    }

    // PUT /setlists/ID/reorder — bulk reorder items
    if (preg_match('#^/setlists/(\d+)/reorder$#', $uri, $m) && $method === 'PUT') {
        require_admin();
        $setlist_id = (int)$m[1];
        $items = $input['items'] ?? [];
        $stmt = $db->prepare("UPDATE setlist_items SET orde = ? WHERE id = ? AND setlist_id = ?");
        foreach ($items as $i => $itemId) {
            $stmt->execute([$i, (int)$itemId, $setlist_id]);
        }
        send_json(['ok' => true]);
    }

    // Extract ID
    $id = null;
    if (preg_match('#^/setlists/(\d+)$#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all or single
    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare(
                "SELECT s.*, COUNT(si.id) AS num_items
                 FROM setlists s
                 LEFT JOIN setlist_items si ON si.setlist_id = s.id
                 WHERE s.id = ? GROUP BY s.id"
            );
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Setlist non atopada'], 404);
            send_json($row);
        }
        $rows = $db->query(
            "SELECT s.*, COUNT(si.id) AS num_items, b.titulo AS bolo_nome
             FROM setlists s
             LEFT JOIN setlist_items si ON si.setlist_id = s.id
             LEFT JOIN bolos b ON b.id = s.bolo_id
             GROUP BY s.id
             ORDER BY s.creado DESC"
        )->fetchAll();
        send_json($rows);
    }

    // POST — create
    if ($method === 'POST' && !$id) {
        require_admin();
        $stmt = $db->prepare(
            "INSERT INTO setlists (nome, descricion, bolo_id) VALUES (?, ?, ?)"
        );
        $stmt->execute([
            $input['nome'] ?? '',
            $input['descricion'] ?? '',
            !empty($input['bolo_id']) ? (int)$input['bolo_id'] : null
        ]);
        send_json(['ok' => true, 'id' => (int)$db->lastInsertId()], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_admin();
        $stmt = $db->prepare("UPDATE setlists SET nome=?, descricion=?, bolo_id=? WHERE id=?");
        $stmt->execute([
            $input['nome'] ?? '',
            $input['descricion'] ?? '',
            !empty($input['bolo_id']) ? (int)$input['bolo_id'] : null,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM setlists WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
