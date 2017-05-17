window.onload = function() {
    render();
};

var originX = 0;
var originY = 0;

var datalen;

function render() {
    var canvas = d3.select('#hls-admissions-infographic')
        .style('width', px(fullWidth));
    makeHeadline(canvas);

    var svg = canvas.append('svg')
        .style('width', px(fullWidth))
        .style('height', px(fullHeight))
        .style('margin-left', px(padding))
        .style('margin-right', px(padding));

    var graphX = padding;
    var graphY = padding;
    var graphWidth = fullWidth - 2 * padding;
    var graphHeight = 500; 
    makeGraph(svg, graphX, graphY, graphWidth, graphHeight);
}

function makeHeadline(canvas) {
    var headline = canvas.append('div')
        .style('margin-left', px(padding))
        .style('margin-right', px(padding))
        .style('text-align', 'center')
        .style('font-size', px(28))
        .style('font-family', mainFont)
        .text('HLS Applications Over the Years');
}

function makeGraph(svg, x, y, width, height) {

    datalen = data.length;

    // set amount of padding around the axis
    var axisPadding = 20;

    // draw the x axis
    var xaxis = svg.append('path')
        .attr('d', line([
            [x + 2 * axisPadding, y + height - axisPadding],
            [x + width - axisPadding, y + height - axisPadding]
        ]))
        .attr('stroke', graphColor)
        .attr('stroke-width', 4);

    // draw the x ticks
    var xTotalLength = width - 3 * axisPadding; 
    var separator = xTotalLength / (datalen - 1);
    var currentTick = x + axisPadding;
    for (var i = 0; i < datalen; i++) {
    
        // draw the actual tick, unless it's the first index
        if (i !== 0) {
            var tick = svg.append('path')
                .attr('d', line([
                    [currentTick + axisPadding, y + height - axisPadding - (tickLength / 2)],
                    [currentTick + axisPadding, y + height - axisPadding + (tickLength / 2)]
                ]))
                .attr('stroke', graphColor)
                .attr('stroke-width', 2);
        }

        // draw the year
        var year = svg.append('text')
            .attr('x', axisPadding + currentTick)
            .attr('y', y + height + axisPadding - padding)
            .attr('width', separator)
            .attr('height', axisPadding)
            .style('font-family', mainFont)
            .style('font-size', textSize)
            .style('fill', graphColor)
            .style('text-anchor', 'middle')
            .text(data[i]['year']);

        currentTick += separator;
    }

    // draw the y axis
    var yaxis = svg.append('path')
        .attr('d', line([
            [x + 2 * axisPadding, y + axisPadding],
            [x + 2 * axisPadding, y + height - axisPadding + 2]  // extra 2 to cover intersect
        ]))
        .attr('stroke', graphColor)
        .attr('stroke-width', 4);
    
    var yTotalLength = height - 2 * axisPadding;
    var yTickCount = ((yMax - yMin) / yInterval) + 1;
    var ySeparator = yTotalLength / (yTickCount - 1);
    var currentTick = y + height - axisPadding;
    for (var i = 0; i < yTickCount; i++) {

        // draw physical tick if not the first index
        if (i !== 0) {
            var tick = svg.append('path')
                .attr('d', line([
                    [x + 2 * axisPadding - (tickLength / 2), currentTick],
                    [x + 2 * axisPadding + (tickLength / 2), currentTick]
                ]))
                .attr('stroke', graphColor)
                .attr('stroke-width', 2);
        }

        var applicants = svg.append('text')
            .attr('x', x + 2 * axisPadding - (tickLength / 2) - 5)
            .attr('y', currentTick + 5)
            .attr('width', separator)
            .attr('height', axisPadding)
            .style('font-family', mainFont)
            .style('font-size', textSize)
            .style('fill', graphColor)
            .style('text-anchor', 'end')
            .text(i * yInterval + yMin);

        currentTick -= ySeparator;
    }
    
    // define helper functions to define coordinates for years and applicants
    function xOfYearIndex(i) {
        return x + 2 * axisPadding + i * separator;
    }

    function yOfApplicants(applicants) {
        var proportion = (applicants - yMin) / (yMax - yMin);
        return y + height - axisPadding - (yTotalLength * proportion);
    }


    // get data points to draw line
    datapoints = [];
    for (var i = 0; i < datalen - 1; i++) {
        var curX = xOfYearIndex(i);
        var curY = yOfApplicants(data[i]['applicants']);
        datapoints.push([curX, curY]);
        drawPoint(svg, curX, curY);
    }

    svg.append('path')
        .attr('d', line(datapoints))
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', 4);

    // draw the additional information
    var sectionBaseY = y + height + 30;
    var sectionHeight = 70;
    var bubbleSize = 60;
    function drawAdditionalSection(e, num) {
        var xLoc = xOfYearIndex(e['index']);
        var yStart = sectionBaseY + num * sectionHeight + num * padding;

        /*
        svg.append('rect')
            .attr('x', x)
            .attr('y', yStart)
            .attr('width', width)
            .attr('height', sectionHeight)
            .style('fill', black);
            */
    
        // show the dot
        svg.append('circle')
            .attr('cx', xLoc)
            .attr('cy', yStart + (bubbleSize / 2) + 5)
            .attr('r', (bubbleSize / 2))
            .style('fill', blue3);

        // show the month
        svg.append('text')
            .attr('x', xLoc)
            .attr('y', yStart + 30)
            .style('text-anchor', 'middle')
            .style('font-family', mainFont)
            .style('font-size', textSize)
            .style('fill', textColor)
            .text(e['month']);
    
        // show the year
        svg.append('text')
            .attr('x', xLoc)
            .attr('y', yStart + 50)
            .style('text-anchor', 'middle')
            .style('font-family', mainFont)
            .style('font-size', textSize)
            .style('fill', textColor)
            .text(e['year']);

        // show the description
        svg.append('text')
            .attr('x', xLoc - bubbleSize / 2 - 10)
            .attr('y', yStart + 35)
            .attr('width', xLoc - bubbleSize - 20)
            .style('text-anchor', 'end')
            .style('font-family', mainFont)
            .style('font-size', textSize)
            .style('fill', textColor)
            .text(e['name'])
            .call(wrap, xLoc - bubbleSize - 20);
    }

    function drawDashedLine(i, bubblesDown) {
        var curX = xOfYearIndex(i);
        var startY = yOfApplicants(yMin);
        var endY = sectionBaseY + (bubblesDown - 1) * sectionHeight + (bubblesDown - 1) * padding;
        svg.append('path')
            .attr('d', line([
                [curX, startY],
                [curX, endY]
            ]))
            .attr('stroke', graphColor)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5 5');
    }
    
    // draw dashed lines: these are hardcoded
    drawDashedLine(4, 1);
    drawDashedLine(5, 3);
    drawDashedLine(9, 5);

    // loop through additional sections and draw
    for (var i = 0; i < events.length; i++) {
        drawAdditionalSection(events[i], i);
    }
}

function drawPoint(svg, x, y) {
    svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 5)
        .style('fill', lineColor);
}

