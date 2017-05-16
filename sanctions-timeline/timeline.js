window.onload = function() {
    render();
};

var originX = 0;
var originY = 0;

function render() {
    var canvas = d3.select('#ethnic-studies')
        .style('width', px(graphicWidth));

    var svg = canvas.append('svg')
        .style('width', px(graphicWidth))
        .style('height', px(graphicWidth))
        .style('margin-left', px(padding))
        .style('margin-right', px(padding));
}

