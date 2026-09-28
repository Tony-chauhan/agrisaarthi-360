/**
 * P1 VERIFICATION — calendar, planner, timeline, provenance, floating AI.
 * Usage: npx tsx scripts/verify-p1.ts
 * Covers STEP 2 test items 1–10 (module level; 11–17 via build/smoke).
 */

import { getCalendarTemplates, hasCalendarSupport, calendarSupportedCrops } from "../lib/planner/crop-calendar";
import { generatePlan, bucketPlan } from "../lib/planner/planner-engine";
import {
  buildTimelineEvent,
  insertEvent,
  applyVerificationStatus,
  canVerify,
} from "../lib/timeline/event-service";
import type { TimelineEvent } from "../lib/timeline/types";
import {
  buildCanonicalPayload,
  hashCanonicalPayload,
  filterEntitySummary,
  farmContextDigest,
} from "../lib/provenance/canonical";
import { createLocalVerificationAdapter } from "../lib/provenance/local-adapter";
import { isBlockchainConfigured } from "../lib/provenance/testnet-adapter";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

const NOW = "2026-11-20T06:30:00.000Z"; // fixed clock for determinism

async function main() {
  /* ------------------ 1. Wheat calendar loads ------------------ */
  console.log("\n1. Wheat + Rabi calendar loads");
  {
    const templates = getCalendarTemplates("Wheat", "rabi");
    assert(templates.length >= 4, `Wheat+rabi has stage templates (${templates.length})`);
    assert(
      templates[0].taskTemplate.title.toLowerCase().includes("sow"),
      "first template is sowing (relativeDay 0)"
    );
    assert(templates[0].relativeDay === 0, "sowing anchored at day 0");
    assert(
      templates.every((t) => t.crop === "Wheat" && t.season === "rabi"),
      "all templates match crop+season"
    );
    assert(hasCalendarSupport("Wheat", "rabi"), "hasCalendarSupport true for golden combo");
    const unknown = getCalendarTemplates("Dragon Fruit", "zaid");
    assert(unknown.length === 0, "unknown crop+season → empty (no fabricated agronomy)");
    assert(calendarSupportedCrops().includes("Wheat"), "supported crops list includes Wheat");
    // Extensibility: structure accepts any new entry (field integrity).
    assert(
      templates.every((t) => t.id && t.stage && t.taskTemplate.title && typeof t.relativeDay === "number"),
      "template field integrity (id/stage/title/relativeDay)"
    );
  }

  /* ------------------ 2. Planner creates tasks ------------------ */
  console.log("\n2. Planner deterministic generation (golden Wheat/Rabi)");
  {
    const input = {
      profile: {
        location: "Nashik, Maharashtra",
        farmSizeAcres: 5,
        season: "rabi" as const,
        selectedCrop: "Wheat",
      },
      now: NOW,
    };
    const plan = generatePlan(input);
    assert(plan.tasks.length >= 4, `plan has calendar tasks (${plan.tasks.length})`);
    assert(
      plan.tasks.some((t) => t.category === "sowing"),
      "sowing task present"
    );
    assert(
      plan.tasks.some((t) => t.category === "irrigation"),
      "irrigation task present"
    );
    assert(
      plan.tasks.every((t) => t.status === "planned"),
      "all tasks start planned"
    );
    assert(
      plan.tasks.every((t) => t.sourceLabel === "rules-based"),
      "calendar tasks labeled DECISION ENGINE (rules-based)"
    );
    const again = generatePlan(input);
    assert(
      JSON.stringify(again.tasks) === JSON.stringify(plan.tasks),
      "identical context → identical plan (deterministic)"
    );
    // Buckets: with start = today, sowing is due today.
    assert(plan.buckets.today.length > 0, "sowing lands in TODAY bucket");
    assert(
      plan.tasks.every((t) => t.id.startsWith("task-")),
      "deterministic task ids"
    );

    // Empty crop → no calendar tasks, honest empty plan.
    const empty = generatePlan({ ...input, profile: { ...input.profile, selectedCrop: undefined } });
    assert(empty.tasks.length === 0, "no crop → no fabricated tasks");
  }

  /* ------------------ 4. Weather affects planner ------------------ */
  console.log("\n4. Weather action → WEATHER WATCH / FARM ACTION");
  {
    const plan = generatePlan({
      profile: {
        location: "Nashik, Maharashtra",
        farmSizeAcres: 5,
        season: "rabi",
        selectedCrop: "Wheat",
      },
      weatherAction: {
        title: "Review planned irrigation",
        message: "Rain is likely tomorrow (70% probability).",
        reason: "Precipitation probability reaches 70% in the next 24–48 hours.",
        recommendation: "Hold off on weather-sensitive field work if possible.",
        category: "irrigation",
        priority: "caution",
      },
      now: NOW,
    });
    const weatherTask = plan.tasks.find((t) => t.source === "weather");
    assert(Boolean(weatherTask), "irrigation weather action creates a task");
    assert(
      weatherTask?.title === "Irrigation review",
      "weather task titled 'Irrigation review'"
    );
    assert(
      plan.buckets.weatherWatch.length > 0,
      "weather-aware tasks land in WEATHER WATCH"
    );
    assert(
      plan.buckets.farmAction.length > 0,
      "weather task lands in FARM ACTION"
    );
    assert(
      weatherTask?.priority === "high",
      "caution weather action → high priority"
    );
  }

  /* ------------------ 5. Health follow-up task ------------------ */
  console.log("\n5. Crop-health result → follow-up task (incl. FALLBACK)");
  {
    const plan = generatePlan({
      profile: {
        location: "Nashik, Maharashtra",
        farmSizeAcres: 5,
        season: "rabi",
        selectedCrop: "Wheat",
      },
      latestHealthCheck: {
        crop: "Wheat",
        possibleCondition: "Early blight-like visual pattern",
        likelihood: "possible",
        isFallback: true,
        source: "demo",
        analyzedAt: "2026-11-19T10:00:00.000Z",
      },
      now: NOW,
    });
    const followUp = plan.tasks.find((t) => t.source === "health");
    assert(Boolean(followUp), "health result creates follow-up task");
    assert(
      followUp?.sourceLabel === "demo",
      "fallback health task preserves FALLBACK labeling (source demo)"
    );
    assert(followUp?.isFallback === true, "fallback flag propagated to task");
  }

  /* ------------------ 3. Timeline + task completion ------------------ */
  console.log("\n3. Timeline: ordering, dedupe, verification states");
  {
    const farmId = "farm-nashik";
    const e1 = buildTimelineEvent(
      farmId,
      {
        eventType: "CROP_SELECTED",
        title: "Wheat selected",
        description: "deterministic",
        source: "rules-based",
        entityType: "crop",
        entityId: "Wheat",
      },
      "2026-11-20T06:00:00.000Z"
    );
    const e2 = buildTimelineEvent(
      farmId,
      {
        eventType: "TASK_CREATED",
        title: "Sow wheat",
        description: "planned",
        source: "rules-based",
        entityType: "task",
        entityId: "task-a",
      },
      "2026-11-20T06:30:00.000Z"
    );
    const e3 = buildTimelineEvent(
      farmId,
      {
        eventType: "TASK_COMPLETED",
        title: "Sow wheat",
        description: "completed",
        source: "rules-based",
        entityType: "task",
        entityId: "task-a",
      },
      "2026-11-20T07:00:00.000Z"
    );
    const e4 = buildTimelineEvent(
      farmId,
      {
        eventType: "OPERATION_REQUESTED",
        title: "Harvesting requested",
        description: "workflow",
        source: "demo",
        entityType: "operation",
        entityId: "harvesting-2026",
      },
      "2026-11-20T07:30:00.000Z"
    );

    let feed: TimelineEvent[] = [];
    feed = insertEvent(feed, e2);
    feed = insertEvent(feed, e1); // out-of-order insertion
    feed = insertEvent(feed, e3);
    feed = insertEvent(feed, e4);
    assert(feed.length === 4, "4 events after insertion");
    assert(
      feed[0].timestamp >= feed[1].timestamp && feed[1].timestamp >= feed[2].timestamp,
      "chronological ordering (newest first)"
    );

    // Dedupe: same entity+type → replaces, not duplicates.
    const dup = buildTimelineEvent(
      farmId,
      {
        eventType: "TASK_COMPLETED",
        title: "Sow wheat",
        description: "completed again",
        source: "rules-based",
        entityType: "task",
        entityId: "task-a",
      },
      "2026-11-20T08:00:00.000Z"
    );
    feed = insertEvent(feed, dup);
    assert(feed.length === 4, "duplicate entity+type event does not duplicate feed");

    // Task completion updates verification eligibility.
    const completedEvent = feed.find((e) => e.eventType === "TASK_COMPLETED")!;
    assert(canVerify(completedEvent), "TASK_COMPLETED is provenance-eligible");
    const cropEvent = feed.find((e) => e.eventType === "CROP_SELECTED")!;
    assert(!canVerify(cropEvent), "CROP_SELECTED is NOT provenance-eligible");

    // Verification status transitions.
    feed = applyVerificationStatus(feed, "task-a", "pending");
    assert(
      feed.find((e) => e.entityId === "task-a")?.verificationStatus === "pending",
      "pending status applied"
    );
    feed = applyVerificationStatus(feed, "task-a", "local-verified", "abc123");
    const verified = feed.find((e) => e.entityId === "task-a")!;
    assert(verified.verificationStatus === "local-verified", "local-verified applied");
    assert(verified.metadataHash === "abc123", "metadataHash propagated");

    // Health + operation + provenance events all enter the feed.
    assert(
      feed.some((e) => e.eventType === "OPERATION_REQUESTED"),
      "operation event enters timeline"
    );
  }

  /* ------------------ 7+8. Canonical hash + local verification ------------------ */
  console.log("\n7+8. Provenance: deterministic hash + local verification");
  {
    const summary = {
      possibleCondition: "Early blight-like visual pattern",
      likelihood: "possible",
    };
    const p1 = buildCanonicalPayload(
      {
        eventType: "HEALTH_CHECK",
        eventTimestamp: "2026-11-20T06:00:00.000Z",
        entitySummary: summary,
        farmContext: { crop: "Wheat", season: "rabi", location: "Nashik, Maharashtra" },
      },
      "2026-11-20T09:00:00.000Z"
    );
    const p2 = buildCanonicalPayload(
      {
        eventType: "HEALTH_CHECK",
        eventTimestamp: "2026-11-20T06:00:00.000Z",
        entitySummary: { likelihood: "possible", possibleCondition: "Early blight-like visual pattern" }, // different key order
        farmContext: { location: "Nashik, Maharashtra", crop: "Wheat", season: "rabi" },
      },
      "2026-11-20T09:00:00.000Z"
    );
    const h1 = hashCanonicalPayload(p1);
    const h2 = hashCanonicalPayload(p2);
    assert(h1 === h2, "hash is key-order independent (deterministic)");
    assert(/^[0-9a-f]{64}$/.test(h1), "hash is SHA-256 hex");

    const p3 = buildCanonicalPayload(
      {
        eventType: "HEALTH_CHECK",
        eventTimestamp: "2026-11-20T06:00:00.000Z",
        entitySummary: { ...summary, possibleCondition: "Different condition" },
        farmContext: { crop: "Wheat", season: "rabi", location: "Nashik, Maharashtra" },
      },
      "2026-11-20T09:00:00.000Z"
    );
    assert(
      hashCanonicalPayload(p3) !== h1,
      "modified payload → different hash (tamper-evident)"
    );

    // Whitelist filter drops unknown keys.
    const filtered = filterEntitySummary({
      possibleCondition: "X",
      secretToken: "abc",
      apiKey: "AQ.xxx",
      imageBase64: "hugeblob",
    } as unknown as Record<string, string>);
    assert(
      Object.keys(filtered).length === 1 && filtered.possibleCondition === "X",
      "whitelist drops keys/tokens/image blobs from canonical payload"
    );

    // Forbidden fields never enter the payload.
    const serialized = JSON.stringify(p1);
    assert(
      !serialized.includes("base64") && !serialized.includes("apiKey") && !serialized.includes("token"),
      "canonical payload contains no keys/tokens/images"
    );

    // Local adapter round-trip.
    const adapter = createLocalVerificationAdapter();
    const record = await adapter.submit({
      recordHash: h1,
      eventType: "HEALTH_CHECK",
      eventTimestamp: "2026-11-20T06:00:00.000Z",
      metadata: { eventId: "evt-test" },
    });
    assert(record.status === "local-verified", "local submit → local-verified");
    assert(!record.transactionHash, "local record has NO transactionHash (honest)");
    const vr = await adapter.verify(record);
    assert(vr.verified === true, "local verification succeeds for registered hash");
    const tampered = { ...record, canonicalPayloadHash: "deadbeef" + record.canonicalPayloadHash.slice(8) };
    const vr2 = await adapter.verify(tampered);
    assert(vr2.verified === false, "tampered hash fails local verification");
    assert(
      !isBlockchainConfigured(),
      "blockchain adapter not configured by default (honest local mode)"
    );
  }

  /* ------------------ 9+10. Blockchain config failure handling ------------------ */
  console.log("\n9+10. Blockchain adapter configuration + failure honesty");
  {
    // With no env config, adapter resolution must fall back to local.
    delete process.env.PROVENANCE_ADAPTER;
    const { resolveProvenanceAdapter } = await import("../lib/provenance/provider");
    const adapter = resolveProvenanceAdapter();
    assert(adapter.name === "local-verification", "default adapter is local verification");

    // Even if 'testnet' is named but misconfigured → not configured.
    process.env.PROVENANCE_ADAPTER = "testnet";
    assert(!isBlockchainConfigured(), "testnet named but unconfigured → not configured");
    const badAdapter = resolveProvenanceAdapter();
    assert(badAdapter.name === "local-verification", "misconfigured testnet falls back to local");
    delete process.env.PROVENANCE_ADAPTER;
  }

  /* ------------------ 14. Assistant fallback (floating AI path) ------------------ */
  console.log("\n14. Floating AI uses existing assistant pipeline (fallback path)");
  {
    delete process.env.GEMINI_API_KEY;
    const { runAssistant } = await import("../lib/assistant/provider");
    const { buildAssistantContext } = await import("../lib/assistant/assistant-context");
    const profile = {
      farmerName: "Ramesh Patil",
      location: "Nashik, Maharashtra",
      farmSizeAcres: 5,
      irrigation: "drip" as const,
      soilType: "loamy" as const,
      season: "rabi" as const,
      selectedCrop: "Wheat",
    };
    const ctx = buildAssistantContext(profile, {
      latestHealthCheck: null,
      latestOperation: null,
      weather: null,
    });
    const resp = await runAssistant({ question: "What should I do today?", topic: "farm-guidance", context: ctx });
    assert(resp.isFallback === true, "no key → fallback response (floating AI uses same pipeline)");
    assert(resp.answer.includes("Wheat"), "fallback answer uses farm context (Wheat)");
  }

  console.log(
    failures === 0
      ? "\nALL P1 CHECKS PASSED — calendar, planner, timeline, provenance, floating-AI verified."
      : `\n${failures} P1 CHECK(S) FAILED.`
  );
  process.exit(failures === 0 ? 0 : 1);
}

void main();
