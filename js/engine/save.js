// localStorage save/load wrapper.
const SaveSystem = (() => {
  const KEY = 'retroRush_save';
  const VERSION = 1;

  function defaultSave() {
    return {
      version: VERSION,
      currentWorld: 1,
      currentStage: '1-1',
      unlockedStages: ['1-1'],
      stageStats: {},
      toolsUnlocked: [],
      settings: { sfxVolume: 0.6, musicVolume: 0.4 },
    };
  }

  let data = defaultSave();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === VERSION) data = parsed;
      }
    } catch (e) {
      console.warn('Save load failed:', e);
    }
    return data;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save write failed:', e);
    }
  }

  function reset() {
    data = defaultSave();
    save();
  }

  function get() { return data; }

  function unlockStage(id) {
    if (!data.unlockedStages.includes(id)) {
      data.unlockedStages.push(id);
      save();
    }
  }

  function recordStageComplete(id, stats) {
    const prev = data.stageStats[id] || {};
    const merged = {
      completed: true,
      bestTime: prev.bestTime !== undefined ? Math.min(prev.bestTime, stats.time) : stats.time,
      ringsCollected: Math.max(prev.ringsCollected || 0, stats.rings),
      totalRings: stats.totalRings,
      gemsCollected: Math.max(prev.gemsCollected || 0, stats.gems),
      totalGems: stats.totalGems,
      redGemsFound: stats.redGemsFound || prev.redGemsFound || [],
      stars: Math.max(prev.stars || 0, stats.stars),
    };
    data.stageStats[id] = merged;
    save();
  }

  function unlockTool(name) {
    if (!data.toolsUnlocked.includes(name)) {
      data.toolsUnlocked.push(name);
      save();
    }
  }

  function setSetting(key, value) {
    data.settings[key] = value;
    save();
  }

  return { load, save, reset, get, unlockStage, recordStageComplete, unlockTool, setSetting };
})();
