// AABB + tile collision utilities.
const Collision = (() => {

  function aabb(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // Returns array of overlapping solid tiles {tx, ty, id, rect}
  // box: { x, y, w, h } in pixels. level: tile grid.
  function tilesOverlapping(box, level) {
    const ts = level.tileSize;
    const x0 = Math.floor(box.x / ts);
    const y0 = Math.floor(box.y / ts);
    const x1 = Math.floor((box.x + box.w - 1) / ts);
    const y1 = Math.floor((box.y + box.h - 1) / ts);
    const hits = [];
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) continue;
        const id = level.tileAt(tx, ty);
        if (id === 0) continue;
        hits.push({ tx, ty, id, rect: { x: tx * ts, y: ty * ts, w: ts, h: ts } });
      }
    }
    return hits;
  }

  // Determine if a tile id is a solid wall/floor
  function isSolid(id) {
    return id === 1 || id === 2 || id === 14; // 14 = cracked wall (solid until hammered)
  }

  function isOneWay(id)   { return id === 3; }
  function isCrumble(id)  { return id === 4; }
  function isSpike(id)    { return id >= 5 && id <= 8; }
  function isWater(id)    { return id === 9; }
  function isLava(id)     { return id === 10; }
  function isIce(id)      { return id === 11; }
  function isConveyorL(id){ return id === 12; }
  function isConveyorR(id){ return id === 13; }
  function isCracked(id)  { return id === 14; }
  function isGrapple(id)  { return id === 15; }
  function isWindUp(id)   { return id === 18; }
  function isWindRight(id){ return id === 19; }

  return {
    aabb, tilesOverlapping,
    isSolid, isOneWay, isCrumble, isSpike, isWater, isLava, isIce,
    isConveyorL, isConveyorR, isCracked, isGrapple, isWindUp, isWindRight,
  };
})();
