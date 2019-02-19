var data = [
    {
        country: 'Bangladesh', 
        population_2012: 105905297, 
        growth: {year_2013:42488, year_2014:934, year_2015:52633, year_2016:112822, year_2017:160792}
    },
    {
        country: 'Ethopia', 
        population_2012: 75656319, 
        growth: {year_2013:1606010 , year_2014:1606705 , year_2015:1600666 , year_2016:1590077 , year_2017:1580805}
    },
    {
        country: 'Kenya', 
        population_2012: 33007327, 
        growth: {year_2013:705153 , year_2014:703994 , year_2015:699906 , year_2016:694295 , year_2017:687910}
    },
    {
        country: 'Afghanistan', 
        population_2012: 23280573, 
        growth: {year_2013:717151 , year_2014:706082 , year_2015:665025 , year_2016:616262 , year_2017:573643}
    }, 
    {
        country: 'Morocco', 
        population_2012: 13619520, 
        growth: {year_2013:11862 , year_2014:7997 , year_2015:391 , year_2016:-8820 , year_2017:-17029}
    }
];

let margin = {
    top: 100, bottom: 50, left: 50, right: 50
};

let outerWidth = 650;
let outerHeight = 400;
let width = outerWidth - margin.left - margin.right;
let height = outerHeight - margin.top - margin.bottom;

let countryNames = [];

data.forEach(function(item) {
    countryNames.push(item.country);

    let start = item.population_2012;
    let growth_years = Object.keys(item.growth);
    let cummulative = start;
    for (var i = 0; i < growth_years.length; i++) {
        cummulative += item.growth[growth_years[i]];
    }
    item.cummulative = cummulative;    
});
console.log(data);
console.log(countryNames);

let barColor = "#888888";
let barHoverColor = "#FF6A70";

let svg = d3
    .select("body")
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

let xScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d){ return d.cummulative; })])
    .range([0, width]);

let yScale = d3.scaleBand()
    .domain(countryNames)
    .range([0, height])
    .paddingInner(0.4);

let valueLabelFormat = d3.format(",.2r");

let labelGroup = svg.append("g")
    .attr("class", "labels")
    .attr("width", 200);
// draw y axis labels
labelGroup.selectAll(".yLabel")
    .data(data)
    .enter()
    .append("text")
        .attr("class", "yLabel")
        .attr("x", margin.left)        
        .attr("y", function(d){
            return yScale(d.country);
        })
        .text(function(d){
            return d.country;
        });

let barGroup = svg.append("g").attr("class", "bars");
// draw bars
barGroup.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
        .attr("class", "bar")
        .attr("x", margin.left+10)
        .attr("y", function(d) {
            return yScale(d.country) - 17;
        })
        .attr("fill", barColor)
        .attr("width", function(d) {
            return xScale(d.cummulative);
        })
        .attr("height", function(d) {
            return yScale.bandwidth();
        })
    .on("mouseover", handleMouseover)
    .on("mouseout", handleMouseout)
    .on("click", handleClick);

    // draw bar labels
barGroup.selectAll(".barLabels")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "barLabel")
    .attr("x", margin.left + 15)
    .attr("y", function(d) {
        return yScale(d.country) + 5;
    })
    .text(function(d) {
        return valueLabelFormat(d.cummulative);
    });

function handleMouseover(data, index) {    
    d3.select(this).transition()
        .attr("fill", barHoverColor);
    showPopulationGrowth(data);
}

function handleMouseout(data, index) {    
    d3.select(this).transition()
        .attr("fill", barColor);
    hidePopulationGrowth();
}

function handleClick(data, idx) {
    // console.log("CLICKED: " + data+ ":" + idx);
    // console.log(data);
    // console.log(idx);
    // showPopulationGrowth(data);
}

function hidePopulationGrowth() {
    d3.selectAll(".populationGrowth")        
        .remove();
}

function showPopulationGrowth(growthData) {
    hidePopulationGrowth();
    let margin = {left: 60, right: 10, top: 10, bottom: 40};
    let infoWidth = 350 - margin.left - margin.right;
    let infoHeight = 300 - margin.top - margin.bottom;

    let countryInfoContainer = d3.select("body")        
        .append("svg")
        .attr("class", "populationGrowth")
        .attr("id", growthData.country)
        .attr("width", infoWidth + margin.left + margin.right)
        .attr("height", infoHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let initialPopulation = growthData.population_2012;
    let years = [];
    let yearGrowth = [];
    Object.keys(growthData.growth).forEach(function(key){        
        let yearStr = key.split("_")[1];
        years.push(+yearStr);

        var pctGrowth = (growthData.growth[key] / initialPopulation) * 100;
        
        yearGrowth.push([+yearStr, pctGrowth]);
    });
    console.log("YEARS")    
    console.log(years);
    console.log();

    console.log("YEAR GROWTH")
    console.log(yearGrowth)

    let xScale = d3.scaleBand().domain(years).range([0, infoWidth]);
    let yScale = d3.scaleLinear().domain([d3.max(yearGrowth, function(d){
        return d[1];
    }), d3.min(yearGrowth, function(d){
        return d[1];
    })])
    .range([0, infoHeight]);

    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);

    // draw axes 
    countryInfoContainer.append("g")
        .attr("transform", "translate(0," + (infoHeight) + ")")
        .call(d3.axisBottom(xScale));

    countryInfoContainer.append("g")
        .call(yAxis);
    
    // draw line chart
    let lineGenerator = d3.line()
        .x(function(d){
            return xScale(d[0]);
        })
        .y(function(d) {
            return yScale(d[1]);
        });

    countryInfoContainer.append("path")
        .attr("d", lineGenerator(yearGrowth))
        .attr("stroke", barHoverColor)
        .attr("stroke-width", 2)
        .attr("fill", "none");

    countryInfoContainer.append("text") 
        .attr("class", "axisLabel")
        .attr("x", infoWidth / 2)
        .attr("y", infoHeight + margin.bottom)
        .style("text-anchor", "middle")
        .text("Date");

    countryInfoContainer.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", (0 - margin.left))
        .attr("x", 0 - (infoHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("% Growth");

}