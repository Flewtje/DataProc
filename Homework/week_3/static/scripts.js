/* scripts.js
 * Sebastiaan Arensden 6060072
 * Data Processing - Minor Programmeren 
 * Creates a plot of the runtime distribution of the IMDB top 250 movies.
 */

'use strict';

// set data and margins and sizes
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    height = 500 - margin.top - margin.bottom,
    width = 960 - margin.left - margin.right,
    xStep = 5,
    plotValue = 'Runtime',
    plotName = 'Runtime distribution of IMDB top 250 movies.',
    PADDING = 0.1,
    MAXLETTER = 35,

    // this is the data gained with the crawler from week 1
    DATA_URL = 'data/topmovies.json';

document.addEventListener('DOMContentLoaded', function() {

    // set title of document
    document.title = plotName;

    // get json and draw graph
    d3.json(DATA_URL, function(error, json) {

        // catch error
        if (error) {
            throw error;
        }

        // create data based on runtime rounded down to nearest xStep
        var data = d3.nest()
            .key(function(d) { return Math.floor(d[plotValue] / xStep) * xStep; })

            // value should be the amount of entries in key
            .entries(json)

            // sort the data ascending
            .sort(function(a, b) { return a.key - b.key; });

        // draw the bar graph
        drawBarGraph(data, xStep, 'Title');
    });
});

/* Function that will actually write the graph. It will plot the x value on 
 * the x-axis in steps of xStep accumulated.
 * tipData: the attribute which shall be printed on the tooltip
 * data: Array of nested JSONS
 */

function drawBarGraph(data, xStep, tipData) {

    // get an array of min and max data
    var xMinMax = d3.extent(data, function(d) {
        return parseInt(d.key);
    });

    // set x scaling as band
    var x = d3.scaleBand()

        // range goes from 0 to width and add a padding
        .rangeRound([0, width]).padding(PADDING)

        // domain is a map of all the data years
        .domain(d3.range(xMinMax[0], xMinMax[1] + xStep, xStep));

    // set y-scaling as linear
    var y = d3.scaleLinear()

        // range is reversed
        .rangeRound([height, 0])

        // domain is from 0 till max data-point
        .domain([0, d3.max(data, function(d) { return d.values.length; })]);

    // initialize tooltip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([5, 0])
        .direction('s')
        .html(function(d) { 
            var rv = 'Movies: <br>'
            for (var i = 0; i < d.values.length; i++) {
                rv += d.values[i][tipData].substr(0, MAXLETTER) + '<br>';
            }
            return rv;
        });

    // create svg chart and set its width and height and class
    var svg = d3.select('body').append('svg')
        // .attr('class', 'chart')

        // setting width and height like this makes for simple drawing
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin. bottom)
        .call(tip)

    // append a 'g' element which groups every other child element
    var chart = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create and place x-axis
    chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')

        // call a function on the axis which creates the axis for us
        .call(d3.axisBottom(x))
    
    // create and place y-axis
    chart.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y));

    // add x-axis label to the bottom right margin
    svg.append('text')
        .attr('class', 'label')
        .attr('transform', 'translate(' + (width + margin.left) + ', ' + (margin.top + margin.bottom + height) + ')')
        .style('text-anchor', 'end')
        .text('Runtime');


    // append title to the screen in the top margin
    svg.append('text')
        .attr('class', 'title')
        .attr('transform', 'translate(' + (width * 0.5 + margin.left) + ',0)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .text(plotName);

    /* Select all will choose all class 'bar' elements, of which there are as of
     * yet 0. Doing it this way allows us to add bar elements which we can all 
     * update from the same place after adding data to it.
     */
    chart.selectAll('.bar')

        // add data to the future bars
        .data(data)

    // add all data pieces and append a 'rect' to it, with class 'bar'
    .enter().append('rect')
        .attr('class', 'bar')

        // place the bars
        .attr('x', function(d) { return x(d.key); })
        .attr('y', function(d) { return y(d.values.length); })
        .attr('height', function(d) {return height - y(d.values.length); })
        .attr('width', x.bandwidth())

        // add tooltip interactivity
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
}