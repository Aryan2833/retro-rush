// Keyboard input — tracks pressed/just-pressed states for the frame.
const Input = (() => {
  const keys = {};      // currently held
  const pressed = {};   // pressed this frame (cleared after consume)
  const released = {};  // released this frame

  // Logical actions map to multiple physical keys
  const ACTIONS = {
    left:    ['ArrowLeft', 'KeyA'],
    right:   ['ArrowRight', 'KeyD'],
    up:      ['ArrowUp', 'KeyW'],
    down:    ['ArrowDown', 'KeyS'],
    jump:    ['Space', 'ArrowUp', 'KeyW'],
    action:  ['KeyE'],
    respawn: ['KeyR'],
    pause:   ['Escape'],
    confirm: ['Enter', 'Space'],
  };

  const PREVENT = new Set([
    'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
  ]);

  function init() {
    window.addEventListener('keydown', (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      if (!keys[e.code]) pressed[e.code] = true;
      keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      keys[e.code] = false;
      released[e.code] = true;
    });
    window.addEventListener('blur', () => {
      // Clear all keys if window loses focus
      for (const k in keys) keys[k] = false;
    });
  }

  function isDown(action) {
    const codes = ACTIONS[action];
    if (!codes) return !!keys[action];
    return codes.some(c => keys[c]);
  }

  function wasPressed(action) {
    const codes = ACTIONS[action];
    if (!codes) return !!pressed[action];
    return codes.some(c => pressed[c]);
  }

  function wasReleased(action) {
    const codes = ACTIONS[action];
    if (!codes) return !!released[action];
    return codes.some(c => released[c]);
  }

  function endFrame() {
    for (const k in pressed) pressed[k] = false;
    for (const k in released) released[k] = false;
  }

  return { init, isDown, wasPressed, wasReleased, endFrame };
})();
