// Initialize the map visualization
function createGeoVisualization(data) {
    // Clear loading state and prepare container
    const container = d3.select('#geoViz')
        .classed('loading', false)
        .html('');

    // Get container dimensions
    const width = container.node().getBoundingClientRect().width;
    const height = 400;

    // Create SVG container
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create projection for Europe with adjusted initial scale
    const projection = d3.geoMercator()
        .center([0, 52])     // Roughly centered on Europe
        .scale(width * 1)    // Reduced initial zoom level
        .translate([width / 2, height / 2]);

    // Create path generator
    const path = d3.geoPath().projection(projection);

    // Create group for map features
    const mapGroup = svg.append('g');

    // Load and render the map
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        .then(worldData => {
            // Draw map paths
            mapGroup.selectAll('path')
                .data(worldData.features)
                .enter()
                .append('path')
                .attr('d', path)
                .style('fill', '#e0e0e0')
                .style('stroke', '#fff')
                .style('stroke-width', '0.5px');
            
            // Add enhanced zoom behavior
            const zoom = d3.zoom()
                .scaleExtent([0.5, 8])  // Allow zooming out to 0.5x
                .on('zoom', (event) => {
                    mapGroup.attr('transform', event.transform);
                });

            // Add zoom controls
            const zoomControls = svg.append('g')
                .attr('class', 'zoom-controls')
                .attr('transform', `translate(${width - 70}, 20)`);

            // Zoom in button
            zoomControls.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 25)
                .attr('height', 25)
                .attr('fill', 'white')
                .attr('stroke', '#666')
                .style('cursor', 'pointer')
                .on('click', () => zoom.scaleBy(svg.transition().duration(300), 1.5));

            zoomControls.append('text')
                .attr('x', 12.5)
                .attr('y', 16)
                .attr('text-anchor', 'middle')
                .style('font-size', '18px')
                .style('pointer-events', 'none')
                .text('+');

            // Zoom out button
            zoomControls.append('rect')
                .attr('x', 30)
                .attr('y', 0)
                .attr('width', 25)
                .attr('height', 25)
                .attr('fill', 'white')
                .attr('stroke', '#666')
                .style('cursor', 'pointer')
                .on('click', () => zoom.scaleBy(svg.transition().duration(300), 0.75));

            zoomControls.append('text')
                .attr('x', 42.5)
                .attr('y', 16)
                .attr('text-anchor', 'middle')
                .style('font-size', '18px')
                .style('pointer-events', 'none')
                .text('−');

            svg.call(zoom);
        })
        .catch(error => {
            console.error('Error loading map data:', error);
            container.html('Error loading map data');
        });
}

// Function to update the visualization (will be expanded later)
function updateGeoVisualization(data) {
    console.log('Update function will be implemented in next step');
}