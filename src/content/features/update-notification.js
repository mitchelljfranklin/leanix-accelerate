window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  "use strict";

  var STORAGE_KEY = "leanix_last_seen_version";

  window.__leanixFeatures__.updateNotification = {
    init: function (DOM, settings) {
      try {
        var currentVersion = chrome.runtime.getManifest().version;

        DOM.waitForElement("lx-app-main-menu-dropdown", 30000)
          .then(function () {
            chrome.storage.sync.get(STORAGE_KEY, function (result) {
              var lastSeen = result[STORAGE_KEY] || "";

              if (lastSeen === currentVersion) return;

              showChangelog(currentVersion);
              chrome.storage.sync.set({ [STORAGE_KEY]: currentVersion });
            });
          })
          .catch(function () {
            // Timed out — user likely on login/auth page, skip notification
          });
      } catch (e) {
        // Ignore — modal.js may not be loaded or getManifest unavailable
      }
    },

    testReset: function () {
      chrome.storage.sync.remove(STORAGE_KEY, function () {
        ModalUtils.show({
          title: "Test Reset",
          content: "Last seen version cleared. Reload the page to see the update notification.",
          footer: { confirmText: "OK" },
        });
      });
    },
  };

  function showChangelog(version) {
    var entry = CHANGELOG[version];

    if (!entry) {
      var keys = Object.keys(CHANGELOG).sort();
      if (keys.length === 0) return;
      var latestVersion = keys[keys.length - 1];
      entry = CHANGELOG[latestVersion];
    }

    var contentHtml = "<p>" + entry.title + "</p>";
    contentHtml += '<ul style="list-style-type:disc;padding-left:20px;">';
    entry.changes.forEach(function (change) {
      contentHtml += "<li>" + change + "</li>";
    });
    contentHtml += "</ul>";

    if (entry.linkText && entry.linkUrl) {
      contentHtml +=
        '<p style="margin-top:12px;"><a href="' +
        entry.linkUrl +
        '" target="_blank" rel="noopener">' +
        entry.linkText +
        "</a></p>";
    }

    ModalUtils.show({
      title: "What\u2019s New",
      content: contentHtml,
      footer: {
        confirmText: "Got it",
      },
    });
  }

  var CHANGELOG = {
    "1.0.7": {
      title: "Here\u2019s what\u2019s new in v1.0.7:",
      changes: [
        "Fiori reskin support \u2014 export buttons now match the new LeanIX theme with SAP blue styling",
      ],
      linkText: "View all features on GitHub \u2192",
      linkUrl: "https://github.com/mitchelljfranklin/LeanIX-Accelerate#-features",
    },
    "1.0.6": {
      title: "Here\u2019s what\u2019s new in v1.0.6:",
      changes: [
        "Content scripts bundled into a single file for faster loading",
        "Fixed documents export button not reappearing after SPA navigation",
        "Popup now shows the current extension version from the manifest",
        "Build improvements and reduced extension size",
        "New direct edit button on Diagram display mode, once less click"
      ],
      linkText: "View all features on GitHub \u2192",
      linkUrl: "https://github.com/mitchelljfranklin/LeanIX-Accelerate#-features",
    },
    "1.0.5": {
      title: "Welcome to LeanIX Accelerate! Here\u2019s what\u2019s included:",
      changes: [
        "Floating Data Export button on Factsheet and Inventory pages \u2014 export as JSON or Excel in one click",
        "Document Print Export \u2014 print formatted documents to PDF from any document detail page",
        "Documents List Export \u2014 download Architecture Decision lists as Excel spreadsheets",
        "Extension popup with one-click feature toggles",
        "Full settings page with reset-to-defaults",
      ],
      linkText: "View all features on GitHub \u2192",
      linkUrl: "https://github.com/mitchelljfranklin/LeanIX-Accelerate#-features",
    },
    "1.0.0": {
      title: "LeanIX Accelerate is here! Here\u2019s what\u2019s included in the initial release:",
      changes: [
        "Floating Data Export button on Factsheet and Inventory pages \u2014 export as JSON or Excel in one click",
        "Document Print Export \u2014 print formatted documents to PDF from any document detail page",
        "Documents List Export \u2014 download Architecture Decision lists as Excel spreadsheets",
        "Extension popup with one-click feature toggles",
        "Full settings page with reset-to-defaults",
      ],
    },
  };
})();
