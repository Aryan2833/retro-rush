// Physics constants — single source of truth, matches spec §2.2.
const Physics = {
  GRAVITY: 0.6,
  MAX_FALL_SPEED: 12,
  WALK_SPEED: 3.5,
  WALK_ACCEL: 0.4,
  WALK_DECEL: 0.5,
  JUMP_FORCE: -10,
  JUMP_CUT: 0.4,
  BOUNCE_REST: 0.3,
  TRAMPOLINE_FORCE: -14,
  WATER_GRAVITY: 0.15,
  WATER_MAX_FALL: 3,
  WATER_DRAG: 0.85,

  // Tuning beyond the spec's basics
  ICE_FRICTION: 0.96,         // multiplier per frame on ice (vs 1 - WALK_DECEL on normal)
  COYOTE_FRAMES: 6,
  JUMP_BUFFER_FRAMES: 6,
  INFLATE_JUMP_MULT: 0.85,    // inflated state jumps a bit lower
  DEFLATE_JUMP_MULT: 0.75,    // deflated state jumps lower (smaller mass scaled)
  DEFLATE_SPEED_MULT: 1.15,
  KNOCKBACK_X: 4,
  KNOCKBACK_Y: -5,
  INVULN_FRAMES: 60,
  WIND_FORCE_Y: -0.45,
  WIND_FORCE_X: 0.30,
  CONVEYOR_PUSH: 1.5,
  GRAPPLE_MAX_TILES: 5,
};
