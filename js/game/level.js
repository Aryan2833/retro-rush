// Level: tile grid + entities + per-frame update/render.
class Level {
  constructor(data, world) {
    this.id = data.id;
    this.name = data.name;
    this.world = world || data.world || 1;
    this.width = data.width;
    this.height = data.height;
    this.tileSize = data.tileSize || 32;
    this.spawn = data.spawnPoint || { x: 2, y: 14 };
    this.exitPoint = data.exitPoint || { x: this.width - 3, y: this.height - 3 };
    this.requiredRings = data.requiredRings || 0;
    this.parTime = data.parTime || 90;
    this.tiles = data.tiles.map(row => row.slice());
    this.entityDefs = data.entities || [];
    this.totalRings = this.entityDefs.filter(e => e.type === 'ring').length;
    this.totalGems  = this.entityDefs.filter(e => e.type === 'gem').length;
    this.totalRedGems = this.entityDefs.filter(e => e.type === 'redGem').length;

    this.entities = [];
    for (const def of this.entityDefs) {
      const e = Entities.spawn(def);
      if (e) this.entities.push(e);
    }
    // Ensure exit entity exists at exitPoint
    if (!this.entities.some(e => e instanceof Entities.Exit)) {
      this.entities.push(Entities.spawn({ type: 'exit', x: this.exitPoint.x, y: this.exitPoint.y - 1 }));
    }

    // Crumble timers (tx,ty -> {state:'shake'|'gone', t})
    this.crumbleState = new Map();

    this.player = null;
    this.frame = 0;
    this.completed = false;
    this.completeCallback = null;
    this.elapsedFrames = 0;
  }

  attachPlayer(player) { this.player = player; }

  tileAt(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return 1; // OOB = solid wall
    return this.tiles[ty][tx];
  }

  setTile(tx, ty, id) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return;
    this.tiles[ty][tx] = id;
  }

  triggerCrumble(tx, ty) {
    const k = tx + ',' + ty;
    if (this.crumbleState.has(k)) return;
    this.crumbleState.set(k, { state: 'shake', t: 30, originalId: this.tiles[ty][tx], tx, ty });
  }

  updateCrumbles() {
    for (const [k, c] of this.crumbleState.entries()) {
      c.t--;
      if (c.state === 'shake' && c.t <= 0) {
        c.state = 'gone';
        this.tiles[c.ty][c.tx] = 0;
        c.t = 180; // respawn after 3s
        Particles.burst(c.tx * 32 + 16, c.ty * 32 + 16, 8, ['#888', '#444'], { speedMax: 2, life: 20, gravity: 0.2 });
      } else if (c.state === 'gone' && c.t <= 0) {
        // Only respawn if player isn't overlapping
        const box = { x: c.tx * 32, y: c.ty * 32, w: 32, h: 32 };
        if (!this.player || !Collision.aabb(box, this.player)) {
          this.tiles[c.ty][c.tx] = c.originalId;
          this.crumbleState.delete(k);
        }
      }
    }
  }

  update() {
    this.frame++;
    if (!this.completed) this.elapsedFrames++;
    if (this.player) {
      // Update entities BEFORE player so collectibles can react to player pos this frame
      for (const e of this.entities) e.update(this, this.player);
      Tools.handleAction(this.player, this);
      if (this.player.grappling) Tools.updateGrapple(this.player);
      this.player.update(this);
    }
    this.updateCrumbles();
    Particles.update();
  }

  render(ctx) {
    const camX = Camera.getX();
    const camY = Camera.getY();
    Backgrounds.draw(ctx, this.world, camX, camY);
    this.renderTiles(ctx, camX, camY);
    // Entities back: pads, checkpoints, plates, grapple, locked doors
    for (const e of this.entities) {
      if (e instanceof Entities.Pad || e instanceof Entities.Checkpoint ||
          e instanceof Entities.PressurePlate || e instanceof Entities.GrapplePoint ||
          e instanceof Entities.LockedDoor || e instanceof Entities.Exit) {
        e.render(ctx, camX, camY);
      }
    }
    // Entities main: collectibles, boulders, enemies, stalactites
    for (const e of this.entities) {
      if (e instanceof Entities.Ring || e instanceof Entities.Gem ||
          e instanceof Entities.Energy || e instanceof Entities.Key ||
          e instanceof Entities.Boulder || e instanceof Entities.Spider ||
          e instanceof Entities.Snake || e instanceof Entities.Stalactite) {
        e.render(ctx, camX, camY);
      }
    }
    // Player
    if (this.player) this.player.render(ctx, camX, camY);
    // Grapple line on top of player
    if (this.player) Tools.renderGrapple(ctx, this.player, camX, camY);
    Particles.render(ctx, camX, camY);
  }

  renderTiles(ctx, camX, camY) {
    const ts = this.tileSize;
    const x0 = Math.max(0, Math.floor(camX / ts) - 1);
    const y0 = Math.max(0, Math.floor(camY / ts) - 1);
    const x1 = Math.min(this.width - 1, Math.floor((camX + Camera.VIEW_W) / ts) + 1);
    const y1 = Math.min(this.height - 1, Math.floor((camY + Camera.VIEW_H) / ts) + 1);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        let id = this.tiles[ty][tx];
        if (id === 0) continue;
        // Render with shake offset if crumbling
        const c = this.crumbleState.get(tx + ',' + ty);
        if (c && c.state === 'shake') {
          ctx.save();
          ctx.translate((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
        }
        // Translate tile coords to draw position (Tiles.draw expects tx,ty in tile units,
        // but we want it to render at camera-relative pixel position. The simplest
        // approach: call draw at tx,ty then offset everything via canvas translate.)
        ctx.save();
        ctx.translate(-camX, -camY);
        Tiles.draw(ctx, id, tx, ty, this.world, this.frame);
        ctx.restore();
        if (c && c.state === 'shake') ctx.restore();
      }
    }
  }

  complete() {
    if (this.completed) return;
    this.completed = true;
    Audio2.play('complete');
    if (this.completeCallback) this.completeCallback();
  }

  onComplete(cb) { this.completeCallback = cb; }

  stats() {
    const elapsedSec = this.elapsedFrames / 60;
    const allRings = this.player.rings >= this.totalRings;
    const allGems = this.player.gems >= this.totalGems;
    const underPar = elapsedSec <= this.parTime;
    let stars = 1; // completed
    if (allRings) stars++;
    if (allGems && underPar) stars++;
    return {
      time: elapsedSec,
      rings: this.player.rings,
      totalRings: this.totalRings,
      gems: this.player.gems,
      totalGems: this.totalGems,
      redGemsFound: this.player.redGems.slice(),
      stars,
    };
  }
}
