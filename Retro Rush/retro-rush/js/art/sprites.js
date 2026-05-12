// Procedural sprite drawing. All sprites are drawn directly to the main ctx —
// no offscreen caches yet (added later for perf if needed).
const Sprites = (() => {

  // ---------- Player (red orb) ----------
  // state: 'normal'|'inflated'|'deflated'  size: pixel diameter
  function drawPlayer(ctx, x, y, sizeW, sizeH, dir, state, anim, invuln) {
    // Flash white during invulnerability
    if (invuln && Math.floor(invuln / 4) % 2 === 0) {
      drawOrb(ctx, x, y, sizeW, sizeH, '#ffffff', '#aaaaaa', '#ffe5e5');
      return;
    }
    drawOrb(ctx, x, y, sizeW, sizeH, PALETTES.shared.player, PALETTES.shared.playerDark, PALETTES.shared.playerLight);

    // Eye direction
    const cx = x + sizeW / 2;
    const cy = y + sizeH * 0.42;
    const eyeOffX = dir >= 0 ? sizeW * 0.10 : -sizeW * 0.10;
    const eyeR = Math.max(1.5, sizeW * 0.07);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - sizeW * 0.15 + eyeOffX, cy, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + sizeW * 0.15 + eyeOffX, cy, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - sizeW * 0.13 + eyeOffX * 1.2, cy + 0.5, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + sizeW * 0.17 + eyeOffX * 1.2, cy + 0.5, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
  }

  function drawOrb(ctx, x, y, w, h, base, dark, light) {
    const cx = x + w / 2, cy = y + h / 2;
    const rx = w / 2, ry = h / 2;
    // Outer dark rim
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    // Inner body
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.92, ry * 0.92, 0, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.30, cy - ry * 0.35, rx * 0.28, ry * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------- Ring ----------
  function drawRing(ctx, x, y, frame) {
    // frame 0..5 rotation phase — controls horizontal compression
    const t = (frame % 6) / 6;
    const compress = Math.abs(Math.cos(t * Math.PI * 2));
    const cx = x + 16, cy = y + 16;
    const rx = 10 * Math.max(0.15, compress);
    const ry = 12;
    ctx.fillStyle = PALETTES.shared.ringGoldDark;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx + 2, ry + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTES.shared.ringGold;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    // Hole
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.55, ry * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = '#fff7c0';
    ctx.beginPath(); ctx.ellipse(cx - rx * 0.3, cy - ry * 0.4, Math.max(0.5, rx * 0.2), ry * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- Gem ----------
  function drawGem(ctx, x, y, color, frame) {
    const cx = x + 16, cy = y + 16;
    const t = (frame % 8) / 8;
    const pulse = 1 + Math.sin(t * Math.PI * 2) * 0.08;
    const w = 8 * pulse, h = 11 * pulse;
    // diamond shape
    ctx.fillStyle = shadeColor(color, -0.35);
    diamond(ctx, cx, cy, w + 1.5, h + 1.5);
    ctx.fillStyle = color;
    diamond(ctx, cx, cy, w, h);
    ctx.fillStyle = shadeColor(color, 0.4);
    diamond(ctx, cx - w * 0.35, cy - h * 0.3, w * 0.35, h * 0.35);
  }

  function diamond(ctx, cx, cy, w, h) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - h);
    ctx.lineTo(cx + w, cy);
    ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx - w, cy);
    ctx.closePath();
    ctx.fill();
  }

  // ---------- Energy orb ----------
  function drawEnergy(ctx, x, y, frame) {
    const t = (frame % 12) / 12;
    const pulse = 0.85 + Math.sin(t * Math.PI * 2) * 0.15;
    const cx = x + 16, cy = y + 16;
    ctx.fillStyle = 'rgba(74,222,128,0.25)';
    ctx.beginPath(); ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTES.shared.energyOrb;
    ctx.beginPath(); ctx.arc(cx, cy, 6 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- Key ----------
  function drawKey(ctx, x, y, color, frame) {
    const bob = Math.sin(frame * 0.2) * 1.5;
    const cx = x + 16, cy = y + 16 + bob;
    ctx.fillStyle = color;
    // bow (circle)
    ctx.beginPath(); ctx.arc(cx - 4, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cx - 4, cy, 2, 0, Math.PI * 2); ctx.fill();
    // shaft
    ctx.fillStyle = color;
    ctx.fillRect(cx, cy - 1.5, 10, 3);
    ctx.fillRect(cx + 6, cy + 1, 2, 3);
    ctx.fillRect(cx + 9, cy + 1, 2, 3);
  }

  // ---------- Spider ----------
  function drawSpider(ctx, x, y, frame, dir) {
    const cx = x + 16, cy = y + 22;
    // legs
    ctx.strokeStyle = PALETTES.shared.spider;
    ctx.lineWidth = 1.5;
    const phase = (frame * 0.5);
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const offset = Math.sin(phase + i) * 2;
      ctx.beginPath();
      ctx.moveTo(cx + i * 2, cy - 1);
      ctx.lineTo(cx + i * 4, cy + 5 + offset);
      ctx.stroke();
    }
    // body
    ctx.fillStyle = PALETTES.shared.spider;
    ctx.beginPath(); ctx.ellipse(cx, cy, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    // eyes
    ctx.fillStyle = PALETTES.shared.spiderEye;
    const eX = dir >= 0 ? 3 : -3;
    ctx.fillRect(cx - 3 + eX * 0.3, cy - 2, 2, 2);
    ctx.fillRect(cx + 1 + eX * 0.3, cy - 2, 2, 2);
  }

  // ---------- Snake ----------
  function drawSnake(ctx, x, y, frame, striking, dir) {
    const cx = x + 16, cy = y + 24;
    const sway = striking ? 0 : Math.sin(frame * 0.15) * 2;
    ctx.fillStyle = PALETTES.shared.snake;
    // body coil
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    // head — pops up during strike
    const headOffY = striking ? -10 : 0;
    const headOffX = striking ? dir * 4 : sway;
    ctx.beginPath(); ctx.ellipse(cx + headOffX, cy - 4 + headOffY, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    // tongue when striking
    if (striking) {
      ctx.strokeStyle = '#ff5566';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + headOffX + dir * 3, cy - 4 + headOffY);
      ctx.lineTo(cx + headOffX + dir * 7, cy - 4 + headOffY);
      ctx.stroke();
    }
    // eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx + headOffX + dir, cy - 6 + headOffY, 2, 2);
  }

  // ---------- Boulder ----------
  function drawBoulder(ctx, x, y) {
    const cx = x + 16, cy = y + 16;
    ctx.fillStyle = '#555562';
    ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a45';
    ctx.beginPath(); ctx.arc(cx + 3, cy + 4, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#777788';
    ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222228';
    ctx.beginPath(); ctx.arc(cx + 5, cy - 2, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - 4, cy + 5, 1.5, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- Checkpoint flag ----------
  function drawCheckpoint(ctx, x, y, active, frame) {
    // pole
    ctx.fillStyle = '#888';
    ctx.fillRect(x + 14, y + 4, 3, 28);
    // flag
    const wave = Math.sin(frame * 0.2) * 2;
    ctx.fillStyle = active ? PALETTES.shared.checkpointOn : PALETTES.shared.checkpointOff;
    ctx.beginPath();
    ctx.moveTo(x + 17, y + 6);
    ctx.lineTo(x + 28 + wave, y + 10);
    ctx.lineTo(x + 17, y + 14);
    ctx.closePath();
    ctx.fill();
  }

  // ---------- Inflate / Deflate pads ----------
  function drawPad(ctx, x, y, kind, frame) {
    const isInflate = kind === 'inflate';
    const color = isInflate ? '#3aa6e8' : '#ff9550';
    const colorGlow = isInflate ? 'rgba(58,166,232,0.45)' : 'rgba(255,149,80,0.45)';
    const t = (frame % 30) / 30;
    const pulse = 0.7 + Math.sin(t * Math.PI * 2) * 0.3;
    // glow
    ctx.fillStyle = colorGlow;
    ctx.fillRect(x + 6 - 4 * pulse, y + 8, 20 + 8 * pulse, 20);
    // base
    ctx.fillStyle = '#444';
    ctx.fillRect(x + 4, y + 24, 24, 6);
    // pillar
    ctx.fillStyle = color;
    ctx.fillRect(x + 10, y + 8, 12, 18);
    ctx.fillStyle = shadeColor(color, 0.3);
    ctx.fillRect(x + 12, y + 10, 3, 14);
    // arrow indicator
    ctx.fillStyle = '#fff';
    if (isInflate) {
      ctx.fillRect(x + 15, y + 12, 2, 8);
      ctx.fillRect(x + 13, y + 14, 6, 2);
    } else {
      ctx.fillRect(x + 13, y + 16, 6, 2);
    }
  }

  // ---------- Exit gate ----------
  function drawExit(ctx, x, y, unlocked, frame) {
    // archway
    ctx.fillStyle = unlocked ? PALETTES.shared.ringGold : '#444';
    ctx.fillRect(x - 2, y, 36, 4);
    ctx.fillRect(x - 2, y, 4, 64);
    ctx.fillRect(x + 30, y, 4, 64);
    // portal
    if (unlocked) {
      const t = (frame % 30) / 30;
      const pulse = 0.7 + Math.sin(t * Math.PI * 2) * 0.3;
      ctx.fillStyle = `rgba(255, 210, 74, ${pulse * 0.4})`;
      ctx.fillRect(x + 2, y + 4, 28, 58);
      ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.6})`;
      ctx.fillRect(x + 12, y + 8, 8, 50);
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(x + 2, y + 4, 28, 58);
      // bars
      ctx.fillStyle = '#555';
      for (let i = 0; i < 4; i++) ctx.fillRect(x + 4 + i * 7, y + 4, 2, 58);
    }
  }

  // ---------- Locked door ----------
  function drawLockedDoor(ctx, x, y, color) {
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x, y, 32, 64);
    ctx.fillStyle = '#5a3a1f';
    ctx.fillRect(x + 4, y + 4, 24, 56);
    // panel lines
    ctx.fillStyle = '#2a1a08';
    ctx.fillRect(x + 16, y + 4, 1, 56);
    ctx.fillRect(x + 4, y + 32, 24, 1);
    // lock
    ctx.fillStyle = color;
    ctx.fillRect(x + 13, y + 28, 6, 8);
    ctx.fillRect(x + 14, y + 24, 4, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 15, y + 30, 2, 3);
  }

  // ---------- Grapple point ----------
  function drawGrapplePoint(ctx, x, y, frame) {
    const cx = x + 16, cy = y + 16;
    const t = (frame % 30) / 30;
    const pulse = 0.7 + Math.sin(t * Math.PI * 2) * 0.3;
    ctx.fillStyle = `rgba(0, 229, 255, ${pulse * 0.3})`;
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 1, cy - 1, 2, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- Pressure plate ----------
  function drawPressurePlate(ctx, x, y, pressed) {
    ctx.fillStyle = '#444';
    ctx.fillRect(x + 2, y + 24, 28, 6);
    ctx.fillStyle = pressed ? '#7aff7a' : '#888';
    ctx.fillRect(x + 4, pressed ? y + 26 : y + 22, 24, pressed ? 4 : 8);
  }

  // ---------- Stalactite ----------
  function drawStalactite(ctx, x, y, falling, shake) {
    const ox = falling ? (Math.random() - 0.5) * shake : 0;
    ctx.fillStyle = '#7a6a55';
    ctx.beginPath();
    ctx.moveTo(x + 4 + ox, y);
    ctx.lineTo(x + 28 + ox, y);
    ctx.lineTo(x + 16 + ox, y + 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#a08866';
    ctx.beginPath();
    ctx.moveTo(x + 10 + ox, y);
    ctx.lineTo(x + 20 + ox, y);
    ctx.lineTo(x + 16 + ox, y + 22);
    ctx.closePath();
    ctx.fill();
  }

  // ---------- Helpers ----------
  function shadeColor(hex, amount) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const f = amount < 0 ? (1 + amount) : 1;
    const add = amount > 0 ? amount * 255 : 0;
    const nr = Math.min(255, Math.max(0, Math.floor(r * f + add)));
    const ng = Math.min(255, Math.max(0, Math.floor(g * f + add)));
    const nb = Math.min(255, Math.max(0, Math.floor(b * f + add)));
    return `rgb(${nr},${ng},${nb})`;
  }

  return {
    drawPlayer, drawRing, drawGem, drawEnergy, drawKey,
    drawSpider, drawSnake, drawBoulder, drawCheckpoint,
    drawPad, drawExit, drawLockedDoor, drawGrapplePoint,
    drawPressurePlate, drawStalactite, shadeColor,
  };
})();
