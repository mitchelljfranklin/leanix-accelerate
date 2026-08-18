# AGENTS

## Project

LeanIX Accelerate — a Chrome Manifest V3 browser extension that injects custom export, print, and productivity features into the LeanIX enterprise architecture platform. Targets `https://*.leanix.net/*` and `https://*.leanix.com/*`.

**Repo:** `https://github.com/mitchelljfranklin/LeanIX-Accelerate`

## Files You Must Know About

| File | Purpose |
|---|---|
| `README.md` | Public-facing project documentation |
| `docs/USERGUIDE.md` | End-user guide for extension features |
| `docs/MODAL.md` | ModalUtils API reference and sample HTML output |
| `AGENTS.md` | This file — AI agent context and rules |
| `SECURITY.md` | Vulnerability reporting process |
| `LICENSE` | GPL v3.0 |
| `manifest.json` | Chrome extension manifest (MV3) — loads library + bundle |
| `package.json` | npm metadata, version, dev scripts |
| `.eslintrc.json` | ESLint configuration (browser + webextensions env, ES2022) |
| `.eslintignore` | Excludes `src/library/`, `dist/`, `node_modules/` from linting |
| `.gitignore` | Excludes `node_modules/`, `dist/`, `.DS_Store`, `*.zip`, `*.crx`, `*.pem`, `src/content/content-bundle.js` |

## Tech Stack

- **Runtime:** Chrome Manifest V3 browser extension
- **Bundler:** esbuild — content scripts bundled into a single IIFE via `npm run build`
- **JS Style:** ES5-compatible `function` declarations inside IIFEs, `const`/`let` for local variables, `var` for declarations shared across files in the bundle, no arrow functions in object methods
- **CSS:** Single file `src/content/leanix.css`, all classes prefixed `lx-ext-`, no inline styles
- **Lint:** ESLint + Prettier (`npm run lint`)
- **Node:** >= 18 (dev tooling only, not needed at runtime)
- **Vendor:** SheetJS 0.20.3 at `src/library/xlsx.full.min.js` (registers `window.XLSX`, loaded before the bundle)

## Active Features

| Feature | Key | File | Pages |
|---|---|---|---|
| Data Export | `dataExport` | `src/content/features/data-export.js` | Factsheet & Inventory |
| Print Export | `printExport` | `src/content/features/print-export.js` | Document detail |
| Documents Export | `documentsExport` | `src/content/features/documents-export.js` | Doc list / Architecture Decisions |
| Diagram Details | `diagramDetails` | `src/content/features/diagram-details.js` | Diagram pages — one-click Diagram Details shortcut |
| Update Notification | `updateNotification` | `src/content/features/update-notification.js` | All — shows changelog on version update |
| Emoji Picker | `emojiPicker` | `src/content/features/emoji-picker.js` (+ `emoji-data.js`) | Rich-text editors (edit mode) |

## How the Extension Works

```
npm run build
  → esbuild concatenates content scripts in CONTENT_ORDER into src/content/content-bundle.js
  → Wraps in IIFE: (() => { ... })()
  → src/content/content-bundle.js is gitignored (build artifact)

Page load → content scripts injected (in manifest order)
  → xlsx.full.min.js loads first (defines window.XLSX)
  → content-bundle.js loads second:
      1. FEATURE_DEFAULTS / DEFAULT_SETTINGS / SettingsStore defined (var)
      2. DOMUtils defined (var)
      3. ModalUtils defined (var)
      4. data-export.js (registers on window.__leanixFeatures__)
      5. print-export.js (registers on window.__leanixFeatures__)
      6. documents-export.js (registers on window.__leanixFeatures__)
      7. diagram-details.js (registers on window.__leanixFeatures__)
      8. update-notification.js (registers on window.__leanixFeatures__)
      9. index.js runs:
          a. Checks isLeanIXPage()
          b. Reads SettingsStore.getAll()
          c. Iterates featureOrder, calls init() on each enabled feature
```

Each feature sets up `MutationObserver` + `IntersectionObserver` to inject buttons that survive SPA navigation.

## Popup

Clicking the extension toolbar icon opens `src/popup/popup.html` with quick-access toggle switches for each feature. Changes save immediately to `chrome.storage.sync` via the service worker.

