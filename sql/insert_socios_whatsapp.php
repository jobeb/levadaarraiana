<?php
/**
 * Script one-shot: Crear usuarios a partir dos participantes do chat de WhatsApp.
 * Executar unha soa vez: php insert_socios_whatsapp.php
 * ou abrir no navegador: http://localhost/Levadaarraiana/sql/insert_socios_whatsapp.php
 */

// ---- DB connection (same as api/config.php) ----
$db = new PDO(
    'mysql:host=localhost;dbname=levadaarraiana;charset=utf8mb4',
    'root', '',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

// ---- Password helper (PBKDF2-SHA256) ----
function hash_password($plain) {
    $salt = bin2hex(random_bytes(16));
    $dk   = hash_pbkdf2('sha256', $plain, $salt, 260000, 64, false);
    return $salt . '$' . $dk;
}

// Default password for all new users
$default_password = hash_password('Chupit0');

// ---- Participants extracted from WhatsApp chat ----
$participants = [
    ['username' => 'maru',          'nome_completo' => 'Maru'],
    ['username' => 'dani',          'nome_completo' => 'Dani'],
    ['username' => 'javi',          'nome_completo' => 'Javi'],
    ['username' => 'lety',          'nome_completo' => 'Lety'],
    ['username' => 'alvaro',        'nome_completo' => 'Alvaro Vazquez M'],
    ['username' => 'alba',          'nome_completo' => 'Alba Álvarez'],
    ['username' => 'alex',          'nome_completo' => 'Alex'],
    ['username' => 'elena',         'nome_completo' => 'Elena'],
    ['username' => 'josito',        'nome_completo' => 'Josito'],
    ['username' => 'jose',          'nome_completo' => 'José Rodríguez Rodríguez'],
    ['username' => 'julie',         'nome_completo' => 'Julie'],
    ['username' => 'julien',        'nome_completo' => 'Julien'],
    ['username' => 'monica',        'nome_completo' => 'Monica'],
    ['username' => 'paula',         'nome_completo' => 'Paula'],
    ['username' => 'stewart',       'nome_completo' => 'Stewart'],
    ['username' => 'victor',        'nome_completo' => 'Victor'],
    ['username' => 'xurxo',         'nome_completo' => 'Xurxo'],
];

// ---- Insert ----
$stmt = $db->prepare("
    INSERT INTO usuarios (username, nome_completo, password, estado, role, data_alta)
    VALUES (:username, :nome_completo, :password, 'Activo', 'Socio', CURDATE())
");

$inserted = 0;
$skipped = 0;

echo "<pre>\n";
echo "=== Inserindo usuarios de WhatsApp ===\n\n";

foreach ($participants as $p) {
    // Check if username already exists
    $exists = $db->prepare("SELECT id FROM usuarios WHERE username = ?");
    $exists->execute([$p['username']]);
    if ($exists->fetch()) {
        echo "SKIP: {$p['username']} (xa existe)\n";
        $skipped++;
        continue;
    }

    $stmt->execute([
        ':username'      => $p['username'],
        ':nome_completo' => $p['nome_completo'],
        ':password'      => $default_password,
    ]);
    echo "  OK: {$p['username']} — {$p['nome_completo']}\n";
    $inserted++;
}

echo "\n--- Resultado ---\n";
echo "Inseridos: $inserted\n";
echo "Omitidos (xa existían): $skipped\n";
echo "Contrasinal por defecto: levada2024\n";
echo "\nNota: Os 2 números de teléfono (+34 633 59 49 37 e +34 660 51 96 55) non se incluíron porque non teñen nome.\n";
echo "</pre>\n";
