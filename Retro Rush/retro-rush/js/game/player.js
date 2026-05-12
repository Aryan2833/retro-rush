// Player entity — movement, physics, states, animation.
class Player {
  constructor(spawnX, spawnY) {
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.x = spawnX;
    this.y = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;       // -1 left, 1 right
    this.state = 'normal'; // normal | inflated | deflated
    this.size = this.sizeFor('normal');
    this.w = this.size; this.h = this.size;
    this.grounded = false;
    this.inWater = false;
    this.onIce = false;
    this.onConveyor = 0;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.jumping = false;        // currently in initial-jump phase
    this.hp = 3;
    this.maxHp = 3;
    this.invuln = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.targetScaleX = 1;
    this.targetScaleY = 1;
    this.transitionT = 0;        // state transition animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.checkpoint = { x: spawnX, y: spawnY };
    this.rings = 0;
    this.gems = 0;
    this.redGems = [];           // booleans per level config
    this.keys = { silver: 0, gold: 0 };
    this.tools = [];             // unlocked tool names
    // grapple state
    this.grappling = null;       // {targetX, targetY, t}
  }

  sizeFor(state) {
    if (state === 'inflated') return 44;
    if (state === 'deflated') return 16;
    return 28;
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    const newSize = this.sizeFor(newState);
    // keep feet planted: anchor bottom-center
    const cx = this.x + this.w / 2;
    const bottom = this.y + this.h;
    this.w = newSize; this.h = newSize;
    this.size = newSize;
    this.x = cx - this.w / 2;
    this.y = bottom - this.h;
    this.transitionT = 12;
    Audio2.play(newState === 'inflated' ? 'inflate' : newState === 'deflated' ? 'deflate' : 'pad');
  }

