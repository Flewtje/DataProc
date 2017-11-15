/* scripts.js
 * Creates a plot of the average temperature and the amount of pirates over the
 * years.
 */

'use strict';

// set data and margins and sizes
var DATA_URL = 'data/pirates_temperature.json';
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

document.addEventListener('DOMContentLoaded', function() {

    // get json and draw graph
    d3.json(DATA_URL, function(error, json) {

        // catch error
        if (error) {
            throw error;
        }

        for (var i = 0; i < json.length; i++) {

        }

        // draw the bar graph
        drawBarGraph(json, 'number of pirates');
    });
})

function drawBarGraph(json, entry) {

    // var x = d3.scaleQuantize()
    //     .range()
    //     .domain([d3.min(json, function(d) { return d.runtime })])

    // set x-scaling which should be a band
    var x = d3.scaleBand()

        // range goes from 0 to width and add a padding of 0.2
        .rangeRound([0, width]).padding(0.2)

        // domain is a map of all the data years
        .domain(json.map(function(d) { return d.year; }));

    // set y-scaling as linear
    var y = d3.scaleLinear()

        // range is reversed
        .range([height, 0])

        // domain is from 0 till max data-point
        .domain([0, d3.max(json, function(d) { return d[entry]; })]);

    // create svg chart and set its width and height and class
    var chart = d3.select('body').append('svg')
        .attr('class', 'chart')

        // setting width and height like this makes for simple drawing
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin. bottom)

    // append a 'g' element which groups every other child element
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create and place x-axis
    chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')

        // call a function on the axis which creates the axis for us
        .call(d3.axisBottom(x));

    // create and place y-axis
    chart.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y))

    // append title to the y-axis
    .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Amount of pirates');

    // select all will choose all class 'bar' elements, of which there are as of
    // yet 0
    chart.selectAll('.bar')

        // add data to the future bars
        .data(json)

    // add all data pieces and append a 'rect' to it, with class 'bar'
    .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.year); })
        .attr('y', function(d) { return y(d[entry]); })
        .attr('height', function(d) {return height - y(d[entry]); })
        .attr('width', x.bandwidth());
}

function type(d) {
    d.value = +d.value;
    return d;
}