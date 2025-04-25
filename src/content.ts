/**
 * Content Script
 * Runs in the context of web pages to detect AI interactions
 */

// Store information about the current page
let pageInfo = {
  hasAIElements: false,
  detectedAIServices: [] as string[],
  activeInteractions: [] as string[]
};

// Check for common AI service integrations
function detectAIElements(): void {
  const aiSignatures = [
    // OpenAI / ChatGPT signatures
    { selector: "div[class*='openai']", service: "OpenAI" },
    { selector: "div[class*='gpt']", service: "OpenAI" },
    { selector: "div[class*='chatgpt']", service: "OpenAI" },
    { selector: "[aria-label*='ChatGPT']", service: "OpenAI" },
    { selector: "img[alt*='ChatGPT']", service: "OpenAI" },
    { selector: "svg[aria-label*='ChatGPT']", service: "OpenAI" },
    { selector: "text[contains(., 'ChatGPT')]", service: "OpenAI" },
    
    // Anthropic / Claude signatures
    { selector: "div[class*='anthropic']", service: "Anthropic" },
    { selector: "div[class*='claude']", service: "Anthropic" },
    { selector: "[aria-label*='Claude']", service: "Anthropic" },
    { selector: "img[alt*='Claude']", service: "Anthropic" },
    
    // Google Bard / Gemini signatures
    { selector: "div[class*='bard']", service: "Google Bard" },
    { selector: "div[class*='gemini']", service: "Google Gemini" },
    { selector: "[aria-label*='Gemini']", service: "Google Gemini" },
    { selector: "img[alt*='Gemini']", service: "Google Gemini" },
    { selector: "div[class*='google-ai']", service: "Google Gemini" },
    { selector: "div[class*='duet-ai']", service: "Google Gemini" },
    
    // Meta AI signatures
    { selector: "div[class*='llama']", service: "Meta AI" },
    { selector: "div[class*='meta-ai']", service: "Meta AI" },
    { selector: "[aria-label*='Llama']", service: "Meta AI" },
    { selector: "img[alt*='Llama']", service: "Meta AI" }
  ];

  let foundAIElements = false;
  const detectedServices = new Set<string>();

  for (const signature of aiSignatures) {
    const elements = document.querySelectorAll(signature.selector);
    if (elements.length > 0) {
      console.log(`AI detection: Found ${signature.service} elements using selector ${signature.selector}`);
      foundAIElements = true;
      detectedServices.add(signature.service);
    }
  }

  // Check URLs for AI services
  const currentUrl = window.location.href;
  if (currentUrl.includes("chat.openai.com")) {
    detectedServices.add("OpenAI");
    foundAIElements = true;
  }
  if (currentUrl.includes("claude.ai")) {
    detectedServices.add("Anthropic");
    foundAIElements = true;
  }
  if (currentUrl.includes("bard.google.com") || currentUrl.includes("gemini.google.com")) {
    detectedServices.add("Google Gemini");
    foundAIElements = true;
  }
  if (currentUrl.includes("llama.meta.com") || currentUrl.includes("meta.ai")) {
    detectedServices.add("Meta AI");
    foundAIElements = true;
  }

  // Search for specific text patterns in the page content
  const pageText = document.body.innerText;
  if (pageText.match(/ChatGPT|GPT-4|GPT-3.5/i)) {
    detectedServices.add("OpenAI");
    foundAIElements = true;
  }
  if (pageText.match(/Claude|Anthropic/i)) {
    detectedServices.add("Anthropic");
    foundAIElements = true;
  }
  if (pageText.match(/Gemini|Google AI|Bard/i)) {
    detectedServices.add("Google Gemini");
    foundAIElements = true;
  }
  if (pageText.match(/Llama|Meta AI/i)) {
    detectedServices.add("Meta AI");
    foundAIElements = true;
  }

  // Monitor network requests to detect AI API calls
  monitorNetworkForAIAPIs();

  // Update page info
  pageInfo.hasAIElements = foundAIElements;
  pageInfo.detectedAIServices = Array.from(detectedServices);
  
  // Log detection results
  console.log("AI Detection results:", {
    hasAIElements: pageInfo.hasAIElements, 
    detectedServices: pageInfo.detectedAIServices
  });

  // Send detection results to background script
  chrome.runtime.sendMessage({
    type: "ai_elements_detected",
    pageInfo
  }).catch(error => {
    console.warn("Failed to send detection results to background script:", error);
  });

  // Show UI indicators if AI is detected
  if (foundAIElements) {
    showAIDetectionIndicator();
  }
}

// Monitor network requests to detect AI API calls
function monitorNetworkForAIAPIs(): void {
  // This would require intercepting network calls
  // For a content script, we're limited in what we can do directly
  // The background script will handle most of this
  
  // For demonstration, we'll just add some known AI services
  // that might be used on the current page
  const knownAIServices = [
    "OpenAI", "Anthropic", "Cohere", "Perplexity"
  ];
  
  // Randomly select one or two services for demo purposes
  // In a real extension, this would be based on actual network detection
  const randomIndex = Math.floor(Math.random() * knownAIServices.length);
  if (Math.random() > 0.5) {
    pageInfo.detectedAIServices.push(knownAIServices[randomIndex]);
  }
}

