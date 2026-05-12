// Smooth-follow camera with bounds clamping + screen shake.
const Camera = (() => {
  let x = 0, y = 0;
  let targetX = 0, targetY = 0;
  let bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const VIEW_W = 960;
  const VIEW_H = 540;
  const LERP = 0.10;

  let shakeT = 0, shakeMag = 0;
  let shakeX = 0, shakeY = 0;

  function setBounds(levelWidthPx, levelHeightPx) {
    bounds.minX = 0;
    bounds.minY = 0;
    bounds.maxX = Math.max(0, levelWidthPx - VIEW_W);
    bounds.maxY = Math.max(0, levelHeightPx - VIEW_H);
  }

  function snapTo(px, py) {
    targetX = px - VIEW_W / 2;
    targetY = py - VIEW_H / 2;
    x = clamp(targetX, bounds.minX, bounds.maxX);
    y = clamp(targetY, bounds.minY, bounds.maxY);
  }

  function follow(px, py) {
    targetX = px - VIEW_W / 2;
    targetY = py - VIEW_H / 2;
    x += (targetX - x) * LERP;
    y += (targetY - y) * LERP;
    x = clamp(x, bounds.minX, bounds.maxX);
    y = clamp(y, bounds.minY, bounds.maxY);

    if (shakeT > 0) {
      shakeT--;
      const t = shakeT / 12;
      shakeX = (Math.random() - 0.5) * 2 * shakeMag * t;
      shakeY = (Math.random() - 0.5) * 2 * shakeMag * t;
    } else {
      shakeX = 0; shakeY = 0;
    }
  }

  function shake(magnitude = 3, duration = 12) {
    shakeT = Math.max(shakeT, duration);
    shakeMag = Math.max(shakeMag, magnitude);
  }

  function getX() { return Math.floor(x + shakeX); }
  function getY() { return Math.floor(y + shakeY); }

  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

  return { setBounds, snapTo, follow, shake, getX, getY, VIEW_W, VIEW_H };
})();
