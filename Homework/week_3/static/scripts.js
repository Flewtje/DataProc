/* scripts.js
 * Creates a plot of the average temperature and the amount of pirates over the
 * years.
 */

'use strict';

// set data and margins and sizes
var DATA_URL = 'data/pirates_temperature.json';
var margin = {top: 10, right: 20, bottom: 30, left: 40};
var height = 400;
var barWidth = 100;

// triggers when document is fully loades
document.addEventListener('DOMContentLoaded', function() {

    // get json and draw graph
    d3.json(DATA_URL, function(json) {
        drawBarGraph(json);
    });
})

function drawBarGraph(json) {

    // set x-scaling
    var x = d3.scaleBand().rangeRound([0, barWidth * json.length]).padding(0.2)
        .domain(json.map(function(d) { return d.year; }));

    // set y-scaling
    var y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(json, function(d) { return d['number of pirates'] })]);

    // select svg chart and set its width and height
    var chart = d3.select('svg')
        .attr('width', barWidth * json.length + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom );

    // add 
    var g = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    g.selectAll('.chart')
        .data(json)
        .enter().append('rect')
        .attr('class', 'chart')
        .attr('x', function(d) { return x(d.year); })
        .attr('y', function(d) { return y(d['number of pirates']); })
        .attr('width', x.bandwidth())
        .attr('height', function(d) { return height - y(d['number of pirates']); });
}