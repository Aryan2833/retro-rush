// Main entry — game loop, state machine, scene transitions.
(() => {
  const FIXED_DT = 1000 / 60;
  const MAX_FRAME = 250;  // spiral-of-death guard (matches review note)

  let canvas, ctx;
  let state = 'TITLE'; // TITLE | WORLD_MAP | PLAYING | PAUSED | STAGE_COMPLETE
  let level = null;
  let player = null;
  let fadeT = 0;       // 0 = no fade, >0 = fading in (counts down), <0 = fading out
  let pendingState = null;
  let pendingStageId = null;
  let lastTime = 0;
  let accumulator = 0;
  let stagePlayedMusicWorld = 0;

  function init() {
    const c = GameCanvas.init();
    canvas = c.canvas;
    ctx = c.ctx;
    Input.init();
    SaveSystem.load();
    // Apply saved volumes
    Audio2.setSfxVolume(SaveSystem.get().settings.sfxVolume);
    Audio2.setMusicVolume(SaveSystem.get().settings.musicVolume);

    document.getElementById('loading').classList.add('hidden');
    state = 'TITLE';
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;
    if (dt > MAX_FRAME) dt = MAX_FRAME;
    accumulator += dt;
    while (accumulator >= FIXED_DT) {
      update();
      accumulator -= FIXED_DT;
    }
    render();
    requestAnimationFrame(loop);
  }

  function update() {
    // Fades
    if (fadeT > 0) {
      fadeT--;
      if (fadeT === 30 && pendingState) {
        // mid-fade: actually switch state
        applyPendingState();
      }
    }

    switch (state) {
      case 'TITLE': {
        const r = Menu.updateTitle();
        if (r === 'WORLD_MAP') {
          startFade('WORLD_MAP');
          Audio2.startMusic(MusicData.menu);
        }
        break;
      }
      case 'WORLD_MAP': {
        const r = Menu.updateWorldMap();
        if (r) {
          if (r.state === 'PLAYING') {
            pendingStageId = r.stageId;
            startFade('PLAYING');
          } else if (r.state === 'TITLE') {
            startFade('TITLE');
          }
        }
        break;
      }
      case 'PLAYING': {
        if (Input.wasPressed('pause')) {
          state = 'PAUSED';
          Menu.initPause();
          break;
        }
        level.update();
        if (player && !player.dead) {
          if (Camera) Camera.follow(player.x + player.w / 2, player.y + player.h / 2);
        } else if (player && player.dead && player.deathTimer > 60) {
          player.respawnAtCheckpoint();
          Camera.snapTo(player.x + player.w / 2, player.y + player.h / 2);
        }
        if (level.completed && !pendingState) {
          // Award completion
          finishStage();
        }
        break;
      }
      case 'PAUSED': {
        const r = Menu.updatePause();
        if (r === 'RESUME') state = 'PLAYING';
        else if (r === 'RESTART') {
          pendingStageId = level.id;
          startFade('PLAYING');
        } else if (r === 'QUIT') {
          startFade('WORLD_MAP');
          Audio2.startMusic(MusicData.menu);
          stagePlayedMusicWorld = 0;
        }
        break;
      }
      case 'STAGE_COMPLETE': {
        const r = Menu.updateStageComplete();
        if (r) {
          if (r.action === 'PLAY') {
            pendingStageId = r.stageId;
            startFade('PLAYING');
          } else if (r.action === 'RETRY') {
            pendingStageId = level.id;
            startFade('PLAYING');
          } else if (r.action === 'MAP') {
            startFade('WORLD_MAP');
            Audio2.startMusic(MusicData.menu);
            stagePlayedMusicWorld = 0;
          }
        }
        break;
      }
    }

    Input.endFrame();
  }

  function render() {
    GameCanvas.clear('#000');
    switch (state) {
      case 'TITLE': Menu.renderTitle(ctx); break;
      case 'WORLD_MAP': Menu.renderWorldMap(ctx); break;
      case 'PLAYING':
        level.render(ctx);
        HUD.render(ctx, level, player);
        break;
      case 'PAUSED':
        level.render(ctx);
        HUD.render(ctx, level, player);
        Menu.renderPause(ctx);
        break;
      case 'STAGE_COMPLETE':
        level.render(ctx);
        HUD.render(ctx, level, player);
        Menu.renderStageComplete(ctx);
        break;
    }
    // Fade overlay
    if (fadeT > 0) {
      // 0..30 fading out (going darker), 30..60 fading in
      let alpha;
      if (fadeT > 30) alpha = (60 - fadeT) / 30;     // fade out
      else            alpha = fadeT / 30;            // fade in
      ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
      ctx.fillRect(0, 0, 960, 540);
    }
  }

  function startFade(targetState) {
    if (fadeT > 0) return;
    fadeT = 60;
    pendingState = targetState;
  }

  function applyPendingState() {
    const target = pendingState;
    pendingState = null;
    if (target === 'TITLE') {
      state = 'TITLE';
      Audio2.stopMusic();
    } else if (target === 'WORLD_MAP') {
      state = 'WORLD_MAP';
      Menu.initWorldMap();
      Particles.clear();
    } else if (target === 'PLAYING') {
      loadStage(pendingStageId);
      state = 'PLAYING';
    }
  }

  function loadStage(id) {
    const data = LevelData.get(id);
    if (!data) {
      console.warn('No level:', id);
      state = 'WORLD_MAP';
      return;
    }
    level = new Level(data, data.world);
    player = new Player(level.spawn.x * 32, level.spawn.y * 32);
    // Grant tools based on save data
    const save = SaveSystem.get();
    for (const t of save.toolsUnlocked) player.tools.push(t);
    // Also grant the tool for this stage if it grants one
    const stage = WorldData.getStage(id);
    if (stage && stage.grantsTool && !player.tools.includes(stage.grantsTool)) {
      player.tools.push(stage.grantsTool);
    }
    // Init red gems array
    player.redGems = new Array(level.totalRedGems).fill(false);

    level.attachPlayer(player);
    level.onComplete(() => {});

    // Camera + bounds
    Camera.setBounds(level.width * 32, level.height * 32);
    Camera.snapTo(player.x + player.w / 2, player.y + player.h / 2);

    Particles.clear();

    // Music per world
    if (stagePlayedMusicWorld !== level.world) {
      Audio2.startMusic(MusicData.forWorld(level.world));
      stagePlayedMusicWorld = level.world;
    }
  }

  function finishStage() {
    const stage = WorldData.getStage(level.id);
    const stats = level.stats();
    SaveSystem.recordStageComplete(level.id, stats);
    // Unlock next
    const next = WorldData.nextStage(level.id);
    if (next) SaveSystem.unlockStage(next.id);
    // Grant tool
    if (stage && stage.grantsTool) SaveSystem.unlockTool(stage.grantsTool);
    SaveSystem.get().currentStage = next ? next.id : level.id;
    SaveSystem.save();

    Menu.initStageComplete(level, next ? next.id : null);
    state = 'STAGE_COMPLETE';
  }

  window.addEventListener('DOMContentLoaded', init);
})();
