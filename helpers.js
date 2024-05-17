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

// // Takes a SVG d path descriptor and draws lines perpendicular to the line at the end points
// // E.g. d could be 
// // M-345.3,85.5C-345.37,85.5,-368.6,101.4,-374.1,98.7C-378.8,96.5,-379.7,77.3,-379.7,77.3
// function curveMarkers(d) {
//     let markers = []
//     const cs = d.split("C");
//    // console.log(cs)

//     // Loop through the Cs (skip first one which is an M)
//     for (let i=1; i<cs.length; i++) {
//         let coords = cs[i].split(",")
//         console.log(coords)

//         // For first curve we want the starting coord
//         if (i==1) {
//             let x = coords[0]
//             let y = coords[1]
//             let x1 = coords[2]
//             let y1 = coords[3]
//             let gradient = (y-y1)/(x-x1)
//             markers.push({x:x, y:y, g:gradient})                
//         }

//         // Get the ending coord
//         //console.log(ss.pop())
//         // let y = coords.pop()
//         // let x = coords.pop()
//         // let lastCoord = markers[markers.length-1]        
//         //let gradient = (y-lastCoord.y)/(x-lastCoord.x)
//         let x = coords[4]
//         let y = coords[5]
//         let x1 = coords[2]
//         let y1 = coords[3]
//         console.log(x,y,x1,y1)    
//         let gradient = (y-y1)/(x-x1)
//         markers.push({x:x, y:y, g:gradient})
//     }
//     return markers
// }
      // Takes a SVG d path descriptor and draws lines perpendicular to the line at the end points
      // Example: d could be
      // "M100,100C125,200,175,200,200,100C175,200,225,0,200,100C225,0,275,0,300,100"
      function makeCurveMarkers(d) {
        let markers = [];

        // Remove the "Move" command and split up the curves
        d = d.replace("M", "");
        const cs = d.split("C");
        //console.log(cs)
        // Example: cs is now ["100,100",
        //                     "125,200,175,200,200,100",
        //                     "175,200,225,0,200,100",
        //                     "225,0,275,0,300,100"]

        // Get the first point's coordinates
        let firstCoord = cs[0].split(",");
        let x = +firstCoord[0]; // Example:100
        let y = +firstCoord[1]; // Example:100

        // Loop through remaining items in cs
        for (let i = 1; i < cs.length; i++) {
          // Split individual coordinates
          let coords = cs[i].split(",");
          console.log(coords);
          // Example: coords is now ["125","200","175","200","200","100"]

          // Get the first control point
          let cx = +coords[0]; // Example: 125
          let cy = +coords[1]; // Example:200

          // If coord and control point are identical, move to next control point
          if (cx - x == 0 && cy - y == 0) {
            cx = +coords[2];
            cy = +coords[3];
          }

          // Compute gradient of a line from the point point to the control point
          let gradient;
          if (cx - x == 0) gradient = 0;
          else gradient = (cy - y) / (cx - x);

          // Save the point and gradient at that point
          markers.push({ x: x, y: y, g: gradient });

          // Get the second control point
          let cx2 = +coords[2]; // Example:175
          let cy2 = +coords[3]; // Example:200

          // Get the next point's coordinates
          x = +coords[4]; // Example:200
          y = +coords[5]; // Example:100

          // If coord and control point identical, move to prev control point
          if (cx2 - x == 0 && cy2 - y == 0) {
            cx2 = +coords[0];
            cy2 = +coords[1];
          }

          // Compute gradient of point to control point
          if (cx2 - x == 0) gradient = 0;
          else gradient = (cy2 - y) / (cx2 - x);

          // Save the point and gradient at that point
          markers.push({ x: x, y: y, g: gradient });
        }
        return markers;
      }

      function computeXFromGradient(gradient, hypotenuse) {
        let alpha = Math.atan(gradient);
        let x = hypotenuse * Math.sin(alpha);
        return x;
      }
      function computeYFromGradient(gradient, hypotenuse) {
        let alpha = Math.atan(gradient);
        let y = hypotenuse * Math.cos(alpha);
        return y;
      }      