- **Toggle list** — rendered by `popup.js` from `FEATURE_LIST` (key, label, desc). Each toggle sends a `chrome.runtime.sendMessage({ type: "updateFeature", ... })` to the service worker.
- **Configure button** — calls `chrome.runtime.openOptionsPage()` to open the full settings page.
- **Reload Page button** — calls `chrome.tabs.reload()` on the active tab so settings take effect.

When adding a new feature toggle, add its `{ key, label, desc }` to `FEATURE_LIST` in `popup.js`.

## Options page

The full settings page at `src/options/options.html` renders feature toggles from the same `FEATURE_LIST` contract and provides a reset-to-defaults button.

- **Toggle rows** — rendered by `options.js` from `FEATURE_LIST`. Each toggle sends `updateFeature` messages to the service worker.
- **Reset button** — sends `resetSettings` message, which calls `chrome.storage.sync.clear()`, then reloads the options page after a 1-second delay.
- **Disclaimer** — the same disclaimer text from `README.md` is shown at the bottom.

The options page loads its own CSS (`options.css`), not `leanix.css`.

## Configuration flow

```
popup/options → chrome.runtime.sendMessage({ type: "updateFeature" })
    ↓
service-worker.js → chrome.storage.sync.set({ leanix_extension_settings })
    ↓
content/index.js → SettingsStore.getAll() → iterates features → calls init()
    ↓
content/features/*.js → reads settings passed to init(DOM, settings)
```

When settings change at runtime, `SettingsStore.onChange()` fires and logs a message prompting the user to reload the page. Settings do not take effect until the page is reloaded.

## Storage

A single key in `chrome.storage.sync`:

- **`leanix_extension_settings`** — user preferences object `{ features: {...}, theme: "default" }`. Read by `SettingsStore` in the bundle, written by the service worker in response to popup/options messages.

Default feature values are defined in two places (must stay in sync):
- `src/shared/storage.js` → `FEATURE_DEFAULTS`
- `src/background/service-worker.js` → `onInstalled` handler

## Adding a Feature — Full Checklist

When adding, changing, or removing a feature, you MUST update ALL of the following:

### Code files (7 files)

| # | File | Action |
|---|---|---|
| 1 | `src/content/features/<name>.js` | Create/delete the feature file |
| 2 | `scripts/build.js` | Add/remove from `CONTENT_ORDER` array (before `index.js`) |
| 3 | `src/content/index.js` | Add/remove key from `featureOrder` array |
| 4 | `src/background/service-worker.js` | Add/remove `featureName: true` from default `features` object |
| 5 | `src/shared/storage.js` | Add/remove `featureName: true` from `FEATURE_DEFAULTS` object |
| 6 | `src/popup/popup.js` | Add/remove entry from `FEATURE_LIST` array |
| 7 | `src/options/options.js` | Add/remove entry from `FEATURE_LIST` array |

### README & docs updates (ALWAYS REQUIRED)

| File | Section | What to update |
|---|---|---|
| `README.md` | `## ✨ Features` | Add/remove a feature card in the 2×2 table |
| `README.md` | `### Contents` | Add/remove link if you added a section |
| `README.md` | `## ❓ FAQ` | If feature changes behavior users might ask about |
| `docs/USERGUIDE.md` | Feature section | Add/update the feature's usage instructions, tips, and what-to-expect |
| `docs/USERGUIDE.md` | `## Troubleshooting` | If the feature introduces new failure modes |

### CSS (if needed)
- Add styles to `src/content/leanix.css` using `lx-ext-` prefix
- Document the new class in the CSS Classes Reference table in this file

### Feature file template
```js
window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  window.__leanixFeatures__.myFeature = {
    init: function (DOM, settings) {
      // Check for existing element, set up observers, inject button
    },

    addExportButton: function (DOM) {
      // Guard with document.getElementById to prevent duplicates
      // Use DOM.createElement with className for styling
      // Attach click handlers with addEventListener
    },

    // ... export methods
  };

  function createMenuOption(label, onClick) {
    var element = document.createElement("div");
    element.className = "lx-ext-menu-item";
    element.textContent = label;
    element.addEventListener("click", onClick);
    return element;
  }
})();
```

### SPA Navigation Pattern (required for every feature)
```js
init: function (DOM, settings) {
  var intersectionObserver = null;

  var observeTarget = function (el) {
    if (intersectionObserver) intersectionObserver.disconnect();
    intersectionObserver = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          // add button, show container
        }
      }
    });
    intersectionObserver.observe(el);
  };

  // Check existing
  var existing = document.querySelector("target-selector");
  if (existing) observeTarget(existing);

  // Watch for re-addition during SPA navigation
  var mutObserver = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches && node.matches("target-selector")) {
          observeTarget(node);
          return;
        }
        if (node.querySelectorAll) {
          var found = node.querySelector("target-selector");
          if (found) { observeTarget(found); return; }
        }
      }
    }
  });
  mutObserver.observe(document.body, { childList: true, subtree: true });
}
```

