window.onload = function() {
    render();
}

function render() {
    var data = [
        ["", 137754],
        [2004, 145281],
        [" ", 155113],
        ["   ", 169963],
        [2007, 193164],
        ["    ", 213919],
        ["     ", 227673],
        [2010, 242212],
        ["      ", 260390],
        ["       ", 281317],
        [2013, 290760],
        ["        ", 321584],
        ["         ", 345488],
        [2016, 381068]
    ];
    var coords = {
        "x": 0, "y": 0, 
        "width": 600, "height": 600,
        "axisPadding": 80
    };
    var yAttrs = {
        "min": 0,
        "max": 400000,
        "ticks": 5
    };
    addHeadline('#executive-education-graphic', 550, 'Revenue from continuing education and executive programs');
    var svg = createSVG('#executive-education-graphic', 'executive-education-svg', 600, 600, 10);
    var axes = drawDiscreteLineGraph(svg, coords, data, yAttrs,
            {"y-label": "Revenue (in thousands of dollars)", "color": "#a82931", "pointColor": "#a82931"});
}

