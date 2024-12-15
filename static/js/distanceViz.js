function createDistancePriceVisualization(data) {
    // Debug logging
    console.log("Starting Distance Viz with data:", data);
    console.log("Sample data point:", data[0]);

    // Container Setup
    const containerDiv = d3.select('#distanceViz')
        .classed('loading', false)
        .html('');

    // Check if we have the required data fields
    if (!data.some(d => d.dist !== undefined && d.realSum !== undefined)) {
        containerDiv.html('<p style="color: red;">Error: Missing required data fields (dist or realSum)</p>');
        console.error("Missing required data fields", data[0]);
        return;
    }

    // Fixed dimensions for testing
    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };

    // Create SVG with fixed size first
    const svg = containerDiv.append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter data and add debug logging
    const maxPrice = 1000;
    const filteredData = data.filter(d => d.realSum <= maxPrice && d.dist);
    console.log("Filtered data points:", filteredData.length);

    // Adjust dimensions
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Create scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.dist)])
        .range([0, plotWidth]);

    const y = d3.scaleLinear()
        .domain([0, maxPrice])
        .range([plotHeight, 0]);

    // Add axes first to be behind points
    svg.append('g')
        .attr('transform', `translate(0,${plotHeight})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));

    // Add dots
    svg.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.dist))
        .attr('cy', d => y(d.realSum))
        .attr('r', 4)
        .style('fill', 'steelblue')
        .style('opacity', 0.5);

    // Add labels
    svg.append('text')
        .attr('x', plotWidth / 2)
        .attr('y', plotHeight + 40)
        .style('text-anchor', 'middle')
        .text('Distance to Center (km)');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -plotHeight / 2)
        .style('text-anchor', 'middle')
        .text('Price (€)');
}

function updateDistancePriceVisualization(data) {
    console.log("Updating Distance Viz");
    createDistancePriceVisualization(data);
}