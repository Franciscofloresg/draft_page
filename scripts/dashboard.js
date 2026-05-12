(function () {
    const COLORS = {
        upper: '#8FAB7A',
        middle: '#3B8FC2',
        lower: '#1B3A6B',
        panelGrid: 'rgba(27,58,107,0.1)',
        axis: '#475569'
    };

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
        kpis: null
    };

    const el = {
        kpiGrid: document.getElementById('kpi-grid'),
        metricSelect: document.getElementById('metric-select'),
        barBreakdownSelect: document.getElementById('bar-breakdown-select'),
        bubbleBasinSelect: document.getElementById('bubble-basin-select'),
        riskMetricSelect: document.getElementById('risk-metric-select'),
        tsChart: document.getElementById('ts-chart'),
        barChart: document.getElementById('bar-chart'),
        bubbleChart: document.getElementById('bubble-chart'),
        heatmapChart: document.getElementById('heatmap-chart')
    };

    const toTitle = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const numberFmt = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);

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

        const layout = baseLayout(
            `${metricLabelMap[metric]} · Monthly trend`,
            units[metric] || ''
        );

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

        const layout = baseLayout(`Portfolio distribution · ${key}`, 'Projects');
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
                text: subset.map((p) => `${p.id} · ${p.name}`),
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

        const layout = baseLayout(`Risk matrix · ${selectedMetric}`, '');
        layout.margin = { l: 66, r: 18, t: 36, b: 54 };
        layout.yaxis.automargin = true;
        layout.xaxis.tickangle = -30;

        Plotly.react(el.heatmapChart, data, layout, { responsive: true, displayModeBar: false });
    }

    function bindEvents() {
        el.metricSelect.addEventListener('change', renderTimeSeries);
        el.barBreakdownSelect.addEventListener('change', renderPipelineBar);
        el.bubbleBasinSelect.addEventListener('change', renderBubbleChart);
        el.riskMetricSelect.addEventListener('change', renderRiskHeatmap);

        window.addEventListener('resize', () => {
            [el.tsChart, el.barChart, el.bubbleChart, el.heatmapChart].forEach((chart) => Plotly.Plots.resize(chart));
        });
    }

    function bootstrapRiskSelector() {
        const keys = Object.keys(state.risk.metrics || {});
        el.riskMetricSelect.innerHTML = keys.map((k) => `<option value="${k}">${k}</option>`).join('');
    }

    async function init() {
        try {
            const [monthly, projects, risk, kpis] = await Promise.all([
                loadJson('./data/synthetic-dashboard/monthly_metrics.json'),
                loadJson('./data/synthetic-dashboard/projects.json'),
                loadJson('./data/synthetic-dashboard/risk_matrix.json'),
                loadJson('./data/synthetic-dashboard/kpis.json')
            ]);

            state.monthly = monthly;
            state.projects = projects;
            state.risk = risk;
            state.kpis = kpis;

            renderKpis();
            bootstrapRiskSelector();
            renderTimeSeries();
            renderPipelineBar();
            renderBubbleChart();
            renderRiskHeatmap();
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
