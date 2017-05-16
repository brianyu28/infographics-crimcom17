function px(x) {
    return x + 'px';
}

function animatePoint(point, x, y, radius, growth, delay) {

    point.transition()
        .delay(delay)
        .on('end', runAnimation);

    function runAnimation() {
        point.transition()
            .duration(1000)
            .attr('r', radius + growth)
            .attr('cx', x - (growth / 2))
            .attr('cy', y - (growth / 2))
            .ease(d3.easeLinear)
            .transition()
            .duration(1000)
            .attr('r', radius)
            .attr('cx', x)
            .attr('cy', y)
            .ease(d3.easeLinear)
            .on('end', runAnimation);
    }
}

var line = d3.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; });


function disableSelection(text) {
    text.style('-webkit-touch-callout', 'none')
        .style('-webkit-user-select', 'none')
        .style('-khtml-user-select', 'none')
        .style('-moz-user-select', 'none')
        .style('-ms-user-select', 'none')
        .style('-o-user-select', 'none')
        .style('user-select', 'none')
}

// adapted text wrap function
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}
