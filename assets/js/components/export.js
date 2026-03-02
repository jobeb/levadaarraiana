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

/**
 * Export PDF utility (requires jsPDF + AutoTable)
 * exportPDF(title, headers, rows)
 */
function exportPDF(title, headers, rows) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        toast('PDF library not loaded. Try again in a moment.', 'error');
        return;
    }
    var jsPDF = window.jspdf.jsPDF;
    var orientation = headers.length > 5 ? 'landscape' : 'portrait';
    var doc = new jsPDF({ orientation: orientation, unit: 'mm', format: 'a4' });

    // Header
    doc.setFontSize(14);
    doc.text(title, 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(new Date().toLocaleDateString(), 14, 24);
    doc.setTextColor(0);

    // Table
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [0, 95, 151], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 }
    });

    doc.save(title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.pdf');
}

/**
 * Export dropdown toggle — click to open, click outside to close
 */
document.addEventListener('click', function(e) {
    var toggle = e.target.closest('.export-dropdown-toggle');
    if (toggle) {
        e.stopPropagation();
        var menu = toggle.parentElement.querySelector('.export-dropdown-menu');
        // Close all other menus first
        document.querySelectorAll('.export-dropdown-menu.show').forEach(function(m) {
            if (m !== menu) m.classList.remove('show');
        });
        menu.classList.toggle('show');
        return;
    }
    // Click on menu item — let it execute, then close
    if (e.target.closest('.export-dropdown-menu')) {
        setTimeout(function() {
            document.querySelectorAll('.export-dropdown-menu.show').forEach(function(m) {
                m.classList.remove('show');
            });
        }, 100);
        return;
    }
    // Click outside — close all
    document.querySelectorAll('.export-dropdown-menu.show').forEach(function(m) {
        m.classList.remove('show');
    });
});