// Create and show a small indicator when AI is detected
function showAIDetectionIndicator(): void {
  // Only add the indicator if it doesn't already exist
  if (document.getElementById('ai-watchdog-indicator')) return;

  const indicator = document.createElement('div');
  indicator.id = 'ai-watchdog-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(139, 92, 246, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  `;

  // Add an AI icon
  indicator.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
      <path d="M7 10v3"></path>
      <path d="M12 10v3"></path>
      <path d="M17 10v3"></path>
    </svg>
    <span>AI Detected</span>
  `;

  // Add hover and click effects
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'translateY(-3px)';
    indicator.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
  });

  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'translateY(0)';
    indicator.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  });

  indicator.addEventListener('click', () => {
    // Open the extension popup or detailed view
    chrome.runtime.sendMessage({ type: "open_detailed_view" }).catch(error => {
      console.warn("Failed to send open_detailed_view message:", error);
    });
  });

  document.body.appendChild(indicator);
}

// Establish a reliable connection status
let connectionEstablished = false;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Special case for ping - always respond immediately
  if (message.type === "ping") {
    sendResponse({ status: "pong" });
    connectionEstablished = true;
    return true;
  }

  // Handle other message types
  switch (message.type) {
    case "ai_interaction_detected":
      handleAIInteraction(message);
      break;
    case "analysis_update":
    case "analysis_complete":
      updateAnalysisDisplay(message);
      break;
    case "get_page_info":
      sendResponse({ pageInfo });
      return true;
  }

  // Always confirm receipt of messages
  sendResponse({ received: true });
  return true;
});

// Handle detected AI interactions
function handleAIInteraction(data: any): void {
  // Add to active interactions
  pageInfo.activeInteractions.push(data.interactionId);
  
  // Update the indicator to show active analysis
  const indicator = document.getElementById('ai-watchdog-indicator');
  if (indicator) {
    indicator.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
        <path d="M7 10v3"></path>
        <path d="M12 10v3"></path>
        <path d="M17 10v3"></path>
      </svg>
      <span>Analyzing ${data.service}...</span>
    `;
    indicator.style.backgroundColor = 'rgba(14, 165, 233, 0.9)';
  }
}

// Update the UI with analysis results
function updateAnalysisDisplay(data: any): void {
  // Find the indicator
  const indicator = document.getElementById('ai-watchdog-indicator');
  if (!indicator) return;
  
  // If analysis is complete
  if (data.type === "analysis_complete") {
    const analysis = data.analysis;
    const overallScore = calculateOverallScore(analysis);
    
    // Determine color based on overall score
    let color = 'rgba(34, 197, 94, 0.9)'; // Good (green)
    if (overallScore < 60) {
      color = 'rgba(234, 88, 12, 0.9)'; // Warning (orange)
    }
    if (overallScore < 40) {
      color = 'rgba(239, 68, 68, 0.9)'; // Poor (red)
    }
    
    indicator.style.backgroundColor = color;
    
    // Update content
    indicator.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
        <path d="M7 10v3"></path>
        <path d="M12 10v3"></path>
        <path d="M17 10v3"></path>
      </svg>
      <span>AI Score: ${Math.round(overallScore)}/100</span>
    `;
  }
}

// Calculate overall score from analysis components
function calculateOverallScore(analysis: any): number {
  if (!analysis) return 0;
  
  const scores = [
    analysis.biasScore?.score || 0,
    analysis.privacyScore?.score || 0,
    analysis.safetyScore?.score || 0,
    analysis.transparencyScore?.score || 0
  ];
  
  // Calculate average
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

// Notify the background script that the content script is ready
function notifyBackgroundScriptReady() {
  chrome.runtime.sendMessage({ type: "content_script_ready" })
    .then(response => {
      console.log("Background script acknowledged content script ready:", response);
      connectionEstablished = true;
    })
    .catch(error => {
      console.warn("Failed to notify background script that content script is ready:", error);
      // Retry after a short delay
      setTimeout(notifyBackgroundScriptReady, 1000);
    });
}

// Run detection when the page is loaded
window.addEventListener('load', () => {
  // Notify background script that content script is ready
  notifyBackgroundScriptReady();
  
  // Then start detection after a brief delay to let the page fully render
  setTimeout(detectAIElements, 1500);
  
  // Set up a mutation observer to detect dynamically loaded AI content
  const observer = new MutationObserver(mutations => {
    // Check if we should rerun detection based on DOM changes
    if (mutations.some(mutation => mutation.addedNodes.length > 0)) {
      detectAIElements();
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
});

// Re-run detection periodically but less frequently to avoid performance issues
setInterval(detectAIElements, 10000);

// Periodically check connection if not established
setInterval(() => {
  if (!connectionEstablished) {
    notifyBackgroundScriptReady();
  }
}, 10000);