  update(level) {
    if (this.dead) {
      this.deathTimer++;
      return;
    }

    // ---------- Input ----------
    const left = Input.isDown('left');
    const right = Input.isDown('right');
    const down = Input.isDown('down');
    const jumpHeld = Input.isDown('jump');
    const jumpPressed = Input.wasPressed('jump');
    const jumpReleased = Input.wasReleased('jump');

    if (Input.wasPressed('respawn')) {
      this.respawnAtCheckpoint();
      return;
    }

    // ---------- Environment probes ----------
    const probeBox = { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 };
    const overlaps = Collision.tilesOverlapping(probeBox, level);
    this.inWater = overlaps.some(t => Collision.isWater(t.id));

    // ---------- Horizontal acceleration ----------
    const speedMult = this.state === 'deflated' ? Physics.DEFLATE_SPEED_MULT : 1;
    const maxSpeed = Physics.WALK_SPEED * speedMult * (this.inWater ? 0.7 : 1);

    if (left && !right) {
      this.vx -= Physics.WALK_ACCEL;
      if (this.vx < -maxSpeed) this.vx = -maxSpeed;
      this.facing = -1;
    } else if (right && !left) {
      this.vx += Physics.WALK_ACCEL;
      if (this.vx > maxSpeed) this.vx = maxSpeed;
      this.facing = 1;
    } else {
      // friction
      const friction = this.onIce ? Physics.ICE_FRICTION : (1 - Physics.WALK_DECEL / Physics.WALK_SPEED);
      this.vx *= this.onIce ? Physics.ICE_FRICTION : 0.78;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // Water drag
    if (this.inWater) this.vx *= Physics.WATER_DRAG;

    // ---------- Coyote + jump buffer ----------
    if (this.grounded) this.coyote = Physics.COYOTE_FRAMES;
    else if (this.coyote > 0) this.coyote--;

    if (jumpPressed) this.jumpBuffer = Physics.JUMP_BUFFER_FRAMES;
    else if (this.jumpBuffer > 0) this.jumpBuffer--;

    // ---------- Jump ----------
    const canJump = this.coyote > 0 && this.jumpBuffer > 0;
    if (canJump) {
      let force = Physics.JUMP_FORCE;
      if (this.state === 'inflated') force *= Physics.INFLATE_JUMP_MULT;
      if (this.state === 'deflated') force *= Physics.DEFLATE_JUMP_MULT;
      if (this.inWater) force *= 0.7;
      this.vy = force;
      this.jumping = true;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.grounded = false;
      this.targetScaleX = 0.8;
      this.targetScaleY = 1.3;
      Audio2.play('jump');
    }

    // Variable jump height — cut velocity when released
    if (jumpReleased && this.vy < 0 && this.jumping) {
      this.vy *= Physics.JUMP_CUT;
      this.jumping = false;
    }

    // ---------- Gravity ----------
    if (this.inWater) {
      // Inflated floats, deflated sinks, normal slowly sinks
      let waterG = Physics.WATER_GRAVITY;
      if (this.state === 'inflated') waterG = -0.1;     // floats up gently
      else if (this.state === 'deflated') waterG = 0.25;
      if (down) waterG += 0.2;
      this.vy += waterG;
      if (this.vy > Physics.WATER_MAX_FALL) this.vy = Physics.WATER_MAX_FALL;
      if (this.vy < -Physics.WATER_MAX_FALL) this.vy = -Physics.WATER_MAX_FALL;
    } else {
      this.vy += Physics.GRAVITY;
      if (down && !this.grounded) this.vy += 0.4;  // fast fall
      if (this.vy > Physics.MAX_FALL_SPEED) this.vy = Physics.MAX_FALL_SPEED;
    }

    // ---------- Conveyor & wind (applied via tile probe) ----------
    let conveyorPush = 0;
    for (const t of overlaps) {
      if (Collision.isConveyorL(t.id)) conveyorPush -= Physics.CONVEYOR_PUSH;
      else if (Collision.isConveyorR(t.id)) conveyorPush += Physics.CONVEYOR_PUSH;
      else if (Collision.isWindUp(t.id)) this.vy += Physics.WIND_FORCE_Y;
      else if (Collision.isWindRight(t.id)) this.vx += Physics.WIND_FORCE_X;
    }

    // ---------- Movement + collision (axis-separated) ----------
    this.grounded = false;
    this.onIce = false;
    this.onConveyor = 0;

    // X axis
    const oldX = this.x;
    this.x += this.vx + conveyorPush * 0.5;
    this.resolveX(level);

    // Y axis
    this.y += this.vy;
    this.resolveY(level);

    // Ground re-probe: when sitting on the floor, gravity adds a fractional vy
    // each frame and the AABB drifts 0.5–1px above the tile top, briefly losing
    // `grounded`. Probe 1px below the feet to keep the flag stable.
    if (!this.grounded && this.vy >= 0) {
      const probe = { x: this.x + 2, y: this.y + this.h, w: this.w - 4, h: 1 };
      const ph = Collision.tilesOverlapping(probe, level);
      for (const t of ph) {
        if (Collision.isSolid(t.id) || Collision.isOneWay(t.id) ||
            Collision.isCrumble(t.id) || Collision.isIce(t.id) ||
            Collision.isConveyorL(t.id) || Collision.isConveyorR(t.id)) {
          this.grounded = true;
          if (Collision.isIce(t.id)) this.onIce = true;
          if (Collision.isConveyorL(t.id)) this.onConveyor = -1;
          if (Collision.isConveyorR(t.id)) this.onConveyor = 1;
          break;
        }
      }
    }

    // ---------- Trigger tile effects (spikes, lava, crumble) ----------
    const triggerBox = { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 };
    const triggers = Collision.tilesOverlapping(triggerBox, level);
    for (const t of triggers) {
      if (Collision.isSpike(t.id)) this.takeDamage(1, t.rect.x + 16);
      else if (Collision.isLava(t.id)) this.kill();
    }

    // ---------- Squash & stretch ease toward target ----------
    this.scaleX += (this.targetScaleX - this.scaleX) * 0.25;
    this.scaleY += (this.targetScaleY - this.scaleY) * 0.25;
    this.targetScaleX += (1 - this.targetScaleX) * 0.18;
    this.targetScaleY += (1 - this.targetScaleY) * 0.18;

    // ---------- Animation frame ----------
    if (this.grounded && Math.abs(this.vx) > 0.4) {
      this.animTimer++;
      if (this.animTimer >= 4) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 0;
    }

    if (this.transitionT > 0) this.transitionT--;
    if (this.invuln > 0) this.invuln--;

    // Falling out of world
    if (this.y > level.height * level.tileSize + 100) {
      this.kill();
    }
  }

  resolveX(level) {
    const box = { x: this.x, y: this.y, w: this.w, h: this.h };
    const hits = Collision.tilesOverlapping(box, level);
    for (const t of hits) {
      if (Collision.isSolid(t.id)) {
        if (this.vx > 0) {
          this.x = t.rect.x - this.w;
        } else if (this.vx < 0) {
          this.x = t.rect.x + t.rect.w;
        }
        this.vx = 0;
        box.x = this.x;
      }
    }
  }

  resolveY(level) {
    const box = { x: this.x, y: this.y, w: this.w, h: this.h };
    const hits = Collision.tilesOverlapping(box, level);
    for (const t of hits) {
      if (Collision.isSolid(t.id)) {
        if (this.vy > 0) {
          this.y = t.rect.y - this.h;
          this.landed();
        } else if (this.vy < 0) {
          this.y = t.rect.y + t.rect.h;
        }
        this.vy = 0;
        box.y = this.y;
      } else if (Collision.isOneWay(t.id)) {
        // only collide from above when falling and feet were above tile top last frame
        if (this.vy > 0) {
          const feetPrev = this.y + this.h - this.vy;
          if (feetPrev <= t.rect.y + 1) {
            this.y = t.rect.y - this.h;
            this.landed();
            this.vy = 0;
            box.y = this.y;
          }
        }
      } else if (Collision.isCrumble(t.id)) {
        if (this.vy > 0) {
          const feetPrev = this.y + this.h - this.vy;
          if (feetPrev <= t.rect.y + 1) {
            this.y = t.rect.y - this.h;
            this.landed();
            this.vy = 0;
            level.triggerCrumble(t.tx, t.ty);
            box.y = this.y;
          }
        }
      } else if (Collision.isIce(t.id)) {
        if (this.vy > 0) {
          const feetPrev = this.y + this.h - this.vy;
          if (feetPrev <= t.rect.y + 1) {
            this.y = t.rect.y - this.h;
            this.landed();
            this.vy = 0;
            this.onIce = true;
            box.y = this.y;
          }
        }
      } else if (Collision.isConveyorL(t.id) || Collision.isConveyorR(t.id)) {
        if (this.vy > 0) {
          const feetPrev = this.y + this.h - this.vy;
          if (feetPrev <= t.rect.y + 1) {
            this.y = t.rect.y - this.h;
            this.landed();
            this.vy = 0;
            this.onConveyor = Collision.isConveyorL(t.id) ? -1 : 1;
            box.y = this.y;
          }
        }
      }
    }
  }

  landed() {
    if (!this.grounded && this.vy > 4) {
      Audio2.play('land');
      this.targetScaleX = 1.3;
      this.targetScaleY = 0.7;
      Particles.burst(this.x + this.w / 2, this.y + this.h, 6, '#cdb89a', { speedMax: 2, life: 18, gravity: 0.2 });
    }
    this.grounded = true;
    this.jumping = false;
  }

  takeDamage(amount, hazardCenterX) {
    if (this.invuln > 0 || this.dead) return;
    this.hp -= amount;
    this.invuln = Physics.INVULN_FRAMES;
    // knockback away from hazard center
    const dir = (this.x + this.w / 2) < hazardCenterX ? -1 : 1;
    this.vx = Physics.KNOCKBACK_X * dir;
    this.vy = Physics.KNOCKBACK_Y;
    this.grounded = false;
    Audio2.play('damage');
    Camera.shake(4, 12);
    Particles.burst(this.x + this.w / 2, this.y + this.h / 2, 8, ['#ff5555', '#ffaa55'], { speedMax: 3, life: 25 });
    if (this.hp <= 0) this.kill();
  }

  kill() {
    if (this.dead) return;
    this.dead = true;
    this.deathTimer = 0;
    Audio2.play('death');
    Camera.shake(6, 20);
    Particles.burst(this.x + this.w / 2, this.y + this.h / 2, 28, [PALETTES.shared.player, PALETTES.shared.playerLight, '#ffaaaa'], { speedMax: 5, life: 40, gravity: 0.15 });
  }

  respawnAtCheckpoint() {
    this.x = this.checkpoint.x;
    this.y = this.checkpoint.y;
    this.vx = 0; this.vy = 0;
    this.hp = this.maxHp;
    this.dead = false;
    this.invuln = 30;
    this.deathTimer = 0;
    this.setState('normal');
    this.scaleX = 1; this.scaleY = 1;
  }

  setCheckpoint(x, y) {
    this.checkpoint.x = x;
    this.checkpoint.y = y;
  }

  bounce(force) {
    this.vy = force;
    this.grounded = false;
    this.jumping = false;
    this.targetScaleX = 0.7;
    this.targetScaleY = 1.4;
  }

  render(ctx, camX, camY) {
    if (this.dead) {
      // particles only
      return;
    }
    const sx = this.x - camX;
    const sy = this.y - camY;

    // Apply squash/stretch — scale around bottom-center
    ctx.save();
    const cx = sx + this.w / 2;
    const cy = sy + this.h;
    ctx.translate(cx, cy);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-cx, -cy);

    const drawW = this.w;
    const drawH = this.h;
    Sprites.drawPlayer(ctx, sx, sy, drawW, drawH, this.facing, this.state, this.animFrame, this.invuln);

    ctx.restore();

    // Held item indicator (key)
    if (this.keys.silver > 0 || this.keys.gold > 0) {
      const ky = sy - 12;
      if (this.keys.silver > 0) Sprites.drawKey(ctx, sx - 8, ky - 16, PALETTES.shared.keySilver, 0);
      if (this.keys.gold > 0)   Sprites.drawKey(ctx, sx + this.w - 16, ky - 16, PALETTES.shared.keyGold, 0);
    }
  }
}
