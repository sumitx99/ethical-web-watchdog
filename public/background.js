
// Background script initialization for extension
console.log("Ethical Web Watchdog background service initialized");

// Track which tabs have content scripts ready
const tabsWithContentScripts = new Set();

// Track AI services detected on each tab
const tabsWithAI = new Map();

// Initialize extension icon and popup
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Listen for content script ready messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message.type);
  
  if (message.type === "content_script_ready" && sender.tab && sender.tab.id) {
    tabsWithContentScripts.add(sender.tab.id);
    console.log("Content script ready in tab:", sender.tab.id);
    sendResponse({ status: "acknowledged" });
  }
  
  if (message.type === "ping") {
    sendResponse({ status: "pong" });
  }
  
  if (message.type === "ai_elements_detected" && sender.tab && sender.tab.id) {
    // Store detected AI services for this tab
    tabsWithAI.set(sender.tab.id, message.pageInfo);
    console.log("AI detected in tab:", sender.tab.id, message.pageInfo);
    
    // Update badge if AI was detected
    if (message.pageInfo.hasAIElements) {
      chrome.action.setBadgeText({
        text: "AI",
        tabId: sender.tab.id
      });
      chrome.action.setBadgeBackgroundColor({
        color: "#8B5CF6", // Purple color
        tabId: sender.tab.id
      });
    }
  }
  
  if (message.type === "open_detailed_view") {
    chrome.action.openPopup();
  }
  
  // Always send a response to avoid errors
  sendResponse({ received: true });
  return true;
});

// Safe function to send messages to content scripts
function sendMessageToContentScript(tabId, message) {
  // Try to check connection first
  chrome.tabs.sendMessage(tabId, { type: "ping" })
    .then(response => {
      // Connection confirmed, send the actual message
      chrome.tabs.sendMessage(tabId, message)
        .catch(error => {
          console.warn("Failed to send message after ping:", error);
        });
    })
    .catch(error => {
      console.warn("Ping failed, content script may not be ready:", error);
      
      // Add delay and retry once
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, message)
          .catch(retryError => {
            console.warn("Retry send failed:", retryError);
          });
      }, 500);
    });
}

// Listen for tab updates to reset badge
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    // Reset badge when navigating to a new page
    chrome.action.setBadgeText({
      text: "",
      tabId: tabId
    });
  }
});

// Export the sendMessageToContentScript function for use by other background scripts
window.sendMessageToContentScript = sendMessageToContentScript;
