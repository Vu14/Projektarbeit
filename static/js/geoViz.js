let geoVizContext = null;

/**
 * Function to create the Geo Visualization with initial setup.
 * @param {Array} data - Data points to visualize.
 */
function createGeoVisualization(data) {
    const cityConfig = {
        'berlin': {
            center: [52.52, 13.405],
            zoom: 12,
            file: './data/geojson/cities.geojson'
        },
        'amsterdam': {
            center: [52.3676, 4.9041],
            zoom: 12,
            file: './data/geojson/cities.geojson'
        },
        'paris': {
            center: [48.8566, 2.3522],
            zoom: 12,
            file: './data/geojson/cities.geojson'
        },
        'athens': {
            center: [37.9838, 23.7275],
            zoom: 12,
            file: './data/geojson/cities.geojson'
        },
        'budapest': {
            center: [47.4979, 19.0402],
            zoom: 12,
            file: './data/geojson/cities.geojson'
        },
        'lisbon': {
            center: [38.7223, -9.139],
            zoom: 12,
            file: './data/geojson/cities.geojson'
        },
        'rome': {
            center: [41.9028, 12.4964],
            zoom: 12,
            file: './data/geojson/cities.geojson'
        },
        'vienna': {
            center: [48.2082, 16.3738],
            zoom: 12,
            file: './data/geojson/cities.geojson'
        }
    };

    // Create and configure the map container
    const container = d3.select('#geoViz')
        .classed('loading', false)
        .html('');

    const mapContainer = container.append('div')
        .attr('id', 'map')
        .style('width', '100%')
        .style('height', '400px');

    // Initialize the map with default city (Berlin)
    const map = L.map('map').setView(cityConfig['berlin'].center, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize layers
    const markersLayer = L.layerGroup().addTo(map);
    let geojsonLayer;

    // Create color scale for visualization
    const colorScale = d3.scaleSequential()
        .domain([0, 500])
        .interpolator(d3.interpolateBlues);

    // Add a legend to the map
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 100, 200, 300, 400, 500];
        
        div.style.backgroundColor = 'white';
        div.style.padding = '6px 8px';
        div.style.border = '1px solid #ccc';
        div.style.borderRadius = '4px';
        
        div.innerHTML = '<h4 style="margin:0 0 5px 0">Price (€)</h4>';
        
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<div style="display:flex; align-items:center; margin:3px 0;">' +
                '<i style="background:' + colorScale(grades[i]) + '; ' +
                'width: 18px; ' +
                'height: 18px; ' +
                'float: left; ' +
                'margin-right: 8px; ' +
                'opacity: 0.7;"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+') +
                '</div>';
        }
        return div;
    };
    legend.addTo(map);

    // Store the visualization context for updates
    geoVizContext = {
        map,
        markersLayer,
        geojsonLayer,
        colorScale,
        cityConfig
    };

    // Initialize visualization with default city
    updateGeoVisualization(data, 'berlin');

    // Handle window resizing
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });
}

/**
 * Function to update the Geo Visualization with new data and city settings.
 * @param {Array} data - Data points to visualize.
 * @param {string} selectedCity - The selected city for the visualization.
 */
function updateGeoVisualization(data, selectedCity) {
    if (!geoVizContext) {
        console.error('geoVizContext is not initialized');
        return;
    }
    
    const { map, markersLayer, colorScale, cityConfig } = geoVizContext;
    const citySettings = cityConfig[selectedCity];

    // Update the map view to the selected city's settings
    map.setView(citySettings.center, citySettings.zoom);
    
    // Clear existing markers from the map
    markersLayer.clearLayers();

    // Add markers for each data point
    data.forEach(d => {
        if (!d.lat || !d.lng) return; // Skip entries with missing coordinates

        const circle = L.circleMarker([d.lat, d.lng], {
            radius: 4,
            fillColor: colorScale(+d.realSum),
            color: colorScale(+d.realSum),
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        });

        circle.bindPopup(`
            <strong>Price:</strong> €${(+d.realSum).toFixed(2)}<br>
            <strong>Room Type:</strong> ${d.room_type}<br>
            <strong>Capacity:</strong> ${d.person_capacity} persons<br>
            <strong>Satisfaction:</strong> ${d.guest_satisfaction_overall}/100<br>
            <strong>Cleanliness:</strong> ${d.cleanliness_rating}/10
        `);

        markersLayer.addLayer(circle);
    });
}
