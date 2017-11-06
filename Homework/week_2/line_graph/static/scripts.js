// scripts.js
// Sebastiaan Arendsen
// 6060072

document.addEventListener('DOMContentLoaded', function() {     
    
    // find the canvas in the html file
    var canvas = document.getElementById('graph');
    var ctx = canvas.getContext('2d');

    // initialize 
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, 500);
    ctx.lineTo(840, 500);
    ctx.stroke();

    // var transform = createTransform([0, 369], [-100, 300]);

});

function createTransform(domain, range) {
	// domain is a two-element array of the data bounds [domainMin, domainMax]
	// range is a two-element array of the screen bounds [rangeMin, rangeMax]
	// this gives you two equations to solve:
	// rangeMin = alpha * domainMin + beta
	// rangeMax = alpha * domainMax + beta
	// a solution would be:

    var domainMin = domain[0];
    var domainMax = domain[1];
    var rangeMin = range[0];
    var rangeMax = range[1];

    // formulas to calculate the alpha and the beta
   	var alpha = (rangeMax - rangeMin) / (domainMax - domainMin);
    var beta = rangeMax - alpha * domainMax;

    // returns the function for the linear transformation (y= a * x + b)
    return function(x) {
        return alpha * x + beta;
    };
};