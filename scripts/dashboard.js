(function () {
    const COLORS = {
        upper: '#8FAB7A',
        middle: '#3B8FC2',
        lower: '#1B3A6B',
        panelGrid: 'rgba(27,58,107,0.1)',
        axis: '#475569'
    };

    const riverPalette = ['#1B3A6B', '#2E6DA4', '#4A90C4', '#8FAB7A', '#6B8A5A', '#5BA3C9', '#1F5B99', '#406882'];

    const metricLabelMap = {
        sediment_load_kt: 'Sediment Load',
        discharge_m3s: 'Discharge',
        restoration_index: 'Restoration Index',
        water_quality_index: 'Water Quality'
    };

    const state = {
        monthly: null,
        projects: null,
        risk: null,
        kpis: null,
        riverDaily: null,
        riverPointColors: {}
    };

    const el = {
        kpiGrid: document.getElementById('kpi-grid'),
        metricSelect: document.getElementById('metric-select'),
        barBreakdownSelect: document.getElementById('bar-breakdown-select'),
        bubbleBasinSelect: document.getElementById('bubble-basin-select'),
        riskMetricSelect: document.getElementById('risk-metric-select'),
        riverMetricSelect: document.getElementById('river-metric-select'),
        riverAggregationSelect: document.getElementById('river-aggregation-select'),
        riverPointSelect: document.getElementById('river-point-select'),
        tsChart: document.getElementById('ts-chart'),
        barChart: document.getElementById('bar-chart'),
        bubbleChart: document.getElementById('bubble-chart'),
        heatmapChart: document.getElementById('heatmap-chart'),
        riverChart: document.getElementById('river-chart'),
        riverRateChart: document.getElementById('river-rate-chart'),
        riverDistributionChart: document.getElementById('river-distribution-chart')
    };

    const toTitle = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const numberFmt = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);
    const aggregationLabel = { daily: 'Daily', weekly: 'Weekly mean', monthly: 'Monthly mean' };
    const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hexToRgba = (hex, alpha) => {
        const clean = hex.replace('#', '');
        const value = clean.length === 3
            ? clean.split('').map((c) => c + c).join('')
            : clean;
        const num = parseInt(value, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    async function loadJson(path) {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Could not load ${path}`);
        return response.json();
    }

    function renderKpis() {
        const items = state.kpis.kpis || [];
        el.kpiGrid.innerHTML = items.map((item) => {
            const value = typeof item.value === 'number' ? numberFmt(item.value) : item.value;
            return `
                <article class="kpi-card">
                    <div class="kpi-label">${item.label}</div>
                    <div class="kpi-value">${value} <span style="font-size:0.78rem;font-weight:700;color:#475569">${item.unit || ''}</span></div>
                    <div class="kpi-trend">${item.trend || ''}</div>
                </article>
            `;
        }).join('');
    }

    function baseLayout(title, yTitle) {
        return {
            title: {
                text: title,
                x: 0,
                font: { size: 14, color: '#1B3A6B' }
            },
            paper_bgcolor: '#ffffff',
            plot_bgcolor: '#ffffff',
            margin: { l: 54, r: 20, t: 36, b: 46 },
            legend: {
                orientation: 'h',
                y: 1.12,
                yanchor: 'bottom',
                x: 0,
                font: { size: 11, color: '#475569' }
            },
            xaxis: {
                showgrid: true,
                gridcolor: COLORS.panelGrid,
                tickfont: { size: 11, color: COLORS.axis }
            },
            yaxis: {
                title: yTitle || '',
                showgrid: true,
                gridcolor: COLORS.panelGrid,
                zeroline: false,
                tickfont: { size: 11, color: COLORS.axis },
                titlefont: { size: 11, color: COLORS.axis }
            },
            font: { family: 'Inter, system-ui, sans-serif' }
        };
    }

    function renderTimeSeries() {
        const metric = el.metricSelect.value;
        const months = state.monthly.months;
        const units = state.monthly.meta.units || {};

        const traces = ['upper', 'middle', 'lower'].map((basin) => ({
            x: months,
            y: state.monthly.basins[basin].map((row) => row[metric]),
            mode: 'lines',
            name: toTitle(basin),
            line: {
                width: basin === 'lower' ? 3.2 : 2.6,
                color: COLORS[basin]
            },
            hovertemplate: `${toTitle(basin)}<br>%{x}<br>%{y:.2f} ${units[metric] || ''}<extra></extra>`
        }));

        const layout = baseLayout(`${metricLabelMap[metric]} - Monthly trend`, units[metric] || '');

        Plotly.react(el.tsChart, traces, layout, { responsive: true, displayModeBar: false });
    }

    function renderPipelineBar() {
        const key = el.barBreakdownSelect.value;
        const projects = state.projects.projects || [];
        const basins = ['upper', 'middle', 'lower'];
        const categories = [...new Set(projects.map((p) => p[key]))];

        const traces = categories.map((category) => ({
            type: 'bar',
            name: category,
            x: basins.map((b) => toTitle(b)),
            y: basins.map((basin) => projects.filter((p) => p.basin === basin && p[key] === category).length),
            marker: {
                line: { width: 0 },
                opacity: 0.9
            },
            hovertemplate: `${category}<br>%{x}: %{y} projects<extra></extra>`
        }));

        const layout = baseLayout(`Portfolio distribution - ${key}`, 'Projects');
        layout.barmode = 'stack';
        layout.margin = { l: 46, r: 16, t: 36, b: 36 };

        Plotly.react(el.barChart, traces, layout, { responsive: true, displayModeBar: false });
    }

    function renderBubbleChart() {
        const basinFilter = el.bubbleBasinSelect.value;
        const projects = (state.projects.projects || []).filter((p) => basinFilter === 'all' || p.basin === basinFilter);
        const basins = basinFilter === 'all' ? ['upper', 'middle', 'lower'] : [basinFilter];

        const traces = basins.map((basin) => {
            const subset = projects.filter((p) => p.basin === basin);
            return {
                type: 'scatter',
                mode: 'markers',
                name: toTitle(basin),
                x: subset.map((p) => p.budget_meur),
                y: subset.map((p) => p.biodiversity_gain_index),
                text: subset.map((p) => `${p.id} - ${p.name}`),
                customdata: subset.map((p) => [p.phase, p.expected_sediment_kt_y, p.progress_pct]),
                marker: {
                    color: COLORS[basin],
                    opacity: 0.74,
                    size: subset.map((p) => p.expected_sediment_kt_y),
                    sizemode: 'area',
                    sizeref: 2 * Math.max(...projects.map((p) => p.expected_sediment_kt_y), 1) / (52 ** 2),
                    line: { color: 'rgba(255,255,255,0.8)', width: 1.1 }
                },
                hovertemplate:
                    '%{text}<br>Budget: %{x:.1f} M EUR<br>Biodiversity: %{y:.1f}' +
                    '<br>Phase: %{customdata[0]}<br>Sediment gain: %{customdata[1]:.1f} kt/y' +
                    '<br>Progress: %{customdata[2]}%<extra></extra>'
            };
        });

        const layout = baseLayout('Project impact map', 'Biodiversity gain index');
        layout.xaxis.title = 'Budget (M EUR)';
        layout.yaxis.range = [25, 100];
        layout.margin = { l: 54, r: 16, t: 36, b: 44 };

        Plotly.react(el.bubbleChart, traces, layout, { responsive: true, displayModeBar: false });
    }

    function renderRiskHeatmap() {
        const selectedMetric = el.riskMetricSelect.value || Object.keys(state.risk.metrics)[0];
        const months = state.risk.months;
        const matrix = state.risk.metrics[selectedMetric];
        const yLabels = state.risk.basins.map((b) => toTitle(b));

        const data = [{
            type: 'heatmap',
            x: months,
            y: yLabels,
            z: matrix,
            colorscale: [
                [0, '#d9ecf9'],
                [0.35, '#9dc9e8'],
                [0.6, '#4a90c4'],
                [0.8, '#2e6da4'],
                [1, '#1b3a6b']
            ],
            zmin: 0,
            zmax: 100,
            colorbar: { title: 'Risk' },
            hovertemplate: '%{y}<br>%{x}<br>Score: %{z:.1f}<extra></extra>'
        }];

        const layout = baseLayout(`Risk matrix - ${selectedMetric}`, '');
        layout.margin = { l: 66, r: 18, t: 36, b: 54 };
        layout.yaxis.automargin = true;
        layout.xaxis.tickangle = -30;

        Plotly.react(el.heatmapChart, data, layout, { responsive: true, displayModeBar: false });
    }

    function buildPointColorMap() {
        const pointOrder = state.riverDaily?.meta?.point_order || [];
        const map = {};
        pointOrder.forEach((point, idx) => {
            map[point] = riverPalette[idx % riverPalette.length];
        });
        state.riverPointColors = map;
    }

    function getBucketKey(dateStr, aggregation) {
        if (aggregation === 'daily') return dateStr;
        const d = new Date(`${dateStr}T00:00:00Z`);
        if (aggregation === 'weekly') {
            const day = (d.getUTCDay() + 6) % 7; // Monday=0
            d.setUTCDate(d.getUTCDate() - day);
            return d.toISOString().slice(0, 10);
        }
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
    }

    function aggregateSeries(dates, values, aggregation) {
        if (aggregation === 'daily') {
            return {
                x: dates,
                y: values.map((v) => (Number.isFinite(v) ? v : null))
            };
        }

        const buckets = new Map();
        for (let i = 0; i < dates.length; i += 1) {
            const key = getBucketKey(dates[i], aggregation);
            if (!buckets.has(key)) {
                buckets.set(key, { sum: 0, count: 0 });
            }
            const entry = buckets.get(key);
            const value = values[i];
            if (Number.isFinite(value)) {
                entry.sum += value;
                entry.count += 1;
            }
        }

        const x = [];
        const y = [];
        buckets.forEach((entry, key) => {
            x.push(key);
            y.push(entry.count > 0 ? entry.sum / entry.count : null);
        });

        return { x, y };
    }

    function bootstrapRiverPointSelector() {
        if (!state.riverDaily || !el.riverPointSelect) return;
        const points = state.riverDaily.meta?.point_order || [];
        const options = ['<option value="all">All stations</option>']
            .concat(points.map((point) => `<option value="${point}">${point}</option>`))
            .join('');
        el.riverPointSelect.innerHTML = options;
    }

    function renderRiverDailyChart() {
        if (!state.riverDaily || !el.riverChart) return;

        const metric = el.riverMetricSelect?.value || 'water_level_cm';
        const aggregation = el.riverAggregationSelect?.value || 'daily';
        const selectedPoint = el.riverPointSelect?.value || 'all';

        const metricMeta = state.riverDaily.meta?.metrics?.[metric] || { label: metric, unit: '' };
        const unit = metricMeta.unit || '';
        const points = state.riverDaily.meta?.point_order || [];
        const visiblePoints = selectedPoint === 'all' ? points : points.filter((p) => p === selectedPoint);
        const dates = state.riverDaily.dates || [];

        const traces = visiblePoints.map((point) => {
            const pointSeries = state.riverDaily.points?.[point]?.[metric] || [];
            const aggregated = aggregateSeries(dates, pointSeries, aggregation);
            return {
                type: 'scattergl',
                mode: aggregation === 'monthly' ? 'lines+markers' : 'lines',
                name: point,
                x: aggregated.x,
                y: aggregated.y,
                line: {
                    color: state.riverPointColors[point] || '#1B3A6B',
                    width: aggregation === 'daily' ? 1.8 : 2.4
                },
                marker: { size: 5 },
                hovertemplate: `${point}<br>%{x}<br>%{y:.2f} ${unit}<extra></extra>`
            };
        });

        const layout = baseLayout(
            `${metricMeta.label} - ${aggregationLabel[aggregation] || aggregation} by station`,
            unit
        );
        layout.margin = { l: 62, r: 18, t: 92, b: 62 };
        layout.hovermode = 'x unified';
        layout.legend.orientation = 'h';
        layout.legend.x = 1;
        layout.legend.xanchor = 'right';
        layout.legend.y = 1.12;
        layout.legend.yanchor = 'top';
        layout.xaxis.type = 'date';
        layout.xaxis.rangeslider = {
            visible: true,
            thickness: 0.1,
            bgcolor: 'rgba(74, 144, 196, 0.08)'
        };
        layout.xaxis.tickformat = aggregation === 'monthly' ? '%b %Y' : '%d %b';
        layout.xaxis.hoverformat = '%Y-%m-%d';

        Plotly.react(el.riverChart, traces, layout, { responsive: true, displayModeBar: false });
    }

    function renderRiverRateHeatmap() {
        if (!state.riverDaily || !el.riverRateChart) return;

        const metric = el.riverMetricSelect?.value || 'water_level_cm';
        const aggregation = el.riverAggregationSelect?.value || 'daily';
        const selectedPoint = el.riverPointSelect?.value || 'all';
        const metricMeta = state.riverDaily.meta?.metrics?.[metric] || { label: metric, unit: '' };
        const points = state.riverDaily.meta?.point_order || [];
        const visiblePoints = selectedPoint === 'all' ? points : points.filter((p) => p === selectedPoint);
        const dates = state.riverDaily.dates || [];
        const monthKeys = [...new Set(dates.map((d) => d.slice(0, 7)))];
        const monthLabels = monthKeys.map((k) => {
            const monthIndex = Number(k.slice(5, 7)) - 1;
            return `${monthShort[monthIndex]} ${k.slice(0, 4)}`;
        });

        const z = visiblePoints.map((point) => {
            const values = state.riverDaily.points?.[point]?.[metric] || [];
            const aggregated = aggregateSeries(dates, values, aggregation);
            const monthlyRateByKey = new Map();

            for (let i = 1; i < aggregated.x.length; i += 1) {
                const prev = aggregated.y[i - 1];
                const curr = aggregated.y[i];
                if (!Number.isFinite(prev) || !Number.isFinite(curr) || Math.abs(prev) < 1e-9) continue;

                const rawRate = ((curr - prev) / Math.abs(prev)) * 100;
                const cappedRate = Math.max(-120, Math.min(120, rawRate));
                if (!Number.isFinite(cappedRate)) continue;

                const monthKey = aggregated.x[i].slice(0, 7);
                if (!monthlyRateByKey.has(monthKey)) {
                    monthlyRateByKey.set(monthKey, { sum: 0, count: 0 });
                }
                const cell = monthlyRateByKey.get(monthKey);
                cell.sum += cappedRate;
                cell.count += 1;
            }

            return monthKeys.map((monthKey) => {
                const cell = monthlyRateByKey.get(monthKey);
                if (!cell || cell.count === 0) return null;
                return cell.sum / cell.count;
            });
        });

        const finiteRates = z.flat().filter((v) => Number.isFinite(v));
        const maxAbs = finiteRates.length ? Math.max(...finiteRates.map((v) => Math.abs(v))) : 1;
        const zLimit = Math.max(5, Math.min(60, Math.ceil(maxAbs)));

        const data = [{
            type: 'heatmap',
            x: monthLabels,
            y: visiblePoints,
            z,
            zmin: -zLimit,
            zmax: zLimit,
            zmid: 0,
            colorscale: [
                [0, '#b91c1c'],
                [0.5, '#f8fafc'],
                [1, '#1e40af']
            ],
            colorbar: {
                title: '% change',
                thickness: 12
            },
            hovertemplate: '%{y}<br>%{x}<br>Avg change: %{z:.2f}%<extra></extra>'
        }];

        const layout = baseLayout(
            `${metricMeta.label} - monthly change rate (${aggregationLabel[aggregation] || aggregation} basis)`,
            '% change'
        );
        layout.margin = { l: 82, r: 34, t: 42, b: 70 };
        layout.legend = { orientation: 'h' };
        layout.xaxis.tickangle = -35;
        layout.yaxis.automargin = true;

        Plotly.react(el.riverRateChart, data, layout, { responsive: true, displayModeBar: false });
    }

    function renderRiverDistributionChart() {
        if (!state.riverDaily || !el.riverDistributionChart) return;

        const metric = el.riverMetricSelect?.value || 'water_level_cm';
        const aggregation = el.riverAggregationSelect?.value || 'daily';
        const selectedPoint = el.riverPointSelect?.value || 'all';

        const metricMeta = state.riverDaily.meta?.metrics?.[metric] || { label: metric, unit: '' };
        const unit = metricMeta.unit || '';
        const points = state.riverDaily.meta?.point_order || [];
        const dates = state.riverDaily.dates || [];

        const traces = points.map((point) => {
            const pointSeries = state.riverDaily.points?.[point]?.[metric] || [];
            const aggregated = aggregateSeries(dates, pointSeries, aggregation);
            const cleaned = aggregated.y.filter((v) => Number.isFinite(v));
            const isSelected = selectedPoint === 'all' || selectedPoint === point;
            const color = state.riverPointColors[point] || '#1B3A6B';
            return {
                type: 'box',
                name: point,
                y: cleaned,
                boxmean: true,
                marker: { color },
                line: {
                    color,
                    width: isSelected ? 2.2 : 1.4
                },
                fillcolor: isSelected ? hexToRgba(color, 0.4) : hexToRgba(color, 0.18),
                opacity: isSelected ? 0.9 : 0.35,
                hovertemplate: `${point}<br>%{y:.2f} ${unit}<extra></extra>`
            };
        });

        const layout = baseLayout(
            `${metricMeta.label} - ${aggregationLabel[aggregation] || aggregation} distribution`,
            unit
        );
        layout.margin = { l: 62, r: 20, t: 42, b: 62 };
        layout.showlegend = false;
        layout.xaxis.tickangle = -20;

        Plotly.react(el.riverDistributionChart, traces, layout, { responsive: true, displayModeBar: false });
    }

    function renderRiverSectionCharts() {
        renderRiverDailyChart();
        renderRiverRateHeatmap();
        renderRiverDistributionChart();
    }

    function bindEvents() {
        el.metricSelect.addEventListener('change', renderTimeSeries);
        el.barBreakdownSelect.addEventListener('change', renderPipelineBar);
        el.bubbleBasinSelect.addEventListener('change', renderBubbleChart);
        el.riskMetricSelect.addEventListener('change', renderRiskHeatmap);

        if (el.riverMetricSelect && el.riverAggregationSelect && el.riverPointSelect) {
            el.riverMetricSelect.addEventListener('change', renderRiverSectionCharts);
            el.riverAggregationSelect.addEventListener('change', renderRiverSectionCharts);
            el.riverPointSelect.addEventListener('change', renderRiverSectionCharts);
        }

        window.addEventListener('resize', () => {
            [el.tsChart, el.barChart, el.bubbleChart, el.heatmapChart, el.riverChart, el.riverRateChart, el.riverDistributionChart]
                .filter(Boolean)
                .forEach((chart) => Plotly.Plots.resize(chart));
        });
    }

    function bootstrapRiskSelector() {
        const keys = Object.keys(state.risk.metrics || {});
        el.riskMetricSelect.innerHTML = keys.map((k) => `<option value="${k}">${k}</option>`).join('');
    }

    async function init() {
        try {
            const [monthly, projects, risk, kpis, riverDaily] = await Promise.all([
                loadJson('./data/synthetic-dashboard/monthly_metrics.json'),
                loadJson('./data/synthetic-dashboard/projects.json'),
                loadJson('./data/synthetic-dashboard/risk_matrix.json'),
                loadJson('./data/synthetic-dashboard/kpis.json'),
                loadJson('./data/synthetic-dashboard/river_daily_2025.json')
            ]);

            state.monthly = monthly;
            state.projects = projects;
            state.risk = risk;
            state.kpis = kpis;
            state.riverDaily = riverDaily;

            renderKpis();
            bootstrapRiskSelector();
            renderTimeSeries();
            renderPipelineBar();
            renderBubbleChart();
            renderRiskHeatmap();
            buildPointColorMap();
            bootstrapRiverPointSelector();
            renderRiverSectionCharts();
            bindEvents();
        } catch (error) {
            console.error(error);
            const message = document.createElement('p');
            message.style.color = '#b91c1c';
            message.style.padding = '1rem';
            message.textContent = `Dashboard initialization failed: ${error.message}`;
            document.body.prepend(message);
        }
    }

    init();
})();
