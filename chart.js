/*
 * chart.js
 *
 * Tube map with D3.
 * Plots a map of tube stations and lines, with non-linear scaling so centre can be zoomed in more than outer edges.
 */


async function drawChart(container) {
    
    // Data processing
    // --------------------------------------------------------------------------------------------

    // Load the data and convert numbers
    const data = await d3.csv("tube-stations.csv");
    data.forEach(d=>{
        d.latitude = parseFloat(d.latitude), 
        d.longitude = parseFloat(d.longitude) 
    });

    let linesData = await d3.csv("tube-lines.csv");
    data.forEach(d=>{
        d.line = parseInt(d.line), 
        d.latitude = parseFloat(d.latitude), 
        d.longitude = parseFloat(d.longitude) 
    });    
 

    let uniqueLines = [...new Set(linesData.map(d => d.line))]
    console.log(uniqueLines)

    // Where is centre of map
    // Covent Garden
    let mapCentreLon = -0.1243
    let mapCentreLat = 51.5129

    // Northfields
    // let mapCentreLon = -0.3142
    // let mapCentreLat = 51.4995	

    // Stratford
    // let mapCentreLon = -0.0042
    // let mapCentreLat = 51.5416	

    // Debden
    // let mapCentreLon =  0.0838
    // let mapCentreLat = 51.6455		    
   

    // Get coordinate range of London
    let minLon = -0.6427 //d3.min(data, d=>d["longitude"])
    let maxLon = 0.2799 //d3.max(data, d=>d["longitude"])
    let minLat = 51.2623 //d3.min(data, d=>d["latitude"])
    let maxLat = 51.7252 //d3.max(data, d=>d["latitude"])
    let midLon = minLon + (maxLon - minLon)/2
    let midLat = minLat + (maxLat - minLat)/2

    // Adjust longitude range so centre is at centre of range
    let lonOffset = mapCentreLon-midLon
    if (lonOffset>0) {
        maxLon = maxLon+lonOffset*2; 
        midLon = minLon + (maxLon - minLon)/2
    }
    else {
        minLon = minLon-(-lonOffset)*2; 
        midLon = minLon + (maxLon - minLon)/2
    }

    // Adjust latitude range so centre is at centre of range
    let latOffset = mapCentreLat-midLat
    if (latOffset>0) {
        maxLat = maxLat+latOffset*2; 
        midLat = minLat + (maxLat - minLat)/2
    }
    else {
        minLat = minLat-(-latOffset)*2; 
        midLat = minLat + (maxLat - minLat)/2
    }

    // Compute km dimensions of the map
    lonDistKm = distanceKm(midLat, minLon, midLat, maxLon) 
    latDistKm = distanceKm(minLat, midLon, maxLat, midLon) 
    console.log(lonDistKm)
    console.log(latDistKm)

    // Define chart parameters
    const WIDTH = 1200
    const HEIGHT = WIDTH*latDistKm/lonDistKm
    //const MARGIN = {LEFT:50, RIGHT:50, TOP:50, BOTTOM:50}
    const MARGIN = {LEFT:0, RIGHT:0, TOP:0, BOTTOM:0}
    const PLOT = {LEFT:MARGIN.LEFT, RIGHT:WIDTH-MARGIN.RIGHT, 
                  TOP:MARGIN.TOP, BOTTOM:HEIGHT-MARGIN.BOTTOM, 
                  WIDTH:WIDTH-MARGIN.LEFT-MARGIN.RIGHT, HEIGHT:HEIGHT-MARGIN.TOP-MARGIN.BOTTOM,
                  MIDX:MARGIN.LEFT+(WIDTH-MARGIN.LEFT-MARGIN.RIGHT)/2, MIDY:MARGIN.TOP+(HEIGHT-MARGIN.TOP-MARGIN.BOTTOM)/2}


    let pixPerKm = PLOT.WIDTH / lonDistKm
    console.log(pixPerKm)
                      
    // console.log(minLon)
    // console.log(maxLon)
    // console.log(midLon)
    // console.log(PLOT.LEFT)
    // console.log(PLOT.RIGHT)
    // console.log(PLOT.WIDTH)

    // Compute max radius of the map for polar coords
    //let maxRadius = Math.min(PLOT.WIDTH/2, PLOT.HEIGHT/2)               // edge of shortest dimension
    let maxRadius = Math.max(PLOT.WIDTH/2, PLOT.HEIGHT/2)               // edge of longest dimension


    // Create main container objects, that will hold the data-driven SVG objects
    // -------------------------------------------------------------------------

    // Add the svg element, in which we will draw the chart, to the container
    let svg = d3.select(container).append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .style('border', "1px solid black")

    // Add a group for all data-driven objects - station circles and names and lines
    let g = svg  
        .append("g")  
        .attr("transform", "translate("+PLOT.MIDX+","+PLOT.MIDY+")")
        
    let gStationCircles = g.append("g").attr("id","station-circles")
    let gStationNames = g.append("g").attr("id","station-names")
    let gMilesRadii = g.append("g").attr("id","miles-radii")
    let gLines = g.append("g").attr("id","lines")


    // Add a group per line
    // for (let i=0; i<uniqueLines.length; i++) {
    //     let lineG = g.append("g").attr("id", "line"+i)
    // }

        
    // Update function
    // -------------------------------------------------------------------------        
    function update() {    

        // Scale longitude and latitude to pixels
        let scaleLon = d=>scale(d, minLon, maxLon, -PLOT.WIDTH/2,  PLOT.WIDTH/2) 
        let scaleLat = d=>scale(d, minLat, maxLat, PLOT.HEIGHT/2, -PLOT.HEIGHT/2) 

        // Scale km and miles to pixels
        let scaleKm = km=>{pix = km*pixPerKm; return maxRadius*ease(pix/maxRadius,scaleFactor)}
        let scaleMiles = mi=>{pix = mi*1.60934*pixPerKm; return maxRadius*ease(pix/maxRadius,scaleFactor)}

        // Scale the longitude non-linearly from the centre 
        function xScaleRadial(lon, lat) {
            x = scaleLon(lon)
            y = scaleLat(lat)
            polar = cartesian_to_polar({x:x, y:y})
            polar.r = maxRadius*ease(polar.r/maxRadius, scaleFactor)
            cartesian = polar_to_cartesian(polar)
            return cartesian.x
        }

        // Scale the latitude non-linearly from the centre 
        function yScaleRadial(lon, lat) {
            x = scaleLon(lon)
            y = scaleLat(lat)
            polar = cartesian_to_polar({x:x, y:y})
            polar.r = maxRadius*ease(polar.r/maxRadius, scaleFactor)
            cartesian = polar_to_cartesian(polar)
            return cartesian.y
        }

        function scaleColour(d) {
            return "black"
        }


        let linepoints = d3.line()
            .x(d=>xScaleRadial(d["longitude"], d["latitude"]))
            .y(d=>yScaleRadial(d["longitude"], d["latitude"]))
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
                    .attr("cx",xScaleRadial(mapCentreLon, mapCentreLat))
                    .attr("cy",yScaleRadial(mapCentreLon, mapCentreLat))
                    .attr("r",d=>scaleMiles(d))
                    .style("fill",      "none")
                    .style("stroke", "red")                     
                

            /*
            // Centre circle
            g
                .append("circle")
                .attr("cx",xScaleRadial(mapCentreLon, mapCentreLat))
                .attr("cy",yScaleRadial(mapCentreLon, mapCentreLat))
                .attr("r",20)
                .style("fill",      "none")
                .style("stroke", "red")        

            // 10 mile circle
            g
                .append("circle")
                .attr("cx",xScaleRadial(mapCentreLon, mapCentreLat))
                .attr("cy",yScaleRadial(mapCentreLon, mapCentreLat))
                .attr("r",  scaleMiles(10))
                .style("fill",      "none")
                .style("stroke", "green")

            // 20 mile circle
            g
                .append("circle")
                .attr("cx",xScaleRadial(mapCentreLon, mapCentreLat))
                .attr("cy",yScaleRadial(mapCentreLon, mapCentreLat))
                .attr("r",  scaleMiles(20))
                .style("fill",      "none")
                .style("stroke", "black")
            */
        }


        if (SHOW_STATION_CIRCLES) {
            // Get D3 selection object
            let circlesSelection = gStationCircles
                .selectAll("circle") 
                .data(data) 

            // Add the station circles to the chart
            circlesSelection
                .enter()
                .append("circle")
                .merge(circlesSelection)
                .transition()
                .duration(500)
                    .attr("cx",         d=>xScaleRadial(d["longitude"], d["latitude"]))
                    .attr("cy",         d=>yScaleRadial(d["longitude"], d["latitude"]))        
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
                    .attr("x",         d=>xScaleRadial(d["longitude"], d["latitude"]))
                    .attr("y",         d=>yScaleRadial(d["longitude"], d["latitude"])) 
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
                let linesSelection = gLines.selectAll(".line"+i).data([filteredLinesData]) 
                
                // Add the line to the chart
                linesSelection
                    .join("path")
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

    update()

    d3.select("#zoom")
        .on("change", function() {      
            sliderValue = document.getElementById("zoom").value  
            //window.alert("changed");
            scaleFactor = sliderValue
            update()
        })

}
