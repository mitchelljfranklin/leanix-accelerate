<p align="center">
  <img src="docs/LeanIXAccSlim.png" alt="LeanIX Accelerate" width="128" />
</p>

<h1 align="center">LeanIX Accelerate</h1>

<p align="center">
  Unlock new levels of efficiency and productivity — the ultimate browser extension for LeanIX users.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-v1.1.0-blue" />
  <img src="https://img.shields.io/badge/manifest-V3-4c1" />
  <img src="https://img.shields.io/badge/license-GPL%203.0-brightgreen" />
  <img src="https://img.shields.io/badge/Chrome-supported-4285F4?logo=googlechrome&logoColor=white" />
  <img src="https://img.shields.io/badge/Edge-supported-0078D7?logo=microsoftedge&logoColor=white" />
  <!-- <img src="https://img.shields.io/badge/Firefox-supported-FF7139?logo=firefox&logoColor=white" /> -->
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/leanix-accelerate/pmhnpiejimiakkgoblfebilojahemgmh"><img src="https://img.shields.io/badge/Chrome-Install-4285F4?logo=googlechrome&logoColor=white" /></a>
  <a href="https://chromewebstore.google.com/detail/leanix-accelerate/pmhnpiejimiakkgoblfebilojahemgmh"><img src="https://img.shields.io/badge/Edge-Install-0078D7?logo=microsoftedge&logoColor=white" /></a>
  <!-- <a href="https://addons.mozilla.org"><img src="https://img.shields.io/badge/Firefox-coming%20soon-FF7139?logo=firefox&logoColor=white" /></a> -->
</p>

<p align="center">
  <img src="https://img.shields.io/chrome-web-store/users/pmhnpiejimiakkgoblfebilojahemgmh?color=4285F4&logo=googlechrome&logoColor=white" />
  <img src="https://img.shields.io/chrome-web-store/rating/pmhnpiejimiakkgoblfebilojahemgmh?color=4285F4&logo=googlechrome&logoColor=white" />
  <img src="https://img.shields.io/chrome-web-store/v/pmhnpiejimiakkgoblfebilojahemgmh?color=4285F4&logo=googlechrome&logoColor=white" />
</p>

<p align="center">
  <a href="https://star-history.com/#mitchelljfranklin/LeanIX-Accelerate&Date"><img src="https://img.shields.io/badge/star%20history-view-5c6ac4" /></a>
</p>

---

### Contents

