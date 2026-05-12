# Retro Rush

A browser-based 2D platformer paying tribute to the Nokia-era classics *Bounce* (2001) and *Diamond Rush* (2006). Bounce through forgotten ruins, a clockwork fortress, and frozen depths.

**Built with vanilla JavaScript + HTML5 Canvas. Zero dependencies. Zero external assets.**
All art is procedurally drawn. All audio is synthesized via Web Audio API.

## Play

Open `index.html` in any modern browser, or serve the folder with a static server:

```
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Controls

| Key | Action |
|---|---|
| Arrow keys / WASD | Move |
| Space / Up / W | Jump (hold for higher) |
| Down / S | Fast fall / descend in water |
| E | Use tool (hammer / grapple) |
| R | Respawn at checkpoint |
| Esc | Pause |
| Enter | Confirm |

## Worlds

1. **The Forgotten Ruins** — overgrown stone temple. Teaches movement, rings, inflate/deflate, water, spikes, spiders, boulders.
2. **The Clockwork Fortress** — medieval gear-driven castle. Adds hammer, conveyors, pressure plates, snakes, cracked walls.
3. **The Frozen Depths** — ice caves. Adds grapple hook, wind zones, ice physics, stalactites, lava.

18 stages total (3 worlds × 5 stages + 1 challenge stage each).

## Deploying to GitHub Pages

```
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
# Then enable Pages in repo settings → deploy from main branch, root folder.
```

## Project structure

```
retro-rush/
├── index.html
├── css/style.css
└── js/
    ├── main.js                  — game loop + state machine
    ├── engine/                  — canvas, input, camera, collision, physics, particles, audio, save
    ├── game/                    — player, entities, level, tools, world
    ├── ui/                      — font, hud, menu
    ├── art/                     — sprites, tiles, backgrounds, palettes
    └── data/                    — levels, music
```

## License

MIT.
