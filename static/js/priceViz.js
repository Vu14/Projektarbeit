let resizeTimeout;

function createPriceVisualization(data) {
    // Filter extreme Ausreißer
    const maxPrice = 1000;
    data = data.filter(d => d.realSum <= maxPrice);

    // Container Setup
    const containerDiv = d3.select('#priceViz')
        .classed('loading', false)
        .html('')
        .style('display', 'flex')
        .style('flex-direction', 'row')
        .style('gap', '20px')
        .style('height', '100%');

    // Plot Container
    const plotDiv = containerDiv.append('div')
        .style('flex', '1')
        .style('min-width', '0')
        .style('height', '100%');

    // Stats Container
    const statsDiv = containerDiv.append('div')
        .style('width', '200px')
        .style('padding', '10px')
        .style('background-color', '#f8f9fa')
        .style('border-radius', '8px')
        .style('border', '1px solid #dee2e6')
        .style('height', 'fit-content');

    // Get container dimensions
    const containerHeight = plotDiv.node().getBoundingClientRect().height;
    const containerWidth = plotDiv.node().getBoundingClientRect().width;

    // Set margins
    const margin = {
        top: Math.max(20, containerHeight * 0.05),
        right: 20,
        bottom: Math.max(60, containerHeight * 0.15),
        left: 50
    };

    // Calculate available space
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = plotDiv.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data
    const pricesByCity = d3.rollup(data,
        v => ({
            q1: d3.quantile(v.map(d => d.realSum), 0.25),
            median: d3.median(v.map(d => d.realSum)),
            q3: d3.quantile(v.map(d => d.realSum), 0.75),
            min: Math.max(d3.min(v.map(d => d.realSum)), 0),
            max: Math.min(d3.max(v.map(d => d.realSum)), maxPrice),
            mean: d3.mean(v.map(d => d.realSum)),
            count: v.length
        }),
        d => d.city
    );

    // Scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain([...pricesByCity.keys()])
        .padding(0.2);

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, maxPrice])
        .nice();

    // Draw box plots
    pricesByCity.forEach((stats, city) => {
        const group = svg.append('g')
            .attr('class', 'box-group')
            .on('mouseover', function() {
                updateStatsDisplay(city, stats);
                d3.select(this).selectAll('rect').attr('opacity', 1);
            })
            .on('mouseout', function() {
                d3.select(this).selectAll('rect').attr('opacity', 0.8);
            });

        // Box
        group.append('rect')
            .attr('x', x(city))
            .attr('y', y(stats.q3))
            .attr('width', x.bandwidth())
            .attr('height', y(stats.q1) - y(stats.q3))
            .attr('fill', '#69b3a2')
            .attr('opacity', 0.8);

        // Median line
        group.append('line')
            .attr('x1', x(city))
            .attr('x2', x(city) + x.bandwidth())
            .attr('y1', y(stats.median))
            .attr('y2', y(stats.median))
            .attr('stroke', 'black')
            .attr('stroke-width', 2);

        // Whiskers
        group.append('line')
            .attr('x1', x(city) + x.bandwidth()/2)
            .attr('x2', x(city) + x.bandwidth()/2)
            .attr('y1', y(stats.min))
            .attr('y2', y(stats.q1))
            .attr('stroke', 'black');

        group.append('line')
            .attr('x1', x(city) + x.bandwidth()/2)
            .attr('x2', x(city) + x.bandwidth()/2)
            .attr('y1', y(stats.q3))
            .attr('y2', y(stats.max))
            .attr('stroke', 'black');

        // Whisker ends
        group.append('line')
            .attr('x1', x(city) - x.bandwidth()/4)
            .attr('x2', x(city) + x.bandwidth()/4 + x.bandwidth())
            .attr('y1', y(stats.min))
            .attr('y2', y(stats.min))
            .attr('stroke', 'black');

        group.append('line')
            .attr('x1', x(city) - x.bandwidth()/4)
            .attr('x2', x(city) + x.bandwidth()/4 + x.bandwidth())
            .attr('y1', y(stats.max))
            .attr('y2', y(stats.max))
            .attr('stroke', 'black');
    });

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '12px');

    svg.append('g')
        .call(d3.axisLeft(y)
            .tickFormat(d => `€${d}`)
            .ticks(5))
        .style('font-size', '12px');

    // Stats box title
    statsDiv.append('h3')
        .style('margin', '0 0 10px 0')
        .style('font-size', '14px')
        .style('color', '#333')
        .text('Price Statistics');

    // Stats content container
    const statsContent = statsDiv.append('div')
        .attr('class', 'stats-content')
        .style('font-size', '13px')
        .style('line-height', '1.4');

    // Show initial stats
    const initialCity = state.selectedCity || 'berlin';
    const initialStats = pricesByCity.get(initialCity);
    updateStatsDisplay(initialCity, initialStats);

    function updateStatsDisplay(city, stats) {
        statsContent.html(`
            <div style="margin-bottom: 15px">
                <strong style="font-size: 16px; color: #2c3e50">
                    ${city.charAt(0).toUpperCase() + city.slice(1)}
                </strong>
                <br>
                <span style="color: #666">Number of listings: ${stats.count}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #dee2e6">
                    <td style="padding: 4px 0">Maximum:</td>
                    <td style="text-align: right">€${stats.max.toFixed(0)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6">
                    <td style="padding: 4px 0">Q3:</td>
                    <td style="text-align: right">€${stats.q3.toFixed(0)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6; background-color: #e9ecef">
                    <td style="padding: 4px 0"><strong>Median:</strong></td>
                    <td style="text-align: right"><strong>€${stats.median.toFixed(0)}</strong></td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6">
                    <td style="padding: 4px 0">Q1:</td>
                    <td style="text-align: right">€${stats.q1.toFixed(0)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6">
                    <td style="padding: 4px 0">Minimum:</td>
                    <td style="text-align: right">€${stats.min.toFixed(0)}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0">Mean:</td>
                    <td style="text-align: right">€${stats.mean.toFixed(0)}</td>
                </tr>
            </table>
        `);
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            createPriceVisualization(data);
        }, 250);
    });
}

function updatePriceVisualization(data) {
    createPriceVisualization(data);
}