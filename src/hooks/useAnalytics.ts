import { usePostHog } from "@posthog/react";
import { useCallback } from "react";

type AnalyticsEvent =
  | "bakeoff_started"
  | "bakeoff_completed"
  | "agent_selected"
  | "results_exported"
  | "page_viewed";

export function useAnalytics() {
  const posthog = usePostHog();

  const track = useCallback(
    (event: AnalyticsEvent, properties?: Record<string, unknown>) => {
      posthog?.capture(event, properties);
    },
    [posthog]
  );

  const trackPageView = useCallback(
    (pageName: string) => {
      posthog?.capture("page_viewed", { page: pageName });
    },
    [posthog]
  );

  return { track, trackPageView };
}
