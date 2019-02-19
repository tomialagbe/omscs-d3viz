let margin = {
    top: 100, bottom: 200, left: 100, right: 100
};

let outerWidth = 800;
let outerHeight = 600;
let width = outerWidth - margin.left - margin.right;
let height = outerHeight - margin.top - margin.bottom;

var colors = [ "#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026" ];

let svg = d3
    .select("body")
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var yAxisValues = [];
var xAxisValues = [];
var currentYear = 2011;
var gridSize;

// var xScale = d3.scaleOrdinal().range([0, width]);
// var yScale = d3.scaleOrdinal().range([0, height]);
var xScale = d3.scaleBand().range([0, width]).padding(0.1);
var yScale = d3.scaleBand().range([0, height]).padding(0.1);
var colorScale = d3.scaleLinear().range(colors);

d3.csv("heatmap.csv", function(d){
    return {
        Year: +d.Year,
        Bronx: +d.Bronx,
        Brooklyn: +d.Brooklyn,
        Manhattan: +d.Manhattan,
        Queens: +d.Queens,
        StatenIsland: +d['Staten Island'],
        CrimeType: d['Crime Type'],
    };
    return d;
}).then(function(data) {
    console.log(data);
    yAxisValues = data.columns;
    yAxisValues.splice(yAxisValues.indexOf("Crime Type"), 1);
    yAxisValues.splice(yAxisValues.indexOf("Year"), 1);
    var crimeTypeSet = new Set();
    data.forEach(function(item){
        crimeTypeSet.add(item.CrimeType);        
    });
    xAxisValues = [...crimeTypeSet];

    xScale.domain(xAxisValues);
    yScale.domain(yAxisValues);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
    .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    svg.append("g").call(d3.axisLeft(yScale));

    var yearData = data.filter(function(item){ return item.Year == 2011; });
    console.log("Year Data:");
    console.log(yearData);

    // add the squares
    // svg.selectAll()
    // .data(yearData)
    // .enter()
    // .append("rect")
    //   .attr("x", function(d) { 
    //     //   xScale()
    //    })
    //   .attr("y", function(d) { return y(d.variable) })
    //   .attr("width", x.bandwidth() )
    //   .attr("height", y.bandwidth() )
    //   .style("fill", function(d) { return myColor(d.value)} )
    // .on("mouseover", mouseover)
    // .on("mousemove", mousemove)
    // .on("mouseleave", mouseleave);

    /*
    console.log(data);
    

    gridSize =  Math.min(width / xAxisValues.length, height / yAxisValues.length);

    xScale.domain([xAxisValues]);
    yScale.domain([yAxisValues]);
    colorScale.domain([0, d3.max(data, function(d){ return Math.max(d.Bronx, d.Brooklyn, d.Manhattan, d.Queens, d.StatenIsland); })]);

    var xLabelGroup = svg.append("g");
        // .attr("transform", "translate(0, " + (height + margin.top) + ")");
    var crimeTypeLabels = xLabelGroup.selectAll(".xLabel")
        .data(xAxisValues)
        .enter()
        .append("text")
        .attr("class", "xLabel")
        .text(function(d) { return d; })
        .attr("x", function(d, idx){ return (idx * gridSize); })
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("transform", function(d, idx){
            var xval = idx * gridSize;
            var yVal = 0;
            // .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            return "translate(" + gridSize / 2 + ", -30) rotate(-90, " + xval + ", " + yVal + ")";
        });
        
    var boroughLabels = svg.selectAll(".yLabel")
        .data(yAxisValues)
        .enter()
        .append("text")
        .attr("class", "yLabel")
        .text(function(d){ return d; })
        .attr("x", 0)
        .attr("y", function(d, idx){ return idx*gridSize; })
        .attr("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")");
    
    var yearData = data.filter(function(item){ return item.Year == 2011; });
    console.log("Year Data:");
    console.log(yearData);

    svg.selectAll(".grid")
        .data(yearData)
        .enter()
        .append("rect")
        .attr("x", function(d, idx) {
            var xIdx = idx % xAxisValues.length;        
            return idx * gridSize;
        })
        .attr("y", function(d, idx) { 
            var yIdx = idx % yAxisValues.length;            
            return yIdx * gridSize;
        })
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke", "white")
        .style("fill", function(d, idx) { 
            let xval = xAxisValues[idx];
            let yVal = yAxisValues[idx];
            // let val = d[]
            return colorScale(d);
         });
         */
});