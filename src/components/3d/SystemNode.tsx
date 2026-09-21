"use client";

import type { ReactNode } from "react";
import { AIMLNode } from "./AIMLNode";
import { AutomationRobot } from "./AutomationRobot";
import { DataInfrastructure } from "./DataInfrastructure";
import { HumanMachineNode } from "./HumanMachineNode";
import { RobotArm } from "./RobotArm";
import { SensorModule } from "./SensorModule";
import { TechnicalPlatform, type PlatformVariant } from "./TechnicalPlatform";
import type { SystemId, SystemLayout } from "./sceneConfig";

// Per-system structure: platform variant and whether it carries an amber
// floor arc, per the reference.
const NODE_STYLE: Record<SystemId, { variant: PlatformVariant; amber: boolean }> = {
  aiml: { variant: "column", amber: false },
  robotics: { variant: "column", amber: false },
  data: { variant: "disc", amber: true },
  sensors: { variant: "disc", amber: false },
  hmi: { variant: "disc", amber: true },
  automation: { variant: "disc", amber: true },
};

function SystemProp({ system }: { system: SystemLayout }): ReactNode {
  switch (system.id) {
    case "aiml":
      return <AIMLNode system={system} />;
    case "robotics":
      return <RobotArm system={system} />;
    case "data":
      return <DataInfrastructure system={system} />;
    case "sensors":
      return <SensorModule system={system} />;
    case "hmi":
      return <HumanMachineNode system={system} />;
    case "automation":
      return <AutomationRobot system={system} />;
  }
}

// One of the six systems: its platform plus the prop standing on it.
export function SystemNode({ system }: { system: SystemLayout }) {
  const style = NODE_STYLE[system.id];
  return (
    <TechnicalPlatform system={system} variant={style.variant} amber={style.amber}>
      <SystemProp system={system} />
    </TechnicalPlatform>
  );
}
