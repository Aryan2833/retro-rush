// Canvas setup, scaling, pixel-perfect rendering.
const GameCanvas = (() => {
  const BASE_W = 960;
  const BASE_H = 540;

  let canvas, ctx;

  function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = false;
    resize();
    window.addEventListener('resize', resize);
    return { canvas, ctx, width: BASE_W, height: BASE_H };
  }

  function resize() {
    // Maintain 16:9 aspect ratio, scale up integer if possible
    const wr = window.innerWidth / BASE_W;
    const hr = window.innerHeight / BASE_H;
    const scale = Math.min(wr, hr);
    canvas.style.width = (BASE_W * scale) + 'px';
    canvas.style.height = (BASE_H * scale) + 'px';
  }

  function clear(color = '#000') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, BASE_W, BASE_H);
  }

  return { init, clear, get ctx() { return ctx; }, get canvas() { return canvas; }, BASE_W, BASE_H };
})();
