"use client";

import { BrainCircuit, Bot, Database, Cog, ScanEye } from "lucide-react";
import { capabilityGrid } from "@/data/research";
import { CapabilityCard } from "./CapabilityCard";

const icons = [BrainCircuit, Bot, Database, Cog, ScanEye];

export function CapabilityGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {capabilityGrid.map((item, index) => (
        <CapabilityCard key={item.title} item={item} icon={icons[index]} delay={index * 0.05} />
      ))}
    </div>
  );
}
