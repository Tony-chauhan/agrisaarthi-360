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
 * change. No polling. In-flight request de-duplication via a ref.
 */

interface WeatherState {
  snapshot: WeatherSnapshot | null;
  status: "idle" | "loading" | "ready" | "unavailable";
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
        const url = `/api/weather?location=${encodeURIComponent(trimmed)}${
          options.force ? "&refresh=1" : ""
        }`;
        const res = await fetch(url);
        if (!res.ok) {
          setState({ snapshot: null, status: "unavailable" });
          return;
        }
        const data = (await res.json()) as WeatherServiceResult;
        if (data.status === "success") {
          setState({ snapshot: data.snapshot, status: "ready" });
          lastLocation.current = trimmed;
        } else {
          setState({ snapshot: null, status: "unavailable" });
        }
      } catch {
        setState({ snapshot: null, status: "unavailable" });
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
