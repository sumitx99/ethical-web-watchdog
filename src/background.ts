/**
 * Background Service Worker - Orchestrates analysis and network monitoring
 */

import { setupWebRequestListeners, extractServiceName, generateInteractionId, findInteractionByUrl, isAIServiceRequest } from "./background/networkMonitoring";
import { analyzeInteraction, completeAnalysis, getAnalysisResult } from "./background/analysis";

// Known AI service endpoints (for export etc)
export const AI_SERVICE_ENDPOINTS = [
  // OpenAI/ChatGPT endpoints
  "api.openai.com",
  "chat.openai.com",
  // Anthropic/Claude endpoints
  "api.anthropic.com",
  "claude.ai",
  // Google AI endpoints
  "generativelanguage.googleapis.com", // Gemini API
  "bard.google.com",
  "gemini.google.com",
  // Meta AI endpoints
  "llama.meta.com",
  "meta-llama.ai",
  // Other common AI services
  "api.cohere.ai",
  "api.perplexity.ai"
];

// Track active AI interactions
const activeInteractions = new Map<string, any>();

// Safe function to send messages to content scripts
function notifyContentScript(tabId: number, message: any): void {
  // Check if tab exists first
  chrome.tabs.get(tabId).then(tab => {
    // Check if content script is ready by sending a ping
    chrome.tabs.sendMessage(tabId, { type: "ping" })
      .then(response => {
        // If we got a response, send the actual message
        chrome.tabs.sendMessage(tabId, message).catch(error => {
          console.warn("Secondary send failed:", error);
        });
      })
      .catch(error => {
        // Content script might not be ready yet, try injection
        console.log("Content script not ready in tab:", tabId, "Error:", error);
        // Wait a short time and try again - content script might be loading
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, message).catch(err => {
            console.warn("Retry send failed:", err);
          });
        }, 500);
      });
  }).catch(error => {
    console.warn("Tab not found:", tabId, "Error:", error);
  });
}

// Setup listeners for network requests
setupWebRequestListeners(activeInteractions, notifyContentScript);

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "content_script_ready":
      console.log("Content script ready in tab:", sender.tab?.id);
      sendResponse({ status: "acknowledged" });
      break;
    case "ping":
      // Respond to ping from content script
      sendResponse({ status: "pong" });
      break;
    case "get_active_interactions":
      sendResponse({
        interactions: Array.from(activeInteractions.values())
      });
      break;
    case "get_analysis_result":
      const result = getAnalysisResult(activeInteractions, message.interactionId);
      sendResponse({ result });
      break;
    case "test_ai_service":
      testAIService(message.url, message.testPrompts)
        .then(results => sendResponse({ results }))
        .catch(error => sendResponse({ error: error.message }));
      return true;
    default:
      sendResponse({ error: "Unknown message type" });
  }
});

// --- Misc Testing/Utility ---

// Testing AI service behavior
async function testAIService(url: string, testPrompts: string[]): Promise<any[]> {
  // This would send test prompts to the AI service
  // For now, simulate results
  const results = testPrompts.map(prompt => ({
    prompt,
    response: "Simulated response for testing",
    analysisResults: {
      bias: Math.random() * 100,
      safety: Math.random() * 100,
      quality: Math.random() * 100
    }
  }));

  return new Promise(resolve => {
    setTimeout(() => resolve(results), 1000);
  });
}

// Clean up old interactions periodically
setInterval(() => {
  const now = Date.now();
  const MAX_AGE = 30 * 60 * 1000; // 30 minutes

  for (const [id, interaction] of activeInteractions.entries()) {
    if (now - interaction.timestamp > MAX_AGE) {
      activeInteractions.delete(id);
    }
  }
}, 60 * 1000); // Check every minute
