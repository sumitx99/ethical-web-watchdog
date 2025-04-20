
// Background script initialization for extension
// The TypeScript version is in src/background.ts which will be compiled to this location
console.log("Ethical Web Watchdog background service initialized");

// Create icon in proper format
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
