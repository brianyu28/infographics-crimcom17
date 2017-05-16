window.onload = function() {
    render();
};

function render() {
    var canvas = d3.select('#ethnic-studies')
        .style('width', px(graphicWidth));

    makeHeadline(canvas);
}

function makeHeadline(canvas) {
    // show primary headline 
    var headline = canvas.append('div')
        .style('margin-left', px(padding))
        .style('margin-right', px(padding))
        .style('text-align', 'center')
        .style('font-size', px(28))
        .style('font-family', mainFont)
        .html('<span style="font-size:48px;color:#004e6a">44</span> years, \
                <span style="font-size:48px;color:#004e6a">12</span> proposals.');

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
