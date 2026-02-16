const STORAGE_KEY = "bakeoff_api_keys";

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
}

export function getApiKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { openai: "", anthropic: "", google: "" };
    return JSON.parse(raw);
  } catch {
    return { openai: "", anthropic: "", google: "" };
  }
}

export function saveApiKeys(keys: ApiKeys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function hasAnyApiKey(): boolean {
  const keys = getApiKeys();
  return !!(keys.openai || keys.anthropic || keys.google);
}
