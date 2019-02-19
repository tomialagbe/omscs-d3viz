let w = 1000;
let h = 800;   
let legendWidth =  70;

let xPadding = 100;    
let yPadding = 50;
var radius = 2;

var data = [];
var goodRatingData = [];
var badRatingData = []; 

d3.csv("movies.csv", function(d){
    return {
        Id: +d.Id,
        Title: d.Title,
        Year: +d.Year,
        Runtime: +d.Runtime,
        Country: d.Country,
        Rating: parseFloat(d.Rating),
        Votes: +d.Votes,
        Budget: +d.Budget,
        Gross: +d.Gross,
        WinsNoms: +d.WinsNoms,
        IsGoodRating: +d.IsGoodRating == 0 ? false : true,
    };
}).then(function(data){
    data.forEach(function(d){
        var elem = {Rating: d.Rating, WinsNoms: d.WinsNoms, Budget: d.Budget, Votes: d.Votes, IsGoodRating: d.IsGoodRating};

        data.push(elem);
        if (d.IsGoodRating) {
            goodRatingData.push(elem);
        } else {
            badRatingData.push(elem);
        }
    });
    
    let svg1 = d3.select("body").append("svg").attr("width", w).attr("height", h);
    d3.select("body").append("div").attr("class", "pagebreak");
    
    let svg2 = d3.select("body").append("svg").attr("width", w).attr("height", h);
    d3.select("body").append("div").attr("class", "pagebreak");

    let svg3 = d3.select("body").append("svg").attr("width", w).attr("height", h);
    d3.select("body").append("div").attr("class", "pagebreak");

    let svg4 = d3.select("body").append("svg").attr("width", w).attr("height", h);
    d3.select("body").append("div").attr("class", "pagebreak");

    let svg5 = d3.select("body").append("svg").attr("width", w).attr("height", h);    

    var chartProps = {
        Data: data,
        GoodData: goodRatingData,
        BadData: badRatingData,
        Title: "Wins+Nominations vs Rating",
        XAxisTitle: "Rating",
        YAxisTitle: "Wins + Nominations",
        YAxisScale: "default",
        XKey: "Rating",
        YKey: "WinsNoms",
        ScaleSymbols: false,
    };    
    drawChart(svg1, chartProps);
    
    chartProps.Title = "Budget vs Rating";
    chartProps.YAxisTitle = "Budget";
    chartProps.YKey = "Budget";
    drawChart(svg2, chartProps);

    chartProps.Title = "Votes vs Rating sized by Wins+Nominations";    
    chartProps.YAxisTitle = "Votes";    
    chartProps.YKey = "Votes";
    chartProps.ScaleSymbols = true;
    chartProps.ScaleBy = "WinsNoms";
    drawChart(svg3, chartProps);

    chartProps.ScaleSymbols = false;
    chartProps.Title = "Wins+Nominations (square-root-scaled) vs Rating";
    chartProps.YAxisTitle = "Wins + Nominations";
    chartProps.YKey = "WinsNoms";
    chartProps.YAxisScale = "sqrt";
    drawChart(svg4, chartProps);

    chartProps.ScaleSymbols = false;
    chartProps.Title = "Wins+Nominations (log-scaled) vs Rating";    
    chartProps.YAxisScale = "log";
    drawChart(svg5, chartProps);
});

