import type { DataSource, Season, HealthCheckSummary } from "@/lib/types";
import type { FarmOperationId } from "@/lib/operations/types";
import type { ActionCategory } from "@/lib/weather/types";

/**
 * FARM PLANNER CONTRACT (P1.1)
 *
 * The planner converts the CURRENT farm context into contextual upcoming
 * actions. It is deterministic decision support — never a scientific
 * prediction. Every task carries its creation source so the UI can label
 * it truthfully (AI MODEL / LIVE API / DECISION ENGINE / SERVICE DATA /
 * FALLBACK).
 */

export type TaskStatus = "planned" | "in-progress" | "completed" | "skipped";

export type TaskPriority = "high" | "medium" | "low";

export type TaskCategory =
  | "sowing"
  | "irrigation"
  | "crop-care"
  | "monitoring"
  | "harvest"
  | "operation"
  | "weather-action"
  | "health-followup"
  | "assistant";

/** What produced the task — drives the honest source badge. */
export type TaskSource =
  | "calendar"
  | "decision-engine"
  | "weather"
  | "health"
  | "operation"
  | "assistant";

export interface FarmTask {
  id: string;
  /** Session farm key derived from the profile location. */
  farmId: string;
  cropId?: string;
  title: string;
  description: string;
  category: TaskCategory;
  /** ISO date (YYYY-MM-DD). */
  dueAt: string;
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  /** DataSource for the UI badge — maps to the P0 transparency system. */
  sourceLabel: DataSource;
  /** True when derived from a fallback result (e.g. fallback health analysis). */
  isFallback?: boolean;
  relatedOperationId?: FarmOperationId;
  relatedHealthCheckId?: string;
  /** Weather-linked tasks surface in the WEATHER WATCH bucket. */
  weatherDependency?: { condition: ActionCategory; note: string };
  createdAt: string;
  updatedAt: string;
}

export interface CropCalendarTemplate {
  id: string;
  crop: string;
  season: Season;
  /** Growth stage label, e.g. "Crown root initiation". */
  stage: string;
  taskTemplate: {
    title: string;
    description: string;
    category: TaskCategory;
    priority: TaskPriority;
  };
  /** Day offset from the calendar start (sowing) date. */
  relativeDay: number;
  /** When set, the task becomes weather-aware (WEATHER WATCH). */
  weatherCondition?: ActionCategory;
  notes?: string;
}

export type PlannerBucketKey =
  | "today"
  | "thisWeek"
  | "upcoming"
  | "weatherWatch"
  | "farmAction";

export interface PlannerPlan {
  tasks: FarmTask[];
  buckets: Record<PlannerBucketKey, FarmTask[]>;
  generatedAt: string;
  source: Extract<DataSource, "rules-based">;
  caveat: string;
}

/** Input the planner engine needs — all from existing P0 context. */
export interface PlannerEngineInput {
  profile: {
    location: string;
    farmSizeAcres: number;
    season: Season;
    selectedCrop?: string;
  };
  weatherAction?: {
    title: string;
    message: string;
    reason: string;
    recommendation: string;
    category: ActionCategory;
    priority: "caution" | "monitor" | "normal";
  } | null;
  latestHealthCheck?: HealthCheckSummary | null;
  latestOperation?: {
    operationId: FarmOperationId;
    operationName: string;
    status: "idle" | "reviewing" | "submitted" | "provider_response";
    response?: "accepted" | "unavailable";
  } | null;
  /** ISO date the crop calendar counts from (default: today). */
  calendarStartDate?: string;
  /** Injectable clock for deterministic verification. */
  now?: string;
}

export const PLANNER_CAVEAT =
  "Planning support based on your farm context and configured templates — verify with local conditions before acting. Not a scientific prediction.";

export const TASK_PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
