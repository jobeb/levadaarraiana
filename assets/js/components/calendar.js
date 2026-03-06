/**
 * CalendarWidget — Interactive monthly calendar
 * Usage: var cal = new CalendarWidget('container-id', { mini: false, onDayClick: fn, onEventClick: fn });
 *        cal.setEvents([{ date: '2026-02-15', title: 'xxx', color: '#e8a832', id: 1 }]);
 *        cal.render();
 */
function CalendarWidget(containerId, opts) {
    this.containerId = containerId;
    this.mini = (opts && opts.mini) || false;
    this.onDayClick = (opts && opts.onDayClick) || null;
    this.onDayHover = (opts && opts.onDayHover) || null;
    this.onEventClick = (opts && opts.onEventClick) || null;
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth(); // 0-indexed
    this.events = [];
}

CalendarWidget.prototype.setEvents = function(events) {
    this.events = events || [];
};

CalendarWidget.prototype.prevMonth = function() {
    this.month--;
    if (this.month < 0) { this.month = 11; this.year--; }
    this.render();
};

CalendarWidget.prototype.nextMonth = function() {
    this.month++;
    if (this.month > 11) { this.month = 0; this.year++; }
    this.render();
};

CalendarWidget.prototype.goToToday = function() {
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth();
    this.render();
};

CalendarWidget.prototype._getMonthName = function() {
    var meses = t('meses');
    if (Array.isArray(meses)) return meses[this.month] || '';
    return '';
};

CalendarWidget.prototype._getDayNames = function() {
    var dias = t('dias_curtos');
    if (Array.isArray(dias)) return dias;
    return ['L','M','X','J','V','S','D'];
};

CalendarWidget.prototype._eventsForDay = function(dateStr) {
    return this.events.filter(function(e) { return e.date === dateStr; });
};

CalendarWidget.prototype.render = function() {
    var container = document.getElementById(this.containerId);
    if (!container) return;

    var self = this;
    var todayStr = today();
    var firstDay = new Date(this.year, this.month, 1);
    var lastDay = new Date(this.year, this.month + 1, 0);
    var daysInMonth = lastDay.getDate();

    // Monday-based week: 0=Mon, 6=Sun
    var startWeekday = (firstDay.getDay() + 6) % 7;

    // Previous month days to fill
    var prevMonthLast = new Date(this.year, this.month, 0).getDate();

    var monthName = this._getMonthName();
    var dayNames = this._getDayNames();
    var calId = 'cal-' + this.containerId;

    var html = '<div class="calendar' + (this.mini ? ' calendar-mini' : '') + '" id="' + calId + '">';

    // Header
    var isCurrentMonth = (this.year === new Date().getFullYear() && this.month === new Date().getMonth());
    html += '<div class="calendar-header">';
    html += '<button class="calendar-nav" data-dir="prev">&#10094;</button>';
    html += '<span class="calendar-title' + (isCurrentMonth ? '' : ' calendar-title-link') + '" data-dir="today">' + esc(monthName) + ' ' + this.year + '</span>';
    html += '<button class="calendar-nav" data-dir="next">&#10095;</button>';
    html += '</div>';

    // Day names
    html += '<div class="calendar-grid calendar-days">';
    dayNames.forEach(function(d) {
        html += '<div class="calendar-day-name">' + esc(d) + '</div>';
    });
    html += '</div>';

    // Day cells
    html += '<div class="calendar-grid calendar-cells">';

    // Prev month fill
    for (var p = startWeekday - 1; p >= 0; p--) {
        var pd = prevMonthLast - p;
        html += '<div class="calendar-cell outside">' + (self.mini ? '' : '<span class="cell-num">' + pd + '</span>') + '</div>';
    }

    // Current month
    for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = this.year + '-' + String(this.month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var isToday = dateStr === todayStr;
        var dayEvents = this._eventsForDay(dateStr);

        var cellClass = 'calendar-cell';
        if (isToday) cellClass += ' today';
        if (dayEvents.length > 0) cellClass += ' has-events';

        html += '<div class="' + cellClass + '" data-date="' + dateStr + '">';
        html += '<span class="cell-num' + (isToday ? ' today-num' : '') + '">' + d + '</span>';

        if (!this.mini && dayEvents.length > 0) {
            var show = dayEvents.slice(0, 3);
            show.forEach(function(ev) {
                var bgColor = ev.color || 'var(--primary)';
                html += '<div class="day-event" data-event-id="' + (ev.id || '') + '" style="border-left:3px solid ' + bgColor + '">';
                html += '<span class="day-event-text">' + esc(truncate(ev.title, 20)) + '</span>';
                html += '</div>';
            });
            if (dayEvents.length > 3) {
                html += '<div class="day-event-more">+' + (dayEvents.length - 3) + '</div>';
            }
            // Colored dots for mobile (hidden on desktop)
            html += '<div class="day-dots day-dots-mobile">';
            dayEvents.slice(0, 3).forEach(function(ev) {
                html += '<span class="day-dot" style="background:' + (ev.color || 'var(--primary)') + '"></span>';
            });
            html += '</div>';
        } else if (this.mini && dayEvents.length > 0) {
            html += '<div class="day-dots">';
            dayEvents.slice(0, 3).forEach(function(ev) {
                html += '<span class="day-dot" style="background:' + (ev.color || 'var(--primary)') + '"></span>';
            });
            html += '</div>';
        }

        html += '</div>';
    }

    // Next month fill
    var totalCells = startWeekday + daysInMonth;
    var remainder = totalCells % 7;
    if (remainder > 0) {
        for (var n = 1; n <= 7 - remainder; n++) {
            html += '<div class="calendar-cell outside">' + (self.mini ? '' : '<span class="cell-num">' + n + '</span>') + '</div>';
        }
    }

    html += '</div></div>';

    container.innerHTML = html;

    // Re-append legend if stored (dashboard calendar)
    if (this._legendHtml) {
        container.insertAdjacentHTML('beforeend', this._legendHtml);
    }

    // Bind navigation
    var calEl = document.getElementById(calId);
    calEl.querySelectorAll('.calendar-nav').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (btn.dataset.dir === 'prev') self.prevMonth();
            else self.nextMonth();
        });
    });
    var titleEl = calEl.querySelector('.calendar-title-link');
    if (titleEl) {
        titleEl.addEventListener('click', function() { self.goToToday(); });
    }

    // Bind day clicks
    calEl.querySelectorAll('.calendar-cell:not(.outside)').forEach(function(cell) {
        cell.addEventListener('click', function() {
            if (self.onDayClick) {
                var date = cell.dataset.date;
                var events = self._eventsForDay(date);
                self.onDayClick(date, events);
            }
        });
        // Bind hover for desktop (non-touch)
        if (self.onDayHover) {
            cell.addEventListener('mouseenter', function() {
                var date = cell.dataset.date;
                var events = self._eventsForDay(date);
                if (events.length > 0) {
                    self.onDayHover(date, events, cell);
                }
            });
        }
    });

    // Bind event clicks
    calEl.querySelectorAll('.day-event[data-event-id]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            if (self.onEventClick) {
                self.onEventClick(el.dataset.eventId);
            }
        });
    });
};
