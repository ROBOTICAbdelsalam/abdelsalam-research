"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GestureId, PipelineStageId } from "@/data/bci-experiment";
import { GESTURES } from "@/data/bci-experiment";
import {
  buildRunSequence,
  resolveConfidence,
  systemStatus,
  type ExperimentPhase,
  type ExperimentTick,
  type SystemStatusRow,
} from "./state";
import { STAGE_CAMERA, type CameraMode, type StationId } from "./layout";

// Feature-local state (mirrors the AgentLabProvider pattern already used by
// the AI Lab — a React context scoped to this one experience, not a second
// app-wide store). Two kinds of data are exposed:
//  - reactive state, read via useBciExperiment() and safe to render from;
//  - a mutable `progress` ref (current stage + tick start time/duration),
//    read by the 3D layer inside useFrame so continuous animation (packet
//    motion, hand pose interpolation) never drives a React re-render.

export type Progress = { stage: PipelineStageId | null; startedAt: number; durationMs: number };

type ExperimentState = {
  phase: ExperimentPhase;
  stage: PipelineStageId | null;
  statusText: string;
  command: GestureId;
  confidence: number | null;
  accepted: boolean | null;
  cameraMode: CameraMode;
  focusedStation: StationId | null;
  hoveredStation: StationId | null;
};

type ExperimentActions = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  emergencyStop: () => void;
  selectCommand: (id: GestureId) => void;
  setCameraMode: (mode: CameraMode) => void;
  focusStation: (id: StationId | null) => void;
  hoverStation: (id: StationId | null) => void;
};

export type BCIExperimentContextValue = ExperimentState &
  ExperimentActions & {
    paused: boolean;
    running: boolean;
    progressRef: React.RefObject<Progress>;
    systemStatus: SystemStatusRow[];
  };

const BCIExperimentContext = createContext<BCIExperimentContextValue | null>(null);

const INITIAL_STATE: ExperimentState = {
  phase: "IDLE",
  stage: null,
  statusText: "Idle — select a command and start the experiment.",
  command: "REST",
  confidence: null,
  accepted: null,
  cameraMode: "overview",
  focusedStation: null,
  hoveredStation: null,
};

