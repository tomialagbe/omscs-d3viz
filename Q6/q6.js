let width = 1200;
let height = 900;
let topPadding = 60;
let svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geoPath();    
    
var promises = [
    d3.json("us.json"),
    d3.csv("county_poverty.csv"),
    d3.csv("county_detail.csv"),    
];

Promise.all(promises).then(loaded);

function loaded(values) {
    let geoData = values[0];
    console.log(geoData);
    
    let countyDataMap = new Map();
    values[1].forEach(function(val) {
        let county = {
            CensusId: val.CensusId,
            State: val.State,
            County: val.County,
            Poverty: parseFloat(val.Poverty),
        };
        countyDataMap.set(val.CensusId, county);        
    });

    values[2].forEach(function(val) {
        let county = countyDataMap.get(val.CensusId);
        if (county != null) {
            county.IncomePerCap = val.IncomePerCap;
            county.TotalPop = val.TotalPop;
        }
        countyDataMap.set(val.CensusId, county);
    });

    console.log("DATA LEN " + countyDataMap.size)
    let countyDataList = [];
    countyDataMap.forEach(function(value, key){        
        countyDataList.push(value);
    });
    
    console.log(countyDataList);

    let colorDomain = d3.range(d3.min(countyDataList, function(d) { return Math.round(d.Poverty); }), 
            d3.max(countyDataList, function(d) { return Math.round(d.Poverty); }));
    let colorScale = d3.scaleThreshold().domain(colorDomain).range(d3.schemeOranges[9]);

    let legendLabels = ["≤ 1%", "2%", "3%", "4%", "5%", "6%", "7%", "8%", "> 9%"];
    let legendData = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    let legendStartX = 1050;
    let legend = svg.append("g")        
        .attr("transform", "translate(0, " + topPadding + ")");

    legend.append("text")
        .attr("class", "legendTitle")
        .attr("x", legendStartX)        
        .attr("y", topPadding)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Poverty Rate");

    var legendItemSize = 20;
    legend
        .selectAll("g")
        .data(legendData)
        .enter()
        .append("g")
            .attr("class", "legend")
        .append("rect")
            .attr("x", legendStartX - (legendItemSize/2))            
            .attr("y", function(d, i) {                 
                let v = topPadding + 20 + (i * legendItemSize);// + (i == 0 ? 0 : 20);
                return v;
            })
            .attr("width", legendItemSize)
            .attr("height", legendItemSize)
            .style("fill", function(d, i) {                 
                return colorScale(d); 
            })
            .style("opacity", 0.8);

    legend
        .selectAll("text")
        .data(legendLabels)
        .enter()
        .append("text")
        .attr("class", "legendItemLabel")
        .attr("x", legendStartX + (legendItemSize/2) + 5)
        .attr("y", function(d, i){ return topPadding + 30 + (i * legendItemSize);})
        .text(function(d, i){ 
            console.log("LEGEND I: " + i + " = " + d);
            return legendLabels[i]; 
        });
    
    var tip = d3.tip()
        .attr("class", "tooltip")
        .offset([-10, 0])
        .html(function(d) {
            console.log(d);  
            return "State: " + d.State + "<br />" + 
                   "County: " + d.County + "<br />" + 
                   "Poverty Rate: " + d.Poverty + "<br />" + 
                   "Total Population: " + d3.format(",.2r")(d.TotalPop) + "<br />" + 
                   "Income Per Capita: " + d3.format(",.2r")(d.IncomePerCap) + "<br />";

        });
    svg.call(tip);

    let map = svg.append("g")
        .attr("transform", "translate(50, " + topPadding + ")");

    map.append("g")        
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(geoData, geoData.objects.counties).features)
        .enter().append("path")        
            .attr("fill", function(d) {                
                let item = countyDataMap.get(d.id);
                d.County = item.County;
                d.State = item.State;
                d.Poverty = item.Poverty;
                d.TotalPop = item.TotalPop;
                d.IncomePerCap = item.IncomePerCap;
                return colorScale(item.Poverty);                 
            })
            .attr("d", path)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    map.append("path")        
        .datum(topojson.mesh(geoData, geoData.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);

}