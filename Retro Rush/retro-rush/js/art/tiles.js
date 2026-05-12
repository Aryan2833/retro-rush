// Procedural tile rendering. Each tile is 32x32. Drawn directly to ctx — pre-rendering
// to an offscreen canvas is an optimization layer added on top later.
const Tiles = (() => {
  const SIZE = 32;

  function draw(ctx, id, tx, ty, world, frame) {
    const x = tx * SIZE, y = ty * SIZE;
    const pal = worldPalette(world);
    switch (id) {
      case 0: return; // air
      case 1: return drawSolid(ctx, x, y, tx, ty, pal, world, false);
      case 2: return drawSolid(ctx, x, y, tx, ty, pal, world, true);
      case 3: return drawOneWay(ctx, x, y, pal);
      case 4: return drawCrumble(ctx, x, y, pal);
      case 5: return drawSpikeFloor(ctx, x, y);
      case 6: return drawSpikeCeiling(ctx, x, y);
      case 7: return drawSpikeWallL(ctx, x, y);
      case 8: return drawSpikeWallR(ctx, x, y);
      case 9: return drawWater(ctx, x, y, frame);
      case 10: return drawLava(ctx, x, y, frame);
      case 11: return drawIce(ctx, x, y, pal);
      case 12: return drawConveyor(ctx, x, y, -1, frame);
      case 13: return drawConveyor(ctx, x, y, 1, frame);
      case 14: return drawCrackedWall(ctx, x, y, pal);
      case 15: return; // grapple point — drawn as entity (always visible)
      case 16: return; // pressure plate — drawn as entity
      case 17: return drawDoor(ctx, x, y, pal);
      case 18: return drawWindUp(ctx, x, y, frame);
      case 19: return drawWindRight(ctx, x, y, frame);
    }
  }

  function drawSolid(ctx, x, y, tx, ty, pal, world, variant) {
    // Deterministic noise from coords for slight texture variation
    const seed = (tx * 31 + ty * 17) & 0xff;
    const tone = (seed / 255) * 0.2 - 0.1;

    ctx.fillStyle = shade(pal.blockDark, tone);
    ctx.fillRect(x, y, SIZE, SIZE);
    ctx.fillStyle = shade(pal.blockMid, tone);
    ctx.fillRect(x + 2, y + 2, SIZE - 4, SIZE - 4);
    ctx.fillStyle = shade(pal.blockLight, tone);
    ctx.fillRect(x + 4, y + 4, SIZE - 8, SIZE - 8);

    // Cracks/details per world for variety
    if (variant || (seed & 7) === 0) {
      ctx.fillStyle = shade(pal.blockDark, -0.15);
      if (world === 1) {
        // vine streak
        ctx.fillStyle = pal.vine;
        ctx.fillRect(x + 6 + (seed % 16), y + 6, 2, 8 + (seed % 6));
      } else if (world === 2) {
        // rivet
        ctx.fillStyle = pal.brass;
        ctx.fillRect(x + 6, y + 6, 2, 2);
        ctx.fillRect(x + SIZE - 8, y + 6, 2, 2);
        ctx.fillRect(x + 6, y + SIZE - 8, 2, 2);
        ctx.fillRect(x + SIZE - 8, y + SIZE - 8, 2, 2);
      } else {
        // ice crystal sparkle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 12 + (seed % 8), y + 10, 1, 1);
        ctx.fillRect(x + 8, y + 18 + (seed % 6), 1, 1);
      }
    }

    // Tile border (top + left brighter, bottom + right darker)
    ctx.fillStyle = shade(pal.blockLight, 0.15);
    ctx.fillRect(x, y, SIZE, 2);
    ctx.fillRect(x, y, 2, SIZE);
    ctx.fillStyle = shade(pal.blockDark, -0.2);
    ctx.fillRect(x, y + SIZE - 2, SIZE, 2);
    ctx.fillRect(x + SIZE - 2, y, 2, SIZE);
  }

  function drawOneWay(ctx, x, y, pal) {
    ctx.fillStyle = shade(pal.blockMid, -0.1);
    ctx.fillRect(x, y, SIZE, 8);
    ctx.fillStyle = pal.blockLight;
    ctx.fillRect(x, y, SIZE, 3);
    ctx.fillStyle = shade(pal.blockDark, -0.3);
    ctx.fillRect(x, y + 7, SIZE, 1);
  }

  function drawCrumble(ctx, x, y, pal) {
    ctx.fillStyle = shade(pal.blockMid, -0.2);
    ctx.fillRect(x, y, SIZE, SIZE);
    ctx.fillStyle = shade(pal.blockLight, -0.1);
    ctx.fillRect(x + 2, y + 2, SIZE - 4, SIZE - 4);
    // crack lines
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 6, y + 4, 1, 14);
    ctx.fillRect(x + 18, y + 10, 1, 16);
    ctx.fillRect(x + 8, y + 18, 18, 1);
  }

  function drawSpikeFloor(ctx, x, y) {
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x, y + 24, SIZE, 8);
    ctx.fillStyle = PALETTES.shared.spikeRed;
    for (let i = 0; i < 4; i++) {
      const sx = x + i * 8;
      ctx.beginPath();
      ctx.moveTo(sx, y + 24);
      ctx.lineTo(sx + 4, y + 6);
      ctx.lineTo(sx + 8, y + 24);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 8 + 3, y + 8, 1, 8);
  }

  function drawSpikeCeiling(ctx, x, y) {
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x, y, SIZE, 8);
    ctx.fillStyle = PALETTES.shared.spikeRed;
    for (let i = 0; i < 4; i++) {
      const sx = x + i * 8;
      ctx.beginPath();
      ctx.moveTo(sx, y + 8);
      ctx.lineTo(sx + 4, y + 26);
      ctx.lineTo(sx + 8, y + 8);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawSpikeWallL(ctx, x, y) {
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x, y, 8, SIZE);
    ctx.fillStyle = PALETTES.shared.spikeRed;
    for (let i = 0; i < 4; i++) {
      const sy = y + i * 8;
      ctx.beginPath();
      ctx.moveTo(x + 8, sy);
      ctx.lineTo(x + 26, sy + 4);
      ctx.lineTo(x + 8, sy + 8);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawSpikeWallR(ctx, x, y) {
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + 24, y, 8, SIZE);
    ctx.fillStyle = PALETTES.shared.spikeRed;
    for (let i = 0; i < 4; i++) {
      const sy = y + i * 8;
      ctx.beginPath();
      ctx.moveTo(x + 24, sy);
      ctx.lineTo(x + 6, sy + 4);
      ctx.lineTo(x + 24, sy + 8);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawWater(ctx, x, y, frame) {
    ctx.fillStyle = PALETTES.shared.water;
    ctx.fillRect(x, y, SIZE, SIZE);
    // wave
    const wOff = Math.sin(frame * 0.1 + x * 0.05) * 2;
    ctx.fillStyle = PALETTES.shared.waterLight;
    ctx.fillRect(x, y + wOff, SIZE, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + 4, y + wOff + 1, 6, 1);
    ctx.fillRect(x + 18, y + wOff + 1, 4, 1);
  }

  function drawLava(ctx, x, y, frame) {
    ctx.fillStyle = '#8b1a08';
    ctx.fillRect(x, y, SIZE, SIZE);
    ctx.fillStyle = PALETTES.shared.lava;
    ctx.fillRect(x, y + 4, SIZE, SIZE - 4);
    // bubbles
    const t = frame * 0.1;
    for (let i = 0; i < 3; i++) {
      const bx = x + 4 + i * 10 + Math.sin(t + i) * 2;
      const by = y + 16 + Math.cos(t + i * 1.7) * 4;
      ctx.fillStyle = PALETTES.shared.lavaBright;
      ctx.beginPath(); ctx.arc(bx, by, 2 + Math.sin(t * 2 + i) * 1, 0, Math.PI * 2); ctx.fill();
    }
    // hot top
    ctx.fillStyle = '#ffd55a';
    ctx.fillRect(x, y + 3, SIZE, 1);
  }

  function drawIce(ctx, x, y, pal) {
    ctx.fillStyle = pal.blockMid;
    ctx.fillRect(x, y, SIZE, SIZE);
    ctx.fillStyle = pal.blockLight;
    ctx.fillRect(x, y, SIZE, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 4, y + 2, 6, 1);
    ctx.fillRect(x + 18, y + 2, 4, 1);
    ctx.fillStyle = pal.blockDark;
    ctx.fillRect(x, y + SIZE - 1, SIZE, 1);
  }

  function drawConveyor(ctx, x, y, dir, frame) {
    ctx.fillStyle = '#3a3a45';
    ctx.fillRect(x, y, SIZE, SIZE);
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(x, y + 2, SIZE, SIZE - 4);
    // arrows scroll
    const phase = ((frame * 0.5) | 0) % 8;
    ctx.fillStyle = '#ffd24a';
    for (let i = -1; i < 5; i++) {
      const ax = x + i * 8 + dir * phase;
      if (ax < x || ax > x + SIZE - 4) continue;
      if (dir > 0) {
        ctx.beginPath();
        ctx.moveTo(ax, y + 8); ctx.lineTo(ax + 4, y + 16); ctx.lineTo(ax, y + 24);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(ax + 4, y + 8); ctx.lineTo(ax, y + 16); ctx.lineTo(ax + 4, y + 24);
        ctx.closePath(); ctx.fill();
      }
    }
  }

  function drawCrackedWall(ctx, x, y, pal) {
    drawSolid(ctx, x, y, x / SIZE, y / SIZE, pal, 1, false);
    // crack overlay
    ctx.strokeStyle = PALETTES.shared.crackedDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 4);
    ctx.lineTo(x + 14, y + 12);
    ctx.lineTo(x + 10, y + 22);
    ctx.lineTo(x + 22, y + 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 6);
    ctx.lineTo(x + 18, y + 14);
    ctx.lineTo(x + 26, y + 20);
    ctx.stroke();
  }

  function drawDoor(ctx, x, y, pal) {
    ctx.fillStyle = shade(pal.blockMid, -0.4);
    ctx.fillRect(x, y, SIZE, SIZE);
    ctx.fillStyle = shade(pal.blockDark, -0.2);
    ctx.fillRect(x + 2, y, SIZE - 4, SIZE);
  }

  function drawWindUp(ctx, x, y, frame) {
    ctx.fillStyle = 'rgba(0, 188, 212, 0.08)';
    ctx.fillRect(x, y, SIZE, SIZE);
    ctx.fillStyle = 'rgba(0, 188, 212, 0.6)';
    const phase = ((frame * 0.4) | 0) % 8;
    for (let i = 0; i < 3; i++) {
      const sx = x + 6 + i * 9;
      const sy = y + ((SIZE - phase * 2 + i * 8) % SIZE);
      ctx.fillRect(sx, sy, 1, 6);
    }
  }

  function drawWindRight(ctx, x, y, frame) {
    ctx.fillStyle = 'rgba(0, 188, 212, 0.08)';
    ctx.fillRect(x, y, SIZE, SIZE);
    ctx.fillStyle = 'rgba(0, 188, 212, 0.6)';
    const phase = ((frame * 0.4) | 0) % 8;
    for (let i = 0; i < 3; i++) {
      const sy = y + 6 + i * 9;
      const sx = x + ((phase * 2 + i * 8) % SIZE);
      ctx.fillRect(sx, sy, 6, 1);
    }
  }

  function shade(hex, amount) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const add = amount * 255;
    const nr = Math.min(255, Math.max(0, Math.floor(r + add)));
    const ng = Math.min(255, Math.max(0, Math.floor(g + add)));
    const nb = Math.min(255, Math.max(0, Math.floor(b + add)));
    return `rgb(${nr},${ng},${nb})`;
  }

  return { draw, SIZE };
})();