## Refactoring rules — preserve existing logic

When splitting, renaming, or moving code between files:
- **Copy-paste verbatim** — never rewrite or simplify complex logic during a refactor. Even if the code looks verbose or outdated, its behavior depends on subtle details (DOM event timing, CSS class interactions, MutationObserver callbacks, etc.) that are easy to break.
- **Verify before committing** — after any file split or rename, test the affected features on a LeanIX page to confirm they still work.
- **When in doubt, don't refactor** — a slightly messy but working file is better than a clean but broken one.

## Documentation — keep it in sync

When adding, removing, or renaming a script file:
- Update the **CONTENT_ORDER** in `scripts/build.js`
- Update the **Script responsibilities** references in this file
- Run `npm run build` to verify nothing is broken

When adding or removing a feature (even without script changes):
- Update the **README.md** Features section and table of contents
- Update the **docs/USERGUIDE.md** with a description of what the feature does and how users interact with it
- If the feature has a toggle, add it to `FEATURE_LIST` in `src/popup/popup.js` and `src/options/options.js`

When adding or removing a third-party library:
- Place it in `src/library/` (never bundle vendor code — only bundle code we create)
- Update the **manifest.json** content_scripts js array to include the library (before the bundle)
- Update the **Tech Stack** section (this file)
- Update the **README.md** if the library enables new capabilities

When documentation sections are added or removed:
- Update the **README.md** table of contents
- If the new section replaces or overlaps with existing content, remove the stale content to avoid duplication

When browser support changes:
- Update the **README.md** Supported Browsers table
- Update the **docs/USERGUIDE.md** Installation section if store links change

After every change:
- Re-read the files you edited and look for any stale or contradictory information they may now contain — fix it proactively
- If an old library, tool, or approach is no longer in use, remove all references to it from all `.md` files

When modifying the build script (`scripts/build.js`):
- If you change `CONTENT_ORDER`, verify that `var`-declared dependencies appear before the files that reference them
- If you change manifest structure (add/remove keys), update all three browser generators (Chrome, Edge, Firefox) in `scripts/build.js` to handle the new keys correctly

## Code style — human-readable formatting

All code must be written in a human-readable format — this applies equally to hand-written and AI-generated code. Avoid minified, obfuscated, or machine-optimized code in any source files.

The **only** minification or transformation happens in the build step (`npm run build`). All `.js`, `.css`, and `.html` files in `src/` must remain unminified and readable.

### Variable declarations within the bundle

The esbuild IIFE concatenates all content scripts into a single function scope. Top-level declarations that are referenced by OTHER files in the bundle **must** use `var`. This is the contract that makes cross-file references work inside the IIFE. Examples: `var SettingsStore`, `var DOMUtils`, `var ModalUtils`, `var FEATURE_DEFAULTS`, `var DEFAULT_SETTINGS`.

Top-level declarations used only within their own file **should** use `const` or `let` for clarity, but `var` is acceptable if the file already uses it consistently.

Never use implicit globals (assignment without `var`/`let`/`const`).

### No arrow functions in object methods

Use `function` declarations for object methods (consistent with ES5 compatibility target).

### CSS convention — `leanix.css` is the single stylesheet

All CSS rules for content scripts **must** be added to `src/content/leanix.css` using the `lx-ext-` prefix. Do **not**:
- Set inline `style=""` attributes on elements in HTML
- Set `element.style.*` or `element.style.cssText` in JavaScript (see exception below)
- Add `<style>` blocks to any HTML file

**Exception:** Modal elements (`ModalUtils`) set critical layout properties (position, display, z-index, background, border, box-shadow) as inline styles via JS to prevent LeanIX platform CSS from overriding them. Hover states and transitions remain in `leanix.css`.

Popup and options pages load their own separate CSS files (`popup.css`, `options.css`).

## DOM Utilities API