export function BCIExperimentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExperimentState>(INITIAL_STATE);
  const [paused, setPaused] = useState(false);

  const progressRef = useRef<Progress>({ stage: null, startedAt: 0, durationMs: 0 });
  const sequenceRef = useRef<ExperimentTick[]>([]);
  const tickIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRemainingRef = useRef<number | null>(null);
  const tickStartedAtRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // runTick recurses via setTimeout, so it can't safely call itself by its
  // own `const` binding (self-reference inside a useCallback body is a
  // stale-closure trap). Instead it recurses through runTickRef, a ref kept
  // in sync with the latest `runTick` by an effect — refs may only be read
  // or written outside of render (event handlers, effects), never during
  // render itself, so the sync happens in an effect rather than inline.
  const runTickRef = useRef<() => void>(() => {});

  const runTick = useCallback(() => {
    const sequence = sequenceRef.current;
    const tick = sequence[tickIndexRef.current];
    if (!tick) return;

    progressRef.current = { stage: tick.stage, startedAt: performance.now(), durationMs: tick.durationMs };
    tickStartedAtRef.current = performance.now();
    tickRemainingRef.current = null;

    // Guided camera (section 19): each tick's stage drives the camera to
    // that stage's preset, so starting a run tours the room in pipeline
    // order — Lab Overview → EEG → AI → Adaptive → ROS2 → Robot — rather
    // than leaving the visitor parked wherever they last looked. Free
    // orbit/pan/zoom still works at every step; once the run ends the
    // camera simply stays put ("explore lab"), and any preset pill remains
    // clickable throughout.
    setState((prev) => ({
      ...prev,
      phase: tick.phase,
      stage: tick.stage,
      statusText: tick.status,
      cameraMode: STAGE_CAMERA[tick.stage],
    }));

    timerRef.current = setTimeout(() => {
      tickIndexRef.current += 1;
      if (tickIndexRef.current < sequence.length) {
        runTickRef.current();
      } else {
        // Sequence finished naturally (COMPLETED or REJECTED tick just elapsed).
        clearTimer();
      }
    }, tick.durationMs);
  }, [clearTimer]);

  useEffect(() => {
    runTickRef.current = runTick;
  }, [runTick]);

  const start = useCallback(() => {
    clearTimer();
    const { confidence, accepted } = resolveConfidence(state.command);
    sequenceRef.current = buildRunSequence(accepted);
    tickIndexRef.current = 0;
    setPaused(false);
    setState((prev) => ({ ...prev, confidence, accepted, cameraMode: prev.cameraMode }));
    runTickRef.current();
  }, [clearTimer, state.command]);

  const pause = useCallback(() => {
    if (paused) return;
    const { phase } = state;
    if (phase === "IDLE" || phase === "COMPLETED" || phase === "REJECTED" || phase === "EMERGENCY_STOP") return;
    clearTimer();
    const elapsed = performance.now() - tickStartedAtRef.current;
    const tick = sequenceRef.current[tickIndexRef.current];
    tickRemainingRef.current = tick ? Math.max(0, tick.durationMs - elapsed) : 0;
    setPaused(true);
  }, [clearTimer, paused, state]);

  const resume = useCallback(() => {
    if (!paused) return;
    setPaused(false);
    const remaining = tickRemainingRef.current ?? 0;
    const tick = sequenceRef.current[tickIndexRef.current];
    if (!tick) return;
    tickStartedAtRef.current = performance.now();
    progressRef.current = {
      stage: tick.stage,
      startedAt: performance.now() - (tick.durationMs - remaining),
      durationMs: tick.durationMs,
    };
    timerRef.current = setTimeout(() => {
      tickIndexRef.current += 1;
      if (tickIndexRef.current < sequenceRef.current.length) runTickRef.current();
      else clearTimer();
    }, remaining);
  }, [clearTimer, paused]);

  const reset = useCallback(() => {
    clearTimer();
    sequenceRef.current = [];
    tickIndexRef.current = 0;
    tickRemainingRef.current = null;
    progressRef.current = { stage: null, startedAt: 0, durationMs: 0 };
    setPaused(false);
    setState((prev) => ({ ...INITIAL_STATE, command: prev.command, cameraMode: prev.cameraMode }));
  }, [clearTimer]);

  const emergencyStop = useCallback(() => {
    clearTimer();
    sequenceRef.current = [];
    tickIndexRef.current = 0;
    tickRemainingRef.current = null;
    progressRef.current = { stage: null, startedAt: performance.now(), durationMs: 400 };
    setPaused(false);
    setState((prev) => ({
      ...prev,
      phase: "EMERGENCY_STOP",
      stage: null,
      statusText: "Emergency stop — robot halted. Press Reset to continue.",
    }));
  }, [clearTimer]);

  const selectCommand = useCallback((id: GestureId) => {
    setState((prev) => {
      const busy = prev.phase !== "IDLE" && prev.phase !== "COMPLETED" && prev.phase !== "REJECTED" && prev.phase !== "EMERGENCY_STOP";
      if (busy) return prev;
      return { ...prev, command: id };
    });
  }, []);

  const setCameraMode = useCallback((mode: CameraMode) => {
    setState((prev) => ({ ...prev, cameraMode: mode }));
  }, []);

  const focusStation = useCallback((id: StationId | null) => {
    setState((prev) => ({ ...prev, focusedStation: id }));
  }, []);

  const hoverStation = useCallback((id: StationId | null) => {
    setState((prev) => (prev.hoveredStation === id ? prev : { ...prev, hoveredStation: id }));
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const running =
    state.phase !== "IDLE" && state.phase !== "COMPLETED" && state.phase !== "REJECTED" && state.phase !== "EMERGENCY_STOP";

  const value = useMemo<BCIExperimentContextValue>(
    () => ({
      ...state,
      paused,
      running,
      progressRef,
      systemStatus: systemStatus(state.phase),
      start,
      pause,
      resume,
      reset,
      emergencyStop,
      selectCommand,
      setCameraMode,
      focusStation,
      hoverStation,
    }),
    [state, paused, running, start, pause, resume, reset, emergencyStop, selectCommand, setCameraMode, focusStation, hoverStation],
  );

  return <BCIExperimentContext.Provider value={value}>{children}</BCIExperimentContext.Provider>;
}

export function useBciExperiment() {
  const ctx = useContext(BCIExperimentContext);
  if (!ctx) throw new Error("useBciExperiment must be used within BCIExperimentProvider");
  return ctx;
}

export const GESTURE_LIST = GESTURES;
