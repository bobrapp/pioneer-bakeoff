const WEBHOOK_URL_KEY = "bakeoff_webhook_url";
const DEFAULT_WEBHOOK_URL = "https://primary-production-483a5.up.railway.app/webhook/bakeoff";

export type WebhookEventType = "bakeoff_started" | "bakeoff_completed" | "results_exported";

interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export function getWebhookUrl(): string {
  return localStorage.getItem(WEBHOOK_URL_KEY) || DEFAULT_WEBHOOK_URL;
}

export function saveWebhookUrl(url: string): void {
  localStorage.setItem(WEBHOOK_URL_KEY, url);
}

export function sendWebhook(event: WebhookEventType, data: Record<string, unknown>): void {
  const url = getWebhookUrl();
  if (!url) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn(`[Webhook] Failed to send ${event}:`, err.message);
  });
}
