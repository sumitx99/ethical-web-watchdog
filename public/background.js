
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
  }
  
  if (message.type === "open_detailed_view") {
    chrome.action.openPopup();
  }
  
  return true;
});

// Safe function to send messages to content scripts
function sendMessageToContentScript(tabId, message) {
  // Check if the tab is known to have a content script
  if (!tabsWithContentScripts.has(tabId)) {
    // Try to check connection first
    chrome.tabs.sendMessage(tabId, { type: "connection_check" }, response => {
      if (chrome.runtime.lastError) {
        console.log("Content script not ready in tab:", tabId);
        return;
      }
      
      // If we got a response, the content script is ready
      if (response) {
        tabsWithContentScripts.add(tabId);
        // Now send the actual message
        chrome.tabs.sendMessage(tabId, message).catch(error => {
          console.error("Failed to send message to content script:", error);
        });
      }
    });
  } else {
    // We already know the content script is ready
    chrome.tabs.sendMessage(tabId, message).catch(error => {
      console.error("Failed to send message to content script:", error);
      // If we get an error, remove the tab from our tracking
      tabsWithContentScripts.delete(tabId);
    });
  }
}

// Export the sendMessageToContentScript function for use by other background scripts
window.sendMessageToContentScript = sendMessageToContentScript;
