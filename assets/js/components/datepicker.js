/**
 * DatePicker — Custom dark-theme datepicker for all date inputs
 * Auto-enhances input[type="date"] via MutationObserver
 */
(function() {
    var _activePicker = null;

    function _pad(n) { return n < 10 ? '0' + n : '' + n; }

    function _getMonthNames() {
        if (typeof t === 'function') {
            var m = t('meses');
            if (Array.isArray(m)) return m;
        }
        return ['Xaneiro','Febreiro','Marzo','Abril','Maio','Xuño','Xullo','Agosto','Setembro','Outubro','Novembro','Decembro'];
    }

    function _getDayNames() {
        if (typeof t === 'function') {
            var d = t('dias_curtos');
            if (Array.isArray(d)) return d;
        }
        return ['Lun','Mar','Mér','Xov','Ven','Sáb','Dom'];
    }

    function _formatDisplay(isoDate) {
        if (!isoDate) return '';
        var p = isoDate.split('-');
        if (p.length !== 3) return isoDate;
        return p[2] + '/' + p[1] + '/' + p[0];
    }

    function _parseDisplay(display) {
        if (!display) return '';
        // Accept dd/mm/yyyy
        var p = display.split('/');
        if (p.length === 3 && p[2].length === 4) return p[2] + '-' + p[1] + '-' + p[0];
        // Accept yyyy-mm-dd
        if (/^\d{4}-\d{2}-\d{2}$/.test(display)) return display;
        return '';
    }

    function _closePicker() {
        if (_activePicker) {
            _activePicker.remove();
            _activePicker = null;
        }
    }

    function _buildPicker(input, year, month) {
        _closePicker();

        var currentValue = input._isoValue || '';
        var todayStr = new Date().toISOString().slice(0, 10);
        var meses = _getMonthNames();
        var dias = _getDayNames();

        var firstDay = new Date(year, month, 1);
        var lastDay = new Date(year, month + 1, 0);
        var daysInMonth = lastDay.getDate();
        var startWeekday = (firstDay.getDay() + 6) % 7; // Monday-based
        var prevMonthLast = new Date(year, month, 0).getDate();

        var picker = document.createElement('div');
        picker.className = 'dp-dropdown';

        // Header
        var header = document.createElement('div');
        header.className = 'dp-header';
        header.innerHTML =
            '<button type="button" class="dp-nav dp-prev">&#10094;</button>' +
            '<span class="dp-title">' + meses[month] + ' ' + year + '</span>' +
            '<button type="button" class="dp-nav dp-next">&#10095;</button>';
        picker.appendChild(header);

        // Day names
        var dayRow = document.createElement('div');
        dayRow.className = 'dp-days';
        dias.forEach(function(d) {
            var span = document.createElement('span');
            span.className = 'dp-dayname';
            span.textContent = d;
            dayRow.appendChild(span);
        });
        picker.appendChild(dayRow);

        // Calendar cells
        var grid = document.createElement('div');
        grid.className = 'dp-grid';

        // Previous month fill
        for (var p = startWeekday - 1; p >= 0; p--) {
            var cell = document.createElement('span');
            cell.className = 'dp-cell dp-outside';
            cell.textContent = prevMonthLast - p;
            grid.appendChild(cell);
        }

        // Current month
        for (var d = 1; d <= daysInMonth; d++) {
            var dateStr = year + '-' + _pad(month + 1) + '-' + _pad(d);
            var cell = document.createElement('span');
            cell.className = 'dp-cell';
            if (dateStr === todayStr) cell.classList.add('dp-today');
            if (dateStr === currentValue) cell.classList.add('dp-selected');
            cell.textContent = d;
            cell.dataset.date = dateStr;
            cell.addEventListener('click', (function(ds) {
                return function(e) {
                    e.stopPropagation();
                    input._isoValue = ds;
                    input.value = _formatDisplay(ds);
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    _closePicker();
                };
            })(dateStr));
            grid.appendChild(cell);
        }

        // Next month fill
        var totalCells = startWeekday + daysInMonth;
        var remainder = totalCells % 7;
        if (remainder > 0) {
            for (var n = 1; n <= 7 - remainder; n++) {
                var cell = document.createElement('span');
                cell.className = 'dp-cell dp-outside';
                cell.textContent = n;
                grid.appendChild(cell);
            }
        }

        picker.appendChild(grid);

        // Today button
        var todayBtn = document.createElement('button');
        todayBtn.type = 'button';
        todayBtn.className = 'dp-today-btn';
        todayBtn.textContent = typeof t === 'function' ? t('hoxe') : 'Hoxe';
        todayBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            input._isoValue = todayStr;
            input.value = _formatDisplay(todayStr);
            input.dispatchEvent(new Event('change', { bubbles: true }));
            _closePicker();
        });
        picker.appendChild(todayBtn);

        // Navigation
        header.querySelector('.dp-prev').addEventListener('click', function(e) {
            e.stopPropagation();
            var m = month - 1, y = year;
            if (m < 0) { m = 11; y--; }
            _buildPicker(input, y, m);
        });
        header.querySelector('.dp-next').addEventListener('click', function(e) {
            e.stopPropagation();
            var m = month + 1, y = year;
            if (m > 11) { m = 0; y++; }
            _buildPicker(input, y, m);
        });

        // Position
        var wrapper = input.parentElement;
        if (wrapper && wrapper.classList.contains('dp-wrap')) {
            wrapper.appendChild(picker);
        } else {
            input.parentElement.appendChild(picker);
        }

        _activePicker = picker;

        // Adjust position if off-screen (bottom)
        requestAnimationFrame(function() {
            var rect = picker.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                picker.style.bottom = '100%';
                picker.style.top = 'auto';
                picker.style.marginBottom = '4px';
                picker.style.marginTop = '0';
            }
        });
    }

    function enhanceDateInput(input) {
        if (input._dpEnhanced) return;
        input._dpEnhanced = true;

        // Store ISO value separately
        input._isoValue = input.value || '';

        // Change type to text to prevent native picker
        input.type = 'text';
        input.readOnly = true;
        input.style.cursor = 'pointer';

        // Display formatted value
        if (input._isoValue) {
            input.value = _formatDisplay(input._isoValue);
        }

        // Wrap in container for positioning
        var wrapper = document.createElement('div');
        wrapper.className = 'dp-wrap';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Add calendar icon
        var icon = document.createElement('span');
        icon.className = 'dp-icon';
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
        wrapper.appendChild(icon);

        // Click handler
        function openPicker(e) {
            e.stopPropagation();
            if (_activePicker && _activePicker.parentElement === wrapper) {
                _closePicker();
                return;
            }
            var year, month;
            if (input._isoValue) {
                var parts = input._isoValue.split('-');
                year = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
            } else {
                var now = new Date();
                year = now.getFullYear();
                month = now.getMonth();
            }
            _buildPicker(input, year, month);
        }

        input.addEventListener('click', openPicker);
        icon.addEventListener('click', openPicker);

        // Override .value getter/setter to return ISO format
        var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        Object.defineProperty(input, 'value', {
            get: function() {
                return input._isoValue || '';
            },
            set: function(v) {
                if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
                    input._isoValue = v;
                    desc.set.call(input, _formatDisplay(v));
                } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
                    input._isoValue = _parseDisplay(v);
                    desc.set.call(input, v);
                } else {
                    input._isoValue = v;
                    desc.set.call(input, v);
                }
            }
        });
    }

    function scanAndEnhance(root) {
        var inputs = (root || document).querySelectorAll('input[type="date"]');
        inputs.forEach(enhanceDateInput);
    }

    // Close picker on outside click
    document.addEventListener('click', function(e) {
        if (_activePicker && !_activePicker.contains(e.target)) {
            var isInput = e.target._dpEnhanced;
            var isIcon = e.target.closest && e.target.closest('.dp-icon');
            if (!isInput && !isIcon) {
                _closePicker();
            }
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && _activePicker) {
            _closePicker();
        }
    });

    // MutationObserver to auto-enhance new date inputs
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.type === 'childList') {
                m.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'INPUT' && node.type === 'date') {
                            enhanceDateInput(node);
                        } else if (node.querySelectorAll) {
                            scanAndEnhance(node);
                        }
                    }
                });
            }
        });
    });

    // Observe modal body + entire document for dynamically injected inputs
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle innerHTML changes on modal-body (MutationObserver catches these too)
    // Initial scan
    scanAndEnhance();

    // Expose for manual use if needed
    window.initDatepickers = scanAndEnhance;
})();
