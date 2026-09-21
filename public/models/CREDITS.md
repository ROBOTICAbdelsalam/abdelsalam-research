# 3D asset credits

Third-party 3D models used by the Hero's interactive "intelligent systems"
scene (`src/components/3d/`). Every external asset is listed here.

Only the two files below are external. Everything else in the scene — the AI
Core, platforms, rings, signal paths, particles, server racks, sensor module,
robotic arm and quadruped robot — is procedural Three.js geometry written for
this site. No source asset packs are redistributed; only the single optimised
files below are shipped.

## Assets

### male_base — human head & shoulders bust

- **Used for:** the Human–Machine Interaction node (`public/models/bust-head.glb`)
- **Creator:** hedy magroun
- **Source:** https://poly.pizza/m/eqJEiOX0Fhl
- **License:** CC-BY 3.0 — https://creativecommons.org/licenses/by/3.0/
- **Modified:** yes
  - Removed the separate eyeball mesh.
  - Stripped materials, textures and UVs (the site renders it with its own
    dark-glass shader and an EEG mesh overlay).
  - Welded vertices, quantised and meshopt-compressed
    (~820 KB → ~115 KB, 9,168 triangles).
  - Re-oriented, scaled and re-lit at runtime.

### Brain — anatomical brain

- **Used for:** the AI / ML node hologram (`public/models/brain.glb`)
- **Creator:** J-Toastie
- **Source:** https://poly.pizza/m/YihDCHsOPO
- **License:** CC-BY 3.0 — https://creativecommons.org/licenses/by/3.0/
- **Modified:** yes
  - Stripped materials; recomputed smooth vertex normals.
  - Welded vertices, quantised and meshopt-compressed
    (~120 KB → ~47 KB, 2,224 triangles).
  - Rendered as a blue fresnel hologram with a wireframe overlay.

## Candidates evaluated and not used

Reviewed for the robot dog and robot arm and rejected because they did not
visually fit the reference (cartoon / steampunk / prosthetic styling rather
than a sleek industrial look), so those objects are procedural instead:
Botdog (Nikki Morin, CC-BY 3.0), MechQuadruped (3Donimus, CC-BY 3.0),
Robot Arm (Yali Izzo, CC-BY 3.0), Robot Arm (m m, CC-BY 3.0). None of their
files are included in this repository.
