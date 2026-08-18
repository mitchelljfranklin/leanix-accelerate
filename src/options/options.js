const FEATURE_LIST = [
  { key: "dataExport", label: "Data Export", desc: "Export table data as JSON and Excel" },
  { key: "printExport", label: "Print Export", desc: "Export documents via browser print dialog" },
  { key: "documentsExport", label: "Documents Export", desc: "Export document lists (Architecture Decisions) to Excel" },
  { key: "diagramDetails", label: "Diagram Details", desc: "One-click button to open Diagram Details on diagram pages" },
  { key: "updateNotification", label: "Update Notification", desc: "Show changelog when the extension is updated" },
  { key: "emojiPicker", label: "Emoji Picker", desc: "Add an emoji picker to rich-text editors" },
];

async function renderFeatureToggles() {
  const container = document.getElementById("featureToggles");
  const settings = await getSettings();
  const features = settings.features || {};

  container.innerHTML = "";
  FEATURE_LIST.forEach(({ key, label, desc }) => {
    const enabled = features[key] ?? false;

    const item = document.createElement("div");
    item.className = "toggle-row";

    const info = document.createElement("div");
    info.className = "toggle-info";
    info.innerHTML = `<strong>${label}</strong><span class="desc">${desc}</span>`;

    const toggle = document.createElement("label");
    toggle.className = "toggle";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = enabled;
    input.addEventListener("change", () => updateFeature(key, input.checked));
    const slider = document.createElement("span");
    slider.className = "slider";
    toggle.appendChild(input);
    toggle.appendChild(slider);

    item.appendChild(info);
    item.appendChild(toggle);
    container.appendChild(item);
  });
}

async function getSettings() {
  return await chrome.runtime.sendMessage({ type: "getSettings" }) || {};
}

async function updateFeature(feature, enabled) {
  await chrome.runtime.sendMessage({ type: "updateFeature", feature, enabled });
}

const RESET_RELOAD_DELAY_MS = 1000;

document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm("Reset all settings to defaults?")) return;
  await chrome.runtime.sendMessage({ type: "resetSettings" });
  document.getElementById("resetStatus").textContent = "Settings reset!";
  setTimeout(() => {
    document.getElementById("resetStatus").textContent = "";
    window.location.reload();
  }, RESET_RELOAD_DELAY_MS);
});

renderFeatureToggles();
