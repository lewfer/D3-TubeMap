/*
 * chart.js
 *
 * Tube map with D3.
 * Plots a map of tube stations and lines, with non-linear scaling so centre can be zoomed in more than outer edges.
 */


async function drawChart(container) {
    
    // Data processing
    // --------------------------------------------------------------------------------------------

    // Load the stations data and convert numbers
    let data = await d3.csv("london_stations.csv");
    data.forEach(d=>{
        d.latitude = parseFloat(d.latitude), 
        d.longitude = parseFloat(d.longitude) 
    });

    // Load the lines data and convert numbers
    let linesData = await d3.csv("london_lines_stations.csv");
    data.forEach(d=>{
        d.line = parseInt(d.line), 
        d.latitude = parseFloat(d.latitude), 
        d.longitude = parseFloat(d.longitude) 
    });    
 
    // Temp filter for debugging
    //data = data.filter(d=>d["name"] == 'Chesham')

    // Get list of unique line numbers
    let uniqueLines = [...new Set(linesData.map(d => d.line))]
    console.log(uniqueLines)

    // Create object to handle all the map scaling
    let mapScale = new MapScale(-0.6427, 0.2799, 51.2623, 51.7252)
    mapScale.setCentre(mapCentreLon, mapCentreLat)
    mapScale.expandAroundCentre()

    // Set the screen size of the map
    mapScale.setScreenWidth(1200)

     // Create main container objects, that will hold the data-driven SVG objects
    // -------------------------------------------------------------------------

    // Add the svg element, in which we will draw the chart, to the container
    let svg = d3.select(container).append("svg")
        .attr('width', mapScale.screenWidth)
        .attr('height', mapScale.screenHeight)
        .style('border', "1px solid black")

    // Add a group for all data-driven objects - station circles and names and lines
    let g = svg  
        .append("g")  
        .attr("transform", "translate("+mapScale.screenMidX+","+mapScale.screenMidY+")")
    
    // Add groups for each set of data-driven objects
    let gStationCircles = g.append("g").attr("id","station-circles")
    let gStationNames = g.append("g").attr("id","station-names")
    let gMilesRadii = g.append("g").attr("id","miles-radii")
    let gLines = g.append("g").attr("id","lines")


    // D3 uUpdate function
    // -------------------------------------------------------------------------        
    function update(scaleFactor) { 
        // Adjust scale factor when redrawn   
        mapScale.scaleFactor = scaleFactor
 
        function scaleColour(d) {
            return "black"
        }

        // Function to generate screen lines for the train lines
        let linepoints = d3.line()
            .x(d=>mapScale.xScaleRadial(d["longitude"], d["latitude"]))
            .y(d=>mapScale.yScaleRadial(d["longitude"], d["latitude"]))
            .curve(d3.curveCatmullRom.alpha(0.5))


        if (SHOW_MILE_RADIUS_LINES) {
            // Mile radius circles
            let mileRadiusData = [5, 10, 15, 20]

            // Get D3 selection object
            let selection = gMilesRadii
                .selectAll("circle") 
                .data(mileRadiusData) 

            // Add the circles to the chart
            selection
                .enter()
                .append("circle")
                .merge(selection)
                .transition()
                .duration(500)
                    .attr("cx",mapScale.xScaleRadial(mapCentreLon, mapCentreLat))
                    .attr("cy",mapScale.yScaleRadial(mapCentreLon, mapCentreLat))
                    .attr("r",d=>mapScale.scaleMiles(d))
                    .style("fill",      "none")
                    .style("stroke", "red")                     
        }


        if (SHOW_STATION_CIRCLES) {
            // Get D3 selection object
            let circlesSelection = gStationCircles
                .selectAll("circle") 
                .data(data) 

            // Add the station circles to the chart
            circlesSelection
                .enter() // enter new data
                .append("circle")
                .merge(circlesSelection) // merge with existing data
                .transition()
                .duration(500)
                    .attr("cx",         d=>mapScale.xScaleRadial(d["longitude"], d["latitude"]))
                    .attr("cy",         d=>mapScale.yScaleRadial(d["longitude"], d["latitude"]))        
                    .attr("r",          5)
                    .style("fill",      d=>scaleColour(d))
                    .style("opacity",   1)

        }

        if (SHOW_STATION_NAMES) {
            // Get D3 selection object
            let namesSelection = gStationNames
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
                    .attr("x",         d=>mapScale.xScaleRadial(d["longitude"], d["latitude"]))
                    .attr("y",         d=>mapScale.yScaleRadial(d["longitude"], d["latitude"])) 
                    .style("fill",      "black")
                    .style("opacity",   1)
                    .attr("class",     "station")
        }

        if (SHOW_LINES) {
            // Loop through all the lines
            for (let i=0; i<uniqueLines.length; i++) {
                // Select the line data for just this line
                filteredLinesData = linesData.filter(d=>d["line"] == uniqueLines[i])

                const colour ="#094FA3"

                // Get an object representing the one line
                let selection = gLines.selectAll(".line"+i).data([filteredLinesData]) 
                
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
            }
        }
    }

    update(1)

    d3.select("#zoom")
        .on("change", function() {      
            scaleFactor = document.getElementById("zoom").value  
            console.log(scaleFactor)
            //window.alert("changed");
            //scaleFactor = sliderValue
            update(scaleFactor)
        })

}
