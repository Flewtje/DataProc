/* Sebastiaan Arendsen
 * 6060072
 * Minor Programmeren - Data Processing
 */
'use strict';

const DATA1 = 'data/tweede_kamer_opkomst.csv',
    DATA2 = 'data/tweede_kamer_partijen.csv';

var marginsBar = {top: 20, right: 20, bottom: 30, left: 40},
    widthBar = 700,
    heightBar = 600,
    marginsPie = {top: 20, right: 20, bottom: 30, left: 40},
    widthPie = 300,
    heightPie = 200,
    barChart,
    pieChart,
    xBar,
    yBar,
    zBar,
    data1,
    data2;

document.addEventListener('DOMContentLoaded', function() {

    // load data
    d3.queue()
        .defer(d3.csv, DATA1)
        .defer(d3.csv, DATA2)
        .await(function(error, data1, data2) {
            if (error) throw error;

            console.log(data1);
            console.log(data2);

            stackedBarChartInit();

            stackedBarChartFill(data1);

        });

});

function stackedBarChartInit() {

    // create an svg for the barchart
    var svg = d3.select('body')
        .append('svg')
        .attr('id', 'barsvg')
        .attr('width', widthBar + marginsBar.left + marginsBar.right)
        .attr('height', heightBar + marginsBar.top + marginsBar.bottom);

    barChart = svg.append('g')
        .attr('transform', 'translate(' + marginsBar.left + ',' + marginsBar.top + ')');

    xBar = d3.scaleBand()
        .rangeRound([0, widthBar])
        .paddingInner(0.05)
        .align(0.1);

    yBar = d3.scaleLinear()
        .rangeRound([heightBar, 0]);

    zBar = d3.scaleOrdinal()
        .range(['#98abc5', '#8a89a6']);
}

function stackedBarChartFill(data) {

    var keys = data.columns.slice(2);

    console.log(keys);
    xBar.domain(data.map(function(d) { return d['Jaar']; }));

    yBar.domain([0, d3.max(data, function(d) { return d['Totaal stemmen']; })]);

    zBar.domain(keys);

    console.log(d3.stack().keys(keys)(data));

    barChart.append('g')
        .selectAll('g')
        .data(d3.stack().keys(keys)(data))
    .enter().append('g')
        .attr('fill', function(d) { return zBar(d.key); })
    .selectAll('rect')
        .data(function(d) { return d; })
    .enter().append('rect')
        .on('mouseover', function(d) {  pieChartUpdate(d.data['Jaar']) })
        .attr('x', function(d) { return xBar(d.data['Jaar']); })
        .attr('y', function(d) { return yBar(d[1]); })
        .attr('height', function(d) { return yBar(d[0]) - yBar(d[1]); })
        .attr('width', xBar.bandwidth());

    barChart.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + heightBar + ')')
        .call(d3.axisBottom(xBar));

    barChart.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(yBar).ticks(null, 's'));
}

function pieChartInit() {
    var svg = d3.select('body')    
        .append('svg')
        .attr('id', 'piesvg')
        .attr('width', widthBar + marginsBar.left + marginsBar.right)
        .attr('height', heightBar + marginsBar.top + marginsBar.bottom);

    var radius = Math.min(widthPie, heightPie) / 2

    pieChart = svg.append('g')
        .attr('transform', 'translate(' + (width / 2 + marginsPie.left) + ',' + (height / 2 + marginsPie.top) + ')')

    var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

}

// function pieChartUpdate(data, year) {

//     var pie = 
    
// }