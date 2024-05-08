/*
 * chart.js
 *
 * Tube map with D3.
 * Plots a map of tube stations and lines, with non-linear scaling so centre can be zoomed in more than outer edges.
 */


async function drawChart(container, dataFile) {
    // Load the data and convert numbers
    const data = await d3.csv(dataFile);
    data.forEach(d=>{
        d.latitude = parseFloat(d.latitude), 
        d.longitude = parseFloat(d.longitude) 
    });


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
    let maxRadius = Math.max(PLOT.WIDTH/2, PLOT.HEIGHT/2)               // edge of longest dimension


    // Add the svg element, in which we will draw the chart, to the container
    let svg = d3.select(container).append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .style('border', "1px solid black")

        
    let scaleFactor = 1

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
        if (d.name=="Covent Garden")
            return "red"
        else
            return "black"
    }
 


    // Add a group
    let g = svg  
        .append("g")  
        .attr("transform", "translate("+PLOT.MIDX+","+PLOT.MIDY+")") 
    
        // Centre circle
    g
        .append("circle")
        .attr("cx",xScaleRadial(mapCentreLon, mapCentreLat))
        .attr("cy",yScaleRadial(mapCentreLon, mapCentreLat))
        .attr("r",20)
        .style("fill",      "red")
        .style("stroke", "black")        

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

    // Get D3 selection object
    let selection = g
        .selectAll("circle") 
        .data(data) 

    // Add the station circles to the chart
    selection
        .enter()
        .append("circle")
            .attr("cx",         d=>xScaleRadial(d["longitude"], d["latitude"]))
            .attr("cy",         d=>yScaleRadial(d["longitude"], d["latitude"]))        
            .attr("r",          5)
            .style("fill",      d=>scaleColour(d))
            .style("opacity",   1)


    // Add the station names to the chart
    selection
    .enter()
    .append("text")
        .attr("x",         d=>xScaleRadial(d["longitude"], d["latitude"]))
        .attr("y",         d=>yScaleRadial(d["longitude"], d["latitude"])) 
        .style("fill",      "black")
        .style("opacity",   1)
        .attr("class",     "station")
        .html(d=>d["name"])

}


        