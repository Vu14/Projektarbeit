function createGeoVisualization(data) {
    // Remove loading state
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
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', zoomed);
    
    svg.call(zoom);
    
    // Create a group for all map elements that will be transformed
    const g = svg.append('g');
    
    // Create a projection centered on Europe
    const projection = d3.geoMercator()
        .center([12, 50])  // Centered better on Europe
        .scale(width * 1.5)  // Adjusted scale
        .translate([width / 2, height / 2]);
    
    // Create path generator
    const path = d3.geoPath().projection(projection);
    
    // Load world map data
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        .then(worldData => {
            // Draw the map
            g.append('g')
                .selectAll('path')
                .data(worldData.features)
                .enter()
                .append('path')
                .attr('d', path)
                .style('fill', '#e0e0e0')
                .style('stroke', '#fff')
                .style('stroke-width', '0.5px');

            // Create a group for the bubbles
            const bubbleGroup = g.append('g');
            
            // Store references for updates
            container.property('_projection', projection);
            container.property('_bubbleGroup', bubbleGroup);
            
            // Initial update
            updateGeoVisualization(data);
        });

    // Zoom function
    function zoomed(event) {
        g.attr('transform', event.transform);
        
        // Update circle sizes inversely to zoom level
        if (g.selectAll('circle').size() > 0) {
            g.selectAll('circle').attr('r', d => d._baseRadius / Math.sqrt(event.transform.k));
        }
    }
}

function updateGeoVisualization(data) {
    const container = d3.select('#geoViz');
    const projection = container.property('_projection');
    const bubbleGroup = container.property('_bubbleGroup');
    
    if (!projection || !bubbleGroup) return;

    // Group data by city and calculate averages
    const cityAverages = d3.group(data, d => d.city);
    const processedData = Array.from(cityAverages, ([city, values]) => ({
        city: city,
        lat: values[0].lat,
        lng: values[0].lng,
        avgPrice: d3.mean(values, d => d.realSum),
        count: values.length
    }));

    // Scale for bubble size
    const bubbleScale = d3.scaleSqrt()
        .domain([0, d3.max(processedData, d => d.count)])
        .range([5, 20]);

    // Color scale based on average price
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(processedData, d => d.avgPrice)]);

    // Update circles
    const circles = bubbleGroup.selectAll('circle')
        .data(processedData, d => d.city);

    // Remove old circles
    circles.exit().remove();

    // Add new circles and update existing ones
    circles.enter()
        .append('circle')
        .merge(circles)
        .attr('cx', d => projection([d.lng, d.lat])[0])
        .attr('cy', d => projection([d.lng, d.lat])[1])
        .each(function(d) {
            d._baseRadius = bubbleScale(d.count); // Store base radius for zoom
        })
        .attr('r', d => d._baseRadius)
        .style('fill', d => colorScale(d.avgPrice))
        .style('fill-opacity', 0.7)
        .style('stroke', '#fff')
        .style('stroke-width', '1px')
        .on('mouseover', function(event, d) {
            // Create tooltip
            const tooltip = d3.select('#geoViz')
                .append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('background', 'white')
                .style('padding', '10px')
                .style('border', '1px solid #ddd')
                .style('border-radius', '4px')
                .style('pointer-events', 'none')
                .style('z-index', 1000);

            tooltip.html(`
                <strong>${d.city}</strong><br>
                Average Price: €${d.avgPrice.toFixed(2)}<br>
                Listings: ${d.count}
            `);

            // Position tooltip
            const tooltipWidth = tooltip.node().getBoundingClientRect().width;
            const tooltipHeight = tooltip.node().getBoundingClientRect().height;
            
            tooltip
                .style('left', `${event.pageX - tooltipWidth/2}px`)
                .style('top', `${event.pageY - tooltipHeight - 10}px`);

            // Highlight circle
            d3.select(this)
                .style('fill-opacity', 1)
                .style('stroke-width', '2px');
        })
        .on('mouseout', function() {
            // Remove tooltip
            d3.select('#geoViz .tooltip').remove();
            
            // Reset circle style
            d3.select(this)
                .style('fill-opacity', 0.7)
                .style('stroke-width', '1px');
        });
}