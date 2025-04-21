
// Content script initialization for extension
console.log("Ethical Web Watchdog content script initialized");

// Setup message listener immediately
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  // Send a response to confirm connection
  if (message.type === "connection_check") {
    sendResponse({ status: "connected" });
  }
  
  // Allow async response
  return true;
});

// Let the background script know the content script is ready
chrome.runtime.sendMessage({ type: "content_script_ready" });
