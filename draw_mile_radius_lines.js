function updateMileRadiusLines(container, data, mapScale) {
    // Get D3 selection object
    let selection = container
        .selectAll("circle") 
        .data(data) 

    // Add the circles to the chart
    selection
        .enter()
        .append("circle")
        .merge(selection)
        .transition()
        .duration(500)
            .attr("cx",mapScale.xScale(mapCentreLon, mapCentreLat))
            .attr("cy",mapScale.yScale(mapCentreLon, mapCentreLat))
            .attr("r",d=>mapScale.scaleMiles(d))
            .style("fill",      "none")
            .style("stroke", "red")        
}

function removeMileRadiusLines(container) {
    container
        .selectAll("circle") 
        .data([]).exit().remove()  
}

function updateMileRadiusLines2(container, data, mapScale) {
    for (angle=0; angle<2*Math.PI; angle+=0.174533) {
        console.log(mapScale.screenWidth)
        polar = {r:10*mapScale.pixPerKm, theta:angle}
        console.log(polar)
        let cartesian = polar_to_cartesian(polar)
        container.append("circle")
            .attr("cx",         cartesian.x)
            .attr("cy",         cartesian.y)        
            .attr("r",          1)
            .style("fill",      "blue")
            .style("opacity",   1)
    }   
}