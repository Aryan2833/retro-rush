// All non-player entities. Each implements update(level, player) and render(ctx, camX, camY).
const Entities = (() => {

  // ---------- Ring ----------
  class Ring {
    constructor(x, y) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.collected = false; this.frame = 0; }
    update(level, player) {
      if (this.collected) return;
      this.frame++;
      if (Collision.aabb(this, player)) {
        this.collected = true;
        player.rings++;
        Audio2.play('ring');
        Particles.burst(this.x + 16, this.y + 16, 10, ['#ffd24a', '#ffeb99', '#fff'], { speedMax: 3, life: 25, gravity: 0 });
      }
    }
    render(ctx, cx, cy) {
      if (this.collected) return;
      Sprites.drawRing(ctx, this.x - cx, this.y - cy, Math.floor(this.frame / 4));
    }
  }

  // ---------- Gem ----------
  class Gem {
    constructor(x, y, redIndex) {
      this.x = x; this.y = y; this.w = 24; this.h = 24;
      this.collected = false; this.frame = 0;
      this.red = redIndex !== undefined;
      this.redIndex = redIndex;
    }
    update(level, player) {
      if (this.collected) return;
      this.frame++;
      const hit = { x: this.x + 4, y: this.y + 4, w: 24, h: 24 };
      if (Collision.aabb(hit, player)) {
        this.collected = true;
        if (this.red) {
          if (this.redIndex !== undefined) player.redGems[this.redIndex] = true;
        } else {
          player.gems++;
        }
        Audio2.play('gem');
        const col = this.red ? ['#ff5555', '#ff9999', '#fff'] : ['#a64ad9', '#d27cff', '#fff'];
        Particles.burst(this.x + 16, this.y + 16, 10, col, { speedMax: 3, life: 25 });
      }
    }
    render(ctx, cx, cy) {
      if (this.collected) return;
      Sprites.drawGem(
        ctx, this.x - cx, this.y - cy,
        this.red ? PALETTES.shared.gemRed : PALETTES.shared.gemPurple,
        this.frame
      );
    }
  }

  // ---------- Energy orb ----------
  class Energy {
    constructor(x, y) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.collected = false; this.frame = 0; }
    update(level, player) {
      if (this.collected) return;
      this.frame++;
      if (Collision.aabb(this, player) && player.hp < player.maxHp) {
        this.collected = true;
        player.hp = Math.min(player.maxHp, player.hp + 1);
        Audio2.play('ring');
        Particles.burst(this.x + 16, this.y + 16, 8, ['#4ade80', '#fff'], { speedMax: 2.5, life: 25 });
      }
    }
    render(ctx, cx, cy) {
      if (this.collected) return;
      Sprites.drawEnergy(ctx, this.x - cx, this.y - cy, this.frame);
    }
  }

  // ---------- Key ----------
  class Key {
    constructor(x, y, type) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.collected = false; this.type = type || 'silver'; this.frame = 0; }
    update(level, player) {
      if (this.collected) return;
      this.frame++;
      if (Collision.aabb(this, player)) {
        this.collected = true;
        player.keys[this.type] = (player.keys[this.type] || 0) + 1;
        Audio2.play('ring');
        Particles.burst(this.x + 16, this.y + 16, 8, ['#fff', '#ddd'], { speedMax: 2.5, life: 25 });
      }
    }
    render(ctx, cx, cy) {
      if (this.collected) return;
      const c = this.type === 'gold' ? PALETTES.shared.keyGold : PALETTES.shared.keySilver;
      Sprites.drawKey(ctx, this.x - cx, this.y - cy, c, this.frame);
    }
  }

  // ---------- Checkpoint ----------
  class Checkpoint {
    constructor(x, y) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.active = false; this.frame = 0; }
    update(level, player) {
      this.frame++;
      if (!this.active && Collision.aabb({ x: this.x + 8, y: this.y, w: 16, h: 32 }, player)) {
        this.active = true;
        // deactivate other checkpoints
        for (const e of level.entities) if (e instanceof Checkpoint && e !== this) e.active = false;
        player.setCheckpoint(this.x, this.y);
        Audio2.play('checkpoint');
        Particles.burst(this.x + 16, this.y + 8, 14, ['#4ade80', '#fff'], { speedMax: 3, life: 30 });
      }
    }
    render(ctx, cx, cy) {
      Sprites.drawCheckpoint(ctx, this.x - cx, this.y - cy, this.active, this.frame);
    }
  }

  // ---------- Inflate / Deflate pad ----------
  class Pad {
    constructor(x, y, kind) {
      this.x = x; this.y = y; this.w = 32; this.h = 32;
      this.kind = kind; // 'inflate' | 'deflate' | 'normal'
      this.frame = 0;
      this.cooldown = 0;
    }
    update(level, player) {
      this.frame++;
      if (this.cooldown > 0) this.cooldown--;
      if (this.cooldown === 0 && Collision.aabb({ x: this.x, y: this.y, w: 32, h: 32 }, player)) {
        let target = 'normal';
        if (this.kind === 'inflate') target = 'inflated';
        else if (this.kind === 'deflate') target = 'deflated';
        if (player.state !== target) {
          player.setState(target);
          Particles.burst(this.x + 16, this.y + 16, 12, ['#fff', '#aaccff'], { speedMax: 3, life: 25 });
        }
        this.cooldown = 30;
      }
    }
    render(ctx, cx, cy) {
      Sprites.drawPad(ctx, this.x - cx, this.y - cy, this.kind, this.frame);
    }
  }

  // ---------- Spider (patrols) ----------
  class Spider {
    constructor(x, y, patrolRange) {
      this.x = x; this.y = y; this.w = 32; this.h = 32;
      this.startX = x;
      this.patrol = (patrolRange || 3) * 32;
      this.dir = 1;
      this.vx = 0.8;
      this.frame = 0;
    }
    update(level, player) {
      this.frame++;
      this.x += this.vx * this.dir;
      if (this.x > this.startX + this.patrol) { this.x = this.startX + this.patrol; this.dir = -1; }
      if (this.x < this.startX) { this.x = this.startX; this.dir = 1; }
      // Damage on contact
      if (Collision.aabb({ x: this.x + 4, y: this.y + 14, w: 24, h: 18 }, player)) {
        player.takeDamage(1, this.x + 16);
      }
    }
    render(ctx, cx, cy) {
      Sprites.drawSpider(ctx, this.x - cx, this.y - cy, this.frame, this.dir);
    }
  }

  // ---------- Snake (stationary, strikes when player near) ----------
  class Snake {
    constructor(x, y) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.frame = 0; this.striking = 0; this.strikeCooldown = 0; this.dir = 1; }
    update(level, player) {
      this.frame++;
      if (this.strikeCooldown > 0) this.strikeCooldown--;
      const dx = (player.x + player.w / 2) - (this.x + 16);
      const dy = (player.y + player.h / 2) - (this.y + 16);
      const horizClose = Math.abs(dx) < 64 && Math.abs(dy) < 32;
      this.dir = dx >= 0 ? 1 : -1;

      if (this.striking > 0) {
        this.striking--;
        const headX = this.x + 16 + this.dir * 8;
        if (Collision.aabb({ x: headX - 8, y: this.y + 8, w: 16, h: 16 }, player)) {
          player.takeDamage(1, headX);
        }
      } else if (horizClose && this.strikeCooldown === 0) {
        this.striking = 30;
        this.strikeCooldown = 60;
      }
    }
    render(ctx, cx, cy) {
      Sprites.drawSnake(ctx, this.x - cx, this.y - cy, this.frame, this.striking > 0, this.dir);
    }
  }

  // ---------- Boulder (gravity, pushable, crushing) ----------
  class Boulder {
    constructor(x, y) { this.x = x; this.y = y; this.w = 30; this.h = 30; this.vx = 0; this.vy = 0; this.grounded = false; }
    update(level, player) {
      // Gravity
      if (!this.grounded) this.vy += Physics.GRAVITY;
      if (this.vy > 10) this.vy = 10;

      // Horizontal push from player
      const padding = 2;
      const sideTouch = Collision.aabb(
        { x: this.x - padding, y: this.y, w: this.w + padding * 2, h: this.h },
        player
      );
      if (sideTouch && player.state !== 'deflated' && player.grounded) {
        const pCx = player.x + player.w / 2;
        const bCx = this.x + this.w / 2;
        // Player must be pushing toward boulder
        if (Input.isDown('right') && pCx < bCx && Math.abs(player.vx) > 0.5) this.vx = 0.8;
        else if (Input.isDown('left') && pCx > bCx && Math.abs(player.vx) > 0.5) this.vx = -0.8;
      } else {
        this.vx *= 0.7;
      }

      // Move X with tile collision
      this.x += this.vx;
      this.resolveX(level, player);

      // Move Y with tile collision
      this.grounded = false;
      this.y += this.vy;
      this.resolveY(level);

      // Crush check
      if (this.vy > 5 && Collision.aabb(this, player)) {
        // dropping on player
        if (player.y + player.h / 2 > this.y + this.h / 2) {
          // player below
          player.takeDamage(1, this.x + this.w / 2);
        }
      }
    }
    resolveX(level, player) {
      const hits = Collision.tilesOverlapping(this, level);
      for (const t of hits) {
        if (Collision.isSolid(t.id)) {
          if (this.vx > 0) this.x = t.rect.x - this.w;
          else if (this.vx < 0) this.x = t.rect.x + t.rect.w;
          this.vx = 0;
        }
      }
      // Don't overlap player horizontally — push them too
      if (Collision.aabb(this, player) && player.grounded) {
        if (this.vx > 0) player.x += 1;
        else if (this.vx < 0) player.x -= 1;
      }
    }
    resolveY(level) {
      const hits = Collision.tilesOverlapping(this, level);
      for (const t of hits) {
        if (Collision.isSolid(t.id) || Collision.isOneWay(t.id) || Collision.isCrumble(t.id) || Collision.isIce(t.id)) {
          if (this.vy > 0) {
            this.y = t.rect.y - this.h;
            if (this.vy > 4) { Audio2.play('boulder'); Camera.shake(2, 8); }
            this.grounded = true;
          } else if (this.vy < 0) {
            this.y = t.rect.y + t.rect.h;
          }
          this.vy = 0;
        }
      }
    }
    render(ctx, cx, cy) {
      Sprites.drawBoulder(ctx, this.x - cx - 1, this.y - cy - 1);
    }
  }

  // ---------- Locked door ----------
  class LockedDoor {
    constructor(x, y, keyType) {
      this.x = x; this.y = y; this.w = 32; this.h = 64;
      this.keyType = keyType || 'silver';
      this.open = false;
      this.openT = 0;
    }
    isSolid() { return !this.open; }
    update(level, player) {
      if (this.open) { this.openT = Math.min(this.openT + 1, 30); return; }
      if (Collision.aabb(this, player) && (player.keys[this.keyType] || 0) > 0) {
        player.keys[this.keyType]--;
        this.open = true;
        Audio2.play('door');
        Particles.burst(this.x + 16, this.y + 32, 10, ['#fff', '#ddd'], { speedMax: 2, life: 20 });
      }
      // Solid collision against player from sides
      if (this.isSolid() && Collision.aabb(this, player)) {
        const pCx = player.x + player.w / 2;
        const dCx = this.x + 16;
        if (pCx < dCx) player.x = this.x - player.w;
        else player.x = this.x + this.w;
      }
    }
    render(ctx, cx, cy) {
      if (this.open) return;
      const c = this.keyType === 'gold' ? PALETTES.shared.keyGold : PALETTES.shared.keySilver;
      Sprites.drawLockedDoor(ctx, this.x - cx, this.y - cy, c);
    }
  }

  // ---------- Exit gate ----------
  class Exit {
    constructor(x, y) { this.x = x; this.y = y; this.w = 32; this.h = 64; this.frame = 0; this.triggered = false; this.unlocked = false; }
    update(level, player) {
      this.frame++;
      this.unlocked = player.rings >= level.requiredRings;
      if (this.unlocked && !this.triggered && Collision.aabb(this, player)) {
        this.triggered = true;
        level.complete();
      }
    }
    render(ctx, cx, cy) {
      Sprites.drawExit(ctx, this.x - cx, this.y - cy, this.unlocked, this.frame);
    }
  }

  // ---------- Grapple point ----------
  class GrapplePoint {
    constructor(x, y) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.frame = 0; }
    update() { this.frame++; }
    render(ctx, cx, cy) {
      Sprites.drawGrapplePoint(ctx, this.x - cx, this.y - cy, this.frame);
    }
  }

  // ---------- Pressure plate ----------
  class PressurePlate {
    constructor(x, y, doorId) {
      this.x = x; this.y = y; this.w = 32; this.h = 32;
      this.doorId = doorId; this.pressed = false;
    }
    update(level, player) {
      const box = { x: this.x, y: this.y + 16, w: 32, h: 16 };
      let pressed = false;
      if (Collision.aabb(box, player)) pressed = true;
      for (const e of level.entities) {
        if (e instanceof Boulder && Collision.aabb(box, e)) { pressed = true; break; }
      }
      if (pressed !== this.pressed) {
        this.pressed = pressed;
        if (pressed) Audio2.play('select');
      }
    }
    render(ctx, cx, cy) {
      Sprites.drawPressurePlate(ctx, this.x - cx, this.y - cy, this.pressed);
    }
  }

  // ---------- Stalactite (falls when player passes beneath) ----------
  class Stalactite {
    constructor(x, y) {
      this.x = x; this.y = y; this.w = 32; this.h = 30;
      this.originY = y;
      this.falling = false;
      this.shaking = 0;
      this.vy = 0;
      this.broken = false;
    }
    update(level, player) {
      if (this.broken) return;
      if (!this.falling && this.shaking === 0) {
        const beneath = (player.x + player.w / 2 > this.x) && (player.x + player.w / 2 < this.x + 32)
                     && (player.y > this.y);
        if (beneath) {
          this.shaking = 30;
          Particles.burst(this.x + 16, this.y + 30, 4, ['#aaa'], { speedMax: 1, life: 15, gravity: 0.1 });
        }
      } else if (this.shaking > 0) {
        this.shaking--;
        if (this.shaking === 0) this.falling = true;
      }
      if (this.falling) {
        this.vy += Physics.GRAVITY;
        this.y += this.vy;
        // Collision with player
        if (Collision.aabb({ x: this.x + 4, y: this.y, w: 24, h: this.h }, player)) {
          player.takeDamage(1, this.x + 16);
          this.broken = true;
          Camera.shake(3, 10);
          Particles.burst(this.x + 16, this.y + 16, 12, ['#aaa', '#7a6a55'], { speedMax: 3, life: 25 });
          return;
        }
        // Collision with ground
        const hits = Collision.tilesOverlapping({ x: this.x + 4, y: this.y + this.h - 4, w: 24, h: 4 }, level);
        if (hits.some(t => Collision.isSolid(t.id))) {
          this.broken = true;
          Camera.shake(3, 10);
          Audio2.play('boulder');
          Particles.burst(this.x + 16, this.y + this.h, 12, ['#aaa', '#7a6a55'], { speedMax: 3, life: 25 });
        }
      }
    }
    render(ctx, cx, cy) {
      if (this.broken) return;
      Sprites.drawStalactite(ctx, this.x - cx, this.y - cy, this.falling, this.shaking > 0 ? 1.5 : 0);
    }
  }

  function spawn(def) {
    switch (def.type) {
      case 'ring':         return new Ring(def.x * 32, def.y * 32);
      case 'gem':          return new Gem(def.x * 32, def.y * 32);
      case 'redGem':       return new Gem(def.x * 32, def.y * 32, def.index || 0);
      case 'energy':       return new Energy(def.x * 32, def.y * 32);
      case 'key':          return new Key(def.x * 32, def.y * 32, def.keyType);
      case 'checkpoint':   return new Checkpoint(def.x * 32, def.y * 32);
      case 'inflatePad':   return new Pad(def.x * 32, def.y * 32, 'inflate');
      case 'deflatePad':   return new Pad(def.x * 32, def.y * 32, 'deflate');
      case 'normalPad':    return new Pad(def.x * 32, def.y * 32, 'normal');
      case 'spider':       return new Spider(def.x * 32, def.y * 32, def.patrolRange);
      case 'snake':        return new Snake(def.x * 32, def.y * 32);
      case 'boulder':      return new Boulder(def.x * 32, def.y * 32);
      case 'lockedDoor':   return new LockedDoor(def.x * 32, def.y * 32, def.keyType);
      case 'exit':         return new Exit(def.x * 32, def.y * 32);
      case 'grapplePoint': return new GrapplePoint(def.x * 32, def.y * 32);
      case 'pressurePlate':return new PressurePlate(def.x * 32, def.y * 32, def.doorId);
      case 'stalactite':   return new Stalactite(def.x * 32, def.y * 32);
    }
    return null;
  }

  return {
    spawn,
    Ring, Gem, Energy, Key, Checkpoint, Pad,
    Spider, Snake, Boulder, LockedDoor, Exit,
    GrapplePoint, PressurePlate, Stalactite,
  };
})();
