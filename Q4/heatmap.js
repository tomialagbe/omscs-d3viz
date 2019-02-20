let margin = {
    top: 10, bottom: 200, left: 100, right: 150
};

// var colors = [ "#7486D3", "#5F74CC", "#4A61C4", "#3C53B6", "#364AA0", "#2F418A", "#283774", "#212D5F", "#1A234A" ];
var colors = d3.schemePurples[9];

var yAxisValues = [];
let yAxisKeys = null;
var xAxisValues = [];
var years = [];
var initialYear = 2015;
var gridSize = 70;
let spreadData = [];
let legendValues = []

let padding = 0.01;

var xScale = d3.scaleBand().padding(padding);
var yAxisScale = d3.scaleBand().padding(padding);
var yPosScale = d3.scaleBand().padding(padding);
let legendScale = d3.scaleLinear().range(colors);

var svg = null;

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
    var yearSet = new Set();
    
    data.forEach(function(item) {            
        var crimeType = item.CrimeType;
        var year = item.Year;

        crimeTypeSet.add(crimeType);
        yearSet.add(year);

        var boroughs = Object.keys(item);
        boroughs.splice(boroughs.indexOf("CrimeType"), 1);
        boroughs.splice(boroughs.indexOf("Year"), 1);
        if (yAxisKeys == null) {
            yAxisKeys = boroughs;
        }

        for (var i = 0; i < boroughs.length; i++) {
            var borough = boroughs[i];
            var rate = item[borough];
            spreadData.push({
                Year: year, CrimeType: crimeType, Borough: boroughs[i], CrimeRate: rate,
            });
        }
    });
    xAxisValues = [...crimeTypeSet];
    years = [...yearSet];
    
    xScale.range([0, gridSize * xAxisValues.length]);
    yAxisScale.range([0, gridSize * yAxisValues.length]);
    yPosScale.range([0, gridSize * yAxisKeys.length]);    

    console.log("SPREAD DATA");
    console.log(spreadData);
    console.log();
    console.log("Y AXIS KEYS");
    console.log(yAxisKeys);

    xScale.domain(xAxisValues);
    yAxisScale.domain(yAxisValues);
    yPosScale.domain(yAxisKeys);
    let minVal = d3.min(spreadData, function(d){ return d.CrimeRate; });
    let maxVal = d3.max(spreadData, function(d) { return d.CrimeRate; });    
    
    // we want to generate 9 items
    var x = Math.floor((maxVal-minVal) / 9);
    console.log("X IS: " + x);
    for (var i = 0; i < x; i++) {
        var y = x * (i+1);
        if (y > maxVal) break;
        legendValues.push(y);
    }
    
    console.log("LEGEND VALUES: ", legendValues);
    legendScale.domain(legendValues);

    // draw drop down
    let select = d3.select("body")
        .insert("select", "svg")
        .attr("class", "select")
        .on("change", function(){
            let val = d3.select(this).property("value");
            console.log("SELECT CHANGED. D: " + val);
            // currentYear = val;
            updateHeatMap(val);
        });

    select.selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .text(function(d) { return d; })
        .attr("value", function(d) { return d;});

    d3.select("body").append("br");

    // draw svg
    svg = d3
        .select("body")
        .append("svg")
        .attr("width", (gridSize * xAxisValues.length) + margin.left + margin.right)
        .attr("height", (gridSize * yAxisValues.length) + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // draw axis labels
    svg
        .append("text")
        .text("Boroughs")
        .attr("class", "axisLabel")
        .attr("x", -5)
        .attr("y", margin.top)
        .attr("text-anchor", "end");

    svg.append("text")
        .text("Crime Type")
        .attr("class", "axisLabel")
        .attr("x", gridSize * xAxisValues.length + 10)
        .attr("y", gridSize * yAxisValues.length + 30)
        .attr("text-anchor", "start");

    // draw axes
    svg.append("g")
        .attr("transform", "translate(0," + (gridSize * yAxisValues.length + 10) + ")")
        .call(d3.axisBottom(xScale))
    .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    svg.append("g").call(d3.axisLeft(yAxisScale));

    var yearData = spreadData.filter(function(item){ return item.Year == initialYear; });
    console.log("Year Data:");
    console.log(yearData);

    // add the squares    
    let xLength = xAxisValues.length;
    let yLength = yAxisValues.length;
    let g = svg.append("g");
    g.selectAll(".rect")
    .data(yearData)
    .enter()
    .append("rect") 
        .attr("class", "rect")
        .attr("x", function(d, idx) {
            var crimeType = d.CrimeType;
            var xIdx = xScale(crimeType);
            return xIdx;
        })
        .attr("y", function(d, idx) {
            var borough = d.Borough;
            var yIdx = yPosScale(borough);
            return yIdx;
        })
        .attr("width", xScale.bandwidth())
        .attr("height", yAxisScale.bandwidth())
        .attr("fill", function(d) {             
            var color = legendScale(d.CrimeRate);
            console.log("YEAR: " + d.Year + "\nCRIME TYPE: " + d.CrimeType + "\nBOROUGH: " + d.Borough + "\nCRIME RATE: " + d.CrimeRate + "\nCOLOR: " + color);
            return color;
        })
        .attr("rx", 2)
        .attr("ry", 2)
        
    // g.selectAll(".rectText")
    // .data(yearData)
    // .enter()
    // .append("text")             
    //     .attr("class", "rectText")
    //     .attr("x", function(d, idx) {
    //         var crimeType = d.CrimeType;
    //         var xIdx = xScale(crimeType);
    //         return xIdx + xScale.bandwidth()/2;
    //     })
    //     .attr("y", function(d, idx) {
    //         var borough = d.Borough;
    //         var yIdx = yPosScale(borough);
    //         return yIdx + yAxisScale.bandwidth() / 2;
    //     })
    //     .text(function(d) {
    //         return d.CrimeRate;
    //     });
    
    
    // draw the scale
    let legendItemWidth = 50;
    let legendItemHeight = 30;
    svg.append("text")
        .attr("x", 0)
        .attr("y", gridSize * yLength + 95)
        .attr("class", "legendTitle")
        .attr("text-anchor", "start")
        .text("No. of Crimes");
    let legend = svg.append("g").attr("class", "legendRect");
    legend.selectAll(".legendRect")
        .data(colors)
        .enter()
        .append("rect")        
        .attr("x", function(d, i) {
            return i * legendItemWidth;
        })
        .attr("y", gridSize * yLength + 100)
        .attr("fill", function(d) {
            return d;
        })
        .attr("width", legendItemWidth)
        .attr("height", legendItemHeight);

    legend.selectAll("text")
        .data(legendValues)
        .enter()
        .append("text")
        .text(function(d) {
            return d;
        })      
        .attr("text-anchor", "end")  
        .attr("x", function(d, i) {
            return i * legendItemWidth + 10;
        })
        .attr("y", gridSize * yLength + 115 + legendItemHeight);        
    
});

function updateHeatMap(currentYear) {
    var yearData = spreadData.filter(function(item){ return item.Year == currentYear; });
    console.log("Year Data:");
    console.log(yearData);

    svg.selectAll(".rect")
    .data(yearData)
    .transition()
    .duration(500)
    .attr("fill", function(d) {             
        var color = legendScale(d.CrimeRate);
        console.log("YEAR: " + d.Year + "\nCRIME TYPE: " + d.CrimeType + "\nBOROUGH: " + d.Borough + "\nCRIME RATE: " + d.CrimeRate + "\nCOLOR: " + color);
        return color;
    })

    // svg.selectAll(".rectText")
    // .data(yearData)
    // .transition()
    // .text(function(d) {
    //     return d.CrimeRate;
    // });
}