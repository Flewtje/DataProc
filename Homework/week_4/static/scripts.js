/* Sebastiaan Arendsen
 * 6060072
 * scripts.js
 */

'use strict';

var margin = {top: 50, right: 30, bottom: 30, left: 40},
    height = 500 - margin.top - margin.bottom,
    width = 960 - margin.left - margin.right,
    padding = 0.1,
    DATA_URL_RELIGION = 'data/religion.json',
    DATA_URL_GDP = 'data/gdppc.json',
    TEST_SVG = 'data/test.csv',
    years = ['1965', '1970', '1975', '1980', '1985', '1990', '1995', 
        '2000', '2005', '2010'],
    year = years[7];

document.addEventListener('DOMContentLoaded', function() {

    // make a queue to load both datasets before executing code
    var q = d3.queue()
        .defer(d3.json, DATA_URL_RELIGION)
        .defer(d3.json, DATA_URL_GDP)

        // when queue is cleared execute code
        .await(function(error, json_religion, json_gdp) {
            if (error) throw error;

            var json = d3.merge([json_gdp, json_religion]);

            // nest the data under the country code
            var nested_json = d3.nest()
                .key(function(d) {
                    if (d['Country Code']) {
                        return d['Country Code'];
                    }
                    else {
                        return d['ISO3'];
                    }
                })
                .entries(json);

            console.log(nested_json);

            drawScatterPlot(nested_json, '2000');
        });
});


function drawScatterPlot(data, year) {

    // x will be the GDP
    var x = d3.scaleLinear()
        .range([0, width])
        .domain(d3.extent(data, function(d) { return parseFloat(d.values[0][year]); }));

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain(d3.extent(data, function(d) {
            for (var i = 1; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    return (1.0 - parseFloat(d.values[i]['NORELPCT'].replace(',', '.')));
                }
            }
            return undefined; 
        }));

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([3, 0])
        .direction('s')
        .html(function(d) {
            return d.values[0]['Country Name'];
        });

    var svg = d3.select('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .call(tip);

    var chart = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    chart.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    chart.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y));

    chart.selectAll('.dot')
        .data(data)
    .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 3.5)
        .attr('cx', function(d) { return x(parseFloat(d.values[0][year])); })
        .attr('cy', function(d) {
            for (var i = 1; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    return y((1.0 - parseFloat(d.values[i]['NORELPCT'].replace(',', '.'))));
                }
            }
            return undefined; 
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
}