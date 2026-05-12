// Chiptune-style loop data — short, memorable melodies per world.
const MusicData = (() => {

  // Note format: { note, dur } where dur is in beats (1 = quarter note)
  // World 1 — Adventurous, major key (C major), 120 BPM
  const world1 = {
    bpm: 120,
    tracks: [
      {
        instrument: 'square',
        volume: 0.18,
        notes: [
          { note: 'C5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, { note: 'G5', dur: 0.5 }, { note: 'E5', dur: 0.5 },
          { note: 'F5', dur: 0.5 }, { note: 'A5', dur: 0.5 }, { note: 'G5', dur: 1 },
          { note: 'D5', dur: 0.5 }, { note: 'F5', dur: 0.5 }, { note: 'A5', dur: 0.5 }, { note: 'F5', dur: 0.5 },
          { note: 'E5', dur: 0.5 }, { note: 'G5', dur: 0.5 }, { note: 'C5', dur: 1 },
        ],
      },
      {
        instrument: 'triangle',
        volume: 0.28,
        notes: [
          { note: 'C3', dur: 1 }, { note: 'G3', dur: 1 },
          { note: 'F3', dur: 1 }, { note: 'C4', dur: 1 },
          { note: 'D3', dur: 1 }, { note: 'A3', dur: 1 },
          { note: 'C3', dur: 1 }, { note: 'G3', dur: 1 },
        ],
      },
    ],
  };

  // World 2 — Mysterious, minor key (A minor), 130 BPM
  const world2 = {
    bpm: 130,
    tracks: [
      {
        instrument: 'square',
        volume: 0.16,
        notes: [
          { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, { note: 'C5', dur: 0.5 },
          { note: 'D5', dur: 0.5 }, { note: 'F5', dur: 0.5 }, { note: 'E5', dur: 1 },
          { note: 'G4', dur: 0.5 }, { note: 'B4', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'B4', dur: 0.5 },
          { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 1 },
        ],
      },
      {
        instrument: 'sawtooth',
        volume: 0.14,
        notes: [
          { note: 'A2', dur: 0.5 }, { note: 'E3', dur: 0.5 }, { note: 'A3', dur: 0.5 }, { note: 'E3', dur: 0.5 },
          { note: 'F2', dur: 0.5 }, { note: 'C3', dur: 0.5 }, { note: 'F3', dur: 0.5 }, { note: 'C3', dur: 0.5 },
          { note: 'G2', dur: 0.5 }, { note: 'D3', dur: 0.5 }, { note: 'G3', dur: 0.5 }, { note: 'D3', dur: 0.5 },
          { note: 'A2', dur: 0.5 }, { note: 'E3', dur: 0.5 }, { note: 'A3', dur: 0.5 }, { note: 'E3', dur: 0.5 },
        ],
      },
    ],
  };

  // World 3 — Tense, epic, minor key (D minor), 140 BPM
  const world3 = {
    bpm: 140,
    tracks: [
      {
        instrument: 'sawtooth',
        volume: 0.14,
        notes: [
          { note: 'D5', dur: 0.5 }, { note: 'F5', dur: 0.5 }, { note: 'A5', dur: 0.5 }, { note: 'F5', dur: 0.5 },
          { note: 'G5', dur: 0.5 }, { note: 'A5', dur: 1.5 },
          { note: 'C5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, { note: 'G5', dur: 0.5 }, { note: 'E5', dur: 0.5 },
          { note: 'D5', dur: 0.5 }, { note: 'F5', dur: 0.5 }, { note: 'D5', dur: 1 },
        ],
      },
      {
        instrument: 'square',
        volume: 0.12,
        notes: [
          { note: 'D3', dur: 0.25 }, { note: 'D3', dur: 0.25 }, { note: 'D3', dur: 0.25 }, { note: 'D3', dur: 0.25 },
          { note: 'A3', dur: 0.25 }, { note: 'A3', dur: 0.25 }, { note: 'A3', dur: 0.25 }, { note: 'A3', dur: 0.25 },
          { note: 'F3', dur: 0.25 }, { note: 'F3', dur: 0.25 }, { note: 'F3', dur: 0.25 }, { note: 'F3', dur: 0.25 },
          { note: 'C4', dur: 0.25 }, { note: 'C4', dur: 0.25 }, { note: 'C4', dur: 0.25 }, { note: 'C4', dur: 0.25 },
        ],
      },
    ],
  };

  // Menu/title — nostalgic, calm, 90 BPM
  const menu = {
    bpm: 90,
    tracks: [
      {
        instrument: 'sine',
        volume: 0.16,
        notes: [
          { note: 'C5', dur: 1 }, { note: 'E5', dur: 1 }, { note: 'G5', dur: 1 }, { note: 'E5', dur: 1 },
          { note: 'F5', dur: 1 }, { note: 'A5', dur: 1 }, { note: 'G5', dur: 2 },
          { note: 'E5', dur: 1 }, { note: 'D5', dur: 1 }, { note: 'C5', dur: 2 },
        ],
      },
    ],
  };

  function forWorld(w) {
    if (w === 2) return world2;
    if (w === 3) return world3;
    return world1;
  }

  return { forWorld, menu };
})();
