# 🎮 Retro Rush — A Nokia-Era Inspired Browser Game

## Project Vision

**Retro Rush** is an original browser-based 2D platformer/puzzle-adventure game inspired by the Nokia-era classics **Bounce** (2001, Nokia) and **Diamond Rush** (2006, Gameloft). It takes the core mechanics that made those games addictive — bouncing physics, ring collection, gravity-based puzzles, tool usage, and exploration — and reimagines them with modern visual polish while preserving the nostalgic gameplay feel.

This is **not** a clone or remake. It is an original game that pays tribute to the genre. All assets, levels, and code are original.

**Target experience:** Someone who played Bounce or Diamond Rush on a Nokia phone picks this up and immediately feels at home — but is surprised by how good it looks and sounds in 2026.

---

## 1. Game Identity

| Attribute | Detail |
|---|---|
| **Name** | Retro Rush (working title — can be changed) |
| **Genre** | 2D side-scrolling platformer with puzzle-adventure elements |
| **Platform** | Browser (desktop-first, keyboard controls). Playable via GitHub Pages. |
| **Engine** | Vanilla JavaScript + HTML5 Canvas (no frameworks/libraries). Keep it dependency-free. |
| **Resolution** | 960x540 canvas (16:9), scaled up to fill screen while maintaining aspect ratio |
| **Tile size** | 32x32 pixels (good balance between retro feel and modern clarity) |
| **Frame rate** | 60 FPS with delta-time based movement (frame-rate independent physics) |
| **Art style** | Modern pixel art — crisp 32x32 tiles, smooth animations, dynamic lighting and particle effects layered on top of pixel foundations |
| **Audio** | Chiptune-inspired soundtrack + retro sound effects (generated or sourced CC0) |

---

## 2. Core Gameplay Mechanics

### 2.1 Player Character

