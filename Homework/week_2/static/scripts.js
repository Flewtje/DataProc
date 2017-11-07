/* scripts.js
 * Author: Sebastiaan Arendsen
 * Draws a graph based on KNMI data
*/ 

// set size of plot
const width = 730;
const height = 500;
const axes = 150;
const url = '/static/data/data.json';


document.addEventListener('DOMContentLoaded', function() {
    
    // find the canvas in the html file
    var canvas = document.getElementById('graph');
    var ctx = canvas.getContext('2d');

    // initialize data request
    var dataRequest = new XMLHttpRequest();
    var data;
    
    // create a load listener
    dataRequest.addEventListener('load', function() {
        if (this.readyState == 4 && (this.status == 200 || 
            this.status == 304)) {

            // store data as an array of objects
            var data = JSON.parse(this.responseText);
            var transform = createTransform(data);
            
            // move to (0, 0) as this gives the least amount of "glitchy"
            // behaviour
            ctx.beginPath();
            ctx.moveTo(axes, axes);
            for (var i = 0; i < data.length; i++) {

                // transform data point and draw a line to that point
                var plotPoint = transform([i, data[i].temp]);
                ctx.lineTo(plotPoint[0], plotPoint[1]);
            }

            // draw a dashed line at y = 0 
            var zeroPoint = transform([0, 0]);
            ctx.moveTo(zeroPoint[0], zeroPoint[1]);
            
            // loop over i and j
            var i, j;
            for (i = 0, j = 0; i <= data.length; j++, 
                
                // arbitrary jump space for dashed line
                i += (data.length / 22)) {
                
                // transform the place to actual coordinates
                zeroPoint = transform([i, 0]);
                if (j % 2 == 1) {
                    ctx.lineTo(zeroPoint[0], zeroPoint[1]);
                }
                else {
                    ctx.moveTo(zeroPoint[0], zeroPoint[1]);
                }
            }

            // actually draw the lines
            ctx.stroke();
        }

        else {
            throw 'Failed to load data.';
        }
    });

    // actually get the data
    dataRequest.open('get', url, true);
    dataRequest.send();

    // define size of canvas
    canvas.height = height + axes;
    canvas.width = width + axes;

    // flip the y-axis and move the canvas
    ctx.transform(1, 0, 0, -1, 0, canvas.height);

    // initialize axes 
    ctx.beginPath();
    ctx.moveTo(axes, axes + height);
    ctx.lineTo(axes, axes);
    ctx.lineTo(axes + width, axes);
    ctx.stroke();

});

// write the labels on the axes
function writeAxes(context, data) {
    return undefined;
}

// function to tansform coordinates
function createTransform(data) {
    var xScale = width / data.length;
    
    var min = 0;
    var max = 0;
    for (var i = 0; i < data.length; i++) {
        if (data[i].temp < min) {
            min = data[i].temp;
        }
        else if (data[i].temp > max) {
            max = data[i].temp;
        }
    }

    var yMin = Math.abs(Math.floor(min));
    var yScale = height / (yMin + Math.ceil(max));

    return function(date) {
        var x = axes + (xScale * date[0]);
        var y = axes + (yMin + date[1]) * yScale;
        var newDate = [x, y];
        return newDate;
    }
}