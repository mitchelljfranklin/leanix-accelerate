const FEATURE_LIST = [
  { key: "dataExport", label: "Data Export", desc: "Export table data as JSON and Excel" },
  { key: "printExport", label: "Print Export", desc: "Export documents via browser print dialog" },
  { key: "documentsExport", label: "Documents Export", desc: "Export document lists (Architecture Decisions) to Excel" },
  { key: "diagramDetails", label: "Diagram Details", desc: "One-click button to open Diagram Details on diagram pages" },
  { key: "updateNotification", label: "Update Notification", desc: "Show changelog when the extension is updated" },
  { key: "emojiPicker", label: "Emoji Picker", desc: "Add an emoji picker to rich-text editors" },
];

document.querySelector(".version").textContent = "v" + chrome.runtime.getManifest().version;

async function renderFeatureList() {
  const list = document.getElementById("featureList");
  list.innerHTML = "";

  const settings = await chrome.runtime.sendMessage({ type: "getSettings" });
  const features = settings?.features || {};

  FEATURE_LIST.forEach(({ key, label, desc }) => {
    const enabled = features[key] ?? false;

    const item = document.createElement("div");
    item.className = "feature-item";

    const info = document.createElement("div");
    info.className = "feature-info";

    const name = document.createElement("span");
    name.className = "feature-name";
    name.textContent = label;

    const detail = document.createElement("span");
    detail.className = "feature-desc";
    detail.textContent = desc;

    info.appendChild(name);
    info.appendChild(detail);

    const toggle = document.createElement("label");
    toggle.className = "toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = enabled;
    checkbox.addEventListener("change", async (event) => {
      await chrome.runtime.sendMessage({
        type: "updateFeature",
        feature: key,
        enabled: event.target.checked,
      });
    });
    const slider = document.createElement("span");
    slider.className = "slider";
    toggle.appendChild(checkbox);
    toggle.appendChild(slider);

    item.appendChild(info);
    item.appendChild(toggle);
    list.appendChild(item);
  });
}

document.getElementById("openOptions").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById("refreshPage").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) chrome.tabs.reload(tab.id);
  window.close();
});

renderFeatureList();
