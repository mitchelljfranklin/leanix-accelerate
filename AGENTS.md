# AGENTS

## What this is

LeanIX Accelerate — a Chrome MV3 extension that injects export, print, and productivity UI into `*.leanix.net` / `*.leanix.com`. It is entirely client-side: no backend, no test suite, no CI.

## Commands

```bash
npm install     # Node >= 18 (dev tooling only)
npm run lint    # ESLint over src/ — the only automated check
npm run build   # bundle content scripts + write dist/*.zip for Chrome/Edge/Firefox
```

- No Prettier CLI: `eslint-config-prettier` only switches off formatting rules. Do not run `prettier`.
- Verification is manual: lint + build, reload the unpacked extension, then exercise the feature on a real LeanIX page.
- `npm run build` is required after editing any bundled file (everything in `CONTENT_ORDER`). It regenerates `src/content/content-bundle.js`, which is gitignored — edit the sources, never the bundle.

## Build and loading model (most common trap)

- `manifest.json` loads only `src/library/xlsx.full.min.js` (registers `window.XLSX`), then `src/content/content-bundle.js`, then `src/content/leanix.css`. Individual feature files are **not** in the manifest.
- `scripts/build.js` concatenates the files in `CONTENT_ORDER` into one string and runs esbuild (`format: "iife"`, `target: "es2015"`). So all bundled files share one top-level scope.
- To add a feature file, add it to `CONTENT_ORDER` in `scripts/build.js` **before `index.js`** — not to `manifest.json`.
- `README.md`'s Contribute section is stale on this point: it says to add the script to the manifest, says "6 registration files", and points to `src/shared/xlsx.full.min.js` (actual path: `src/library/`). Trust `scripts/build.js`.
- Build staging happens in the OS temp dir. Output: `dist/leanix-extension-{chrome,edge,firefox}.zip` (gitignored). Firefox gets `browser_specific_settings.gecko` injected.

## Shared globals (order matters)

Bundled files are not modules. These must stay top-level `var` and appear earlier in `CONTENT_ORDER` than their users:

`FEATURE_DEFAULTS`, `DEFAULT_SETTINGS`, `SettingsStore`, `DOMUtils`, `ModalUtils`, `EMOJI_CATEGORIES`

- Do not add new free-standing globals. Put shared state on `window.__leanixFeatures__`.
- `.eslintrc.json` disables `no-undef`; when adding a shared var, also add it to `varsIgnorePattern` in `no-unused-vars`.
- Some files are `"use strict"` (`modal.js`, `update-notification.js`): never assign without `var`/`let`/`const`.
- `src/library/` and `content-bundle.js` are eslint-ignored. Vendor code is not bundled or edited.

## Feature wiring

- Each feature registers `window.__leanixFeatures__.<key> = { init: function (DOM, settings) { ... } }`; `DOM` is `DOMUtils`.
- `src/content/index.js` calls `init` only for keys listed in its `featureOrder` whose value is truthy in `settings.features`.
- SPA pattern: handle the target if already present, then `MutationObserver` on `document.body`. Features that hide/show with viewport use `IntersectionObserver` too. Always guard `node.matches`, and dedupe buttons with `getElementById` or a per-container class check.
- Menu toggling uses an explicit boolean (`menuOpen`). `element.style.display` reflects only inline styles, so never use it to test visibility when CSS classes control display.
- Every export/download action starts with `DOMUtils.showToast(...)`.
- Preserve working DOM/observer logic verbatim when refactoring; subtle timing and selector behavior breaks easily.

## Adding or removing a feature — 7 code touchpoints

1. `src/content/features/<name>.js`
2. `scripts/build.js` → `CONTENT_ORDER` (before `index.js`)
3. `src/content/index.js` → `featureOrder`
4. `src/background/service-worker.js` → default `features` object
5. `src/shared/storage.js` → `FEATURE_DEFAULTS`
6. `src/popup/popup.js` → `FEATURE_LIST`
7. `src/options/options.js` → `FEATURE_LIST`

- `FEATURE_LIST` entries are `{ key, label, description }` (the property is `description`, not `desc`). Keep popup and options lists identical.
- An existing user's new feature defaults on because `SettingsStore.getAll()` merges stored values over `FEATURE_DEFAULTS`. The duplicate in `service-worker.js` matters for fresh installs — keep the two in sync.
- `src/content/features/emoji-data.js` is data only (defines `EMOJI_CATEGORIES`), not a registered feature.
- Update `README.md` Features and `docs/USERGUIDE.md` whenever features change; keep the README TOC in sync.

