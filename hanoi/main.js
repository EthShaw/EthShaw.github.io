// This code was written in 2016
var left, total;

function setLeft() {
    left = computeMoves(ringDat.size);
    total = left.copy();
}

// If you are analyzing my code you may wonder why I didn't use an array
// instead of 64 bits of binary to represent each, I don't know, I just felt like it.
function reset(compelteReset) {
    rings = [ [], [], [] ];
    for (var i = 0; i < Math.ceil(ringDat.size / 32); i++) {
        rings[0].push(0xFFFFFFFF);
        rings[1].push(0x00000000);
        rings[2].push(0x00000000);
    }
    moves = CreateBigInt("0");
    setLeft();
    stack = [];
    instructions = [];

    for (var i = ringDat.size - 1; i >= 0; i--) {
        stack.push([i, 2]);
    }
    if (compelteReset) {
        var ring;
        var count = 0;
        while ((ring = document.getElementById("ring" + count++)) != null) {
            ring.remove();
        }
        setLeft();
        setup();
    }
    updateDraw();
}

function keyPressed(e) {
    if (settingsOpened) return;
    e = e || window.event;
    if (e.keyCode == 32) {
        paused = !paused;
    } else if (e.keyCode == 114) {
        reset();
    }
}

function getTower(ringID) {
    if (get(0, ringID)) {
        return 0;
    } else if (get(1, ringID)) {
        return 1;
    }
    return 2;
}

// Returns the next ring above ringID on the 
// specified tower, or -1 if ringID is on top.
function checkAbove(tower, ringID) {
    for (var i = ringID + 1; i < ringDat.size; i++) {
        if (get(tower, i)) {
            return i;
        }
    }
    return -1;
}

function get(tower, i) {
    return ((rings[tower][Math.floor(i / 32)] >> (i % 32)) & 0x1) == 1;
}

function set(tower, i, val) {
    if (val) {
        rings[tower][Math.floor(i / 32)] |= (0x1 << (i % 32));
    } else {
        rings[tower][Math.floor(i / 32)] &= (0xFFFFFFFF ^ (0x1 << (i % 32)));
    }
}

function updateDraw() {
    document.getElementById("movesText").textContent = "Moves so far: " + moves.toString();
    document.getElementById("movesLeft").textContent = "Moves left: " + left.toString();
    var count1 = 0,
        count2 = 0,
        count3 = 0;

    for (var i = 0; i < ringDat.size; i++) {
        var ring = document.getElementById("ring" + i);
        var xLoc = Math.max(((30 - (i * ringDat.widDec)) / 2), 0.5);
        if (get(0, i)) {
            ring.setAttributeNS(null, "x", (21 - xLoc) + "%");
            ring.setAttributeNS(null, "y", ((100 - ringDat.h) - (count1 * ringDat.h)) + "%");
            count1++;
        } else if (get(1, i)) {
            ring.setAttributeNS(null, "x", (50 - xLoc) + "%");
            ring.setAttributeNS(null, "y", ((100 - ringDat.h) - (count2 * ringDat.h)) + "%");
            count2++;
        } else {
            ring.setAttributeNS(null, "x", (79 - xLoc) + "%");
            ring.setAttributeNS(null, "y", ((100 - ringDat.h) - (count3 * ringDat.h)) + "%");
            count3++;
        }
    }

}

var instructions = [];
var moves;
function M(tower0, tower1) {
    for (var i = ringDat.size - 1; i >= 0; i--) {
        if (get(tower0, i)) {
            moves.inc();
            left.dec();
            set(tower0, i, false);
            set(tower1, i, true);
            break;
        }
    }
}

function leftT(tower) {
    return (tower + 2) % 3;
}

function rightT(tower) {
    return (tower + 1) % 3;
}

var stack = [];

function updateCompute() {
    if (stack.length == 0) {
        if (instructions.length == 0) {
            paused = true;
        }
        return true;
    }

    var next = stack[stack.length - 1];
    var t = getTower(next[0]);
    if (t == next[1]) {
        stack.pop();
        return;
    }
    var nextRing = checkAbove(t, next[0]);
    var nextSpace = checkAbove(next[1], next[0]);
    if (nextRing == -1) {
        if (nextSpace == -1) {
            // If there is nothing on top, move the instructed ring
            instructions.push([M, t, next[1]]);
            stack.pop();
        } else {
            stack.push([nextSpace, next[1] == leftT(t) ? rightT(t) : leftT(t)]);
        }
    } else {
        // We have to move the next ring the opposite direction of this one to clear the way.
        stack.push([nextRing, next[1] == leftT(t) ? rightT(t) : leftT(t)]);
    }
}

var instruct;
var paused = false;

function update() {
    try {
        if (!paused) {
            while (instructions.length == 0) {
                if (updateCompute()) {
                    setTimeout(update, ringDat.delay);
                    return;
                }
            }
            instruct = instructions.pop();
            instruct[0](instruct[1], instruct[2]);
            updateDraw();
        }
    /**/} catch (err) {
        alert(err);
    }/**/
    setTimeout(update, ringDat.delay);
}

function setup() {
    instructions.push([reset]);
    var colors = [0xFF0000, 0x00FF00, 0x0000FF, 0x900090, 0xFFFF00, 0x00FFFF, 0xFF4500];
    if (Math.random() > 0.4) {
        colors = [];
        randomColors(colors, ringDat.size);
    }
    var f = function (i, x) {
        var t = document.getElementById("tower" + i);
        t.setAttributeNS(null, "x", (x - (ringDat.towerW / 2)) + "%");
        t.setAttributeNS(null, "width", ringDat.towerW + "%");
        t.setAttributeNS(null, "y", (100 - ringDat.towerH) + "%");
        t.setAttributeNS(null, "height", ringDat.towerH + "%");
    }
    f(0, 21);
    f(1, 50);
    f(2, 79);

    var colorCount = 0;
    var svgElem = document.getElementById("mainSvgElement");
    for (var i = 0; i < ringDat.size; i++) {
        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttributeNS(null, "id", "ring" + i);
        var width = Math.max((ringDat.startWidth - (i * ringDat.widDec)), 1);
        rect.setAttributeNS(null, "width", width + "%");
        rect.setAttributeNS(null, "x", (width == 1 ? 6.5 : (6 + (i * (ringDat.widDec / 2)))) + "%");
        rect.setAttributeNS(null, "y", ((100 - ringDat.h) - (i * ringDat.h)) + "%");
        rect.setAttributeNS(null, "rx", "20");
        rect.setAttributeNS(null, "ry", "20");
        rect.setAttributeNS(null, "height", ringDat.h + "%");
        var colorStr = colors[colorCount++ % colors.length].toString(16);
        while (colorStr.length < 6) {
            colorStr = "0" + colorStr;
        }
        rect.style.fill = "#" + colorStr;
        svgElem.appendChild(rect);
    }
}

setup();
setTimeout(update, ringDat.delay);