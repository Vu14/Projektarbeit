/**
 * Price Visualization Component
 * Features:
 * - Box plot showing price distribution
 * - Price comparison between cities
 * - Interactive elements and transitions
 */

function createPriceVisualization(data) {
    // Clear existing content
    const container = d3.select("#priceViz");
    container.html("").classed("loading", false);

    // Set up dimensions
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add title
    container.append("div")
        .attr("class", "viz-controls")
        .html(`
            <select id="priceViewType">
                <option value="boxplot">Box Plot</option>
                <option value="histogram">Histogram</option>
            </select>
        `);

    // Initialize the visualization
    createBoxPlot(svg, data, width, height);

    // Add event listener for view type change
    d3.select("#priceViewType").on("change", function() {
        const viewType = this.value;
        svg.selectAll("*").remove(); // Clear current visualization
        
        if (viewType === "boxplot") {
            createBoxPlot(svg, data, width, height);
        } else {
            createHistogram(svg, data, width, height);
        }
    });
}

function createBoxPlot(svg, data, width, height) {
    // Process data for box plot
    const cityData = d3.group(data, d => d.city);
    const boxPlotData = Array.from(cityData, ([city, values]) => {
        const sorted = values.map(d => d.realSum).sort(d3.ascending);
        return {
            city: city,
            q1: d3.quantile(sorted, 0.25),
            median: d3.quantile(sorted, 0.5),
            q3: d3.quantile(sorted, 0.75),
            iqr: d3.quantile(sorted, 0.75) - d3.quantile(sorted, 0.25),
            min: d3.min(sorted),
            max: d3.max(sorted)
        };
    });

    // Scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain(boxPlotData.map(d => d.city))
        .padding(0.2);

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(boxPlotData, d => d.max)])
        .nice();

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add axis labels
    svg.append("text")
        .attr("transform", `translate(${width/2},${height + 50})`)
        .style("text-anchor", "middle")
        .text("Cities");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -(height/2))
        .style("text-anchor", "middle")
        .text("Price (€)");

    // Create box plots
    const boxWidth = x.bandwidth();
    
    // Add boxes
    const boxes = svg.selectAll("boxes")
        .data(boxPlotData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.city)},0)`);

    // Draw the main box
    boxes.append("rect")
        .attr("x", 0)
        .attr("y", d => y(d.q3))
        .attr("height", d => y(d.q1) - y(d.q3))
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .attr("fill", "#69b3a2")
        .style("opacity", 0.8);

    // Add median line
    boxes.append("line")
        .attr("x1", 0)
        .attr("x2", boxWidth)
        .attr("y1", d => y(d.median))
        .attr("y2", d => y(d.median))
        .attr("stroke", "black")
        .style("stroke-width", "2px");

    // Add whiskers
    boxes.append("line")
        .attr("x1", boxWidth/2)
        .attr("x2", boxWidth/2)
        .attr("y1", d => y(d.min))
        .attr("y2", d => y(d.q1))
        .attr("stroke", "black");

    boxes.append("line")
        .attr("x1", boxWidth/2)
        .attr("x2", boxWidth/2)
        .attr("y1", d => y(d.max))
        .attr("y2", d => y(d.q3))
        .attr("stroke", "black");

    // Add whisker caps
    boxes.append("line")
        .attr("x1", boxWidth*0.25)
        .attr("x2", boxWidth*0.75)
        .attr("y1", d => y(d.min))
        .attr("y2", d => y(d.min))
        .attr("stroke", "black");

    boxes.append("line")
        .attr("x1", boxWidth*0.25)
        .attr("x2", boxWidth*0.75)
        .attr("y1", d => y(d.max))
        .attr("y2", d => y(d.max))
        .attr("stroke", "black");
}

function createHistogram(svg, data, width, height) {
    // Dynamisch Min und Max Preis ermitteln
    const minPrice = d3.min(data, d => d.realSum);
    const maxPrice = d3.max(data, d => d.realSum);
    
    // Anzahl der Bins basierend auf der Datenmenge anpassen
    const binCount = Math.floor(Math.sqrt(data.length)); // Wurzel-N Regel für Bins
    
    // Create histogram bins
    const histogram = d3.histogram()
        .value(d => d.realSum)
        .domain([minPrice, maxPrice])
        .thresholds(binCount);

    const bins = histogram(data);

    // Scales mit dynamischem Domain
    const x = d3.scaleLinear()
        .domain([minPrice, maxPrice])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice() // Rundet die Domain auf "schöne" Werte
        .range([height, 0]);

    // Add axes with formatted ticks
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(10)
            .tickFormat(d => `${d}€`));

    svg.append("g")
        .call(d3.axisLeft(y)
            .ticks(10));

    // Add axis labels
    svg.append("text")
        .attr("transform", `translate(${width/2},${height + 40})`)
        .style("text-anchor", "middle")
        .text("Price (€)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -(height/2))
        .style("text-anchor", "middle")
        .text("Number of Listings");

    // Tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add bars with interaction
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1)) // -1 für Abstand zwischen Bars
        .attr("height", d => height - y(d.length))
        .style("fill", "#69b3a2")
        .style("opacity", 0.8)
        // Interaktive Features
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1);
            
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
                
            tooltip.html(`Price Range: ${d.x0.toFixed(0)}€ - ${d.x1.toFixed(0)}€<br/>
                         Count: ${d.length} listings`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.8);
                
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add mean line
    const meanPrice = d3.mean(data, d => d.realSum);
    svg.append("line")
        .attr("x1", x(meanPrice))
        .attr("x2", x(meanPrice))
        .attr("y1", height)
        .attr("y2", 0)
        .style("stroke", "red")
        .style("stroke-dasharray", "4")
        .style("stroke-width", 2);

    // Add mean label
    svg.append("text")
        .attr("x", x(meanPrice))
        .attr("y", 0)
        .attr("dy", -5)
        .attr("text-anchor", "middle")
        .style("fill", "red")
        .text(`Mean: ${meanPrice.toFixed(0)}€`);

    // Füge Statistik-Box hinzu
    const stats = svg.append("g")
        .attr("class", "stats")
        .attr("transform", `translate(${width - 160}, 20)`);

    stats.append("rect")
        .attr("width", 150)
        .attr("height", 80)
        .attr("fill", "white")
        .attr("stroke", "#ccc");

    stats.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .text(`Min: ${minPrice.toFixed(0)}€`);

    stats.append("text")
        .attr("x", 10)
        .attr("y", 40)
        .text(`Max: ${maxPrice.toFixed(0)}€`);

    stats.append("text")
        .attr("x", 10)
        .attr("y", 60)
        .text(`Median: ${d3.median(data, d => d.realSum).toFixed(0)}€`);
}

function updatePriceVisualization(data) {
    // Get current view type
    const viewType = d3.select("#priceViewType").node().value;
    
    // Clear and recreate visualization
    const container = d3.select("#priceViz");
    const svg = container.select("svg g");
    svg.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width - 160; // margins
    const height = 400 - 100; // margins

    if (viewType === "boxplot") {
        createBoxPlot(svg, data, width, height);
    } else {
        createHistogram(svg, data, width, height);
    }
}