## Settings and storage

- One settings key in `chrome.storage.sync`: `leanix_extension_settings` = `{ features: {...}, theme: "default" }`.
- Flow: popup/options → `chrome.runtime.sendMessage` → `service-worker.js` → storage. Content scripts read once at page load via `SettingsStore.getAll()`.
- Settings never live-apply: `SettingsStore.onChange` only logs a "reload page" message. Users must reload (the popup has a Reload Page button).
- Options "reset" writes `DEFAULT_SETTINGS`; it does **not** call `chrome.storage.sync.clear()`.
- The update notification uses a second sync key, `leanix_last_seen_version`.
- No analytics, telemetry, tracking, or external requests. `README.md` makes this a public promise.

## Versions and release

- Bump `version` in **both** `package.json` and `manifest.json`; `scripts/build.js` reads package.json only for logging, so nothing syncs them.
- `update-notification.js` keys `CHANGELOG` by exact manifest version. Add an entry per release; a missing key silently falls back to the highest sorted key.
- The README version badge is also manual.
- Release order: bump versions → add `CHANGELOG` entry → `npm run build` → upload `dist/` zips.

## UI and code conventions

- All content-script CSS lives in `src/content/leanix.css` with `lx-ext-` prefixed classes. Popup/options use their own CSS files.
- Prefer classes over inline styles. Inline is acceptable for computed values (popover top/left, transforms); `ModalUtils` sets structural properties inline to resist LeanIX CSS. Use `ModalUtils` (`docs/MODAL.md`) instead of hand-rolled overlays.
- Keep code readable and unminified. Use descriptive names (no `el`, `e`, `cb`); `function` methods on feature objects, arrows fine elsewhere.

## LeanIX DOM map

- **Factsheet / inventory:** `lx-factsheets-table`; "Inventory Tools" lives in `.contentWrapper`; native export is `.menuItemWrapper`.
- **Document detail:** `lx-document-fields-form`, header `.headerUpdates`, blocks `.editorBlock` > `.formTitle`, dates `lx-document-date-select` > `.formTitle` + `p`, lists `lx-document-fact-sheet-list` > `tr.factSheetItem`, users `lx-document-users-list` > `.selectedUsers` > `.selectedUser`, close `button[aria-label="Close"]`.
- **Document list / Architecture Decisions:** `[data-testid="header-title"]`, button row `.tw-flex.tw-min-h-xxl` > `.tw-flex.tw-gap-xs.tw-text-nowrap`, table `table.table-hover`, rows `tr.documentsItem`, cells `.displayIdColumn`, `.titleColumn a`, `.statusColumn lx-documents-status-badge ui5-tag` (legacy pages: `.statusColumn lx-badge span`), `.ownerColumn lx-documents-list-creator span`, `.lastUpdatedColumn span`.
- **Diagrams:** `lx-diagrams-container`, edit anchor `#tourEditDiagram`, details entry `lx-option.showSettings li.option`.

## Tiptap / ProseMirror gotchas

- Rich editor structure: `lx-rich-text-editor` > `.ProseMirror` (`contenteditable`); toolbar is `lx-rich-text-editor-toolbar` > `.toolbar` (`.toolbarHidden` when unfocused).
- Clicking a toolbar button blurs the editor and resets ProseMirror's selection. Capture the cursor on `mousedown`, then insert via `view.state.tr.insertText(...)`; fall back to restoring the DOM `Range` + `document.execCommand("insertText")`.
- The emoji picker injects buttons directly on MutationObserver detection — do not gate on IntersectionObserver, because `.toolbarHidden` toolbars never intersect. Dedupe per toolbar, not with a single global id.
- The emoji popover ignores scroll for ~250ms after opening; focusing on open can fire a spurious scroll that would otherwise close it.

## Manual test cycle

1. `npm run lint` (and `npm run build` if a bundled file changed).
2. Reload the extension card in `chrome://extensions`.
3. Refresh the LeanIX page; content-script logs appear in the page console.

There is no way to run the extension end-to-end without a LeanIX tenant, so don't claim runtime verification you haven't done.
