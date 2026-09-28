import type { DataSource } from "@/lib/types";
import { getCalendarTemplates } from "@/lib/planner/crop-calendar";
import type {
  CropCalendarTemplate,
  FarmTask,
  PlannerBucketKey,
  PlannerEngineInput,
  PlannerPlan,
  TaskPriority,
} from "@/lib/planner/types";
import { PLANNER_CAVEAT, TASK_PRIORITY_RANK } from "@/lib/planner/types";

/**
 * PLANNER ENGINE (P1.1) — deterministic, transparent, rules-based.
 *
 * Same farm context → same plan, every run (pure functions, injectable
 * clock for verification). The engine NEVER fabricates recommendations:
 * calendar tasks come only from the knowledge base, weather tasks only
 * from the P0 rules engine output, health follow-ups only from an actual
 * HealthCheckSummary, operation tasks only from an actual operation
 * summary. Every task carries an honest source label.
 */

/** Deterministic id seed from the task identity. */
function seedFor(parts: string[]): string {
  return parts.join("|").toLowerCase().replace(/[^a-z0-9|]+/g, "-");
}

/** ISO date (YYYY-MM-DD) offset by N days from an ISO date. */
function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayIso(nowIso: string): string {
  return nowIso.slice(0, 10);
}

function farmIdFor(location: string): string {
  const loc = location.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return loc ? `farm-${loc}` : "farm-default";
}

/** Build a FarmTask from a calendar template. */
function taskFromTemplate(
  templateId: string,
  crop: string,
  title: string,
  description: string,
  category: FarmTask["category"],
  priority: TaskPriority,
  dueAt: string,
  weatherCondition: CropCalendarTemplate["weatherCondition"],
  startDate: string,
  nowIso: string,
  farmId: string
): FarmTask {
  const ts = new Date(nowIso).toISOString();
  return {
    id: `task-${seedFor([templateId, startDate])}`,
    farmId,
    cropId: crop,
    title,
    description,
    category,
    dueAt,
    status: "planned",
    priority,
    source: "calendar",
    sourceLabel: "rules-based",
    weatherDependency: weatherCondition
      ? {
          condition: weatherCondition,
          note: "Weather-aware task — re-check the forecast before acting.",
        }
      : undefined,
    createdAt: ts,
    updatedAt: ts,
  };
}

/* ------------------------------------------------------------------ */
/* Context-derived tasks (weather / health / operation)                */
/* ------------------------------------------------------------------ */

function weatherTasks(
  input: PlannerEngineInput,
  startDate: string,
  nowIso: string,
  farmId: string
): FarmTask[] {
  const wa = input.weatherAction;
  if (!wa) return [];
  const ts = new Date(nowIso).toISOString();
  const tasks: FarmTask[] = [];

  // Irrigation-category actions become an explicit review task.
  if (wa.category === "irrigation") {
    tasks.push({
      id: `task-${seedFor(["weather-irrigation-review", startDate])}`,
      farmId,
      cropId: input.profile.selectedCrop,
      title: "Irrigation review",
      description: `${wa.message} ${wa.recommendation}`,
      category: "irrigation",
      dueAt: todayIso(nowIso),
      status: "planned",
      priority: wa.priority === "caution" ? "high" : "medium",
      source: "weather",
      sourceLabel: "rules-based",
      weatherDependency: {
        condition: "irrigation",
        note: wa.reason,
      },
      createdAt: ts,
      updatedAt: ts,
    });
  }

  // Strong wind / heat caution → postpone-sensitive-work review.
  if (wa.category === "operations" || wa.category === "heat") {
    tasks.push({
      id: `task-${seedFor(["weather-fieldwork-review", startDate])}`,
      farmId,
      cropId: input.profile.selectedCrop,
      title: "Review field work timing",
      description: `${wa.message} ${wa.recommendation}`,
      category: "weather-action",
      dueAt: todayIso(nowIso),
      status: "planned",
      priority: wa.priority === "caution" ? "high" : "medium",
      source: "weather",
      sourceLabel: "rules-based",
      weatherDependency: {
        condition: wa.category,
        note: wa.reason,
      },
      createdAt: ts,
      updatedAt: ts,
    });
  }

  // Excess water → drainage check.
  if (wa.category === "excess-water") {
    tasks.push({
      id: `task-${seedFor(["weather-drainage-check", startDate])}`,
      farmId,
      cropId: input.profile.selectedCrop,
      title: "Check field drainage",
      description: `${wa.message} ${wa.recommendation}`,
      category: "weather-action",
      dueAt: todayIso(nowIso),
      status: "planned",
      priority: "high",
      source: "weather",
      sourceLabel: "rules-based",
      weatherDependency: {
        condition: "excess-water",
        note: wa.reason,
      },
      createdAt: ts,
      updatedAt: ts,
    });
  }

  return tasks;
}

