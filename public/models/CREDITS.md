# 3D asset credits

Third-party 3D models used across the site's interactive 3D scenes:
the Hero's "intelligent systems" scene (`src/components/3d/`) and the
Hybrid-Adaptive BCI digital twin (`src/components/research/bci-3d/`,
`/projects/hybrid-adaptive-bci`). Every external asset is listed here.
The BCI digital twin's own manifest (`src/data/bci-assets.ts`) mirrors this
file in machine-readable form, plus documents which of its objects are
intentionally procedural (see that file's header for why).

`brain.glb` and `bust-head.glb` below are shared between both scenes — same
file, restyled differently per scene (the Hero renders them as a stylized
hologram/dark-glass bust; the BCI twin restyles them as a physically lit lab
visualization and a clothed seated participant). Everything else in the Hero
scene — the AI Core, platforms, rings, signal paths, particles, server
racks, sensor module, robotic arm and quadruped robot — and everything
robotics/EEG-specific in the BCI twin (the robotic hand, the EEG cap and
amplifier) is procedural Three.js geometry written for this site.

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

## Laboratory props (BCI digital twin only)

Five additional models, all from [Poly Haven](https://polyhaven.com), whose
entire catalogue is [CC0](https://polyhaven.com/license) (public domain —
no attribution legally required; credited here anyway for transparency).
Downloaded at 1k texture resolution and, for the four smaller/less-visible
props, resized further to ~512px to keep the digital twin's asset weight
down (see `src/data/bci-assets.ts`). Shipped under `public/models/laboratory/`.

| Model | Creator | Source |
| --- | --- | --- |
| Metal Office Desk | Ulan Cabanilla | https://polyhaven.com/a/metal_office_desk |
| Metal Stool 02 | Ulan Cabanilla | https://polyhaven.com/a/metal_stool_02 |
| Steel Frame Shelves 02 | James Ray Cock | https://polyhaven.com/a/steel_frame_shelves_02 |
| Wall Clock | PierreB3D | https://polyhaven.com/a/wall_clock |
| Power Box 01 | Rico Cilliers (modeling/texturing), Yann Kervran (rigging) | https://polyhaven.com/a/power_box_01 |

Poly Haven's catalogue was searched for other lab items (a task chair, a
monitor, a keyboard, an equipment vise) — most matches were tagged
vintage/rustic/worn and rejected as a style mismatch for a premium research
lab; those objects stay procedural in the BCI twin instead of forcing in a
wrong-looking real asset.

## Candidates evaluated and not used

Reviewed for the robot dog and robot arm and rejected because they did not
visually fit the reference (cartoon / steampunk / prosthetic styling rather
than a sleek industrial look), so those objects are procedural instead:
Botdog (Nikki Morin, CC-BY 3.0), MechQuadruped (3Donimus, CC-BY 3.0),
Robot Arm (Yali Izzo, CC-BY 3.0), Robot Arm (m m, CC-BY 3.0). None of their
files are included in this repository.
