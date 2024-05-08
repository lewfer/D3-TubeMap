/*
 * helpers.js
 *
 * Helper functions
 */

// Measure distance between two geo coordinates
// From https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
function distanceKm(lat1, lon1, lat2, lon2) { 
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d // km
}

// Convert cartesian to polar coordinates
//https://observablehq.com/@thuvee0pan/cartesian-and-polar-coordinates
function cartesian_to_polar({x, y}) {
    return { 
      r: Math.sqrt(x * x + y * y), 
      theta: Math.atan2(y, x) 
    };
}

// Convert polar to cartesian coordinates
function polar_to_cartesian({r, theta}) {
    return { 
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    };
}      

// General scaling function
// Scales value which is in domain fromMin-fromMax to the range toMin-toMax
function scale (value, fromMin, fromMax, toMin, toMax) {
    return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
}


// Various easing functions
function ease(t, scaleFactor) {
    //return 0                          // push all to inner circle
    //return 1                          // push all to outer circle

    if (scaleFactor==1)
        return t                          // no scale
    else if (scaleFactor==2)
        return t*(2-t)                    // out quad
    else if (scaleFactor==3)
        return (--t)*t*t+1                // out cubic
    else if (scaleFactor==4)
        return  1-(--t)*t*t*t             // out quart
    else if (scaleFactor==5)
        return  1+(--t)*t*t*t*t             // out quint
}

