
function updateStationNames(container, data, mapScale) {
    // Get D3 selection object
    let namesSelection = container
        .selectAll("text") 
        .data(data) 

    // Add the station names to the chart
    namesSelection
        .enter()
        .append("text")
        .html(d=>d["name"])
        .merge(namesSelection)
        .transition()
        .duration(500)
            .attr("x",         d=>mapScale.xScale(d["longitude"], d["latitude"]))
            .attr("y",         d=>mapScale.yScale(d["longitude"], d["latitude"])) 
            .attr("class",     "station")
            // .style("fill",      "black")
            // .style("opacity",   1)    
}

function removeStationNames(container) {
    container
    .selectAll("text") 
    .data([]) .exit().remove()
}