function healthTasks(
  input: PlannerEngineInput,
  nowIso: string,
  farmId: string
): FarmTask[] {
  const health = input.latestHealthCheck;
  if (!health) return [];
  const ts = new Date(nowIso).toISOString();
  return [
    {
      id: `task-${seedFor(["health-followup", health.analyzedAt])}`,
      farmId,
      cropId: health.crop,
      title: `Follow up: ${health.possibleCondition}`,
      description: `Crop health check on ${health.crop} indicated "${health.possibleCondition}" (visual likelihood: ${health.likelihood}). Re-inspect affected plants, capture a clearer photo if needed, and confirm with a qualified agriculture professional before treatment.`,
      category: "health-followup",
      dueAt: addDays(todayIso(nowIso), 2),
      status: "planned",
      priority: health.likelihood === "likely" ? "high" : "medium",
      source: "health",
      sourceLabel: health.source,
      isFallback: health.isFallback,
      relatedHealthCheckId: health.analyzedAt,
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

function operationTasks(
  input: PlannerEngineInput,
  nowIso: string,
  farmId: string
): FarmTask[] {
  const op = input.latestOperation;
  if (!op || op.status === "idle" || op.status === "reviewing") return [];
  const ts = new Date(nowIso).toISOString();
  const accepted = op.status === "provider_response" && op.response === "accepted";
  return [
    {
      id: `task-${seedFor(["operation-track", op.operationId, op.status])}`,
      farmId,
      cropId: input.profile.selectedCrop,
      title: accepted
        ? `Prepare for ${op.operationName.toLowerCase()}`
        : `Track ${op.operationName.toLowerCase()} request`,
      description: accepted
        ? `${op.operationName} request is accepted in the service workflow. Prepare the field and confirm final scheduling directly with the provider.`
        : `${op.operationName} request is awaiting provider response. Availability depends on connected service providers — try an alternative machine if unavailable.`,
      category: "operation",
      dueAt: addDays(todayIso(nowIso), accepted ? 3 : 1),
      status: "planned",
      priority: "medium",
      source: "operation",
      sourceLabel: "demo",
      relatedOperationId: op.operationId,
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Bucketing                                                           */
/* ------------------------------------------------------------------ */

const BUCKET_KEYS: PlannerBucketKey[] = [
  "today",
  "thisWeek",
  "upcoming",
  "weatherWatch",
  "farmAction",
];

function sortTasks(a: FarmTask, b: FarmTask): number {
  const due = a.dueAt.localeCompare(b.dueAt);
  if (due !== 0) return due;
  return TASK_PRIORITY_RANK[a.priority] - TASK_PRIORITY_RANK[b.priority];
}

/** Deterministic bucketing — a task may appear in multiple views. */
export function bucketPlan(tasks: FarmTask[], nowIso: string): PlannerPlan["buckets"] {
  const today = todayIso(nowIso);
  const weekEnd = addDays(today, 7);
  const active = tasks.filter(
    (t) => t.status === "planned" || t.status === "in-progress"
  );

  const buckets: Record<PlannerBucketKey, FarmTask[]> = {
    today: [],
    thisWeek: [],
    upcoming: [],
    weatherWatch: [],
    farmAction: [],
  };

  for (const task of [...active].sort(sortTasks)) {
    if (task.dueAt <= today) buckets.today.push(task);
    else if (task.dueAt <= weekEnd) buckets.thisWeek.push(task);
    else buckets.upcoming.push(task);

    if (task.weatherDependency) buckets.weatherWatch.push(task);
    if (task.source === "weather") buckets.farmAction.push(task);
  }

  return buckets;
}

/* ------------------------------------------------------------------ */
/* Public engine entry                                                 */
/* ------------------------------------------------------------------ */

/**
 * Generate the plan from the current farm context.
 * Deterministic: identical input (and clock) → identical output.
 */
export function generatePlan(input: PlannerEngineInput): PlannerPlan {
  const nowIso = input.now ?? new Date().toISOString();
  const farmId = farmIdFor(input.profile.location);
  const crop = input.profile.selectedCrop?.trim();
  const startDate = (input.calendarStartDate ?? nowIso).slice(0, 10);

  const tasks: FarmTask[] = [];

  // 1. Calendar tasks — only when a template exists for crop+season.
  if (crop) {
    const templates = getCalendarTemplates(crop, input.profile.season);
    for (const t of templates) {
      tasks.push(
        taskFromTemplate(
          t.id,
          t.crop,
          t.taskTemplate.title,
          t.taskTemplate.description,
          t.taskTemplate.category,
          t.taskTemplate.priority,
          addDays(startDate, t.relativeDay),
          t.weatherCondition,
          startDate,
          nowIso,
          farmId
        )
      );
    }
  }

  // 2. Context-derived tasks.
  tasks.push(...weatherTasks(input, startDate, nowIso, farmId));
  tasks.push(...healthTasks(input, nowIso, farmId));
  tasks.push(...operationTasks(input, nowIso, farmId));

  return {
    tasks,
    buckets: bucketPlan(tasks, nowIso),
    generatedAt: nowIso,
    source: "rules-based",
    caveat: PLANNER_CAVEAT,
  };
}

/** DataSource label mapping for a task's source (UI badge helper). */
export function taskSourceLabel(task: FarmTask): DataSource {
  return task.sourceLabel;
}
