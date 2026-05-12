// Title screen, world map, pause menu, stage complete screen.
const Menu = (() => {

  // ---------- Title ----------
  let titleFrame = 0;

  function renderTitle(ctx) {
    titleFrame++;
    // Animated background — soft pulsing gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 540);
    grad.addColorStop(0, '#0a0a14');
    grad.addColorStop(0.6, '#1a1a2e');
    grad.addColorStop(1, '#3a2818');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 540);

    // Floating background particles
    if (titleFrame % 4 === 0) {
      Particles.spawn({
        x: Math.random() * 960, y: 540,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.5 - Math.random() * 0.8,
        life: 180, color: ['#ffd24a', '#e63946', '#00e5ff'][Math.floor(Math.random() * 3)],
        size: 1 + Math.random() * 1.5, gravity: 0, shape: 'square',
      });
    }
    Particles.update();
    Particles.render(ctx, 0, 0);

    // Big title — drawn via bitmap font, scaled large with pulsing glow
    const pulse = 1 + Math.sin(titleFrame * 0.04) * 0.04;
    const titleY = 120;
    // shadow halo
    ctx.save();
    ctx.shadowBlur = 30 * pulse;
    ctx.shadowColor = '#ffd24a';
    Font.drawCentered(ctx, 'RETRO', 480, titleY, 12, PALETTES.shared.player, null);
    Font.drawCentered(ctx, 'RUSH', 480, titleY + 80, 12, PALETTES.shared.ringGold, null);
    ctx.restore();

    Font.drawCentered(ctx, 'A NOKIA-ERA TRIBUTE', 480, 290, 2, '#aaa', '#000');

    if (Math.floor(titleFrame / 30) % 2 === 0) {
      Font.drawCentered(ctx, 'PRESS ENTER TO START', 480, 380, 3, '#fff', '#000');
    }

    Font.drawCentered(ctx, 'ARROWS / WASD MOVE   SPACE JUMP   E TOOL   R RESPAWN   ESC PAUSE', 480, 490, 1, '#888', '#000');
  }

  function updateTitle() {
    if (Input.wasPressed('confirm')) {
      Audio2.unlock();
      Audio2.play('select');
      return 'WORLD_MAP';
    }
    return null;
  }

  // ---------- World map ----------
  let wmCursor = 0;
  let wmCursorTarget = 0;
  let wmFrame = 0;

  function initWorldMap() {
    wmFrame = 0;
    const save = SaveSystem.get();
    const idx = WorldData.stageIndex(save.currentStage);
    wmCursor = idx >= 0 ? idx : 0;
    wmCursorTarget = wmCursor;
  }

  function updateWorldMap() {
    wmFrame++;
    const stages = WorldData.stages();
    if (Input.wasPressed('left')) { wmCursorTarget = Math.max(0, wmCursorTarget - 1); Audio2.play('select'); }
    if (Input.wasPressed('right')) { wmCursorTarget = Math.min(stages.length - 1, wmCursorTarget + 1); Audio2.play('select'); }
    if (Input.wasPressed('up')) { wmCursorTarget = Math.max(0, wmCursorTarget - 6); Audio2.play('select'); }
    if (Input.wasPressed('down')) { wmCursorTarget = Math.min(stages.length - 1, wmCursorTarget + 6); Audio2.play('select'); }
    wmCursor += (wmCursorTarget - wmCursor) * 0.25;

    if (Input.wasPressed('confirm')) {
      const stage = stages[wmCursorTarget];
      const save = SaveSystem.get();
      if (save.unlockedStages.includes(stage.id)) {
        return { state: 'PLAYING', stageId: stage.id };
      } else {
        Audio2.play('damage');
      }
    }
    if (Input.wasPressed('pause')) return { state: 'TITLE' };
    return null;
  }

  function renderWorldMap(ctx) {
    // background per cursor world
    const stages = WorldData.stages();
    const stage = stages[Math.round(wmCursor)];
    const world = stage ? stage.world : 1;
    const pal = worldPalette(world);
    const grad = ctx.createLinearGradient(0, 0, 0, 540);
    grad.addColorStop(0, pal.bgFar);
    grad.addColorStop(1, pal.bgNear);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 540);

    Font.drawCentered(ctx, 'WORLD MAP', 480, 40, 4, '#fff', '#000');
    Font.drawCentered(ctx, pal.name, 480, 90, 2, pal.accent, '#000');

    // Layout: 3 rows of 6 nodes
    const save = SaveSystem.get();
    const nodeW = 110;
    const nodeH = 80;
    const startY = 160;
    const cols = 6;

    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = 80 + col * 130;
      const y = startY + row * 110;
      const unlocked = save.unlockedStages.includes(s.id);
      const stats = save.stageStats[s.id];
      const isCursor = i === Math.round(wmCursor);

      // Node background
      ctx.fillStyle = unlocked ? (stats ? 'rgba(255,210,74,0.2)' : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, y, nodeW, nodeH);

      // Border
      if (isCursor) {
        const pulse = Math.sin(wmFrame * 0.15) * 2;
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 2 - pulse, y - 2 - pulse, nodeW + 4 + pulse * 2, nodeH + 4 + pulse * 2);
      } else {
        ctx.strokeStyle = unlocked ? '#aaa' : '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, nodeW, nodeH);
      }

      // ID
      Font.drawCentered(ctx, s.id, x + nodeW / 2, y + 10, 3, unlocked ? '#fff' : '#666', '#000');

      // Stars
      if (stats) {
        for (let star = 0; star < 3; star++) {
          ctx.fillStyle = star < stats.stars ? '#ffd24a' : '#444';
          drawStar(ctx, x + 18 + star * 28, y + 50, 6);
        }
      } else if (!unlocked) {
        Font.drawCentered(ctx, 'LOCKED', x + nodeW / 2, y + 50, 1, '#666', '#000');
      } else {
        Font.drawCentered(ctx, 'NEW', x + nodeW / 2, y + 48, 2, pal.accent, '#000');
      }
    }

    // Detail panel
    if (stage) {
      const stats = save.stageStats[stage.id];
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(80, 470, 800, 50);
      Font.draw(ctx, stage.name, 100, 480, 2, '#fff', '#000');
      if (stats) {
        Font.draw(ctx, 'BEST ' + stats.bestTime.toFixed(1) + 'S', 100, 502, 1, '#aaa', '#000');
        Font.draw(ctx, 'RINGS ' + stats.ringsCollected + '/' + stats.totalRings, 240, 502, 1, '#aaa', '#000');
        Font.draw(ctx, 'GEMS ' + stats.gemsCollected + '/' + stats.totalGems, 400, 502, 1, '#aaa', '#000');
      }
      const unlocked = save.unlockedStages.includes(stage.id);
      Font.draw(ctx, unlocked ? '[ENTER] PLAY  [ESC] TITLE' : '[ESC] TITLE', 600, 490, 1, '#fff', '#000');
    }
  }

  function drawStar(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      const a2 = a + Math.PI / 5;
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a2) * r * 0.5, cy + Math.sin(a2) * r * 0.5);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ---------- Pause ----------
  const PAUSE_ITEMS = ['RESUME', 'RESTART STAGE', 'SFX VOLUME', 'MUSIC VOLUME', 'QUIT TO MAP'];
  let pauseCursor = 0;

  function initPause() { pauseCursor = 0; }

  function updatePause() {
    if (Input.wasPressed('up'))   { pauseCursor = (pauseCursor - 1 + PAUSE_ITEMS.length) % PAUSE_ITEMS.length; Audio2.play('select'); }
    if (Input.wasPressed('down')) { pauseCursor = (pauseCursor + 1) % PAUSE_ITEMS.length; Audio2.play('select'); }
    if (pauseCursor === 2 || pauseCursor === 3) {
      const delta = Input.wasPressed('right') ? 0.1 : Input.wasPressed('left') ? -0.1 : 0;
      if (delta !== 0) {
        if (pauseCursor === 2) {
          Audio2.setSfxVolume(Audio2.getSfxVolume() + delta);
          SaveSystem.setSetting('sfxVolume', Audio2.getSfxVolume());
          Audio2.play('ring');
        } else {
          Audio2.setMusicVolume(Audio2.getMusicVolume() + delta);
          SaveSystem.setSetting('musicVolume', Audio2.getMusicVolume());
        }
      }
    }
    if (Input.wasPressed('confirm')) {
      Audio2.play('select');
      switch (pauseCursor) {
        case 0: return 'RESUME';
        case 1: return 'RESTART';
        case 4: return 'QUIT';
      }
    }
    if (Input.wasPressed('pause')) return 'RESUME';
    return null;
  }

  function renderPause(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 960, 540);
    Font.drawCentered(ctx, 'PAUSED', 480, 130, 6, '#fff', '#000');
    for (let i = 0; i < PAUSE_ITEMS.length; i++) {
      let text = PAUSE_ITEMS[i];
      if (i === 2) text += '  ' + Math.round(Audio2.getSfxVolume() * 100) + '%';
      if (i === 3) text += '  ' + Math.round(Audio2.getMusicVolume() * 100) + '%';
      const color = i === pauseCursor ? '#ffd24a' : '#fff';
      Font.drawCentered(ctx, (i === pauseCursor ? '> ' : '  ') + text, 480, 240 + i * 32, 2, color, '#000');
    }
  }

  // ---------- Stage complete ----------
  let scStats = null;
  let scStage = null;
  let scFrame = 0;
  let scNext = null;
  let scCursor = 0;
  const SC_ITEMS = ['NEXT STAGE', 'RETRY', 'WORLD MAP'];

  function initStageComplete(level, nextId) {
    scStats = level.stats();
    scStage = WorldData.getStage(level.id);
    scNext = nextId;
    scFrame = 0;
    scCursor = scNext ? 0 : 2;
  }

  function updateStageComplete() {
    scFrame++;
    if (scFrame < 60) return null;
    if (Input.wasPressed('up'))   { scCursor = (scCursor - 1 + SC_ITEMS.length) % SC_ITEMS.length; Audio2.play('select'); }
    if (Input.wasPressed('down')) { scCursor = (scCursor + 1) % SC_ITEMS.length; Audio2.play('select'); }
    if (Input.wasPressed('confirm')) {
      Audio2.play('select');
      if (scCursor === 0 && scNext) return { action: 'PLAY', stageId: scNext };
      if (scCursor === 1) return { action: 'RETRY' };
      if (scCursor === 2) return { action: 'MAP' };
    }
    return null;
  }

  function renderStageComplete(ctx) {
    scFrame++;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, 960, 540);

    Font.drawCentered(ctx, 'STAGE COMPLETE', 480, 60, 5, '#ffd24a', '#000');
    Font.drawCentered(ctx, scStage ? scStage.name : '', 480, 130, 3, '#fff', '#000');

    // Stars
    const earned = scStats.stars;
    for (let i = 0; i < 3; i++) {
      const reveal = scFrame > 60 + i * 30;
      const x = 380 + i * 100;
      ctx.fillStyle = reveal && i < earned ? '#ffd24a' : '#222';
      drawStar(ctx, x, 220, 30);
    }

    // Stats
    const mm = Math.floor(scStats.time / 60);
    const ss = (scStats.time % 60).toFixed(1);
    Font.draw(ctx, 'TIME      ' + (mm + ':' + (ss < 10 ? '0' + ss : ss)), 320, 290, 2, '#fff', '#000');
    Font.draw(ctx, 'RINGS     ' + scStats.rings + '/' + scStats.totalRings, 320, 320, 2, '#fff', '#000');
    Font.draw(ctx, 'GEMS      ' + scStats.gems + '/' + scStats.totalGems, 320, 350, 2, '#fff', '#000');
    if (scStats.redGemsFound && scStats.redGemsFound.length > 0) {
      const found = scStats.redGemsFound.filter(Boolean).length;
      Font.draw(ctx, 'RED GEMS  ' + found + '/' + scStats.redGemsFound.length, 320, 380, 2, '#ff8a8a', '#000');
    }

    if (scFrame < 60) return;

    for (let i = 0; i < SC_ITEMS.length; i++) {
      const txt = SC_ITEMS[i];
      const enabled = (i !== 0) || scNext;
      const c = !enabled ? '#444' : (i === scCursor ? '#ffd24a' : '#fff');
      Font.drawCentered(ctx, (i === scCursor ? '> ' : '  ') + txt, 480, 440 + i * 26, 2, c, '#000');
    }
  }

  // ---------- Game over (no lives, all hearts gone & no checkpoint with HP) ----------
  // Spec uses checkpoint respawn model, so true game over only on quit. Skipped UI.

  return {
    renderTitle, updateTitle,
    initWorldMap, updateWorldMap, renderWorldMap,
    initPause, updatePause, renderPause,
    initStageComplete, updateStageComplete, renderStageComplete,
  };
})();
