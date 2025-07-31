
// Background script initialization for extension
console.log("Ethical Web Watchdog background service initialized");

// Track which tabs have content scripts ready
const tabsWithContentScripts = new Set();

// Initialize extension icon and popup
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Listen for content script ready messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "content_script_ready" && sender.tab && sender.tab.id) {
    tabsWithContentScripts.add(sender.tab.id);
    console.log("Content script ready in tab:", sender.tab.id);
    sendResponse({ status: "acknowledged" });
  }
  
  if (message.type === "ping") {
    sendResponse({ status: "pong" });
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

// Export the sendMessageToContentScript function for use by other background scripts
window.sendMessageToContentScript = sendMessageToContentScript;
