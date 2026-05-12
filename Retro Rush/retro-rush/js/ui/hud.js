// In-game HUD: health, ring counter, gem counter, stage ID, active tool, timer.
const HUD = (() => {

  function render(ctx, level, player) {
    // Top dark panel
    ctx.fillStyle = PALETTES.shared.uiBg;
    ctx.fillRect(0, 0, 960, 36);

    // Hearts
    for (let i = 0; i < player.maxHp; i++) {
      drawHeart(ctx, 14 + i * 20, 10, i < player.hp);
    }

    // Ring counter
    drawRingIcon(ctx, 100, 18);
    const ringText = player.rings + '/' + level.totalRings;
    Font.draw(ctx, ringText, 116, 10, 2,
      player.rings >= level.totalRings ? '#ffd24a' : '#fff', '#000');

    // Gem counter
    drawGemIcon(ctx, 230, 18);
    Font.draw(ctx, String(player.gems), 246, 10, 2, '#d27cff', '#000');

    // Red gems
    if (level.totalRedGems > 0) {
      drawRedGemIcon(ctx, 320, 18);
      const found = (player.redGems || []).filter(Boolean).length;
      Font.draw(ctx, found + '/' + level.totalRedGems, 336, 10, 2, '#ff8a8a', '#000');
    }

    // Stage ID + timer
    Font.draw(ctx, level.id, 870, 10, 2, '#fff', '#000');
    const sec = Math.floor(level.elapsedFrames / 60);
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    const t = mm + ':' + (ss < 10 ? '0' : '') + ss;
    Font.draw(ctx, t, 770, 10, 2, sec > level.parTime ? '#ff9a9a' : '#fff', '#000');

    // Active tool indicator (bottom-right)
    if (player.tools.length > 0) {
      const lastTool = player.tools[player.tools.length - 1];
      const label = lastTool === 'hammer' ? '[E] HAMMER' : lastTool === 'grapple' ? '[E] GRAPPLE' : '';
      if (label) {
        ctx.fillStyle = PALETTES.shared.uiBg;
        ctx.fillRect(720, 510, 230, 25);
        Font.draw(ctx, label, 736, 518, 2, '#ffd24a', '#000');
      }
    }

    // Tutorial hints on stage 1-1 only
    if (level.id === '1-1' && level.frame < 240) {
      const a = Math.max(0, 1 - (level.frame - 180) / 60);
      ctx.globalAlpha = a;
      Font.drawCentered(ctx, 'ARROWS OR WASD TO MOVE   SPACE TO JUMP', 480, 480, 2, '#fff', '#000');
      ctx.globalAlpha = 1;
    }
  }

  function drawHeart(ctx, x, y, filled) {
    ctx.fillStyle = filled ? PALETTES.shared.player : '#444';
    // pixel heart shape
    const px = (cx, cy, w = 2, h = 2) => ctx.fillRect(x + cx, y + cy, w, h);
    px(2, 0, 4, 2);
    px(8, 0, 4, 2);
    px(0, 2, 14, 2);
    px(2, 4, 10, 2);
    px(4, 6, 6, 2);
    px(6, 8, 2, 2);
    if (filled) {
      ctx.fillStyle = '#ffaaaa';
      ctx.fillRect(x + 3, y + 1, 2, 2);
    }
  }

  function drawRingIcon(ctx, cx, cy) {
    ctx.fillStyle = '#b8881a';
    ctx.beginPath(); ctx.ellipse(cx, cy, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd24a';
    ctx.beginPath(); ctx.ellipse(cx, cy, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(cx, cy, 2.5, 4, 0, 0, Math.PI * 2); ctx.fill();
  }

  function drawGemIcon(ctx, cx, cy) {
    ctx.fillStyle = '#a64ad9';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx, cy + 7);
    ctx.lineTo(cx - 5, cy);
    ctx.closePath();
    ctx.fill();
  }

  function drawRedGemIcon(ctx, cx, cy) {
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx, cy + 7);
    ctx.lineTo(cx - 5, cy);
    ctx.closePath();
    ctx.fill();
  }

  return { render };
})();
