<?php
/**
 * Módulo Landing — Fondos configurables das seccions da landing page
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'landing.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_landing($method, $uri, $input) {
    $db = get_db();

    // GET /landing-seccions — público
    if ($method === 'GET' && $uri === '/landing-seccions') {
        $rows = $db->query("SELECT * FROM landing_seccions")->fetchAll(PDO::FETCH_ASSOC);
        $rows = fix_rows($rows, [], ['parallax'], ['overlay_opacidade', 'max_items']);
        send_json($rows);
    }

    // PUT /landing-seccions/:id — admin only
    if ($method === 'PUT' && preg_match('#^/landing-seccions/([a-z_]+)$#', $uri, $m)) {
        require_admin();
        $secId = $m[1];

        // Validate section exists
        $stmt = $db->prepare("SELECT id FROM landing_seccions WHERE id = ?");
        $stmt->execute([$secId]);
        if (!$stmt->fetch()) {
            send_json(['error' => 'Seccion non atopada'], 404);
        }

        $updates = [];
        $params = [];

        // Image upload
        if (!empty($input['bg_imaxe_data'])) {
            $ext = $input['bg_imaxe_ext'] ?? 'jpg';
            $ext = preg_replace('/[^a-zA-Z0-9]/', '', $ext);
            $path = process_and_save_image('landing', $secId . '_bg.' . $ext, $input['bg_imaxe_data'], 'default');
            $updates[] = "bg_imaxe = ?";
            $params[] = $path;
        }

        // Remove image
        if (!empty($input['remove_imaxe'])) {
            $row = $db->prepare("SELECT bg_imaxe FROM landing_seccions WHERE id = ?");
            $row->execute([$secId]);
            $current = $row->fetchColumn();
            if ($current) {
                $full = UPLOADS_DIR . '/' . $current;
                if (file_exists($full)) unlink($full);
            }
            $updates[] = "bg_imaxe = ''";
        }

        // Video upload
        if (!empty($input['bg_video_data'])) {
            $ext = $input['bg_video_ext'] ?? 'mp4';
            $ext = preg_replace('/[^a-zA-Z0-9]/', '', $ext);
            $path = save_base64_file('landing', $secId . '_video.' . $ext, $input['bg_video_data']);
            $updates[] = "bg_video = ?";
            $params[] = $path;
        }

        // Remove video
        if (!empty($input['remove_video'])) {
            $row = $db->prepare("SELECT bg_video FROM landing_seccions WHERE id = ?");
            $row->execute([$secId]);
            $current = $row->fetchColumn();
            if ($current) {
                $full = UPLOADS_DIR . '/' . $current;
                if (file_exists($full)) unlink($full);
            }
            $updates[] = "bg_video = ''";
        }

        // Simple fields
        if (array_key_exists('bg_cor', $input)) {
            $updates[] = "bg_cor = ?";
            $params[] = $input['bg_cor'];
        }
        if (array_key_exists('parallax', $input)) {
            $updates[] = "parallax = ?";
            $params[] = $input['parallax'] ? 1 : 0;
        }
        if (array_key_exists('overlay_opacidade', $input)) {
            $updates[] = "overlay_opacidade = ?";
            $params[] = floatval($input['overlay_opacidade']);
        }
        if (array_key_exists('max_items', $input)) {
            $updates[] = "max_items = ?";
            $params[] = intval($input['max_items']);
        }

        if (!empty($updates)) {
            $params[] = $secId;
            $sql = "UPDATE landing_seccions SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
        }

        // Return updated row
        $stmt = $db->prepare("SELECT * FROM landing_seccions WHERE id = ?");
        $stmt->execute([$secId]);
        $row = fix_row($stmt->fetch(PDO::FETCH_ASSOC), [], ['parallax'], ['overlay_opacidade', 'max_items']);
        send_json($row);
    }

    send_json(['error' => 'Ruta non atopada'], 404);
}
