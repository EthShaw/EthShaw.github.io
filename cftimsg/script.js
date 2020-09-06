function encodeText(s) {
    const HEX = "0123456789abcdef";
    const encoder = new TextEncoder('utf-8');
    const bytes = encoder.encode(s);
    let ret = "";

    for (let byte of bytes) {
        ret += HEX[byte >> 4];
        ret += HEX[byte & 0xF];
    }

    return ret;
}

function decodeText(hexStr) {
    const HEX = "0123456789abcdef";
    const byteStrs = hexStr.match(/../g);
    const bytes = [];

    for (let byteStr of byteStrs) {
        const nib0 = HEX.indexOf(byteStr.substring(0, 1)) << 4;
        const nib1 = HEX.indexOf(byteStr.substring(1, 2));
        const byte = nib0 | nib1;
        bytes.push(byte);
    }

    const decoder = new TextDecoder('utf-8');

    return decoder.decode(Uint8Array.from(bytes));
}

document.addEventListener('DOMContentLoaded', function () {
    let theText = document.getElementById('theText');
    let params = new URLSearchParams(window.location.search.substring(1));

    // Parameter x is a hexadecimal encoded, UTF-8 encoded version
    // of the text to display.
    let text = params.get('x');

    if (text) {
        text = decodeText(text);
    } else {
        // Legacy support for the t parameter that includes the actual text
        // instead of the hexadecimal encoding of it. If this parameter
        // doesn't exist either, there is no fallback, text is just null.
        text = params.get('t');
    }

    theText.innerText = text;

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
