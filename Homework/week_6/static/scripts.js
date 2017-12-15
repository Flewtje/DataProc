    /* Sebastiaan Arendsen
 * 6060072
 * Minor Programmeren - Data Processing
 */

'use strict';


// datasets to be used
const DATA1 = 'data/tweede_kamer_opkomst.csv',
    DATA2 = 'data/tweede_kamer_partijen.csv';


// variables to be used globally
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
    data2,
    title = [];

// execute when html has been loaded
document.addEventListener('DOMContentLoaded', function() {

    // load data using a queue
    d3.queue()
        .defer(d3.csv, DATA1)
        .defer(d3.csv, DATA2)
        .await(function(error, data1, data2) {
            if (error) throw error;

            // extract years for pie cahrt center text
            for (var i = 0; i < data2.length; i++) {
                title.push(data2[i]['Jaar']);
            }

            // init bar
            stackedBarChartInit();

            // fill bar
            stackedBarChartFill(data1, data2);

            // init pie chart
            pieChartInit();

            // first update pie
            pieChartUpdate(data2, 0);

        });

});

function stackedBarChartInit() {

    // create an svg for the barchart
    var svg = d3.select('.bar')
        .attr('id', 'barsvg')
        .attr('width', widthBar + marginsBar.left + marginsBar.right)
        .attr('height', heightBar + marginsBar.top + marginsBar.bottom);


    // fix margins
    barChart = svg.append('g')
        .attr('transform', 'translate(' + marginsBar.left + ',' + marginsBar.top + ')');

    // create x-scaling
    xBar = d3.scaleBand()
        .rangeRound([0, widthBar])
        .paddingInner(0.05)
        .align(0.1);

    // create y-scaling
    yBar = d3.scaleLinear()
        .rangeRound([heightBar, 0]);

    // create color scaling
    zBar = d3.scaleOrdinal()
        .range(['#98abc5', '#8a89a6']);
}


/* Function to fill in the bar chart.
 * This is useful for late usage if you would want to update the bar chart
 */ 
function stackedBarChartFill(data, json) {

    // get the keys for the data
    var keys = data.columns.slice(2);

    // set the domain for the x-axis
    xBar.domain(data.map(function(d) { return d['Jaar']; }));

    // set domain for y-axis
    yBar.domain([0, d3.max(data, function(d) { return d['Totaal stemmen']; })]);

    // set domain for z-axis
    zBar.domain(keys);

    // append a group for each data point
    barChart.append('g')
        .selectAll('g')

        // create stacked data based on the keys for each entry
        .data(d3.stack().keys(keys)(data))
    .enter().append('g')

        // fill with correct color for each stack
        .attr('fill', function(d) { return zBar(d.key); })
    .selectAll('rect')

        // add data for each stack
        .data(function(d) { return d; })
    .enter().append('rect')

        // on click update piechart
        .on('click', function(d,i) { return pieChartUpdate(json, i)})

        // fancy mouse cursors to make it appear 'clickable'
        .on('mouseover', function() { document.body.style.cursor = 'pointer';} )
        .on('mouseout' , function() { document.body.style.cursor = 'default'; })

        // add x and y data
        .attr('x', function(d) { return xBar(d.data['Jaar']); })
        .attr('y', function(d) { return yBar(d[1]); })

        // set height and width
        .attr('height', function(d) { return yBar(d[0]) - yBar(d[1]); })
        .attr('width', xBar.bandwidth());

    // append x-axis
    barChart.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + heightBar + ')')
        .call(d3.axisBottom(xBar));

    // and y-axis
    barChart.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(yBar).ticks(null, 's'));

    // create a legend
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

    // add a title
    var title = d3.select('.bar').append('text')
        .attr('class', 'title')
        .attr('transform', 'translate(' + (marginsBar.left + widthBar / 2) + ',24)')
        .text('Opkomst tweede kamer verkiezingen');
}

// pie chart globals
var pieChart,
    pie,
    color,
    label,
    path,
    pieLegend;

// function to initialize the pie chart
function pieChartInit() {

    // select the pie chart
    var svg = d3.select('.pie')
        .attr('width', widthPie + marginsPie.left + marginsPie.right)
        .attr('height', heightPie + marginsPie.top + marginsPie.bottom);

    // set radius to half the smallest dimension
    var radius = Math.min(widthPie, heightPie) / 2;

    // create pie chart function, make it unsorted and add a value to it based on data
    pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.zetels; });

    // fix margins
    pieChart = svg.append('g')
        .attr('transform', 'translate(' + (widthPie / 2 + marginsPie.left) + ',' + (heightPie / 2 + marginsPie.top) + ')');

    // make color scale
    color = d3.scaleOrdinal(d3.schemeCategory20);

    // make path function for pie chart
    path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    // create label function
    label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    // init legend for pie chart
    pieLegend = d3.select('.pie')
        .append('g')
        .attr('transform', 'translate(4,' + marginsPie.top + ')');

    // create title for pie chart
    var title = svg.append('text')
        .attr('class', 'title')
        .attr('transform', 'translate(' + (marginsPie.left + widthPie / 2) + ',24)')
        .text('Zetelverdeling');
}


// make function for updating the pie chart
function pieChartUpdate(json, year) {

    // clear pie chart legend
    pieLegend.selectAll('g')
        .remove();

    // pick new data
    var data = json[year];

    // remove undefined data points
    for (var key in data) {
        if (data[key] == undefined || data[key] == '-' || data[key].length === 0) {
            delete data[key];
        }

        else if (key == 'Jaar') {
            delete data[key];
        }

        else if (key == 'Totaal aantal zetels') {
            delete data[key];
        }
        else {
            data[key] = +data[key];
        }
    }

    // put data in easy to plot format
    var fitData = [];
    for (var key in data) {
        fitData.push({'partij': key,
            'zetels': data[key]
        });
    }

    // remove all arcs from pie chart
    pieChart.selectAll('.arc')
        .remove();

    // create groups for data
    var arc = pieChart.selectAll('.arc')
        .data(pie(fitData))
    .enter().append('g')
        .attr('class', 'arc');

    // append the path for each data point
    arc.append('path')
        .attr('d', path)
        .attr('fill', function(d) { return color(d.data['partij']); });

    // append label with amount of 'zetels' to pie arc
    arc.append('text')
        .attr('transform', function(d) { return 'translate(' + label.centroid(d) + ')'; })
        .attr('dy', '0.35em')
        .text(function(d) { return d.data['zetels']; });

    // add groups to legend
    var groupLegend = pieLegend.selectAll('g')
        .data(fitData).enter().append('g');

    // add squares to legend groups
    groupLegend.append('rect')
        .attr('width', '20')
        .attr('height', '20')
        .attr('fill', function(d) { return color(d['partij']); })
        .attr('y', function(d, i) { return i * 25; });

    // add text to lenged groups
    groupLegend.append('text')
        .attr('transform', 'translate(' + 20 + ',0)')
        .attr('y', function(d, i) { return 15 + (i * 25); })
        .attr('x', 10)
        .text(function(d) { return d['partij']; });

    // add title to pie chart
    pieChart.append('text')
        .attr('class', 'title')
        .text(title[year]);
}