/* scripts.js
 * Creates a plot of the 
 */

'use strict';

// set data and margins and sizes
var DATA_URL = 'data/topmovies.json';
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    xStep = 5;

document.addEventListener('DOMContentLoaded', function() {

    // get json and draw graph
    d3.json(DATA_URL, function(error, json) {

        // catch error
        if (error) {
            throw error;
        }

        // create data based on runtime rounded down to nearest five
        var data = d3.nest()
            .key(function(d) { return Math.floor(d.Runtime / xStep) * xStep; })
            .rollup(function(d) { return d.length; })
            .entries(json)

            // sort the data ascending
            .sort(function(a, b) { return a.key - b.key; });

        // draw the bar graph
        drawBarGraph(data, 'key', xStep, 'value', 'Average runtime of IMDB top 250 movies.');
    });
})

function drawBarGraph(data, xKey, xStep, yKey, name) {

    // get an array of min and max data
    var xMinMax = d3.extent(data, function(d) {
        return parseInt(d[xKey]);
    });

    // set x scaling as band
    var x = d3.scaleBand()

        // range goes from 0 to width and add a padding of 0.2
        .rangeRound([0, width]).padding(0.1)

        // domain is a map of all the data years
        .domain(d3.range(xMinMax[0], xMinMax[1] + xStep, xStep));

    // set y-scaling as linear
    var y = d3.scaleLinear()

        // range is reversed
        .rangeRound([height, 0])

        // domain is from 0 till max data-point
        .domain([0, d3.max(data, function(d) { return d[yKey]; })]);

    // initialize tooltip
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([5, 0])
        .html(function(d) { return "Frequency: " + d[yKey]; });

    // create svg chart and set its width and height and class
    var chart = d3.select('body').append('svg')
        .attr('class', 'chart')

        // setting width and height like this makes for simple drawing
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin. bottom)
        .call(tip)

    // append a 'g' element which groups every other child element
    var canvas = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create and place x-axis
    canvas.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')

        // call a function on the axis which creates the axis for us
        .call(d3.axisBottom(x));

    // create and place y-axis
    canvas.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y));

    // append title to the screen in the top margin
    chart.append('text')
        .attr('transform', 'translate(' + (width * 0.5 + margin.left) + ',0)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(name);

    /* Select all will choose all class 'bar' elements, of which there are as of
     * yet 0. Doing it this way allows us to add bar elements which we can all 
     * update from the same place after adding data to it.
     */
    canvas.selectAll('.bar')

        // add data to the future bars
        .data(data)

    // add all data pieces and append a 'rect' to it, with class 'bar'
    .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d[xKey]); })
        .attr('y', function(d) { return y(d[yKey]); })
        .attr('height', function(d) {return height - y(d[yKey]); })
        .attr('width', x.bandwidth())
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
}

function type(d) {
    d = +d;
    return d;
}