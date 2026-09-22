// Asset manifest for the Hybrid-Adaptive BCI digital twin's 3D scene
// (src/components/research/bci-3d/). One entry per physical object the
// scene renders, so it's clear at a glance which objects are real licensed
// GLB/GLTF assets and which are procedural Three.js geometry — see
// AssetLoader.tsx for how `glb` entries are loaded (always with a
// procedural `fallback`, so a missing/blocked asset never breaks the
// scene) and public/models/CREDITS.md for full attribution text.
//
// How the five new "laboratory" GLBs were chosen (see the realism-pass
// notes): Poly Haven's entire catalogue is CC0 (public domain, no
// attribution required — https://polyhaven.com/license), so licensing is
// unambiguous. Its catalogue was searched for generic lab/office furniture;
// most matches skewed rustic/vintage/"worn" (bar stools, garage vices,
// weathered tool carts) and were rejected as a style mismatch for a
// "premium research lab" brief. The five below were the ones that actually
// read as clean, modern, or at least neutral industrial — everything else
// (the EEG cap, the EEG amplifier, the robotic hand, monitors, keyboards)
// has no suitable free-licensed real-world equivalent in CC0/permissive
// libraries, since those are specialized medical/robotics hardware, not
// generic props. Those stay procedural, and stay that way honestly rather
// than pretending a generic prop is "the EEG amplifier."

export type AssetCategory =
  | "furniture"
  | "electronics"
  | "decor"
  | "visualization"
  | "human";

export type AssetSource = {
  id: string;
  category: AssetCategory;
  /** What real-world object this represents in the scene. */
  realWorldReference: string;
  /** Where every station/component that uses this asset can import it from. */
  usedBy: readonly string[];
} & (
  | {
      kind: "glb";
      path: string;
      license: string;
      licenseUrl: string;
      creator: string;
      source: string;
      /** True if this file is shared with another part of the site (see public/models/CREDITS.md). */
      sharedWithHero?: boolean;
      notes?: string;
    }
  | {
      kind: "procedural";
      /** Why no real asset is used — kept honest per the fallback contract (section 29). */
      reason: string;
    }
);

