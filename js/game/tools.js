// Hammer + Grapple hook logic — used by the player when Action key is pressed.
const Tools = (() => {

  // Hammer: break a cracked tile if facing one within 1 tile.
  function useHammer(player, level) {
    if (!player.tools.includes('hammer')) return false;
    const ts = level.tileSize;
    // Tile in front of player at chest height
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    const front = cx + player.facing * (player.w / 2 + 4);
    const tx = Math.floor(front / ts);
    const ty = Math.floor(cy / ts);
    if (level.tileAt(tx, ty) === 14) {
      level.setTile(tx, ty, 0);
      Audio2.play('hammer');
      Camera.shake(2, 8);
      Particles.burst(tx * ts + 16, ty * ts + 16, 14,
        ['#c4b396', '#8c7a5e', '#3a2818'],
        { speedMax: 3.5, life: 28, gravity: 0.2 });
      return true;
    }
    return false;
  }

  // Grapple hook: find a GrapplePoint within range, fire and pull player there.
  function useGrapple(player, level) {
    if (!player.tools.includes('grapple')) return false;
    if (player.grappling) return false;
    const range = Physics.GRAPPLE_MAX_TILES * level.tileSize;
    const pcx = player.x + player.w / 2;
    const pcy = player.y + player.h / 2;
    let best = null, bestDist = range * range;
    for (const e of level.entities) {
      if (!(e instanceof Entities.GrapplePoint)) continue;
      const ecx = e.x + 16, ecy = e.y + 16;
      if (ecy > pcy + 8) continue; // grapple to ceiling/upward points only
      const dx = ecx - pcx, dy = ecy - pcy;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) { bestDist = d2; best = e; }
    }
    if (!best) return false;
    Audio2.play('grapple');
    player.grappling = { targetX: best.x + 16, targetY: best.y + 16, t: 0 };
    Camera.shake(1, 6);
    return true;
  }

  // Per-frame grapple update — pulls player toward target then releases with upward velocity.
  function updateGrapple(player) {
    if (!player.grappling) return;
    player.grappling.t++;
    const g = player.grappling;
    const pcx = player.x + player.w / 2;
    const pcy = player.y + player.h / 2;
    const dx = g.targetX - pcx;
    const dy = g.targetY - pcy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 6 || g.t > 30) {
      // release
      player.vy = -8;
      player.vx = dx > 0 ? 3 : -3;
      player.grappling = null;
      Particles.burst(g.targetX, g.targetY, 8, ['#00e5ff', '#fff'], { speedMax: 2, life: 20 });
      return;
    }
    const pull = 1.8;
    player.vx = (dx / dist) * pull * 4;
    player.vy = (dy / dist) * pull * 4;
    player.x += player.vx;
    player.y += player.vy;
  }

  function renderGrapple(ctx, player, camX, camY) {
    if (!player.grappling) return;
    const g = player.grappling;
    const px = player.x + player.w / 2 - camX;
    const py = player.y + player.h / 2 - camY;
    const tx = g.targetX - camX;
    const ty = g.targetY - camY;
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    // tip
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2); ctx.fill();
  }

  function handleAction(player, level) {
    if (!Input.wasPressed('action')) return;
    // Prefer grapple if a target is in range; else try hammer
    if (player.tools.includes('grapple') && useGrapple(player, level)) return;
    if (player.tools.includes('hammer')) useHammer(player, level);
  }

  return { handleAction, updateGrapple, renderGrapple, useHammer, useGrapple };
})();
