(async function () {
  if (!DOMUtils.isLeanIXPage()) return;

  const settings = await SettingsStore.getAll();
  const pageType = DOMUtils.getPageType();

  console.log(`[LeanIX Extension] Initialized on page type: ${pageType}`);

  const features = window.__leanixFeatures__ || {};
  const featureOrder = [
    "dataExport",
    "printExport",
    "documentsExport",
    "diagramDetails",
    "updateNotification",
    "emojiPicker",
  ];

  for (const key of featureOrder) {
    if (settings.features[key] && features[key]) {
      try {
        features[key].init(DOMUtils, settings);
        console.log(`[LeanIX Extension] Feature "${key}" loaded`);
      } catch (err) {
        console.error(`[LeanIX Extension] Failed to load "${key}":`, err);
      }
    }
  }

  SettingsStore.onChange(async () => {
    console.log("[LeanIX Extension] Settings updated - reload page to apply");
  });
})();
