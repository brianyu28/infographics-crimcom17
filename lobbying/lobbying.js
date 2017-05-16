window.onload = function() {
    render();
};

var originX = 0;
var originY = 0;

var rows; // number of rows
var colLength;

function render() {
    var canvas = d3.select('#lobbying-graphic')
        .style('width', px(graphicWidth));
    makeHeadline(canvas);

    rows = Math.ceil(data.length / imagesPerRow);
    var requiredHeight = (rows + 1) * (2 * padding) + (rows * imageSize);
    var svg = canvas.append('svg')
        .style('width', px(graphicWidth))
        .style('height', px(requiredHeight))
        .style('margin-left', px(padding))
        .style('margin-right', px(padding));
   
    colLength = graphicWidth / imagesPerRow;
    var endPadding = colLength - imageSize;
    var baseX = originX + colLength - (endPadding / 2) - imageSize;
    var currentX = baseX;
    var currentY = originY + 2 * padding;

    for (var i = 0; i < data.length; i++) {
    
        // reset x and y to a new row if we need to
        if (i % imagesPerRow === 0) {
            currentX = baseX;
            if (i !== 0)
                currentY += imageSize + 2 * padding;
        }
    
        drawPoint(svg, currentX, currentY, i);
        currentX += colLength;
    }
}

function makeHeadline(canvas) {
    // show primary headline 
    var headline = canvas.append('div')
        .style('margin-left', px(padding))
        .style('margin-right', px(padding))
        .style('text-align', 'center')
        .style('font-size', px(28))
        .style('font-family', mainFont)
        .text('Lawmakers University President Drew G. Faust has met with recently');

}

function drawPoint(svg, x, y, i) {
    var image = svg.append('image')
        .attr('xlink:href', data[i]['image'])
        .attr('x', x)
        .attr('y', y)
        .attr('width', imageSize)
        .attr('height', imageSize)
        .on('mouseover', function() {
            showDetail(svg, i, x, y);
        })
        .on('mouseout', function() {
            hideDetail();
        });
    animate(svg, image, data[i]['group']);
}

details = [];

function showDetail(svg, i, x, y) {

    group = parseInt(data[i]['group']);

    hideDetail();
    
    var rectWidth = 150;
    var rectHeight = 40;

    var rectX;
    var column = Math.floor(x / (colLength + 2 * padding));
    if (column < (imagesPerRow - 1) / 2)
        rectX = x + 0.75 * imageSize;
    else if (column > (imagesPerRow - 1) / 2)
        rectX = x + 0.25 * imageSize - rectWidth;
    else
        rectX = x + 0.5 * imageSize - (rectWidth / 2);

    var rectY;
    var row = Math.floor(i / imagesPerRow);
    if (row > (rows - 1) / 2)
        rectY = y - 0.25 * imageSize;
    else if (row < (rows - 1) / 2)
        rectY = y + 0.75 * imageSize;
    else
        rectY = y;

    rectX = x + (imageSize / 2) - (rectWidth / 2);
    rectY = y + (imageSize) - (rectHeight / 2);
    var rect = svg.append('rect')
        .attr('x', rectX)
        .attr('y', rectY)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', colorForGroup(group));
    details.push(rect);

    var name = svg.append('text')
        .attr('x', rectX + (rectWidth / 2))
        .attr('y', rectY + (2 * rectHeight / 5))
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .style('font-family', mainFont)
        .style('font-size', textSize)
        .style('text-anchor', 'middle')
        .style('fill', textColor)
        .text(data[i]['name']);
    details.push(name);

    var detail = svg.append('text')
        .attr('x', rectX + (rectWidth / 2))
        .attr('y', rectY + (4 * rectHeight / 5))
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .style('font-family', mainFont)
        .style('font-size', textSize)
        .style('text-anchor', 'middle')
        .style('fill', textColor)
        .text(data[i]['detail']);
    details.push(detail);
};

function hideDetail() {
    for (var i = 0; i < details.length; i++) {
        details[i].remove();
    }
    details = [];
}

function colorForGroup(i) {
    if (i == 1)
        return blue1;
    else if (i == 2)
        return crimson;
    else
        return green;
}

function animate(svg, point, group) {
    for (var i = 0; i < glowSize; i++) {
        var circleSize = (imageSize / 2) + i;
        var glow = svg.insert('circle', 'image')
            .attr('cx', parseFloat(point.attr('x')) + parseFloat(point.attr('width'))/2)
            .attr('cy', parseFloat(point.attr('y')) + parseFloat(point.attr('height'))/2)
            .attr('r', circleSize)
            .style('fill', 'none')
            .style('stroke', colorForGroup(group))
            .style('stroke-opacity', 1 - (i / glowSize));
    }
}
