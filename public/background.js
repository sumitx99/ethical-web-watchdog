
// Background script initialization for extension
console.log("Ethical Web Watchdog background service initialized");

// Initialize extension icon and popup
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "open_detailed_view") {
    chrome.action.openPopup();
  }
  return true;
});
