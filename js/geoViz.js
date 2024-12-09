function createGeoVisualization(data) {
    // Clear container
    const container = d3.select('#geoViz')
        .classed('loading', false)
        .html('');

    // Set dimensions
    const width = container.node().getBoundingClientRect().width;
    const height = 400;

    // Create SVG
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create projection centered on London
    const projection = d3.geoMercator()
        .center([-0.1276, 51.5074])  // London coordinates
        .scale(width * 3)            // Zoom level
        .translate([width / 2, height / 2]);

    // Create groups for map and points
    const mapGroup = svg.append('g');
    const pointsGroup = svg.append('g');

    // Load world map
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        .then(worldData => {
            // Draw map
            mapGroup.selectAll('path')
                .data(worldData.features)
                .enter()
                .append('path')
                .attr('d', d3.geoPath().projection(projection))
                .style('fill', '#e0e0e0')
                .style('stroke', '#fff');

            // Draw points
            pointsGroup.selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', d => projection([+d.lng, +d.lat])[0])
                .attr('cy', d => projection([+d.lng, +d.lat])[1])
                .attr('r', 3)
                .style('fill', 'red')
                .style('opacity', 0.6);

            // Basic zoom
            const zoom = d3.zoom()
                .scaleExtent([0.5, 8])
                .on('zoom', (event) => {
                    mapGroup.attr('transform', event.transform);
                    pointsGroup.attr('transform', event.transform);
                });

            svg.call(zoom);
        });
}