
/**
 * Background Service Worker - Orchestrates analysis and network monitoring
 */

import { setupWebRequestListeners, extractServiceName, generateInteractionId, findInteractionByUrl, isAIServiceRequest } from "./background/networkMonitoring";
import { analyzeInteraction, completeAnalysis, getAnalysisResult } from "./background/analysis";

// Known AI service endpoints (for export etc)
export const AI_SERVICE_ENDPOINTS = [
  "api.openai.com",
  "api.anthropic.com",
  "api.cohere.ai",
  "api.perplexity.ai",
  "bard.google.com",
  "claude.ai"
];

// Track active AI interactions
const activeInteractions = new Map<string, any>();

// Setup listeners for network requests
setupWebRequestListeners(activeInteractions, notifyContentScript);

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
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

// Send msg to content script
function notifyContentScript(tabId: number, message: any): void {
  chrome.tabs.sendMessage(tabId, message).catch(error => {
    console.error("Failed to send message to content script:", error);
  });
}

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

