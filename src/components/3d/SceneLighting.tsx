"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { CORE, SYSTEM_LAYOUT } from "./sceneConfig";

// The AI Core is the key light — a cool blue point light at the sphere
// centre — over a procedural studio environment (no network, rendered once)
// so the metals have something to reflect: cool blue/cyan strips left and
// right, a white top ring, and a low amber kicker behind. Two small accent
// lights tint the far ends of the scene (violet at AI/ML, amber at
// Automation), matching the reference's warm/cool split.
const AIML = SYSTEM_LAYOUT.find((s) => s.id === "aiml")!;
const AUTOMATION = SYSTEM_LAYOUT.find((s) => s.id === "automation")!;

export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.28} color="#5878ff" />
      <pointLight position={[0, CORE.centerY, 0]} color="#3aa0ff" intensity={80} distance={18} decay={2} />
      <pointLight position={[AIML.position.x, AIML.height + 1.2, AIML.position.z]} color="#8b7bff" intensity={9} distance={7} decay={2} />
      <pointLight position={[AUTOMATION.position.x + 0.8, 0.5, AUTOMATION.position.z + 1.2]} color="#f59e0b" intensity={7} distance={6} decay={2} />
      <directionalLight position={[-3, 9, -4]} intensity={0.8} color="#9cc4ff" />
      <Environment resolution={128} frames={1} environmentIntensity={0.9}>
        <Lightformer form="rect" intensity={2.4} color="#4c8bff" position={[-6, 3, 3]} rotation-y={Math.PI / 2.4} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#22d3ee" position={[6, 2.5, 4]} rotation-y={-Math.PI / 2.4} scale={[7, 2.5, 1]} />
        <Lightformer form="ring" intensity={2.6} color="#ffffff" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={5} />
        <Lightformer form="rect" intensity={1.2} color="#f59e0b" position={[0, 1, -8]} scale={[8, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#2a5cff" position={[0, 2, 9]} rotation-y={Math.PI} scale={[10, 2, 1]} />
      </Environment>
    </>
  );
}
