window.onload = function() {
    render();
    
    // change all other buttons back to normal, color in this button
    function colorButton(button) {
        d3.selectAll('button')
            .transition()
            .style('background-color', blue3);
        button
            .transition()
            .style('background-color', blue2);
    }

    document.getElementById("rearrange-profession").onclick = function(){
        colorButton(d3.select(this));
        transitionTo('profession');
    }
    document.getElementById("rearrange-alumni").onclick = function(){
        colorButton(d3.select(this));
        transitionTo('alumni');
    }
    document.getElementById("rearrange-appointed").onclick = function(){
        colorButton(d3.select(this));
        transitionTo('appointed');
    }
    document.getElementById("rearrange-experience").onclick = function(){
        colorButton(d3.select(this));
        transitionTo('experience');
    }
};

var points = [];

var svg;

function render() {
    var canvas = d3.select('#corporation-infographic')
        .style('width', px(graphicWidth));
    addHeadline(canvas);
    
    svg = canvas.append('svg')
        .style('width', px(graphicWidth))
        .style('height', px(graphicHeight))
        .style('margin-left', px(padding))
        .style('margin-right', px(padding));

    drawInitialPositions();
}

function addHeadline(canvas) {
    var headline = canvas.insert('div', 'div')
        .style('margin-left', px(padding))
        .style('margin-right', px(padding))
        .style('text-align', 'center')
        .style('font-size', px(28))
        .style('font-family', headlineFont)
        .text('The Making of a Corporation Member');
}

// draws person i centered at location (x, y)
var visibleNameElts = [];
function drawImage(i, x, y) {
    // draw the actual image
    var img = svg.append('image')
        .attr(imgMethod, data[i]['image'])
        .attr('x', x - (imageSize / 2))
        .attr('y', y - (imageSize / 2))
        .attr('width', imageSize)
        .attr('height', imageSize);
    points.push(img);

    // on hover, display information
    img.on('mouseover', function() {
        showName(img, i);
    })
    .on('click', function() {
        showName(img, i);
    })
    .on('mouseout', function() {
        hideVisibleName();
    });

    // function to show the name
    function showName(img, i) {
    
        // returns the number of pixels wide the name needs to be
        function requiredNameLength(name) {
            if (name.length < 17)
                return 120;
            else if (name.length < 20)
                return 140;
            else if (name.length < 23)
                return 150;
            else
                return 170;
        }
    
        nameBoxWidth = requiredNameLength(data[i]['name']);
        var rect = svg.append('rect')
            .attr('x', parseFloat(img.attr('x')) - (nameBoxWidth - imageSize) / 2)
            .attr('y', parseFloat(img.attr('y')) + imageSize - padding)
            .attr('width', nameBoxWidth)
            .attr('height', nameBoxHeight)
            .style('fill', nameBoxColor);
        visibleNameElts.push(rect);

        var name = svg.append('text')
            .attr('x', parseFloat(img.attr('x')) + (imageSize / 2))
            .attr('y', parseFloat(img.attr('y')) + imageSize + nameBoxHeight - 1.8 * padding)
            .style('fill', textColor)
            .style('font-family', nameFont)
            .style('font-size', nameSize)
            .style('text-anchor', 'middle')
            .text(data[i]['name']);
        visibleNameElts.push(name);
    }
}

function hideVisibleName() {
    for (var i = 0; i < visibleNameElts.length; i++)
        visibleNameElts[i].remove();
    visibleNameElts = [];
}

function drawInitialPositions() {
    for (var i = 0; i < data.length; i++) {
        if (data[i]['locations']['initial'].length == 0)
            continue;
        drawImage(i, data[i]['locations']['initial'][0], data[i]['locations']['initial'][1]);
    }
}

currentLabels = [];
function transitionTo(page) {

    // erase existing labels
    for (var i = 0; i < currentLabels.length; i++) {
        currentLabels[i].remove();
    }
    currentLabels = [];

    // show the labels
    for (var i = 0; i < labels[page].length; i++) {

        if (labels[page][i][1].length == 0)
            continue;

        var curLabel = svg.append('text')
            .attr('x', labels[page][i][1][0])
            .attr('y', labels[page][i][1][1])
            .style('text-anchor', 'center')
            .style('font-family', lato)
            .style('font-size', labelSize) 
            .text(labels[page][i][0]);
        currentLabels.push(curLabel);
    }

    // move all of the bubbles
    for (var i = 0; i < data.length; i++) {

        // don't move if there's no point
        if (data[i]['locations'][page].length == 0)
            continue;

        // move the point
        points[i].transition()
            .duration(500)
            .ease(d3.easeLinear)
            .attr('x', data[i]['locations'][page][0])
            .attr('y', data[i]['locations'][page][1]);
    }
}