### `DOMUtils.createElement(tag, attrs, children)`
Creates an element with attributes and children.
```js
var btn = DOMUtils.createElement("button", {
  id: "my-btn",
  className: "lx-ext-btn",       // sets element.className
  textContent: "Click me",       // sets element.textContent
  onClick: function (e) { ... }, // adds click listener (onXxx → xxx)
  "data-foo": "bar"              // fallback: element.setAttribute
}, ["text child", anotherElement]);
```

### `DOMUtils.waitForElement(selector, timeout)`
Returns a Promise that resolves when the element appears in the DOM.
```js
DOMUtils.waitForElement(".my-class", 5000).then(function (el) { ... });
```

### `DOMUtils.isLeanIXPage()`
Returns true if the hostname matches `leanix.net` or `leanix.com`.

### `DOMUtils.getPageType()`
Returns `"factsheet"`, `"inventory"`, `"reports"`, `"dashboard"`, `"search"`, or `"other"`.

### `DOMUtils.showToast(message, duration)`
Shows a brief toast notification at the bottom-center of the viewport. Call this at the start of any export/download action so users know something is happening.
```js
DOMUtils.showToast("Preparing download…");      // 3s default
DOMUtils.showToast("Opening print…", 2000);      // custom 2s duration
```

## Modal Utilities API

### `ModalUtils.show(options)`
Creates and displays a modal. Returns the instance.

### `ModalUtils.create(options)`
Creates a modal without showing it.

```js
// Notification with single OK button
var modal = ModalUtils.show({
  title: "Export Complete",
  content: "Your file has been downloaded.",
  footer: {
    confirmText: "OK",
    onConfirm: function () { /* acknowledged */ }
  }
});

// Confirmation dialog
var modal = ModalUtils.show({
  title: "Confirm Delete",
  content: "This cannot be undone.",
  footer: {
    cancelText: "Cancel",
    confirmText: "Delete",
    confirmClass: "lx-ext-btn-danger",
    onCancel: function () { /* cleanup */ },
    onConfirm: function () {
      // return false to prevent auto-hide
    }
  }
});

// No footer (content only)
ModalUtils.show({
  title: "About",
  content: "Some informational text.",
  footer: false
});
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | string | `""` | Header title |
| `content` | string \| Element | — | Body content |
| `width` | string | `"600px"` | min-width and max-width |
| `closable` | bool | `true` | Show close (×) button |
| `footer` | bool \| object | `true` | `false` hides all buttons, object for custom config |
| `onClose` | function | — | Called on close button click |

### Footer object (`footer: { ... }`)

| Key | Type | Default | Description |
|---|---|---|---|
| `cancelText` | string | `"Cancel"` | Cancel button label |
| `confirmText` | string | `"OK"` | Confirm button label |
| `confirmClass` | string | — | Extra class on confirm button |
| `onCancel` | function | — | Cancel callback (always hides modal) |
| `onConfirm` | function | — | Confirm callback (hides unless returns `false`) |

### Instance methods

| Method | Description |
|---|---|
| `.show()` | Display modal |
| `.hide()` | Hide modal |
| `.destroy()` | Hide and remove from DOM |
| `.setTitle(text)` | Update header title |
| `.setContent(htmlOrElement)` | Replace body content |
| `.setConfirmText(text)` | Update confirm button label |
| `.setCancelText(text)` | Update cancel button label |
| `.setConfirmEnabled(bool)` | Enable/disable confirm button |
| `.getElement()` | Returns the modal `<div>` |

Full reference at `docs/MODAL.md`.

## Settings API

```js
SettingsStore.getAll()               // → { features: {...}, theme: "default" }
SettingsStore.getFeature("myFeat")   // → true/false
SettingsStore.isFeatureEnabled("x")  // → true/false
SettingsStore.setFeature("x", false) // → Promise
SettingsStore.setAll({...})          // → Promise
SettingsStore.reset()                // → Promise (restores defaults)
SettingsStore.onChange(callback)     // listens for storage changes
```

## CSS Classes Reference

| Class | Used by | Purpose |
|---|---|---|
| `.lx-ext-container-fixed` | data-export | Fixed bottom-right container (hidden by default) |
| `.lx-ext-container-inline` | print-export, documents-export, diagram-details | Inline container for header button groups |
| `.lx-ext-btn` | data-export | Floating export button (14px, shadow) |
| `.lx-ext-btn-inline` | print-export, documents-export | Header button matching lx-button height (13px, 32px) |
| `.lx-ext-btn-icon` | diagram-details | Square icon-only button (32×32, light border) matching native toolbar style |
| `.lx-ext-menu` | all three | Dropdown menu base (hidden by default) |
| `.lx-ext-menu-up` | data-export | Menu opens upward (button at bottom of viewport) |
| `.lx-ext-menu-down` | print-export, documents-export | Menu opens downward (button in header) |
| `.lx-ext-menu-item` | all three | Clickable menu option with hover highlight |
| `.lx-ext-toast` | all | Download notification toast (slide-up, auto-dismiss) |
| `.lx-ext-modal-overlay` | modal.js, update-notification | Full-screen backdrop (fixed, flex, centered) |
| `.lx-ext-modal` | modal.js, update-notification | White dialog container with shadow |
| `.lx-ext-modal-close` | modal.js | Close (×) button, absolute top-right |
| `.lx-ext-modal-header` | modal.js | Header row with bottom border |
| `.lx-ext-modal-title` | modal.js | Title heading (18px, weight 600) |
| `.lx-ext-modal-content` | modal.js | Scrollable body area (max-height 60vh) |
| `.lx-ext-modal-footer` | modal.js | Right-aligned button group with top border |
| `.lx-ext-btn-cancel` | modal.js | Light/outline cancel footer button |
| `.lx-ext-btn-confirm` | modal.js | Primary confirm footer button (#5c6ac4) |

## Critical Rules

### Menu visibility toggling
```js
// CORRECT — use a boolean flag to track state
var menuOpen = false;

