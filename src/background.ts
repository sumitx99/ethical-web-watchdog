
/**
 * Background Service Worker
 * Handles AI detection and analysis in the background
 */

// Known AI service endpoints
const AI_SERVICE_ENDPOINTS = [
  "api.openai.com",
  "api.anthropic.com",
  "api.cohere.ai",
  "api.perplexity.ai",
  "bard.google.com",
  "claude.ai"
];

// Track active AI interactions
let activeInteractions = new Map<string, any>();

// Listen for network requests to AI services
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (isAIServiceRequest(details.url)) {
      // Capture the request data
      const interactionId = generateInteractionId();
      activeInteractions.set(interactionId, {
        timestamp: Date.now(),
        url: details.url,
        tabId: details.tabId,
        requestData: details.requestBody,
        status: "pending"
      });

      // Notify content script of the AI interaction
      notifyContentScript(details.tabId, {
        type: "ai_interaction_detected",
        interactionId,
        service: extractServiceName(details.url)
      });

      // Begin analysis pipeline
      analyzeInteraction(interactionId);
    }
    return { cancel: false };
  },
  { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
  ["requestBody"]
);

// Listen for network responses from AI services
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (isAIServiceRequest(details.url)) {
      // Find the corresponding interaction
      const interactionId = findInteractionByUrl(details.url);
      if (interactionId) {
        // Update with response data
        const interaction = activeInteractions.get(interactionId);
        if (interaction) {
          interaction.responseData = details;
          interaction.status = "complete";
          activeInteractions.set(interactionId, interaction);

          // Continue analysis with response data
          completeAnalysis(interactionId);
        }
      }
    }
  },
  { urls: ["<all_urls>"], types: ["xmlhttprequest"] }
);

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "get_active_interactions":
      sendResponse({
        interactions: Array.from(activeInteractions.values())
      });
      break;
    case "get_analysis_result":
      const result = getAnalysisResult(message.interactionId);
      sendResponse({ result });
      break;
    case "test_ai_service":
      testAIService(message.url, message.testPrompts)
        .then(results => sendResponse({ results }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Indicates async response
    default:
      sendResponse({ error: "Unknown message type" });
  }
});

// Helper Functions

function isAIServiceRequest(url: string): boolean {
  return AI_SERVICE_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function extractServiceName(url: string): string {
  for (const endpoint of AI_SERVICE_ENDPOINTS) {
    if (url.includes(endpoint)) {
      return endpoint.split('.')[0]; // Return the service name (e.g., "openai")
    }
  }
  return "unknown";
}

function generateInteractionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function findInteractionByUrl(url: string): string | null {
  for (const [id, interaction] of activeInteractions.entries()) {
    if (interaction.url === url) {
      return id;
    }
  }
  return null;
}

function notifyContentScript(tabId: number, message: any): void {
  chrome.tabs.sendMessage(tabId, message).catch(error => {
    console.error("Failed to send message to content script:", error);
  });
}

// Analysis Functions

function analyzeInteraction(interactionId: string): void {
  const interaction = activeInteractions.get(interactionId);
  if (!interaction) return;

  // Initial analysis based on request data
  const analysisResult = {
    biasScore: calculateInitialBiasScore(interaction),
    privacyScore: calculatePrivacyScore(interaction),
    safetyScore: null, // Need response data
    transparencyScore: calculateTransparencyScore(interaction),
    timestamp: Date.now(),
    status: "partial"
  };

  // Store initial analysis result
  interaction.analysis = analysisResult;
  activeInteractions.set(interactionId, interaction);

  // Notify UI of initial analysis
  notifyContentScript(interaction.tabId, {
    type: "analysis_update",
    interactionId,
    analysis: analysisResult
  });
}

function completeAnalysis(interactionId: string): void {
  const interaction = activeInteractions.get(interactionId);
  if (!interaction || !interaction.analysis) return;

  // Complete analysis with response data
  const fullAnalysis = {
    ...interaction.analysis,
    safetyScore: calculateSafetyScore(interaction),
    status: "complete"
  };

  // Update final analysis scores based on all data
  fullAnalysis.biasScore = recalculateBiasScore(interaction, fullAnalysis.biasScore);
  
  // Store complete analysis
  interaction.analysis = fullAnalysis;
  activeInteractions.set(interactionId, interaction);

  // Notify UI of complete analysis
  notifyContentScript(interaction.tabId, {
    type: "analysis_complete",
    interactionId,
    analysis: fullAnalysis
  });
}

function getAnalysisResult(interactionId: string): any {
  const interaction = activeInteractions.get(interactionId);
  return interaction?.analysis || null;
}

// Analysis Scoring Functions

function calculateInitialBiasScore(interaction: any): any {
  // Simplified bias detection based on request data
  // In a real extension, this would be much more sophisticated
  const biasScore = Math.random() * 100; // Placeholder
  return {
    score: biasScore,
    level: getBiasLevel(biasScore),
    details: "Initial bias assessment based on prompt analysis"
  };
}

function calculatePrivacyScore(interaction: any): any {
  // Analyze what personal data might be sent to the AI service
  const privacyScore = Math.random() * 100; // Placeholder
  return {
    score: privacyScore,
    level: getPrivacyLevel(privacyScore),
    details: "Assessment of personal data shared with AI service"
  };
}

function calculateSafetyScore(interaction: any): any {
  // Analyze response for harmful content
  const safetyScore = Math.random() * 100; // Placeholder
  return {
    score: safetyScore,
    level: getSafetyLevel(safetyScore),
    details: "Analysis of potential harmful content in AI response"
  };
}

function calculateTransparencyScore(interaction: any): any {
  // Assess how transparent the AI service is
  const transparencyScore = Math.random() * 100; // Placeholder
  return {
    score: transparencyScore,
    level: getTransparencyLevel(transparencyScore),
    details: "Evaluation of AI service transparency"
  };
}

function recalculateBiasScore(interaction: any, initialScore: any): any {
  // Refine bias score based on response data
  const adjustedScore = Math.min(100, Math.max(0, initialScore.score + (Math.random() * 20 - 10)));
  return {
    ...initialScore,
    score: adjustedScore,
    level: getBiasLevel(adjustedScore),
    details: "Complete bias assessment based on request and response analysis"
  };
}

// Helper functions for scoring levels

function getBiasLevel(score: number): string {
  if (score > 80) return "high";
  if (score > 50) return "medium";
  return "low";
}

function getPrivacyLevel(score: number): string {
  if (score > 80) return "good";
  if (score > 50) return "moderate";
  return "poor";
}

function getSafetyLevel(score: number): string {
  if (score > 80) return "safe";
  if (score > 50) return "moderate";
  return "unsafe";
}

function getTransparencyLevel(score: number): string {
  if (score > 80) return "transparent";
  if (score > 50) return "moderate";
  return "opaque";
}

// Testing AI service behavior
async function testAIService(url: string, testPrompts: string[]): Promise<any[]> {
  // This would send test prompts to the AI service
  // In a real extension, this would make actual requests
  // For now, we'll simulate the results
  
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
