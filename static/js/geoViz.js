let geoVizContext = null;

/**
 * Function to create the Geo Visualization with initial setup.
 * @param {Array} data - Data points to visualize.
 */
function createGeoVisualization(data,plot) {
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
    const container = d3.select(plot)
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
        
        div.style.backgroundColor = 'var(--header-background)';
        div.style.padding = '6px 8px';
        div.style.border = '1px solid var(--box-shadow)';
        div.style.borderRadius = '4px';
        
        div.innerHTML = '<h4 style="margin:0 0 5px 0; color: var(--text-color)">Price (€)</h4>';
        
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<div style="display:flex; align-items:center; margin:3px 0; color: var(--text-color)">' +
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

    // Add landmarks manually for each city
    const landmarks = {
        'berlin': [
            { name: 'Brandenburg Gate', coords: [52.5163, 13.3777], info: 'Historic city gate and a symbol of Berlin.' },
            { name: 'Reichstag', coords: [52.5186, 13.3762], info: 'The seat of the German parliament.' },
            { name: 'Berlin TV Tower', coords: [52.5208, 13.4094], info: 'Iconic tower with observation deck.' },
            { name: 'Checkpoint Charlie', coords: [52.5074, 13.3904], info: 'Famous Cold War border crossing.' },
            { name: 'Potsdamer Platz', coords: [52.5096, 13.3758], info: 'Vibrant square with modern architecture.' },
            { name: 'East Side Gallery', coords: [52.5058, 13.4394], info: 'Remnants of the Berlin Wall with murals.' }
        ],
        'paris': [
            { name: 'Eiffel Tower', coords: [48.8584, 2.2945], info: 'Iconic wrought-iron lattice tower.' },
            { name: 'Louvre Museum', coords: [48.8606, 2.3376], info: 'World-renowned art museum.' },
            { name: 'Notre-Dame Cathedral', coords: [48.8529, 2.3500], info: 'Gothic cathedral on Île de la Cité.' },
            { name: 'Sacré-Cœur', coords: [48.8867, 2.3431], info: 'Basilica with panoramic views of Paris.' },
            { name: 'Arc de Triomphe', coords: [48.8738, 2.2950], info: 'Triumphal arch honoring war heroes.' },
            { name: 'Place de la Concorde', coords: [48.8656, 2.3211], info: 'Historic square with fountains and statues.' }
        ],
        'rome': [
            { name: 'Colosseum', coords: [41.8902, 12.4922], info: 'Ancient amphitheater for gladiatorial games.' },
            { name: 'Roman Forum', coords: [41.8925, 12.4853], info: 'Center of Roman public life.' },
            { name: 'Trevi Fountain', coords: [41.9009, 12.4833], info: 'Famous Baroque fountain.' },
            { name: 'Pantheon', coords: [41.8986, 12.4769], info: 'Ancient temple with a massive dome.' },
            { name: 'Vatican City', coords: [41.9029, 12.4534], info: 'Seat of the Catholic Church.' },
            { name: 'Piazza Navona', coords: [41.8989, 12.4731], info: 'Elegant square with fountains and cafes.' }
        ],
        'amsterdam': [
            { name: 'Anne Frank House', coords: [52.3752, 4.8838], info: 'Museum honoring Anne Frank.' },
            { name: 'Van Gogh Museum', coords: [52.3584, 4.8811], info: 'Museum dedicated to Vincent van Gogh.' },
            { name: 'Rijksmuseum', coords: [52.3600, 4.8852], info: 'Dutch national museum with masterpieces.' },
            { name: 'Dam Square', coords: [52.3732, 4.8934], info: 'Bustling square in the city center.' },
            { name: 'Amsterdam Canals', coords: [52.3702, 4.8936], info: 'UNESCO World Heritage Site.' },
            { name: 'Vondelpark', coords: [52.3583, 4.8688], info: 'Popular urban park.' }
        ],
        'vienna': [
            { name: 'Schönbrunn Palace', coords: [48.1845, 16.3122], info: 'Baroque palace with vast gardens.' },
            { name: 'St. Stephens Cathedral', coords: [48.2082, 16.3738], info: 'Gothic cathedral in the city center.' },
            { name: 'Belvedere Palace', coords: [48.1910, 16.3805], info: 'Historic palace and art museum.' },
            { name: 'Hofburg Palace', coords: [48.2065, 16.3634], info: 'Former imperial palace.' },
            { name: 'Prater Amusement Park', coords: [48.2167, 16.3969], info: 'Amusement park with the iconic Ferris wheel.' },
            { name: 'Vienna State Opera', coords: [48.2025, 16.3688], info: 'World-famous opera house.' }
        ],
        'athens': [
            { name: 'Acropolis of Athens', coords: [37.9715, 23.7267], info: 'Ancient citadel containing Parthenon.' },
            { name: 'Parthenon', coords: [37.9715, 23.7267], info: 'Temple dedicated to Athena.' },
            { name: 'Temple of Olympian Zeus', coords: [37.9699, 23.7333], info: 'Monumental ancient Greek temple.' },
            { name: 'National Archaeological Museum', coords: [37.9891, 23.7314], info: 'Museum with ancient artifacts.' },
            { name: 'Ancient Agora of Athens', coords: [37.9757, 23.7228], info: 'Marketplace and civic center.' },
            { name: 'Plaka', coords: [37.9744, 23.7348], info: 'Historic neighborhood with narrow streets.' }
        ],
        'budapest': [
            { name: 'Buda Castle', coords: [47.4962, 19.0398], info: 'Historical castle and palace complex.' },
            { name: 'Parliament Building', coords: [47.5076, 19.0456], info: 'Iconic Gothic Revival architecture.' },
            { name: 'Chain Bridge', coords: [47.498, 19.045], info: 'Suspension bridge connecting Buda and Pest.' },
            { name: 'Heroes Square', coords: [47.5141, 19.0773], info: 'Historic square with statues of leaders.' },
            { name: 'St. Stephens Basilica', coords: [47.5009, 19.0534], info: 'Prominent domed Catholic basilica.' },
            { name: 'Thermal Baths', coords: [47.4973, 19.0408], info: 'Relaxing traditional Hungarian baths.' }
        ],
        'lisbon': [
            { name: 'Belém Tower', coords: [38.6916, -9.2161], info: 'Iconic fortification and UNESCO site.' },
            { name: 'Jerónimos Monastery', coords: [38.6971, -9.2065], info: 'Historic monastery and architecture marvel.' },
            { name: 'São Jorge Castle', coords: [38.7139, -9.1334], info: 'Hilltop Moorish castle and fort.' },
            { name: 'Praça do Comércio', coords: [38.7077, -9.1365], info: 'Historic square by the Tagus River.' },
            { name: 'Alfama', coords: [38.7126, -9.1314], info: 'Oldest district with narrow streets and fado music.' },
            { name: 'Santa Justa Lift', coords: [38.7111, -9.1399], info: 'Elevator offering panoramic views.' }
        ]
    };

        Object.entries(landmarks).forEach(([city, places]) => {
            places.forEach(place => {
                const marker = L.marker(place.coords).addTo(map);
                marker.bindPopup(`<strong>${place.name}</strong><br>${place.info}`);
    
                marker.on('click', () => {
                    marker.openPopup();
                });
            });
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
