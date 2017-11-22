/* Sebastiaan Arendsen
 * 6060072
 * scripts.js
 */

'use strict';

var margin = {top: 50, right: 30, bottom: 30, left: 200},
    height = 500 - margin.top - margin.bottom,
    width = 960 - margin.left - margin.right,
    padding = 0.1,
    DATA_URL_RELIGION = 'data/religion.json',
    DATA_URL_GDP = 'data/gdppc.json',
    TEST_SVG = 'data/test.csv',
    years = ['1965', '1970', '1975', '1980', '1985', '1990', '1995', 
        '2000', '2005', '2010'],
    year = years[9],
    colors = {
        islam: 'green',
        christianity: 'steelblue',
        judaism: 'red',
        buddhism: 'yellow',
        hinduism: 'purple',
        other: 'black'
    },
    religions = {
        islam: 'ISLMGEN',
        christianity: 'CHRSGEN',
        judaism: 'JUDGEN',
        buddhism: 'BUDGEN',
        hinduism: 'HINDGEN'
    };

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

            for (var i = (nested_json.length - 1); i >= 0; i--) {
                if (nested_json[i].values[0][year] == undefined || nested_json[i].values[0][year].length === 0) {
                    nested_json.splice(i, 1);
                }
            }
            drawScatterPlot(nested_json, year);
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

        .attr('fill', function(d) {
            for (var i = 0; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    var color = colors.other;
                    var total = 0;
                    var highest = 0;
                    if (parseFloat(d.values[i][religions.christianity].replace(/,/g, '')) > highest) {
                        color = colors.christianity;
                        highest = parseFloat(d.values[i][religions.christianity].replace(/,/g, ''));
                        total += highest;
                    }
                    if (parseFloat(d.values[i][religions.islam].replace(/,/g, '')) > highest) {
                        color = colors.islam;
                        highest = parseFloat(d.values[i][religions.islam].replace(/,/g, ''));
                        total += highest;
                    }
                    if (parseFloat(d.values[i][religions.judaism].replace(/,/g, '')) > highest) {
                        color = colors.judaism;
                        highest = parseFloat(d.values[i][religions.islam].replace(/,/g, ''));
                        total += highest;
                    }
                    if (parseFloat(d.values[i][religions.buddhism].replace(/,/g, '')) > highest) {
                        color = colors.buddhism;
                        highest = parseFloat(d.values[i][religions.buddhism].replace(/,/g, ''));
                        total += highest;
                    }
                    if (parseFloat(d.values[i][religions.hinduism].replace(/,/g, '')) > highest) {
                        color = colors.hinduism;
                        highest = parseFloat(d.values[i][religions.hinduism].replace(/,/g, ''));
                        total += highest;
                    }
                    for (var i = 1; i < d.values.length; i++) {
                        if (d.values[i]['YEAR'] == year) {
                            var pop =  parseFloat(d.values[i]['POP'].replace(/,/g, ''));
                        }
                    }

                    if (highest > (pop - total)) {
                        return color;                   
                    }

                    else {
                        return colors.other;
                    }
                }
            }
        })

        // determine 'area' based on population
        .attr('r', function(d) {
            for (var i = 1; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    return Math.sqrt(parseFloat(d.values[i]['POP'].replace(/,/g, '')) / 3000000);
                }
            }
        })
        .attr('cx', function(d) { return x(parseFloat(d.values[0][year])); })
        .attr('cy', function(d) {
            for (var i = 1; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    return y(1.0 - parseFloat(d.values[i]['NORELPCT'].replace(',', '.')));
                }
            }
            return undefined; 
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

        var legend = svg.append('g')
            .attr('transform', 'translate(4,' + margin.top + ')');

        var labels = ['islam', 'christianity', 'judaism', 'buddhism', 'hinduism', 'other'] 
        
        var groupLegend = legend.selectAll('g').data(labels).enter().append('g');

        groupLegend.append('rect')
                .attr('class', 'bar')
                .attr('fill', function(d, i) { return colors[d]; })
                .attr('y', function(d, i) { return 5 + (i * 25); })
                .attr('transform', 'translate(2,0)')
                .attr('width', 20)
                .attr('height', 20);

        groupLegend.append('text')
                .attr('y', function(d, i) { return 22 + (i * 25); })
                .attr('x', 30)
                .text(function(d) { return d[0].toUpperCase() + d.substring(1); });
}