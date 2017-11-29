/* Sebastiaan Arendsen
 * 6060072 - Minor Programmeren
 * 
 */

const DATAFILE = 'data/data.json',
    PLOTTITLE = 'Temperature in De Bilt';

var margin = {top: 50, right: 30, bottom: 40, left: 50},
    height = 600 - margin.top - margin.bottom,
    width = 1300 - margin.left - margin.right,
    parseTime = d3.timeParse('%Y%m%d')
    year = '2014';

document.addEventListener('DOMContentLoaded', function() {

    document.title = PLOTTITLE;

    d3.json(DATAFILE, function(error, data) {
        if (error) throw error;

        minTemp = [];
        maxTemp = [];
        avgTemp = [];
        data.forEach(function(d, i) {

            minTemp.push({
                'date': parseTime(d['YYYYMMDD']),
                'temp': d.TN
            });

            maxTemp.push({
                'date': parseTime(d['YYYYMMDD']),
                'temp': d.TX
            });

            avgTemp.push({
                'date': parseTime(d['YYYYMMDD']),
                'temp': d.TG
            });

        });

        var new_data = [
        {
            id: 'TN', values: minTemp
        }, 
        {
            id: 'TG', values: avgTemp
        },
        {
            id: 'TX', values: maxTemp
        }];

        plotLineGraphs(data, new_data, year);
    });
});

function plotLineGraphs(raw, data, year) {

    console.log(data);

    console.log(raw);

    var svg = d3.select('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right);

    var chart = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain(d3.extent(raw, function(d) { return parseTime(d['YYYYMMDD']); }));

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([
            d3.min(data, function(c) { return d3.min(c.values, function(d) { return parseInt(d.temp); }); }),
            d3.max(data, function(c) { return d3.max(c.values, function(d) { return parseInt(d.temp); }); })
        ]);

    var z = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(function(d) { return d.id; }));


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
        .call(d3.axisLeft(y));

    var tempSort = chart.selectAll('.city')
        .data(data)
    .enter().append('g')
        .attr('class', 'city');

    tempSort.append('path')
        .attr('class', 'line')
        .attr('d', function(d) { return line(d.values); })
        .style('stroke', function(d) { return z(d.id); });
}