The player controls a **red sphere/orb** (tribute to Bounce's red ball) with the following states:

#### Normal State (default)
- Standard size: 28x28 pixels (slightly smaller than a tile for tight navigation)
- Can walk left/right, jump
- Affected by gravity
- Has squash-and-stretch animation on landing and jumping (key Bounce characteristic)
- Can push small boulders

#### Inflated State
- Size increases to 44x44 pixels
- Floats in water instead of sinking
- Bounces higher on trampolines/speed blocks
- Cannot fit through narrow 1-tile gaps
- Activated by touching an **Inflate Pad** (glowing blue pillar)

#### Deflated State
- Size decreases to 16x16 pixels
- Can fit through narrow gaps and small tunnels
- Jumps lower, moves slightly faster
- Sinks in water
- Activated by touching a **Deflate Pad** (glowing orange pillar)

#### State Transitions
- States persist until the player touches another pad
- Visual transition: smooth scale animation over 0.2 seconds with particle burst
- Audio cue: distinct inflate/deflate sound

### 2.2 Movement & Physics

```
PHYSICS CONSTANTS (tunable):
  GRAVITY             = 0.6 px/frame²
  MAX_FALL_SPEED      = 12 px/frame
  WALK_SPEED          = 3.5 px/frame
  WALK_ACCELERATION   = 0.4 px/frame²
  WALK_DECELERATION   = 0.5 px/frame² (friction when no input)
  JUMP_FORCE          = -10 px/frame (negative = upward)
  JUMP_CUT_MULTIPLIER = 0.4 (releasing jump early cuts vertical velocity)
  BOUNCE_RESTITUTION  = 0.3 (default surface bounce)
  TRAMPOLINE_FORCE    = -14 px/frame
  WATER_GRAVITY       = 0.15 px/frame² (reduced in water)
  WATER_MAX_FALL      = 3 px/frame
  WATER_DRAG          = 0.85 (horizontal velocity multiplier per frame in water)
```

**Key physics behaviors:**
- **Variable jump height:** Holding jump = full height. Tapping = short hop. Implemented by cutting upward velocity when jump key is released mid-air.
- **Coyote time:** 6 frames (100ms) after walking off a ledge, the player can still initiate a jump. Prevents frustrating missed jumps at edges.
- **Jump buffering:** If jump is pressed within 6 frames before landing, the jump executes on landing. Makes controls feel responsive.
- **Squash and stretch:** On landing, the ball compresses vertically (scaleY: 0.7, scaleX: 1.3) and springs back over 8 frames. On jumping, it stretches (scaleY: 1.3, scaleX: 0.8). This is essential — it's what made Bounce feel alive.
- **Momentum:** The ball preserves horizontal momentum. No instant direction changes — slight acceleration/deceleration curve.

### 2.3 Collectibles

| Item | Visual | Purpose |
|---|---|---|
| **Rings** | Golden spinning rings (Bounce tribute) | Collect ALL in a level to unlock the exit gate. Counter shown in HUD. |
| **Gems** (purple) | Small purple diamonds (Diamond Rush tribute) | Optional collectibles. Track per-level for completionists. Used for star rating. |
| **Gems** (red) | Rare red diamonds | 1-3 per level. Hidden in secret areas. Unlock bonus content. |
| **Energy Orbs** | Green pulsing orbs | Restore 1 health point |
| **Keys** | Silver or gold key sprite | Required to open specific locked doors in puzzle sections |

### 2.4 Hazards & Obstacles

**Static hazards:**
- **Spikes** — Instant 1-HP damage + knockback. Floor, wall, or ceiling mounted.
- **Lava pits** — Instant death. Glowing orange/red with rising particle embers.
- **Crumbling platforms** — Shake for 0.5s when stepped on, then collapse. Respawn after 3 seconds.
- **One-way platforms** — Can be jumped through from below, solid from above.

**Dynamic hazards:**
- **Boulders** — Affected by gravity. Roll when on slopes. Crush the player (1 HP damage). Player can push them when in Normal state. Central puzzle mechanic (from Diamond Rush).
- **Spiders** — Move back and forth on a fixed path. 1-HP damage on contact. (Bounce tribute)
- **Snakes** — Stationary, strike when player is within 2 tiles horizontally. 1-HP damage. Brief telegraph animation before strike. (Diamond Rush tribute)
- **Falling stalactites** — Drop when player passes beneath. 1-HP damage. Visual dust particles before falling.

**Environmental:**
- **Water zones** — Blue-tinted areas. Physics change: reduced gravity, horizontal drag. Inflated ball floats, deflated ball sinks. Normal ball slowly sinks.
- **Conveyor belts** — Push the player (and boulders) in a direction. Visual: animated arrows.
- **Wind zones** — Vertical or horizontal force applied to the player. Visualized with particle streams.
- **Pressure plates** — Activated by player or boulder weight. Toggle doors/bridges/traps.
- **Locked doors** — Require a matching key (silver/gold) to open.

### 2.5 Tools (Progressive Unlocks)

Inspired by Diamond Rush's tool system. Tools are unlocked per-world and persist.

| Tool | Unlocked | Function | Control |
|---|---|---|---|
| **Hammer** | World 2, Stage 1 | Break cracked walls/blocks (marked with visible cracks). Single-use per cracked block. | Press E/Action key facing a cracked block |
| **Grapple Hook** | World 3, Stage 1 | Pull distant boulders or swing across gaps using grapple points (ceiling hooks). | Press E/Action key while aiming at a grapple point (within 5 tiles) |

### 2.6 Checkpoint System

- **Checkpoint flags** placed mid-level (1-3 per stage depending on length)
- Visual: A small flag post. When activated, flag raises + color changes (grey → green) with a particle burst
- On death, player respawns at last activated checkpoint with a brief fade-to-black transition
- Checkpoints save: player state (size), collected rings in that segment, opened doors

### 2.7 Lives & Health Economy

#### Health (per attempt)
- Player starts each stage with **3 HP** (shown as hearts in HUD)
- Most hazards deal **1 HP** damage (spikes, enemies, boulders, stalactites)
- Lava is **instant death** regardless of HP
- On taking damage: 1.5 seconds of invincibility frames (player flashes/blinks), knockback of 3 tiles in opposite direction of damage source
- At 0 HP: death animation plays, lose 1 life

#### Lives (per session)
- Player starts the game with **5 lives**
- Lives are shared across all stages (not reset per stage)
- Lose a life when: HP reaches 0, or player falls into lava/bottomless pit, or player manually returns to checkpoint (press R — costs 1 life)
- **Gaining lives:**
  - Collecting **50 purple gems** (cumulative across the entire run, not per level) awards 1 extra life. Counter resets after each award. Visual: gem counter briefly flashes "1UP!" on screen.
  - Finding a **1UP orb** (rare, golden glowing orb, max 1 per world hidden in secret areas) awards 1 extra life directly.
  - Completing a boss stage awards 1 extra life.
- **Max lives:** 9 (cannot exceed)
- At 0 lives: **Game Over screen** — options: "Continue from World Start" (restarts current world with 3 lives, keeps all progress from prior worlds) or "Return to World Map"
- Lives are NOT saved to localStorage — they reset to 5 on each fresh play session. This keeps tension without being punishing across sessions.

#### Health Recovery
- **Energy Orbs** (green, pulsing) restore 1 HP. Cannot exceed 3 HP max.
- Energy Orbs are placed strategically before difficult sections, never randomly. Typical placement: 1-2 per stage, always before a boss encounter or hazard gauntlet.
- Health fully restores at the start of each new stage.
- Health does NOT restore at checkpoints (only position resets). This is intentional — it makes checkpoint-to-checkpoint segments feel consequential.

#### Damage Specifics

| Source | Damage | Knockback | Notes |
|---|---|---|---|
| Floor/wall/ceiling spikes | 1 HP | 3 tiles away from spike | |
| Spider (contact) | 1 HP | 3 tiles horizontal | Spider also knocked back 1 tile |
| Snake (strike) | 1 HP | 4 tiles horizontal | Longer knockback — snake strikes hit harder |
| Boulder (crush from above) | 2 HP | None (pinned) | Player pushed out to nearest open side |
| Boulder (side collision while rolling) | 1 HP | 2 tiles horizontal | |
| Falling stalactite | 1 HP | 2 tiles horizontal | |
| Lava | Instant death | N/A | Bypasses HP entirely |
| Bottomless pit | Instant death | N/A | Below level boundary |
| Boss-specific attacks | Varies | Varies | See Section 2.8 |

### 2.8 Boss Stages (Detailed Design)

Boss stages (1-B, 2-B, 3-B) are the capstone of each world. They are NOT traditional health-bar-and-attack-pattern boss fights. Instead, they are **environmental puzzle gauntlets** — longer, harder stages that combine all mechanics from that world into a climactic challenge. This matches the spirit of both Bounce (which had no bosses, just harder levels) and Diamond Rush (whose "bosses" were environment-driven encounters).

Each boss stage has a **unique environmental antagonist** — a large, persistent threat that drives the level's pacing.

---

#### 1-B: "Guardian's Gate" — The Stone Golem

**Concept:** A massive stone face embedded in the temple wall slowly pursues the player from left to right, destroying the level behind it. Auto-scrolling stage.

**The Golem (environmental threat):**
- A 6x6 tile stone face that fills the left edge of the screen
- Scrolls rightward at a constant pace (2 px/frame — slightly slower than player walk speed)
- Destroys all tiles it touches (crumbling animation + dust particles)
- If the player touches the Golem: instant death
- The Golem CANNOT be damaged or stopped. The only strategy is to keep moving.

**Stage structure (3 sections, ~90 seconds total):**

*Section 1 — The Chase (30s):*
- Straightforward platforming with the Golem approaching from behind
- Teaches the auto-scroll mechanic in a low-pressure environment
- Rings placed along the obvious path, gems in slightly risky positions (requiring brief pauses)
- Hazards: basic spikes, 2 spider patrols
- 1 checkpoint after this section

*Section 2 — Water Gauntlet (30s):*
- Level dips into a large water zone
- Player must use inflate pad to float through upper route OR deflate to swim through tight underwater tunnel (lower route — has extra gems)
- Golem continues — water doesn't slow it
- A deflate pad at the end of the water zone is required to fit through a narrow exit
- Hazards: underwater spikes, 1 spider on a platform above water
- 1 checkpoint after this section

*Section 3 — The Gate (30s):*
- Vertical climbing section — platforms ascending rapidly
- Must use trampolines/speed blocks to gain height
- Crumbling platforms add urgency
- Final stretch: narrow corridor with spike timing, leads to the exit gate
- All remaining rings concentrated here — must collect all to unlock exit
- Golem reaches the bottom of the vertical section, adding visual pressure

**Completion:** Player reaches exit gate → Golem slams into the sealed gate behind them → screen shake → "World 1 Complete" fanfare. Award: 1 extra life + Fire Crystal (world completion item, purely cosmetic for now).

**Par time:** 90 seconds. Difficulty: collecting all rings while maintaining speed is the challenge — the platforming itself is forgiving.

---

#### 2-B: "Knight's Gauntlet" — The Iron Knight

**Concept:** A patrolling armored knight entity chases the player through a multi-room fortress. Unlike the Golem (constant auto-scroll), the Knight is an actual entity that follows the player's position — faster on flat ground, slower on slopes, pauses briefly when the player is behind a locked door.

**The Knight (active pursuer):**
- 2x3 tile sprite (tall armored figure)
- Walk speed: 2.8 px/frame (slightly slower than player's 3.5)
- Cannot jump — must take ramps/stairs. This is the key vulnerability the player exploits.
- Cannot fit through 1-tile gaps (player can, when deflated)
- Smashes through cracked walls automatically (2-second delay)
- If the Knight touches the player: 2 HP damage + massive knockback (5 tiles)
- Cannot be killed. Can be temporarily stunned by dropping a boulder on it (3-second stun, resets Knight position to last room entrance)

**Stage structure (4 rooms, ~120 seconds total):**

*Room 1 — The Forge:*
- Introduce the Knight — cutscene: Knight drops from ceiling, begins pursuit
- Simple room: conveyors pushing player toward the Knight, must navigate against them
- Puzzle: activate pressure plate with boulder to open door, escape before Knight catches up
- 1 checkpoint at room exit

*Room 2 — The Puzzle Chamber:*
- Multi-level room with stairs the Knight MUST use (player can jump between levels)
- Must collect key (silver) from upper platform while Knight patrols below
- Use hammer to break cracked wall revealing shortcut
- Pressure plate at bottom opens door at top — must drop boulder on plate, then race up
- 1 checkpoint at room exit

*Room 3 — The Snake Pit:*
- Narrow corridors with snakes + Knight pursuing from behind
- Player must deflate to fit through tight passages the Knight can't follow
- Knight takes the long way around — player has a time window to solve a boulder puzzle blocking the exit
- This room has the only opportunity to stun the Knight: lure it under a boulder perched on a crumbling platform
- 1 checkpoint at room exit

*Room 4 — The Escape:*
- Vertical shaft upward — conveyors, crumbling platforms, spike walls
- Knight enters from below and begins climbing via ramps
- Player must ascend faster than Knight can follow via ramp system
- All remaining rings at the top — exit gate at the summit

**Completion:** Player exits → portcullis slams shut behind them → Knight pounds on it → "World 2 Complete" fanfare. Award: 1 extra life + Silver Crystal.

**Par time:** 120 seconds. Difficulty: the Knight forces constant movement — can't pause to think about puzzles. Must plan on the fly.

---

#### 3-B: "The Seal" — The Collapsing Cavern

**Concept:** The entire cavern is collapsing. The floor falls away behind the player (tiles drop every 2 seconds in a wave from left to right). Ceiling stalactites rain down randomly. This is the ultimate test of everything learned.

**The Collapse (environmental threat):**
- Every 2 seconds, the leftmost column of floor tiles crumbles and falls (despawn animation)
- The collapse wave is relentless — same auto-scroll pressure as 1-B, but from below instead of behind
- Stalactites fall from ceiling at semi-random intervals (telegraphed: 0.5s shake before falling)
- Ice physics on many surfaces — reduced friction makes precision harder
- Wind zones push the player laterally

**Stage structure (3 sections, ~100 seconds total):**

*Section 1 — Ice Run (35s):*
- Horizontal sprint across ice platforms with floor collapsing behind
- Must use grapple hook to swing across 3 large gaps (grapple points on ceiling)
- Wind zones push player toward gaps — must compensate
- Stalactites telegraph and fall — dodge while maintaining momentum
- 1 checkpoint on a stable (non-collapsing) platform midway

*Section 2 — The Vertical Shaft (35s):*
- Level shifts vertical — climbing upward while lower platforms collapse
- Combination of: ice walls (wall-slide mechanic), grapple points, wind updrafts
- Must alternate between inflated (for wind boost) and deflated (for tight gaps) states — pads placed mid-section
- Hammer required: 2 cracked walls block the only path upward
- 1 checkpoint on a stable ledge

*Section 3 — The Final Chamber (30s):*
- Large open room with lava floor (instant death) rising slowly from below
- Multiple floating platforms connected by grapple points
- Pressure plate puzzle: 3 plates must be activated (2 by boulders, 1 by player standing on it) to open the final exit
- Must grapple-pull boulders onto platforms, push them onto plates, while floor rises
- All remaining rings orbiting the platforms — some require risky grapple swings to reach
- Exit gate at the top of the chamber

**Completion:** Player enters exit → cinematic: the cavern fully collapses behind them, player emerges into sunlight → "The Seal" shatters → 3 crystals glow → "Game Complete" screen with final stats.

**Par time:** 100 seconds. Difficulty: The hardest stage in the game. Expects mastery of grapple, inflate/deflate, ice movement, hammer, and boulder manipulation under extreme time pressure.

### 2.9 Scoring & Star Rating System

#### Per-Stage Scoring

Every stage tracks 4 metrics independently:

| Metric | How it works |
|---|---|
| **Rings** | X out of Y collected. Y = total rings in the level. Must collect ALL to complete the stage (gate won't open otherwise). Always 100% on completion. |
| **Purple Gems** | X out of Y collected. Optional. Some are on the main path, some require detours or exploration. |
| **Red Gems** | X out of Z found. Z = total red gems hidden in the level (0-3 per stage, typically 1-2). Always in secret/hard-to-reach areas. |
| **Time** | Seconds from stage start to stage completion. Deaths/respawns do NOT pause the timer — this incentivizes clean runs. |

#### Star Rating (per stage)

Each stage awards **0 to 3 stars** on completion. Stars are calculated independently and kept at the highest achieved across all attempts.

| Stars | Requirement |
|---|---|
| ★☆☆ | Complete the stage (collect all rings, reach exit). This is guaranteed on any completion. |
| ★★☆ | Complete the stage AND collect **all purple gems** in the level. |
| ★★★ | Complete the stage AND collect all purple gems AND finish **under par time**. |

**Red gems do NOT affect star rating.** They are tracked separately as a collector's completionist goal. This avoids making 3 stars require knowledge of every secret — stars should be achievable through skilled play on visible content.

**Par times** are set per stage during level design. Guidelines:
- World 1 stages: 60-90 seconds
- World 2 stages: 90-120 seconds
- World 3 stages: 90-120 seconds
- Boss stages: 90-120 seconds (par time assumes no deaths)

Par times should be achievable on a clean run with efficient pathing — not speedrun-level tight, but not generous either. Roughly 1.3x the time an experienced player would take.

#### World Map Display

On the world map, each stage node shows:
- Star rating (0-3 filled stars)
- Red gem count: small diamond icons (filled = found, outline = not found)
- Best time (if completed)

#### World Completion

A world is "complete" when all 6 stages (5 + boss) have at least 1 star. This unlocks the next world.

#### Total Completion Tracking

The Stage Complete screen and World Map show aggregate stats:
- **Total stars:** X / 54 (18 stages × 3 stars)
- **Total red gems:** X / Y (sum across all stages)
- **Total purple gems:** X / Y (sum across all stages)

#### Game Complete Screen

Shown after beating 3-B. Displays:
- Total time played (cumulative across all stages, including deaths/retries)
- Total deaths
- Total stars earned
- Total red gems found
- A qualitative "rank" based on total stars:
  - 0-18 stars: "Explorer" — You made it through. That counts.
  - 19-36 stars: "Adventurer" — You didn't just survive, you thrived.
  - 37-48 stars: "Master" — You clearly know what you're doing.
  - 49-54 stars: "Completionist" — Nothing got past you.

#### What Scoring Does NOT Include

- No numerical point score. No "Score: 12,450" display. This is a modern design choice — point scores feel arbitrary and arcade-era. The star system and gem tracking are more meaningful and readable.
- No online leaderboards (would require a backend — out of scope for v1).
- No in-game currency or shop. Gems are collectibles for satisfaction, not spending.

---

## 3. Level Design

### 3.1 World Structure

The game has **3 worlds**, each with a distinct visual theme and escalating mechanics. Each world has **5 stages** + 1 **boss/challenge stage** (total: 18 stages).

#### World 1 — The Forgotten Ruins
- **Theme:** Overgrown stone temple, jungle vines, mossy blocks
- **Color palette:** Earthy greens, warm stone beige, golden sunlight shafts
- **Mechanics introduced:** Basic movement, rings, inflate/deflate, spikes, spiders, water basics, crumbling platforms
- **Difficulty:** Tutorial → Easy
- **Stages:**
  - 1-1: "First Steps" — Linear, teaches movement + jump + ring collection
  - 1-2: "Deep Pool" — Introduces water + inflate/deflate pads
  - 1-3: "The Locked Garden" — Introduces keys + locked doors
  - 1-4: "Spider Nest" — Moving enemies (spiders), timing-based platforming
  - 1-5: "The Rolling Stone" — Introduces boulders + basic push puzzles
  - 1-B: "Guardian's Gate" — Auto-scrolling chase stage: a Stone Golem destroys the level behind you. *(Full design: Section 2.8)*

#### World 2 — The Clockwork Fortress
- **Theme:** Medieval castle interiors, gears, mechanical traps
- **Color palette:** Cool greys, iron blue, warm torchlight orange, brass accents
- **Mechanics introduced:** Hammer tool, conveyor belts, pressure plates, snakes, cracked walls, more complex boulder puzzles
- **Difficulty:** Medium
- **Stages:**
  - 2-1: "The Armory" — Hammer unlock + cracked wall introduction
  - 2-2: "Pressure Point" — Pressure plates + door puzzles (use boulders as weights)
  - 2-3: "Serpent Hall" — Snake enemies + tight corridor navigation
  - 2-4: "Conveyor Chaos" — Conveyor belts + timing puzzles
  - 2-5: "The Great Mechanism" — Multi-room puzzle using all W2 mechanics
  - 2-B: "Knight's Gauntlet" — An Iron Knight pursues you through a 4-room fortress. *(Full design: Section 2.8)*

#### World 3 — The Frozen Depths
- **Theme:** Ice caves, frozen waterfalls, crystal formations
- **Color palette:** Deep blues, icy whites, crystalline purples, bioluminescent cyan
- **Mechanics introduced:** Grapple hook, wind zones, ice physics (sliding), falling stalactites, lava pits
- **Difficulty:** Hard
- **Stages:**
  - 3-1: "Into the Abyss" — Grapple hook unlock + swing mechanics
  - 3-2: "Frozen Falls" — Ice surfaces (reduced friction) + water-to-ice transitions
  - 3-3: "Wind Tunnel" — Wind zones + precision platforming
  - 3-4: "The Crystal Maze" — Complex multi-path puzzle level with grapple + hammer + boulders
  - 3-5: "Core Meltdown" — Lava + ice combined, environmental storytelling
  - 3-B: "The Seal" — The cavern collapses around you. Everything you've learned, tested at once. *(Full design: Section 2.8)*

### 3.2 Level Data Format

Levels are stored as JSON files. Each level is a 2D grid of tile IDs with metadata.

```json
{
  "id": "1-1",
  "name": "First Steps",
  "world": 1,
  "width": 60,
  "height": 17,
  "tileSize": 32,
  "spawnPoint": { "x": 2, "y": 14 },
  "exitPoint": { "x": 57, "y": 14 },
  "requiredRings": 15,
  "parTime": 90,
  "tiles": [
    [0,0,0,1,1,1,0,0,...],
    ...
  ],
  "entities": [
    { "type": "ring", "x": 10, "y": 12 },
    { "type": "spider", "x": 25, "y": 14, "patrolRange": 4 },
    { "type": "inflatePad", "x": 15, "y": 14 },
    { "type": "checkpoint", "x": 30, "y": 14 },
    { "type": "boulder", "x": 40, "y": 10 },
    { "type": "key", "x": 45, "y": 8, "keyType": "silver" },
    { "type": "lockedDoor", "x": 55, "y": 14, "keyType": "silver" }
  ],
  "backgrounds": ["ruins_bg_far", "ruins_bg_mid", "ruins_bg_near"]
}
```

**Tile ID mapping:**
```
0  = Air (empty)
1  = Solid block (world-themed)
2  = Solid block variant (visual variety)
3  = One-way platform
4  = Crumbling platform
5  = Spike (floor)
6  = Spike (ceiling)
7  = Spike (wall-left)
8  = Spike (wall-right)
9  = Water
10 = Lava
11 = Ice surface
12 = Conveyor left
13 = Conveyor right
14 = Cracked wall (breakable with hammer)
15 = Grapple point (ceiling)
16 = Pressure plate
17 = Door (linked to pressure plate by entity metadata)
18 = Wind zone (up)
19 = Wind zone (right)
```

### 3.3 Level Design Principles

1. **Teach through play, not text.** First encounter with a mechanic should be in a safe environment where failure is low-cost. Example: First spikes appear in a wide corridor where the player has plenty of room to avoid them.
2. **Layer mechanics gradually.** Each new stage introduces max 1 new mechanic, then combines it with previous ones.
3. **Hidden areas reward curiosity.** Every level should have at least one non-obvious path leading to red gems or bonus rings. Use visual hints: slightly different colored walls, background details pointing toward secrets.
4. **Fair challenge.** Every death should feel like the player's mistake, not the game's. Hazards must be visually telegraphed. No off-screen deaths.
5. **Pacing.** Alternate between action sections (platforming, enemy avoidance) and puzzle sections (boulder manipulation, key hunting). No level should be pure action or pure puzzle.

---

## 4. Visual Design

### 4.1 Art Direction

**Style:** "Neo-retro pixel art" — 32x32 base tiles with modern enhancements.

The pixel grid is respected (no sub-pixel rendering for game elements), but the following modern touches are added:

- **Dynamic lighting:** Ambient light layer rendered on a separate canvas, blended with multiply mode. Light sources: torches, lava glow, crystal glow, sunlight shafts. Implemented as radial gradients on the lighting canvas.
- **Parallax scrolling backgrounds:** 3 layers per world at different scroll speeds (0.2x, 0.5x, 0.8x of camera). Creates depth.
- **Particle system:** Used for: ring collection sparkles, water splashes, dust on landing, ember particles from lava, snow/ice crystals in W3, checkpoint activation burst, player death poof.
- **Screen shake:** Subtle (2-4px, 100-200ms) on: boulder impact, stalactite landing, player taking damage.
- **Smooth camera:** Camera follows player with lerp (linear interpolation) at 0.08 factor — not locked to player. Creates cinematic feel. Camera clamped to level boundaries.

### 4.2 Color Palettes

Each world has a defined palette. All game art must use these palettes strictly.

**World 1 — Forgotten Ruins:**
```
Background:  #1a2e1a, #2d4a2d, #3f6b3f
Blocks:      #8c7a5e, #a69275, #c4b396
Accent:      #d4a030 (gold/rings), #4a8a4a (vines)
Hazard:      #c0392b (spikes), #2980b9 (water)
```

**World 2 — Clockwork Fortress:**
```
Background:  #1a1a2e, #2a2a40, #3a3a55
Blocks:      #6b6b7a, #8a8a9a, #a0a0b0
Accent:      #d4a030 (torchlight), #8b5e3c (wood), #b87333 (brass)
Hazard:      #c0392b (spikes), #27ae60 (snake)
```

**World 3 — Frozen Depths:**
```
Background:  #0a1628, #152238, #1e3050
Blocks:      #a8c8e8, #c0d8f0, #e0f0ff
Accent:      #00e5ff (crystal glow), #9b59b6 (purple crystal)
Hazard:      #e74c3c (lava), #ffffff (ice), #00bcd4 (wind)
```

### 4.3 Animation Specs

All sprite animations use frame-based animation at 10 FPS (6 game frames per animation frame at 60 FPS).

**Player (red orb):**
- Idle: 2 frames (subtle pulse/breathing)
- Walk: 4 frames (rotation + slight squash)
- Jump (ascending): 1 frame (stretched vertically)
- Fall: 1 frame (slightly stretched)
- Land: 3 frames (squash → stretch → normalize)
- Inflate transition: 4 frames
- Deflate transition: 4 frames
- Damage: 3 frames (flash white, knockback)
- Death: 6 frames (pop + particles)

**Enemies:**
- Spider: 4-frame walk cycle, 2-frame idle
- Snake: 2-frame idle (head sway), 3-frame strike animation

**Collectibles:**
- Ring: 6-frame rotation (spinning on Y axis)
- Gem: 4-frame sparkle cycle
- Key: 2-frame bob (floating up/down)

**Environment:**
- Water surface: 4-frame wave animation
- Lava surface: 4-frame bubble animation
- Torch: 4-frame flicker
- Conveyor: 3-frame arrow scroll

### 4.4 Asset Generation Approach

Since this is built with Claude Code, all art should be **generated programmatically** using canvas drawing functions:

1. **Tiles and sprites** — Draw at 32x32 using `ctx.fillRect()`, `ctx.arc()`, etc. on an off-screen canvas at startup, store as `ImageBitmap` or pre-rendered canvas references.
2. **This means no external sprite sheet files are needed.** Everything is code-generated. This keeps the project self-contained and avoids licensing issues.
3. **Each sprite has a `draw(ctx, x, y, frame)` function** that draws the appropriate animation frame.
4. **Color palettes are defined as constants** and referenced by all drawing functions for consistency.

---

## 5. Audio Design

### 5.1 Sound Effects

All SFX should be generated programmatically using the **Web Audio API** (OscillatorNode + GainNode). No external audio files. This keeps the project lightweight and self-contained.

| Sound | Type | Description |
|---|---|---|
| Jump | Short blip | Quick ascending tone (200Hz → 600Hz, 80ms) |
| Land | Thud | Low frequency pulse (100Hz, 50ms, quick decay) |
| Ring collect | Chime | High bell tone (800Hz → 1200Hz, 150ms, sine wave) |
| Gem collect | Sparkle | Higher chime with harmonic (1000Hz + 1500Hz, 200ms) |
| Damage | Buzz | Harsh tone (150Hz, square wave, 200ms) |
| Death | Descending | Descending tone sweep (600Hz → 100Hz, 500ms) |
| Checkpoint | Fanfare | 3-note ascending arpeggio (C5-E5-G5, 100ms each) |
| Level complete | Celebration | 5-note melody (C5-E5-G5-C6, 150ms each, final note sustained) |
| Door open | Mechanical | Low rumble with click (80Hz, 300ms + 400Hz click) |
| Boulder push | Grinding | Low frequency noise (100Hz, sawtooth, while pushing) |
| Inflate | Whoosh up | Ascending sweep (200Hz → 800Hz, 200ms) |
| Deflate | Whoosh down | Descending sweep (800Hz → 200Hz, 200ms) |
| Hammer hit | Impact | Sharp percussive hit (200Hz square, 50ms + noise burst) |
| Grapple fire | Zip | Quick ascending (300Hz → 2000Hz, 100ms) |
| Water splash | Splash | Noise burst filtered through lowpass (500ms) |
| Menu select | Click | Quick high blip (1000Hz, 30ms) |

### 5.2 Music

**Approach:** Simple looping chiptune-style background tracks generated with Web Audio API. Each world gets a distinct musical feel:

- **World 1:** Warm, adventurous. Major key. Medium tempo (~120 BPM). Pulse wave melody + triangle wave bass.
- **World 2:** Mysterious, mechanical. Minor key. Slightly faster (~130 BPM). Square wave melody + arpeggiated bass.
- **World 3:** Tense, epic. Minor key. Faster (~140 BPM). Saw wave lead + driving bass.
- **Menu:** Calm, nostalgic. Slow (~90 BPM). Simple sine wave melody.

Each track is a short 8-16 bar loop. Keep it simple — a memorable 4-note melody is better than a complex arrangement.

**Implementation:** Build a simple sequencer that takes a note array + instrument type and plays it via Web Audio API.

```javascript
// Example music data format
const world1Theme = {
  bpm: 120,
  tracks: [
    {
      instrument: 'pulse',  // OscillatorNode type
      volume: 0.3,
      notes: [
        { note: 'C4', duration: '8n' },
        { note: 'E4', duration: '8n' },
        { note: 'G4', duration: '4n' },
        // ...
      ]
    },
    {
      instrument: 'triangle',
      volume: 0.4,
      notes: [
        { note: 'C3', duration: '4n' },
        // ...
      ]
    }
  ]
};
```

---

## 6. UI & HUD

### 6.1 In-Game HUD

Minimal, non-intrusive. Top of screen.

```
┌─────────────────────────────────────────────────────┐
│  ♥♥♥        ○ 12/15        ◆ 5        1-3          │
│  (health)   (rings)        (gems)     (stage ID)    │
│                                                      │
│                                                      │
│                    GAME AREA                          │
│                                                      │
│                                                      │
│                                        [E] Hammer    │
│                                        (active tool) │
└─────────────────────────────────────────────────────┘
```

- **Health:** Heart icons (max 3, start with 3). Damaged hearts shown as outlines.
- **Ring counter:** "12/15" format. Flashes gold when all collected.
- **Gem counter:** Total purple gems collected in current level.
- **Stage ID:** Current stage identifier.
- **Active tool:** Bottom-right corner. Shows currently available tool with its key binding.

### 6.2 Menus

**Title Screen:**
- Game title with subtle animation (floating, pulsing glow)
- "Press ENTER to Start" prompt (blinking)
- Background: Animated pixel art scene with parallax

**World Map:**
- Simple node-based map showing all stages as circles/icons
- Completed stages: filled + checkmark
- Current stage: pulsing
- Locked stages: greyed out + lock icon
- Shows per-stage stats: rings collected, gems found, best time

**Pause Menu (ESC):**
- Resume
- Restart Stage
- Settings (SFX volume, Music volume)
- Quit to World Map

**Stage Complete Screen:**
- Stage name
- Time taken
- Rings: X/X
- Gems: X/X
- Red gems found: shown as icons
- Star rating: 1-3 stars based on (all rings + gems + under par time)
- "Next Stage" / "Retry" / "World Map" buttons

### 6.3 Visual Style for UI

- Pixel art font (built-in bitmap font drawn on canvas, not a web font)
- Semi-transparent dark background panel behind HUD elements
- All UI elements use the same color palette system as game art
- Transitions between screens: quick fade to black (300ms fade out, 300ms fade in)

---

## 7. Controls

### 7.1 Keyboard (Primary)

| Key | Action |
|---|---|
| **A / Left Arrow** | Move left |
| **D / Right Arrow** | Move right |
| **W / Up Arrow / Space** | Jump (hold for full height) |
| **S / Down Arrow** | Duck / Fast fall (in air) / Descend in water |
| **E** | Use tool (Hammer / Grapple) |
| **R** | Return to checkpoint (costs 1 life) |
| **ESC** | Pause menu |
| **Enter** | Confirm (menus) |

### 7.2 Implementation Notes

- Use `keydown` and `keyup` events to track pressed state in a `keys` object
- Support both WASD and arrow keys simultaneously
- Prevent default browser behavior for game keys (Space scroll, arrow scroll)
- No mouse/touch controls needed for v1 (desktop-first)

---

## 8. Save System

### 8.1 What's Saved

Using `localStorage` with a single JSON key `retroRush_save`:

```json
{
  "version": 1,
  "currentWorld": 2,
  "currentStage": "2-3",
  "unlockedStages": ["1-1","1-2","1-3","1-4","1-5","1-B","2-1","2-2","2-3"],
  "stageStats": {
    "1-1": {
      "completed": true,
      "bestTime": 45,
      "ringsCollected": 15,
      "totalRings": 15,
      "purpleGemsCollected": 8,
      "totalPurpleGems": 8,
      "redGemsFound": [true, false],
      "totalRedGems": 2,
      "stars": 3,
      "parTime": 60
    }
  },
  "aggregateStats": {
    "totalStars": 12,
    "maxStars": 54,
    "totalRedGems": 5,
    "maxRedGems": 30,
    "totalPurpleGems": 48,
    "maxPurpleGems": 120,
    "totalDeaths": 14,
    "totalPlayTime": 1845
  },
  "toolsUnlocked": ["hammer"],
  "worldCrystals": ["fire"],
  "cumulativeGemCounter": 23,
  "settings": {
    "sfxVolume": 0.8,
    "musicVolume": 0.5
  }
}
```

### 8.2 When to Save

- After completing a stage
- After changing settings
- On exiting to world map
- Auto-save at checkpoints (only stage progress, not stats)

### 8.3 New Game

- Prompt for confirmation ("Start new game? This will erase current progress.")
- Reset all save data

---

## 9. Technical Architecture

### 9.1 Project Structure

```
retro-rush/
├── index.html              # Single HTML entry point
├── css/
│   └── style.css           # Minimal styles (canvas centering, background)
├── js/
│   ├── main.js             # Entry point, game loop, state machine
│   ├── engine/
│   │   ├── canvas.js       # Canvas setup, scaling, rendering context
│   │   ├── input.js        # Keyboard input handler
│   │   ├── camera.js       # Smooth-follow camera with bounds clamping
│   │   ├── collision.js    # AABB collision detection + resolution
│   │   ├── physics.js      # Gravity, velocity, friction calculations
│   │   ├── particles.js    # Particle system (emitters, particle lifecycle)
│   │   ├── audio.js        # Web Audio API sound manager + music sequencer
│   │   └── save.js         # localStorage save/load manager
│   ├── game/
│   │   ├── player.js       # Player entity (states, movement, animation)
│   │   ├── entities.js     # All non-player entities (enemies, collectibles, hazards)
│   │   ├── tools.js        # Hammer + Grapple hook logic
│   │   ├── level.js        # Level loader, tile rendering, entity spawning
│   │   └── world.js        # World map, stage progression logic
│   ├── ui/
│   │   ├── hud.js          # In-game HUD rendering
│   │   ├── menu.js         # Title screen, pause menu, stage complete
│   │   └── font.js         # Bitmap pixel font renderer
│   ├── art/
│   │   ├── sprites.js      # Procedural sprite generation (all game sprites)
│   │   ├── tiles.js        # Procedural tile generation (all world tiles)
│   │   ├── backgrounds.js  # Parallax background generation
│   │   └── palettes.js     # Color palette definitions
│   └── data/
│       ├── levels/         # JSON level files
│       │   ├── 1-1.json
│       │   ├── 1-2.json
│       │   └── ...
│       └── music.js        # Music sequence data for each world
├── README.md               # Project README for GitHub
└── LICENSE                  # MIT License
```

### 9.2 Game Loop

```javascript
// main.js — Core game loop structure

const FIXED_DT = 1000 / 60;  // 16.67ms per tick
let accumulator = 0;
let lastTime = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += deltaTime;

  // Fixed timestep for physics (prevents speed variation on different refresh rates)
  while (accumulator >= FIXED_DT) {
    update(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  // Render with interpolation for smooth visuals
  const alpha = accumulator / FIXED_DT;
  render(alpha);

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  switch (gameState) {
    case 'TITLE': updateTitle(dt); break;
    case 'WORLD_MAP': updateWorldMap(dt); break;
    case 'PLAYING': updateGameplay(dt); break;
    case 'PAUSED': updatePause(dt); break;
    case 'STAGE_COMPLETE': updateStageComplete(dt); break;
    case 'GAME_OVER': updateGameOver(dt); break;
  }
}

function render(alpha) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (gameState) {
    case 'TITLE': renderTitle(ctx); break;
    case 'WORLD_MAP': renderWorldMap(ctx); break;
    case 'PLAYING': renderGameplay(ctx, alpha); break;
    case 'PAUSED': renderGameplay(ctx, alpha); renderPause(ctx); break;
    case 'STAGE_COMPLETE': renderStageComplete(ctx); break;
    case 'GAME_OVER': renderGameOver(ctx); break;
  }
}
```

### 9.3 Collision Detection

Use **AABB (Axis-Aligned Bounding Box)** collision for all entities.

```javascript
// collision.js — Core collision check
function checkAABB(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Tile collision: check tiles around the player (3x3 or 4x4 grid)
// Resolve by finding overlap axis with minimum penetration
// Resolve smallest axis first to prevent corner-sticking
```

**Collision resolution order:**
1. Apply velocity to player position
2. Check horizontal tile collisions → resolve → zero horizontal velocity if collided
3. Check vertical tile collisions → resolve → zero vertical velocity if collided (set grounded flag if resolved downward)
4. Check entity collisions (enemies, collectibles, pads) — these don't resolve position, they trigger effects

### 9.4 Rendering Pipeline

Each frame renders in this order (back to front):

1. **Background color fill** (world-specific)
2. **Parallax background layers** (3 layers, far to near)
3. **Tile layer** (only visible tiles based on camera viewport — culling optimization)
4. **Water background** (semi-transparent blue overlay for water zones)
5. **Entities: back layer** (checkpoints, pads, pressure plates)
6. **Entities: main layer** (boulders, enemies, collectibles)
7. **Player**
8. **Entities: front layer** (water surface animations)
9. **Particle effects**
10. **Lighting overlay** (separate canvas composited with `multiply` or `screen` blend mode)
11. **HUD** (rendered in screen space, not world space)

### 9.5 Performance Considerations

- **Tile culling:** Only render tiles visible in the camera viewport + 1 tile buffer
- **Entity culling:** Only update/render entities within camera viewport + 5 tile buffer
- **Off-screen canvas:** Pre-render static tiles to a buffer canvas, only re-render when camera moves by a full tile
- **Object pooling:** Reuse particle objects instead of creating/destroying per frame
- **Sprite caching:** Generate all sprites once at startup, store as ImageBitmap references

---

## 10. Development Approach

### Phase 1 — Core Engine (Build First)
1. Canvas setup with scaling + aspect ratio preservation
2. Game loop with fixed timestep
3. Input handler
4. Basic AABB collision system
5. Tile-based level rendering from JSON
6. Camera system with smooth follow

### Phase 2 — Player Mechanics
1. Player movement (walk, jump with variable height)
2. Squash-and-stretch animation system
3. Gravity + physics
4. Tile collision resolution
5. Inflate/deflate states
6. Water physics
7. Coyote time + jump buffering

### Phase 3 — Game Elements
1. Ring collection + counter
2. Gem collection
3. Spikes + damage/knockback
4. Checkpoint system
5. Exit gate (locked until all rings collected)
6. Basic enemies (spider patrol, snake strike)
7. Boulders (gravity, push, crush)
8. Keys + locked doors
9. Crumbling platforms, one-way platforms

### Phase 4 — Tools & Advanced Mechanics
1. Hammer tool
2. Cracked wall destruction
3. Grapple hook (fire, attach, swing)
4. Conveyor belts
5. Pressure plates + linked doors
6. Wind zones
7. Falling stalactites

### Phase 5 — Visuals & Audio
1. Procedural sprite generation (all player states)
2. Procedural tile generation (all 3 world themes)
3. Parallax backgrounds
4. Particle system + effects
5. Dynamic lighting layer
6. Screen shake
7. SFX generation (Web Audio API)
8. Music sequencer + world themes

### Phase 6 — UI & Progression
1. Bitmap font renderer
2. HUD implementation
3. Title screen
4. World map with stage nodes
5. Pause menu
6. Stage complete screen with star rating
7. Save/load system
8. Stage unlocking logic

### Phase 7 — Level Design & Content
1. Design and build all 18 levels as JSON
2. Playtest each level for fairness and flow
3. Add secrets and red gem placements
4. Set par times
5. Balance difficulty curve across worlds

### Phase 8 — Polish & Ship
1. Screen transitions (fade to black)
2. Death animation + respawn flow
3. Menu animations
4. Final audio mix (volume balancing)
5. Performance testing on different browsers
6. README for GitHub repo
7. Deploy to GitHub Pages

---

## 11. Repository Setup

### GitHub Repo Name
`retro-rush` (or `retro-rush-game`)

### README.md Structure
```markdown
# 🎮 Retro Rush

A browser-based 2D platformer inspired by the Nokia-era classics.
Bounce through forgotten ruins, clockwork fortresses, and frozen depths.

🎮 **[Play Now](https://aryan2833.github.io/retro-rush/)**

## Screenshots
[GIF of gameplay]

## About
[Brief description — what it is, what inspired it]

## How to Play
[Controls table]

## Built With
- Vanilla JavaScript + HTML5 Canvas
- Web Audio API for sound
- Zero dependencies

## License
MIT
```

### GitHub Pages Deployment
- Enable Pages in repo settings → Deploy from `main` branch, root folder
- The game loads from `index.html` directly
- No build step needed (vanilla JS)

---

## 12. Legal & Licensing Notes

- This is an **original game** inspired by Nokia-era classics. It is NOT a remake, port, or clone.
- No assets, code, sprites, sounds, or level designs from Bounce or Diamond Rush are used.
- All art is procedurally generated in code.
- All audio is synthesized via Web Audio API.
- The game will be released under **MIT License**.
- The name "Retro Rush" is a working title. Before publishing, verify it doesn't conflict with existing games.

---

## 13. Success Criteria

The game is "done" when:
- [ ] All 18 levels are playable from start to finish
- [ ] All 3 worlds have distinct visual themes
- [ ] All mechanics work as described (inflate/deflate, tools, puzzles, enemies)
- [ ] Save system persists progress across sessions
- [ ] Audio (SFX + music) is present and working
- [ ] Game is deployable via GitHub Pages
- [ ] Controls feel tight and responsive (squash-stretch, coyote time, buffer all working)
- [ ] At least 1 person other than the developer has playtested it

---

*This document is the single source of truth for building Retro Rush. When in doubt, refer back here.*
