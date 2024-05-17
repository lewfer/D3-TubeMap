function updateLines(container, data, uniqueLines, mapScale) {
    // Function to generate screen lines for the train lines
    let linepoints = d3.line()
        .x(d=>mapScale.xScale(d["longitude"], d["latitude"]))
        .y(d=>mapScale.yScale(d["longitude"], d["latitude"]))
        .curve(d3.curveCatmullRom.alpha(0.5))
        //.curve(d3.curveCardinal)
        //.curve(d3.curveCardinal.tension(1))
        //.curve(d3.curveCatmullRom)
        //.curve(d3.curveMonotoneX)


    // Loop through all the lines
    for (let i=0; i<uniqueLines.length; i++) {
        // Select the line data for just this line
        filteredLinesData = data.filter(d=>d["line"] == uniqueLines[i])

        const colour ="#094FA3"

            // Get an object representing the one line
            let selection = container.selectAll(".line"+i).data([filteredLinesData]) 

            selection.exit().remove()

            // Add the line to the chart
            selection
                //.join("path") - same as enter, append, merge
                .enter()
                .append("path")
                .merge(selection)
                .attr("class",      "line"+i)    
                .style("stroke",    colour)  
                .style("stroke-width", 5)
                .style("fill",      "none")  
                .transition()
                .duration(500)
                .attr("d",          d=>linepoints(d))

            // Add the markers
            console.log(linepoints(filteredLinesData))
            let markers = makeCurveMarkers(linepoints(filteredLinesData))
            console.log(markers)  
            let selectionMarkers = container.selectAll(".markers"+i).data(markers) 

            selectionMarkers
                .enter() // enter new data
                .append("line")
                .merge(selectionMarkers) // merge with existing data
                .attr("class",      "markers"+i)   
                .style("stroke",    colour)  
                .style("stroke-width", 5)                    
                .transition()
                .duration(500)
                    .attr("x1",         d=>d.x)
                    .attr("y1",         d=>d.y)  
                    .attr("x2",         d=>+d.x - computeXFromGradient(d.g, 50))
                    .attr("y2",         d=>+d.y + computeYFromGradient(d.g, 50))         
        }
}

function removeLines(container) {
    container
        .selectAll(".line"+i)
        .data([]).exit().remove()
}