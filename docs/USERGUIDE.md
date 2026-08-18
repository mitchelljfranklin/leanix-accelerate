# LeanIX Accelerate — User Guide

A practical walkthrough of every feature in the extension.

---

## Getting Started

### Installing

**From a browser store** (once published):
1. Visit the Chrome Web Store, Edge Add-ons, or Firefox Add-ons
2. Click **Add to Browser**
3. The extension icon appears in your toolbar

**Developer / manual install:**
1. Clone the repo: `git clone https://github.com/mitchelljfranklin/LeanIX-Accelerate.git`
2. Open `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode** (toggle top-right)
4. Click **Load unpacked** → select the project folder
5. The extension icon appears in your toolbar

### The Popup

Click the extension icon in your browser toolbar to open the popup:

- **Feature toggles** — Turn each feature on or off with the slider switches. Changes take effect on the next page load.
- **Configure** — Opens the full settings page in a new tab.
- **Reload Page** — Refreshes the current LeanIX tab to apply feature toggle changes.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## Feature: Data Export

**Where it works:** Factsheet and Inventory pages where a data table is visible.

**What it does:** Adds a floating Export button in the bottom-right corner of the page.

### How to use

1. Navigate to any Factsheet or Inventory page in LeanIX
2. Look for the **⬇ Export** button in the bottom-right corner
3. Click it to open the dropdown menu:

| Option | What happens |
|---|---|
| **Export as JSON** | Downloads a `.json` file with all visible fields/rows |
| **Export to Excel** | Triggers the native LeanIX Excel export (same as clicking Inventory Tools → Export to Excel) |

### Tips
- Press `Escape` while the menu is open to dismiss it, or click anywhere outside
- The button appears and disappears automatically as you navigate — no need to reload
- If the button doesn't appear, make sure the feature is toggled **on** in the popup

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## Feature: Print Export

**Where it works:** Document detail pages (when editing or viewing a document with form fields).

**What it does:** Adds an Export button in the document header bar, next to the **Edit** and **Close** buttons.

### How to use

1. Open any document in LeanIX (e.g. Architecture Decision, Application Review)
2. Look for the **Export** button in the header bar
3. Click it to open the dropdown:

| Option | What happens |
|---|---|
| **Export to Print** | Opens a formatted print preview with all document sections — rich text, dates, fact sheet lists, and user assignments. Use your browser's **Save as PDF** option to keep a copy. |
| **Export to Excel** | Downloads a `.xlsx` file with all document sections organized into labeled rows. |

### What's included

- **Editor blocks** — Full rich text content from every section
- **Date fields** — Any date selectors in the document
- **Fact sheet lists** — Linked fact sheets with their labels and names
- **User lists** — Assigned users (Contact, Executive Sponsor, etc.)

Empty fields show as "—" so you know what's missing at a glance.

### Tips
- For PDF output: in the print dialog, select **Save as PDF** as the destination
- The Excel file uses three columns: Field, Value, and Detail — easy to review or import
- The button appears as soon as the document form loads — if you switch documents via SPA navigation, it handles it automatically

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## Feature: Documents Export

**Where it works:** Document list pages (Architecture Decisions, Business Ideas, Application Reviews, etc.).

**What it does:** Adds an Export button in the page header button group, next to the **New Decision** button.

### How to use

1. Navigate to any document list page (e.g. Architecture Decisions)
2. Look for the **⬇ Export** button at the top, next to **New Decision**
3. Click it and select **Export to Excel**

The exported `.xlsx` file contains:

| Column | Source |
|---|---|
| ID | The document display ID (e.g. BCAPR-17) |
| Title | The document title from the title link |
| Status | The status badge text (Draft, Proposed, Accepted, Rejected) |
| Creator | The creator's name |
| Last Updated | The last modified date |

### Tips
- All rows currently visible in the table are exported — scroll or change page size to include more
- If the button doesn't appear, the page may not have a `table.table-hover` element — check with your admin
- The button matches the height of the native LeanIX buttons for a clean look

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## Feature: Diagram Details

**Where it works:** Diagram pages where `lx-diagrams-container` is present.

**What it does:** Adds a gear cog icon button next to the Edit button in the diagram toolbar, matching the settings icon from the More dropdown. One click opens the Diagram Details panel directly, bypassing the More dropdown entirely.

### How to use

1. Navigate to any diagram page in LeanIX
2. Look for the gear icon next to the Edit button
3. Click it — the More dropdown is triggered automatically, then Diagram Details is selected

### Tips
- The gear icon only appears when a diagram is loaded on the page
- If the icon doesn't appear, make sure the feature is toggled **on** in the popup and that a diagram is visible

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## Feature: Emoji Picker

**Where it works:** Rich-text editors (e.g. the Project / Initiative Name field on Architecture Decisions) when the document is in **edit mode**.

**What it does:** Adds an emoji button (😀) to the end of every rich-text editor toolbar. Clicking it opens a searchable, categorized emoji picker.

### How to use

1. Open a document in LeanIX and switch to **edit mode**
2. Click into a rich-text field (one with the bold/italic/table toolbar)
3. Click the **😀** button at the end of the toolbar
4. Type to search, or browse the categories, then click an emoji to insert it at the cursor

| Control | What it does |
|---|---|
| **Search box** | Filters the list live by name or shortcode |
| **Category headers** | Group emoji into Smileys, People, Animals, Food, Travel, Activities, Objects, Symbols, Flags |
| **Emoji button** | Inserts the emoji at the current cursor position |

### Tips
- Emoji are inserted as plain text, so they save and reload with the document like any other character
- The button only appears in edit mode — it's hidden while viewing a document
- If you don't see the button, make sure the feature is toggled **on** in the popup

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## Full Settings Page

Access the settings page by clicking **Configure** in the popup, or via `chrome://extensions` → LeanIX Accelerate → **Extension options**.

- **Feature toggles** — Same on/off switches as the popup, with descriptions
- **Reset to Defaults** — Reverts all features to their default enabled state and resets any stored settings

Settings are synced across browsers via `chrome.storage.sync` if you're signed into Chrome/Edge.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## Troubleshooting

### A button isn't appearing

1. Click the extension icon → make sure the feature toggle is **on** (blue slider)
2. Click **Reload Page** in the popup
3. Verify you're on the right page type (see each feature's "Where it works" above)
4. If it still doesn't appear, the target element may have changed — [report it](https://github.com/mitchelljfranklin/LeanIX-Accelerate/issues/new)

### The button appeared but then vanished

This is normal SPA behavior — the button hides when you navigate away and reappears when you return to the relevant page. If it doesn't come back, reload the page.

### Nothing happens when I click Export

Check that popups aren't blocked (Print Export opens a new window for the print dialog). For Excel export, check your browser's download settings — the file should appear in your default downloads folder.

### The extension isn't loading at all

1. Go to `chrome://extensions` → find LeanIX Accelerate
2. Check for errors on the extension card
3. Make sure the extension is **enabled** (toggle on)
4. Try removing and re-adding via **Load unpacked**

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## Privacy

LeanIX Accelerate runs entirely in your browser. No data from your LeanIX environment is collected, transmitted, or stored externally. See the [Privacy & Data](README.md#-privacy--data) section of the README for full details.
