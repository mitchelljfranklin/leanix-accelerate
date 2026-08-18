const DEFAULT_SETTINGS = {
  features: {
    dataExport: true,
    printExport: true,
    documentsExport: true,
    diagramDetails: true,
    updateNotification: true,
    emojiPicker: true,
  },
  theme: "default",
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.sync.set({ leanix_extension_settings: DEFAULT_SETTINGS });
    console.log("[LeanIX Extension] Installed with default settings");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "getSettings":
      chrome.storage.sync.get("leanix_extension_settings", (result) => {
        sendResponse(result.leanix_extension_settings || {});
      });
      return true;

    case "updateFeature":
      chrome.storage.sync.get("leanix_extension_settings", (result) => {
        const settings = result.leanix_extension_settings || {};
        settings.features[message.feature] = message.enabled;
        chrome.storage.sync.set({ leanix_extension_settings: settings }, () => {
          sendResponse({ success: true });
        });
      });
      return true;

    case "resetSettings":
      chrome.storage.sync.set({ leanix_extension_settings: DEFAULT_SETTINGS }, () => {
        chrome.runtime.sendMessage({ type: "reload" });
        sendResponse({ success: true });
      });
      return true;

    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /leanix\.(net|com)/i.test(tab.url)) {
    console.log(`[LeanIX Extension] LeanIX page loaded: ${tab.url}`);
  }
});
