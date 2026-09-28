"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  FarmTask,
  PlannerPlan,
  TaskStatus,
} from "@/lib/planner/types";
import { generatePlan } from "@/lib/planner/planner-engine";
import type { PlannerEngineInput } from "@/lib/planner/types";
import { useFarmProfile } from "@/lib/farm-context";
import { useTimeline } from "@/lib/timeline/timeline-context";
import type { TimelineEvent } from "@/lib/timeline/types";

/**
 * PLANNER PROVIDER (P1.1)
 *
 * Session-scoped task store — the single write path for farm tasks.
 * Plan generation is deterministic (pure engine); user status changes and
 * AI/user-added tasks update the store and emit timeline events.
 */

interface PlannerContextValue {
  tasks: FarmTask[];
  /** Latest generated plan (recomputed on demand by pages). */
  generateTasks: (input: Omit<PlannerEngineInput, "now">) => PlannerPlan;
  /** Merge generated tasks into the store (dedupe by id). */
  applyPlan: (plan: PlannerPlan) => void;
  /** User lifecycle transitions (emits TASK_COMPLETED on completion). */
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  /** Add a task (user-confirmed assistant suggestion or manual). */
  addTask: (task: Omit<FarmTask, "id" | "farmId" | "createdAt" | "updatedAt" | "status"> & { status?: TaskStatus }) => FarmTask;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const { profile, sessionEpoch } = useFarmProfile();
  const { emitEvent } = useTimeline();
  const [tasks, setTasks] = useState<FarmTask[]>([]);

  /* resetSession bumps sessionEpoch → clear the session task store. */
  useEffect(() => {
    if (sessionEpoch > 0) setTasks([]);
  }, [sessionEpoch]);

  const farmId = useMemo(() => {
    const loc = profile.location.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return loc ? `farm-${loc}` : "farm-default";
  }, [profile.location]);

  const generateTasks = useCallback(
    (input: Omit<PlannerEngineInput, "now">): PlannerPlan =>
      generatePlan({ ...input, profile: { ...input.profile } }),
    []
  );

  const applyPlan = useCallback(
    (plan: PlannerPlan) => {
      setTasks((prev) => {
        const knownIds = new Set(prev.map((t) => t.id));
        const fresh = plan.tasks.filter((t) => !knownIds.has(t.id));
        // Emit TASK_CREATED for genuinely new tasks (deduped by id).
        for (const task of fresh) {
          emitEvent({
            eventType: "TASK_CREATED",
            title: task.title,
            description: `Planned: ${task.description}`,
            source: task.sourceLabel,
            entityType: "task",
            entityId: task.id,
          });
        }
        if (fresh.length === 0) return prev;
        return [...fresh, ...prev];
      });
    },
    [emitEvent]
  );

  const setTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      const target = tasks.find((t) => t.id === taskId);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status, updatedAt: new Date().toISOString() }
            : t
        )
      );
      if (status === "completed" && target) {
        emitEvent({
          eventType: "TASK_COMPLETED",
          title: target.title,
          description: `Completed: ${target.description}`,
          source: target.sourceLabel,
          entityType: "task",
          entityId: target.id,
        });
      }
    },
    [tasks, emitEvent]
  );

  const addTask = useCallback(
    (
      draft: Omit<
        FarmTask,
        "id" | "farmId" | "createdAt" | "updatedAt" | "status"
      > & { status?: TaskStatus }
    ): FarmTask => {
      const now = new Date().toISOString();
      const task: FarmTask = {
        ...draft,
        id: `task-user-${Date.now().toString(36)}`,
        farmId,
        status: draft.status ?? "planned",
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [task, ...prev]);
      emitEvent({
        eventType: "TASK_CREATED",
        title: task.title,
        description: `Planned: ${task.description}`,
        source: task.sourceLabel,
        entityType: "task",
        entityId: task.id,
      });
      return task;
    },
    [farmId, emitEvent]
  );

  const value = useMemo(
    () => ({ tasks, generateTasks, applyPlan, setTaskStatus, addTask }),
    [tasks, generateTasks, applyPlan, setTaskStatus, addTask]
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) {
    throw new Error("usePlanner must be used inside <PlannerProvider>");
  }
  return ctx;
}

/** Type re-export for consumers. */
export type { TimelineEvent };
