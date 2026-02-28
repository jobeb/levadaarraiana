/**
 * Charts — Native canvas bar and pie charts (no external libs)
 */
var Charts = {

    /**
     * Bar chart: grouped bars (e.g., income vs expenses by month)
     * data = { labels: ['Jan','Feb',...], datasets: [{ label:'Income', values:[...], color:'#e8a832' }, ...] }
     */
    bar: function(canvasId, data) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;

        var w = canvas.parentElement.offsetWidth || 600;
        var h = 300;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        var labels = data.labels || [];
        var datasets = data.datasets || [];
        if (labels.length === 0) return;

        // Find max value
        var maxVal = 0;
        datasets.forEach(function(ds) {
            ds.values.forEach(function(v) { if (v > maxVal) maxVal = v; });
        });
        if (maxVal === 0) maxVal = 100;
        maxVal = Math.ceil(maxVal * 1.1);

        var padding = { top: 20, right: 20, bottom: 40, left: 60 };
        var chartW = w - padding.left - padding.right;
        var chartH = h - padding.top - padding.bottom;

        // Background
        ctx.fillStyle = 'transparent';
        ctx.clearRect(0, 0, w, h);

        // Y axis grid lines
        ctx.strokeStyle = 'rgba(160,154,172,0.15)';
        ctx.lineWidth = 1;
        var ySteps = 5;
        for (var yi = 0; yi <= ySteps; yi++) {
            var yPos = padding.top + chartH - (yi / ySteps) * chartH;
            ctx.beginPath();
            ctx.moveTo(padding.left, yPos);
            ctx.lineTo(w - padding.right, yPos);
            ctx.stroke();

            // Y label
            ctx.fillStyle = '#a09aac';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxVal * yi / ySteps), padding.left - 8, yPos + 4);
        }

        // Bars
        var groupW = chartW / labels.length;
        var barW = Math.max(8, Math.min(30, (groupW - 10) / Math.max(datasets.length, 1)));
        var totalBarsW = barW * datasets.length;

        labels.forEach(function(label, li) {
            var groupX = padding.left + li * groupW + groupW / 2;

            datasets.forEach(function(ds, di) {
                var val = ds.values[li] || 0;
                var barH = (val / maxVal) * chartH;
                var x = groupX - totalBarsW / 2 + di * barW;
                var y = padding.top + chartH - barH;

                ctx.fillStyle = ds.color || '#e8a832';
                ctx.beginPath();
                ctx.roundRect(x, y, barW - 2, barH, 3);
                ctx.fill();
            });

            // X label
            ctx.fillStyle = '#a09aac';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, groupX, h - padding.bottom + 16);
        });

        // Legend
        var legendX = padding.left;
        datasets.forEach(function(ds) {
            ctx.fillStyle = ds.color || '#e8a832';
            ctx.fillRect(legendX, 6, 12, 12);
            ctx.fillStyle = '#e0dde4';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(ds.label || '', legendX + 16, 16);
            legendX += ctx.measureText(ds.label || '').width + 36;
        });
    },

    /**
     * Pie chart
     * data = [{ label: 'Cat A', value: 100, color: '#e8a832' }, ...]
     */
    pie: function(canvasId, data) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;

        var size = Math.min(canvas.parentElement.offsetWidth || 400, 350);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        var total = 0;
        data.forEach(function(d) { total += d.value || 0; });
        if (total === 0) return;

        var cx = size / 2;
        var cy = size / 2;
        var radius = size / 2 - 40;
        var startAngle = -Math.PI / 2;

        var defaultColors = ['#e8a832', '#e05a3a', '#4caf50', '#42a5f5', '#ab47bc', '#ff7043', '#26a69a', '#78909c'];

        data.forEach(function(d, i) {
            var sliceAngle = (d.value / total) * Math.PI * 2;
            var endAngle = startAngle + sliceAngle;
            var color = d.color || defaultColors[i % defaultColors.length];

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Label
            if (sliceAngle > 0.2) {
                var midAngle = startAngle + sliceAngle / 2;
                var lx = cx + Math.cos(midAngle) * (radius * 0.65);
                var ly = cy + Math.sin(midAngle) * (radius * 0.65);
                ctx.fillStyle = '#1a1520';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(Math.round(d.value / total * 100) + '%', lx, ly);
            }

            startAngle = endAngle;
        });

        // Legend below
        var legendY = cy + radius + 16;
        var legendX = 10;
        ctx.font = '11px sans-serif';
        data.forEach(function(d, i) {
            var color = d.color || defaultColors[i % defaultColors.length];
            ctx.fillStyle = color;
            ctx.fillRect(legendX, legendY, 10, 10);
            ctx.fillStyle = '#e0dde4';
            ctx.textAlign = 'left';
            ctx.fillText(d.label + ' (' + d.value.toFixed(0) + ')', legendX + 14, legendY + 10);
            legendX += ctx.measureText(d.label + ' (' + d.value.toFixed(0) + ')').width + 28;
            if (legendX > size - 60) {
                legendX = 10;
                legendY += 16;
            }
        });
    }
};
