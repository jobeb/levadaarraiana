<?php
/**
 * Módulo Propostas — CRUD
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'propostas.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_propostas($method, $uri, $input) {
    $db = get_db();

    // POST /propostas/ID/voto — upvote/downvote
    if (preg_match('#^/propostas/(\d+)/voto$#', $uri, $m) && $method === 'POST') {
        $user = require_auth();
        $proposta_id = (int)$m[1];
        $voto = (int)($input['voto'] ?? 1);
        if ($voto !== 1 && $voto !== -1) $voto = 1;

        $stmt = $db->prepare(
            "INSERT INTO propostas_votos (proposta_id, socio_id, voto) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE voto = VALUES(voto)"
        );
        $stmt->execute([$proposta_id, $user['id'], $voto]);
        send_json(['ok' => true]);
    }

    // DELETE /propostas/ID/voto — remove vote
    if (preg_match('#^/propostas/(\d+)/voto$#', $uri, $m) && $method === 'DELETE') {
        $user = require_auth();
        $proposta_id = (int)$m[1];
        $stmt = $db->prepare("DELETE FROM propostas_votos WHERE proposta_id = ? AND socio_id = ?");
        $stmt->execute([$proposta_id, $user['id']]);
        send_json(['ok' => true]);
    }

    // GET /propostas/ID/votos — get votes for a proposal
    if (preg_match('#^/propostas/(\d+)/votos$#', $uri, $m) && $method === 'GET') {
        require_auth();
        $proposta_id = (int)$m[1];
        $stmt = $db->prepare(
            "SELECT pv.*, s.nome_completo FROM propostas_votos pv
             LEFT JOIN socios s ON s.id = pv.socio_id
             WHERE pv.proposta_id = ?"
        );
        $stmt->execute([$proposta_id]);
        send_json($stmt->fetchAll());
    }

    // Extract ID from URI: /propostas/123
    $id = null;
    if (preg_match('#^/propostas/(\d+)#', $uri, $m)) {
        $id = (int)$m[1];
    }

    // GET — list all or single
    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM propostas WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Proposta non atopada'], 404);
            send_json(fix_row($row, ['ficheiros']));
        }
        $rows = $db->query(
            "SELECT p.*,
                    COALESCE(SUM(CASE WHEN pv.voto = 1 THEN 1 ELSE 0 END), 0) AS votos_favor,
                    COALESCE(SUM(CASE WHEN pv.voto = -1 THEN 1 ELSE 0 END), 0) AS votos_contra
             FROM propostas p
             LEFT JOIN propostas_votos pv ON pv.proposta_id = p.id
             GROUP BY p.id
             ORDER BY p.data DESC"
        )->fetchAll();
        // Check current user's vote
        $user = get_session_user();
        if ($user) {
            $uid = (int)$user['id'];
            $votes = $db->query("SELECT proposta_id, voto FROM propostas_votos WHERE socio_id = $uid")->fetchAll();
            $userVotes = [];
            foreach ($votes as $v) $userVotes[$v['proposta_id']] = (int)$v['voto'];
            foreach ($rows as &$r) {
                $r['meu_voto'] = $userVotes[$r['id']] ?? 0;
            }
        }
        send_json(fix_rows($rows, ['ficheiros']));
    }

    // POST — create (any authenticated user, set autor from session)
    if ($method === 'POST' && !$id) {
        $user = require_auth();

        $ficheiros = isset($input['ficheiros']) ? json_encode($input['ficheiros']) : '[]';

        $stmt = $db->prepare(
            "INSERT INTO propostas (titulo, texto, data, autor, autor_nome, ficheiros)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['titulo'] ?? '',
            $input['texto'] ?? '',
            $input['data'] ?? date('Y-m-d'),
            $user['id'],
            $user['nome_completo'] ?? $user['username'],
            $ficheiros
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    // PUT — update
    if ($method === 'PUT' && $id) {
        require_auth();

        $stmt = $db->prepare("SELECT * FROM propostas WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Proposta non atopada'], 404);

        $ficheiros = isset($input['ficheiros']) ? json_encode($input['ficheiros']) : $existing['ficheiros'];

        $stmt = $db->prepare(
            "UPDATE propostas SET titulo=?, texto=?, data=?, ficheiros=? WHERE id=?"
        );
        $stmt->execute([
            $input['titulo'] ?? $existing['titulo'],
            $input['texto'] ?? $existing['texto'],
            $input['data'] ?? $existing['data'],
            $ficheiros,
            $id
        ]);
        send_json(['ok' => true]);
    }

    // DELETE — admin
    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM propostas WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
