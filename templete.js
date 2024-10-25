// Load the Iris dataset
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // ----------------------------
    // Part 2.1: Scatter Plot
    // ----------------------------

    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const marginScatter = {top: 50, right: 150, bottom: 50, left: 50},
          widthScatter = 600 - marginScatter.left - marginScatter.right,
          heightScatter = 400 - marginScatter.top - marginScatter.bottom;

    // Create the SVG container for Scatter Plot
    const svgScatter = d3.select("#scatterplot")
        .append("svg")
        .attr("width", widthScatter + marginScatter.left + marginScatter.right)
        .attr("height", heightScatter + marginScatter.top + marginScatter.bottom)
      .append("g")
        .attr("transform", `translate(${marginScatter.left},${marginScatter.top})`);

    // Set up scales for x and y axes
    const xScaleScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([0, widthScatter]);

    const yScaleScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([heightScatter, 0]);

    const colorScaleScatter = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Species))])
        .range(d3.schemeCategory10);

    // Add x and y axes to the Scatter Plot
    svgScatter.append("g")
        .attr("transform", `translate(0,${heightScatter})`)
        .call(d3.axisBottom(xScaleScatter));

    svgScatter.append("g")
        .call(d3.axisLeft(yScaleScatter));

    // Add circles for each data point
    svgScatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScaleScatter(d.PetalLength))
        .attr("cy", d => yScaleScatter(d.PetalWidth))
        .attr("r", 5)
        .attr("fill", d => colorScaleScatter(d.Species));

    // Add x-axis label
    svgScatter.append("text")
        .attr("text-anchor", "end")
        .attr("x", widthScatter / 2)
        .attr("y", heightScatter + marginScatter.bottom - 10)
        .text("Petal Length");

    // Add y-axis label
    svgScatter.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -marginScatter.left + 15)
        .attr("x", -heightScatter / 2)
        .text("Petal Width");

    // Add legend
    const legend = svgScatter.selectAll(".legend")
        .data(colorScaleScatter.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${widthScatter + 20},${i * 20})`);

    // Add colored circles to legend
    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", d => colorScaleScatter(d));

    // Add text labels to legend
    legend.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .text(d => d);

    // ----------------------------
    // Part 2.2: Side-by-side Boxplot
    // ----------------------------

    // Only Petal Length is needed for the boxplot
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
    });

    // Define the dimensions and margins for the SVG
    const marginBox = {top: 50, right: 50, bottom: 50, left: 50},
          widthBox = 600 - marginBox.left - marginBox.right,
          heightBox = 400 - marginBox.top - marginBox.bottom;

    // Create the SVG container for Boxplot
    const svgBox = d3.select("#boxplot")
        .append("svg")
        .attr("width", widthBox + marginBox.left + marginBox.right)
        .attr("height", heightBox + marginBox.top + marginBox.bottom)
      .append("g")
        .attr("transform", `translate(${marginBox.left},${marginBox.top})`);

    // Set up scales for x and y axes
    const species = [...new Set(data.map(d => d.Species))];
    const xScaleBox = d3.scaleBand()
        .domain(species)
        .range([0, widthBox])
        .padding(0.4);

    const yScaleBox = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([heightBox, 0]);

    // Add x and y axes to the Boxplot
    svgBox.append("g")
        .attr("transform", `translate(0,${heightBox})`)
        .call(d3.axisBottom(xScaleBox));

    svgBox.append("g")
        .call(d3.axisLeft(yScaleBox));

    // Add x-axis label
    svgBox.append("text")
        .attr("text-anchor", "end")
        .attr("x", widthBox / 2)
        .attr("y", heightBox + marginBox.bottom - 10)
        .text("Species");

    // Add y-axis label
    svgBox.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -marginBox.left + 15)
        .attr("x", -heightBox / 2)
        .text("Petal Length");

    // Define the rollup function to compute quartiles and other statistics
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const interQuantileRange = q3 - q1;
        const lowerFence = q1 - 1.5 * interQuantileRange;
        const upperFence = q3 + 1.5 * interQuantileRange;
        // Filtering out outliers
        const filteredValues = values.filter(v => v >= lowerFence && v <= upperFence);
        const min = d3.min(filteredValues);
        const max = d3.max(filteredValues);
        return { q1, median, q3, min, max };
    };

    // Calculate quartiles by species
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    /*
    Explanation of the following two lines:

    1. `d3.rollup(data, rollupFunction, d => d.Species);`
       - This line groups the data by the `Species` attribute and applies the `rollupFunction` to each group.
       - The result is a Map where each key is a species, and each value is an object containing q1, median, q3, min, and max for that species.

    2. `quartilesBySpecies.forEach((quartiles, Species) => { ... });`
       - This line iterates over each species and its corresponding quartiles.
       - For each species, it calculates the x position using the xScale and determines the width of the boxplot based on the bandwidth of the xScale.
    */
    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScaleBox(Species);
        const boxWidth = xScaleBox.bandwidth();

        // Draw vertical lines (whiskers) from min to max
        svgBox.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScaleBox(quartiles.min))
            .attr("y2", yScaleBox(quartiles.max))
            .attr("stroke", "black");

        // Draw the box from q1 to q3
        svgBox.append("rect")
            .attr("x", x)
            .attr("y", yScaleBox(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScaleBox(quartiles.q1) - yScaleBox(quartiles.q3))
            .attr("fill", "#69b3a2")
            .attr("stroke", "black");

        // Draw the median line
        svgBox.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScaleBox(quartiles.median))
            .attr("y2", yScaleBox(quartiles.median))
            .attr("stroke", "black");
    });
});