document.addEventListener('DOMContentLoaded', function () {
    var theText = document.getElementById('theText');
    var params = new URLSearchParams(window.location.search.substring(1));

    theText.innerText = params.get('t');

    fitty('#theText', {
        minSize: 75,
        maxSize: 200
    });

    function genRandColor() {
        function t() {
            return Math.floor(256 * Math.random())
        }
        return "rgb(" + t() + "," + t() + "," + t() + ")"
    }
    var randomColors = [
        function () {
            return [genRandColor(), genRandColor()]
        }
    ];
    ConfettiHelper.confetti(randomColors);
});
