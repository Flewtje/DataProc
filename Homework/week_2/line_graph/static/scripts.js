/* scripts.js
 * Author: Sebastiaan Arendsen
 * Draws a graph based on KNMI data
*/ 

// set size of plot
const width = 730;
const height = 500;
const axes = 50;


document.addEventListener('DOMContentLoaded', function() {     
    
    // find the canvas in the html file
    var canvas = document.getElementById('graph');
    var ctx = canvas.getContext('2d');
    
    // initialize data request
    const url = '/static/data/data.json';
    var dataRequest = new XMLHttpRequest();
    
    var data;
    // create a load listener
    dataRequest.addEventListener('load', function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 304)) {
            console.log(this.response.parse());
            data = this.response.parse;
        }
    });

    // actually get the data
    dataRequest.open('get', url, true);
    dataRequest.send();

    // define size of canvas
    canvas.height = height + axes;
    canvas.width = width + axes;

    // initialize axes 
    ctx.beginPath();
    ctx.moveTo(axes, 0);
    ctx.lineTo(axes, height - axes);
    ctx.lineTo(width, height - axes);
    ctx.stroke();

    var transformY = 0;
    var transformX = 0;
});

// function to tansform coordinates
function createTransform(input, output) {
    x = axes + (xScale * xIn);
    y = height - (yScale * yIn);

}

// function createTransform(domain, range) {
// 	// domain is a two-element array of the data bounds [domainMin, domainMax]
// 	// range is a two-element array of the screen bounds [rangeMin, rangeMax]
// 	// this gives you two equations to solve:
// 	// rangeMin = alpha * domainMin + beta
// 	// rangeMax = alpha * domainMax + beta
// 	// a solution would be:

//     var domainMin = domain[0];
//     var domainMax = domain[1];
//     var rangeMin = range[0];
//     var rangeMax = range[1];

//     // formulas to calculate the alpha and the beta
//    	var alpha = (rangeMax - rangeMin) / (domainMax - domainMin);
//     var beta = rangeMax - alpha * domainMax;

//     // returns the function for the linear transformation (y= a * x + b)
//     return function(x) {
//         return alpha * x + beta;
//     };
// };