function updateStationCircles(container, data, mapScale) {
     
    function scaleColour(d) {
        return "black"
    }

    // Get D3 selection object
    let circlesSelection = container
        .selectAll("circle") 
        .data(data) 

    // Add the station circles to the chart
    circlesSelection
        .enter() // enter new data
        .append("circle")
        .merge(circlesSelection) // merge with existing data
        .transition()
        .duration(500)
            .attr("cx",         d=>mapScale.xScale(d["longitude"], d["latitude"]))
            .attr("cy",         d=>mapScale.yScale(d["longitude"], d["latitude"]))        
            .attr("r",          5)
            .style("fill",      d=>scaleColour(d))
            .style("opacity",   1)
}

function removeStationCircles(container) {
    container
    .selectAll("circle") 
    .data([]).exit().remove()    
}
