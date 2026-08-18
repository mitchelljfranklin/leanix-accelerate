var FEATURE_DEFAULTS = {
  dataExport: true,
  printExport: true,
  documentsExport: true,
  diagramDetails: true,
  updateNotification: true,
  emojiPicker: true,
};

var DEFAULT_SETTINGS = {
  features: FEATURE_DEFAULTS,
  theme: "default",
};

var SettingsStore = class {
  static STORAGE_KEY = "leanix_extension_settings";

  static async getAll() {
    const result = await chrome.storage.sync.get(this.STORAGE_KEY);
    const stored = result[this.STORAGE_KEY] || {};
    return {
      theme: stored.theme || DEFAULT_SETTINGS.theme,
      features: Object.assign({}, FEATURE_DEFAULTS, stored.features),
    };
  }

  static async getFeature(name) {
    const settings = await this.getAll();
    return settings.features[name] ?? FEATURE_DEFAULTS[name];
  }

  static async isFeatureEnabled(name) {
    return await this.getFeature(name);
  }

  static async setFeature(name, enabled) {
    const settings = await this.getAll();
    settings.features[name] = enabled;
    await chrome.storage.sync.set({ [this.STORAGE_KEY]: settings });
  }

  static async setAll(newSettings) {
    await chrome.storage.sync.set({ [this.STORAGE_KEY]: newSettings });
  }

  static async reset() {
    await chrome.storage.sync.set({ [this.STORAGE_KEY]: DEFAULT_SETTINGS });
  }

  static onChange(callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes[this.STORAGE_KEY]) {
        callback(changes[this.STORAGE_KEY].newValue);
      }
    });
  }
}
