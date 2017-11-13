/* scripts.js
 * Creates a plot of the average temperature and the amount of pirates over the
 * years.
 */

'use strict';
var DATA_URL = 'data/pirates_temperature.json';

document.addEventListener('DOMContentLoaded', function() {
    d3.json(DATA_URL, function(json) {
        drawBarGraph(json);
    })
})

function drawBarGraph(json) {
    var width = 600
        barHeight = 50;
    var chart = d3.select('.chart')
        .attr('width', width)
        .attr('height', barHeight * json.length);
    
    var x = d3.scaleLinear()
}