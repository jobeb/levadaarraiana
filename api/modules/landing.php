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
        $rows = $db->query("SELECT * FROM landing_seccions ORDER BY orden ASC")->fetchAll(PDO::FETCH_ASSOC);
        $rows = fix_rows($rows, [], ['parallax', 'activa', 'divisor'], ['overlay_opacidade', 'max_items', 'max_items_mobile', 'max_fotos_destacadas', 'orden']);
        send_json($rows);
    }

    // PUT /landing-seccions/reorder — socio+
    if ($method === 'PUT' && $uri === '/landing-seccions/reorder') {
        require_socio();
        $ids = $input['ids'] ?? [];
        if (!is_array($ids) || empty($ids)) send_error('ids requeridos', 'erro_campos_obrigatorios', 400);
        $stmt = $db->prepare("UPDATE landing_seccions SET orden = ? WHERE id = ?");
        foreach ($ids as $i => $id) {
            $stmt->execute([$i, $id]);
        }
        audit_log('UPDATE', 'landing', null, 'reorder');
        $rows = $db->query("SELECT * FROM landing_seccions ORDER BY orden ASC")->fetchAll(PDO::FETCH_ASSOC);
        $rows = fix_rows($rows, [], ['parallax', 'activa', 'divisor'], ['overlay_opacidade', 'max_items', 'max_items_mobile', 'max_fotos_destacadas', 'orden']);
        send_json($rows);
    }

    // PUT /landing-seccions/:id — socio+
    if ($method === 'PUT' && preg_match('#^/landing-seccions/([a-z_]+)$#', $uri, $m)) {
        require_socio();
        $secId = $m[1];

        // Validate section exists
        $stmt = $db->prepare("SELECT id FROM landing_seccions WHERE id = ?");
        $stmt->execute([$secId]);
        if (!$stmt->fetch()) {
            send_error('Seccion non atopada', 'erro_non_atopado', 404);
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
            validate_file_extension('video.' . $ext, 'video');
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
        if (array_key_exists('activa', $input)) {
            $updates[] = "activa = ?";
            $params[] = $input['activa'] ? 1 : 0;
        }
        if (array_key_exists('divisor', $input)) {
            $updates[] = "divisor = ?";
            $params[] = $input['divisor'] ? 1 : 0;
        }
        if (array_key_exists('overlay_opacidade', $input)) {
            $updates[] = "overlay_opacidade = ?";
            $params[] = floatval($input['overlay_opacidade']);
        }
        if (array_key_exists('max_items', $input)) {
            $updates[] = "max_items = ?";
            $params[] = intval($input['max_items']);
        }
        if (array_key_exists('max_items_mobile', $input)) {
            $updates[] = "max_items_mobile = ?";
            $params[] = intval($input['max_items_mobile']);
        }
        if (array_key_exists('max_fotos_destacadas', $input)) {
            $updates[] = "max_fotos_destacadas = ?";
            $params[] = intval($input['max_fotos_destacadas']);
        }
        if (array_key_exists('bg_size', $input)) {
            $v = $input['bg_size'];
            $allowed_bg_size = ['cover', 'contain', 'auto'];
            if (in_array($v, $allowed_bg_size) || preg_match('/^\d{2,4}px\s+auto$/', $v)) {
                $updates[] = "bg_size = ?";
                $params[] = $v;
            }
        }
        $allowed_bg_repeat = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'];
        if (array_key_exists('bg_repeat', $input) && in_array($input['bg_repeat'], $allowed_bg_repeat)) {
            $updates[] = "bg_repeat = ?";
            $params[] = $input['bg_repeat'];
        }
        $allowed_bg_position = ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];
        if (array_key_exists('bg_position', $input) && in_array($input['bg_position'], $allowed_bg_position)) {
            $updates[] = "bg_position = ?";
            $params[] = $input['bg_position'];
        }

        if (!empty($updates)) {
            $params[] = $secId;
            $sql = "UPDATE landing_seccions SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
        }

        audit_log('UPDATE', 'landing', null, $secId);

        // Return updated row
        $stmt = $db->prepare("SELECT * FROM landing_seccions WHERE id = ?");
        $stmt->execute([$secId]);
        $row = fix_row($stmt->fetch(PDO::FETCH_ASSOC), [], ['parallax', 'activa', 'divisor'], ['overlay_opacidade', 'max_items', 'max_items_mobile', 'max_fotos_destacadas', 'orden']);
        send_json($row);
    }

    send_error('Ruta non atopada', 'erro_non_atopado', 404);
}
