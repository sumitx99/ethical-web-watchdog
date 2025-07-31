
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

// Establish a connection with the background script
function connectToBackground() {
  chrome.runtime.sendMessage({ type: "content_script_ready" })
    .catch(error => {
      console.warn("Failed to connect to background script:", error);
      // Retry after a delay
      setTimeout(connectToBackground, 2000);
    });
}

// Try to connect immediately and then retry if needed
connectToBackground();

// Also set up a periodic check just in case
setInterval(connectToBackground, 30000);
