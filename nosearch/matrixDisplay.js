var symbolHelper = {};

var canv;
var buf;

var buf_ctx;
var ctx;

var front_lines = [];

document.addEventListener('DOMContentLoaded', function() {
    canv = document.getElementById('AwesomeMatrixCanvasDisplay');
    buf = document.getElementById('AwesomeMatrixCanvasBuffer');
    buf_ctx = buf.getContext("2d");
    ctx = canv.getContext("2d");
    if (0.05 > Math.random()) {
        linesPerUpdate *= (0.5 > Math.random() ? (0.5 > Math.random() ? 1.35 : 1.5) : 2);
    } else if (0.0005 > Math.random()) {
        linesPerUpdate *= 3;
    }

    var symbolSprite = new Image();
    symbolSprite.src = "matrix_code_spritesheet.png";

    symbolHelper.drawSymbol = function(charId, collumn, row, small) {
        var drawSize = 25;
        drawSize /= small;
        buf_ctx.drawImage(symbolSprite, charId * 25, 0, 25, 25, collumn * drawSize, row * drawSize, drawSize, drawSize);
    };

    for (var i = 0; i < 30; i++) {
        update();
    }

    loop = true;
    update();
});

var frontLineSpaces = {
    first: [],
    second: [],
    third: [],
    fourth: []
};

function Line() {
    this.isFront = Math.random() > 0.5 ? 1 : Math.random() > 0.3 ? 2 : Math.random() > 0.25 ? 4 : 8;
    this.row = 0;
    this.maxLen = 29 * this.isFront;
    var maxCol = 53 * this.isFront;
    var lineGroup = frontLineSpaces;
    
    var i = 0;
    do {
        this.collumn = Math.floor(Math.random() * maxCol);
        i++;
    } while (i < 100 && (lineGroup.second.includes(this.collumn) || lineGroup.third.includes(this.collumn) || lineGroup.fourth.includes(this.collumn)));
}

Line.prototype.update = function() {
    var nextChar = Math.floor(Math.random() * 54);
    this.draw(nextChar);
    this.row++;
    if (this.row > this.maxLen) {
        this.destroy();
    }
};

Line.prototype.draw = function(nextChar) {
    symbolHelper.drawSymbol(nextChar, this.collumn, this.row, this.isFront);
};

Line.prototype.destroy = function() {
    var idx = front_lines.indexOf(this);
    
    if (idx != -1) {
        front_lines.splice(idx, 1);
    }
};

function createLine(chance) {
    function secondaryCreateLine() {
        var ln = new Line();
        frontLineSpaces.first.push(this.collumn);
        front_lines.push(ln);
    }
    var times = 1;

    while (times <= chance) {
        times++;
    }
    var realChance = chance / times;
    for (var i = 0; i < times; i++) {
        if (realChance > Math.random()) {
            secondaryCreateLine();
        }
    }
}

var baseLinesPerUpdate = 1.8;
var linesPerUpdate = baseLinesPerUpdate;
var loop = false;

function update() {
    // Fade the page
    buf_ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    buf_ctx.fillRect(0, 0, buf.width, buf.height);

    frontLineSpaces.fourth = frontLineSpaces.third;
    frontLineSpaces.third = frontLineSpaces.second;
    frontLineSpaces.second = frontLineSpaces.first;
    frontLineSpaces.first = [];

    createLine(linesPerUpdate);

    front_lines.forEach(function(x) {
        x.update();
    });

    if (Math.random() < 0.0005) {
        linesPerUpdate = baseLinesPerUpdate * (0.5 > Math.random() ? (0.5 > Math.random() ? 1.35 : 1.5) : (0.5 > Math.random() ? 0.9 : 0.75));
    }
    
    if (loop) {
        ctx.drawImage(buf, 0, 0);
        setTimeout(update, 100);
    }
}