// This code was written in 2016

var rings, ringDat;

// Data for drawing the rings
// These are all in percents except delay, which is milliseconds
var preset8 = {
    // The total number of rings
    size: 8,
    // Delay before next update
    delay: 500,
    // Ring Height, default: 5
    h: 5,
    // Ring width decrease amount, default: 3
    widDec: 3,
    // The width of the bottom ring, default: 30
    startWidth: 30,
    // The width of the towers, default: 1
    towerW: 1,
    // The height of the towers, default: 80
    towerH: 80
};

var preset16 = {
    // The total number of rings
    size: 16,
    // Delay before next update
    delay: 500,
    // Ring Height, default: 5
    h: 3,
    // Ring width decrease amount, default: 4
    widDec: 1.4,
    // The width of the bottom ring, default: 30
    startWidth: 30,
    // The width of the towers, default: 1
    towerW: 1,
    // The height of the towers, default: 75
    towerH: 80
};

var preset32 = {
    // The total number of rings
    size: 32,
    // Delay before next update
    delay: 500,
    // Ring Height, default: 5
    h: 2.8, //3,
    // Ring width decrease amount, default: 4
    widDec: 0.8, //1.6,
    // The width of the bottom ring, default: 30
    startWidth: 30,
    // The width of the towers, default: 1
    towerW: 0.5,
    // The height of the towers, default: 75
    towerH: 90
};

var preset64 = {
    // The total number of rings
    size: 64,
    // Delay before next update
    delay: 500,
    // Ring Height, default: 5
    h: 1.4, //3,
    // Ring width decrease amount, default: 4
    widDec: 0.4, //1.6,
    // The width of the bottom ring, default: 30
    startWidth: 30,
    // The width of the towers, default: 1
    towerW: 0.5,
    // The height of the towers, default: 75
    towerH: 90
};

var settingsOpened = false;

function presetSelect() {
    var preset = getSelectedPreset();
    populateGui(preset);
    
}

function checkNum(elem) {
    var i = parseFloat(elem.value);
    if (!i || i < 0) {
        elem.value = "0";
    } else if (i > 100) {
        elem.value = "100";
    }
}

function isNum(e, elem) {
    const validNums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // Can't just return this, if statement checks if elem is undefined,
    // if we just returned this it would return undefined and work sometimes.
    if (validNums.includes(e.key) || (elem && !elem.value.includes('.') && e.key == '.')) {
        return true;
    }
    return false;
}

function populateGui(settingsData) {
    document.getElementById("rHtTxt").value = settingsData.h;
    document.getElementById("rWdDTxt").value = settingsData.widDec;
    document.getElementById("bRWdTxt").value = settingsData.startWidth;
    document.getElementById("tWdTxt").value = settingsData.towerW;
    document.getElementById("tHtTxt").value = settingsData.towerH;
    document.getElementById("rCtTxt").value = settingsData.size;
    document.getElementById("upDlyTxt").value = settingsData.delay;
}

function saveFromGui() {
    ringDat.h = parseFloat(document.getElementById("rHtTxt").value) || 0;
    ringDat.widDec = parseFloat(document.getElementById("rWdDTxt").value) || 0;
    ringDat.startWidth = parseFloat(document.getElementById("bRWdTxt").value) || 0;
    ringDat.towerW = parseFloat(document.getElementById("tWdTxt").value) || 0;
    ringDat.towerH = parseFloat(document.getElementById("tHtTxt").value) || 0;
    ringDat.size = parseFloat(document.getElementById("rCtTxt").value) || 0;
    ringDat.delay = parseFloat(document.getElementById("upDlyTxt").value) || 0;
}

function settingsGui() {
    settingsOpened = paused = true;
    populateGui(ringDat);
    document.getElementById("settingsPage").style.display = "block";
}

function closeSettings(i) {
    // save
    if (i == 1) {
        saveFromGui();
        reset(true);
    } else if (i == 2) {
        reset(true);
    }
    document.getElementById("settingsPage").style.display = "none";
    paused = settingsOpened = false;
}


var defPreset = preset8;
ringDat = JSON.parse(JSON.stringify(defPreset)); // To copy it. There might be more efficient ways.

function getSelectedPreset() {
    var val = document.getElementById("presetSelect").value;
    if (val == 8) {
        return preset8;
    } else if (val == 16) {
        return preset16;
    } else if (val == 32) {
        return preset32;
    } else if (val == 64) {
        return preset64;
    } else {
        return defPreset;
    }
}

function evalClick(value) {
    try {
        eval(value);
    } catch (err) {
        alert(err);
    }
}

function getState(input) {
    return CreateBigInt((input.value || "").replace(/,/g, ''), true);
}

function validState(input) {
    var state = getState(input);
    if (state.greaterThan(total))
        input.value = total.toString();
}

function computeMoves(ringCount) {
    var ret = "";
    for (var i = 0; i < Math.floor(ringCount / 4); i++) {
        ret += "F";
    }
    switch (ringCount % 4) {
    case 3:
        ret = "7" + ret;
        break;
    case 2:
        ret = "3" + ret;
        break;
    case 1:
        ret = "1" + ret;
        break;
    default:
        break;
    }
    return CreateBigInt(ret);
}

function jumpToState(input) {
    
    function moveAll(idx, fromT, toT) {
        for (var i = idx; i < ringDat.size; i++) {
            set(fromT, i, false);
            set(toT, i, true);
        }
    }
    
    
    reset();
    var state = getState(input);
    moves = state.copy();
    setLeft();
    left.sub(moves);
    
    var toMove = state.toMovableRings();
    
    for (var i = 0; i < toMove.length; i++) {
        var ring = toMove[i];
        if (ring < ringDat.size - 1) {
            var aboveRing = ring + 1;
            var oldT = getTower(aboveRing);
            var newT = aboveRing % 2 == 0 ? leftT(oldT) : rightT(oldT);
            moveAll(aboveRing, oldT, newT);
        }
        var ringT = getTower(ring);
        var newRingT = ring % 2 == 0 ? leftT(ringT) : rightT(ringT);
        set(ringT, ring, false);
        set(newRingT, ring, true);
        updateDraw();
    }
    
    stack = [];
    instructions = [];

    for (var i = ringDat.size - 1; i >= 0; i--) {
        stack.push([i, 2]);
    }
    closeSettings();
    updateDraw();
	paused = true;
}
