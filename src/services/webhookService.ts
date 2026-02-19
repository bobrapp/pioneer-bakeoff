const WEBHOOK_URL_KEY = "bakeoff_webhook_url";
const DEFAULT_WEBHOOK_URL = "https://primary-production-483a5.up.railway.app/webhook/bakeoff";

export type WebhookEventType = "bakeoff_started" | "bakeoff_completed" | "results_exported";

interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export function isValidWebhookUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "[::1]" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("172.17.") ||
      hostname.startsWith("172.18.") ||
      hostname.startsWith("172.19.") ||
      hostname.startsWith("172.20.") ||
      hostname.startsWith("172.21.") ||
      hostname.startsWith("172.22.") ||
      hostname.startsWith("172.23.") ||
      hostname.startsWith("172.24.") ||
      hostname.startsWith("172.25.") ||
      hostname.startsWith("172.26.") ||
      hostname.startsWith("172.27.") ||
      hostname.startsWith("172.28.") ||
      hostname.startsWith("172.29.") ||
      hostname.startsWith("172.30.") ||
      hostname.startsWith("172.31.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getWebhookUrl(): string {
  return localStorage.getItem(WEBHOOK_URL_KEY) || DEFAULT_WEBHOOK_URL;
}

export function saveWebhookUrl(url: string): void {
  if (url && !isValidWebhookUrl(url)) {
    throw new Error("Invalid webhook URL. Must be HTTPS and not point to internal resources.");
  }
  localStorage.setItem(WEBHOOK_URL_KEY, url);
}

/** Sanitize data to only include safe summary fields */
function sanitizePayload(event: WebhookEventType, data: Record<string, unknown>): Record<string, unknown> {
  switch (event) {
    case "bakeoff_started":
      return {
        bakeoff_id: data.bakeoff_id,
        agent_count: data.agent_count,
        tests: data.tests,
      };
    case "bakeoff_completed":
      return {
        bakeoff_id: data.bakeoff_id,
        agent_count: data.agent_count,
        winner: data.winner,
        // Exclude raw_response and detailed configurations
      };
    case "results_exported":
      return {
        bakeoff_id: data.bakeoff_id,
        format: data.format,
      };
    default:
      return { bakeoff_id: data.bakeoff_id };
  }
}

export function sendWebhook(event: WebhookEventType, data: Record<string, unknown>): void {
  const url = getWebhookUrl();
  if (!url || !isValidWebhookUrl(url)) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: sanitizePayload(event, data),
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn(`[Webhook] Failed to send ${event}:`, err.message);
  });
}

export async function checkWebhookConnection(): Promise<boolean> {
  const url = getWebhookUrl();
  if (!url || !isValidWebhookUrl(url)) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "ping", timestamp: new Date().toISOString(), data: {} }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}
