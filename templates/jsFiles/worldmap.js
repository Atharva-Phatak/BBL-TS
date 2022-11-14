// The svg
var codeMap = {
  USA: "USA",
  GBR: "England",
  DEU: "Germany",
  FRA: "France",
  ESP: "Spain",
  CAN: "Canada",
  JPN: "Japan",
  IND: "India",
  ITA: "Italy",
  BEN: "Belgium",
  CHE: "Switzerland",
  CHN: "China",
  SWZ: "Sweden",
  BRA: "Brazil",
  DNK: "Denmark",
  PAK: "Pakistan",
  AUS: "Australia",
  ROU: "Romania",
  FIN: "Finland",
  MYS: "Malaysia",
  ECU: "Ecuador",
  IDN: "Indonesia",
  PHL: "Philippines",
  ISR: "Israel",
  IRL: "Ireland",
  TUR: "Turkey",
  NLD: "Netherlands",
  EGY: "Egypt",
  RUS: "Russia",
  SAU: "Saudi Arabia",
  IRN: "Iran",
};
function getCountryName(code){
  var countryName = codeMap[code]
  if (countryName === undefined){
    return code
  }
  else {
    return countryName
  }
}

var margin = { top: 10, right: 10, bottom: 10, left: 10 };
var width = 1920 - margin.left - margin.right;
var height = 1080 - margin.top - margin.bottom;
var projection = d3
  .geoNaturalEarth1()
  .center([0, 5])
  .rotate([-9, 0])
  .scale([2000 / (2*Math.PI)])
  .translate([900, 400]);
var path = d3.geoPath().projection(projection);
var svg = d3.select("#worldmap-svg")
  .attr("width", width)
  .attr("height", height);

// Map and projection
//var path = d3.geoPath();
//var projection = d3.geoMercator()
//  .scale(100)
//  .center([0,20])
//  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var domain = [5, 15, 25, 35, 45, 55, 65, 75]
var labels = ["< 5 Papers", "5-15 Papers", "15-25 Papers", "25-35 Papers", "35-45 Papers", 
          "45-55 Papers", "55-65 Papers", "65-75 Papers"]
var colorScale = d3
  .scaleThreshold()
  .domain(domain)
  .range(d3.schemeReds[8]);

var tooltip = d3.select("#tooltip");

//console.log(d3.schemeGnBu[9])
//d3.json(, function(error, jsonData) {
//  codeMap = jsonData;
//});
//console.log(codeMap)
//console.log("adbc")
// Load external data and boot
d3.queue()
  .defer(
    d3.json,
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  )
  .defer(d3.csv, "templates/data/world-map/Countries.csv", function (d) {
    //data.set(d.code, +d.counts);
    data.set(d.code, +d.counts);
  })
  .await(ready);
//console.log(code)
function ready(error, topo) {
  let mouseOver = function (d) {
    d3.selectAll(".Country").transition().duration(200).style("opacity", 0.5);

    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black");
  };

  let mouseLeave = function (d) {
    d3.selectAll(".Country").transition().duration(200).style("opacity", 0.8);
    d3.select(this).transition().duration(200).style("stroke", "transparent");
  };
  
  //console.log(topo)
  // Draw the map
  svg
    .append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath().projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    })
    .style("stroke", "transparent")
    .attr("class", function (d) {
      return "Country";
    })
    .style("opacity", 0.8)
    .on("mouseover", function (d, i) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black");
      d.total = data.get(d.id) || 0;

      tooltip.style("opacity", 0.8);
      var subgroupName = getCountryName(d.id);
      var subgroupValue = d.total;
      tooltip
        .html(
          "Country: " +
            subgroupName +
            "<br>" +
            "Number of Papers: " +
            subgroupValue
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseleave", mouseLeave);
    var legend_x = width - 200
    var legend_y = height - 400
    
    svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + legend_x + "," + legend_y+")");

    var legend = d3.legendColor()
      .labels(labels)
      .title("Number of Papers")
      .scale(colorScale)
     
    svg.select(".legend")
      .call(legend);
}
