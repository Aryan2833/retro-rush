// Web Audio API SFX manager + simple music sequencer.
const Audio2 = (() => {
  let ctx = null;
  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;
  let initialized = false;
  let musicSchedulerHandle = null;
  let currentMusic = null;
  let musicStartTime = 0;

  let sfxVolume = 0.6;
  let musicVolume = 0.4;

  function init() {
    if (initialized) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.85;
      sfxGain = ctx.createGain();
      sfxGain.gain.value = sfxVolume;
      musicGain = ctx.createGain();
      musicGain.gain.value = musicVolume;
      sfxGain.connect(masterGain);
      musicGain.connect(masterGain);
      masterGain.connect(ctx.destination);
      initialized = true;
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  }

  // Browsers require user gesture before audio context can run
  function unlock() {
    if (!initialized) init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function setSfxVolume(v) {
    sfxVolume = Math.max(0, Math.min(1, v));
    if (sfxGain) sfxGain.gain.value = sfxVolume;
  }
  function setMusicVolume(v) {
    musicVolume = Math.max(0, Math.min(1, v));
    if (musicGain) musicGain.gain.value = musicVolume;
  }
  function getSfxVolume() { return sfxVolume; }
  function getMusicVolume() { return musicVolume; }

  // Schedule a tone with envelope
  function tone(freq, duration, type = 'square', startGain = 0.3, when = 0) {
    if (!initialized) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(startGain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.02);
    return { osc, gain: g };
  }

  function sweep(fStart, fEnd, duration, type = 'sine', startGain = 0.3) {
    if (!initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(fStart, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, fEnd), t + duration);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(startGain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  // White-noise burst (for splashes, hits)
  function noise(duration, filterFreq = 1000, startGain = 0.2) {
    if (!initialized) return;
    const t = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(startGain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter); filter.connect(g); g.connect(sfxGain);
    src.start(t);
    src.stop(t + duration + 0.02);
  }

  // Pre-defined SFX
  const SFX = {
    jump:        () => sweep(200, 600, 0.08, 'square', 0.18),
    land:        () => tone(100, 0.05, 'sine', 0.25),
    ring:        () => { sweep(800, 1200, 0.15, 'sine', 0.22); },
    gem:         () => { tone(1000, 0.12, 'sine', 0.18); setTimeout(() => tone(1500, 0.12, 'sine', 0.14), 40); },
    damage:      () => tone(150, 0.2, 'square', 0.3),
    death:       () => sweep(600, 100, 0.5, 'sawtooth', 0.3),
    checkpoint:  () => {
      tone(523, 0.1, 'square', 0.22, 0);
      tone(659, 0.1, 'square', 0.22, 0.1);
      tone(784, 0.18, 'square', 0.22, 0.2);
    },
    complete:    () => {
      const ns = [523, 659, 784, 1046];
      ns.forEach((f, i) => tone(f, 0.18, 'square', 0.22, i * 0.15));
      tone(1046, 0.6, 'square', 0.2, 0.6);
    },
    door:        () => { tone(80, 0.3, 'sine', 0.3); setTimeout(() => tone(400, 0.05, 'square', 0.15), 200); },
    push:        () => tone(100, 0.1, 'sawtooth', 0.1),
    inflate:     () => sweep(200, 800, 0.2, 'sine', 0.22),
    deflate:     () => sweep(800, 200, 0.2, 'sine', 0.22),
    hammer:      () => { tone(200, 0.05, 'square', 0.3); noise(0.1, 2000, 0.15); },
    grapple:     () => sweep(300, 2000, 0.1, 'sawtooth', 0.18),
    splash:      () => noise(0.3, 500, 0.15),
    select:      () => tone(1000, 0.03, 'square', 0.18),
    boulder:     () => { tone(80, 0.1, 'sine', 0.3); noise(0.08, 300, 0.1); },
    pad:         () => tone(440, 0.06, 'triangle', 0.18),
  };

  function play(name) {
    if (!initialized) return;
    const fn = SFX[name];
    if (fn) fn();
  }

  // Music sequencer — plays note arrays at a tempo
  const NOTE_FREQ = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.26, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50,
  };

  function noteFreq(n) {
    if (n === null || n === 'rest') return null;
    return NOTE_FREQ[n] || null;
  }

  function playMusicTrack(track, bpm, loopStartTime) {
    // Track: array of { note, dur } where dur is fraction of a beat (1 = quarter)
    const beatSec = 60 / bpm;
    let t = 0;
    for (const step of track.notes) {
      const dur = step.dur * beatSec;
      const freq = noteFreq(step.note);
      if (freq !== null) {
        const startT = loopStartTime + t;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = track.instrument || 'square';
        osc.frequency.value = freq;
        const peak = (track.volume || 0.2);
        g.gain.setValueAtTime(0, startT);
        g.gain.linearRampToValueAtTime(peak, startT + 0.01);
        g.gain.setValueAtTime(peak, startT + dur * 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, startT + dur * 0.95);
        osc.connect(g);
        g.connect(musicGain);
        osc.start(startT);
        osc.stop(startT + dur);
      }
      t += dur;
    }
    return t; // total duration
  }

  function startMusic(song) {
    stopMusic();
    if (!initialized || !song) return;
    currentMusic = song;
    musicStartTime = ctx.currentTime + 0.05;
    const scheduleLoop = () => {
      if (!currentMusic) return;
      const loopDur = song.tracks.reduce((max, t) => {
        return Math.max(max, t.notes.reduce((a, n) => a + n.dur, 0));
      }, 0) * (60 / song.bpm);
      // Schedule current loop
      for (const tr of song.tracks) playMusicTrack(tr, song.bpm, musicStartTime);
      musicStartTime += loopDur;
      // Re-schedule shortly before loop ends
      const lookAhead = Math.max(50, (loopDur * 1000) - 200);
      musicSchedulerHandle = setTimeout(scheduleLoop, lookAhead);
    };
    scheduleLoop();
  }

  function stopMusic() {
    if (musicSchedulerHandle) clearTimeout(musicSchedulerHandle);
    musicSchedulerHandle = null;
    currentMusic = null;
  }

  return {
    init, unlock, play, startMusic, stopMusic,
    setSfxVolume, setMusicVolume, getSfxVolume, getMusicVolume,
  };
})();
