
/**
 * Network monitoring and webRequest listeners for AI service endpoints
 */
import { analyzeInteraction, completeAnalysis } from "./analysis";

const AI_SERVICE_ENDPOINTS = [
  "api.openai.com",
  "api.anthropic.com",
  "api.cohere.ai",
  "api.perplexity.ai",
  "bard.google.com",
  "claude.ai"
];

export function isAIServiceRequest(url: string): boolean {
  return AI_SERVICE_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

export function extractServiceName(url: string): string {
  for (const endpoint of AI_SERVICE_ENDPOINTS) {
    if (url.includes(endpoint)) {
      return endpoint.split('.')[0];
    }
  }
  return "unknown";
}

export function generateInteractionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function findInteractionByUrl(activeInteractions: Map<string, any>, url: string): string | null {
  for (const [id, interaction] of activeInteractions.entries()) {
    if (interaction.url === url) {
      return id;
    }
  }
  return null;
}

// Setup listeners; takes props (activeInteractions, notify)
export function setupWebRequestListeners(
  activeInteractions: Map<string, any>,
  notify: (tabId: number, message: any) => void
) {
  // Listen for AI service requests
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (isAIServiceRequest(details.url)) {
        const interactionId = generateInteractionId();
        activeInteractions.set(interactionId, {
          timestamp: Date.now(),
          url: details.url,
          tabId: details.tabId,
          requestData: details.requestBody,
          status: "pending"
        });

        notify(details.tabId, {
          type: "ai_interaction_detected",
          interactionId,
          service: extractServiceName(details.url)
        });

        analyzeInteraction(activeInteractions, interactionId, notify);
      }
      return { cancel: false };
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
    ["requestBody"]
  );

  // Listen for AI service responses
  chrome.webRequest.onCompleted.addListener(
    (details) => {
      if (isAIServiceRequest(details.url)) {
        const interactionId = findInteractionByUrl(activeInteractions, details.url);
        if (interactionId) {
          const interaction = activeInteractions.get(interactionId);
          if (interaction) {
            interaction.responseData = details;
            interaction.status = "complete";
            activeInteractions.set(interactionId, interaction);
            completeAnalysis(activeInteractions, interactionId, notify);
          }
        }
      }
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] }
  );
}
