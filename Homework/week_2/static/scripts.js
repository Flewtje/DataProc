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
        if (this.readyState == 4 && (this.status == 200 || 
            this.status == 304)) {

            // store data as an array of objects
            var data = JSON.parse(this.responseText);
            var transform = createTransform(data);
            ctx.moveTo(axes, axes);
            for (var i = 0; i < data.length; i++) {
                var temp = data[i].temp;
                var date = i;
                var plotPoint = transform([date, temp]);
                ctx.lineTo(plotPoint[0], plotPoint[1]);
            }
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
    ctx.moveTo(axes, axes);
    ctx.lineTo(axes, axes + height);
    ctx.moveTo(axes, axes);
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