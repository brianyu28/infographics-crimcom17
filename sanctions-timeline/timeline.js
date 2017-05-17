window.onload = function() {
    render();
};

var originX = 0;
var originY = padding;
var yStartAdditional = 50; // additional padding after button clicked

var firstEvent;
var firstEventHeight;
var firstEventElts = {};

var neededEventHeight; // for all events

var removeUponFull = [];
var startOpacity = 0;

function render() {
    var canvas = d3.select('#double-timeline')
        .style('width', px(graphicWidth));
    addHeadline(canvas);
    
    // compute first event and it's height
    firstEvent = data[0][0];
    firstEventHeight = eventHeight(firstEvent);
    
    // height we will eventually require
    neededEventHeight = originY + yStartAdditional + totalEventHeight(data) + bottomPadding;

    // if no intro screen, then immediately need the full height
    var initialHeight = padding + firstEventHeight + continueAreaHeight;
    if (!showIntroScreen)
        initialHeight = neededEventHeight;

    var svg = canvas.append('svg')
        .style('width', px(graphicWidth))
        .style('height', px(initialHeight))
        .style('margin-left', px(padding))
        .style('margin-right', px(padding));
    

    if (showIntroScreen) {
        startOpacity = 0;
        showIntro(svg);
    } else {
        firstEvent = null;
        startOpacity = 1;
        showFull(svg);
    }
}

function addHeadline(canvas) {
    var headline = canvas.append('div')
        .style('margin-left', px(padding))
        .style('margin-right', px(padding))
        .style('text-align', 'center')
        .style('font-size', px(28))
        .style('font-family', mainFont)
        .text("The Plan, and The Complications");
}

function showIntro(svg) {
    
    // display the first event centered
    var firstEvent = data[0][0];
    displayItem(svg, firstEvent, graphicWidth / 2 - timelineWidth / 2, 0, 1);

    // show the button to continue
    var whatfollowed = svg.append('rect')
        .attr('x', (graphicWidth / 2) - (buttonWidth / 2))
        .attr('y', originY + firstEventHeight + padding)
        .attr('width', buttonWidth)
        .attr('height', buttonHeight)
        .style('fill', buttonColor)
        .on('click', function() { showFull(svg); });
    removeUponFull.push(whatfollowed); 

    var whatfollowedText = svg.append('text')
        .attr('x', graphicWidth / 2)
        .attr('y', originY + firstEventHeight + padding + 0.67 * buttonHeight)
        .attr('width', buttonWidth)
        .attr('height', 0.67 * buttonHeight)
        .style('font-family', mainFont)
        .style('font-size', buttonFontSize)
        .style('fill', textColor)
        .style('text-anchor', 'middle')
        .text("See what followed...")
        .on('click', function() { showFull(svg); });
    removeUponFull.push(whatfollowedText);

}

function showFull(svg) {

    // remove the elements that should disappear upon viewing full
    for (var i = 0; i < removeUponFull.length; i++) {
        removeUponFull[i].remove();
    }
    removeUponFull = [];
    
    // compute where each timeline should begin, in terms of X
    var t1Start = timelineMargins; 
    var t2Start = timelineMargins + timelinePadding + timelineWidth;
    var starts = [t1Start, t2Start];
    
    // move first element
    if (firstEvent !== null)
        moveFirstElement(firstEvent, t1Start, originY + yStartAdditional);

    // show all of the remaining elements
    for (var i = 0; i < data.length; i++) {

        var curHeight = originY + yStartAdditional;

        // show this column's title 
        var colTitle = svg.append('text')
            .attr('x', starts[i] + (timelineWidth / 2))
            .attr('y', curHeight - padding)
            .attr('width', timelineWidth)
            .attr('height', curHeight - padding)
            .style('font-family', mainFont)
            .style('font-size', nameSize)
            .style('text-anchor', 'middle')
            .style('fill', nameColor)
            .style('opacity', startOpacity)
            .text(timelineTitles[i]);
        colTitle.transition()
            .duration(1500)
            .style('opacity', 1)
            .ease(d3.easeLinear);

        // show the events
        for (var j = 0; j < data[i].length; j++) {
            if (data[i][j] !== firstEvent) {
                var items = displayItem(svg, data[i][j], starts[i], curHeight, startOpacity); 
                
                // fade in the elements over 1.5 seconds
                for (var k = 0; k < items.length; k++) {
                    items[k].transition()
                        .duration(1500)
                        .style('opacity', 1)
                        .ease(d3.easeLinear);
                }
            }
            curHeight += eventHeight(data[i][j]);
        }
    }

    // expand size to fill if necessary
    if (showIntroScreen) {
        svg.transition()
            .duration(2000)
            .style('height', neededEventHeight)
            .ease(d3.easeLinear);
    }
}

