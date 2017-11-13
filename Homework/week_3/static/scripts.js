/* scripts.js
 * Creates a plot of the average temperature and the amount of pirates over the
 * years.
 */

'use strict';

// set data and margins and sizes
var DATA_URL = 'data/pirates_temperature.json';
var margin = {top: 100, right: 20, bottom: 30, left: 40};
var height = 400;
var barWidth = 100;

// triggers when document is fully loades
document.addEventListener('DOMContentLoaded', function() {

    // get json and draw graph
    d3.json(DATA_URL, function(error, json) {
        if (error) {
            throw error;
        }
        drawBarGraph(json, 'number of pirates');
    });
})

function drawBarGraph(json, entry) {

    // set x-scaling
    var x = d3.scaleBand()
        .rangeRound([0, barWidth * json.length]).padding(0.2)
        .domain(json.map(function(d) { return d.year; }));

    // set y-scaling
    var y = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(json, function(d) { return d[entry]; })]);

    // select svg chart and set its width and height and class
    var chart = d3.select('body').append('svg')
        .attr('class', 'chart')

        // set chart attributes
        .attr('width', barWidth * json.length + margin.left + margin.right)
        .attr('height', height + margin.top + margin. bottom);

        // append empty spacing
    var canvas = chart.append('g')
        .attr('width', barWidth * json.length)
        .attr('height', height)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create x axis
    canvas.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    // create y axis
    canvas.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y));

    // draw graph
    canvas.selectAll('.chart')
        .data(json)
        .enter().append('rect')
        .attr('class', 'chart')
        .attr('x', function(d) { return x(d.year); })
        .attr('y', 0)//function(d) { return y(d[entry]); })
        .attr('width', x.bandwidth())
        .attr('height', function(d) { return y(d[entry]); });
}