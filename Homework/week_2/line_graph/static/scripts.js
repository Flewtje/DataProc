// scripts.js
// Sebastiaan Arendsen
// 6060072

document.addEventListener('DOMContentLoaded', function() {     
    
    // find the canvas in the html file
    var canvas = document.getElementById('graph');
    var ctx = canvas.getContext('2d');

    // temporary filling
    ctx.fillStyle = 'rgb(0,0,200)';
    ctx.fillRect(10, 10, 55, 55);

    // create a correct instance of the transform function
    var transform = createTransform([0, 369], [-100, 300]);

});

function createTransform(domain, range) {
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
	// a solution would be:

    var domain_min = domain[0];
    var domain_max = domain[1];
    var range_min = range[0];
    var range_max = range[1];

    // formulas to calculate the alpha and the beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min);
    var beta = range_max - alpha * domain_max;

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    };
};