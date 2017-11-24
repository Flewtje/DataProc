/* Sebastiaan Arendsen
 * svg.js
 */

'use strict';

var offset = 96.8,
    padding = 138.7 - offset,
    rows = 6,
    firstBoxX = 13,
    secondBoxX = 46.5,
    firstWidth = 21,
    firstHeight = 29,
    secondWidth = 119.1,
    secondHeight = 29,
    firstSpacing = 13.5 - 1.8;

document.addEventListener('DOMContentLoaded', function() {
    d3.xml('test.svg').mimeType('image/svg+xml').get(function(error, xml) {
        if (error) throw error;
        document.body.appendChild(xml.documentElement);

        var svg = d3.select('svg');


        // append a rect for each color
        for (var i = 1; i <= rows - 3; i++) {
            svg.append('rect')
                .attr('class', 'st1')
                .attr('id', 'kleur' + (3 + i))
                .attr('width', firstWidth)
                .attr('height', firstHeight)
                .attr('x', firstBoxX)
                .attr('y', offset + padding * i);
        }

        // append another rect for each color
        for (var i = 2; i <= rows - 3; i++) {
            svg.append('rect')
                .attr('class', 'st2')
                .attr('id', 'tekst' + (3 + i))
                .attr('width', secondWidth)
                .attr('height', secondHeight)
                .attr('x', secondBoxX)
                .attr('y', offset + padding * i);
        }

        var height = firstHeight * rows + 
                    ((padding - firstHeight) * (rows - 1)) + 2 * firstSpacing;
        d3.select('.st0')
            .attr('height', height);

    /* From this point on it will be much harder than needed to add text to the
     * The boxes aren grouped which makes it way harder to align the text
     * correctly. In ../static/scripts.js is a version of this legend which
     * uses groups.
     */ 

    });

})