function moveFirstElement(item, t1Start, yStart) {
    var xCenter = t1Start + (timelineWidth / 2);
    
    var lineLength = tickLength * item['distance'];
    var y_sz = yStart + lineLength;
    firstEventElts['connection'].transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('d', line([
            [xCenter, yStart],
            [xCenter, y_sz]
        ]));

    var nameLines = ('nameLines' in item) ? item['nameLines'] : 1;
    y_sz += padding + nameLines * nameHeight;
    firstEventElts['name'].transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('x', xCenter)
        .attr('y', y_sz - (nameLines - 1) * nameHeight);

    childNames = firstEventElts['name'].selectAll('tspan');
    childNames.transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('x', xCenter)
        .attr('y', y_sz - (nameLines - 1) * nameHeight);

    y_sz += padding + dateHeight;
    firstEventElts['date'].transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('x', xCenter)
        .attr('y', y_sz);

    if ('image' in item && item['image'] !== '') {
        y_sz += padding + imageSize;
        firstEventElts['image'].transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr('x', xCenter - (imageSize / 2))
            .attr('y', y_sz - imageSize);
    }

    var textLines = ('textLines' in item) ? item['textLines'] : 3;
    y_sz += padding + textLines * textHeight;
    firstEventElts['text'].transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('fill', crimson)
        .attr('x', xCenter)
        .attr('y', y_sz - (textLines - 1) * textHeight);
   
    // children lines are stored in "tspans" to allow for wrapping, move those
    childTexts = firstEventElts['text'].selectAll('tspan');
    childTexts.transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('x', xCenter)
        .attr('y', y_sz - (textLines - 1) * textHeight);

    y_sz += 2 * padding + circleSize;
    firstEventElts['point'].transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('cx', xCenter)
        .attr('cy', y_sz);
}

// displays a timeline event located at (x, y)
function displayItem(svg, item, x, y, opacity) {
    var items = []; // list of all items created, to be returned 

    var xCenter = x + (timelineWidth / 2);
    var y_sz = y;

    // draw the connecting line
    var lineLength = tickLength * item['distance'];
    y_sz += lineLength;
    var connection = svg.append('path')
        .attr('d', line([
            [xCenter, y],
            [xCenter, y_sz]
        ]))
        .attr('stroke', timelineColor)
        .style('opacity', opacity)
        .attr('stroke-width', 3);
    firstEventElts['connection'] = connection;
    items.push(connection);
    
    // show the event name
    var nameLines = ('nameLines' in item) ? item['nameLines'] : 1;
    y_sz += padding + nameLines * nameHeight;
    var name = svg.append('text')
        .attr('x', xCenter)
        .attr('y', y_sz - (nameLines - 1) * nameHeight)
        .attr('width', 0.9 * timelineWidth)
        .attr('height', nameLines * nameHeight)
        .style('font-family', nameFont)
        .style('font-size', nameSize)
        .style('text-anchor', 'middle')
        .style('fill', nameColor)
        .style('opacity', opacity)
        .text(item['name'])
        .call(wrap, 0.9 * timelineWidth);
    firstEventElts['name'] = name;
    items.push(name);
    items.push(name.selectAll('tspan'));

    // show the event date
    y_sz += padding + dateHeight;
    var date = svg.append('text')
        .attr('x', xCenter)
        .attr('y', y_sz)
        .attr('width', timelineWidth)
        .attr('height', dateHeight)
        .style('font-family', dateFont)
        .style('font-size', dateSize)
        .style('text-anchor', 'middle')
        .style('fill', dateColor)
        .style('opacity', opacity)
        .text(item['date']);
    firstEventElts['date'] = date;
    items.push(date);

    // show the image, if there is one
    if ('image' in item && item['image'] !== '') {
        y_sz += padding + imageSize;
        var image = svg.append('image')
            .attr(imgMethod, item['image'])
            .attr('x', xCenter - (imageSize / 2))
            .attr('y', y_sz - imageSize)
            .attr('width', imageSize)
            .attr('height', imageSize)
            .style('opacity', opacity)
        firstEventElts['image'] = image;
        items.push(image);
    }

    // show the description
    var textLines = ('textLines' in item) ? item['textLines'] : 3;
    y_sz += padding + textLines * textHeight;
    var description = svg.append('text')
        .attr('x', xCenter)
        .attr('y', y_sz - (textLines - 1) * textHeight)
        .attr('width', timelineWidth)
        .attr('height', textLines * textHeight)
        .style('font-family', textFont)
        .style('font-size', textSize)
        .style('text-anchor', 'middle')
        .style('fill', textColor)
        .style('opacity', opacity)
        .text(item['text'])
        .call(wrap, timelineWidth);
    firstEventElts['text'] = description;
    items.push(description);
    items.push(description.selectAll('tspan'));

    // show a point at the bottom
    y_sz += 2 * padding + circleSize;
    var point = svg.append('circle')
        .attr('cx', xCenter)
        .attr('cy', y_sz)
        .attr('r', circleSize / 2)
        .attr('fill', timelineColor)
        .style('opacity', opacity);
    firstEventElts['point'] = point;
    items.push(point);

    return items;
}

function eventHeight(item) {
    var y_sz = 0;
    y_sz += tickLength * item['distance']; // distance
    var nameLines = ('nameLines' in item) ? item['nameLines'] : 1;
    y_sz += padding + nameLines * nameHeight; // name
    y_sz += padding + dateHeight; // date
    if ('image' in item && item['image'] !== '')
        y_sz += padding + imageSize; // image size
    var textLines = ('textLines' in item) ? item['textLines'] : 3;
    y_sz += padding + textLines * textHeight; // text
    y_sz += 2 * padding + circleSize; // circle
    return y_sz;
}

function totalEventHeight(data) {
    var max = null;
    for (var i = 0; i < data.length; i++) {
        var curHeight = 0;
        for (var j = 0; j < data[i].length; j++) {
            curHeight += eventHeight(data[i][j]);
        }
        if (max === null || curHeight > max)
            max = curHeight;
    }
    return max;
}
