/*var hoursElem = document.getElementById('hours');
var minutesElem = document.getElementById('minutes');
var secondsElem = document.getElementById('seconds');
var meridiemElem = document.getElementById('meridiem');*/

var settings = settings || { onColor: "#00F", offColor: '#FFF' };

var sec_0_0 = document.getElementById("sec_0_0");
var sec_0_1 = document.getElementById("sec_0_1");
var sec_0_2 = document.getElementById("sec_0_2");
var sec_0_3 = document.getElementById("sec_0_3");

var sec_1_0 = document.getElementById("sec_1_0");
var sec_1_1 = document.getElementById("sec_1_1");
var sec_1_2 = document.getElementById("sec_1_2");

function drawSeconds(seconds) {
    var ones = seconds % 10;
    var tens = (seconds - ones) / 10;
    sec_0_0.style.fill = (ones & 0x1) === 0 ? settings.offColor : settings.onColor;
    sec_0_1.style.fill = (ones & 0x2) === 0 ? settings.offColor : settings.onColor;
    sec_0_2.style.fill = (ones & 0x4) === 0 ? settings.offColor : settings.onColor;
    sec_0_3.style.fill = (ones & 0x8) === 0 ? settings.offColor : settings.onColor;

    sec_1_0.style.fill = (tens & 0x1) === 0 ? settings.offColor : settings.onColor;
    sec_1_1.style.fill = (tens & 0x2) === 0 ? settings.offColor : settings.onColor;
    sec_1_2.style.fill = (tens & 0x4) === 0 ? settings.offColor : settings.onColor;
}

var min_0_0 = document.getElementById("min_0_0");
var min_0_1 = document.getElementById("min_0_1");
var min_0_2 = document.getElementById("min_0_2");
var min_0_3 = document.getElementById("min_0_3");

var min_1_0 = document.getElementById("min_1_0");
var min_1_1 = document.getElementById("min_1_1");
var min_1_2 = document.getElementById("min_1_2");

function drawMinutes(minutes) {
    var ones = minutes % 10;
    var tens = (minutes - ones) / 10;
    min_0_0.style.fill = (ones & 0x1) === 0 ? settings.offColor : settings.onColor;
    min_0_1.style.fill = (ones & 0x2) === 0 ? settings.offColor : settings.onColor;
    min_0_2.style.fill = (ones & 0x4) === 0 ? settings.offColor : settings.onColor;
    min_0_3.style.fill = (ones & 0x8) === 0 ? settings.offColor : settings.onColor;

    min_1_0.style.fill = (tens & 0x1) === 0 ? settings.offColor : settings.onColor;
    min_1_1.style.fill = (tens & 0x2) === 0 ? settings.offColor : settings.onColor;
    min_1_2.style.fill = (tens & 0x4) === 0 ? settings.offColor : settings.onColor;
}

var hour_0_0 = document.getElementById("hour_0_0");
var hour_0_1 = document.getElementById("hour_0_1");
var hour_0_2 = document.getElementById("hour_0_2");
var hour_0_3 = document.getElementById("hour_0_3");

var hour_1_0 = document.getElementById("hour_1_0");
var hour_1_1 = document.getElementById("hour_1_1");

function drawHours(hours) {
    var ones = hours % 10;
    var tens = (hours - ones) / 10;
    hour_0_0.style.fill = (ones & 0x1) === 0 ? settings.offColor : settings.onColor;
    hour_0_1.style.fill = (ones & 0x2) === 0 ? settings.offColor : settings.onColor;
    hour_0_2.style.fill = (ones & 0x4) === 0 ? settings.offColor : settings.onColor;
    hour_0_3.style.fill = (ones & 0x8) === 0 ? settings.offColor : settings.onColor;

    hour_1_0.style.fill = (tens & 0x1) === 0 ? settings.offColor : settings.onColor;
    hour_1_1.style.fill = (tens & 0x2) === 0 ? settings.offColor : settings.onColor;
}

function draw() {
    var time = new Date();
    //var meridiem = false;
    var hours = time.getHours();
    /*if (hours >= 12) {
        hours -= 12;
        meridiem = true;
    }
    if (hours === 0) {
        hours = 12;
    }*/
    var seconds = time.getSeconds();
    var minutes = time.getMinutes();
    drawSeconds(seconds);
    drawMinutes(minutes);
    drawHours(hours);


    /*hoursElem.innerHTML = hours;
    minutesElem.innerHTML = time.getMinutes();
    secondsElem.innerHTML = time.getSeconds();
    meridiemElem.innerHTML = meridiem;*/

    setTimeout(draw, 50);
}

setTimeout(draw, 10);