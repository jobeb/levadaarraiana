<?php
/**
 * Módulo Arquivos — Explorador de arquivos unificado
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'arquivos.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_arquivos($method, $uri, $input) {
    // GET — scan all upload folders
    if ($method === 'GET') {
        require_auth();
        $base = UPLOADS_DIR;
        $result = [];
        $folders = ['fotos','noticias','albums','bolos','documentos',
                     'actas','propostas','repertorio','ensaios','instrumentos','votacions','landing'];
        foreach ($folders as $folder) {
            $dir = $base . '/' . $folder;
            if (!is_dir($dir)) continue;
            $files = scan_folder($dir, $folder);
            $result[] = ['folder' => $folder, 'files' => $files];
        }
        send_json($result);
    }

    // POST /arquivos/upload-imaxe — upload image from rich text editor
    if ($method === 'POST' && $uri === '/arquivos/upload-imaxe') {
        require_socio();
        $dir = preg_replace('/[^a-zA-Z0-9_-]/', '', $input['dir'] ?? 'general');
        $name = $input['name'] ?? 'img.jpg';
        $data = $input['data'] ?? '';
        if (!$data) send_error('Sen datos de imaxe', 'erro_campos_obrigatorios', 400);

        validate_file_extension($name, 'image');
        $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $name);
        $url = process_and_save_image($dir, $safe, $data);
        send_json(['ok' => true, 'url' => $url]);
    }

    // POST /arquivos/upload — multi-file upload
    if ($method === 'POST' && $uri === '/arquivos/upload') {
        require_socio();
        $dir = preg_replace('/[^a-zA-Z0-9_-]/', '', $input['dir'] ?? 'documentos');
        $name = $input['name'] ?? '';
        $data = $input['data'] ?? '';
        $type = $input['type'] ?? '';
        if (!$name || !$data) send_error('Faltan datos', 'erro_campos_obrigatorios', 400);

        // Determine if it's an image
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $image_exts = ['jpg','jpeg','png','gif','webp'];
        $is_image = in_array($ext, $image_exts);

        // Validate extension (allow images + documents + media)
        $allowed = ['jpg','jpeg','png','gif','webp','svg',
                     'pdf','doc','docx','xls','xlsx','ppt','pptx','txt','odt','ods',
                     'mp4','webm','ogg','mov','avi',
                     'mp3','wav','m4a'];
        if (!in_array($ext, $allowed)) {
            send_error('Tipo de arquivo non permitido: .' . $ext, 'erro_tipo_arquivo', 400);
        }

        $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $name);

        if ($is_image) {
            $url = process_and_save_image($dir, $safe, $data);
        } else {
            $url = save_base64_file($dir, $safe, $data);
        }

        send_json(['ok' => true, 'url' => $url]);
    }

    // DELETE — remove a file
    if ($method === 'DELETE') {
        require_socio();
        $path = trim($input['path'] ?? '');
        if (!$path || strpos($path, '..') !== false) {
            send_error('Ruta non válida', 'erro_datos_invalidos', 400);
        }
        $full = UPLOADS_DIR . '/' . $path;
        $real = realpath($full);
        if ($real === false || strpos($real, realpath(UPLOADS_DIR)) !== 0) {
            send_error('Ruta non válida', 'erro_datos_invalidos', 400);
        }
        unlink($real);
        send_json(['ok' => true]);
    }

    send_error('Método non permitido', 'erro_metodo', 405);
}

function scan_folder($dir, $prefix) {
    $files = [];
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $full = $dir . '/' . $item;
        if (is_dir($full)) {
            $subfiles = scan_folder($full, $prefix . '/' . $item);
            $files = array_merge($files, $subfiles);
        } else {
            $files[] = [
                'name' => $item,
                'path' => $prefix . '/' . $item,
                'size' => filesize($full),
                'modified' => date('Y-m-d H:i', filemtime($full))
            ];
        }
    }
    return $files;
}