- [Why Accelerate?](#why-accelerate)
- [Features](#-features)
- [User Guide](#-user-guide)
- [Quick Start](#-quick-start)
- [Supported Browsers](#-supported-browsers)
- [Commands](#-commands)
- [Contribute](#-contribute)
- [FAQ](#-faq)
- [Privacy & Data](#-privacy--data)
- [Contributors](#-contributors)
- [Security](#-security)
- [Disclaimer](#-disclaimer)
- [License](#-license)

---

## Why Accelerate?<a name="why-accelerate"></a>

LeanIX is powerful, but everyday workflows involve repetitive clicks — exporting tables, printing documents, downloading the same data over and over. **LeanIX Accelerate** injects one-click export buttons exactly where you need them, saving you time on every interaction.

| Without Accelerate | With Accelerate |
|---|---|
| Navigate menus → find export → click → wait → repeat | One click, done |
| Copy-paste data manually into spreadsheets | Auto-generate `.xlsx` or `.json` |
| Screenshot or print-preview dance for documents | Formatted print with one button |

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>📊 Data Export</h3>
      <p><strong>Factsheet & Inventory pages</strong></p>
      <p>Floating export button appears automatically. Export table data as <strong>JSON</strong> or trigger the native <strong>Excel</strong> export in one click.</p>
    </td>
    <td width="50%">
      <h3>📄 Document Export</h3>
      <p><strong>Document detail pages</strong></p>
      <p>Export button injected into the document header. <strong>Print to PDF</strong> with full formatting, or download a structured <strong>Excel workbook</strong> with all sections, dates, fact sheet lists, and users.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📋 Document List Export</h3>
      <p><strong>Architecture Decisions & list pages</strong></p>
      <p>Export button in the page header. Downloads the visible document list — <strong>ID, Title, Status, Creator, Last Updated</strong> — as a clean <code>.xlsx</code> spreadsheet.</p>
    </td>
    <td width="50%">
      <h3>⚙️ Smart Controls</h3>
      <p><strong>Popup & full settings page</strong></p>
      <p>Toggle any feature on/off from the extension popup. Full settings panel with reset-to-defaults. Buttons survive page navigation — no reloads needed.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔔 Update Notification</h3>
      <p><strong>All pages</strong></p>
      <p>See what's new after each update. A changelog modal appears automatically when the extension is updated, showing the latest features and fixes. Only shown once per version.</p>
    </td>
    <td width="50%">
      <h3>💬 Modal Dialogs</h3>
      <p><strong>Notifications & confirmations</strong></p>
      <p>Clean, platform-matching modal dialogs for notifications, confirmations, and guided actions — with a dark backdrop, close button, and configurable footer buttons.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🗂️ Diagram Details</h3>
      <p><strong>Diagram pages</strong></p>
      <p>A gear icon button next to the Edit button. Opens the Diagram Details panel in one click — no need to open the More dropdown first. Matches the settings icon used in the dropdown.</p>
    </td>
    <td width="50%">
      <h3>😀 Emoji Picker</h3>
      <p><strong>Rich-text editors (edit mode)</strong></p>
      <p>An emoji button in every rich-text toolbar. Opens a searchable, categorized emoji picker that inserts emoji straight into your document at the cursor.</p>
    </td>
  </tr>
</table>

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 📖 User Guide

Need help using the extension? The **[User Guide](docs/USERGUIDE.md)** covers every feature in detail:

- Step-by-step instructions for each export tool
- What's included in Excel and Print exports
- Troubleshooting common issues
- Tips for getting the most out of each feature

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🚀 Quick Start

```bash
git clone https://github.com/mitchelljfranklin/LeanIX-Accelerate.git
cd LeanIX-Accelerate
npm install
```

Then:
1. Open `chrome://extensions` in Chrome or Edge
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** → select the project folder
4. Navigate to your LeanIX instance — buttons appear automatically

<!-- > **Firefox users:** Run `npm run build` and load `dist/leanix-extension-firefox.zip` via `about:debugging`. -->

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🌐 Supported Browsers

| Browser | Minimum Version | Store |
|---|---|---|
| Google Chrome | 88+ | [Chrome Web Store](https://chromewebstore.google.com/detail/leanix-accelerate/pmhnpiejimiakkgoblfebilojahemgmh) |
| Microsoft Edge | 88+ | [Chrome Web Store](https://chromewebstore.google.com/detail/leanix-accelerate/pmhnpiejimiakkgoblfebilojahemgmh) |
<!-- | Mozilla Firefox | 128+ | [Firefox Add-ons](https://addons.mozilla.org) *(coming soon)* | -->

All browsers require Manifest V3 support. The extension is tested and built for <!-- all three --> platforms via `npm run build`.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🛠 Commands

| Command | What it does |
|---|---|
| `npm run lint` | Run ESLint across `src/` |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run build` | Create `.zip` files for <!-- Chrome, Edge & Firefox --> stores |

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🤝 Contribute

LeanIX Accelerate is built for practitioners, by practitioners. Found a bug? Have a feature idea? Know a page that needs an export button? Contributions are welcome.

### Ways to contribute
- **Report a bug** — [Open an issue](https://github.com/mitchelljfranklin/LeanIX-Accelerate/issues/new) describing what broke and where
- **Request a feature** — Describe the workflow friction and what button/export would solve it
- **Submit a PR** — Fork, branch, code, and open a pull request (see below)
- **Share selectors** — Know the DOM structure of a LeanIX page that needs love? Drop it in an issue with the relevant HTML

### Submitting a great feature request

Help us build the right thing faster. When opening a feature request, include:

```
**Which LeanIX page?**
e.g. Factsheet view, Inventory, Reports, Architecture Decisions

**What are you trying to do?**
e.g. Export all rows to CSV, print a formatted report, copy IDs

**How do you do it today?**
e.g. Manually copy each row, take a screenshot, export via the ... menu

**Relevant page URL structure**
e.g. /factsheet/... or /documents/...

**Optional: DOM snippet**
Share the HTML of the area where the button should appear — this
dramatically speeds up development.
```

### Development workflow

```bash
git clone https://github.com/mitchelljfranklin/LeanIX-Accelerate.git
cd LeanIX-Accelerate
npm install
```

Load the extension unpacked in Chrome/Edge:
1. `chrome://extensions` → **Developer mode** on
2. **Load unpacked** → select the project folder
3. Make changes → click the reload icon on the extension card
4. Refresh your LeanIX page

#### AI Usage

While I believe AI can be a powerful tool for development — and I personally use AI assistants to help manage documentation and reviews — it must remain a tool in the hands of a capable developer. In this project, **you are the pilot**; you are responsible for coding, confirming, and refining your contributions.

To help those using AI tools, I've created an [AGENTS.md](AGENTS.md) file specifically for your assistants to follow. Please ensure your agent adheres to these guidelines, as non-compliant code will be rejected regardless of how well it functions.

Most importantly, please ensure you **fully understand the code you are submitting**. A "black box" approach where AI generates code that the human contributor doesn't understand is not permitted here.

### Adding a new feature

Every feature follows the same pattern. Here's the checklist:

**1. Create the feature file** at `src/content/features/<name>.js`

```js
window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  window.__leanixFeatures__.myFeature = {
    init: function (DOM, settings) {
      // MutationObserver + IntersectionObserver to survive SPA nav
    },
    addButton: function (DOM) {
      // Guard with document.getElementById to prevent duplicates
      // Use DOM.createElement with className, never inline styles
    },
    myExportAction: function () {
      DOMUtils.showToast("Starting export\u2026");   // toast for user feedback
      // ... export logic
    },
  };
})();
```

**2. Register in 6 files:**

| File | Add |
|---|---|
| `manifest.json` | Script to `content_scripts[0].js` array (before `index.js`) |
| `src/content/index.js` | Key to `featureOrder` array |
| `src/background/service-worker.js` | `featureName: true` to default `features` object |
| `src/shared/storage.js` | `featureName: true` to `FEATURE_DEFAULTS` |
| `src/popup/popup.js` | Entry to `FEATURE_LIST` array |
| `src/options/options.js` | Entry to `FEATURE_LIST` array |

**3. Add CSS** to `src/content/leanix.css` using the `lx-ext-` prefix. No inline styles.

**4. Lint before committing:** `npm run lint`

### Code conventions
- **JS style**: `function` keyword, `const`/`let`, IIFEs — no arrow functions in object methods
- **CSS**: All styles in `leanix.css` with `lx-ext-` prefix — zero inline styles
- **SPA resilience**: Every feature MUST use `MutationObserver` + `IntersectionObserver` (see existing features for the pattern)
- **Button guards**: Check `document.getElementById()` before injecting
- **Menu toggling**: Use a boolean `menuOpen` flag — never check `element.style.display` (it only reads inline styles, not CSS class values)
- **Export feedback**: Call `DOMUtils.showToast("message")` at the start of every export action so users see immediate confirmation
- **Vendor library**: SheetJS (`XLSX`) at `src/shared/xlsx.full.min.js` for `.xlsx` generation

### Project as a map

```
LeanIX-Accelerate/
│
├── manifest.json              ← Extension identity, permissions, script order
├── package.json               ← npm scripts: lint, build
│
├── src/
│   ├── background/
│   │   └── service-worker.js  ← Installs defaults, routes messages, logs pages
│   │
│   ├── shared/
│   │   ├── storage.js         ← SettingsStore class — get/set feature toggles
│   │   ├── dom-utils.js       ← DOMUtils — createElement, waitForElement, etc.
│   │   ├── modal.js           ← ModalUtils — configurable modal dialogs
│   │   └── xlsx.full.min.js   ← SheetJS for .xlsx file generation
│   │
│   ├── content/
│   │   ├── index.js           ← Entry point — loads features in order
│   │   ├── leanix.css         ← ALL extension UI styles (lx-ext- prefix)
│   │   └── features/
│   │       ├── data-export.js            ← Facts table → JSON / native Excel
│   │       ├── print-export.js           ← Document → Print / Excel workbook
│   │       ├── documents-export.js       ← Doc list → Excel spreadsheet
│   │       └── update-notification.js    ← Changelog modal on version update
│   │
│   ├── popup/                 ← Extension icon click → toggle features
│   └── options/               ← Full settings page → toggle + reset
│
├── icons/                     ← 16/48/128px extension icons
├── scripts/build.js           ← npm run build → dist/*.zip for stores
└── docs/                      ← Screenshots, logo, MODAL.md, store listing assets
```

### Before you PR
- [ ] `npm run lint` passes
- [ ] Feature survives SPA navigation (navigate away and back — button reappears)
- [ ] Button has unique `id`, guarded with `document.getElementById`
- [ ] No inline styles — everything in `leanix.css`
- [ ] Registered in all 7 registration files
- [ ] Tested on Chrome and Edge

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## ❓ FAQ

<details>
<summary><strong>Why don't the buttons appear on my page?</strong></summary>

Each feature activates only on specific LeanIX pages. Make sure the feature is toggled on in the popup or settings. If it is, the target DOM element (table, form, etc.) may have changed — please [open an issue](https://github.com/mitchelljfranklin/LeanIX-Accelerate/issues/new).
</details>

<details>
<summary><strong>Does this work on self-hosted / on-premise LeanIX?</strong></summary>

Yes, as long as your instance is accessible at a `*.leanix.net` or `*.leanix.com` domain. If your instance uses a different domain, we can add it — just open an issue with the domain pattern.
</details>

<details>
<summary><strong>Will this slow down my LeanIX pages?</strong></summary>

No. The extension uses lightweight DOM observers that only activate when the target element appears. No polling, no heavy computation. The total JS payload is under 1 MB (mostly the SheetJS library for Excel export).
</details>

<details>
<summary><strong>How do I update the extension?</strong></summary>

If installed from a store, updates happen automatically. If loaded unpacked, pull the latest changes and click the reload icon on the extension card in `chrome://extensions`.
</details>

<details>
<summary><strong>What is the changelog popup that appeared after updating?</strong></summary>

That's the Update Notification feature. It shows a one-time modal with a list of what's new after each version update. Once you dismiss it, it won't appear again until the next update. You can disable this feature in the popup or settings page.
</details>

<details>
<summary><strong>Can I request a new feature or page integration?</strong></summary>

Absolutely. Use the [feature request template](#submitting-a-great-feature-request) above and open an issue.
</details>

<details>
<summary><strong>Is my data safe?</strong></summary>

100%. The extension runs entirely in your browser. No data is collected, transmitted, or stored externally. See [Privacy & Data](#-privacy--data) for details.
</details>

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🔒 Privacy & Data

**LeanIX Accelerate does not collect, transmit, or store any data from your LeanIX environment.** Period.

- The extension runs entirely in your browser. No data ever leaves your machine.
- No analytics, no telemetry, no tracking, no external servers.
- No third-party services are contacted at runtime (the only external requests made are those already present on your LeanIX page).
- The only data stored is your feature-toggle preferences, saved locally via `chrome.storage.sync` so they follow you across browsers you're signed into.
- Permission `activeTab` and host permissions for `*.leanix.net` / `*.leanix.com` are required to inject the UI buttons onto LeanIX pages.

You can verify all of this yourself — the source is 100% open and right here.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 👥 Contributors

Thanks to everyone who has contributed to making LeanIX Accelerate better!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/mitchelljfranklin"><img src="https://github.com/mitchelljfranklin.png" width="80px" alt=""/><br /><sub><b>Mitch Franklin</b></sub></a><br /><sub>💻 📖 🚧</sub></td>
  </tr>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Want to see your name here? Check out the [Contribute](#-contribute) section.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🔐 Security

Found a vulnerability? Please **do not** open a public issue. Instead, see [SECURITY.md](SECURITY.md) for responsible disclosure.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## ⚠️ Disclaimer

LeanIX Accelerate is an independent, community-built extension. SAP LeanIX has no association with this extension and does not sanction its use. SAP LeanIX does not offer any guarantees or warranties in relation to its functionality. Use at your own discretion.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 📄 License

[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)