button.addEventListener("click", function () {
  if (menuOpen) {
    menu.style.display = "none";
    menuOpen = false;
  } else {
    menu.style.display = "block";
    menuOpen = true;
  }
});

// WRONG — element.style.display only reflects INLINE styles, not CSS classes
// If display:none is in a CSS class, style.display returns "" not "none"
if (menu.style.display === "none") { ... }  // BROKEN with CSS classes
```

**Critical:** `element.style.display` reads only inline style values. When `display: none` comes from a CSS class (not an inline `style=` attribute), `element.style.display` is `""` (empty string). Never use `style.display` to check visibility — use a boolean `menuOpen` flag instead.

### Button injection guard
Always check for existing button ID before injecting:
```js
if (document.getElementById("lx-ext-my-btn")) return;
```

### No inline styles
All visual styling goes in `leanix.css`. Use `className` not `style`/`style.cssText`.

**Exception:** Modal elements (`ModalUtils`) set critical layout properties (position, display, z-index, background, border, box-shadow) as inline styles via JS to prevent LeanIX platform CSS from overriding them. Hover states and transitions remain in `leanix.css`. If adding a new modal UI element, follow the same pattern — set structural position/appearance via inline styles, keep hover/transition/animation in the CSS file.

### The `matches` guard
When checking `MutationObserver` added nodes, guard `node.matches`:
```js
if (node.matches && node.matches("selector")) { ... }
```
Text nodes and comment nodes don't have `.matches`.

### Always toast on export
Every export/download action MUST call `DOMUtils.showToast()` as its first line so users get immediate visual feedback.
```js
exportJSON: function (pageType) {
  DOMUtils.showToast("Preparing download\u2026");
  // ... export logic
}
```

### No data collection
This extension runs entirely in-browser. Never add analytics, telemetry, tracking, or external requests. The Privacy & Data section of README.md makes public promises about this. Do not violate them.

## SheetJS Usage

Library is at `src/library/xlsx.full.min.js`, registers as `window.XLSX`. Loaded as a separate content script before the bundle.

```js
var wb = XLSX.utils.book_new();
var ws = XLSX.utils.aoa_to_sheet([["Col1", "Col2"], ["a", "b"]]);
ws["!cols"] = [{ wch: 20 }, { wch: 40 }];  // column widths
XLSX.utils.book_append_sheet(wb, ws, "SheetName");
var buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
var blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
// ... download via createObjectURL + <a> click
```

## Build Script

`scripts/build.js` does everything:

1. Reads `package.json` for the version number
2. Concatenates content scripts in `CONTENT_ORDER` and passes them through esbuild (`transformSync`, `format: "iife"`, `target: "es2015"`) to produce `src/content/content-bundle.js`
3. Creates staging directories (in system temp) and copies `manifest.json`, `icons/`, `src/`, and `dist/` into each
4. Generates browser-specific manifests from the base `manifest.json`:
   - **Chrome** — copied as-is (MV3, includes `update_url`)
   - **Edge** — identical to Chrome
   - **Firefox** — adds `browser_specific_settings.gecko` with `id: "leanix-extension@example.com"` and `strict_min_version: "128.0"`
5. Packages each into `dist/leanix-extension-{Browser}.zip`

Output:
- `src/content/content-bundle.js` — single IIFE bundle of all content scripts (~50 KB), gitignored
- `dist/leanix-extension-chrome.zip`
- `dist/leanix-extension-edge.zip`
- `dist/leanix-extension-firefox.zip`

`dist/` is gitignored. The version is read from `package.json` and injected into all manifests. To release:
1. Bump `version` in `package.json` and `manifest.json`
2. Run `npm run build`
3. Upload the zips from `dist/` to the respective stores

## Commands

```bash
npm run lint          # Run ESLint on src/
npm run lint:fix      # Auto-fix lint issues
npm run build         # Bundle content scripts + create store-ready zips
```

## Testing

There is no test suite. To test, load the extension unpacked in `chrome://extensions` (Developer Mode) pointing to the project root, then visit a LeanIX page.

