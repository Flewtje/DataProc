/* Sebastiaan Arendsen
 * 6060072 - Minor Programmeren
 * 
 */

'use strict';

// datafiles
const DATAFILE2014 = 'data/KNMI_20141231.json',
    DATAFILE2015 = 'data/KNMI_20151231.json',
    DATAFILE2016 = 'data/KNMI_20161231.json';

// global variables
var margin = {top: 50, right: 30, bottom: 40, left: 250},
    height = 600 - margin.top - margin.bottom,
    width = 1300 - margin.left - margin.right,
    parseTime = d3.timeParse('%Y%m%d'),
    plotTitle = 'Temperature in De Bilt ',
    firstYear = 2014,
    year = 0;

document.addEventListener('DOMContentLoaded', function() {

    // set document title
    document.title = plotTitle + (firstYear + year);

    // create q for data retrieval
    d3.queue()
        .defer(d3.json, DATAFILE2014)
        .defer(d3.json, DATAFILE2015)
        .defer(d3.json, DATAFILE2016)

        // execute when done
        .await(function(error, data2014, data2015, data2016) {
            if (error) throw error;

            // merge data and create new empty list
            var data = [data2014, data2015, data2016];
            var newData = [];

            // loop over all years
            for (var i = 0; i < data.length; i++) {
                var minTemp = [];
                var maxTemp = [];
                var avgTemp = [];

                // split data into different temp
                data[i].forEach(function(d, i) {
                    minTemp.push({
                        'date': parseTime(d['YYYYMMDD']),
                        'temp': parseInt(d.TN) / 10
                    });

                    maxTemp.push({
                        'date': parseTime(d['YYYYMMDD']),
                        'temp': parseInt(d.TX) / 10
                    });

                    avgTemp.push({
                        'date': parseTime(d['YYYYMMDD']),
                        'temp': parseInt(d.TG) / 10
                    });

                });
                    // add it to new list
                    newData.push([
                    {
                        id: 'Minimum Temperature', values: minTemp
                    }, 
                    {
                        id: 'Average Temperature', values: avgTemp
                    },
                    {
                        id: 'Maximum Temperature', values: maxTemp
                    }]);

                }

            // perform plot
            plotLineGraphs(data, newData, year);
        });
});

/* Function to create the multi-line plot.
 */
function plotLineGraphs(raw, data, year) {

    // select svg and apply dimensions
    var svg = d3.select('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right);

    // create a chart group and place it outside margins
    var chart = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create x scaling as time based
    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain(d3.extent(raw[year], function(d) { return parseTime(d['YYYYMMDD']); }));

    // create temp scaling as linear
    var y = d3.scaleLinear()
        .range([height, 0])

        // domain is buried in data[year][i].values.temp
        .domain([
            d3.min(data[year], function(c) { return d3.min(c.values, function(d) { return d.temp; }); }),
            d3.max(data[year], function(c) { return d3.max(c.values, function(d) { return d.temp; }); })
        ]);

    // color scaling
    var z = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data[year].map(function(d) { return d.id; }));

    // function to create a line
    var line = d3.line()
        .curve(d3.curveBasis)

        // x = date, y = temp
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temp); });

    // create x axis
    chart.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    // create y axis
    chart.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(20).tickFormat(d => d + ' °C'));

    // place title above plot
    var title = svg.append('text')
        .attr('transform', 'translate(' + (margin.left + width / 2) + ',30)')
        .attr('class', 'title')
        .attr('text-anchor', 'end')
        .text(plotTitle + (firstYear + year));

    // add data to seperate groups
    var tempSort = chart.selectAll('.sort')
        .data(data[year])
    .enter().append('g')
        .attr('class', 'sort');
        
    // add a path to the plot groups
    tempSort.append('path')
        .attr('class', 'line')
        .attr('d', function(d) { return line(d.values); })
        .style('stroke', function(d) { return z(d.id); })
        .attr('data-legend', 'test');

    // create a group for the legend
    var legend = svg.append('g')
        .attr('transform', 'translate(4,' + margin.top + ')');
        
    // add a group for each label needed
    var groupLegend = legend.selectAll('g')
        .data(data[year]).enter().append('g');

    // add colored squares for the legend
    groupLegend.append('rect')
        .attr('width', '20')
        .attr('height', '20')
        .attr('fill', function(d) { return z(d.id); })
        .attr('y', function(d, i) { return i * 25; });

    // add text for the legend
    groupLegend.append('text')
        .attr('transform', 'translate(' + 20 + ',0)')
        .attr('y', function(d, i) { return 15 + (i * 25); })
        .attr('x', 10)
        .text(function(d) { return d.id; });
    
    // add listener for data change
    d3.selectAll('.m')
        .on('click', function() {
            year = this.getAttribute('value');
            updateGraph(raw, data, year);
        })

    // draw line at zero
    drawZeroLine(y);
}

function drawZeroLine(y) {

    // remove previous zero line
    d3.select('.zero')
        .remove();

    // add new zero line
    var zero = d3.select('svg').append('line')
        .attr('x1', margin.left)
        .attr('y1', y(0) + margin.top)
        .attr('x2', margin.left + width)
        .attr('y2', y(0) + margin.top)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5, 5')
        .attr('stroke', 'black')
        .attr('class', 'zero');
}

/* Update the graph with data from another year
 *
 */
function updateGraph(raw, data, year) {

    // refresh document title
    document.title = 'Temperature in De Bilt ' + (+year + firstYear);

    // refresh x scaling
    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain(d3.extent(raw[year], function(d) { return parseTime(d['YYYYMMDD']); }));    

    // refresh y scaling
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([
            d3.min(data[year], function(c) { return d3.min(c.values, function(d) { return +d.temp ; }); }),
            d3.max(data[year], function(c) { return d3.max(c.values, function(d) { return +d.temp ; }); })
        ]);

    // refresh color scaling
    var z = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data[year].map(function(d) { return d.id; }));

    // refresh line function
    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temp); });

    // select chart
    var chart = d3.select('svg').select('g');

    // remove old data
    chart.selectAll('.sort')
        .remove();

    // add new data
    var tempSort = chart.selectAll('.sort')
        .data(data[year])
    .enter().append('g')
        .attr('class', 'sort');


    // refresh title
    d3.select('.title')
        .text(plotTitle + (firstYear + (+year)));

    // plot graph paths
    tempSort.append('path')
        .attr('class', 'line')
        .attr('d', function(d) { return line(d.values); })
        .style('stroke', function(d) { return z(d.id); });

    // set x-axis
    d3.select('.axis--x')
        .call(d3.axisBottom(x));

    // set y-axis
    d3.select('.axis--y')
        .call(d3.axisLeft(y).ticks(20).tickFormat(d => d + ' °C'));

    // add zero line
    drawZeroLine(y);   
    
}