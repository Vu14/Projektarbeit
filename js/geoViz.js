function createGeoVisualization(data) {
    // Filter only Berlin data
    const berlinData = data.filter(d => d._filename && d._filename.startsWith('berlin_'));
    console.log('Number of Berlin listings:', berlinData.length);

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

    // Create projection centered on Berlin
    const projection = d3.geoMercator()
        .center([13.405, 52.52])     // Berlin coordinates
        .scale(width * 4)            // Zoom level
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
                .style('stroke', '#999')
                .style('stroke-width', '0.5px');

            // Draw points for Berlin
            pointsGroup.selectAll('circle')
                .data(berlinData)
                .enter()
                .append('circle')
                .attr('cx', d => projection([+d.lng, +d.lat])[0])
                .attr('cy', d => projection([+d.lng, +d.lat])[1])
                .attr('r', 2)
                .style('fill', '#ff4444')
                .style('opacity', 0.5);

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