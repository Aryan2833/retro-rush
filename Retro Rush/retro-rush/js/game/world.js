// World map / stage progression — list of stages, unlock rules, tool grants.
const WorldData = (() => {
  const STAGES = [
    // World 1
    { id: '1-1', world: 1, name: 'First Steps' },
    { id: '1-2', world: 1, name: 'Deep Pool' },
    { id: '1-3', world: 1, name: 'The Locked Garden' },
    { id: '1-4', world: 1, name: 'Spider Nest' },
    { id: '1-5', world: 1, name: 'The Rolling Stone' },
    { id: '1-B', world: 1, name: "Guardian's Gate" },
    // World 2
    { id: '2-1', world: 2, name: 'The Armory', grantsTool: 'hammer' },
    { id: '2-2', world: 2, name: 'Pressure Point' },
    { id: '2-3', world: 2, name: 'Serpent Hall' },
    { id: '2-4', world: 2, name: 'Conveyor Chaos' },
    { id: '2-5', world: 2, name: 'The Great Mechanism' },
    { id: '2-B', world: 2, name: "Knight's Gauntlet" },
    // World 3
    { id: '3-1', world: 3, name: 'Into the Abyss', grantsTool: 'grapple' },
    { id: '3-2', world: 3, name: 'Frozen Falls' },
    { id: '3-3', world: 3, name: 'Wind Tunnel' },
    { id: '3-4', world: 3, name: 'The Crystal Maze' },
    { id: '3-5', world: 3, name: 'Core Meltdown' },
    { id: '3-B', world: 3, name: 'The Seal' },
  ];

  function getStage(id) { return STAGES.find(s => s.id === id); }
  function nextStage(id) {
    const idx = STAGES.findIndex(s => s.id === id);
    if (idx < 0 || idx === STAGES.length - 1) return null;
    return STAGES[idx + 1];
  }
  function stageIndex(id) { return STAGES.findIndex(s => s.id === id); }
  function stages() { return STAGES.slice(); }
  function worldStages(w) { return STAGES.filter(s => s.world === w); }

  return { STAGES, getStage, nextStage, stageIndex, stages, worldStages };
})();
