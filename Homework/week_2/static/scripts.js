/* 
 * scripts.js
 * Author: Sebastiaan Arendsen
 * Draws a graph based on KNMI data
*/ 

// set size of plot and other constants

//'use strict';

const width = 730;
const height = 500;
const axes = 150;
const url = '/static/data/KNMI_19911231.txt';

/*
 * Main function which is executed when the page has been loaded 
 */
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
            var data = csvJSON(this.responseText);
            var transform = createTransform(data);
            
            // start writing data points
            ctx.beginPath();
            for (var i = 0; i < data.length; i++) {

                // transform data point and draw a line to that point
                var plotPoint = transform([i, data[i].temp]);
                // console.log(plotPoint);
                if (i == 0) ctx.moveTo(plotPoint[0], plotPoint[1]);
                else ctx.lineTo(plotPoint[0], plotPoint[1]);
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

            writeAxes(ctx, data);
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
    // ctx.transform(1, 0, 0, -1, 0, canvas.height);

    // initialize axes 
    ctx.beginPath();
    ctx.moveTo(axes, 0);
    ctx.lineTo(axes, height);
    ctx.lineTo(axes + width, height);
    ctx.stroke();

});

// write the labels on the axes
function writeAxes(ctx, data) {
    
    var transform = createTransform(data);
    var zeroPoint = transform([0, 0]);
    ctx.textAlign = "center"; 
    
    ctx.moveTo(zeroPoint[0], zeroPoint[1]);
    ctx.lineTo(zeroPoint[0] - 10, zeroPoint[1]);
    ctx.fillText('0', zeroPoint[0] - 20, zeroPoint[1] + 3);

    var minMax = findMinMax(data);
    // for (var i = 0; i < )

    
    ctx.stroke();
}



// function to tansform coordinates
function createTransform(data) {

    // determine x-scaling
    var xScale = width / data.length;
    
    var minMax = findMinMax(data);

    // get lowest y value and base scaling of y on it
    var yMin = Math.abs(Math.floor(minMax[0]));
    var yScale = -(height / (yMin + Math.ceil(minMax[1])));

    return function(date) {
        var x = axes + (xScale * date[0]);
        var y = height + (yMin + date[1]) * yScale;
        return [x, y];
    }
}

/* https://stackoverflow.com/questions/27979002/convert-csv-data-into-json-format-using-javascript
 * Using ths function we can use the raw data from KNMI.
 */
function csvJSON(csv){

    // split the file at every new line and store it in array "lines"
    var lines = csv.split('\n');
    var result = [];

    // headers can be fixed
    var headers = ['station', 'date', 'temp'];

    // "12" because this is where the actual data begins
    // cleaner would be to use a line skip on comments, but this is 
    // unnecassary for this particular case
    for (var i = 12; i < lines.length; i++) {

        var obj = {};

        // split each line at the commas
        var currentline = lines[i].split(',');

            for (var j = 0; j < headers.length; j++) {

                // parse as int
                obj[headers[j]] = parseInt(currentline[j]);
            }

        result.push(obj);
    }
    return result; //JavaScript object
}

function findMinMax(data) {
    var min = 0;
    var max = 0;
    for (var i = 0; i < data.length; i++) {
        if (data[i].temp < min) {
            min = data[i].temp;
            console.log(min);
        }
        else if (data[i].temp > max) {
            max = data[i].temp;
            console.log(max);
        }
    }
    return [min, max];
}