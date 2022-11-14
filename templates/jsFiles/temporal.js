degreeMap = {
  2012: { degree: 8, width: 1080, height: 800 },
  2013: { degree: 8, width: 1080, height: 800 },
  2014: { degree: 4, width: 1080, height: 800 },
  2015: { degree: 10, width: 2160, height: 1980 },
  2016: { degree: 25, width: 2160, height: 1980 },
};
colorSchemeMap = {
  Turbo: d3.interpolateTurbo,
  Viridis: d3.interpolateViridis,
  Plasma: d3.interpolatePlasma,
  Cool: d3.interpolateCool,
  Rainbow: d3.interpolateRainbow,
  Sinebow: d3.interpolateSinebow,
};

//linkDistance = document.querySelector('#link-distance').value
var linkslider = document.getElementById("link-slider-temp");
var linkDist = document.getElementById("link-distance-temp");
var chargeslider = document.getElementById("charge-strength-slider-temp");
var chargeStrength = document.getElementById("charge-strength-temp");
var collideslider = document.getElementById("collide-radius-slider-temp");
var collideRadius = document.getElementById("collide-radius-temp");

linkDist.innerHTML = linkslider.value;
chargeStrength.innerHTML = chargeslider.value;
collideRadius.innerHTML = collideslider.value;

linkslider.oninput = function () {
  linkDist.innerHTML = this.value;
};

chargeslider.oninput = function () {
  chargeStrength.innerHTML = this.value;
};

collideslider.oninput = function () {
  collideRadius.innerHTML = this.value;
};

function refreshPage() {
  window.location.reload();
}

function getYear() {
  selectElement = document.querySelector("#year-select-temp");
  output = selectElement.value;
  return output;
}
function returnWidthHeight(year) {
  if (year !== "all") {
    return { width: degreeMap[year].width, height: degreeMap[year].height };
  } else {
    return { width: 2160, height: 1980 };
  }
}
function getColorScheme() {
  selectElement = document.querySelector("#color-select-temp");
  output = selectElement.value;
  console.log(output);
  return colorSchemeMap[output];
}
year = getYear();
size = returnWidthHeight(year);
colorScheme = getColorScheme();

//console.log(colorScheme)

var svg = d3
    .select("#graph-render-svg-temp")
    .attr("width", size.width)
    .attr("height", size.height),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3
      .forceLink()
      .id(function (d) {
        return d.id;
      })
      .distance(linkDist.value)
      .strength(1)
  )
  .force("charge", d3.forceManyBody().strength(chargeStrength.value))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide(20));

var tooltip = d3.select("#temporal-tooltip")
//console.log(year);
//years = {year:      <button onclick="renderGraph()">Generate</button>"2012"}
//console.log(year.value)
d3.json(`templates/data/temporal-analysis/json/year-${year}.json`, function (error, graph) {
  if (error) throw error;

  let sequentialScale = d3
    .scaleSequential()
    .domain([
      d3.min(graph.nodes, (d) => d.degree*3),
      d3.max(graph.nodes, (d) => d.degree),
    ])
    .interpolator(colorScheme);

  //let colorScale = sequentialScale()

  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .style("fill", "none")
    .style("stroke-width", "1px")
    //.style("stroke" , "#000000")
    .style("stroke", "#007FFF");

  var node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("r", function (d) {
      if (d.degree < 5) {
        return d.degree * 3;
      } else {
        return d.degree;
      }
    })
    .style("fill", function (d) {
      return sequentialScale(d.degree);
    })
    .style("cursor", "pointer")
    .style("stroke-width", "1px")
    .on('mouseover.tooltip', function(d) {
        tooltip.transition()
          .duration(300)
          .style("opacity", .8);
        tooltip.html("Name:" + d.id + "<p/>degree:" + d.degree)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY + 10) + "px");
      })
    .on("mouseover.fade", fade(0.1))
    .on('mouseout.fade', fade(1))
    .on("mouseout.tooltip", function() {
        tooltip.transition()
	        .duration(100)
	        .style("opacity", 0);
	    })
    .on("mousemove", function() {
            tooltip.style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY + 10) + "px");
          })
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );
  //    .append("text")
  //    .style("text-anchor", "middle")
  //    .attr("y", 15)
  //    .text(function(d) {return d.id})

  //node.append("title").text(function (d) {
  //  return "Node: " + d.id + "\n" + "Degree: " + d.degree + "\n";
  //});
  //node.append("text")
  //    .style("text-anchor", "middle")
  //    .attr("y", 15)
  //    .text(function(d) {return d.id})

  /*var label = svg
    .selectAll(".myText")
    .data(graph.nodes)
    .enter()
    .append("text")
    .text(function (d) {
      if (year !== "all") {
        degreeVal = degreeMap[year].degree;
      } else {
        degreeVal = 20;
      }
      if (d.degree > degreeVal) {
        return d.id;
      }
    })
    .style("text-anchor", "top")
    .style("fill", "#000000")
    .style("font-family", "Arial")
    .style("font-weight", "bolder")
    .style("font-size", 30); */

  simulation.nodes(graph.nodes).on("tick", ticked);

  simulation.force("link").links(graph.links);

  //simulation.force("collide", d3.forceCollide().radius(d => degreeSize(d.degree)))
  function ticked() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
    /*label
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y - 30;
      });*/
  }
  const linkedByIndex = {};
  graph.links.forEach((d) => {
    linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
  });

  function isConnected(a, b) {
    return (
      linkedByIndex[`${a.index},${b.index}`] ||
      linkedByIndex[`${b.index},${a.index}`] ||
      a.index === b.index
    );
  }

  function fade(opacity) {
    return (d) => {
      node.style("stroke-opacity", function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        this.setAttribute("fill-opacity", thisOpacity);
        return thisOpacity;
      });

      link.style("stroke-opacity", (o) =>
        o.source === d || o.target === d ? 1 : opacity
      );
    };
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
//UI EVENTS
