/* Sebastiaan Arendsen
 * 6060072
 * scripts.js
 * 
 * This script creates a d3 scatterplot based on two fairly non-compatible data
 * sets. While it's probably inefficient to try to correct this in the js,
 * it makes for a nice exercise. Some pre-processing of the data would 
 * probably lead to a much cleaner code and more general applicability.
 */

'use strict';

// 'Magic Numbers'
var margin = {top: 50, right: 30, bottom: 40, left: 200},
    height = 600 - margin.top - margin.bottom,
    width = 1300 - margin.left - margin.right,
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
    },
    labels = ['islam', 'christianity', 'judaism', 'buddhism', 'hinduism', 'other'], 
    xLabelText = 'GDP per capita',
    yLabelText = 'Religious perunage',
    titleOfPlot = 'Religion vs GDP ' + year,
    legendSpacing = 25,
    legendOffset = 20,
    legendBox = 20,
    legendTextOffset = 42,
    tipOffset = 3,
    popDiv = 3000000,
    legendTopText = 'Dominant religion',
    legendBotText = 'Size represents population';

// triggers when dom is loaded
document.addEventListener('DOMContentLoaded', function() {

    // set document title
    document.title = titleOfPlot;

    // make a queue to load both datasets before executing code
    var q = d3.queue()
        .defer(d3.json, DATA_URL_RELIGION)
        .defer(d3.json, DATA_URL_GDP)

        // when queue is cleared execute code
        .await(function(error, json_religion, json_gdp) {
            if (error) throw error;

            // merge data lists
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

            // remove non-existant data
            for (var i = (nested_json.length - 1); i >= 0; i--) {
                if (nested_json[i].values[0][year] == undefined || nested_json[i].values[0][year].length === 0) {
                    nested_json.splice(i, 1);
                }
            }

            // draw the graph
            drawScatterPlot(nested_json, year);
        });
});

function drawScatterPlot(data, year) {

    /* x will be the GDP.
     * After some experimentation it was found this looks best on a 
     * logarithmic scale. Which is a sad fact on it's own.
     */
    var x = d3.scaleLog()
        .range([0, width])
        .domain(d3.extent(data, function(d) { return parseFloat(d.values[0][year]); }));

    // y will be the religionpct
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain(d3.extent(data, function(d) {

            // religion data is stored in different objects per year, so has to be found
            for (var i = 1; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    return (1.0 - parseFloat(d.values[i]['NORELPCT'].replace(',', '.')));
                }
            }
        }));

    // instantiate tooltip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([tipOffset, 0])
        .direction('s')

        // tooltip will show country name
        .html(function(d) {
            return d.values[0]['Country Name'];
        });

    // set width and height of svg and call tip on the svg
    var svg = d3.select('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .call(tip);

    // append group to svg for actual chart
    var chart = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create x-axis
    var xAxis = chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    // create y-axis
    chart.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y));

    // append actual data as dots and circles
    chart.selectAll('.dot')
        .data(data)
    .enter().append('circle')
        .attr('class', 'dot')

        // fill the dots based on dominant religion
        .attr('fill', function(d) {
            for (var i = 0; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    var color;
                    var total = 0;
                    var highest = 0;
                    var current = 0;

                    // check each religion for amount
                    for (var key in religions) {

                        current = parseFloat(d.values[i][religions[key]].replace(/,/g, ''));

                        // store total
                        total += current;
                        if (current > highest) {

                            // store color
                            color = colors[key];

                            // store highest
                            highest = parseFloat(d.values[i][religions[key]].replace(/,/g, ''));
                        }    
                    }

                    // get population number for final check
                    for (var i = 1; i < d.values.length; i++) {
                        if (d.values[i]['YEAR'] == year) {
                            var pop =  parseFloat(d.values[i]['POP'].replace(/,/g, ''));
                        }
                    }

                    // set other if highest is smaller than total pop - total counted religions
                    if (highest > (pop - total)) {
                        return color;
                    }
                    else {
                        return colors.other;
                    }
                }
            }
        })

        // determine area of dot based on population
        .attr('r', function(d) {
            for (var i = 1; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    return Math.sqrt(parseFloat(d.values[i]['POP'].replace(/,/g, '')) / popDiv);
                }
            }
        })

        // x pos based on gdp
        .attr('cx', function(d) { return x(parseFloat(d.values[0][year])); })

        // y pos based on religion
        .attr('cy', function(d) {

            // religion is buried within an array of objects id'ed by year
            for (var i = 1; i < d.values.length; i++) {
                if (d.values[i]['YEAR'] == year) {
                    return y(1.0 - parseFloat(d.values[i]['NORELPCT'].replace(',', '.')));
                }
            }
            return undefined; 
        })

        // add mouseover events for tooltip to data points
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

        // add labels to x and y-axis
        var xLabel = chart.append('text')
            .attr('class', 'label')
            .attr('transform', 'translate(' + width + ',' + (height + margin.bottom - 5) + ')')
            .attr('text-anchor', 'end')
            .text(xLabelText);

        var yLabel = svg.append('text')
            .attr('class', 'label')

            // rotate and translate the y-axis
            .attr('transform', 'rotate(-90) translate(' + (margin.top - 220) + ',' + (margin.left - 30) + ')')
            .attr('text-anchor', 'begin')
            .text(yLabelText);

        // append group for legend and place it slightly from the edge
        var legend = svg.append('g')
            .attr('transform', 'translate(4,' + margin.top + ')');
        
        // add a group for each label needed
        var groupLegend = legend.selectAll('g')
            .data(labels).enter().append('g');

        // append a top text to the legend
        groupLegend.append('text')
            .text(legendTopText)
            .attr('class', 'legend');

        // append a square to the legend
        groupLegend.append('rect')
            .attr('class', 'bar')

            // fill it with color associated with label
            .attr('fill', function(d, i) { return colors[d]; })

            // place it correctly
            .attr('y', function(d, i) { return legendSpacing + (i * legendSpacing); })
            .attr('transform', 'translate(2,0)')

            // set width and height
            .attr('width', legendBox)
            .attr('height', legendBox);

        // set text for each box
        groupLegend.append('text')
            .attr('y', function(d, i) { return legendTextOffset + (i * legendSpacing); })
            .attr('x', legendOffset + 10)

            // make each first letter uppercase
            .text(function(d) { return d[0].toUpperCase() + d.substring(1); });

        // place bottom text
        groupLegend.append('text')
            .attr('class', 'legend')
            .attr('y', function() { return legendSpacing + ((labels.length + 1) * legendSpacing) })
            .text(legendBotText);

        // make title for plot
        svg.append('text')
            .attr('class', 'title')
            .attr('transform', 'translate(' + (margin.left + width / 2) + ',' + (margin.top / 2) + ')')
            .attr('text-anchor', 'center')
            .text(titleOfPlot);
}