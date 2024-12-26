/**
 * Function to create a satisfaction visualization using a radar chart.
 * @param {Array} data - Array of data points to visualize.
 */
function createSatisfactionVisualization(data) {
    // Container setup
    const containerDiv = d3.select('#satisfactionViz')
        .classed('loading', false)
        .html('');

    // Dimensions
    const width = 600;
    const height = 500;
    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;

    // Create SVG element
    const svg = containerDiv.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    // Define metrics to visualize
    const features = [
        { name: 'guest_satisfaction_overall', max: 100, label: 'Guest Satisfaction' },
        { name: 'cleanliness_rating', max: 10, label: 'Cleanliness' },
        { name: 'dist', max: 20, label: 'Central Location' },
        { name: 'attr_index', max: 100, label: 'Attractions' },
        { name: 'rest_index', max: 100, label: 'Restaurants' }
    ];

    // Calculate mean values for each metric
    const meanValues = {};
    features.forEach(feature => {
        meanValues[feature.name] = d3.mean(data, d => {
            let value = d[feature.name];
            switch (feature.name) {
                case 'cleanliness_rating':
                    return value * 10;
                case 'dist':
                    return Math.max(0, 100 - (value / feature.max * 100));
                case 'attr_index':
                case 'rest_index':
                    return Math.min(100, (value / feature.max) * 100);
                default:
                    return value;
            }
        });
    });

    // Scales for radial chart
    const angleScale = d3.scaleLinear()
        .domain([0, features.length])
        .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, radius]);

    // Draw concentric circles
    const circles = [20, 40, 60, 80, 100];
    svg.selectAll('.circle')
        .data(circles)
        .enter()
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', d => radiusScale(d))
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-dasharray', '2,2');

    // Draw axes for each feature
    const axes = svg.selectAll('.axis')
        .data(features)
        .enter()
        .append('g')
        .attr('class', 'axis');

    axes.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => radius * Math.cos(angleScale(i) - Math.PI / 2))
        .attr('y2', (d, i) => radius * Math.sin(angleScale(i) - Math.PI / 2))
        .attr('stroke', '#999')
        .attr('stroke-dasharray', '2,2');

    // Add axis labels with values
    axes.append('g')
        .attr('transform', (d, i) => {
            const angle = angleScale(i) - Math.PI / 2;
            const x = (radius + 20) * Math.cos(angle);
            const y = (radius + 20) * Math.sin(angle);
            return `translate(${x},${y})`;
        })
        .each(function (feature) {
            const value = meanValues[feature.name];
            let displayValue;

            switch (feature.name) {
                case 'cleanliness_rating':
                    displayValue = (value / 10).toFixed(1) + '/10';
                    break;
                case 'dist':
                    displayValue = ((100 - value) / 5).toFixed(1) + 'km';
                    break;
                case 'attr_index':
                case 'rest_index':
                    displayValue = value.toFixed(0) + '%';
                    break;
                default:
                    displayValue = value.toFixed(0) + '%';
            }

            // Add label
            d3.select(this)
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '-0.5em')
                .style('font-weight', 'bold')
                .style('font-size', '12px')
                .text(feature.label);

            // Add value
            d3.select(this)
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1em')
                .style('font-size', '12px')
                .style('fill', '#2c7fb8')
                .text(displayValue);
        });

    // Add radial labels
    svg.selectAll('.circle-label')
        .data([20, 40, 60, 80]) // Exclude 100 for readability
        .enter()
        .append('text')
        .attr('x', 0)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .text(d => d)
        .style('fill', '#666')
        .style('font-size', '10px');

    // Prepare data points
    const dataPoints = features.map(feature => ({
        name: feature.name,
        value: meanValues[feature.name]
    }));

    // Create line generator
    const line = d3.lineRadial()
        .angle((d, i) => angleScale(i))
        .radius(d => radiusScale(d.value))
        .curve(d3.curveLinearClosed);

    // Draw radar polygon
    svg.append('path')
        .datum(dataPoints)
        .attr('d', line)
        .attr('fill', '#69b3a2')
        .attr('fill-opacity', 0.3)
        .attr('stroke', '#69b3a2')
        .attr('stroke-width', 2);

    // Add data points
    svg.selectAll('.data-point')
        .data(dataPoints)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr('cy', (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr('r', 4)
        .attr('fill', '#69b3a2');
}

/**
 * Function to update the satisfaction visualization with new data.
 * @param {Array} data - Array of data points to visualize.
 */
function updateSatisfactionVisualization(data) {
    createSatisfactionVisualization(data);
}
