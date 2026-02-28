/**
 * Export CSV utility
 * exportCSV(filename, headers, rows)
 * headers = ['Col A', 'Col B']
 * rows = [['val1', 'val2'], ...]
 */
function exportCSV(filename, headers, rows) {
    var BOM = '\uFEFF'; // UTF-8 BOM for Excel
    var sep = ';'; // semicolon for European locale
    var lines = [];

    // Escape CSV field
    function esc_csv(val) {
        var s = String(val == null ? '' : val);
        if (s.indexOf(sep) !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    lines.push(headers.map(esc_csv).join(sep));
    rows.forEach(function(row) {
        lines.push(row.map(esc_csv).join(sep));
    });

    var csv = BOM + lines.join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
