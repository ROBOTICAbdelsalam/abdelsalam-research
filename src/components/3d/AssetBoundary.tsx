"use client";

import { Component, Suspense, type ReactNode } from "react";

// GLB props load lazily and can fail (offline, blocked, 404). Wrapping each
// in this keeps the procedural stand-in on screen — while loading and after
// any failure — so a missing asset never breaks the scene.

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function WithAsset({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  return (
    <Boundary fallback={fallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </Boundary>
  );
}
