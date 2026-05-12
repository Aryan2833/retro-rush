// All 18 level definitions. Each level is built with helper functions for clarity.
// Tile IDs match collision.js / tiles.js mapping.
const LevelData = (() => {

  // ---------- Builder helpers ----------
  function blank(w, h) {
    const tiles = [];
    for (let y = 0; y < h; y++) {
      const row = new Array(w).fill(0);
      tiles.push(row);
    }
    return tiles;
  }

  // Fill horizontal floor along bottom rows
  function floor(tiles, fromX, toX, y, id = 1) {
    for (let x = fromX; x <= toX; x++) tiles[y][x] = id;
  }
  function rect(tiles, x0, y0, x1, y1, id = 1) {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) tiles[y][x] = id;
  }
  function set(tiles, x, y, id) { tiles[y][x] = id; }
  function platform(tiles, x0, x1, y, id = 1) { floor(tiles, x0, x1, y, id); }
  function spikes(tiles, x0, x1, y, id = 5) { for (let x = x0; x <= x1; x++) tiles[y][x] = id; }
  function box(tiles, x0, y0, x1, y1, id = 1) {
    for (let x = x0; x <= x1; x++) { tiles[y0][x] = id; tiles[y1][x] = id; }
    for (let y = y0; y <= y1; y++) { tiles[y][x0] = id; tiles[y][x1] = id; }
  }
  function frame(tiles, w, h, id = 1) {
    // outer frame walls + floor
    for (let x = 0; x < w; x++) { tiles[h - 1][x] = id; tiles[0][x] = id; }
    for (let y = 0; y < h; y++) { tiles[y][0] = id; tiles[y][w - 1] = id; }
  }

  // Sprinkle rings along a row
  function ringRow(entities, x0, x1, y) {
    for (let x = x0; x <= x1; x++) entities.push({ type: 'ring', x, y });
  }

  // ============================================================
  // World 1 — Forgotten Ruins
  // ============================================================

  // 1-1: First Steps — linear teaches walk/jump/rings
  function level_1_1() {
    const w = 60, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 58, 15);
    // mini bumps
    set(t, 8, 14, 1); set(t, 9, 14, 1);
    set(t, 14, 14, 1); set(t, 14, 13, 1);
    set(t, 18, 14, 1); set(t, 18, 13, 1); set(t, 18, 12, 1);
    set(t, 22, 14, 1); set(t, 22, 13, 1); set(t, 22, 12, 1);
    // gap with one-way platforms
    set(t, 26, 14, 0); set(t, 27, 14, 0);
    set(t, 26, 12, 3); set(t, 27, 12, 3);
    // crumble bridge
    set(t, 30, 14, 4); set(t, 31, 14, 4); set(t, 32, 14, 4);
    // step up
    floor(t, 35, 38, 13);
    set(t, 40, 12, 1); set(t, 41, 12, 1); set(t, 42, 12, 1);
    // small platforms
    platform(t, 45, 47, 11);
    platform(t, 50, 52, 13);

    const ents = [];
    ringRow(ents, 4, 8, 13);
    ringRow(ents, 14, 18, 12);
    ents.push({ type: 'ring', x: 22, y: 11 });
    ringRow(ents, 26, 32, 11);
    ringRow(ents, 36, 42, 11);
    ringRow(ents, 45, 52, 10);
    ents.push({ type: 'gem', x: 19, y: 11 });
    ents.push({ type: 'gem', x: 42, y: 10 });
    ents.push({ type: 'gem', x: 50, y: 9 });
    ents.push({ type: 'redGem', x: 56, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 28, y: 13 });

    return {
      id: '1-1', name: 'First Steps', world: 1,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 56, y: 14 },
      requiredRings: 18, parTime: 60,
      tiles: t, entities: ents,
    };
  }

  // 1-2: Deep Pool — water + inflate/deflate
  function level_1_2() {
    const w = 64, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 12, 15);
    // water pool
    rect(t, 13, 13, 26, 15, 9);
    floor(t, 13, 26, 16);   // (frame floor already there)
    // floor resumes
    floor(t, 27, 38, 15);
    // narrow passage requiring deflate
    rect(t, 40, 13, 42, 15, 1);
    set(t, 41, 14, 0); // 1-tile gap
    floor(t, 43, 62, 15);
    // step
    platform(t, 50, 54, 13);
    platform(t, 56, 58, 11);

    const ents = [];
    ents.push({ type: 'inflatePad', x: 10, y: 14 });
    ringRow(ents, 14, 25, 12);
    ringRow(ents, 14, 25, 14);
    ents.push({ type: 'deflatePad', x: 38, y: 14 });
    ents.push({ type: 'gem', x: 41, y: 14 });   // hidden inside narrow gap
    ents.push({ type: 'normalPad', x: 45, y: 14 });
    ringRow(ents, 48, 60, 14);
    ents.push({ type: 'ring', x: 52, y: 12 });
    ents.push({ type: 'ring', x: 57, y: 10 });
    ents.push({ type: 'gem', x: 58, y: 10 });
    ents.push({ type: 'redGem', x: 60, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 32, y: 14 });

    return {
      id: '1-2', name: 'Deep Pool', world: 1,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 62, y: 14 },
      requiredRings: 18, parTime: 75,
      tiles: t, entities: ents,
    };
  }

  // 1-3: The Locked Garden — keys + doors
  function level_1_3() {
    const w = 64, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 62, 15);
    // wall splitting level
    rect(t, 30, 11, 30, 15, 1);  // tall wall (gap will become door)
    set(t, 30, 13, 0); set(t, 30, 14, 0); // gap for door (entity)
    // platforms
    platform(t, 6, 9, 12);
    platform(t, 14, 17, 10);
    platform(t, 22, 25, 12);
    platform(t, 40, 43, 12);
    platform(t, 48, 52, 10);
    platform(t, 56, 60, 13);
    // crumble route
    set(t, 35, 13, 4); set(t, 36, 13, 4); set(t, 37, 13, 4);

    const ents = [];
    ents.push({ type: 'key', x: 16, y: 9, keyType: 'silver' });
    ents.push({ type: 'lockedDoor', x: 30, y: 13, keyType: 'silver' });
    ents.push({ type: 'key', x: 50, y: 9, keyType: 'gold' });
    ents.push({ type: 'lockedDoor', x: 60, y: 13, keyType: 'gold' });
    ringRow(ents, 4, 10, 14);
    ringRow(ents, 14, 17, 9);
    ringRow(ents, 22, 25, 11);
    ringRow(ents, 40, 43, 11);
    ringRow(ents, 48, 52, 9);
    ents.push({ type: 'gem', x: 16, y: 9 });
    ents.push({ type: 'gem', x: 25, y: 11 });
    ents.push({ type: 'gem', x: 50, y: 9 });
    ents.push({ type: 'redGem', x: 36, y: 12, index: 0 });
    ents.push({ type: 'checkpoint', x: 32, y: 14 });

    return {
      id: '1-3', name: 'The Locked Garden', world: 1,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 62, y: 14 },
      requiredRings: 19, parTime: 85,
      tiles: t, entities: ents,
    };
  }

  // 1-4: Spider Nest — patrol enemies + spikes
  function level_1_4() {
    const w = 70, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 68, 15);
    // spike rows
    spikes(t, 10, 11, 14);
    spikes(t, 22, 24, 14);
    spikes(t, 36, 38, 14);
    spikes(t, 50, 52, 14);
    // platforms
    platform(t, 8, 13, 11);
    platform(t, 20, 26, 11);
    platform(t, 34, 40, 11);
    platform(t, 48, 54, 11);
    // ceiling spikes
    spikes(t, 30, 34, 9, 6);

    const ents = [];
    ents.push({ type: 'spider', x: 8, y: 10, patrolRange: 5 });
    ents.push({ type: 'spider', x: 20, y: 10, patrolRange: 6 });
    ents.push({ type: 'spider', x: 34, y: 10, patrolRange: 6 });
    ents.push({ type: 'spider', x: 48, y: 10, patrolRange: 6 });
    ringRow(ents, 4, 8, 14);
    ringRow(ents, 14, 18, 14);
    ringRow(ents, 28, 32, 14);
    ringRow(ents, 42, 46, 14);
    ringRow(ents, 56, 64, 14);
    ents.push({ type: 'gem', x: 11, y: 10 });
    ents.push({ type: 'gem', x: 23, y: 10 });
    ents.push({ type: 'gem', x: 37, y: 10 });
    ents.push({ type: 'gem', x: 51, y: 10 });
    ents.push({ type: 'energy', x: 30, y: 13 });
    ents.push({ type: 'redGem', x: 67, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 32, y: 14 });
    ents.push({ type: 'checkpoint', x: 55, y: 14 });

    return {
      id: '1-4', name: 'Spider Nest', world: 1,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 68, y: 14 },
      requiredRings: 23, parTime: 100,
      tiles: t, entities: ents,
    };
  }

  // 1-5: The Rolling Stone — boulders + push puzzles
  function level_1_5() {
    const w = 70, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 68, 15);
    // pit that needs boulder to fill
    set(t, 24, 15, 0); set(t, 25, 15, 0);
    set(t, 24, 14, 9); set(t, 25, 14, 9); // water in pit
    // upper ledge with boulder
    platform(t, 15, 22, 10);
    // wall after pit
    rect(t, 32, 10, 32, 14, 1);
    set(t, 32, 13, 0); set(t, 32, 14, 0); // gap (door later)
    platform(t, 38, 45, 12);
    platform(t, 50, 58, 10);

    const ents = [];
    ents.push({ type: 'boulder', x: 20, y: 9 });
    ents.push({ type: 'boulder', x: 42, y: 11 });
    ents.push({ type: 'lockedDoor', x: 32, y: 13, keyType: 'silver' });
    ents.push({ type: 'key', x: 55, y: 9, keyType: 'silver' });
    ringRow(ents, 4, 12, 14);
    ringRow(ents, 16, 22, 9);
    ringRow(ents, 38, 45, 11);
    ringRow(ents, 50, 58, 9);
    ents.push({ type: 'gem', x: 18, y: 8 });
    ents.push({ type: 'gem', x: 56, y: 8 });
    ents.push({ type: 'redGem', x: 65, y: 4, index: 0 });
    ents.push({ type: 'spider', x: 50, y: 9, patrolRange: 6 });
    ents.push({ type: 'checkpoint', x: 35, y: 14 });

    return {
      id: '1-5', name: 'The Rolling Stone', world: 1,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 67, y: 14 },
      requiredRings: 23, parTime: 110,
      tiles: t, entities: ents,
    };
  }

  // 1-B: Guardian's Gate — boss/challenge stage combining W1 mechanics
  function level_1_B() {
    const w = 80, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 78, 15);
    // 1st section — spike gauntlet
    spikes(t, 8, 9, 14);
    spikes(t, 13, 14, 14);
    spikes(t, 18, 19, 14);
    // 2nd — water + inflate
    rect(t, 24, 13, 34, 15, 9);
    // 3rd — spiders + platforms
    platform(t, 38, 42, 11);
    platform(t, 46, 50, 11);
    platform(t, 54, 58, 11);
    // 4th — boulder gate
    rect(t, 62, 11, 62, 14, 1);
    set(t, 62, 14, 0);
    // 5th — final climb
    platform(t, 66, 70, 12);
    platform(t, 72, 78, 9);

    const ents = [];
    ents.push({ type: 'inflatePad', x: 22, y: 14 });
    ents.push({ type: 'deflatePad', x: 36, y: 14 });
    ents.push({ type: 'spider', x: 38, y: 10, patrolRange: 4 });
    ents.push({ type: 'spider', x: 46, y: 10, patrolRange: 4 });
    ents.push({ type: 'spider', x: 54, y: 10, patrolRange: 4 });
    ents.push({ type: 'boulder', x: 60, y: 13 });
    ringRow(ents, 4, 22, 14);
    ringRow(ents, 24, 34, 12);
    ringRow(ents, 38, 58, 10);
    ringRow(ents, 64, 76, 14);
    ents.push({ type: 'energy', x: 45, y: 13 });
    ents.push({ type: 'gem', x: 30, y: 12 });
    ents.push({ type: 'gem', x: 50, y: 10 });
    ents.push({ type: 'gem', x: 75, y: 8 });
    ents.push({ type: 'redGem', x: 78, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 23, y: 14 });
    ents.push({ type: 'checkpoint', x: 44, y: 14 });
    ents.push({ type: 'checkpoint', x: 65, y: 14 });

    return {
      id: '1-B', name: "Guardian's Gate", world: 1,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 78, y: 14 },
      requiredRings: 40, parTime: 150,
      tiles: t, entities: ents,
    };
  }

  // ============================================================
  // World 2 — Clockwork Fortress
  // ============================================================

  // 2-1: The Armory — hammer + cracked walls
  function level_2_1() {
    const w = 64, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 62, 15);
    // cracked wall blocking path
    rect(t, 14, 12, 14, 14, 14);
    rect(t, 28, 11, 28, 14, 14);
    // platforms
    platform(t, 20, 24, 11);
    platform(t, 34, 40, 12);
    // upper hidden area accessible by breaking a crack
    rect(t, 48, 11, 48, 14, 14);
    platform(t, 49, 54, 10);
    platform(t, 56, 60, 13);

    const ents = [];
    ringRow(ents, 4, 13, 14);
    ringRow(ents, 16, 26, 14);
    ringRow(ents, 30, 40, 11);
    ringRow(ents, 49, 60, 9);
    ents.push({ type: 'gem', x: 24, y: 10 });
    ents.push({ type: 'gem', x: 38, y: 11 });
    ents.push({ type: 'gem', x: 52, y: 9 });
    ents.push({ type: 'redGem', x: 47, y: 13, index: 0 }); // behind a cracked wall
    ents.push({ type: 'checkpoint', x: 30, y: 14 });

    return {
      id: '2-1', name: 'The Armory', world: 2,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 62, y: 14 },
      requiredRings: 28, parTime: 100,
      tiles: t, entities: ents,
    };
  }

  // 2-2: Pressure Point — pressure plates + boulders
  function level_2_2() {
    const w = 64, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 62, 15);
    // wall + door gap controlled by plate
    rect(t, 28, 10, 28, 14, 1);
    set(t, 28, 13, 17); set(t, 28, 14, 17); // door blocks
    // boulder source
    platform(t, 14, 18, 10);
    // platforms after
    platform(t, 36, 42, 12);
    platform(t, 48, 54, 10);
    // upper alt route
    platform(t, 30, 36, 7);
    rect(t, 36, 7, 36, 8, 14); // cracked

    const ents = [];
    ents.push({ type: 'boulder', x: 16, y: 9 });
    ents.push({ type: 'pressurePlate', x: 22, y: 14, doorId: 'door1' });
    ringRow(ents, 4, 12, 14);
    ringRow(ents, 14, 26, 9);
    ringRow(ents, 30, 42, 11);
    ringRow(ents, 48, 60, 9);
    ents.push({ type: 'gem', x: 18, y: 8 });
    ents.push({ type: 'gem', x: 40, y: 11 });
    ents.push({ type: 'gem', x: 52, y: 9 });
    ents.push({ type: 'redGem', x: 33, y: 6, index: 0 });
    ents.push({ type: 'checkpoint', x: 30, y: 14 });

    return {
      id: '2-2', name: 'Pressure Point', world: 2,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 62, y: 14 },
      requiredRings: 26, parTime: 110,
      tiles: t, entities: ents,
    };
  }

  // 2-3: Serpent Hall — snakes + tight corridors
  function level_2_3() {
    const w = 70, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 68, 15);
    // tight ceiling corridors
    rect(t, 12, 12, 22, 12, 1);  // low ceiling section
    rect(t, 32, 12, 42, 12, 1);
    // pillars
    rect(t, 26, 13, 26, 14, 1);
    rect(t, 46, 13, 46, 14, 1);
    // upper ledge
    platform(t, 52, 58, 11);
    platform(t, 60, 66, 8);

    const ents = [];
    ents.push({ type: 'snake', x: 16, y: 14 });
    ents.push({ type: 'snake', x: 22, y: 14 });
    ents.push({ type: 'snake', x: 38, y: 14 });
    ents.push({ type: 'snake', x: 50, y: 14 });
    ringRow(ents, 4, 10, 14);
    ringRow(ents, 13, 22, 13);
    ringRow(ents, 28, 30, 14);
    ringRow(ents, 33, 42, 13);
    ringRow(ents, 52, 58, 10);
    ringRow(ents, 60, 66, 7);
    ents.push({ type: 'gem', x: 26, y: 12 });
    ents.push({ type: 'gem', x: 46, y: 12 });
    ents.push({ type: 'energy', x: 56, y: 10 });
    ents.push({ type: 'redGem', x: 65, y: 6, index: 0 });
    ents.push({ type: 'checkpoint', x: 30, y: 14 });
    ents.push({ type: 'checkpoint', x: 50, y: 14 });

    return {
      id: '2-3', name: 'Serpent Hall', world: 2,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 68, y: 14 },
      requiredRings: 30, parTime: 120,
      tiles: t, entities: ents,
    };
  }

  // 2-4: Conveyor Chaos — conveyors + timing
  function level_2_4() {
    const w = 72, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 70, 15);
    // conveyor stretches
    for (let x = 10; x <= 18; x++) t[15][x] = 13;
    for (let x = 24; x <= 32; x++) t[12][x] = 12;
    platform(t, 22, 33, 13);
    // spikes between conveyors
    spikes(t, 19, 21, 14);
    // right-conveyor on upper platform
    platform(t, 38, 50, 11);
    for (let x = 40; x <= 48; x++) t[11][x] = 13;
    // gap
    spikes(t, 51, 53, 14);
    platform(t, 56, 66, 10);

    const ents = [];
    ents.push({ type: 'snake', x: 35, y: 14 });
    ringRow(ents, 4, 9, 14);
    ringRow(ents, 10, 18, 14);
    ringRow(ents, 24, 32, 11);
    ringRow(ents, 40, 48, 10);
    ringRow(ents, 56, 66, 9);
    ents.push({ type: 'gem', x: 30, y: 11 });
    ents.push({ type: 'gem', x: 44, y: 10 });
    ents.push({ type: 'gem', x: 60, y: 9 });
    ents.push({ type: 'energy', x: 30, y: 14 });
    ents.push({ type: 'redGem', x: 68, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 22, y: 14 });
    ents.push({ type: 'checkpoint', x: 50, y: 14 });

    return {
      id: '2-4', name: 'Conveyor Chaos', world: 2,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 69, y: 14 },
      requiredRings: 32, parTime: 130,
      tiles: t, entities: ents,
    };
  }

  // 2-5: The Great Mechanism — multi-room combining all W2
  function level_2_5() {
    const w = 80, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 78, 15);
    // section 1 — cracked wall
    rect(t, 14, 11, 14, 14, 14);
    // section 2 — boulder/plate gate
    rect(t, 30, 11, 30, 14, 1); set(t, 30, 13, 17); set(t, 30, 14, 17);
    platform(t, 18, 24, 11);
    // section 3 — conveyor + snake
    for (let x = 36; x <= 46; x++) t[15][x] = 13;
    // section 4 — spike + crumble
    spikes(t, 48, 50, 14);
    set(t, 52, 14, 4); set(t, 53, 14, 4);
    platform(t, 58, 64, 12);
    rect(t, 68, 10, 68, 14, 14);
    platform(t, 70, 76, 8);

    const ents = [];
    ents.push({ type: 'boulder', x: 20, y: 10 });
    ents.push({ type: 'pressurePlate', x: 26, y: 14 });
    ents.push({ type: 'snake', x: 40, y: 14 });
    ringRow(ents, 4, 13, 14);
    ringRow(ents, 16, 28, 10);
    ringRow(ents, 36, 46, 14);
    ringRow(ents, 58, 64, 11);
    ringRow(ents, 70, 76, 7);
    ents.push({ type: 'gem', x: 22, y: 10 });
    ents.push({ type: 'gem', x: 42, y: 14 });
    ents.push({ type: 'gem', x: 62, y: 11 });
    ents.push({ type: 'gem', x: 73, y: 7 });
    ents.push({ type: 'energy', x: 55, y: 14 });
    ents.push({ type: 'redGem', x: 78, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 16, y: 14 });
    ents.push({ type: 'checkpoint', x: 34, y: 14 });
    ents.push({ type: 'checkpoint', x: 56, y: 14 });

    return {
      id: '2-5', name: 'The Great Mechanism', world: 2,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 78, y: 14 },
      requiredRings: 38, parTime: 160,
      tiles: t, entities: ents,
    };
  }

  // 2-B: Knight's Gauntlet — fast-paced challenge
  function level_2_B() {
    const w = 90, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 88, 15);
    // conveyor highway with hazards
    for (let x = 8; x <= 30; x++) t[15][x] = 13;
    spikes(t, 14, 15, 14);
    spikes(t, 22, 23, 14);
    // platforms
    platform(t, 34, 38, 12);
    platform(t, 42, 46, 10);
    platform(t, 50, 54, 12);
    spikes(t, 56, 60, 14);
    // boulder section
    platform(t, 62, 70, 10);
    rect(t, 74, 11, 74, 14, 1); set(t, 74, 13, 17); set(t, 74, 14, 17);
    platform(t, 80, 86, 12);
    rect(t, 86, 9, 86, 11, 14);

    const ents = [];
    ents.push({ type: 'snake', x: 18, y: 14 });
    ents.push({ type: 'snake', x: 28, y: 14 });
    ents.push({ type: 'boulder', x: 66, y: 9 });
    ents.push({ type: 'pressurePlate', x: 72, y: 14 });
    ents.push({ type: 'snake', x: 80, y: 11 });
    ringRow(ents, 4, 7, 14);
    ringRow(ents, 8, 30, 13);
    ringRow(ents, 34, 38, 11);
    ringRow(ents, 42, 46, 9);
    ringRow(ents, 50, 54, 11);
    ringRow(ents, 62, 70, 9);
    ringRow(ents, 80, 86, 11);
    ents.push({ type: 'gem', x: 30, y: 11 });
    ents.push({ type: 'gem', x: 44, y: 9 });
    ents.push({ type: 'gem', x: 68, y: 9 });
    ents.push({ type: 'gem', x: 83, y: 11 });
    ents.push({ type: 'energy', x: 50, y: 14 });
    ents.push({ type: 'redGem', x: 87, y: 5, index: 0 });
    ents.push({ type: 'checkpoint', x: 32, y: 14 });
    ents.push({ type: 'checkpoint', x: 60, y: 14 });
    ents.push({ type: 'checkpoint', x: 78, y: 14 });

    return {
      id: '2-B', name: "Knight's Gauntlet", world: 2,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 88, y: 14 },
      requiredRings: 48, parTime: 180,
      tiles: t, entities: ents,
    };
  }

  // ============================================================
  // World 3 — Frozen Depths
  // ============================================================

  // 3-1: Into the Abyss — grapple hook unlock
  function level_3_1() {
    const w = 70, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 22, 15);
    // big gap with grapple points overhead
    rect(t, 23, 13, 38, 15, 10); // lava pit
    floor(t, 39, 68, 15);
    // grapple points (just floating, no solid tile)
    // platform after
    platform(t, 42, 48, 12);
    platform(t, 54, 60, 10);
    rect(t, 64, 11, 64, 14, 14);

    const ents = [];
    ents.push({ type: 'grapplePoint', x: 26, y: 5 });
    ents.push({ type: 'grapplePoint', x: 32, y: 5 });
    ents.push({ type: 'grapplePoint', x: 37, y: 7 });
    ringRow(ents, 4, 20, 14);
    ringRow(ents, 24, 38, 10);
    ringRow(ents, 42, 48, 11);
    ringRow(ents, 54, 60, 9);
    ents.push({ type: 'gem', x: 30, y: 7 });
    ents.push({ type: 'gem', x: 46, y: 11 });
    ents.push({ type: 'gem', x: 58, y: 9 });
    ents.push({ type: 'redGem', x: 67, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 40, y: 14 });

    return {
      id: '3-1', name: 'Into the Abyss', world: 3,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 68, y: 14 },
      requiredRings: 32, parTime: 120,
      tiles: t, entities: ents,
    };
  }

  // 3-2: Frozen Falls — ice surfaces + water
  function level_3_2() {
    const w = 70, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    // mixed ice & solid floor
    for (let x = 1; x <= 14; x++) t[15][x] = (x % 3 === 0) ? 11 : 1;
    rect(t, 15, 13, 25, 15, 9); // water
    floor(t, 26, 38, 15, 11); // long ice
    floor(t, 39, 50, 15);
    // upper platforms partial ice
    for (let x = 18; x <= 22; x++) t[11][x] = 11;
    platform(t, 28, 34, 11);
    platform(t, 42, 48, 10);
    floor(t, 51, 68, 15, 11);

    const ents = [];
    ents.push({ type: 'inflatePad', x: 13, y: 14 });
    ents.push({ type: 'deflatePad', x: 28, y: 14 });
    ringRow(ents, 4, 14, 14);
    ringRow(ents, 15, 25, 12);
    ringRow(ents, 28, 38, 14);
    ringRow(ents, 42, 48, 9);
    ringRow(ents, 51, 66, 14);
    ents.push({ type: 'gem', x: 20, y: 10 });
    ents.push({ type: 'gem', x: 32, y: 10 });
    ents.push({ type: 'gem', x: 46, y: 9 });
    ents.push({ type: 'energy', x: 40, y: 14 });
    ents.push({ type: 'redGem', x: 67, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 35, y: 14 });

    return {
      id: '3-2', name: 'Frozen Falls', world: 3,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 68, y: 14 },
      requiredRings: 34, parTime: 130,
      tiles: t, entities: ents,
    };
  }

  // 3-3: Wind Tunnel — wind zones + precision platforming
  function level_3_3() {
    const w = 72, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 70, 15);
    // upward wind shafts
    rect(t, 12, 1, 12, 13, 1);
    rect(t, 18, 1, 18, 13, 1);
    for (let y = 4; y <= 14; y++) t[y][14] = 18;
    for (let y = 4; y <= 14; y++) t[y][15] = 18;
    for (let y = 4; y <= 14; y++) t[y][16] = 18;
    platform(t, 14, 16, 3);
    // right-blowing horizontal zone
    for (let x = 24; x <= 36; x++) t[10][x] = 19;
    platform(t, 24, 36, 11);
    platform(t, 24, 36, 9);
    // gap
    spikes(t, 42, 46, 14);
    platform(t, 50, 56, 11);
    platform(t, 60, 68, 8);
    for (let y = 5; y <= 14; y++) t[y][58] = 18; // another vertical column
    rect(t, 57, 1, 57, 13, 1); rect(t, 59, 1, 59, 13, 1);

    const ents = [];
    ents.push({ type: 'stalactite', x: 14, y: 1 });
    ents.push({ type: 'stalactite', x: 16, y: 1 });
    ents.push({ type: 'stalactite', x: 58, y: 1 });
    ringRow(ents, 4, 10, 14);
    ringRow(ents, 14, 16, 5);
    ringRow(ents, 24, 36, 10);
    ringRow(ents, 50, 56, 10);
    ringRow(ents, 60, 68, 7);
    ents.push({ type: 'gem', x: 15, y: 2 });
    ents.push({ type: 'gem', x: 30, y: 8 });
    ents.push({ type: 'gem', x: 64, y: 6 });
    ents.push({ type: 'energy', x: 48, y: 14 });
    ents.push({ type: 'redGem', x: 70, y: 13, index: 0 });
    ents.push({ type: 'checkpoint', x: 22, y: 14 });
    ents.push({ type: 'checkpoint', x: 48, y: 14 });

    return {
      id: '3-3', name: 'Wind Tunnel', world: 3,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 70, y: 14 },
      requiredRings: 36, parTime: 150,
      tiles: t, entities: ents,
    };
  }

  // 3-4: The Crystal Maze — multi-path with grapple + hammer + boulders
  function level_3_4() {
    const w = 80, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 78, 15);
    // central pillar
    rect(t, 14, 10, 14, 14, 14);
    rect(t, 26, 5, 26, 14, 1);
    // grapple section
    platform(t, 18, 22, 11);
    // boulder mover section
    rect(t, 36, 11, 36, 14, 1); set(t, 36, 13, 17); set(t, 36, 14, 17);
    platform(t, 42, 50, 12);
    // ice slope
    floor(t, 52, 64, 15, 11);
    // cracked wall to red gem
    rect(t, 68, 11, 68, 14, 14);
    platform(t, 70, 76, 9);

    const ents = [];
    ents.push({ type: 'grapplePoint', x: 22, y: 5 });
    ents.push({ type: 'grapplePoint', x: 30, y: 4 });
    ents.push({ type: 'boulder', x: 30, y: 13 });
    ents.push({ type: 'pressurePlate', x: 34, y: 14 });
    ents.push({ type: 'snake', x: 45, y: 11 });
    ents.push({ type: 'stalactite', x: 55, y: 1 });
    ringRow(ents, 4, 12, 14);
    ringRow(ents, 18, 24, 10);
    ringRow(ents, 42, 50, 11);
    ringRow(ents, 52, 64, 14);
    ringRow(ents, 70, 76, 8);
    ents.push({ type: 'gem', x: 21, y: 10 });
    ents.push({ type: 'gem', x: 46, y: 11 });
    ents.push({ type: 'gem', x: 60, y: 14 });
    ents.push({ type: 'gem', x: 73, y: 8 });
    ents.push({ type: 'energy', x: 38, y: 14 });
    ents.push({ type: 'redGem', x: 65, y: 13, index: 0 });
    ents.push({ type: 'checkpoint', x: 24, y: 14 });
    ents.push({ type: 'checkpoint', x: 40, y: 14 });
    ents.push({ type: 'checkpoint', x: 66, y: 14 });

    return {
      id: '3-4', name: 'The Crystal Maze', world: 3,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 78, y: 14 },
      requiredRings: 36, parTime: 170,
      tiles: t, entities: ents,
    };
  }

  // 3-5: Core Meltdown — lava + ice combined
  function level_3_5() {
    const w = 80, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 78, 15);
    // lava pools alternating with ice paths
    rect(t, 8, 13, 12, 15, 10);
    floor(t, 13, 22, 15, 11);
    rect(t, 23, 13, 28, 15, 10);
    floor(t, 29, 38, 15, 11);
    rect(t, 39, 13, 44, 15, 10);
    floor(t, 45, 58, 15, 11);
    rect(t, 59, 13, 64, 15, 10);
    floor(t, 65, 78, 15, 11);
    // grapple route across center
    platform(t, 10, 14, 10);
    platform(t, 26, 30, 9);
    platform(t, 42, 46, 9);
    platform(t, 60, 64, 9);

    const ents = [];
    ents.push({ type: 'grapplePoint', x: 18, y: 4 });
    ents.push({ type: 'grapplePoint', x: 34, y: 4 });
    ents.push({ type: 'grapplePoint', x: 50, y: 4 });
    ents.push({ type: 'grapplePoint', x: 66, y: 4 });
    ents.push({ type: 'stalactite', x: 20, y: 1 });
    ents.push({ type: 'stalactite', x: 36, y: 1 });
    ents.push({ type: 'stalactite', x: 52, y: 1 });
    ringRow(ents, 4, 7, 14);
    ringRow(ents, 13, 22, 14);
    ringRow(ents, 29, 38, 14);
    ringRow(ents, 45, 58, 14);
    ringRow(ents, 65, 76, 14);
    ringRow(ents, 10, 14, 9);
    ringRow(ents, 26, 30, 8);
    ringRow(ents, 42, 46, 8);
    ringRow(ents, 60, 64, 8);
    ents.push({ type: 'energy', x: 30, y: 14 });
    ents.push({ type: 'energy', x: 50, y: 14 });
    ents.push({ type: 'redGem', x: 78, y: 4, index: 0 });
    ents.push({ type: 'checkpoint', x: 22, y: 14 });
    ents.push({ type: 'checkpoint', x: 44, y: 14 });
    ents.push({ type: 'checkpoint', x: 66, y: 14 });

    return {
      id: '3-5', name: 'Core Meltdown', world: 3,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 78, y: 14 },
      requiredRings: 48, parTime: 180,
      tiles: t, entities: ents,
    };
  }

  // 3-B: The Seal — final challenge, all mechanics
  function level_3_B() {
    const w = 100, h = 17;
    const t = blank(w, h);
    frame(t, w, h);
    floor(t, 1, 98, 15);
    // section 1: warm-up + cracked
    rect(t, 12, 11, 12, 14, 14);
    spikes(t, 18, 19, 14);
    // section 2: water + inflate
    rect(t, 24, 13, 34, 15, 9);
    // section 3: snakes + conveyors
    for (let x = 38; x <= 46; x++) t[15][x] = 13;
    // section 4: boulder + plate
    rect(t, 50, 11, 50, 14, 1); set(t, 50, 13, 17); set(t, 50, 14, 17);
    platform(t, 54, 58, 11);
    // section 5: grapple over lava
    rect(t, 64, 13, 76, 15, 10);
    platform(t, 80, 84, 12);
    // section 6: final climb
    platform(t, 86, 92, 10);
    rect(t, 94, 8, 94, 14, 14);
    platform(t, 95, 98, 6);

    const ents = [];
    ents.push({ type: 'inflatePad', x: 22, y: 14 });
    ents.push({ type: 'deflatePad', x: 36, y: 14 });
    ents.push({ type: 'snake', x: 40, y: 14 });
    ents.push({ type: 'boulder', x: 56, y: 10 });
    ents.push({ type: 'pressurePlate', x: 48, y: 14 });
    ents.push({ type: 'grapplePoint', x: 68, y: 6 });
    ents.push({ type: 'grapplePoint', x: 74, y: 6 });
    ents.push({ type: 'stalactite', x: 82, y: 1 });
    ents.push({ type: 'stalactite', x: 88, y: 1 });
    ringRow(ents, 4, 11, 14);
    ringRow(ents, 13, 22, 14);
    ringRow(ents, 24, 34, 12);
    ringRow(ents, 38, 46, 13);
    ringRow(ents, 51, 62, 14);
    ringRow(ents, 65, 75, 10);
    ringRow(ents, 80, 84, 11);
    ringRow(ents, 86, 92, 9);
    ringRow(ents, 95, 98, 5);
    ents.push({ type: 'energy', x: 38, y: 14 });
    ents.push({ type: 'energy', x: 62, y: 14 });
    ents.push({ type: 'energy', x: 85, y: 14 });
    ents.push({ type: 'gem', x: 30, y: 11 });
    ents.push({ type: 'gem', x: 58, y: 10 });
    ents.push({ type: 'gem', x: 72, y: 8 });
    ents.push({ type: 'gem', x: 96, y: 5 });
    ents.push({ type: 'redGem', x: 98, y: 14, index: 0 });
    ents.push({ type: 'checkpoint', x: 22, y: 14 });
    ents.push({ type: 'checkpoint', x: 47, y: 14 });
    ents.push({ type: 'checkpoint', x: 62, y: 14 });
    ents.push({ type: 'checkpoint', x: 78, y: 14 });
    ents.push({ type: 'checkpoint', x: 93, y: 14 });

    return {
      id: '3-B', name: 'The Seal', world: 3,
      width: w, height: h, tileSize: 32,
      spawnPoint: { x: 2, y: 14 },
      exitPoint: { x: 98, y: 5 },
      requiredRings: 70, parTime: 240,
      tiles: t, entities: ents,
    };
  }

  const LEVELS = {
    '1-1': level_1_1, '1-2': level_1_2, '1-3': level_1_3, '1-4': level_1_4, '1-5': level_1_5, '1-B': level_1_B,
    '2-1': level_2_1, '2-2': level_2_2, '2-3': level_2_3, '2-4': level_2_4, '2-5': level_2_5, '2-B': level_2_B,
    '3-1': level_3_1, '3-2': level_3_2, '3-3': level_3_3, '3-4': level_3_4, '3-5': level_3_5, '3-B': level_3_B,
  };

  function get(id) {
    const fn = LEVELS[id];
    return fn ? fn() : null;
  }

  return { get };
})();
