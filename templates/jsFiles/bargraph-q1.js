// set the dimensions and margins of the graph
//var margin = {top: 30, right: 30, bottom: 70, left: 60},
//    width = 460 - margin.left - margin.right,
//    height = 400 - margin.top - margin.bottom;

// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 100, left: 80 },
  width = 1000 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#bar-graph-render-q1-svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//svg
//  .append("rect")
//  .attr("x", 0)
//  .attr("y", 0)
//  .attr("height", height)
//  .attr("width", height)
//  .style("fill", "EBEBEB");

// Parse the Data
d3.csv("templates/data/bar-graphs/counts_df.csv", function (data) {
  let sequentialScale = d3.scaleOrdinal().domain([1, 22]).range(d3.schemePaired);

  // X axis
  // X axis
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(
      data.map(function (d) {
        return d.years;
      })
    )
    .padding(0.3);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .style("font-size", "10px")
    .call(d3.axisBottom(x))
    .style("fill", "black")
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .style("fill", "black")
    
    
    
  
  svg.append("text")             
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                         (height + margin.top + 40) + ")")
    .style("text-anchor", "middle")
    .text("Years")
    .style("font-size", "15px")
    .style("fill", "black");

  // Add Y axis
  var y = d3.scaleLinear().domain([0, 90]).range([height, 0]);
  svg.append("g")
  .style("font-size", "10px")
  .call(d3.axisLeft(y))
  .style("fill", "black")
  .selectAll("text")
  .style("font-weight", "bold")
  .style("fill", "black");


  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of Publications")
      .style("font-size", "15px")
      .style("fill", "black")

  //Hover effects
  var tooltip = d3.select("#q1-tooltip")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    var subgroupName = d.years
    var subgroupValue = d.counts;
    tooltip
        .html("Year: " + subgroupName + "<br>" + "Number of Papers: " + subgroupValue)
        .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
  }

  // Bars
 // Bars
  svg.selectAll("mybar")
  .data(data)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.years); })
    .attr("y", function(d) { return y(d.counts); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.counts); })
    .attr("fill", function (d) {
      return sequentialScale(d.rank)}
    )
    .on("mouseover", function (d, i) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black");
      //d.total = data.get(d.id) || 0;

      tooltip.style("opacity", 0.8);
      var subgroupName = d.years;
      var subgroupValue = d.counts;
      tooltip
        .html(
          "Year: " +
            subgroupName +
            "<br>" +
            "Number of Papers: " +
            subgroupValue
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
   /*svg
    .selectAll("rect")
    .transition()
    .duration(800)
    .attr("y", function (d) {
      return y(d.counts);
    })
    
    .attr("height", function (d) {
      return height - y(d.counts);
    })
    .delay(function (d, i) {
      console.log(i);
      return i * 100;
    })*/
})
