var svg = d3
    .select("#graph-render-svg-colab")
    .attr("width", 2160)
    .attr("height", 1980),
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
      .distance(50)
      .strength(2)
  )
  .force("charge", d3.forceManyBody().strength(20))
  .force("center", d3.forceCenter(width /2, height / 2))
  .force("collide", d3.forceCollide(25));
var tooltip = d3.select("#colab-tooltip")
var colorScheme = d3.interpolateSinebow
//console.log(year);
//years = {year:      <button onclick="renderGraph()">Generate</button>"2012"}
//console.log(year.value)
d3.json(`templates/data/colab-graph/year-all-aff.json`, function (error, graph) {
  if (error) throw error;

  let sequentialScale = d3
    .scaleSequential()
    .domain([
      d3.min(graph.nodes, (d) => d.degree*5),
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
        return d.degree * 5;
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
      tooltip.html("Name: " + d.id + "<p/>Affiliation: " + d.aff)
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

  //var label = svg
  //  .selectAll(".myText")
  //  .data(graph.nodes)
  //  .enter()
  //  .append("text")
  //  .text(function (d) {
  //    if (year !== "all") {
  //      degreeVal = degreeMap[year].degree;
  //    } else {
  //      degreeVal = 20;
  //    }
  //    if (d.degree > degreeVal) {
  //      return d.id;
  //    }
  //  })
  //  .style("text-anchor", "top")
  //  .style("fill", "#000000")
  //  .style("font-family", "Arial")
  //  .style("font-weight", "bolder")
  //  .style("font-size", 30);

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
    //label
    //  .attr("x", function (d) {
    //    return d.x;
    //  })
    //  .attr("y", function (d) {
    //    return d.y - 30;
    //  });
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
