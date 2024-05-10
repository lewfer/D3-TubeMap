/*
 * MapScale
 * Class to manage all the map aspects, like zoomin, mapping to pixels, etc
 */

class MapScale {
    // Create a MapScale for the given area
    constructor(minLon, maxLon, minLat, maxLat) {
        this.minLon = minLon
        this.maxLon = maxLon
        this.minLat = minLat
        this.maxLat = maxLat

        // Compute the mid point
        this.midLon = this.minLon + (this.maxLon - this.minLon)/2
        this.midLat = this.minLat + (this.maxLat - this.minLat)/2     
        
        // Default to no scale
        this.scaleFactor = 1
    }

    // Set the centre point of the map
    setCentre(centreLon, centreLat) {
        this.centreLon = centreLon
        this.centreLat = centreLat
    }

    // Expand the edges of the map so the centre is actually at the centre
    expandAroundCentre() {
        // Adjust longitude range so centre is at centre of range
        let lonOffset = this.centreLon-this.midLon
        if (lonOffset>0) {
            this.maxLon = this.maxLon+lonOffset*2; 
            this.midLon = this.minLon + (this.maxLon - this.minLon)/2
        }
        else {
            this.minLon = this.minLon-(-lonOffset)*2; 
            this.midLon = this.minLon + (this.maxLon - this.minLon)/2
        }

        // Adjust latitude range so centre is at centre of range
        let latOffset = this.centreLat-this.midLat
        if (latOffset>0) {
            this.maxLat = this.maxLat+latOffset*2; 
            this.midLat = this.minLat + (this.maxLat - this.minLat)/2
        }
        else {
            this.minLat = this.minLat-(-latOffset)*2; 
            this.midLat = this.minLat + (this.maxLat - this.minLat)/2
        }
    }

    // Measure distance between two geo coordinates
    // From https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
    distanceKm(lat1, lon1, lat2, lon2) { 
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

    // Get the width of the map in km
    widthKm() {
        return this.distanceKm(this.midLat, this.minLon, this.midLat, this.maxLon) 
    }

    // Get the height of the map in km
    heightKm() {
        return this.distanceKm(this.minLat, this.midLon, this.maxLat, this.midLon) 
    }

    // Set screen width and adjust height accordingly
    setScreenWidth(w) {
        // Fix the screen width
        this.screenWidth = w

        // Compute the screen height so the pixels km-pixel scale is the same horizontally and vertically
        this.screenHeight = w*this.heightKm()/this.widthKm()

        // Compute the mid point
        this.screenMidX = this.screenWidth/2
        this.screenMidY = this.screenHeight/2

        // Create functions to scale longitude and latitude to pixels
        this.scaleLonToScreenX = d=>scale(d, this.minLon, this.maxLon, -this.screenWidth/2,  this.screenWidth/2) 
        this.scaleLatToScreenY = d=>scale(d, this.minLat, this.maxLat, this.screenHeight/2, -this.screenHeight/2) 

        // Create functions to scale km and miles to pixels
        let pixPerKm = this.screenWidth / this.widthKm()
        this.scaleKm = km=>{let pix = km*pixPerKm; return this.maxRadius*ease(pix/this.maxRadius,this.scaleFactor)}
        this.scaleMiles = mi=>{let pix = mi*1.60934*pixPerKm; return this.maxRadius*ease(pix/this.maxRadius,this.scaleFactor)}

        // Compute max radius of the map for polar coords
        //let maxRadius = Math.min(PLOT.WIDTH/2, PLOT.HEIGHT/2)               // distance from centre to edge of shortest dimension
        this.maxRadius = Math.max(this.screenWidth/2, this.screenHeight/2)               // distance from centre to edge of longest dimension
        this.radiusX = this.screenWidth/2
        this.radiusY = this.screenHeight/2
        // let radiusX = Math.sqrt((PLOT.WIDTH/2)*(PLOT.WIDTH/2)+(PLOT.HEIGHT/2)*(PLOT.HEIGHT/2)) // distance from centre to corner
        // let radiusY = radiusX        
    }

    // getPixPerKm() {
    //     return this.screenWidth / this.widthKm()
    // }

    // Scale the longitude non-linearly from the centre 
    // Uses easing function to create non-linear scaling
    xScaleRadial(lon, lat) {
        let x = this.scaleLonToScreenX(lon)
        let y = this.scaleLatToScreenY(lat)
        //console.log(x)
        let polar = cartesian_to_polar({x:x, y:y})
        console.log(this.radiusX)
        console.log(polar.r)
        if (polar.r<this.radiusX)
            polar.r = this.radiusX*ease(polar.r/this.radiusX, this.scaleFactor)
        let cartesian = polar_to_cartesian(polar)
        //console.log(cartesian.x)
        return cartesian.x
    }

    // Scale the latitude non-linearly from the centre 
    // Uses easing function to create non-linear scaling
    yScaleRadial(lon, lat) {
        let x = this.scaleLonToScreenX(lon)
        let y = this.scaleLatToScreenY(lat)
        let polar = cartesian_to_polar({x:x, y:y})
        if (polar.r<this.radiusY)
            polar.r = this.radiusY*ease(polar.r/this.radiusY, this.scaleFactor)
        let cartesian = polar_to_cartesian(polar)
        return cartesian.y
    }    
}