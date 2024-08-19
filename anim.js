class SetableValue {
  /**
   *
   * @param {keyof typeof this} key
   * @param {typeof this[keyof typeof this]} val
   * @returns
   */
  setValue(key, val) {
    this[key] = val;
    return this;
  }
}

class Geometry extends SetableValue {
  fill = "yellow";
  stroke = "none";
  isGeo = true;
  rotation = 0;
  position = { x: 0, y: 0 };
  strokeWidth = 1;
  scale = { x: 1, y: 1 };
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale.x, this.scale.y);
  }
}

class Tex extends Geometry {
  text = "";
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();
    super.draw(ctx);
    if (this.fill !== "none") {
      ctx.fillStyle = this.fill;
      const mt = ctx.measureText(this.text);
      ctx.fillText(this.text, -mt.width / 2, 0);
    }
    if (this.stroke !== "none") {
      ctx.lineWidth = this.strokeWidth;
      ctx.strokeStyle = this.stroke;
      ctx.strokeText();
    }
    ctx.restore();
  }
}

class TimeMeasure {
  pausedTime = 0;
  startTime = Date.now();
  pauseTime = 0;
  playing = true;
  get time() {
    return this.playing
      ? Date.now() - this.startTime - this.pausedTime
      : this.pauseTime - this.startTime - this.pausedTime;
  }
  pause() {
    if (this.playing) {
      this.playing = false;
      this.pauseTime = Date.now();
    }
    return this;
  }
  play() {
    if (!this.playing) {
      this.pausedTime += Date.now() - this.pauseTime;
      this.playing = true;
      this.pauseTime = 0;
    }
    return this;
  }
}

class Animator extends SetableValue {
  easingFunc = Animator.Functions.easeInOut;
  dur = 1000;
  time = new TimeMeasure();
  fromD = {};
  toD = {};
  _loop = false;
  _reverseWhenDone = false;
  constructor(duration) {
    super();
    this.dur = duration || this.dur;
  }
  from(options) {
    this.fromD = options;
    return this;
  }
  to(options) {
    this.toD = options;
    return this;
  }
  loop() {
    this._loop = true;
    return this;
  }
  reverseWhenDone() {
    this._reverseWhenDone = true;
    return this;
  }
  /**
   *
   * @param {keyof Animator.Functions | (p) => number} func
   */
  useEaser(func) {
    if (typeof func === "function") {
      this.easingFunc = func;
    } else {
      this.easingFunc = Animator.Functions[func];
    }
    return this;
  }
  update(onUpdate) {
    const funcdate = (time, dur) => {
      const ob = {};
      Object.keys(this.fromD).forEach((k) => {
        ob[k] = this.fromD[k] + (this.toD[k] - this.fromD[k]) * this.easingFunc(time / dur);
      });
      onUpdate(ob);
    };
    if (this._reverseWhenDone) {
      let t = this.time.time;
      // if (!this._loop) {
      //   if (t > this.dur) {

      //     t = 0;
      //     return
      //   }
      // }
      // let mult = false
      // if (t > this.dur && mult === false) {
      //   mult = true
      // }
      funcdate(t, this.dur);
    } else if (this._loop) {
      funcdate(this.time.time % this.dur, this.dur);
    } else if (this.time.time < this.dur) {
      funcdate(this.time.time, this.dur);
    }
  }
  /**
   * @readonly
   */
  static Functions = {
    linear(p) {
      return p;
    },
    easeInOut(p) {
      return 1 - Math.cos(p ** 2) ** 22;
    },
    easeIn(p) {
      return p ** 3;
    },
    easeOut(p) {
      return 1 - (p - 1) ** 3;
    },
  };
}

// const MATHX = {
//   roundToNearest(a, n) {
//     return Math.round(a / n) * n
//   }
// }

// console.log(MATHX.roundToNearest(Animator.Functions.doubleDecker(0, 1, 0.55), 0.01));

function parseTime(str) {
  if (typeof str === "number") {
    return str;
  } else if (str.endsWith("ms")) {
    return Number(str.substring(0, str.indexOf("ms")));
  } else if (str.endsWith("s") | str.endsWith("secs")) {
    return Number(str.substring(0, str.indexOf("s"))) * 1000;
  } else if (str.endsWith("m") || str.endsWith("min") || str.endsWith("mins")) {
    return Number(str.substring(0, str.indexOf("m"))) * 1000 * 60;
  } else if (str.endsWith("h") || str.endsWith("hr") || str.endsWith("hrs")) {
    return Number(str.substring(0, str.indexOf("h"))) * 1000 * 60 * 60;
  } else {
    return Number(str);
  }
}
