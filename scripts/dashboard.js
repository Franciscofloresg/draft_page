(function () {
    const COLORS = {
        upper: '#8FAB7A',
        middle: '#3B8FC2',
        lower: '#1B3A6B',
        panelGrid: 'rgba(27,58,107,0.1)',
        axis: '#475569'
    };

    const riverPalette = ['#1B3A6B', '#2E6DA4', '#4A90C4', '#8FAB7A', '#6B8A5A', '#5BA3C9', '#1F5B99', '#406882'];
    const ld003GroupPalette = ['#1B3A6B', '#2E6DA4', '#4A90C4', '#5BA3C9', '#8FAB7A', '#6B8A5A', '#406882'];
    const basinDisplayMap = {
        upper: 'Upper Danube',
        middle: 'Middle Danube',
        lower: 'Lower Danube'
    };

    const state = {
        kpis: null,
        riverDaily: null,
        biodiversity: null,
        riverPointColors: {}
    };

    const el = {
        kpiGrid: document.getElementById('kpi-grid'),
        riverMetricSelect: document.getElementById('river-metric-select'),
        riverAggregationSelect: document.getElementById('river-aggregation-select'),
        riverPointSelect: document.getElementById('river-point-select'),
        riverStartDate: document.getElementById('river-start-date'),
        riverEndDate: document.getElementById('river-end-date'),
        ld003BasinSelect: document.getElementById('ld003-basin-select'),
        ld003ValueModeSelect: document.getElementById('ld003-value-mode-select'),
        riverChart: document.getElementById('river-chart'),
        riverRateChart: document.getElementById('river-rate-chart'),
        riverDistributionChart: document.getElementById('river-distribution-chart'),
        ld003MonthlyChart: document.getElementById('ld003-monthly-chart'),
        ld003HeatmapChart: document.getElementById('ld003-heatmap-chart'),
        ld003SiteChart: document.getElementById('ld003-site-chart')
    };

    const toTitle = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const numberFmt = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);
    const aggregationLabel = { daily: 'Daily', weekly: 'Weekly mean', monthly: 'Monthly mean' };
    const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatMonthKey = (key) => {
        if (!key || key.length !== 7) return key;
        const monthIndex = Number(key.slice(5, 7)) - 1;
        return `${monthShort[monthIndex]} ${key.slice(0, 4)}`;
    };
    const basinLabel = (basin) => basinDisplayMap[basin] || toTitle(basin || '');
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

    function bootstrapRiverDateFilters() {
        if (!state.riverDaily || !el.riverStartDate || !el.riverEndDate) return;
        const dates = state.riverDaily.dates || [];
        if (!dates.length) return;

        const minDate = dates[0];
        const maxDate = dates[dates.length - 1];

        el.riverStartDate.min = minDate;
        el.riverStartDate.max = maxDate;
        el.riverEndDate.min = minDate;
        el.riverEndDate.max = maxDate;

        if (!el.riverStartDate.value) el.riverStartDate.value = minDate;
        if (!el.riverEndDate.value) el.riverEndDate.value = maxDate;
    }

    function getRiverDateWindow() {
        const dates = state.riverDaily?.dates || [];
        if (!dates.length) return { startDate: null, endDate: null };

        const minDate = dates[0];
        const maxDate = dates[dates.length - 1];
        let startDate = el.riverStartDate?.value || minDate;
        let endDate = el.riverEndDate?.value || maxDate;

        if (startDate < minDate) startDate = minDate;
        if (startDate > maxDate) startDate = maxDate;
        if (endDate < minDate) endDate = minDate;
        if (endDate > maxDate) endDate = maxDate;
        if (startDate > endDate) [startDate, endDate] = [endDate, startDate];

        if (el.riverStartDate) el.riverStartDate.value = startDate;
        if (el.riverEndDate) el.riverEndDate.value = endDate;

        return { startDate, endDate };
    }

    function filterSeriesByDate(dates, values, startDate, endDate) {
        const filteredDates = [];
        const filteredValues = [];

        for (let i = 0; i < dates.length; i += 1) {
            const date = dates[i];
            if (startDate && date < startDate) continue;
            if (endDate && date > endDate) continue;
            filteredDates.push(date);
            filteredValues.push(values[i]);
        }

        return { dates: filteredDates, values: filteredValues };
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
        const { startDate, endDate } = getRiverDateWindow();

        const traces = visiblePoints.map((point) => {
            const pointSeries = state.riverDaily.points?.[point]?.[metric] || [];
            const filtered = filterSeriesByDate(dates, pointSeries, startDate, endDate);
            const aggregated = aggregateSeries(filtered.dates, filtered.values, aggregation);
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
        layout.xaxis.range = startDate && endDate ? [startDate, endDate] : undefined;
        layout.xaxis.rangeslider = { visible: false };
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
        const { startDate, endDate } = getRiverDateWindow();
        const filteredDatesAll = dates.filter((d) => (!startDate || d >= startDate) && (!endDate || d <= endDate));
        const monthKeys = [...new Set(filteredDatesAll.map((d) => d.slice(0, 7)))];
        const monthLabels = monthKeys.map((k) => {
            const monthIndex = Number(k.slice(5, 7)) - 1;
            return `${monthShort[monthIndex]} ${k.slice(0, 4)}`;
        });

        const z = visiblePoints.map((point) => {
            const values = state.riverDaily.points?.[point]?.[metric] || [];
            const filtered = filterSeriesByDate(dates, values, startDate, endDate);
            const aggregated = aggregateSeries(filtered.dates, filtered.values, aggregation);
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
        const { startDate, endDate } = getRiverDateWindow();

        const traces = points.map((point) => {
            const pointSeries = state.riverDaily.points?.[point]?.[metric] || [];
            const filtered = filterSeriesByDate(dates, pointSeries, startDate, endDate);
            const aggregated = aggregateSeries(filtered.dates, filtered.values, aggregation);
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

    function getLd003Filters() {
        const basin = el.ld003BasinSelect?.value || 'all';
        const mode = el.ld003ValueModeSelect?.value || 'count';
        return { basin, mode };
    }

    function getLd003RecordsFiltered(basin) {
        const allRecords = state.biodiversity?.records || [];
        if (basin === 'all') return allRecords;
        return allRecords.filter((record) => record.basin === basin);
    }

    function renderLd003NoData(target, title) {
        if (!target) return;
        const layout = baseLayout(title, '');
        layout.margin = { l: 20, r: 20, t: 42, b: 20 };
        layout.xaxis = { visible: false };
        layout.yaxis = { visible: false };
        layout.annotations = [{
            x: 0.5,
            y: 0.5,
            xref: 'paper',
            yref: 'paper',
            text: 'No data available for current filter',
            showarrow: false,
            font: { size: 12, color: '#64748b' }
        }];
        Plotly.react(target, [], layout, { responsive: true, displayModeBar: false });
    }

    function renderLd003MonthlyChart(records, basin, mode) {
        if (!el.ld003MonthlyChart) return;
        if (!records.length) {
            renderLd003NoData(el.ld003MonthlyChart, 'Monthly activity');
            return;
        }

        const monthKeys = [...new Set(records.map((record) => record.month))].sort();
        const monthLabels = monthKeys.map((monthKey) => formatMonthKey(monthKey));
        const groups = state.biodiversity?.meta?.taxonomic_groups || [...new Set(records.map((r) => r.taxonomic_group))];
        const valueByCell = new Map();

        records.forEach((record) => {
            const key = `${record.month}||${record.taxonomic_group}`;
            const increment = mode === 'units' ? (Number(record.observed_units) || 0) : 1;
            valueByCell.set(key, (valueByCell.get(key) || 0) + increment);
        });

        const traces = groups.map((group, idx) => ({
            type: 'bar',
            name: group,
            x: monthLabels,
            y: monthKeys.map((monthKey) => valueByCell.get(`${monthKey}||${group}`) || 0),
            marker: { color: ld003GroupPalette[idx % ld003GroupPalette.length] },
            hovertemplate: `${group}<br>%{x}<br>%{y:.1f}<extra></extra>`
        })).filter((trace) => trace.y.some((value) => value > 0));

        const basinScope = basin === 'all' ? 'All basins' : basinLabel(basin);
        const yLabel = mode === 'units' ? 'Observed units (sum)' : 'Observations';
        const layout = baseLayout('', yLabel);
        layout.barmode = 'stack';
        layout.margin = { l: 62, r: 16, t: 24, b: 68 };
        layout.xaxis.tickangle = -35;
        layout.legend = {
            orientation: 'h',
            y: 1.02,
            yanchor: 'bottom',
            x: 0,
            xanchor: 'left',
            font: { size: 10, color: '#475569' },
            traceorder: 'normal'
        };
        layout.annotations = [{
            x: 0,
            y: 1.18,
            xref: 'paper',
            yref: 'paper',
            text: `Scope: ${basinScope}`,
            showarrow: false,
            xanchor: 'left',
            font: { size: 11, color: '#64748b' }
        }];

        Plotly.react(el.ld003MonthlyChart, traces, layout, { responsive: true, displayModeBar: false });
    }

    function renderLd003HeatmapChart(records, basin, mode) {
        if (!el.ld003HeatmapChart) return;
        if (!records.length) {
            renderLd003NoData(el.ld003HeatmapChart, 'Habitat x taxonomic group');
            return;
        }

        const groups = state.biodiversity?.meta?.taxonomic_groups || [...new Set(records.map((r) => r.taxonomic_group))];
        const habitats = state.biodiversity?.meta?.habitat_types || [...new Set(records.map((r) => r.habitat))];
        const cellStats = new Map();

        records.forEach((record) => {
            const key = `${record.taxonomic_group}||${record.habitat}`;
            if (!cellStats.has(key)) {
                cellStats.set(key, { count: 0, unitsSum: 0 });
            }
            const cell = cellStats.get(key);
            cell.count += 1;
            cell.unitsSum += Number(record.observed_units) || 0;
        });

        const z = groups.map((group) => habitats.map((habitat) => {
            const cell = cellStats.get(`${group}||${habitat}`);
            if (!cell || cell.count === 0) return null;
            if (mode === 'units') return cell.unitsSum / cell.count;
            return cell.count;
        }));

        const xLabels = habitats;
        const yLabels = groups;
        const basinScope = basin === 'all' ? 'All basins' : basinLabel(basin);
        const colorTitle = mode === 'units' ? 'Avg units' : 'Count';

        const data = [{
            type: 'heatmap',
            x: xLabels,
            y: yLabels,
            z,
            colorscale: [
                [0, '#ecf4fb'],
                [0.35, '#b6d6ee'],
                [0.7, '#5ba3c9'],
                [1, '#1b3a6b']
            ],
            colorbar: { title: colorTitle, thickness: 11 },
            hovertemplate: '%{y}<br>%{x}<br>%{z:.2f}<extra></extra>'
        }];

        const layout = baseLayout('', colorTitle);
        layout.margin = { l: 92, r: 16, t: 24, b: 84 };
        layout.xaxis.tickangle = -35;
        layout.yaxis.automargin = true;
        layout.annotations = [{
            x: 0,
            y: 1.14,
            xref: 'paper',
            yref: 'paper',
            text: `Scope: ${basinScope}`,
            showarrow: false,
            xanchor: 'left',
            font: { size: 11, color: '#64748b' }
        }];

        Plotly.react(el.ld003HeatmapChart, data, layout, { responsive: true, displayModeBar: false });
    }

    function renderLd003SiteChart(records, basin, mode) {
        if (!el.ld003SiteChart) return;
        if (!records.length) {
            renderLd003NoData(el.ld003SiteChart, 'Site richness vs effort');
            return;
        }

        const siteMap = new Map();
        records.forEach((record) => {
            const key = record.site_id;
            if (!siteMap.has(key)) {
                siteMap.set(key, {
                    site_id: record.site_id,
                    site_name: record.site_name,
                    basin: record.basin,
                    observations: 0,
                    total_units: 0,
                    species: new Set()
                });
            }
            const site = siteMap.get(key);
            site.observations += 1;
            site.total_units += Number(record.observed_units) || 0;
            site.species.add(record.species_id);
        });

        const siteRows = [...siteMap.values()].map((site) => ({
            site_id: site.site_id,
            site_name: site.site_name,
            basin: site.basin,
            observations: site.observations,
            total_units: site.total_units,
            richness: site.species.size
        }));
        const xMetricLabel = mode === 'units' ? 'Observed units (sum)' : 'Observation count';
        const sizeMetricLabel = mode === 'units' ? 'Observation count' : 'Total observed units';
        const sizeValues = siteRows.map((site) => (mode === 'units' ? site.observations : site.total_units));
        const sizeMax = Math.max(...sizeValues, 1);
        const sizeRef = (2 * sizeMax) / (34 ** 2);
        const basinOrder = ['upper', 'middle', 'lower'];

        const traces = basinOrder.map((basinKey) => {
            const subset = siteRows.filter((site) => site.basin === basinKey);
            return {
                type: 'scatter',
                mode: 'markers',
                name: basinLabel(basinKey),
                x: subset.map((site) => (mode === 'units' ? site.total_units : site.observations)),
                y: subset.map((site) => site.richness),
                text: subset.map((site) => `${site.site_name} (${site.site_id})`),
                customdata: subset.map((site) => [
                    basinLabel(site.basin),
                    site.observations,
                    site.total_units,
                    mode === 'units' ? site.observations : site.total_units
                ]),
                marker: {
                    color: COLORS[basinKey],
                    opacity: 0.82,
                    size: subset.map((site) => (mode === 'units' ? site.observations : site.total_units)),
                    sizemode: 'area',
                    sizeref: sizeRef,
                    sizemin: 8,
                    line: { color: 'rgba(255,255,255,0.88)', width: 1.1 }
                },
                hovertemplate:
                    '%{text}<br>Basin: %{customdata[0]}' +
                    `<br>${xMetricLabel}: %{x:.1f}` +
                    '<br>Unique species: %{y}' +
                    '<br>Observation count: %{customdata[1]}' +
                    '<br>Total observed units: %{customdata[2]:.1f}' +
                    `<br>Bubble size metric (${sizeMetricLabel}): %{customdata[3]:.1f}<extra></extra>`
            };
        }).filter((trace) => trace.x.length);

        const basinScope = basin === 'all' ? 'All basins' : basinLabel(basin);
        const layout = baseLayout('', 'Unique species');
        layout.margin = { l: 64, r: 16, t: 24, b: 62 };
        layout.xaxis.title = xMetricLabel;
        layout.yaxis.title = 'Species richness';
        layout.annotations = [{
            x: 0,
            y: 1.14,
            xref: 'paper',
            yref: 'paper',
            text: `Scope: ${basinScope}`,
            showarrow: false,
            xanchor: 'left',
            font: { size: 11, color: '#64748b' }
        }];

        Plotly.react(el.ld003SiteChart, traces, layout, { responsive: true, displayModeBar: false });
    }

    function renderLd003SectionCharts() {
        if (!state.biodiversity) return;
        const { basin, mode } = getLd003Filters();
        const records = getLd003RecordsFiltered(basin);
        renderLd003MonthlyChart(records, basin, mode);
        renderLd003HeatmapChart(records, basin, mode);
        renderLd003SiteChart(records, basin, mode);
    }

    function bindEvents() {
        if (el.riverMetricSelect && el.riverAggregationSelect && el.riverPointSelect) {
            el.riverMetricSelect.addEventListener('change', renderRiverSectionCharts);
            el.riverAggregationSelect.addEventListener('change', renderRiverSectionCharts);
            el.riverPointSelect.addEventListener('change', renderRiverSectionCharts);
        }
        if (el.riverStartDate && el.riverEndDate) {
            el.riverStartDate.addEventListener('change', renderRiverSectionCharts);
            el.riverEndDate.addEventListener('change', renderRiverSectionCharts);
        }
        if (el.ld003BasinSelect && el.ld003ValueModeSelect) {
            el.ld003BasinSelect.addEventListener('change', renderLd003SectionCharts);
            el.ld003ValueModeSelect.addEventListener('change', renderLd003SectionCharts);
        }

        window.addEventListener('resize', () => {
            [
                el.riverChart,
                el.riverRateChart,
                el.riverDistributionChart,
                el.ld003MonthlyChart,
                el.ld003HeatmapChart,
                el.ld003SiteChart
            ]
                .filter(Boolean)
                .forEach((chart) => Plotly.Plots.resize(chart));
        });
    }

    async function init() {
        try {
            const [kpis, riverDaily, biodiversity] = await Promise.all([
                loadJson('./data/synthetic-dashboard/kpis.json'),
                loadJson('./data/synthetic-dashboard/river_daily_2025.json'),
                loadJson('./data/synthetic-dashboard/biodiversity_ld003_2025.json')
            ]);

            state.kpis = kpis;
            state.riverDaily = riverDaily;
            state.biodiversity = biodiversity;

            renderKpis();
            buildPointColorMap();
            bootstrapRiverPointSelector();
            bootstrapRiverDateFilters();
            renderRiverSectionCharts();
            renderLd003SectionCharts();
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
