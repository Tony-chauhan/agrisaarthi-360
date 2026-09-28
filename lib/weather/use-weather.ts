"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FarmWeatherAction,
  WeatherServiceResult,
  WeatherSnapshot,
} from "@/lib/weather/types";

/**
 * CLIENT WEATHER HOOK
 *
 * Calls the internal /api/weather route (never provider URLs directly).
 * Loads once per mount; re-fetches only on manual refresh or a location
 * change. No polling.
 *
 * Request de-duplication at two levels:
 *  - module level: concurrent mounts for the same location (e.g. the
 *    dashboard mounts four hook instances) share ONE network request;
 *  - per-hook: an in-flight ref prevents re-entrant loads within a mount.
 * Completed results are also cached briefly per location, so co-mounted
 * consumers reuse the same snapshot without extra fetches.
 */

interface WeatherState {
  snapshot: WeatherSnapshot | null;
  status: "idle" | "loading" | "ready" | "unavailable";
}

/* ------------------------------------------------------------------ */
/* Module-level request cache — shared across all hook instances       */
/* ------------------------------------------------------------------ */

const RESULT_TTL_MS = 60 * 1000; // short co-mount window; refresh stays cheap
const pendingRequests = new Map<string, Promise<WeatherServiceResult>>();
const recentResults = new Map<
  string,
  { result: WeatherServiceResult; at: number }
>();

function fetchWeatherShared(
  location: string,
  force: boolean
): Promise<WeatherServiceResult> {
  const key = `${location}::${force ? "refresh" : "read"}`;

  if (!force) {
    const recent = recentResults.get(key);
    if (recent && Date.now() - recent.at < RESULT_TTL_MS) {
      return Promise.resolve(recent.result);
    }
    const pending = pendingRequests.get(key);
    if (pending) return pending;
  }

  const request = fetch(`/api/weather?location=${encodeURIComponent(location)}${
    force ? "&refresh=1" : ""
  }`)
    .then(async (res): Promise<WeatherServiceResult> => {
      if (!res.ok) return { status: "unavailable" };
      return (await res.json()) as WeatherServiceResult;
    })
    .catch((): WeatherServiceResult => ({ status: "unavailable" }))
    .then((result) => {
      if (!force) recentResults.set(key, { result, at: Date.now() });
      return result;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  if (!force) pendingRequests.set(key, request);
  return request;
}

export function useWeather(location: string) {
  const [state, setState] = useState<WeatherState>({
    snapshot: null,
    status: "idle",
  });
  const inFlight = useRef(false);
  const lastLocation = useRef<string | null>(null);

  const load = useCallback(
    async (options: { force?: boolean } = {}) => {
      const trimmed = location.trim();
      if (inFlight.current) return;
      if (!trimmed) {
        setState({ snapshot: null, status: "unavailable" });
        return;
      }
      // Skip re-fetch when location unchanged and data already loaded,
      // unless the user explicitly refreshed.
      if (
        !options.force &&
        lastLocation.current === trimmed &&
        state.status !== "idle"
      ) {
        return;
      }

      inFlight.current = true;
      setState((prev) => ({ ...prev, status: "loading" }));

      try {
        const data = await fetchWeatherShared(trimmed, options.force === true);
        if (data.status === "success") {
          setState({ snapshot: data.snapshot, status: "ready" });
          lastLocation.current = trimmed;
        } else {
          setState({ snapshot: null, status: "unavailable" });
        }
      } finally {
        inFlight.current = false;
      }
    },
    [location, state.status]
  );

  /* Load once on mount / when location changes */
  useEffect(() => {
    lastLocation.current = null;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const refresh = useCallback(() => {
    void load({ force: true });
  }, [load]);

  return {
    snapshot: state.snapshot,
    status: state.status,
    refresh,
  };
}

/** Re-export for convenience so pages import from one module. */
export type { WeatherSnapshot, FarmWeatherAction };