After code changes:
1. Run `npm run build` (if you changed any file in `CONTENT_ORDER`)
2. Reload the extension on the `chrome://extensions` card
3. Refresh the LeanIX page

To see content-script console output, inspect the LeanIX page — content scripts log to the main page console in Chrome. Bundle errors include source file comments from esbuild.

## Rebuild scope

- Changes to any file in `CONTENT_ORDER` (shared libs, feature files, `index.js`) → must run `npm run build`
- Changes to `manifest.json` → must run `npm run build` (for store zips; for local dev, reload the extension)
- Changes to `src/library/xlsx.full.min.js` → no rebuild needed (loaded directly by manifest)
- Changes to popup (`src/popup/*`), options (`src/options/*`), or background (`src/background/*`) → no rebuild needed
- Changes to `src/content/leanix.css` → no rebuild needed (loaded directly by manifest)

## LeanIX DOM Reference

### Factsheet / Inventory table pages
- Table element: `lx-factsheets-table` (custom element)
- Inventory Tools button: `.contentWrapper` with `.textContent` span containing "Inventory Tools"
- Native Excel export: `.menuItemWrapper` containing "Export to Excel" text

### Document detail pages
- Document fields: `lx-document-fields-form`
- Header bar: `.headerUpdates`
- Editor blocks: `.editorBlock` with `:scope > .formTitle`
- Rich text editor: `lx-rich-text-editor` > `.ProseMirror`
- Date fields: `lx-document-date-select` > `.formTitle` + `p`
- Fact sheet lists: `lx-document-fact-sheet-list` > `tr.factSheetItem`
- User lists: `lx-document-users-list` > `.selectedUser`
- Close button: `button[aria-label="Close"]`

### Architecture Decisions / document list pages
- Page title: `[data-testid="header-title"]`
- Button container: `.tw-flex.tw-min-h-xxl` > `.tw-flex.tw-gap-xs.tw-text-nowrap`
- Table: `table.table-hover`
- Rows: `tr.documentsItem`
- Columns: `.displayIdColumn`, `.titleColumn a`, `.statusColumn lx-badge span`, `.ownerColumn lx-documents-list-creator span`, `.lastUpdatedColumn span`

## README Sections Reference

When updating the README, these are the sections in order:

1. Logo + Title + Tagline
2. Badge row (version, manifest, license, browsers)
3. Store badges (Chrome, Edge, Firefox "coming soon")
4. Star history link
5. Table of Contents
6. Why Accelerate? (before/after comparison)
7. Features (2×2 card table)
8. Quick Start (clone + install + load steps)
9. Supported Browsers (version table)
10. Commands (lint, build)
11. Contribute (ways, workflow, feature template, code conventions, project map, PR checklist)
12. FAQ (collapsible questions)
13. Privacy & Data
14. Contributors (table with avatars)
15. Security (link to SECURITY.md)
16. Disclaimer
17. License

## User Guide Sections Reference

When updating `docs/USERGUIDE.md`, these are the sections in order:

1. Getting Started (install, popup overview)
2. Feature: Data Export (where, what, how, tips)
3. Feature: Print Export (where, what, included content, tips)
4. Feature: Documents Export (where, what, columns, tips)
5. Full Settings Page
6. Troubleshooting
7. Privacy

Any new feature gets its own section between #4 and #5 above, following the same template pattern (where it works, what it does, how to use with option table, what's included, tips).
