/* 
 * scripts.js
 * Author: Sebastiaan Arendsen
 * Draws a graph based on KNMI data
 */ 

// set size of plot and other constants

'use strict';
var width = 1000;
var height = 500;
const axes = 50;
const url = 'static/KNMI_19911231.txt';
const monthStrings = ['january', 'february', 'march', 'april', 'may', 'june', 
'july', 'august', 'september', 'october', 'november', 'december'];
var transform;
// var ctx;

/*
 * Main function which is executed when the page has been loaded 
 */


document.addEventListener('DOMContentLoaded', function() {
    
    var canvas = document.getElementById('graph');
    
    // initialize data request
    var dataRequest = new XMLHttpRequest();
    var data;
    
    // create a load listener
    dataRequest.addEventListener('load', function() {
        if (this.readyState == 4 && (this.status == 200 || 
            this.status == 304)) {
            var data = csvJSON(this.responseText);

            document.getElementById('height').addEventListener('change', function() {
                height = parseInt(this.value);
                writeGraph(canvas, data);
            });

            document.getElementById('width').addEventListener('change', function() {
                width = parseInt(this.value);
                writeGraph(canvas, data);
            });
            // store data as an array of objects
            writeGraph(canvas, data);        
        }

        else {
            throw 'Failed to load data.';
        }
    });

    // actually get the data
    dataRequest.open('get', url, true);
    dataRequest.send();

});


function writeGraph(canvas, data) {
// write the function data to the canvas
    
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log(height); 
    canvas.width = width + axes + 50;
    canvas.height = height + axes;
    transform = createTransform(data);

    ctx.beginPath();
    ctx.moveTo(axes, 0);
    ctx.lineTo(axes, height);
    ctx.lineTo(axes + width, height);
    ctx.stroke();

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

    writeYAxis(ctx, data);
    writeXAxis(ctx, data);
}

// write the labels on the y axis
function writeYAxis(ctx, data) {
    
    var zeroPoint = transform([0, 0]);
    ctx.textAlign = "center"; 
    
    ctx.moveTo(zeroPoint[0], zeroPoint[1]);
    ctx.lineTo(zeroPoint[0] - 10, zeroPoint[1]);
    ctx.fillText('0', zeroPoint[0] - 20, zeroPoint[1] + 3);

    var minMax = findMinMax(data);
    for (var i = 0; i < minMax[1]; i += 50) {
        var axisPoint = transform([0, i]);
        ctx.moveTo(axisPoint[0], axisPoint[1]);
        ctx.lineTo(axisPoint[0] - 10, axisPoint[1]);
        ctx.fillText(i / 10, axisPoint[0] - 20, axisPoint[1] + 3);
    }

    for (var i = -50; i > minMax[0]; i -= 50) {
        var axisPoint = transform([0, i]);
        ctx.moveTo(axisPoint[0], axisPoint[1]);
        ctx.lineTo(axisPoint[0] - 10, axisPoint[1]);
        ctx.fillText(i / 10, axisPoint[0] - 20, axisPoint[1] + 3);
    }    
    ctx.stroke();
}

function writeXAxis(ctx, data) {

    // set month to zero
    var month = 0;
    for (var i = 0; i < data.length - 1; i++) {
        if (parseInt(data[i].date.toString()[4] + 
            data[i].date.toString()[5]) != month) {
            var axisPoint = transform([i, 0]);
            ctx.moveTo(axisPoint[0], height);
            ctx.lineTo(axisPoint[0], height + 10);
            
            // 
            if (month != 0) {
                ctx.fillText(monthStrings[month], axisPoint[0], height + 30);
            }

            else {
                ctx.fillText(data[i].date.toString().slice(0, 4), axisPoint[0], 
                    height + 30);
            }
            
            if (month < 12) month++;
            else month = 0;
        }
    } 
    ctx.stroke();
}

// function to tansform coordinates
function createTransform(data) {

    // determine x-scaling
    var xScale = width / data.length;
    
    // find minimum and maximum
    var minMax = findMinMax(data);

    // get lowest y value and base scaling of y on it
    var yMin = Math.abs(Math.floor(minMax[0]));
    var yScale = -(height / (yMin + Math.ceil(minMax[1])));

    // create function
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
    return result;
}

// function to find minimum and maximum temp
function findMinMax(data) {

    // set both min and max to 0
    var min = 0;
    var max = 0;

    // search dataset for lowest and highest values
    for (var i = 0; i < data.length; i++) {
        if (data[i].temp < min) {
            min = data[i].temp;
        }
        else if (data[i].temp > max) {
            max = data[i].temp;
        }   
    
    }

    // widen the gap so 
    return [min - 10, max + 10];
}