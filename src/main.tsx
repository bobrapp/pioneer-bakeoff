import { createRoot } from "react-dom/client";
import { PostHogProvider } from "@posthog/react";
import App from "./App.tsx";
import "./index.css";

const posthogOptions = {
  api_host: "https://us.i.posthog.com",
  person_profiles: "identified_only" as const,
};

createRoot(document.getElementById("root")!).render(
  <PostHogProvider
    apiKey="phc_3LjnZJ29EA16khZEWFUwo0x4GADAM2Q7fZZmQJC3kTw"
    options={posthogOptions}
  >
    <App />
  </PostHogProvider>
);
