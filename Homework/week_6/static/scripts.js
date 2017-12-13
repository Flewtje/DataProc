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
    marginsPie = {top: 20, right: 20, bottom: 30, left: 180},
    widthPie = 700,
    heightPie = 700,
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

            stackedBarChartInit();

            stackedBarChartFill(data1, data2);

            pieChartInit();

            pieChartUpdate(data2, 0);

        });

});

function stackedBarChartInit() {

    // create an svg for the barchart
    var svg = d3.select('.bar')
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

function stackedBarChartFill(data, json) {

    var keys = data.columns.slice(2);

    xBar.domain(data.map(function(d) { return d['Jaar']; }));

    yBar.domain([0, d3.max(data, function(d) { return d['Totaal stemmen']; })]);

    zBar.domain(keys);

    barChart.append('g')
        .selectAll('g')
        .data(d3.stack().keys(keys)(data))
    .enter().append('g')
        .attr('fill', function(d) { return zBar(d.key); })
    .selectAll('rect')
        .data(function(d) { return d; })
    .enter().append('rect')
        .on('click', function(d,i) { return pieChartUpdate(json, i)})
        .on('mouseover', function() { document.body.style.cursor = 'pointer';} )
        .on('mouseout' , function() { document.body.style.cursor = 'default'; })
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

    var legend = d3.select('.bar').append('g')
        .attr('transform', 'translate(60,' + (marginsBar.top + 20) + ')');
        
    // add a group for each label needed
    var groupLegend = legend.selectAll('g')
        .data(['Ongeldig', 'Geldig'])
        .enter().append('g');

    // add colored squares for the legend
    groupLegend.append('rect')
        .attr('width', '20')
        .attr('height', '20')
        .attr('fill', function(d) { return zBar(d); })
        .attr('y', function(d, i) { return i * 25; });

    // add text for the legend
    groupLegend.append('text')
        .attr('transform', 'translate(' + 20 + ',0)')
        .attr('y', function(d, i) { return 15 + (i * 25); })
        .attr('x', 10)
        .text(function(d) { return d; });
}

var pieChart,
    pie,
    color,
    label,
    path,
    pieLegend;

function pieChartInit() {
    var svg = d3.select('.pie')
        .attr('width', widthPie + marginsPie.left + marginsPie.right)
        .attr('height', heightPie + marginsPie.top + marginsPie.bottom);

    var radius = Math.min(widthPie, heightPie) / 2;

    pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.zetels; });

    pieChart = svg.append('g')
        .attr('transform', 'translate(' + (widthPie / 2 + marginsPie.left) + ',' + (heightPie / 2 + marginsPie.top) + ')');

    color = d3.scaleOrdinal(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

    path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    pieLegend = d3.select('.pie')
        .append('g')
        .attr('transform', 'translate(4,' + marginsPie.top + ')');

}


function pieChartUpdate(json, year) {

    pieLegend.selectAll('g')
        .remove();

    var data = json[year];

    for (var key in data) {
        if (data[key] == undefined || key == 'Jaar' || data[key] == '-' || data[key].length === 0) {
            delete data[key];
        }

        else if (key == 'Totaal aantal zetels') {
            delete data[key];
        }
        else {
            data[key] = +data[key];
        }
    }

    var fitData = [];

    for (var key in data) {
        fitData.push({'partij': key,
            'zetels': data[key]
        });
    }

    pieChart.selectAll('.arc')
        .remove();

    var arc = pieChart.selectAll('.arc')
        .data(pie(fitData))
    .enter().append('g')
        .attr('class', 'arc');

    arc.append('path')
        .attr('d', path)
        .attr('fill', function(d) { return color(d.data['partij']); });

    arc.append('text')
        .attr('transform', function(d) { return 'translate(' + label.centroid(d) + ')'; })
        .attr('dy', '0.35em')
        .text(function(d) { return d.data['partij']; });

    var groupLegend = pieLegend.selectAll('g')
        .data(fitData).enter().append('g');

    groupLegend.append('rect')
        .attr('width', '20')
        .attr('height', '20')
        .attr('fill', function(d) { return color(d['partij']); })
        .attr('y', function(d, i) { return i * 25; });

    groupLegend.append('text')
        .attr('transform', 'translate(' + 20 + ',0)')
        .attr('y', function(d, i) { return 15 + (i * 25); })
        .attr('x', 10)
        .text(function(d) { return d['partij']; });
}