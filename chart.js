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

    // Where we want radius lines
    let mileRadiusData = [5, 10, 15, 20]

 
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


    // D3 update function
    // -------------------------------------------------------------------------        
    function update(scaleFactor) { 
        console.log("update")
        // Adjust scale factor when redrawn
        if (scaleFactor!=undefined)   
            mapScale.scaleFactor = scaleFactor

        // Enter, update or exit radius lines
        if (SHOW_MILE_RADIUS_LINES) {
            updateMileRadiusLines(gMilesRadii, mileRadiusData, mapScale)
            updateMileRadiusLines2(gMilesRadii, mileRadiusData, mapScale) 
        }
        else {
            removeMileRadiusLines(gMilesRadii)
        }

        // Enter, update or exit station circles
        if (SHOW_STATION_CIRCLES) {
            updateStationCircles(gStationCircles, data, mapScale)
        }
        else {
            removeMileRadiusLines(gStationCircles)
        }

        // Enter, update or exit station names
        if (SHOW_STATION_NAMES) {
            updateStationNames(gStationNames, data, mapScale)
        }
        else {
            removeStationNames(gStationNames)
        }

        // Enter, update or exit lines
        if (SHOW_LINES) { 
            updateLines(gLines, linesData, uniqueLines, mapScale)
        }
        else {
            removeMileRadiusLines(gLines)
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

    d3.select("#radial")
        .on("click", function() {   
            scaleFactor = document.getElementById("zoom").value 
            update(scaleFactor)            
        })   

    d3.select("#outercircle")
        .on("click", function() {   
            scaleFactor = -1
            update(scaleFactor)            
        })      
        

    d3.select("#stations")
        .on("click", function() {   
            SHOW_STATION_CIRCLES = document.getElementById("stations").checked 
            update()            
        })      
     
    d3.select("#names")
        .on("click", function() {   
            SHOW_STATION_NAMES = document.getElementById("names").checked 
            update()            
        })    
        
    d3.select("#lines")
        .on("click", function() {   
            SHOW_LINES = document.getElementById("lines").checked 
            update()            
        })           

    d3.select("#circles")
        .on("click", function() {   
            SHOW_MILE_RADIUS_LINES = document.getElementById("circles").checked 
            console.log(SHOW_MILE_RADIUS_LINES)
            update()            
        })           

}
