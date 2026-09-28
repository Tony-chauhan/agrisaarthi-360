import type { FarmProfile } from "@/lib/types";
import type { HealthCheckSummary } from "@/lib/types";
import type { LatestOperationSummary } from "@/lib/operations/types";
import type {
  AssistantContextPacket,
  ContextField,
  ContextSourceLabel,
} from "./types";

/**
 * CONTEXT PACKET BUILDER
 *
 * Builds the compact, source-labeled context packet from ACTUAL state.
 * Fields are included only when they exist — no placeholders, no invented
 * values, no raw API payloads, no image data.
 */

/** Marks context fields as coming from the sample farm, not a live feed. */
const SAMPLE_NOTE = "sample farm data";

function field(
  key: string,
  value: string | undefined,
  source: ContextSourceLabel,
  suffix?: string
): ContextField | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return { key, value: suffix ? `${trimmed} (${suffix})` : trimmed, source };
}

export function buildAssistantContext(
  profile: FarmProfile,
  extras: {
    latestHealthCheck: HealthCheckSummary | null;
    latestOperation: LatestOperationSummary | null;
    weather: {
      summary: string;
      actionTitle: string;
      actionMessage: string;
      isLive: boolean;
    } | null;
  }
): AssistantContextPacket {
  const packet: AssistantContextPacket = {
    farm: {},
  };

  packet.farm.farmerName = field(
    "Farmer name",
    profile.farmerName,
    "user-provided",
    SAMPLE_NOTE
  );
  packet.farm.location = field("Location", profile.location, "user-provided", SAMPLE_NOTE);
  packet.farm.farmSize =
    profile.farmSizeAcres > 0
      ? {
          key: "Farm size",
          value: `${profile.farmSizeAcres} acres (${SAMPLE_NOTE})`,
          source: "user-provided",
        }
      : undefined;
  packet.farm.irrigation = field(
    "Irrigation",
    profile.irrigation,
    "user-provided",
    SAMPLE_NOTE
  );
  packet.farm.soil = field("Soil type", profile.soilType, "user-provided", SAMPLE_NOTE);
  packet.farm.season = field("Season", profile.season, "user-provided", SAMPLE_NOTE);

  if (profile.selectedCrop?.trim()) {
    packet.crop = {
      selectedCrop: {
        key: "Selected crop",
        value: profile.selectedCrop.trim(),
        source: "user-provided",
      },
    };
  }

  if (extras.latestHealthCheck) {
    packet.health = {
      crop: extras.latestHealthCheck.crop,
      possibleCondition: extras.latestHealthCheck.possibleCondition,
      likelihood: extras.latestHealthCheck.likelihood,
      isFallback: extras.latestHealthCheck.isFallback,
      sourceLabel: extras.latestHealthCheck.source === "demo" ? "demo-data" : "model-result",
    };
  }

  if (extras.weather) {
    packet.weather = {
      summary: extras.weather.summary,
      actionTitle: extras.weather.actionTitle,
      actionMessage: extras.weather.actionMessage,
      sourceLabel: extras.weather.isLive ? "live-api" : "demo-data",
      actionSourceLabel: "rules-based",
    };
  }

  if (extras.latestOperation) {
    packet.operation = {
      operationName: extras.latestOperation.operationName,
      machineName: extras.latestOperation.machineName,
      statusText:
        extras.latestOperation.status === "provider_response" &&
        extras.latestOperation.response === "accepted"
          ? "service request accepted (dataset outcome)"
          : extras.latestOperation.status === "provider_response"
            ? "provider unavailable (dataset outcome)"
            : "service request in progress",
      sourceLabel: "demo-data",
    };
  }

  return packet;
}
