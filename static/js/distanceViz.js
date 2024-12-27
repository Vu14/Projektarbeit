let distanceVizContext = null;

function createDistancePriceVisualization(data) {
    // Container Setup
    const containerDiv = d3.select('#distanceViz')
        .classed('loading', false)
        .html(''); // Clear previous visualizations

    // Handle case with no data
    if (data.length === 0) {
        containerDiv.html('<p style="color: gray;">No data available for the selected city and period.</p>');
        return;
    }

    // Dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const containerWidth = containerDiv.node().getBoundingClientRect().width;
    const width = containerWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG
    const svg = containerDiv.append('svg')
        .attr('width', containerWidth)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.dist))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.realSum))
        .range([height, 0]);

    // X-Axis
    const xAxis = svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .selectAll('text')
        .style('fill', 'var(--text-color)');

    // X-Axis Label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("fill", "var(--text-color)")
        .style("font-size", "14px")
        .style("text-anchor", "middle")
        .text("Distance to City Center (km)");

    // Y-Axis
    const yAxis = svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll('text')
        .style('fill', 'var(--text-color)');

    // Y-Axis Label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("fill", "var(--text-color)")
        .style("font-size", "14px")
        .style("text-anchor", "middle")
        .text("Rental Price (RealSum) (€)");

    // Tooltip setup
    const tooltip = d3.select('#distanceViz')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Scatterplot points
    const pointsGroup = svg.append('g');

    pointsGroup.selectAll('.point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => xScale(d.dist))
        .attr('cy', d => yScale(d.realSum))
        .attr('r', 5)
        .style('fill', 'steelblue')
        .on('mouseover', function (event, d) {
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`Distance: ${d.dist.toFixed(2)} km<br>Price: €${d.realSum.toFixed(2)}`)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            tooltip.transition().duration(500).style('opacity', 0);
        });

    // Slider Container
    const sliderContainer = containerDiv.append('div')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('align-items', 'center')
        .style('margin-top', '20px');

    // Label for the slider
    sliderContainer.append('label')
        .text('Y-Axis Scale:')
        .style('color', 'var(--text-color)')
        .style('margin-bottom', '10px')
        .style('font-size', '14px')
        .style('font-weight', 'bold');

    // Slider Input
    sliderContainer.append('input')
        .attr('type', 'range')
        .attr('min', 10)
        .attr('max', 100)
        .attr('value', 100)
        .attr('step', 1)
        .style('width', '80%')
        .style('appearance', 'none')
        .style('height', '8px')
        .style('border-radius', '5px')
        .style('background', 'var(--box-shadow)')
        .style('outline', 'none')
        .style('cursor', 'pointer')
        .on('input', function () {
            // Update Y-axis scaling
            const scaleFactor = +this.value / 100;
            const minRealSum = d3.min(data, d => d.realSum);
            const maxRealSum = d3.max(data, d => d.realSum);
            const newMax = minRealSum + (maxRealSum - minRealSum) * scaleFactor;

            yScale.domain([minRealSum, newMax]);

            // Update points
            pointsGroup.selectAll('.point')
                .transition()
                .duration(200)
                .attr('cy', d => yScale(d.realSum));

            // Update Y-axis
            svg.select('.y-axis')
                .transition()
                .duration(200)
                .call(d3.axisLeft(yScale).tickFormat(d => `€${d.toFixed(0)}`));

            // Update slider value display
            d3.select('#sliderValue').text(`Scale: ${this.value}%`);
        });

    // Tooltip for Slider Value
    sliderContainer.append('span')
        .attr('id', 'sliderValue')
        .style('color', 'var(--text-color)')
        .style('font-size', '12px')
        .style('margin-top', '5px')
        .text('Scale: 100%');

    // Save context
    distanceVizContext = { svg, xScale, yScale, pointsGroup };
}

function updateDistancePriceVisualization(data) {
    if (!distanceVizContext) {
        console.warn('distanceVizContext not initialized. Recreating visualization.');
        createDistancePriceVisualization(data);
        return;
    }

    const { svg, xScale, yScale, pointsGroup } = distanceVizContext;

    // Update scales
    xScale.domain(d3.extent(data, d => d.dist));
    yScale.domain(d3.extent(data, d => d.realSum));

    // Update points
    pointsGroup.selectAll('.point')
        .data(data)
        .join('circle')
        .attr('class', 'point')
        .attr('r', 5)
        .attr('cx', d => xScale(d.dist))
        .attr('cy', d => yScale(d.realSum))
        .style('fill', 'steelblue');
}
