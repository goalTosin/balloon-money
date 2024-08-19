class Sprite extends Image {
  constructor(src) {
    super();
    this.src = src;
    this.loaded = false;
    this.crossOrigin = 'anonymous'
    this.onload = () => {
      this.loaded = true;
    };
  }
}

class Balloon {
  /**
   *
   * @param {string} color
   * @param {(b: Balloon) => void} onPop
   */
  constructor(x, y, type, color, sizeLimit, onPop = () => {}) {
    this.type = type;
    this.id = genRandHex(4).toString(16);
    this.color = color;
    this.sizeLimit = sizeLimit;
    // this.timeLimit = timeLimit;
    this.size = 4;
    this.x = x;
    this.y = y;
    this.sprite = new Sprite(`./images/${color}_balloon.webp`);
    // this.startTime = null;
    this.onPop = onPop;
    /**
     * @type {(b: Balloon) => void}
     */
    this.onExceeded = () => {};
  }

  calcProfit() {
    const profitMultiplier = 1.4; //change
    return (
      (this.size / this.sizeLimit) *
      Balloon.getBalloonByType(this.type).cost *
      profitMultiplier
    );
  }

  inflate(sizeIncrement) {
    // if (!this.startTime) {
    //   this.startTime = Date.now();
    // }
    this.size += sizeIncrement;
    if (this.size > this.sizeLimit) {
      this.onPop(this);
    }
  }

  fly() {
    this.y -= 6;
    if (this.y <= -this.size) {
      this.onExceeded(this);
    }
    // const elapsedTime = Date.now() - this.startTime;
    // if (elapsedTime > this.timeLimit) {
    //   this.onPop(this);
    // }
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    if (this.sprite.loaded) {
      const ratio = (this.size * 2) / this.sprite.height;
      ctx.drawImage(
        this.sprite,
        -this.sprite.width / 2 * ratio,
        -this.sprite.height / 2 * ratio,
        this.sprite.width * ratio,
        this.sprite.height * ratio
      );
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    }
    ctx.restore()
  }

  static types = (() => {
    // const timeLimitFactor = 2;
    const sizeFactor = 2;
    return [
      {
        type: "dime",
        cost: 1,
        color: "black",
        sizeLimit: 10 * sizeFactor,
        // timeLimit: 10000 * timeLimitFactor,
        chance: 0.0000001,
      },
      {
        type: "spat",
        cost: 30,
        color: "red",
        sizeLimit: 30 * sizeFactor,
        // timeLimit: 7000 * timeLimitFactor,
        chance: 7,
      },
      {
        type: "flims",
        cost: 40,
        color: "yellow",
        sizeLimit: 45 * sizeFactor,
        // timeLimit: 5000 * timeLimitFactor,
        chance: 4,
      },
      {
        type: "suppy",
        cost: 100,
        color: "blue",
        sizeLimit: 67 * sizeFactor,
        // timeLimit: 4000 * timeLimitFactor,
        chance: 2,
      },
      {
        type: "sharp",
        cost: 100,
        color: "green",
        sizeLimit: 200 * sizeFactor,
        // timeLimit: 4000 * timeLimitFactor,
        chance: 0.2,
      },
    ];
  })();
  static getBalloonByType(type) {
    return Balloon.types.find((b) => b.type === type);
  }
}

class Game {
  constructor() {
    /**
     * @type {HTMLCanvasElement}
     */
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.init();
    this.initEvents();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  sizeCanvas() {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
  }

  init() {
    /**
     * @type {Balloon[]}
     */
    this.balloons = [];
    this._money = 100;
    this.moneyChangeAnim = new Animator(1000);
    /**
     * @type {Balloon | null}
     */
    this.currentBalloon = null;
    this.sizeCanvas();
  }

  /**
   * @param {number} val
   */
  set money(val) {
    // const diff = val - this.money;
    // this.moneyChangeAnim.from({ offx: 0, f: 1 }).to({ offx: -100, f: 0 });
    this._money = val;
  }

  get money() {
    return this._money;
  }

  initEvents() {
    if (this.initedEvents) {
      this.canvas.removeEventListener(
        "mousedown",
        this.startInflation.bind(this)
      );
      this.canvas.removeEventListener("mouseup", this.stopInflation.bind(this));
      removeEventListener("resize", this.sizeCanvas.bind(this));
    }
    // console.debug("init");
    this.canvas.addEventListener("mousedown", this.startInflation.bind(this));
    this.canvas.addEventListener("mouseup", this.stopInflation.bind(this));
    addEventListener("resize", this.sizeCanvas.bind(this));
    this.initedEvents = true;
  }

  getCheapestBalloon() {
    return Balloon.types.reduce((a, b) => (a.cost > b.cost ? b : a));
  }

  startInflation() {
    // console.debug("startInflation");
    const affordableBalloons = (() => {
      // let t =
      return Balloon.types.filter(
        (t) => this.money >= t.cost && t.chance !== 0
      );
      // return t.length === 0
      //   ? this.money >= this.getCheapestBalloon().cost
      //     ? [this.getCheapestBalloon()]
      //     : []
      //   : t;
    })();

    if (affordableBalloons.length <= 0) {
      alert(
        `Sorry, you can't afford any balloons. Even the cheapest balloon is \$${
          this.getCheapestBalloon().cost
        }!`
      );
      return;
    }
    const balloonType = getRandomValBasedOnChance(
      affordableBalloons,
      affordableBalloons.map((bt) => bt.chance)
    );
    this.money -= balloonType.cost;
    this.currentBalloon = new Balloon(
      this.canvas.width / 2,
      (this.canvas.height * 4) / 5,
      balloonType.type,
      balloonType.color,
      balloonType.sizeLimit,
      // balloonType.timeLimit,
      () => {
        this.currentBalloon = null;
      }
    );
  }

  stopInflation() {
    // console.debug("stopInflation");
    if (this.currentBalloon) {
      this.balloons.push(this.currentBalloon);
      this.currentBalloon = null;
      const lastBalloon = this.balloons[this.balloons.length - 1];
      lastBalloon.onExceeded = (b) => {
        this.money += b.calcProfit();
        this.money = Math.ceil(this.money);
        this.removeBalloonFromId(b.id);
      };
    }
  }
  removeBalloon(i) {
    // console.debug("removeBalloon");
    this.balloons.splice(i, 1);
  }
  removeBalloonFromId(id) {
    // console.debug("removeBalloonFromId");
    this.balloons.splice(
      this.balloons.findIndex((b) => b.id === id),
      1
    );
  }

  update() {
    /**
     *
     * @param {Balloon} balloon
     */
    const updateBalloon = (balloon) => {
      balloon.fly();
    };
    this.balloons.forEach(updateBalloon);
    if (this.currentBalloon) {
      this.currentBalloon.inflate(0.3);
    }
    this.moneyChangeAnim.update((t) => {});
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.balloons.forEach((balloon) => balloon.draw(this.ctx));
    if (this.currentBalloon) {
      this.currentBalloon.draw(this.ctx);
    }
    this.ctx.fillStyle = "black";
    this.ctx.font = "40px system-ui";
    this.ctx.textBaseline = 'top'
    this.ctx.textAlign = 'end'
    this.ctx.fillText(`\$${this.money}`, this.canvas.width - 5, 5);
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

const game = new Game();
