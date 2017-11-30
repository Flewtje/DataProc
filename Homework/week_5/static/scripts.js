/* Sebastiaan Arendsen
 * 6060072 - Minor Programmeren
 */

'use strict';

const DATAFILE2014 = 'data/KNMI_20141231.json',
    DATAFILE2015 = 'data/KNMI_20151231.json',
    DATAFILE2016 = 'data/KNMI_20161231.json';

var margin = {top: 50, right: 30, bottom: 40, left: 250},
    height = 600 - margin.top - margin.bottom,
    width = 1300 - margin.left - margin.right,
    parseTime = d3.timeParse('%Y%m%d'),
    plotTitle = 'Temperature in De Bilt ',
    year = 0;

document.addEventListener('DOMContentLoaded', function() {

    document.title = plotTitle + '2014';

    d3.queue()
        .defer(d3.json, DATAFILE2014)
        .defer(d3.json, DATAFILE2015)
        .defer(d3.json, DATAFILE2016)
        .await(function(error, data2014, data2015, data2016) {
            if (error) throw error;

            var data = [data2014, data2015, data2016];

            var newData = [];

            for (var i = 0; i < data.length; i++) {

                var minTemp = [];
                var maxTemp = [];
                var avgTemp = [];

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

            plotLineGraphs(data, newData, year);
        });
});

function plotLineGraphs(raw, data, year) {

    console.log(raw);
    console.log(data);

    var svg = d3.select('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right);

    var chart = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain(d3.extent(raw[year], function(d) { return parseTime(d['YYYYMMDD']); }));

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([
            d3.min(data[year], function(c) { return d3.min(c.values, function(d) { return d.temp; }); }),
            d3.max(data[year], function(c) { return d3.max(c.values, function(d) { return d.temp; }); })
        ]);

    var z = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data[year].map(function(d) { return d.id; }));


    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temp); });

    chart.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    chart.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(20).tickFormat(d => d + ' °C'));

    var title = svg.append('text')
        .attr('transform', 'translate(' + (margin.left + width / 2) + ',30)')
        .attr('class', 'title')
        .attr('text-anchor', 'end')
        .text(plotTitle + (2014 + year));

    var tempSort = chart.selectAll('.sort')
        .data(data[year])
    .enter().append('g')
        .attr('class', 'sort');
        

    tempSort.append('path')
        .attr('class', 'line')
        .attr('d', function(d) { return line(d.values); })
        .style('stroke', function(d) { return z(d.id); })
        .attr('data-legend', 'test');

    var legend = svg.append('g')
            .attr('transform', 'translate(4,' + margin.top + ')');
        
    // add a group for each label needed
    var groupLegend = legend.selectAll('g')
        .data(data[year]).enter().append('g');


    groupLegend.append('rect')
        .attr('width', '20')
        .attr('height', '20')
        .attr('fill', function(d) { return z(d.id); })
        .attr('y', function(d, i) { return i * 25; });

    groupLegend.append('text')
        .attr('transform', 'translate(' + 20 + ',0)')
        .attr('y', function(d, i) { return 15 + (i * 25); })
        .attr('x', 10)
        .text(function(d) { return d.id; });
    

    d3.selectAll('.m')
        .on('click', function() {
            year = this.getAttribute('value');
            updateGraph(raw, data, year);
        })
}

function updateGraph(raw, data, year) {

    document.title = 'Temperature in De Bilt ' + (+year + 2014);

    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain(d3.extent(raw[year], function(d) { return parseTime(d['YYYYMMDD']); }));    

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([
            d3.min(data[year], function(c) { return d3.min(c.values, function(d) { return +d.temp ; }); }),
            d3.max(data[year], function(c) { return d3.max(c.values, function(d) { return +d.temp ; }); })
        ]);

    var z = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data[year].map(function(d) { return d.id; }));

    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temp); });

    var chart = d3.select('svg').select('g');

    chart.selectAll('.sort')
        .remove();

    var tempSort = chart.selectAll('.sort')
        .data(data[year])
    .enter().append('g')
        .attr('class', 'sort');

    d3.select('.title')
        .text(plotTitle + (2014 + (+year)));

    tempSort.append('path')
        .attr('class', 'line')
        .attr('d', function(d) { return line(d.values); })
        .style('stroke', function(d) { return z(d.id); });

    d3.select('.axis--x')
        .call(d3.axisBottom(x));

    d3.select('.axis--y')
        .call(d3.axisLeft(y).ticks(20).tickFormat(d => d + ' °C'));
}