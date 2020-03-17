// This code was written in 2016

String.prototype.reverse = function() {
    return this.split('').reverse().join('');
}

function CreateBigInt(dataStr, base10) {
    var dataIn = [];
    if (base10) {
        var base10Dat = [];
        base10Dat = dataStr.split('');
        dataIn.push(parseInt(base10Dat[0]));
        if (base10Dat.length > 1) {
            function checkCarry() {
                var carries;
                do {
                    carries = 0;
                    for (var i = dataIn.length - 1; i >= 0; i--) {
                        if (dataIn[i] > 0x7FFF) {
                            if (dataIn[i + 1] == undefined) {
                                dataIn[i + 1] = 0;
                            }
                            dataIn[i + 1] += (dataIn[i] >>> 15) & 0x7FFF;

                            dataIn[i] &= 0x7FFF;

                            carries++;
                        }
                    }
                } while (carries > 0);
            }
            for (var i = 1; i < base10Dat.length; i++) {
                for (var j = 0; j < dataIn.length; j++) {
                    dataIn[j] *= 10;
                }
                dataIn[0] += parseInt(base10Dat[i]);
                checkCarry();
                //alert(dataIn);
            }
            var s = ''; //CreateBigInt('281474976710655',true) = FFFFFFFFFFFF
            for (var i = 0; i < dataIn.length; i++) {
                s = dataIn[i].toString(16).toUpperCase() + ' ' + s;
            }
            var newData = [];
            for (var i = 0; i < dataIn.length; i++) {
                var k = Math.floor(i / 2);
                if ((i % 2) == 0) {
                    newData[k] = dataIn[i];
                } else {
                    newData[k] |= dataIn[i] << 15;
                }
            }
            s = '';
            for (var i = 0; i < newData.length; i++) {
                s = newData[i].toString(16).toUpperCase() + ' ' + s;
            }
            dataIn = newData;
        }
    } else {
        dataStr.toUpperCase().replace(/0/g, '0000').replace(/1/g, '0001').replace(/2/g, '0010').replace(/3/g, '0011')
            .replace(/4/g, '0100').replace(/5/g, '0101').replace(/6/g, '0110').replace(/7/g, '0111').replace(/8/g, '1000')
            .replace(/9/g, '1001').replace(/A/g, '1010').replace(/B/g, '1011').replace(/C/g, '1100').replace(/D/g, '1101')
            .replace(/E/g, '1110').replace(/F/g, '1111').reverse().match(/.{1,30}/g).forEach((x) => {
            dataIn.push(parseInt(x.reverse(), 2));
        });
    }

    function Create(inputData) {
        return {
            data: inputData,
            copy: function() {
                return Create(inputData.slice());
            },
            equals: function(other) {
                if (this.data.length !== other.data.length) {
                    return false;
                }
                for (var i = 0; i < this.data.length; i++) {
                    if (this.data[i] !== other.data[i]) {
                        return false;
                    }
                }
                return true;
            },
            sub: function(other) {
                for (var i = 0; i < other.data.length; i++) {
                    if (other.data[i] > this.data[i]) {
                        this.data[i] -= other.data[i];
                        this.data[i] += 0x3FFFFFFF; // 30 bits per number
                        // Carry the subtraction
                        var j = i;
                        while (--data[++j] < 1) {
                            this.data[j] += 0x3FFFFFFF;
                        }
                        this.data[i + 1]--;
                    } else {
                        this.data[i] -= other.data[i];
                    }
                }
            },
            greaterThan: function(other) {
                if (other.data.length > this.data.length) {
                    for (var i = other.data.length - 1; i >= this.data.length; i--) {
                        if (other.data[i] > 0) {
                            return false;
                        }
                    }
                } else if (other.data.length < this.data.length) {
                    for (var i = this.data.length - 1; i >= other.data.length; i--) {
                        if (this.data[i] > 0) {
                            return true;
                        }
                    }
                }
                var min = Math.min(other.data.length, this.data.length);
                for (var i = min - 1; i >= 0; i--) {
                    if (this.data[i] > other.data[i]) {
                        return true;
                    } else if (this.data[i] < other.data[i]) {
                        return false;
                    }
                }
            },
            inc: function() {
                var carry = false
                var i = 0;
                do {
                    if (++this.data[i] > 0x3FFFFFFF) { // 30 bits per number
                        this.data[i] -= 0x3FFFFFFF;
                        carry = true;
                    } else {
                        carry = false;
                    }
                } while (i < this.data.length && carry);

                if (carry) {
                    this.data.push(1);
                }
            },
            dec: function() {
                var carry = false
                var i = 0;
                do {
                    if (--this.data[i] < 0) {
                        this.data[i] += 0x3FFFFFFF;
                        carry = true;
                    } else {
                        carry = false;
                    }
                } while (i < this.data.length && carry);
                // Don't need an if statement here, can't (and don't need to) represent negative numbers
            },
            toString: function() {
                if (this.data.length == 1) {
                    return this.data[0].toLocaleString();
                }
                // log10(x) = log2(x) / log2(10) ~= log2(x) / 3.322
                var s = [];
                for (var v = 0; v < ((this.data.length * 30) / 3 + 1); v++) {
                    s.push(0);
                }
                var n = this.data.slice(0);
                var sIdx = 0;

                for (var i = 0; i < (this.data.length * 30); i++) {
                    var j;
                    var carry = false;

                    carry = ((n[this.data.length - 1] >>> 29) & 0x1) == 1;

                    // Shift n[] left, doubling it
                    for (var k = this.data.length - 1; k > 0; k--) {
                        n[k] = ((n[k] << 1) & 0x3FFFFFFF) + (((n[k - 1] >>> 29) & 0x1) == 1);
                    }
                    n[0] = ((n[0] << 1) & 0x3FFFFFFF);

                    // Add s[] to itself in decimal, doubling it
                    for (j = s.length - 1; j >= 0; j--) {
                        s[j] += s[j] + (carry ? 1 : 0);

                        carry = s[j] > 9;

                        if (carry) {
                            s[j] -= 10;
                        }
                    }
                }

                while ((s[sIdx] == 0) && (sIdx < s.length - 1)) {
                    sIdx++;
                }
                var ret = '';
                var comma = 0;
                for (var i = s.length - 1; i >= sIdx; i--) {
                    comma++;
                    ret = s[i] + ret;
                    if ((comma % 3) == 0 && i != 0 && i != sIdx) {
                        ret = ',' + ret;
                    }
                }

                return ret;
            },
			toMovableRings: function() {
				var str = "";
				for (var i = 0; i < this.data.length; i++) {
					str = ("000000000000000000000000000000" + this.data[i].toString(2)).slice(-30) + str;
				}
				str = str.reverse();
                var ret = [];
				for (var i = str.length - 1; i >= 0; i--) {
					if (str[i] == "1") {
                        ret.push(ringDat.size - i - 1);
                    }
				}
                return ret;
			}
        };
    }
    return Create(dataIn);
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
    case 0:
        r = v, g = t, b = p;
        break;
    case 1:
        r = q, g = v, b = p;
        break;
    case 2:
        r = p, g = v, b = t;
        break;
    case 3:
        r = p, g = q, b = v;
        break;
    case 4:
        r = t, g = p, b = v;
        break;
    case 5:
        r = v, g = p, b = q;
        break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function randomColors(buffer, count) {
    for (var i = 0; i < count; i++) {
        var color = HSVtoRGB((Math.random() * 360) / 360, (Math.random() * 0.1) + .9, (Math.random() * 0.1) + .9);
        buffer.push((Math.round(color.b) << 16) + (Math.round(color.g) << 8) + Math.round(color.r));
    }
}