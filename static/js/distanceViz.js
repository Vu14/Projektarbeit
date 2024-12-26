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

    // Axes
    const xAxis = svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    xAxis.append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text("Distance to City Center");

    const yAxis = svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale));

    yAxis.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("fill", "black")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text("Rental Price (RealSum)");

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
            tooltip.html(`Distance: ${d.dist}<br>Price: ${d.realSum}`)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            tooltip.transition().duration(500).style('opacity', 0);
        })
        .on('click', function (event, d) {
            tooltip.html(`Distance: ${d.dist}<br>Price: ${d.realSum}`)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .style('opacity', 1);
        });

    // Slider for Y-axis scaling
    const slider = containerDiv.append('input')
        .attr('type', 'range')
        .attr('min', 10)
        .attr('max', 100)
        .attr('value', 100)
        .attr('step', 1)
        .style('width', '200px')
        .on('input', function () {
            const scaleFactor = +this.value / 100;
            const newYExtent = [
                d3.extent(data, d => d.realSum)[0],
                d3.extent(data, d => d.realSum)[0] + (d3.extent(data, d => d.realSum)[1] - d3.extent(data, d => d.realSum)[0]) * scaleFactor
            ];
            yScale.domain(newYExtent);

            pointsGroup.selectAll('.point')
                .attr('cy', d => yScale(d.realSum));

            yAxis.call(d3.axisLeft(yScale));
        });

    containerDiv.append('label')
        .text('Y-Axis Scale:')
        .style('margin-right', '10px')
        .style('display', 'block')
        .node().appendChild(slider.node());

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

    // Update axes
    svg.select('.x-axis')
        .transition().duration(500)
        .call(d3.axisBottom(xScale));

    svg.select('.y-axis')
        .transition().duration(500)
        .call(d3.axisLeft(yScale));

    // Update points
    const points = pointsGroup.selectAll('.point').data(data);

    points.enter()
        .append('circle')
        .attr('class', 'point')
        .attr('r', 5)
        .style('fill', 'steelblue')
        .merge(points)
        .transition().duration(500)
        .attr('cx', d => xScale(d.dist))
        .attr('cy', d => yScale(d.realSum));

    points.exit().remove();
}
