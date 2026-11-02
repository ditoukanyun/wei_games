# Aquarium UI implementation plan
Goal: implement the approved aquarium concept throughout the existing Cocos H5 game.
Architecture: retain atlas UUIDs and frame coordinates, replace their content, and adjust scene/prefab layout and colors as needed. Generate original bitmap characters and backgrounds; create clean scalable UI shapes and labels consistently.
Tech stack: Cocos Creator 3.8.8, TypeScript, ImageGen, atlas processing.
- [x] Inventory all atlas frames and standalone assets; preserve originals outside assets.
- [x] Generate coherent characters and background; save project sources.
- [x] Replace tokens, UI atlas, loading art, popup artwork and ambient fish art.
- [x] Update mobile layouts and typography without changing rules.
- [x] Build web-mobile, run score regression checks, inspect loading/home/game/popups at phone sizes and provide local preview.
