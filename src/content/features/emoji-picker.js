window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  const TOOLBAR_SELECTOR = "lx-rich-text-editor-toolbar";
  const BUTTON_CLASS = "lx-ext-emoji-btn";
  const POPOVER_CLASS = "lx-ext-emoji-popover";
  const POPOVER_WIDTH = 344;
  const POPOVER_HEIGHT = 372;

  var popover = null;
  var popoverTarget = null;
  var popoverButton = null;
  var capturedFrom = null;
  var capturedRange = null;
  var openedAt = 0;

  window.__leanixFeatures__.emojiPicker = {
    init: function (DOM, settings) {
      var attachAll = function () {
        var toolbars = document.querySelectorAll(TOOLBAR_SELECTOR);
        for (var i = 0; i < toolbars.length; i++) {
          window.__leanixFeatures__.emojiPicker.addButton(DOM, toolbars[i]);
        }
      };

      attachAll();

      var mutObserver = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var nodes = mutations[i].addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            var node = nodes[j];
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.matches && node.matches(TOOLBAR_SELECTOR)) {
              window.__leanixFeatures__.emojiPicker.addButton(DOM, node);
              continue;
            }
            if (node.querySelectorAll) {
              var found = node.querySelectorAll(TOOLBAR_SELECTOR);
              for (var k = 0; k < found.length; k++) {
                window.__leanixFeatures__.emojiPicker.addButton(DOM, found[k]);
              }
            }
          }
        }
      });
      mutObserver.observe(document.body, { childList: true, subtree: true });
    },

    addButton: function (DOM, toolbar) {
      if (toolbar.querySelector("." + BUTTON_CLASS)) return;

      var toolbarRow = toolbar.querySelector(".toolbar") || toolbar;
      var editorEl = toolbar.closest("lx-rich-text-editor");
      if (!editorEl) return;

      var proseMirror = editorEl.querySelector(".ProseMirror");
      if (!proseMirror) return;

      var button = DOM.createElement("button", {
        className: BUTTON_CLASS,
        type: "button",
        title: "Insert emoji",
        innerHTML: "\uD83D\uDE00",
      });

      button.addEventListener("mousedown", function (event) {
        event.preventDefault();
        captureSelection(proseMirror);
      });

      button.addEventListener("click", function (event) {
        event.stopPropagation();
        toggle(button, proseMirror);
      });

      toolbarRow.appendChild(button);
    },
  };

  function toggle(button, proseMirror) {
    if (popover && popover.style.display !== "none" && popoverButton === button) {
      close();
      return;
    }
    open(button, proseMirror);
  }

  function open(button, proseMirror) {
    ensurePopover();
    popoverTarget = proseMirror;
    popoverButton = button;

    var search = popover.querySelector(".lx-ext-emoji-search");
    search.value = "";
    search.dispatchEvent(new Event("input"));

    popover.style.display = "block";
    positionPopover(button);
    openedAt = Date.now();
  }

  function close() {
    if (popover) popover.style.display = "none";
    popoverTarget = null;
    popoverButton = null;
    capturedFrom = null;
    capturedRange = null;
  }

  function positionPopover(button) {
    var rect = button.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    var left = rect.left;
    var top = rect.bottom + 4;

    if (left + POPOVER_WIDTH > window.innerWidth) {
      left = Math.max(4, window.innerWidth - POPOVER_WIDTH - 4);
    }
    if (top + POPOVER_HEIGHT > window.innerHeight) {
      top = rect.top - POPOVER_HEIGHT - 4;
    }
    if (top < 4) top = 4;

    popover.style.left = left + "px";
    popover.style.top = top + "px";
  }

  function ensurePopover() {
    if (popover) return popover;

    popover = document.createElement("div");
    popover.className = POPOVER_CLASS;
    popover.style.display = "none";

    var search = document.createElement("input");
    search.type = "text";
    search.className = "lx-ext-emoji-search";
    search.placeholder = "Search emoji\u2026";

    var grid = document.createElement("div");
    grid.className = "lx-ext-emoji-grid";

    var items = [];
    EMOJI_CATEGORIES.forEach(function (cat) {
      var header = document.createElement("div");
      header.className = "lx-ext-emoji-category";
      header.textContent = cat.name;
      grid.appendChild(header);

      cat.items.forEach(function (entry) {
        var emoji = entry[0];
        var name = entry[1];
        var aliases = entry[2] || "";
        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "lx-ext-emoji-item";
        cell.textContent = emoji;
        cell.title = name;
        cell.setAttribute("data-search", (name + " " + aliases).toLowerCase());
        cell.addEventListener("click", function () {
          insertEmoji(popoverTarget, emoji);
          close();
        });
        grid.appendChild(cell);
        items.push(cell);
      });
    });

    search.addEventListener("input", function () {
      var query = search.value.trim().toLowerCase();
      var querying = query.length > 0;
      grid.classList.toggle("lx-ext-emoji-search-mode", querying);
      for (var i = 0; i < items.length; i++) {
        var cell = items[i];
        var match = !querying || cell.getAttribute("data-search").indexOf(query) !== -1;
        cell.style.display = match ? "" : "none";
      }
    });

    popover.appendChild(search);
    popover.appendChild(grid);
    document.body.appendChild(popover);
    return popover;
  }

  function captureSelection(proseMirror) {
    capturedFrom = null;
    capturedRange = null;

    var view = getProseMirrorView(proseMirror);
    if (view && view.state) {
      try {
        capturedFrom = view.state.selection.from;
      } catch (err) {
        /* ignore */
      }
    }

    var sel = window.getSelection();
    if (sel && sel.rangeCount) {
      try {
        var range = sel.getRangeAt(0);
        if (proseMirror.contains(range.startContainer)) {
          capturedRange = range.cloneRange();
        }
      } catch (err) {
        /* ignore */
      }
    }
  }

  function insertEmoji(proseMirror, emoji) {
    if (!proseMirror) return;

    var view = getProseMirrorView(proseMirror);
    if (view && view.dispatch && view.state) {
      try {
        var from = capturedFrom !== null ? capturedFrom : view.state.selection.from;
        view.dispatch(view.state.tr.insertText(emoji, from, from));
        view.focus();
        return;
      } catch (err) {
        /* fall through to execCommand */
      }
    }

    proseMirror.focus();
    if (capturedRange) {
      try {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(capturedRange);
      } catch (err) {
        /* ignore */
      }
    }
    try {
      document.execCommand("insertText", false, emoji);
    } catch (err) {
      DOMUtils.showToast("Could not insert emoji");
    }
  }

  function getProseMirrorView(dom) {
    var desc = dom.pmViewDesc;
    while (desc) {
      if (desc.view) return desc.view;
      desc = desc.parent;
    }

    var host = dom.closest ? dom.closest("tiptap-editor, lx-rich-text-editor") : null;
    if (host) {
      if (host.editor && host.editor.view) return host.editor.view;
      if (host.editor && host.editor.commands) return host.editor;
    }
    return null;
  }

  document.addEventListener("click", function (event) {
    if (!popover || popover.style.display === "none") return;
    if (popover.contains(event.target)) return;
    if (popoverButton && popoverButton.contains(event.target)) return;
    close();
  });

  window.addEventListener("scroll", function (event) {
    if (!popover || popover.style.display === "none") return;
    if (popover.contains(event.target)) return;
    if (Date.now() - openedAt < 250) return;
    close();
  }, true);
})();
