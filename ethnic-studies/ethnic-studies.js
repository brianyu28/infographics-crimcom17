window.onload = function() {
    render();
};

var originX = 0;
var originY = 0;

timelineHeight = 0.2 * graphicHeight;

function render() {
    var canvas = d3.select('#ethnic-studies')
        .style('width', px(graphicWidth));

    makeHeadline(canvas);

    var svg = canvas.append('svg')
        .style('width', px(graphicWidth))
        .style('height', px(graphicHeight))
        .style('margin-left', px(padding))
        .style('margin-right', px(padding));

    var separatedYears = [[], []];
    for (var i = 0; i < data.length; i++) {
        var group = (i < data.length / 2) ? 0 : 1;
        separatedYears[group].push(data[i]['year']);
    }

    makeTimeline(svg, originX, originY, graphicWidth, timelineHeight,
            timelineIntervals[0][0], timelineIntervals[0][1], 5, separatedYears[0], 1);
    makeTimeline(svg, originX, originY + timelineHeight, graphicWidth, timelineHeight,
            timelineIntervals[1][0], timelineIntervals[1][1], 5, separatedYears[1], 
            separatedYears[0].length + 1);
}

function makeHeadline(canvas) {
    // show primary headline 
    var headline = canvas.append('div')
        .style('margin-left', px(padding))
        .style('margin-right', px(padding))
        .style('text-align', 'center')
        .style('font-size', px(28))
        .style('font-family', mainFont)
        .html('<span style="font-size:48px;font-weight:bold;color:#004e6a">44</span> years, \
                <span style="font-size:48px;font-weight:bold;color:#004e6a">12</span> proposals.');

    // show subheadline
    var subhead = canvas.append('div')
        .style('margin-left', px(padding))
        .style('margin-right', px(padding))
        .style('text-align', 'center')
        .style('font-size', px(18))
        .style('font-family', mainFont)
        .html('A look at ethnic studies proposals over the years.<br/>\
                Click on a proposal to see details.');
}

/*
 * draws a timeline
 * (x, y) are starting coords for timeline area with width and height
 * start and end are years for endpoints of timeline
 * interval is number of years between tick marks
 * years is a list of the years to label as points
 * index is what to number each labeled point
 */
function makeTimeline(svg, x, y, width, height, start, end, interval, years, index) {
    
    // draw the line
    var timelineY = y + 0.2 * height;
    var timeline = svg.append('path')
        .attr('d', line([
            [x, timelineY],
            [x + width, timelineY]
        ]))
        .attr('stroke', timelineColor)
        .attr('stroke-width', 4);
    
    // compute ranges where dates can exist
    var dateStartX = x + 0.1 * width;
    var dateEndX = x + width - 0.1 * width;
    var dateLength = dateEndX - dateStartX;

    function getXOfYear(year) {
        return dateStartX + ((year - start) / (end - start)) * dateLength;
    }

    // draw the labels
    for (var i = start; i <= end; i += interval) {
        var yearX = getXOfYear(i);
        
        // show the tick mark
        var tick = svg.append('path')
            .attr('d', line([
                [yearX, timelineY - (tickSize / 2)],
                [yearX, timelineY + (tickSize / 2)]
            ]))
            .attr('stroke', timelineColor)
            .attr('stroke-width', 2);
    
        // show the year 
        var label = svg.append('text')
            .attr('x', yearX)
            .attr('y', timelineY - (tickSize / 2) - (padding / 2))
            .attr('width', interval)
            .attr('height', labelHeight)
            .style('font-family', mainFont)
            .style('font-size', timelineFontSize)
            .style('text-anchor', 'middle')
            .text(i);
    }
    
    // compute point sizes
    var buttonSize = (dateLength / (years.length));
    var buttonRadius = (buttonSize - padding) / 2;
    var currentButtonX = dateStartX;
    
    // create layer for points to prevent overlap
    var lineLayer = svg.append('g');

    // draw the points
    for (var i = 0; i < years.length; i++) {
        var yearX = getXOfYear(years[i]);
        
        // show the larger button
        var buttonStartY = timelineY + (tickSize / 2) + labelHeight + padding;
        var buttonCenterX = currentButtonX + (buttonSize / 2);
        var buttonCenterY = buttonStartY + buttonRadius;

        // show a point at the appropriate place
        var point = svg.append('circle')
            .attr('cx', yearX)
            .attr('cy', timelineY)
            .attr('r', 4)
            .attr('fill', timelineColor);

        var button = svg.append('circle')
            .attr('cx', buttonCenterX)
            .attr('cy', buttonCenterY)
            .attr('r', buttonRadius)
            .attr('fill', blue2);

        // fill the larger button with the number
        var label = svg.append('text')
            .attr('x', currentButtonX + (buttonSize / 2))
            .attr('y', buttonStartY + 1.4 * buttonRadius )
            .attr('width', buttonRadius * 2)
            .attr('height', buttonRadius * 2)
            .style('font-family', mainFont)
            .style('font-size', buttonFontSize)
            .style('text-anchor', 'middle')
            .text(index);

        // draw the connecting line
        var conLine = lineLayer.append('path')
            .attr('d', line([
                [yearX, timelineY],
                [buttonCenterX, buttonStartY]
            ]))
            .attr('stroke', timelineColor)
            .attr('stroke-dasharray', '5 5')
            .attr('stroke-width', 1);
    
        index++;
        currentButtonX += buttonSize;
    }

}
