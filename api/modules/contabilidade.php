<?php
/**
 * Módulo Contabilidade — CRUD para clientes, proveedores, facturas, gastos
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'contabilidade.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_contabilidade($method, $uri, $input) {
    // Determine which entity based on URI prefix
    if (strpos($uri, '/clientes') === 0) {
        return _crud_clientes($method, $uri, $input);
    }
    if (strpos($uri, '/proveedores') === 0) {
        return _crud_proveedores($method, $uri, $input);
    }
    if (strpos($uri, '/facturas') === 0) {
        return _crud_facturas($method, $uri, $input);
    }
    if (strpos($uri, '/gastos') === 0) {
        return _crud_gastos($method, $uri, $input);
    }

    send_json(['error' => 'Ruta non atopada'], 404);
}

// ---- Clientes ----
function _crud_clientes($method, $uri, $input) {
    $db = get_db();
    $id = null;
    if (preg_match('#^/clientes/(\d+)#', $uri, $m)) $id = (int)$m[1];

    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM clientes WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Cliente non atopado'], 404);
            send_json($row);
        }
        $rows = $db->query("SELECT * FROM clientes ORDER BY nome ASC")->fetchAll();
        send_json($rows);
    }

    if ($method === 'POST' && !$id) {
        require_admin();
        $stmt = $db->prepare(
            "INSERT INTO clientes (nome, nif, enderezo, email, telefono) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['nome'] ?? '',
            $input['nif'] ?? '',
            $input['enderezo'] ?? '',
            $input['email'] ?? '',
            $input['telefono'] ?? ''
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    if ($method === 'PUT' && $id) {
        require_admin();
        $stmt = $db->prepare("SELECT * FROM clientes WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Cliente non atopado'], 404);

        $stmt = $db->prepare(
            "UPDATE clientes SET nome=?, nif=?, enderezo=?, email=?, telefono=? WHERE id=?"
        );
        $stmt->execute([
            $input['nome'] ?? $existing['nome'],
            $input['nif'] ?? $existing['nif'],
            $input['enderezo'] ?? $existing['enderezo'],
            $input['email'] ?? $existing['email'],
            $input['telefono'] ?? $existing['telefono'],
            $id
        ]);
        send_json(['ok' => true]);
    }

    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM clientes WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}

// ---- Proveedores ----
function _crud_proveedores($method, $uri, $input) {
    $db = get_db();
    $id = null;
    if (preg_match('#^/proveedores/(\d+)#', $uri, $m)) $id = (int)$m[1];

    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM proveedores WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Proveedor non atopado'], 404);
            send_json($row);
        }
        $rows = $db->query("SELECT * FROM proveedores ORDER BY nome ASC")->fetchAll();
        send_json($rows);
    }

    if ($method === 'POST' && !$id) {
        require_admin();
        $stmt = $db->prepare(
            "INSERT INTO proveedores (nome, nif, enderezo, email, telefono) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['nome'] ?? '',
            $input['nif'] ?? '',
            $input['enderezo'] ?? '',
            $input['email'] ?? '',
            $input['telefono'] ?? ''
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    if ($method === 'PUT' && $id) {
        require_admin();
        $stmt = $db->prepare("SELECT * FROM proveedores WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Proveedor non atopado'], 404);

        $stmt = $db->prepare(
            "UPDATE proveedores SET nome=?, nif=?, enderezo=?, email=?, telefono=? WHERE id=?"
        );
        $stmt->execute([
            $input['nome'] ?? $existing['nome'],
            $input['nif'] ?? $existing['nif'],
            $input['enderezo'] ?? $existing['enderezo'],
            $input['email'] ?? $existing['email'],
            $input['telefono'] ?? $existing['telefono'],
            $id
        ]);
        send_json(['ok' => true]);
    }

    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM proveedores WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}

// ---- Facturas ----
function _crud_facturas($method, $uri, $input) {
    $db = get_db();
    $id = null;
    if (preg_match('#^/facturas/(\d+)#', $uri, $m)) $id = (int)$m[1];

    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM facturas WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Factura non atopada'], 404);
            send_json(fix_row($row, ['lineas'], [], ['importe']));
        }
        $rows = $db->query("SELECT * FROM facturas ORDER BY data DESC")->fetchAll();
        send_json(fix_rows($rows, ['lineas'], [], ['importe']));
    }

    if ($method === 'POST' && !$id) {
        require_admin();
        $lineas = isset($input['lineas']) ? json_encode($input['lineas']) : '[]';

        $stmt = $db->prepare(
            "INSERT INTO facturas (numero, data, cliente_nome, cliente_nif, cliente_enderezo, lineas, notas, estado, importe)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['numero'] ?? '',
            $input['data'] ?? date('Y-m-d'),
            $input['cliente_nome'] ?? '',
            $input['cliente_nif'] ?? '',
            $input['cliente_enderezo'] ?? '',
            $lineas,
            $input['notas'] ?? '',
            $input['estado'] ?? 'Borrador',
            $input['importe'] ?? 0
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    if ($method === 'PUT' && $id) {
        require_admin();
        $stmt = $db->prepare("SELECT * FROM facturas WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Factura non atopada'], 404);

        $lineas = isset($input['lineas']) ? json_encode($input['lineas']) : $existing['lineas'];

        $stmt = $db->prepare(
            "UPDATE facturas SET numero=?, data=?, cliente_nome=?, cliente_nif=?, cliente_enderezo=?,
             lineas=?, notas=?, estado=?, importe=? WHERE id=?"
        );
        $stmt->execute([
            $input['numero'] ?? $existing['numero'],
            $input['data'] ?? $existing['data'],
            $input['cliente_nome'] ?? $existing['cliente_nome'],
            $input['cliente_nif'] ?? $existing['cliente_nif'],
            $input['cliente_enderezo'] ?? $existing['cliente_enderezo'],
            $lineas,
            $input['notas'] ?? $existing['notas'],
            $input['estado'] ?? $existing['estado'],
            $input['importe'] ?? $existing['importe'],
            $id
        ]);
        send_json(['ok' => true]);
    }

    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM facturas WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}

// ---- Gastos ----
function _crud_gastos($method, $uri, $input) {
    $db = get_db();
    $id = null;
    if (preg_match('#^/gastos/(\d+)#', $uri, $m)) $id = (int)$m[1];

    if ($method === 'GET') {
        require_auth();
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM gastos WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) send_json(['error' => 'Gasto non atopado'], 404);
            send_json(fix_row($row, [], [], ['importe', 'iva']));
        }
        $rows = $db->query("SELECT * FROM gastos ORDER BY data DESC")->fetchAll();
        send_json(fix_rows($rows, [], [], ['importe', 'iva']));
    }

    if ($method === 'POST' && !$id) {
        require_admin();

        $adxunto = null;
        if (!empty($input['adxunto']) && !empty($input['adxunto_nome'])) {
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $input['adxunto_nome']);
            $adxunto = save_base64_file('gastos', $safe, $input['adxunto']);
        }

        $stmt = $db->prepare(
            "INSERT INTO gastos (data, concepto, importe, iva, categoria, notas, adxunto)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['data'] ?? date('Y-m-d'),
            $input['concepto'] ?? '',
            $input['importe'] ?? 0,
            $input['iva'] ?? 0,
            $input['categoria'] ?? '',
            $input['notas'] ?? '',
            $adxunto
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()], 201);
    }

    if ($method === 'PUT' && $id) {
        require_admin();
        $stmt = $db->prepare("SELECT * FROM gastos WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) send_json(['error' => 'Gasto non atopado'], 404);

        $adxunto = $existing['adxunto'];
        if (!empty($input['adxunto']) && !empty($input['adxunto_nome'])) {
            $safe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $input['adxunto_nome']);
            $adxunto = save_base64_file('gastos', $safe, $input['adxunto']);
        }

        $stmt = $db->prepare(
            "UPDATE gastos SET data=?, concepto=?, importe=?, iva=?, categoria=?, notas=?, adxunto=? WHERE id=?"
        );
        $stmt->execute([
            $input['data'] ?? $existing['data'],
            $input['concepto'] ?? $existing['concepto'],
            $input['importe'] ?? $existing['importe'],
            $input['iva'] ?? $existing['iva'],
            $input['categoria'] ?? $existing['categoria'],
            $input['notas'] ?? $existing['notas'],
            $adxunto,
            $id
        ]);
        send_json(['ok' => true]);
    }

    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM gastos WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
    }

    send_json(['error' => 'Método non permitido'], 405);
}
