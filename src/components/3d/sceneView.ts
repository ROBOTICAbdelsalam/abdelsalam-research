import { REF, type SystemId } from "./sceneConfig";

// How a canvas of a given size maps onto the reference frame. The scene's
// "content extents" (in reference pixels) are fitted into the canvas minus
// the insets, so the composition scales and re-centres instead of cropping.

export type SceneMode = "full" | "compact" | "tablet" | "mobile";

type Extents = { x0: number; y0: number; x1: number; y1: number };
type Insets = { l: number; r: number; t: number; b: number };

// Reference-pixel bounding boxes of what each mode shows.
const EXTENTS: Record<SceneMode, Extents> = {
  // Everything: HMI/Data cards on the left → Sensors card on the right;
  // AI/ML card at the top → Automation platform at the bottom.
  full: { x0: 385, y0: 105, x1: 1515, y1: 880 },
  compact: { x0: 385, y0: 105, x1: 1515, y1: 880 },
  tablet: { x0: 450, y0: 130, x1: 1440, y1: 870 },
  // Core + the four corner systems (AI/ML, Robotics, HMI, Automation).
  mobile: { x0: 440, y0: 125, x1: 1460, y1: 885 },
};

// Fractions of the canvas kept clear. On desktop the left ~25% of the canvas
// sits under the Hero copy, so no scene content may land there.
const INSETS: Record<SceneMode, Insets> = {
  full: { l: 0.25, r: 0.015, t: 0.03, b: 0.03 },
  compact: { l: 0.25, r: 0.015, t: 0.03, b: 0.03 },
  tablet: { l: 0.02, r: 0.02, t: 0.02, b: 0.02 },
  mobile: { l: 0.02, r: 0.02, t: 0.02, b: 0.02 },
};

// Mobile shows the AI Core with the four "corner" systems — a balanced,
// readable composition — instead of squeezing all six into a phone.
const MOBILE_SYSTEMS: readonly SystemId[] = ["aiml", "robotics", "hmi", "automation"];

export function isSystemVisible(mode: SceneMode, id: SystemId) {
  return mode !== "mobile" || MOBILE_SYSTEMS.includes(id);
}

export type SceneView = {
  /** Canvas pixels per reference pixel. */
  scale: number;
  /** Reference-pixel position of the canvas' top-left corner. */
  rx: number;
  ry: number;
  /** Canvas size in reference pixels. */
  rw: number;
  rh: number;
};

export function computeView(width: number, height: number, mode: SceneMode): SceneView {
  const ext = EXTENTS[mode];
  const inset = INSETS[mode];
  const availW = width * (1 - inset.l - inset.r);
  const availH = height * (1 - inset.t - inset.b);
  const scale = Math.min(availW / (ext.x1 - ext.x0), availH / (ext.y1 - ext.y0));

  const centreRefX = (ext.x0 + ext.x1) / 2;
  const centreRefY = (ext.y0 + ext.y1) / 2;
  const centreCanvasX = width * inset.l + availW / 2;
  const centreCanvasY = height * inset.t + availH / 2;

  return {
    scale,
    rx: centreRefX - centreCanvasX / scale,
    ry: centreRefY - centreCanvasY / scale,
    rw: width / scale,
    rh: height / scale,
  };
}

export const REFERENCE_ASPECT = REF.w / REF.h;
