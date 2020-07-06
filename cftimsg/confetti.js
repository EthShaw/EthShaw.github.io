(function() {
    var st = document.createElement("style");
    st.type = "text/css";
    var css = "div#confettiSpace{width:100%;height:100%;box-sizing:border-box;top:0;left:0;bottom:0;right:0;position:absolute;pointer-events:none;overflow:hidden;z-index:999999}div#confettiSpace div{display:block;position:absolute;transform-style:preserve-3d;overflow:visible}div#confettiSpace div.confetto.spin div.inner{animation:confetto-spin .45s infinite linear}div#confettiSpace div.confetto.rotate div.mid{transform:rotate(var(--rot-amount))}div#confettiSpace div.confetto.img div.inner{background-repeat:no-repeat;background-size:contain;background-image:var(--bg-img)}div#confettiSpace div.confetto.cake{background-repeat:no-repeat;background-size:contain;background-image:url(cake.png);sbackground-image:url(dog.jpg)}@keyframes confetto-spin{0%{background-color:var(--color-1);transform:rotate3d(var(--spin-axis-x),var(--spin-axis-y),0,90deg)}50%{background-color:var(--color-1);transform:rotate3d(var(--spin-axis-x),var(--spin-axis-y),0,270deg)}51%{background-color:var(--color-2);transform:rotate3d(var(--spin-axis-x),var(--spin-axis-y),0,270deg)}100%{background-color:var(--color-2);transform:rotate3d(var(--spin-axis-x),var(--spin-axis-y),0,450deg)}}";
    st.appendChild(document.createTextNode(css)),
    document.body.appendChild(st);
    const MAX_MAX_HEIGHT = 2500
      , MAX_FADE_HEIGHT = MAX_MAX_HEIGHT - 100
      , CONFETTI_PER_SEC = 10
      , FPS = 30;
    var cookieMode = !1
      , large = !0
      , spinImg = !1;
    class Confetto {
        constructor(t, e, o, n, i, r, a) {
            this.center_x = t,
            this.x = this.center_x,
            this.amplitude = 15 + 10 * (Math.random() - .5),
            this.period = 115 + 40 * (Math.random() - .5),
            this.offset = this.period * Math.random(),
            this.width = i,
            this.height = r,
            this.size = this.width,
            this.y = e - this.size;
            var s = document.createElement("div")
              , d = document.createElement("div")
              , c = document.createElement("div");
            s.appendChild(d),
            d.appendChild(c),
            s.classList.add("confetto", "outer"),
            d.classList.add("mid"),
            c.classList.add("inner");
            for (let t of n)
                s.classList.add(t);
            if (s.style.left = this.x + "px",
            s.style.top = this.y + "px",
            o.outer)
                for (let t of o.outer)
                    s.style.setProperty(t[0], t[1]);
            if (o.mid)
                for (let t of o.mid)
                    d.style.setProperty(t[0], t[1]);
            if (o.inner)
                for (let t of o.inner)
                    c.style.setProperty(t[0], t[1]);
            c.style.width = this.width + "px",
            c.style.height = this.height + "px",
            this.outer = s,
            this.mid = d,
            this.inner = c,
            a.appendChild(s)
        }
        update() {
            var t = 88 + 8 * (this.size - 10);
            this.y += t / FPS;
            var e = 2 * Math.PI / this.period;
            this.outer.classList.contains("img") && (t *= .5,
            e = 2 * Math.PI / (3 * this.period)),
            this.x = this.center_x + this.amplitude * Math.sin(e * (this.y + this.offset)),
            this.outer.style.left = this.x + "px",
            this.outer.style.top = this.y + "px"
        }
        fade() {
            this.inner.style.transition = "opacity 1s ease-in-out",
            this.inner.style.opacity = "0"
        }
        destroy() {
            this.outer.remove()
        }
    }
    class BaseConfettiSource {
        generateConfetto() {
            throw new Error("Method generateConfetto() of BaseConfettiSource must be implemented in a subclass!")
        }
    }
    class SquareConfettiSource extends BaseConfettiSource {
        generateConfetto() {
            let t = Math.random() * document.body.clientWidth
              , e = Math.random() * Math.PI / 4
              , o = window.colorSet[Math.floor(Math.random() * window.colorSet.length)];
            if ("function" == typeof o && (o = o()),
            large)
                n = [5.25, 50];
            else
                var n = [5.25, 11.75];
            let i = n[0] + (n[1] - n[0]) * Math.random();
            return new Confetto(t,-10,{
                mid: [["--rot-amount", e.toString() + "rad"]],
                inner: [["--color-1", o[0]], ["--color-2", o[1]], ["--spin-axis-x", Math.cos(-e)], ["--spin-axis-y", Math.sin(-e)]]
            },["rotate", "spin"],i,i,ConfettiHelper.confettiDiv)
        }
    }
    class ImageConfettiSource extends BaseConfettiSource {
        generateConfetto() {
            let t = Math.random() * document.body.clientWidth
              , e = 2 * Math.random() * Math.PI
              , o = window.colorSet[Math.floor(Math.random() * window.colorSet.length)];
            "function" == typeof o && (o = o());
            let n = [5.25, 50]
              , i = n[0] + (n[1] - n[0]) * Math.random();
            return e = 0,
            Math.random(),
            new Confetto(t,-10,{
                mid: [["--rot-amount", (0).toString() + "rad"]],
                inner: [["--spin-axis-x", Math.cos(-0)], ["--spin-axis-y", Math.sin(-0)]]
            },["img"],i,i,ConfettiHelper.confettiDiv)
        }
    }
    class BaseConfettiFactory {
        shouldMakeConfetto() {
            return !1
        }
        makeConfetto() {
            throw new Error("Method makeConfetto() of BaseConfettiFactory must be implemented in a subclass!")
        }
    }
    class GroupConfettiFactory extends BaseConfettiFactory {
        constructor(t, e, o) {
            if (super(),
            t.length != e.length)
                throw new Error("The number of sources and weights must be equal!");
            let n = e.reduce((t,e)=>t + e)
              , i = 0;
            this._weights = [];
            for (let t = 0; t < e.length; t++)
                i += e[t],
                this._weights[t] = i / n;
            this._sources = t,
            this._cps = o
        }
        shouldMakeConfetto() {
            return Math.random() < this._cps / FPS
        }
        makeConfetto() {
            var t = Math.random();
            for (let e = 0; e < this._sources.length; e++)
                if (t < this._weights[e])
                    return this._sources[e].generateConfetto()
        }
    }
    ConfettiHelper = {},
    ConfettiHelper.confettiSource = new GroupConfettiFactory([new SquareConfettiSource],[1],10),
    ConfettiHelper.confettiDiv = null,
    ConfettiHelper.confetti = function(t) {
        ConfettiHelper.confettiDiv = document.createElement("div"),
        ConfettiHelper.confettiDiv.id = "confettiSpace",
        document.body.appendChild(ConfettiHelper.confettiDiv),
        window.colorSet = t || randomColors;
        var e = [];
        window.startTime = Date.now(),
        window.theCount = 0,
        function t() {
            if (ConfettiHelper.confettiSource.shouldMakeConfetto()) {
                let t = ConfettiHelper.confettiSource.makeConfetto();
                e.push(t)
            }
            var o, n, i = (o = document.body,
            n = document.documentElement,
            Math.min(Math.max(o.scrollHeight, o.offsetHeight, n.clientHeight, n.scrollHeight, n.offsetHeight), MAX_MAX_HEIGHT));
            ConfettiHelper.confettiDiv.style.height = i + "px";
            for (var r = e.length - 1; r >= 0; r--) {
                let t = e[r];
                t.y >= MAX_FADE_HEIGHT && t.fade(),
                t.y >= i ? (t.destroy(),
                e.splice(r, 1)) : t.update()
            }
            window.theCount++,
            setTimeout(t, 1e3 / FPS)
        }()
    }
    ;
    cookieMode = !0,
    spinImg = !1,
    large = !1;
    const updateDelay = 3e4;
    function stuff() {
        cookieMode = Math.random() > .5,
        spinImg = Math.random() > .5,
        window.colorSet = vtColors,
        setTimeout(stuff, updateDelay)
    }
    ConfettiHelper.confetti(randomColors),
    stuff();
}
)();
