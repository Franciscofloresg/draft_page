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
    const OPS_DEFAULT_YEAR = 2023;
    const OPS_MONITORING_STATIONS = [
        {
            id: 'WQ_200345',
            name: 'Vienna monitoring station',
            basin: 'upper',
            country: 'Austria',
            owner: 'ICPDR',
            source: 'Public National Water Monitoring',
            parameter: 'Nitrate (NO3)',
            unit: 'mg/L',
            coords: [48.2082, 16.3738],
            yearly: {
                2018: { value: 5.1, status: 'Operational', date: '2018-03-16' },
                2019: { value: 5.0, status: 'Operational', date: '2019-03-20' },
                2020: { value: 4.8, status: 'Operational', date: '2020-03-14' },
                2021: { value: 4.7, status: 'Operational', date: '2021-03-15' },
                2022: { value: 4.5, status: 'Operational', date: '2022-03-11' },
                2023: { value: 4.2, status: 'Operational', date: '2023-03-12' },
                2024: { value: 4.0, status: 'Operational', date: '2024-03-17' },
                2025: { value: 4.1, status: 'Operational', date: '2025-03-18' },
                2026: { value: 3.9, status: 'Operational', date: '2026-03-15' }
            }
        },
        {
            id: 'WQ_334210',
            name: 'Budapest monitoring station',
            basin: 'middle',
            country: 'Hungary',
            owner: 'National Water Directorate',
            source: 'National Surface Water Program',
            parameter: 'Nitrate (NO3)',
            unit: 'mg/L',
            coords: [47.4979, 19.0402],
            yearly: {
                2018: { value: 6.2, status: 'Watch', date: '2018-04-04' },
                2019: { value: 6.0, status: 'Watch', date: '2019-04-06' },
                2020: { value: 5.7, status: 'Watch', date: '2020-04-05' },
                2021: { value: 5.3, status: 'Operational', date: '2021-04-03' },
                2022: { value: 5.0, status: 'Operational', date: '2022-04-08' },
                2023: { value: 4.8, status: 'Operational', date: '2023-04-02' },
                2024: { value: 4.6, status: 'Operational', date: '2024-04-09' },
                2025: { value: 4.7, status: 'Operational', date: '2025-04-06' },
                2026: { value: 4.4, status: 'Operational', date: '2026-04-07' }
            }
        },
        {
            id: 'WQ_411550',
            name: 'Belgrade monitoring station',
            basin: 'middle',
            country: 'Serbia',
            owner: 'Republic Hydrometeorological Service',
            source: 'Public River Monitoring',
            parameter: 'Nitrate (NO3)',
            unit: 'mg/L',
            coords: [44.7866, 20.4489],
            yearly: {
                2018: { value: 7.4, status: 'Alert', date: '2018-05-10' },
                2019: { value: 7.0, status: 'Watch', date: '2019-05-06' },
                2020: { value: 6.8, status: 'Watch', date: '2020-05-11' },
                2021: { value: 6.4, status: 'Watch', date: '2021-05-09' },
                2022: { value: 6.1, status: 'Watch', date: '2022-05-12' },
                2023: { value: 5.8, status: 'Watch', date: '2023-05-14' },
                2024: { value: 5.5, status: 'Operational', date: '2024-05-15' },
                2025: { value: 5.3, status: 'Operational', date: '2025-05-13' },
                2026: { value: 5.0, status: 'Operational', date: '2026-05-16' }
            }
        },
        {
            id: 'WQ_509890',
            name: 'Iron Gates monitoring station',
            basin: 'lower',
            country: 'Romania',
            owner: 'Romanian Waters National Administration',
            source: 'Danube Water Quality Network',
            parameter: 'Nitrate (NO3)',
            unit: 'mg/L',
            coords: [44.6755, 22.5210],
            yearly: {
                2018: { value: 5.9, status: 'Watch', date: '2018-06-20' },
                2019: { value: 5.7, status: 'Watch', date: '2019-06-17' },
                2020: { value: 5.4, status: 'Operational', date: '2020-06-18' },
                2021: { value: 5.0, status: 'Operational', date: '2021-06-19' },
                2022: { value: 4.8, status: 'Operational', date: '2022-06-15' },
                2023: { value: 4.6, status: 'Operational', date: '2023-06-21' },
                2024: { value: 4.4, status: 'Operational', date: '2024-06-22' },
                2025: { value: 4.5, status: 'Operational', date: '2025-06-18' },
                2026: { value: 4.3, status: 'Operational', date: '2026-06-20' }
            }
        },
        {
            id: 'WQ_623004',
            name: 'Tulcea delta station',
            basin: 'lower',
            country: 'Romania',
            owner: 'Danube Delta Biosphere Authority',
            source: 'Wetland Sentinel Program',
            parameter: 'Nitrate (NO3)',
            unit: 'mg/L',
            coords: [45.1808, 28.8053],
            yearly: {
                2018: { value: 4.6, status: 'Operational', date: '2018-07-10' },
                2019: { value: 4.7, status: 'Operational', date: '2019-07-08' },
                2020: { value: 4.5, status: 'Operational', date: '2020-07-10' },
                2021: { value: 4.3, status: 'Operational', date: '2021-07-11' },
                2022: { value: 4.2, status: 'Operational', date: '2022-07-09' },
                2023: { value: 4.1, status: 'Operational', date: '2023-07-07' },
                2024: { value: 4.0, status: 'Operational', date: '2024-07-12' },
                2025: { value: 4.1, status: 'Operational', date: '2025-07-14' },
                2026: { value: 3.9, status: 'Operational', date: '2026-07-12' }
            }
        }
    ];
    const OPS_WATER_HOTSPOTS = [
        { id: 'HS_URBAN_AT', label: 'Urban runoff hotspot', basin: 'upper', coords: [48.12, 16.72], severity: 0.64 },
        { id: 'HS_TRIB_HU', label: 'Tributary nutrient load', basin: 'middle', coords: [47.05, 19.9], severity: 0.79 },
        { id: 'HS_PORT_RS', label: 'Port industrial pressure', basin: 'middle', coords: [44.92, 20.22], severity: 0.88 },
        { id: 'HS_DELTA_RO', label: 'Delta sediment overload', basin: 'lower', coords: [45.12, 29.21], severity: 0.57 }
    ];
    const OPS_RESTORATION_SITES = [
        { id: 'RS_001', label: 'Riparian wetland restoration', basin: 'upper', coords: [48.01, 14.76] },
        { id: 'RS_012', label: 'Floodplain reconnection', basin: 'middle', coords: [45.98, 18.85] },
        { id: 'RS_029', label: 'Delta habitat enhancement', basin: 'lower', coords: [45.27, 28.98] }
    ];
    const OPS_PROJECT_CLUSTERS = [
        { id: 'PC_UP_1', label: 'Upper basin project cluster', coords: [47.6, 13.9], projects: 11 },
        { id: 'PC_MD_1', label: 'Middle basin project cluster', coords: [46.4, 19.9], projects: 16 },
        { id: 'PC_LW_1', label: 'Lower basin project cluster', coords: [45.3, 27.5], projects: 9 }
    ];
    const OPS_SEDIMENT_ALERTS = [
        { id: 'SA_100', label: 'High suspended sediment event', coords: [45.9, 21.8], level: 'Moderate' },
        { id: 'SA_101', label: 'Bank erosion risk segment', coords: [44.5, 22.8], level: 'High' }
    ];
    const OPS_CORRIDOR_SEGMENTS = [
        [[48.66, 12.14], [48.21, 16.37], [47.86, 17.91], [47.5, 19.04]],
        [[47.5, 19.04], [46.25, 20.15], [45.81, 21.13], [44.79, 20.45]],
        [[44.79, 20.45], [44.67, 22.52], [44.42, 26.1], [45.18, 28.81]]
    ];
    const OPS_STATUS_THEMES = {
        operational: { label: 'Operational', marker: '#16a34a', chipText: '#166534', chipBg: 'rgba(34,197,94,0.14)' },
        watch: { label: 'Watch', marker: '#d97706', chipText: '#92400e', chipBg: 'rgba(245,158,11,0.16)' },
        alert: { label: 'Alert', marker: '#dc2626', chipText: '#991b1b', chipBg: 'rgba(239,68,68,0.16)' }
    };
    const OPS_BASEMAP_CONFIG = {
        light: {
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            options: { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors &copy; CARTO' }
        },
        topo: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            options: { maxZoom: 17, attribution: '&copy; OpenTopoMap contributors' }
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: { maxZoom: 18, attribution: 'Tiles &copy; Esri' }
        }
    };
    const OPS_VIEW_BOUNDS = [[41.8, 7.0], [50.8, 31.0]];

    const state = {
        kpis: null,
        riverDaily: null,
        biodiversity: null,
        riverPointColors: {},
        leafletMap: null,
        dashboardActiveTab: 'analytics',
        operationsMap: null,
        operationsBasemapLayers: {},
        operationsActiveBasemap: 'light',
        operationsLayerGroups: new Map(),
        operationsStationMarkers: [],
        operationsActiveFeature: null,
        operationsSelectedYear: OPS_DEFAULT_YEAR,
        operationsHasInitialViewport: false
    };

    const el = {
        dashboardTabButtons: Array.from(document.querySelectorAll('.dashboard-tab-btn[data-tab-target]')),
        dashboardTabPanels: Array.from(document.querySelectorAll('.dashboard-tab-panel[data-tab-panel]')),
        navAnchorLinks: Array.from(document.querySelectorAll('.nav-links a[href^="#"]')),
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
        ld003SiteChart: document.getElementById('ld003-site-chart'),
        danubeMap: document.getElementById('danube-map'),
        mapTitle: document.getElementById('map-title'),
        mapSwitcher: document.getElementById('map-switcher'),
        operationsMap: document.getElementById('operations-map'),
        opsBasemapSelect: document.getElementById('ops-basemap-select'),
        opsTimelineYear: document.getElementById('ops-timeline-year'),
        opsTimelineValue: document.getElementById('ops-timeline-value'),
        opsLayerSearch: document.getElementById('ops-layer-search'),
        opsLayerList: document.getElementById('ops-layer-list'),
        opsLayerToggles: Array.from(document.querySelectorAll('#ops-layer-list input[type="checkbox"][data-layer-id]')),
        opsResetLayers: document.getElementById('ops-reset-layers'),
        opsLocationSearch: document.getElementById('ops-location-search'),
        opsLocationSearchBtn: document.getElementById('ops-location-search-btn'),
        opsFeatureStatus: document.getElementById('ops-feature-status'),
        opsFeatureTitle: document.getElementById('ops-feature-title'),
        opsFeatureCode: document.getElementById('ops-feature-code'),
        opsFeatureOwner: document.getElementById('ops-feature-owner'),
        opsFeatureParameter: document.getElementById('ops-feature-parameter'),
        opsFeatureDate: document.getElementById('ops-feature-date'),
        opsFeatureValue: document.getElementById('ops-feature-value'),
        opsFeatureBasin: document.getElementById('ops-feature-basin'),
        opsFeatureCountry: document.getElementById('ops-feature-country'),
        opsFeatureSource: document.getElementById('ops-feature-source')
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
    const formatDate = (value) => {
        const parsed = new Date(value);
        if (!Number.isFinite(parsed.getTime())) return value;
        return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const parseStatusKey = (status) => {
        const normalized = String(status || '').trim().toLowerCase();
        if (normalized.includes('alert') || normalized.includes('critical')) return 'alert';
        if (normalized.includes('watch') || normalized.includes('warning')) return 'watch';
        return 'operational';
    };
    const getOpsTheme = (status) => OPS_STATUS_THEMES[parseStatusKey(status)] || OPS_STATUS_THEMES.operational;
    const getOpsMeasurementForYear = (station, year) => {
        const yearly = station?.yearly || {};
        const years = Object.keys(yearly).map(Number).sort((a, b) => a - b);
        if (!years.length) return null;
        let selectedYear = years[0];
        years.forEach((candidate) => {
            if (candidate <= year) selectedYear = candidate;
        });
        return { year: selectedYear, ...yearly[selectedYear] };
    };

    async function loadJson(path) {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Could not load ${path}`);
        return response.json();
    }

    function setMapTitle(text) {
        if (el.mapTitle) el.mapTitle.textContent = text;
    }

    async function initDanubeMap() {
        if (!el.danubeMap || !el.mapTitle || !el.mapSwitcher) return;
        if (typeof window.L === 'undefined') {
            setMapTitle('Map Library Unavailable');
            return;
        }

        const map = L.map(el.danubeMap, {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: false
        }).setView([47.0, 20.5], 5);

        state.leafletMap = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        map.createPane('basinPane');
        map.getPane('basinPane').style.zIndex = 330;
        map.createPane('guidePane');
        map.getPane('guidePane').style.zIndex = 345;
        map.createPane('riverPane');
        map.getPane('riverPane').style.zIndex = 430;

        const dataCache = new Map();
        const mapMetaById = new Map();
        const switcherButtons = new Map();
        const mapLayers = L.layerGroup().addTo(map);
        const officialOverlayBounds = L.latLngBounds([41.8, 7.0], [50.8, 31.0]);
        let basin3FeatureCollection = null;
        let activeMapId = '';

        const zoneLabels = {
            upper: 'Upper Basin',
            middle: 'Middle Basin',
            lower: 'Lower Basin'
        };
        const zoneFill = {
            upper: '#AECDA0',
            middle: '#A8D4EA',
            lower: '#BABDE0'
        };

        const setActiveButton = (mapId) => {
            switcherButtons.forEach((button, id) => {
                const isActive = id === mapId;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        };

        const renderMap = (mapData) => {
            const bounds = mapData.bounds;
            const focusZone = mapData.focusZone || '';
            mapLayers.clearLayers();

            L.imageOverlay('./data/maps/source/drbd_2021_layer.png', officialOverlayBounds, {
                pane: 'basinPane',
                opacity: 0.24,
                interactive: false
            }).addTo(mapLayers);

            if (basin3FeatureCollection && Array.isArray(basin3FeatureCollection.features)) {
                L.geoJSON(basin3FeatureCollection, {
                    pane: 'guidePane',
                    style: (feature) => {
                        const basinId = feature.properties.id;
                        const isActive = !focusZone || basinId === focusZone;
                        const fillColor = zoneFill[basinId] || feature.properties.color || '#C9CDD4';
                        return {
                            color: isActive ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.48)',
                            weight: isActive ? 1.2 : 0.85,
                            fillColor,
                            fillOpacity: focusZone ? (isActive ? 0.43 : 0.16) : 0.36
                        };
                    },
                    onEachFeature: (feature, layer) => {
                        const basinId = feature.properties.id;
                        layer.bindTooltip(
                            `<strong>${feature.properties.name || zoneLabels[basinId] || basinId}</strong>`,
                            { className: 'map-zone-tip', sticky: true }
                        );
                    }
                }).addTo(mapLayers);
            }

            L.imageOverlay('./data/maps/source/danubegis_river4000.png', officialOverlayBounds, {
                pane: 'riverPane',
                opacity: focusZone ? 0.26 : 0.32,
                interactive: false
            }).addTo(mapLayers);

            L.imageOverlay('./data/maps/source/danubegis_danube.png', officialOverlayBounds, {
                pane: 'riverPane',
                opacity: focusZone ? 0.9 : 0.94,
                interactive: false
            }).addTo(mapLayers);

            if (bounds && typeof bounds.latMin === 'number') {
                const dataBounds = L.latLngBounds(
                    [bounds.latMin, bounds.lonMin],
                    [bounds.latMax, bounds.lonMax]
                );
                map.fitBounds(dataBounds.pad(0.12));
                map.setMaxBounds(dataBounds.pad(0.2));
            }

            setMapTitle(mapData.title || 'Danube River Basin');
            setTimeout(() => map.invalidateSize(), 60);
        };

        const activateMap = async (mapId) => {
            const meta = mapMetaById.get(mapId);
            if (!meta) return;
            setActiveButton(mapId);
            activeMapId = mapId;
            try {
                let mapData = dataCache.get(mapId);
                if (!mapData) {
                    mapData = await loadJson(`./data/maps/${meta.file}`);
                    dataCache.set(mapId, mapData);
                }
                if (activeMapId === mapId) renderMap(mapData);
            } catch (error) {
                setMapTitle('Map Data Unavailable');
                console.error(error);
            }
        };

        const buildMapSwitcher = (maps) => {
            el.mapSwitcher.innerHTML = '';
            switcherButtons.clear();
            maps.forEach((meta) => {
                mapMetaById.set(meta.id, meta);
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'map-switcher-btn';
                button.textContent = meta.label || meta.id;
                button.setAttribute('aria-pressed', 'false');
                button.addEventListener('click', () => activateMap(meta.id));
                el.mapSwitcher.appendChild(button);
                switcherButtons.set(meta.id, button);
            });
        };

        try {
            const [basins3Data, mapIndex] = await Promise.all([
                loadJson('./data/maps/danube-basins3.geojson'),
                loadJson('./data/maps/maps-index.json')
            ]);
            basin3FeatureCollection = basins3Data;
            const maps = Array.isArray(mapIndex.maps) ? mapIndex.maps : [];
            if (!maps.length) throw new Error('No map definitions found.');
            buildMapSwitcher(maps);
            const defaultMap = mapIndex.defaultMap || maps[0].id;
            await activateMap(defaultMap);
        } catch (error) {
            setMapTitle('Map Data Unavailable');
            console.error(error);
        }
    }

    function setDashboardTab(tabId) {
        const targetTab = tabId === 'map-workspace' ? 'map-workspace' : 'analytics';
        state.dashboardActiveTab = targetTab;

        el.dashboardTabButtons.forEach((button) => {
            const isActive = button.dataset.tabTarget === targetTab;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        el.dashboardTabPanels.forEach((panel) => {
            const isActive = panel.dataset.tabPanel === targetTab;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
        });

        window.requestAnimationFrame(() => {
            if (targetTab === 'analytics' && state.leafletMap) state.leafletMap.invalidateSize();
            if (targetTab === 'map-workspace' && state.operationsMap) {
                state.operationsMap.invalidateSize();
                if (!state.operationsHasInitialViewport) {
                    window.requestAnimationFrame(() => fitOpsMapToDanube(true));
                }
            }
        });
    }

    function fitOpsMapToDanube(markInitialized = false) {
        if (!state.operationsMap || typeof window.L === 'undefined') return;
        const bounds = L.latLngBounds(OPS_VIEW_BOUNDS);
        state.operationsMap.fitBounds(bounds.pad(-0.04), { animate: false });
        state.operationsMap.setMaxBounds(bounds.pad(0.14));
        if (markInitialized) state.operationsHasInitialViewport = true;
    }

    function getFixedNavOffset() {
        const nav = document.querySelector('nav');
        if (!nav) return 0;
        return Math.ceil(nav.getBoundingClientRect().height) + 24;
    }

    function openAnchorInTab(targetHash, tabId) {
        const target = document.querySelector(targetHash);
        if (!target) return;
        setDashboardTab(tabId);
        window.requestAnimationFrame(() => {
            const targetTop = target.getBoundingClientRect().top + window.scrollY - getFixedNavOffset();
            window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        });
    }

    function initDashboardTabs() {
        if (el.dashboardTabButtons.length) {
            el.dashboardTabButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    const targetTab = button.dataset.tabTarget || 'analytics';
                    setDashboardTab(targetTab);
                });
            });
        }

        if (el.navAnchorLinks.length) {
            el.navAnchorLinks.forEach((link) => {
                link.addEventListener('click', (event) => {
                    const targetHash = link.getAttribute('href');
                    if (!targetHash || !targetHash.startsWith('#')) return;
                    event.preventDefault();
                    const targetTab = link.dataset.openTab || (targetHash === '#map-workspace-section' ? 'map-workspace' : 'analytics');
                    openAnchorInTab(targetHash, targetTab);
                    if (window.location.hash !== targetHash) {
                        window.history.replaceState(null, '', targetHash);
                    }
                });
            });
        }

        const initialTab = window.location.hash === '#map-workspace-section' ? 'map-workspace' : 'analytics';
        setDashboardTab(initialTab);
    }

    function getOpsStationById(stationId) {
        return OPS_MONITORING_STATIONS.find((station) => station.id === stationId) || null;
    }

    function renderOpsFeatureInfo(station) {
        if (!station) return;

        const measurement = getOpsMeasurementForYear(station, state.operationsSelectedYear);
        const theme = getOpsTheme(measurement?.status);
        if (el.opsFeatureStatus) {
            el.opsFeatureStatus.textContent = theme.label;
            el.opsFeatureStatus.style.color = theme.chipText;
            el.opsFeatureStatus.style.background = theme.chipBg;
        }
        if (el.opsFeatureTitle) el.opsFeatureTitle.textContent = `${station.id}, ${station.name}`;
        if (el.opsFeatureCode) el.opsFeatureCode.textContent = 'Danube Public Monitoring Network';
        if (el.opsFeatureOwner) el.opsFeatureOwner.textContent = station.owner || 'n/a';
        if (el.opsFeatureParameter) el.opsFeatureParameter.textContent = station.parameter || 'n/a';
        if (el.opsFeatureDate) {
            el.opsFeatureDate.textContent = measurement?.date ? `${formatDate(measurement.date)} (${measurement.year})` : 'No measurement';
        }
        if (el.opsFeatureValue) {
            const formatted = Number.isFinite(measurement?.value) ? measurement.value.toFixed(1) : 'n/a';
            el.opsFeatureValue.textContent = `${formatted} ${station.unit || ''}`.trim();
        }
        if (el.opsFeatureBasin) el.opsFeatureBasin.textContent = basinLabel(station.basin);
        if (el.opsFeatureCountry) el.opsFeatureCountry.textContent = station.country || 'n/a';
        if (el.opsFeatureSource) el.opsFeatureSource.textContent = station.source || 'n/a';
    }

    function setActiveOpsFeature(stationId) {
        const station = typeof stationId === 'string' ? getOpsStationById(stationId) : stationId;
        if (!station) return;
        state.operationsActiveFeature = station.id;
        renderOpsFeatureInfo(station);
        refreshOpsStationsForYear();
    }

    function buildOpsPopup(station, measurement) {
        const theme = getOpsTheme(measurement?.status);
        const value = Number.isFinite(measurement?.value) ? measurement.value.toFixed(1) : 'n/a';
        const dateLabel = measurement?.date ? formatDate(measurement.date) : 'No date';
        return `
            <strong>${station.name}</strong><br>
            <span>${station.id} - ${basinLabel(station.basin)}</span><br>
            <span>Status: ${theme.label}</span><br>
            <span>${station.parameter}: ${value} ${station.unit}</span><br>
            <span>${dateLabel}</span>
        `;
    }

    function refreshOpsStationsForYear() {
        state.operationsStationMarkers.forEach((entry) => {
            const measurement = getOpsMeasurementForYear(entry.station, state.operationsSelectedYear);
            const theme = getOpsTheme(measurement?.status);
            entry.marker.setStyle({
                fillColor: theme.marker,
                color: '#ffffff',
                weight: 1.4,
                opacity: 0.95,
                fillOpacity: 0.9,
                radius: state.operationsActiveFeature === entry.station.id ? 8 : 7
            });
            entry.marker.bindPopup(buildOpsPopup(entry.station, measurement));
        });

        if (state.operationsActiveFeature) {
            const activeStation = getOpsStationById(state.operationsActiveFeature);
            if (activeStation) renderOpsFeatureInfo(activeStation);
        }
    }

    function setOpsYear(yearValue) {
        const parsed = Number(yearValue);
        if (!Number.isFinite(parsed)) return;
        state.operationsSelectedYear = parsed;
        if (el.opsTimelineYear) el.opsTimelineYear.value = String(parsed);
        if (el.opsTimelineValue) el.opsTimelineValue.textContent = String(parsed);
        refreshOpsStationsForYear();
    }

    function setOpsBasemap(basemapId) {
        if (!state.operationsMap) return;
        const requested = OPS_BASEMAP_CONFIG[basemapId] ? basemapId : 'light';
        const nextLayer = state.operationsBasemapLayers[requested];
        if (!nextLayer) return;

        const currentLayer = state.operationsBasemapLayers[state.operationsActiveBasemap];
        if (currentLayer && state.operationsMap.hasLayer(currentLayer)) {
            state.operationsMap.removeLayer(currentLayer);
        }
        if (!state.operationsMap.hasLayer(nextLayer)) {
            nextLayer.addTo(state.operationsMap);
        }
        state.operationsActiveBasemap = requested;
        if (el.opsBasemapSelect) el.opsBasemapSelect.value = requested;
    }

    function setOpsLayerVisibility(layerId, isVisible) {
        if (!state.operationsMap) return;
        const layerGroup = state.operationsLayerGroups.get(layerId);
        if (!layerGroup) return;
        if (isVisible) {
            if (!state.operationsMap.hasLayer(layerGroup)) layerGroup.addTo(state.operationsMap);
            return;
        }
        if (state.operationsMap.hasLayer(layerGroup)) {
            state.operationsMap.removeLayer(layerGroup);
        }
    }

    function filterOpsLayerList(queryText) {
        if (!el.opsLayerList) return;
        const query = String(queryText || '').trim().toLowerCase();
        const groups = Array.from(el.opsLayerList.querySelectorAll('.workspace-layer-group'));

        groups.forEach((group) => {
            const items = Array.from(group.querySelectorAll('.workspace-layer-item'));
            let visibleCount = 0;
            items.forEach((item) => {
                const label = item.textContent.toLowerCase();
                const visible = !query || label.includes(query);
                item.hidden = !visible;
                if (visible) visibleCount += 1;
            });
            group.hidden = visibleCount === 0;
        });
    }

    function resetOpsLayerVisibility() {
        el.opsLayerToggles.forEach((toggle) => {
            const defaultState = toggle.dataset.defaultChecked === '1';
            toggle.checked = defaultState;
            setOpsLayerVisibility(toggle.dataset.layerId, defaultState);
        });
        if (el.opsLayerSearch) {
            el.opsLayerSearch.value = '';
            filterOpsLayerList('');
        }
    }

    function focusOpsLocation(queryText) {
        if (!state.operationsMap) return;
        const query = String(queryText || '').trim().toLowerCase();
        if (!query) return;

        const match = OPS_MONITORING_STATIONS.find((station) => (
            station.id.toLowerCase().includes(query)
            || station.name.toLowerCase().includes(query)
            || station.country.toLowerCase().includes(query)
        ));
        if (!match) return;

        const markerEntry = state.operationsStationMarkers.find((entry) => entry.station.id === match.id);
        setActiveOpsFeature(match.id);
        state.operationsMap.flyTo(match.coords, 8, { duration: 0.8 });
        if (markerEntry) markerEntry.marker.openPopup();
    }

    function buildOperationsLayers(basinData) {
        if (!state.operationsMap) return;
        state.operationsLayerGroups = new Map();
        state.operationsStationMarkers = [];

        const basinZones = L.layerGroup();
        if (basinData && Array.isArray(basinData.features)) {
            L.geoJSON(basinData, {
                style: (feature) => {
                    const basinId = feature?.properties?.id;
                    const fillColor = basinId === 'upper' ? '#8FAB7A' : basinId === 'middle' ? '#5BA3C9' : '#7c88be';
                    return {
                        color: '#ffffff',
                        weight: 1.1,
                        fillColor,
                        fillOpacity: 0.32
                    };
                },
                onEachFeature: (feature, layer) => {
                    const label = feature?.properties?.name || basinLabel(feature?.properties?.id);
                    layer.bindTooltip(label, { className: 'map-zone-tip', sticky: true });
                }
            }).addTo(basinZones);
        }
        state.operationsLayerGroups.set('basin-zones', basinZones);

        const corridor = L.layerGroup();
        OPS_CORRIDOR_SEGMENTS.forEach((segment) => {
            L.polyline(segment, {
                color: '#1B3A6B',
                weight: 3,
                opacity: 0.86,
                dashArray: '8 8'
            }).addTo(corridor);
        });
        state.operationsLayerGroups.set('main-corridor', corridor);

        const stations = L.layerGroup();
        OPS_MONITORING_STATIONS.forEach((station) => {
            const measurement = getOpsMeasurementForYear(station, state.operationsSelectedYear);
            const theme = getOpsTheme(measurement?.status);
            const marker = L.circleMarker(station.coords, {
                radius: 7,
                fillColor: theme.marker,
                color: '#ffffff',
                weight: 1.4,
                opacity: 0.95,
                fillOpacity: 0.9
            });
            marker.bindTooltip(station.name, { direction: 'top', offset: [0, -6] });
            marker.bindPopup(buildOpsPopup(station, measurement));
            marker.on('click', () => setActiveOpsFeature(station.id));
            marker.addTo(stations);
            state.operationsStationMarkers.push({ station, marker });
        });
        state.operationsLayerGroups.set('monitoring-stations', stations);

        const hotspots = L.layerGroup();
        OPS_WATER_HOTSPOTS.forEach((hotspot) => {
            const radius = 6 + (hotspot.severity * 8);
            L.circleMarker(hotspot.coords, {
                radius,
                fillColor: '#ef4444',
                color: '#7f1d1d',
                weight: 1,
                fillOpacity: 0.28 + (hotspot.severity * 0.4),
                opacity: 0.78
            })
                .bindPopup(`<strong>${hotspot.label}</strong><br>Severity index: ${(hotspot.severity * 100).toFixed(0)}%`)
                .addTo(hotspots);
        });
        state.operationsLayerGroups.set('water-quality-hotspots', hotspots);

        const sedimentAlerts = L.layerGroup();
        OPS_SEDIMENT_ALERTS.forEach((alert) => {
            L.circleMarker(alert.coords, {
                radius: 7,
                fillColor: '#f97316',
                color: '#9a3412',
                weight: 1.2,
                fillOpacity: 0.72
            })
                .bindPopup(`<strong>${alert.label}</strong><br>Risk level: ${alert.level}`)
                .addTo(sedimentAlerts);
        });
        state.operationsLayerGroups.set('sediment-alerts', sedimentAlerts);

        const restorationSites = L.layerGroup();
        OPS_RESTORATION_SITES.forEach((site) => {
            L.circleMarker(site.coords, {
                radius: 6.5,
                fillColor: '#16a34a',
                color: '#14532d',
                weight: 1.1,
                fillOpacity: 0.72
            })
                .bindPopup(`<strong>${site.label}</strong><br>${basinLabel(site.basin)}`)
                .addTo(restorationSites);
        });
        state.operationsLayerGroups.set('restoration-sites', restorationSites);

        const projectClusters = L.layerGroup();
        OPS_PROJECT_CLUSTERS.forEach((cluster) => {
            L.circleMarker(cluster.coords, {
                radius: 7 + (cluster.projects / 5),
                fillColor: '#2563eb',
                color: '#1e3a8a',
                weight: 1.1,
                fillOpacity: 0.34
            })
                .bindPopup(`<strong>${cluster.label}</strong><br>Projects in cluster: ${cluster.projects}`)
                .addTo(projectClusters);
        });
        state.operationsLayerGroups.set('project-clusters', projectClusters);

        el.opsLayerToggles.forEach((toggle) => {
            if (!toggle.dataset.defaultChecked) {
                toggle.dataset.defaultChecked = toggle.checked ? '1' : '0';
            }
            setOpsLayerVisibility(toggle.dataset.layerId, toggle.checked);
        });
    }

    async function initMapWorkspace() {
        if (!el.operationsMap) return;
        if (typeof window.L === 'undefined') return;
        if (state.operationsMap) return;

        const map = L.map(el.operationsMap, {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: false
        }).setView([47.0, 20.5], 5);

        state.operationsMap = map;
        Object.entries(OPS_BASEMAP_CONFIG).forEach(([id, config]) => {
            state.operationsBasemapLayers[id] = L.tileLayer(config.url, config.options);
        });
        setOpsBasemap(el.opsBasemapSelect?.value || 'light');

        let basinData = null;
        try {
            basinData = await loadJson('./data/maps/danube-basins3.geojson');
        } catch (error) {
            console.error(error);
        }

        buildOperationsLayers(basinData);
        setOpsYear(state.operationsSelectedYear);
        setActiveOpsFeature(OPS_MONITORING_STATIONS[0].id);

        fitOpsMapToDanube(state.dashboardActiveTab === 'map-workspace');
        setTimeout(() => map.invalidateSize(), 80);
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
        if (el.opsBasemapSelect) {
            el.opsBasemapSelect.addEventListener('change', (event) => {
                setOpsBasemap(event.target.value);
            });
        }
        if (el.opsTimelineYear) {
            el.opsTimelineYear.addEventListener('input', (event) => {
                setOpsYear(event.target.value);
            });
        }
        if (el.opsLayerToggles.length) {
            el.opsLayerToggles.forEach((toggle) => {
                toggle.addEventListener('change', (event) => {
                    setOpsLayerVisibility(toggle.dataset.layerId, event.target.checked);
                });
            });
        }
        if (el.opsLayerSearch) {
            el.opsLayerSearch.addEventListener('input', (event) => {
                filterOpsLayerList(event.target.value);
            });
        }
        if (el.opsResetLayers) {
            el.opsResetLayers.addEventListener('click', resetOpsLayerVisibility);
        }
        if (el.opsLocationSearchBtn) {
            el.opsLocationSearchBtn.addEventListener('click', () => {
                focusOpsLocation(el.opsLocationSearch?.value);
            });
        }
        if (el.opsLocationSearch) {
            el.opsLocationSearch.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                focusOpsLocation(el.opsLocationSearch.value);
            });
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
            if (state.leafletMap) state.leafletMap.invalidateSize();
            if (state.operationsMap) state.operationsMap.invalidateSize();
        });
    }

    async function init() {
        try {
            initDashboardTabs();
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
            await Promise.all([initDanubeMap(), initMapWorkspace()]);
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
