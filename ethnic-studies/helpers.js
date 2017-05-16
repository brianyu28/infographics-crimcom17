function px(x) {
    return x + 'px';
}

var line = d3.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; });
