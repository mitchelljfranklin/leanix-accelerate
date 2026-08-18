window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  var MENU_RENDER_DELAY_MS = 100;

  window.__leanixFeatures__.diagramDetails = {
    init: function (DOM, settings) {
      var intersectionObserver = null;

      var observeTarget = function (element) {
        if (!document.querySelector("lx-diagrams-container")) return;
        if (intersectionObserver) intersectionObserver.disconnect();
        intersectionObserver = new IntersectionObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              window.__leanixFeatures__.diagramDetails.addButton(DOM);
            }
          }
        });
        intersectionObserver.observe(element);
      };

      var existing = document.getElementById("tourEditDiagram");
      if (existing) observeTarget(existing);

      var mutObserver = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var nodes = mutations[i].addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            var node = nodes[j];
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.id === "tourEditDiagram") {
              observeTarget(node);
              return;
            }
            if (node.querySelectorAll) {
              var found = node.querySelector("#tourEditDiagram");
              if (found) { observeTarget(found); return; }
            }
          }
        }
      });
      mutObserver.observe(document.body, { childList: true, subtree: true });
    },

    addButton: function (DOM) {
      var diagramsContainer = document.querySelector("lx-diagrams-container");
      if (!diagramsContainer) return;

      if (document.getElementById("lx-ext-diagram-details-btn")) return;

      var editBtn = document.getElementById("tourEditDiagram");
      if (!editBtn) return;

      var container = DOM.createElement("div", {
        id: "lx-ext-diagram-details-container",
        className: "lx-ext-container-inline",
      });

      var gearIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

      var button = DOM.createElement(
        "button",
        {
          id: "lx-ext-diagram-details-btn",
          className: "lx-ext-btn-icon",
          innerHTML: gearIcon,
          title: "Diagram Details",
        },
        []
      );

      button.addEventListener("click", function () {
        window.__leanixFeatures__.diagramDetails.openDiagramDetails();
      });

      container.appendChild(button);

      editBtn.parentNode.insertBefore(container, editBtn);
    },

    openDiagramDetails: function () {
      DOMUtils.showToast("Opening Diagram details\u2026");

      var moreBtn = document.getElementById("tourMoreButton");
      if (!moreBtn) {
        console.log("[LeanIX Extension] Diagram Details: More button not found");
        return;
      }
      moreBtn.click();

      setTimeout(function () {
        var diagramDetailsOption = document.querySelector("lx-option.showSettings");
        if (diagramDetailsOption) {
          var li = diagramDetailsOption.querySelector("li.option");
          if (li) {
            li.click();
          } else {
            diagramDetailsOption.click();
          }
        } else {
          console.log("[LeanIX Extension] Diagram Details: Option not found in dropdown");
        }
      }, MENU_RENDER_DELAY_MS);
    },
  };
})();
