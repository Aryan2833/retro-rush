// Parallax backgrounds — drawn directly each frame with camera offsets.
const Backgrounds = (() => {

  function draw(ctx, world, camX, camY) {
    const pal = worldPalette(world);

    // Layer 0: sky gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, 540);
    grad.addColorStop(0, pal.bgFar);
    grad.addColorStop(1, pal.bgMid);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 540);

    // Layer 1: far silhouettes (0.2x parallax)
    drawFar(ctx, world, camX * 0.2, pal);
    // Layer 2: mid silhouettes (0.5x parallax)
    drawMid(ctx, world, camX * 0.5, pal);
    // Layer 3: near (0.8x parallax) — sparse details
    drawNear(ctx, world, camX * 0.8, pal);
  }

  function drawFar(ctx, world, ox, pal) {
    ctx.fillStyle = pal.bgFar;
    if (world === 1) {
      // distant mountain silhouettes
      for (let i = 0; i < 8; i++) {
        const x = ((i * 180) - (ox % 180));
        ctx.beginPath();
        ctx.moveTo(x, 540);
        ctx.lineTo(x + 90, 320);
        ctx.lineTo(x + 180, 540);
        ctx.closePath(); ctx.fill();
      }
    } else if (world === 2) {
      // castle spires
      for (let i = 0; i < 6; i++) {
        const x = ((i * 200) - (ox % 200));
        ctx.fillRect(x, 280, 60, 260);
        ctx.beginPath();
        ctx.moveTo(x, 280); ctx.lineTo(x + 30, 220); ctx.lineTo(x + 60, 280);
        ctx.closePath(); ctx.fill();
      }
    } else {
      // ice peaks
      for (let i = 0; i < 6; i++) {
        const x = ((i * 220) - (ox % 220));
        ctx.beginPath();
        ctx.moveTo(x, 540);
        ctx.lineTo(x + 110, 240);
        ctx.lineTo(x + 220, 540);
        ctx.closePath(); ctx.fill();
      }
    }
  }

  function drawMid(ctx, world, ox, pal) {
    ctx.fillStyle = pal.bgMid;
    if (world === 1) {
      for (let i = 0; i < 8; i++) {
        const x = ((i * 220) - (ox % 220));
        ctx.beginPath();
        ctx.moveTo(x, 540);
        ctx.lineTo(x + 110, 360);
        ctx.lineTo(x + 220, 540);
        ctx.closePath(); ctx.fill();
      }
    } else if (world === 2) {
      for (let i = 0; i < 10; i++) {
        const x = ((i * 140) - (ox % 140));
        ctx.fillRect(x, 360, 50, 180);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const x = ((i * 180) - (ox % 180));
        ctx.beginPath();
        ctx.moveTo(x, 540);
        ctx.lineTo(x + 90, 320);
        ctx.lineTo(x + 180, 540);
        ctx.closePath(); ctx.fill();
      }
    }
  }

  function drawNear(ctx, world, ox, pal) {
    ctx.fillStyle = pal.bgNear;
    if (world === 1) {
      for (let i = 0; i < 12; i++) {
        const x = ((i * 90) - (ox % 90));
        ctx.fillRect(x, 460, 10, 80);
      }
      // sunlight shaft
      ctx.fillStyle = 'rgba(255, 230, 150, 0.05)';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect((i * 250 - (ox % 250)), 0, 60, 540);
      }
    } else if (world === 2) {
      // floor stripe + torches
      ctx.fillStyle = pal.bgNear;
      ctx.fillRect(0, 500, 960, 40);
      ctx.fillStyle = '#ff8a30';
      for (let i = 0; i < 6; i++) {
        const x = ((i * 200) - (ox % 200));
        ctx.fillRect(x, 420, 6, 10);
      }
    } else {
      // crystal glow
      ctx.fillStyle = 'rgba(0, 229, 255, 0.04)';
      for (let i = 0; i < 5; i++) {
        const x = ((i * 220) - (ox % 220));
        ctx.fillRect(x, 0, 40, 540);
      }
    }
  }

  return { draw };
})();
