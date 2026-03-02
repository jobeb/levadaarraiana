<?php
/**
 * Módulo Backup — SQL dump de todas as táboas
 * Levada Arraiana
 */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'backup.php') {
    http_response_code(403);
    exit('Forbidden');
}

function handle_backup($method, $uri, $input) {
    if ($method !== 'GET') {
        send_json(['error' => 'Método non permitido'], 405);
    }

    require_admin();

    $db = get_db();
    $tables = [
        'socios', 'noticias', 'bolos', 'albums', 'propostas',
        'documentos', 'actas',
        'votacions', 'votos', 'propostas_votos',
        'ensaios', 'asistencia', 'instrumentos',
        'repertorio',
        'youtube_tokens', 'config'
    ];

    $sql = "-- Backup Levada Arraiana\n";
    $sql .= "-- Data: " . date('Y-m-d H:i:s') . "\n";
    $sql .= "-- =========================================\n\n";
    $sql .= "SET NAMES utf8mb4;\n";
    $sql .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

    foreach ($tables as $table) {
        // Check table exists
        $check = $db->query("SHOW TABLES LIKE '$table'")->fetch();
        if (!$check) continue;

        $sql .= "-- ----------------------------------------\n";
        $sql .= "-- Táboa: $table\n";
        $sql .= "-- ----------------------------------------\n";

        // CREATE TABLE statement
        $create = $db->query("SHOW CREATE TABLE `$table`")->fetch();
        $sql .= "DROP TABLE IF EXISTS `$table`;\n";
        $sql .= $create['Create Table'] . ";\n\n";

        // INSERT rows
        $rows = $db->query("SELECT * FROM `$table`")->fetchAll();
        if (count($rows) > 0) {
            foreach ($rows as $row) {
                $cols = array_keys($row);
                $vals = array_map(function($v) use ($db) {
                    if ($v === null) return 'NULL';
                    return $db->quote($v);
                }, array_values($row));

                $sql .= "INSERT INTO `$table` (`" . implode('`, `', $cols) . "`) VALUES (" . implode(', ', $vals) . ");\n";
            }
            $sql .= "\n";
        }
    }

    $sql .= "SET FOREIGN_KEY_CHECKS = 1;\n";

    // Send as SQL file download
    $filename = 'levadaarraiana_backup_' . date('Y-m-d_His') . '.sql';
    header('Content-Type: application/sql');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . strlen($sql));
    echo $sql;
    exit;
}
