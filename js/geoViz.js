function createGeoVisualization(data) {
    // Konfiguration für die Städte
    const cityConfig = {
        'berlin': {
            center: [13.405, 52.52],
            scale: 5,
            file: './data/geojson/cities.geojson'
        },
        'amsterdam': {
            center: [4.9041, 52.3676],
            scale: 6,
            file: './data/geojson/cities.geojson'
        },
        'paris': {
            center: [2.3522, 48.8566],
            scale: 6,
            file: './data/geojson/cities.geojson'
        },
        'athens': {
            center: [23.7275, 37.9838],
            scale: 6,
            file: './data/geojson/cities.geojson'
        },
        'budapest': {
            center: [19.0402, 47.4979],
            scale: 6,
            file: './data/geojson/cities.geojson'
        },
        'lisbon': {
            center: [-9.139, 38.7223],
            scale: 6,
            file: './data/geojson/cities.geojson'
        },
        'rome': {
            center: [12.4964, 41.9028],
            scale: 6,
            file: './data/geojson/cities.geojson'
        },
        'vienna': {
            center: [16.3738, 48.2082],
            scale: 6,
            file: './data/geojson/cities.geojson'
        }
    };

    // Dropdown für Stadtauswahl erstellen
    const container = d3.select('#geoViz')
        .classed('loading', false)
        .html('');

    // Füge Dropdown-Menü für Stadtwahl hinzu
    const selectorCity = container.append('select')
        .style('margin', '10px')
        .style('padding', '5px')
        .on('change', function() {
            selectedCity = this.value;
            updateVisualization(this.value, selectedPeriod);
        });

    selectorCity.selectAll('option')
        .data(Object.keys(cityConfig))
        .enter()
        .append('option')
        .text(d => d.charAt(0).toUpperCase() + d.slice(1))
        .attr('value', d => d);

    // Füge Dropdown-Menü für Zeitraumwahl (weekday/weekend) hinzu
    const selectorPeriod = container.append('select')
        .style('margin', '10px')
        .style('padding', '5px')
        .on('change', function() {
            selectedPeriod = this.value;
            updateVisualization(selectedCity, selectedPeriod);
        });

    selectorPeriod.selectAll('option')
        .data(['weekday', 'weekend'])
        .enter()
        .append('option')
        .text(d => d.charAt(0).toUpperCase() + d.slice(1))
        .attr('value', d => d);

    // Set dimensions
    const width = container.node().getBoundingClientRect().width;
    const height = 400;

    // Create SVG
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('border', '1px solid #ccc')
        .style('background', '#f8f9fa');

    // Create color scale
    const colorScale = d3.scaleSequential()
        .domain([0, 500])
        .interpolator(d3.interpolateBlues);

    let selectedCity = 'berlin'; // Default-Stadt
    let selectedPeriod = 'weekday'; // Default-Zeitraum

    // Funktion zum Aktualisieren der Visualisierung
    function updateVisualization(selectedCity, selectedPeriod) {
        const cityData = data.filter(d => 
            d._filename && 
            d._filename.includes(`${selectedCity}_${selectedPeriod}`)
        );
        const citySettings = cityConfig[selectedCity];

        console.log(selectedCity)
        console.log(selectedPeriod)
        console.log("CityData"+cityData)
        // Create projection for selected city
        const projection = d3.geoMercator()
            .center(citySettings.center)
            .scale(width * citySettings.scale)
            .translate([width / 2, height / 2]);

        // Clear previous content
        svg.selectAll('g').remove();

        // Create new groups
        const mapGroup = svg.append('g');
        const pointsGroup = svg.append('g');
        let currentZoom = 1;

        // Load and draw the map
        d3.json(citySettings.file)
            .then(geoData => {
                // Draw map
                mapGroup.selectAll('path')
                    .data(geoData.features)
                    .enter()
                    .append('path')
                    .attr('d', d3.geoPath().projection(projection))
                    .style('fill', '#e0e0e0')
                    .style('stroke', '#999')
                    .style('stroke-width', '0.5px');

                // Draw points
                pointsGroup.selectAll('circle')
                    .data(cityData)
                    .enter()
                    .append('circle')
                    .attr('cx', d => {
                        const proj = projection([+d.lng, +d.lat]);
                        return proj[0];
                    })
                    .attr('cy', d => projection([+d.lng, +d.lat])[1])
                    .attr('r', 0.8)
                    .style('fill', d => colorScale(+d.realSum))
                    .style('opacity', 0.6)
                    .style('cursor', 'pointer')
                    .on('mouseover', function(event, d) {
                        d3.select(this)
                            .style('opacity', 1)
                            .attr('r', 0.8 / Math.sqrt(currentZoom) * 2);

                        const tooltip = container.append('div')
                            .attr('class', 'tooltip')
                            .style('position', 'absolute')
                            .style('background', 'white')
                            .style('padding', '10px')
                            .style('border', '1px solid #999')
                            .style('border-radius', '4px')
                            .style('pointer-events', 'none')
                            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
                            .style('font-size', '12px')
                            .style('z-index', 1000);

                        tooltip.html(`
                            <strong>Price:</strong> €${(+d.realSum).toFixed(2)}<br>
                            <strong>Room Type:</strong> ${d.room_type}<br>
                            <strong>Capacity:</strong> ${d.person_capacity} persons<br>
                            <strong>Satisfaction:</strong> ${d.guest_satisfaction_overall}/100<br>
                            <strong>Cleanliness:</strong> ${d.cleanliness_rating}/10
                        `);

                        tooltip
                            .style('left', `${event.pageX + 10}px`)
                            .style('top', `${event.pageY - 10}px`);
                    })
                    .on('mouseout', function() {
                        d3.select(this)
                            .style('opacity', 0.6)
                            .attr('r', 0.8 / Math.sqrt(currentZoom));
                        container.selectAll('.tooltip').remove();
                    });

                // Add legend
                const legendWidth = 150;
                const legendHeight = 15;
                const legend = svg.append('g')
                    .attr('class', 'legend')
                    .attr('transform', `translate(${width - legendWidth - 20}, 20)`);

                // Create gradient
                const defs = svg.append('defs');
                const gradient = defs.append('linearGradient')
                    .attr('id', 'price-gradient')
                    .attr('x1', '0%')
                    .attr('x2', '100%')
                    .attr('y1', '0%')
                    .attr('y2', '0%');

                gradient.selectAll('stop')
                    .data(d3.range(10))
                    .enter()
                    .append('stop')
                    .attr('offset', (d, i) => `${i * 10}%`)
                    .attr('stop-color', d => colorScale(d * 500 / 9));

                // Add gradient rectangle
                legend.append('rect')
                    .attr('width', legendWidth)
                    .attr('height', legendHeight)
                    .style('fill', 'url(#price-gradient)');

                // Add legend labels
                legend.append('text')
                    .attr('x', 0)
                    .attr('y', -5)
                    .style('font-size', '10px')
                    .text('€0');

                legend.append('text')
                    .attr('x', legendWidth)
                    .attr('y', -5)
                    .style('font-size', '10px')
                    .style('text-anchor', 'end')
                    .text('€500+');

                // Add zoom
                const zoom = d3.zoom()
                    .scaleExtent([0.5, 20])
                    .on('zoom', (event) => {
                        currentZoom = event.transform.k;
                        mapGroup.attr('transform', event.transform);
                        pointsGroup.attr('transform', event.transform);
                        pointsGroup.selectAll('circle')
                            .attr('r', 0.8 / Math.sqrt(event.transform.k));
                    });

                svg.call(zoom);
            });
    }

    // Initial visualization with Berlin and Weekday
   updateVisualization('berlin', 'weekday');
}