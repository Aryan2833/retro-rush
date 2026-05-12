// Lightweight particle system with object pooling.
const Particles = (() => {
  const POOL_SIZE = 400;
  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push({
      alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0,
      color: '#fff', size: 2, gravity: 0, fade: true, shape: 'square',
    });
  }

  function spawn(opts) {
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = pool[i];
      if (!p.alive) {
        p.alive = true;
        p.x = opts.x;
        p.y = opts.y;
        p.vx = opts.vx ?? 0;
        p.vy = opts.vy ?? 0;
        p.life = opts.life ?? 30;
        p.maxLife = p.life;
        p.color = opts.color ?? '#fff';
        p.size = opts.size ?? 2;
        p.gravity = opts.gravity ?? 0;
        p.fade = opts.fade !== false;
        p.shape = opts.shape ?? 'square';
        return p;
      }
    }
    return null;
  }

  function burst(x, y, count, color, opts = {}) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = (opts.speedMin ?? 1) + Math.random() * ((opts.speedMax ?? 3) - (opts.speedMin ?? 1));
      spawn({
        x, y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: (opts.life ?? 25) + Math.random() * 10,
        color: Array.isArray(color) ? color[Math.floor(Math.random() * color.length)] : color,
        size: opts.size ?? (1 + Math.random() * 2),
        gravity: opts.gravity ?? 0.1,
        shape: opts.shape ?? 'square',
      });
    }
  }

  function update() {
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = pool[i];
      if (!p.alive) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life--;
      if (p.life <= 0) p.alive = false;
    }
  }

  function render(ctx, camX, camY) {
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = pool[i];
      if (!p.alive) continue;
      const sx = Math.floor(p.x - camX);
      const sy = Math.floor(p.y - camY);
      if (sx < -10 || sx > 970 || sy < -10 || sy > 550) continue;
      const alpha = p.fade ? (p.life / p.maxLife) : 1;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const s = Math.max(1, Math.floor(p.size));
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function clear() {
    for (let i = 0; i < POOL_SIZE; i++) pool[i].alive = false;
  }

  return { spawn, burst, update, render, clear };
})();
