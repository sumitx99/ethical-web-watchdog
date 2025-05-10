
// Content script initialization for extension
console.log("Ethical Web Watchdog content script initialized");

// Setup message listener immediately
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  // Special case for ping - always respond immediately
  if (message.type === "ping") {
    sendResponse({ status: "pong" });
    return true;
  }
  
  // Send a response to confirm connection
  if (message.type === "connection_check") {
    sendResponse({ status: "connected" });
  }
  
  // Always send response to avoid "message port closed" errors
  sendResponse({ received: true });
  // Allow async response
  return true;
});

// Function to detect AI sites based on URL pattern
function detectAISiteByURL() {
  const url = window.location.href.toLowerCase();
  
  // More specific URL checks for common AI platforms
  if (url.includes('chat.openai.com') || url.includes('platform.openai.com')) {
    console.log('Detected OpenAI/ChatGPT site by URL');
    return { detected: true, service: "OpenAI" };
  }
  
  if (url.includes('claude.ai') || url.includes('anthropic.com')) {
    console.log('Detected Anthropic/Claude site by URL');
    return { detected: true, service: "Anthropic" };
  }
  
  if (url.includes('bard.google.com') || 
      url.includes('gemini.google.com') ||
      url.includes('labs.google.com/gemini')) {
    console.log('Detected Google Bard/Gemini site by URL');
    return { detected: true, service: "Google Gemini" };
  }
  
  if (url.includes('meta.ai') || url.includes('llama.meta.com')) {
    console.log('Detected Meta AI site by URL');
    return { detected: true, service: "Meta AI" };
  }

  if (url.includes('perplexity.ai')) {
    console.log('Detected Perplexity AI site by URL');
    return { detected: true, service: "Perplexity" };
  }
  
  return { detected: false, service: null };
}

// Establish a connection with the background script
function connectToBackground() {
  chrome.runtime.sendMessage({ type: "content_script_ready" })
    .catch(error => {
      console.warn("Failed to connect to background script:", error);
      // Retry after a delay
      setTimeout(connectToBackground, 2000);
    });
}

// Check for common AI service integrations with improved selectors
function detectAIElements() {
  // First check URL-based detection which is more reliable
  const urlDetection = detectAISiteByURL();
  if (urlDetection.detected) {
    return reportDetection(true, [urlDetection.service]);
  }

  // More comprehensive selectors for detecting AI elements
  const aiSignatures = [
    // OpenAI / ChatGPT signatures
    { selector: "div[class*='openai']", service: "OpenAI" },
    { selector: "div[class*='gpt']", service: "OpenAI" },
    { selector: "div[class*='chatgpt']", service: "OpenAI" },
    { selector: "[aria-label*='ChatGPT']", service: "OpenAI" },
    { selector: "img[alt*='ChatGPT']", service: "OpenAI" },
    { selector: "svg[aria-label*='ChatGPT']", service: "OpenAI" },
    { selector: ".logo-text", service: "OpenAI" }, // OpenAI logo text
    
    // Anthropic / Claude signatures
    { selector: "div[class*='anthropic']", service: "Anthropic" },
    { selector: "div[class*='claude']", service: "Anthropic" },
    { selector: "[aria-label*='Claude']", service: "Anthropic" },
    { selector: "img[alt*='Claude']", service: "Anthropic" },
    { selector: ".claude-logo", service: "Anthropic" },
    { selector: "[data-testid*='claude']", service: "Anthropic" },
    
    // Google Bard / Gemini signatures
    { selector: "div[class*='bard']", service: "Google Gemini" },
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
  const detectedServices = new Set();

  // Text content-based detection (more reliable for some sites)
  const pageText = document.body.innerText;
  if (pageText.match(/\bChatGPT\b|\bGPT-4\b|\bGPT-3\.5\b|\bOpenAI\b/i)) {
    detectedServices.add("OpenAI");
    foundAIElements = true;
    console.log('Detected OpenAI site by text content');
  }
  
  if (pageText.match(/\bClaude\b|\bAnthropic\b/i)) {
    detectedServices.add("Anthropic");
    foundAIElements = true;
    console.log('Detected Anthropic site by text content');
  }
  
  if (pageText.match(/\bGemini\b|\bGoogle AI\b|\bBard\b/i)) {
    detectedServices.add("Google Gemini");
    foundAIElements = true;
    console.log('Detected Google AI site by text content');
  }

  // Element-based detection
  for (const signature of aiSignatures) {
    try {
      const elements = document.querySelectorAll(signature.selector);
      if (elements.length > 0) {
        console.log(`AI detection: Found ${signature.service} elements using selector ${signature.selector}`);
        foundAIElements = true;
        detectedServices.add(signature.service);
      }
    } catch (e) {
      console.error(`Error checking selector ${signature.selector}:`, e);
    }
  }

  return reportDetection(foundAIElements, Array.from(detectedServices));
}

function reportDetection(hasAIElements, detectedServices) {
  // Update page info
  const pageInfo = {
    hasAIElements: hasAIElements,
    detectedAIServices: detectedServices,
    activeInteractions: []
  };
  
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
  if (hasAIElements) {
    showAIDetectionIndicator(detectedServices);
  }
  
  return pageInfo;
}

// Create and show a small indicator when AI is detected
function showAIDetectionIndicator(detectedServices) {
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

  // Add an AI icon and list detected services
  const servicesList = detectedServices.length > 0 
    ? detectedServices.join(', ')
    : 'AI Service';
    
  indicator.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
      <path d="M7 10v3"></path>
      <path d="M12 10v3"></path>
      <path d="M17 10v3"></path>
    </svg>
    <span>${servicesList} Detected</span>
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

// Monitor network requests to detect AI API calls (simplified here)
function monitorNetworkForAIAPIs() {
  // The background script handles most of the network monitoring
  // This is just a placeholder for future enhancements
  console.log("Network monitoring initialized");
}

// Establish connection status
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
      const pageInfo = detectAIElements();
      sendResponse({ pageInfo });
      return true;
  }

  // Always confirm receipt of messages
  sendResponse({ received: true });
  return true;
});

// Handle detected AI interactions
function handleAIInteraction(data) {
  // Add to active interactions
  const pageInfo = detectAIElements();
  pageInfo.activeInteractions = pageInfo.activeInteractions || [];
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
function updateAnalysisDisplay(data) {
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
function calculateOverallScore(analysis) {
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

// Try to connect immediately and then retry if needed
connectToBackground();

// Run detection when the page is loaded
window.addEventListener('load', () => {
  console.log("Page fully loaded, running AI detection");
  
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

// Re-run detection periodically but less frequently to avoid performance issues
setInterval(detectAIElements, 10000);

// Periodically check connection if not established
setInterval(() => {
  if (!connectionEstablished) {
    notifyBackgroundScriptReady();
  }
}, 10000);