function drawChart(svg, chartProps) {
    let chartWidth = w - legendWidth;
    // draw chart title
    svg.append("text")
        .text(chartProps.Title)
        .attr("x", chartWidth/2)
        .attr("y", yPadding)
        .style("font-weight", "bold")
        .style("text-anchor", "middle");

    // draw legend
    svg.append("circle")
        .attr("class", "bad")
        .attr("cx", function(d){
            return w-legendWidth;
        })
        .attr("cy", function(d){
            return yPadding + 20;
        })
        .attr("r", radius);

    svg.append("text")
        .text("bad rating")
        .attr("x", (w-legendWidth) + 5 + radius * 2)
        .attr("y", yPadding + 20)
        .style("font-size", 12)
        .style("font-weight", "bold")
        .style("dominant-baseline", "middle");

    svg.append("path")
    .attr("class", "good")        
    .attr("d", function(d){        
        var xVal = (w-legendWidth);
        var yVal = yPadding + 40;
        //     M3 3 h3 v3 h3 v3 h-3 v3 h-3 v-3 h-3 v-3 h3 z            
        return `M${xVal} ${yVal} h2 v2 h2 v2 h-2 v2 h-2 v-2 h-2 v-2 h2 z`;
    });

    svg.append("text")
        .text("good rating")
        .attr("x", (w-legendWidth) + 5 + 4)
        .attr("y", yPadding + 42)
        .style("font-size", 12)
        .style("font-weight", "bold")
        .style("dominant-baseline", "middle");

    // draw Ratings vs Wins and Nominations
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(chartProps.Data, function(d) { return d[chartProps.XKey]; })])
        .range([xPadding, chartWidth - xPadding]);
    var yScale;
    if (chartProps.YAxisScale === "log") {
        yScale = d3.scaleLog()
        .domain([1, d3.max(chartProps.Data, function(d) { return d[chartProps.YKey]; })])
        .range([h - yPadding, yPadding]).nice().clamp(true);
    } else if (chartProps.YAxisScale === "sqrt") {
        yScale = d3.scaleSqrt()
        .domain([0, d3.max(chartProps.Data, function(d) { return d[chartProps.YKey]; })])
        .range([h - yPadding, yPadding]);;
    } else  {
        yScale = d3.scaleLinear()
        .domain([0, d3.max(chartProps.Data, function(d) { return d[chartProps.YKey]; })])
        .range([h - yPadding, yPadding]);        
    }

    let symbolScale = chartProps.ScaleSymbols ? d3.scaleLinear().domain([
        0, 
        d3.max(chartProps.Data, function(d) { return d[chartProps.ScaleBy]; })
    ]).range([2, 8]) : null;

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10)
        .tickSizeInner(-h);

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(5)
        .tickSizeInner(-chartWidth);        

    // axes
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (h - (yPadding - 10)) + ")")
        .call(xAxis);

    // text label for the x axis
    svg.append("text")             
        .attr("transform", "translate(" + (chartWidth/2) + " ," +  (h-10) + ")")
        .style("text-anchor", "middle")
        .text(chartProps.XAxisTitle)
        .style("font-family", "sans-serif")
        .style("font-size", 16);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xPadding + ", 0)")
        .call(yAxis);

    // text label for the y axis
    svg.append("text")
        .attr("transform", "translate(" + xPadding * 1.2 + ", " + yPadding*5 + ") rotate(90)")        
        .style("text-anchor", "middle")
        .text(chartProps.YAxisTitle)
        .style("font-family", "sans-serif")
        .style("font-size", 16);

    svg.selectAll("circle.bad")
        .data(chartProps.BadData)
        .enter()
        .append("circle")
        .attr("class", "bad")
        .attr("cx", function(d){            
            return xScale(d[chartProps.XKey]);
        })
        .attr("cy", function(d){            
            return yScale(d[chartProps.YKey]);
        })
        .attr("r", function(d) {
            if (!chartProps.ScaleSymbols) {
                return radius;
            }

            let val = d[chartProps.ScaleBy];
            let scaledVal = symbolScale(val);            
            return scaledVal;            
        });

    svg.selectAll("path.good")
        .data(chartProps.GoodData)
        .enter()
        .append("path")
        .attr("class", "good")        
        .attr("d", function(d) {
            var xVal = xScale(d[chartProps.XKey]);
            var yVal = yScale(d[chartProps.YKey]);
            if (!chartProps.ScaleSymbols) {                
                //     M3 3 h3 v3 h3 v3 h-3 v3 h-3 v-3 h-3 v-3 h3 z            
                return `M${xVal} ${yVal} h2 v2 h2 v2 h-2 v2 h-2 v-2 h-2 v-2 h2 z`;
            }

            let val = d[chartProps.ScaleBy];
            let scaleVal = symbolScale(val);
            //     M3 3 h3 v3 h3 v3 h-3 v3 h-3 v-3 h-3 v-3 h3 z            
            return `M${xVal} ${yVal} h${scaleVal} v${scaleVal} h${scaleVal} v${scaleVal} h-${scaleVal} v${scaleVal} h-${scaleVal} v-${scaleVal} h-${scaleVal} v-${scaleVal} h${scaleVal} z`;
        });   
}