window.onload = function() {
    render();
};

var originX = 0;
var originY = 0;

var buttonSize;
var buttonRadius;
var enlargedBody = false;

timelineHeight = 0.25 * graphicHeight;

function render() {
    var canvas = d3.select('#ethnic-studies')
        .style('width', px(graphicWidth));

    makeHeadline(canvas);

    var svg = canvas.append('svg')
        .style('width', px(graphicWidth))
        .style('height', px(2 * timelineHeight))
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
    buttonSize = (dateLength / (years.length));
    buttonRadius = (buttonSize - padding) / 2;
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
    
        // show the large button
        var button = svg.append('circle')
            .attr('cx', buttonCenterX)
            .attr('cy', buttonCenterY)
            .attr('r', buttonRadius)
            .attr('fill', buttonColor)
            .attr('index', index - 1) // for referencing purposes on click
            .on('mouseover', function() {
                showDetail(svg, d3.select(this).attr('index'));
            })
            .on('click', function() {
                showDetail(svg, d3.select(this).attr('index'));
            });
        animatePoint(button, buttonCenterX, buttonCenterY, buttonRadius,
                1, 1000 * index / years.length);

        // fill the larger button with the number
        var label = svg.append('text')
            .attr('x', currentButtonX + (buttonSize / 2))
            .attr('y', buttonStartY + 1.4 * buttonRadius )
            .attr('width', buttonRadius * 2)
            .attr('height', buttonRadius * 2)
            .attr('index', index - 1) // for referencing purposes on click
            .style('font-family', mainFont)
            .style('font-size', buttonFontSize)
            .style('text-anchor', 'middle')
            .text(index)
            .on('mouseover', function() {
                showDetail(svg, d3.select(this).attr('index'));
            })
            .on('click', function() {
                showDetail(svg, d3.select(this).attr('index'));
            });
        disableSelection(label);

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

// show detailed information for a proposal
var selectedIndex = -1;
var detailElements = [];
function showDetail(svg, i) {
    i = parseInt(i);

    if (i === selectedIndex)
        return;
    selectedIndex = i;
    
    // increase the size of the canvas if necessary
    if (!enlargedBody) {
        svg.transition()
            .duration(500)
            .style('height', px(graphicHeight))
            .ease(d3.easeLinear);
        enlargedBody = true;
    }

    // get rid of old elements if necessary
    for (var j = 0; j < detailElements.length; j++) {
        detailElements[j].remove();
    }
    detailElements = [];

    var detailX = originX;
    var detailY = originY + 2 * timelineHeight;
    var detailWidth = graphicWidth;
    var detailHeight = graphicHeight - 2 * timelineHeight;

    // show the button
    var buttonX = 2 * padding + detailX + (padding / 2) + buttonRadius;
    var buttonY = 2 * padding + detailY + (padding / 2) + buttonRadius;
    var button = svg.append('circle')
        .attr('cx', buttonX)
        .attr('cy', buttonY)
        .attr('r', buttonRadius)
        .attr('fill', buttonColor);
    detailElements.push(button);

    // show the button text
    var label = svg.append('text')
        .attr('x', buttonX)
        .attr('y', buttonY + 0.4 * buttonRadius)
        .attr('width', buttonRadius * 2)
        .attr('height', buttonRadius)
        .style('font-family', mainFont)
        .style('font-size', buttonFontSize)
        .style('fill', timelineColor)
        .style('text-anchor', 'middle')
        .text(i + 1);
    detailElements.push(label);

    // show the proposal name
    var nameStartX = buttonX + buttonRadius + padding;
    var name = svg.append('text')
        .attr('x', nameStartX)
        .attr('y', buttonY + 0.3 * buttonRadius)
        .attr('width', detailX + detailWidth - nameStartX)
        .attr('height', buttonRadius)
        .style('font-family', mainFont)
        .style('font-size', nameSize)
        .style('fill', timelineColor)
        .style('text-anchor', 'start')
        .text(data[i]['title'] + ' (' + data[i]['year'] + ')');
    detailElements.push(name);

    // show the description
    var descriptionX = 2 * padding + detailX;
    var descriptionY = 5 * padding + detailY + 2 * buttonRadius;
    var descriptionWidth = detailX + detailWidth - descriptionX;
    var descriptionHeight = detailY + detailHeight - descriptionY;
    var description = svg.append('text')
        .attr('x', descriptionX)
        .attr('y', descriptionY)
        .attr('width', descriptionWidth)
        .attr('height', descriptionHeight)
        .attr('text-anchor', 'start')
        .attr('font-family', mainFont)
        .attr('font-size', descriptionFontSize)
        .attr('fill', timelineColor)
        .text(data[i]['description'])
        .call(wrap, descriptionWidth);
    detailElements.push(description);
}
