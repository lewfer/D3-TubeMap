/*
 * helpers.js
 *
 * Helper functions
 */


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
function ease(d, scaleFactor) {
    //return 0                          // push all to inner circle
    //return 1                          // push all to outer circle

    if (scaleFactor==1)
        return d                          // no scale
    else if (scaleFactor>=2 && scaleFactor <=8)       
        return 1 - Math.pow(1 - d, scaleFactor);// out quad (2), cubic (3), quart (4), quint (5), etc
    else if (scaleFactor==9)
        return  Math.sqrt(1 - Math.pow(d - 1, 2));
    else if (scaleFactor==10)
        return Math.sin((d * Math.PI) / 2);
    else if (scaleFactor==11) {
        if (d<0.3)
            return d*2                  // stretch middle third into half radius
        else if (d>=0.3 && d<0.6)
            return 0.5+(d-0.3)          // next third into third radius
        else 
            return 0.8+(d-0.6)*.2       // final third into 1/5th radius
    }
}

