function Scratchcard(config) {
  this.config = {
    canvas: null,
    showAllPercent: 65,
    coverImg: null,
    coverColor: null,
    doneCallback: null,
    radius: 20,
    pixelRatio: 1,
    fadeOut: 2000,
  }
  Object.assign(this.config, config)
  this.canvas = this.config.canvas
  this.ctx = null
  this.offsetX = null
  this.offsetY = null
  this.isDown = false
  this.done = false
  this._init()
}
Scratchcard.prototype = {
  constructor: Scratchcard,
  _init: function () {
    this.ctx = this.canvas.getContext('2d')
    this.offSetX = this.canvas.offsetLeft
    this.offSetY = this.canvas.offsetRight
    this._addEvent()
    if (this.config.coverImg) {
      const coverImg = new Image()
      coverImg.src = this.config.coverImg
      coverImg.onload = () => {
        console.log(this)
        this.ctx.drawImage(coverImg, 0, 0)
        this.ctx.globalCompositeOperation = 'destination-out'
      }
    } else {
      this.ctx.fillStyle = this.config.coverColor
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.globalCompositeOperation = 'destination-out'
    }
  },
  _addEvent: function () {
    this.canvas.addEventListener('touchstart', this._eventDown.bind(this), { passive: false })
    this.canvas.addEventListener('touchend', this._eventUp.bind(this), { passive: false })
    this.canvas.addEventListener('touchmove', this._scratch.bind(this), { passive: false })
    this.canvas.addEventListener('mousedown', this._eventDown.bind(this), { passive: false })
    this.canvas.addEventListener('mouseup', this._eventUp.bind(this), { passive: false })
    this.canvas.addEventListener('mousemove', this._scratch.bind(this), { passive: false })
  },
  _eventDown: function (e) {
    e.preventDefault()
    this.isDown = true
  },
  _eventUp: function (e) {
    e.preventDefault()
    this.isDown = false
  },
  _scratch: function (e) {
    e.preventDefault();
    if (!this.done && this.isDown) {
      if (e.changedTouches) {
        e = e.changedTouches[e.changedTouches.length - 1]
      }
      let x = (e.clientX + document.body.scrollLeft || e.pageX) - this.offsetX || 0,
        y = (e.clientY + document.body.scrollTop || e.pageY) - this.offsetY || 0
      with (this.ctx) {
        beginPath()
        arc(x * this.config.pixelRatio, y * this.config.pixelRatio, this.config.radius * this.config.pixelRatio, 0, Math.PI * 2)
        fill()
      }
      if (this._getFilledPercentage() > this.config.showAllPercent) {
        this._scratchAll()
      }
    }
  },
  _scratchAll() {
    this.done = true;
    if (this.config.fadeOut > 0) {
      this.canvas.style.transition = 'all ' + this.config.fadeOut / 1000 + 's linear'
      // this.canvas.style.transition = `all ${this.config.fadeOut / 1000 }'s linear`
      this.canvas.style.opacity = '0'
      // console.log(this.canvas.style.transition)
      setTimeout(()=>
        this._clear(), this.config.fadeOut)
    } else {
      this._clear()
    }
    this.config.doneCallback()
  },
  _clear() {
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  },
  _getFilledPercentage: function () {
    const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const pixels = imgData.data
    const transPixels = []
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) {
        transPixels.push(pixels[i + 3])
      }
    }
    return (transPixels.length / (pixels.length / 4) * 100).toFixed(2)
  }
}

