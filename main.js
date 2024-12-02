// Set up dimensions and margins
const width = 1000; // Increased width for more space
const height = 500;
const margin = { top: 50, right: 200, bottom: 50, left: 60 }; // Adjusted right margin for the legend

// Create an SVG container
const svg = d3.select("#player-bar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#f9f9f9")
    .style("border", "1px solid #ccc");

// Load the dataset
d3.csv("celtics_2024_shots.csv").then(data => {
    console.log("Loaded Data:", data);

    // Convert SHOT_DISTANCE to a number
    data.forEach(d => {
        d.SHOT_DISTANCE = +d.SHOT_DISTANCE;
    });

    // Define the bins with more granularity (20 bins)
    const histogram = d3.histogram()
        .value(d => d.SHOT_DISTANCE) // Use shot distance
        .domain([0, d3.max(data, d => d.SHOT_DISTANCE)]) // Define the range of the histogram
        .thresholds(20); // Increase the number of bins

    const bins = histogram(data);

    console.log("Histogram Bins:", bins);

    // Define scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.SHOT_DISTANCE)]) // Input domain
        .range([margin.left, width - margin.right]); // Output range

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)]) // Input domain
        .range([height - margin.bottom, margin.top]); // Output range

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d => `${Math.round(d)} ft`))
        .attr("font-size", "12px")
        .append("text")
        .attr("x", (width - margin.right) / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Shot Distance (feet)");

    // Add Y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).ticks(10))
        .attr("font-size", "12px")
        .append("text")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "14px")
        .text("Number of Shots");

    // Add Title
    svg.append("text")
        .attr("x", (width - margin.right) / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Celtics Shot Distances");

    // Add bars with color coding
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.x0)) // Start of the bin
        .attr("y", d => yScale(d.length)) // Height based on count
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1) // Bin width
        .attr("height", d => height - margin.bottom - yScale(d.length)) // Bar height
        .attr("fill", d => {
            if (d.x0 <= 10) return "#69b3a2"; // Green for short-range
            else if (d.x0 <= 30) return "#ffd700"; // Yellow for mid-range
            else return "#ff6347"; // Red for long-range
        });

    // Add bar labels
    svg.selectAll(".label")
        .data(bins)
        .enter()
        .append("text")
        .attr("x", d => (xScale(d.x0) + xScale(d.x1)) / 2) // Center of the bar
        .attr("y", d => yScale(d.length) - 5) // Just above the bar
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "black")
        .text(d => d.length > 0 ? d.length : ""); // Only label bins with non-zero values

    // Add a legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    // Legend data
    const legendData = [
        { label: "0–10 ft (Short-range)", color: "#69b3a2" },
        { label: "10–30 ft (Mid-range)", color: "#ffd700" },
        { label: "30+ ft (Long-range)", color: "#ff6347" }
    ];

    // Add legend rectangles
    legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 25)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => d.color);

    // Add legend labels
    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 30)
        .attr("y", (d, i) => i * 25 + 15)
        .text(d => d.label)
        .attr("font-size", "12px")
        .attr("fill", "black");

    // Add a legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Shot Ranges");
}).catch(error => {
    console.error("Error loading the dataset:", error);
});
