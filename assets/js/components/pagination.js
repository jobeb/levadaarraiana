/**
 * Paginator — Generic client-side pagination component
 * Usage: var pager = new Paginator('container-id', { perPage: 15, onChange: fn });
 *        var page = pager.slice(array);
 *        pager.render();
 */
function Paginator(containerId, opts) {
    this.containerId = containerId;
    this.perPage = (opts && opts.perPage) || 15;
    this.onChange = (opts && opts.onChange) || null;
    this.currentPage = 1;
    this.totalItems = 0;
}

Paginator.prototype.setTotal = function(total) {
    this.totalItems = total;
    var maxPage = Math.max(1, Math.ceil(total / this.perPage));
    if (this.currentPage > maxPage) this.currentPage = maxPage;
};

Paginator.prototype.totalPages = function() {
    return Math.max(1, Math.ceil(this.totalItems / this.perPage));
};

Paginator.prototype.slice = function(arr) {
    this.setTotal(arr.length);
    var start = (this.currentPage - 1) * this.perPage;
    return arr.slice(start, start + this.perPage);
};

Paginator.prototype.goTo = function(page) {
    var max = this.totalPages();
    this.currentPage = Math.max(1, Math.min(page, max));
    if (this.onChange) this.onChange(this.currentPage);
};

Paginator.prototype.render = function() {
    var container = document.getElementById(this.containerId);
    if (!container) return;

    var total = this.totalItems;
    var pages = this.totalPages();

    if (total <= this.perPage) {
        container.innerHTML = '';
        return;
    }

    var self = this;
    var from = (this.currentPage - 1) * this.perPage + 1;
    var to = Math.min(this.currentPage * this.perPage, total);

    var html = '<div class="pagination">';
    html += '<button ' + (this.currentPage <= 1 ? 'disabled' : '') + ' data-page="' + (this.currentPage - 1) + '">' + t('anterior') + '</button>';

    // Show page numbers with ellipsis
    var startPage = Math.max(1, this.currentPage - 2);
    var endPage = Math.min(pages, this.currentPage + 2);

    if (startPage > 1) {
        html += '<button data-page="1">1</button>';
        if (startPage > 2) html += '<span style="color:var(--text-dim)">...</span>';
    }
    for (var i = startPage; i <= endPage; i++) {
        html += '<button data-page="' + i + '"' + (i === this.currentPage ? ' class="active"' : '') + '>' + i + '</button>';
    }
    if (endPage < pages) {
        if (endPage < pages - 1) html += '<span style="color:var(--text-dim)">...</span>';
        html += '<button data-page="' + pages + '">' + pages + '</button>';
    }

    html += '<button ' + (this.currentPage >= pages ? 'disabled' : '') + ' data-page="' + (this.currentPage + 1) + '">' + t('seguinte') + '</button>';
    html += '</div>';
    html += '<div class="pagination-info">' + t('mostrando').replace('{from}', from).replace('{to}', to).replace('{total}', total) + '</div>';

    container.innerHTML = html;

    // Bind click events
    container.querySelectorAll('.pagination button[data-page]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (!btn.disabled) {
                self.goTo(parseInt(btn.dataset.page));
            }
        });
    });
};