export const BCI_ASSETS: readonly AssetSource[] = [
  // --- Real GLB assets, newly sourced for this rebuild (Poly Haven, CC0) ---
  {
    id: "lab-desk",
    kind: "glb",
    category: "furniture",
    path: "/models/laboratory/metal_office_desk/metal_office_desk_1k.gltf",
    realWorldReference: "Dark metal research/office desk",
    license: "CC0 1.0 (public domain)",
    licenseUrl: "https://polyhaven.com/license",
    creator: "Ulan Cabanilla",
    source: "https://polyhaven.com/a/metal_office_desk",
    usedBy: ["environment/LabFurniture.tsx (LabDesk)"],
  },
  {
    id: "lab-stool",
    kind: "glb",
    category: "furniture",
    path: "/models/laboratory/metal_stool_02/metal_stool_02_1k.gltf",
    realWorldReference: "Simple metal-frame lab stool (workstation seating)",
    license: "CC0 1.0 (public domain)",
    licenseUrl: "https://polyhaven.com/license",
    creator: "Ulan Cabanilla",
    source: "https://polyhaven.com/a/metal_stool_02",
    usedBy: ["environment/LabFurniture.tsx (LabStool)"],
  },
  {
    id: "equipment-rack",
    kind: "glb",
    category: "furniture",
    path: "/models/laboratory/steel_frame_shelves_02/steel_frame_shelves_02_1k.gltf",
    realWorldReference: "Steel-frame equipment/server shelving",
    license: "CC0 1.0 (public domain)",
    licenseUrl: "https://polyhaven.com/license",
    creator: "James Ray Cock",
    source: "https://polyhaven.com/a/steel_frame_shelves_02",
    usedBy: ["environment/LabFurniture.tsx (EquipmentRack)"],
  },
  {
    id: "wall-clock",
    kind: "glb",
    category: "decor",
    path: "/models/laboratory/wall_clock/wall_clock_1k.gltf",
    realWorldReference: "Wall-mounted analog clock (lab wall detail)",
    license: "CC0 1.0 (public domain)",
    licenseUrl: "https://polyhaven.com/license",
    creator: "PierreB3D",
    source: "https://polyhaven.com/a/wall_clock",
    usedBy: ["environment/RealisticLab.tsx"],
  },
  {
    id: "power-panel",
    kind: "glb",
    category: "electronics",
    path: "/models/laboratory/power_box_01/power_box_01_1k.gltf",
    realWorldReference: "Wall-mounted power/breaker distribution panel",
    license: "CC0 1.0 (public domain)",
    licenseUrl: "https://polyhaven.com/license",
    creator: "Rico Cilliers (modeling/texturing), Yann Kervran (rigging)",
    source: "https://polyhaven.com/a/power_box_01",
    usedBy: ["environment/RealisticLab.tsx"],
  },

  // --- Real GLB assets already in the repo, reused from the Hero scene ---
  {
    id: "bci-core-brain",
    kind: "glb",
    category: "visualization",
    path: "/models/brain.glb",
    realWorldReference: "Anatomical brain — the central BCI visualization's core mesh",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    creator: "J-Toastie",
    source: "https://poly.pizza/m/YihDCHsOPO",
    sharedWithHero: true,
    notes:
      "Same optimized geometry-only GLB as the Hero's AI/ML node (public/models/CREDITS.md); restyled here with this scene's own material, not Hero's hologram shader, to keep the two installations visually distinct.",
    usedBy: ["visualization/BCICore.tsx"],
  },
  {
    id: "eeg-participant-head",
    kind: "glb",
    category: "human",
    path: "/models/bust-head.glb",
    realWorldReference: "Human head & shoulders bust — the EEG participant",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    creator: "hedy magroun",
    source: "https://poly.pizza/m/eqJEiOX0Fhl",
    sharedWithHero: true,
    notes:
      "Same optimized geometry-only GLB as the Hero's Human-Machine Interaction node; restyled here as a seated, clothed research participant with a procedural EEG cap fitted to its cranium, not Hero's dark-glass look.",
    usedBy: ["eeg/EEGParticipant.tsx"],
  },

  // --- Procedural — no suitable licensed real-world asset exists ---
  {
    id: "eeg-cap",
    kind: "procedural",
    category: "human",
    realWorldReference: "64-channel EEG electrode cap",
    reason:
      "No free/CC0/permissively-licensed 3D model of a research EEG cap exists in any library checked (Poly Haven, Khronos glTF samples, Kenney) — it's specialized medical hardware, not a generic prop.",
    usedBy: ["eeg/EEGCap.tsx"],
  },
  {
    id: "eeg-amplifier",
    kind: "procedural",
    category: "electronics",
    realWorldReference: "EEG amplifier / acquisition box",
    reason: "Same as eeg-cap — no suitable free-licensed asset exists for this specific hardware class.",
    usedBy: ["eeg/EEGAmplifier.tsx"],
  },
  {
    id: "robotic-hand",
    kind: "procedural",
    category: "electronics",
    realWorldReference: "Five-finger research robotic hand",
    reason:
      "No free/CC0/permissively-licensed realistic research robotic hand model was found. Built as a detailed procedural joint hierarchy instead (palm, wrist, five articulated 3-joint finger chains, knuckle actuator housings, tendon lines, fingertip pads) so gesture animation stays fully under this scene's control regardless.",
    usedBy: ["robotics/RoboticHand.tsx"],
  },
  {
    id: "lab-monitor",
    kind: "procedural",
    category: "electronics",
    realWorldReference: "Workstation flat-panel monitor",
    reason:
      "No free monitor GLB fit the scene's aspect ratio/scale, and every monitor needs a live canvas-texture readout (Screen.tsx) driven by the experiment state — a procedural bezel + plane is simpler and correct either way.",
    usedBy: ["Screen.tsx"],
  },
  {
    id: "keyboard-mouse",
    kind: "procedural",
    category: "electronics",
    realWorldReference: "Keyboard and mouse",
    reason: "Small, cheap desk-clutter geometry; not worth the download weight of a real asset at this screen size.",
    usedBy: ["environment/LabFurniture.tsx"],
  },
] as const;
