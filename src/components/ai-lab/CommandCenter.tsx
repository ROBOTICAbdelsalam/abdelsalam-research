"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Square, Terminal } from "lucide-react";
import { STATUS_META, SYSTEM_STATUS_META } from "@/lib/ai-lab/statusMeta";
import {
  getCurrentCommandContext,
  describeCommandContext,
  resolveCommandInterpretation,
  getContextualSuggestions,
} from "@/lib/ai-lab/commandContext";
import { useAgentLab } from "./AgentLabProvider";
import { TaskResultPanel } from "./TaskResultPanel";
import { CommandPreview } from "./CommandPreview";

const SUGGESTIONS = [
  "Analyze adaptive BCI research",
  "Design a robotics navigation experiment",
  "Compare machine learning models",
  "Create a data processing workflow",
  "Review the AI Lab architecture",
  "Design an automation pipeline",
];

const MAX_COMMAND_LENGTH = 240;

// The interactive control surface for the laboratory (spec §2–§4, extended
// in Phase 10 into "context-aware command orchestration") — still a
// command interface, not a chat app: no message bubbles, no back-and-forth
// conversation, just an input, a compact context strip, a live brief, a
// status readout and a result.
export function CommandCenter() {
  const {
    agents,
    tasks,
    systemStatus,
    activeTaskId,
    submitCommand,
    cancelActiveTask,
    dismissActiveTask,
    selectedAgentId,
    setSelectedAgentId,
    selectedKnowledgeNodeId,
    setSelectedKnowledgeNodeId,
    selectedResearchId,
    setSelectedResearchId,
    selectedProjectId,
    setSelectedProjectId,
  } = useAgentLab();

  const [command, setCommand] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;
  const assignedAgent = activeTask ? agents.find((a) => a.id === activeTask.assignedAgent) : undefined;
  const isProcessing = systemStatus === "processing";
  const statusMeta = SYSTEM_STATUS_META[systemStatus];

  // Phase 10 §3 — derived, not stored: whichever ONE of the four mutually
  // exclusive selections is active (or the active task, or nothing).
  const context = useMemo(
    () =>
      getCurrentCommandContext({
        selectedAgentId,
        selectedKnowledgeNodeId,
        selectedResearchId,
        selectedProjectId,
        activeTaskId,
      }),
    [selectedAgentId, selectedKnowledgeNodeId, selectedResearchId, selectedProjectId, activeTaskId]
  );
  const contextRows = useMemo(() => describeCommandContext(context, agents), [context, agents]);
  const interpretation = useMemo(
    () => (command.trim() ? resolveCommandInterpretation(command, context, agents) : null),
    [command, context, agents]
  );
  const contextSuggestions = useMemo(() => getContextualSuggestions(context), [context]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (activeTaskId && !isProcessing) {
        dismissActiveTask();
      } else if (selectedAgentId) {
        setSelectedAgentId(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTaskId, isProcessing, dismissActiveTask, selectedAgentId, setSelectedAgentId]);

  function execute() {
    const outcome = submitCommand(command, context);
    if (!outcome.ok) {
      setFeedback(
        outcome.reason === "empty"
          ? "Enter a command to run."
          : outcome.reason === "too-long"
            ? `Keep commands under ${MAX_COMMAND_LENGTH} characters.`
            : "Simulation in progress — wait for it to finish, or cancel it."
      );
      return;
    }
    setFeedback(
      outcome.matched
        ? null
        : "Simulation router could not identify a specialized agent — routed to AI Researcher as a general-purpose fallback."
    );
    setCommand("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      execute();
    }
  }

  function onContextRowClick(row: (typeof contextRows)[number]) {
    if (row.key === "agent" && context.agentId) setSelectedAgentId(context.agentId);
    else if (row.key === "knowledge" && context.knowledgeNodeId) setSelectedKnowledgeNodeId(context.knowledgeNodeId);
    else if (row.key === "research" && context.researchId) setSelectedResearchId(context.researchId);
    else if (row.key === "project" && context.projectId) setSelectedProjectId(context.projectId);
    else if (row.key === "agent") {
      // The resolved-agent row shown alongside a non-agent selection isn't
      // itself the selection — jump to that agent directly.
      const agent = agents.find((a) => a.name === row.value);
      if (agent) setSelectedAgentId(agent.id);
    }
  }

  return (
    <div className="rounded-3xl border border-border-strong bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground">
          <Terminal size={14} className="text-accent" aria-hidden />
          Command Center
        </span>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
            style={{ color: statusMeta.hex }}
            role="status"
            aria-live="polite"
          >
            <span
              className="h-1.5 w-1.5 rounded-full motion-safe:animate-node-pulse"
              style={{ backgroundColor: statusMeta.hex }}
              aria-hidden
            />
            {statusMeta.label}
          </span>
          <span className="rounded-full border border-trace/30 bg-trace-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-trace">
            Simulation Mode
          </span>
        </div>
      </div>

      {/* Current Context strip (spec §4) — subtle, at most a couple of
          small chips, never a dashboard. "LAB OVERVIEW" when nothing is
          selected. Each chip routes through the existing selection setters
          (spec §5) — no new navigation state. */}
      <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Current lab context">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">Current Context</span>
        {contextRows.length === 0 ? (
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
            Lab Overview
          </span>
        ) : (
          contextRows.map((row) => (
            <button
              key={row.key}
              type="button"
              onClick={() => onContextRowClick(row)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-foreground"
            >
              <span className="text-muted/60">{row.label}</span>
              {row.value}
            </button>
          ))
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        {context.source === "overview"
          ? "Issue a task to the laboratory. A local heuristic router assigns it to the most relevant specialist — no external AI is called."
          : "Commands submitted now use the current lab context above — using current context. Naming another domain explicitly still overrides it."}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="sr-only">Command</span>
          <textarea
            ref={textareaRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Give the AI Lab a task…"
            rows={2}
            maxLength={MAX_COMMAND_LENGTH}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus-visible:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={execute}
          disabled={isProcessing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          Execute
          <ArrowRight size={15} aria-hidden />
        </button>
      </div>

      {feedback && (
        <p className="mt-2 text-xs text-amber" role="status">
          {feedback}
        </p>
      )}

      {/* Command Brief (spec §8/§9/§12) — appears automatically once
          there's a command to interpret, no confirmation dialog required.
          Disappears the moment the input is cleared. */}
      {interpretation && (
        <div className="mt-4">
          <CommandPreview interpretation={interpretation} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(contextSuggestions ?? SUGGESTIONS).map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setCommand(suggestion)}
            className="rounded-full border border-border px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {activeTask && (
        <div className="mt-6 border-t border-border pt-6">
          {isProcessing ? (
            <div aria-live="polite">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                    {activeTask.status === "queued"
                      ? "Assigning"
                      : activeTask.status === "thinking"
                        ? STATUS_META.thinking.label
                        : STATUS_META.working.label}
                    {assignedAgent ? ` — ${assignedAgent.name}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{activeTask.title}</p>
                </div>
                <button
                  type="button"
                  onClick={cancelActiveTask}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <Square size={11} aria-hidden />
                  Cancel Task
                </button>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${activeTask.progress}%` }}
                />
              </div>
              <p className="mt-1.5 font-mono text-[11px] tabular-nums text-muted">{activeTask.progress}%</p>
            </div>
          ) : (
            <TaskResultPanel
              task={activeTask}
              agents={agents}
              onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
              onSelectResearch={setSelectedResearchId}
              onSelectProject={setSelectedProjectId}
            />
          )}
        </div>
      )}
    </div>
  );
}
