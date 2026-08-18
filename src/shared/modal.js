var ModalUtils = (function () {
  "use strict";

  var OVERLAY_ID = "lx-ext-modal-overlay";

  function createOverlay() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) return existing;

    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.className = "lx-ext-modal-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.zIndex = "9999998";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "flex-start";
    overlay.style.paddingTop = "8vh";
    overlay.style.background = "rgba(0, 0, 0, 0.4)";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.transition = "opacity 0.2s";
    document.body.appendChild(overlay);
    return overlay;
  }

  function removeOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  function ModalInstance(options) {
    var overlay = createOverlay();
    var dialogElement = null;
    var closeButton = null;
    var headerElement = null;
    var titleElement = null;
    var contentElement = null;
    var footerElement = null;
    var cancelButton = null;
    var confirmButton = null;
    var self = this;
    var destroyed = false;

    var defaultOptions = {
      title: "",
      width: "600px",
      closable: true,
      onClose: undefined,
      footer: true,
    };

    options = options || {};

    function getOption(key) {
      return options[key] !== undefined ? options[key] : defaultOptions[key];
    }

    function build() {
      dialogElement = document.createElement("div");
      dialogElement.className = "lx-ext-modal";
      dialogElement.setAttribute("role", "dialog");
      dialogElement.style.position = "relative";
      dialogElement.style.background = "#fff";
      dialogElement.style.borderRadius = "6px";
      dialogElement.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
      dialogElement.style.display = "flex";
      dialogElement.style.flexDirection = "column";
      dialogElement.style.overflow = "hidden";
      dialogElement.style.minWidth = getOption("width");
      dialogElement.style.maxWidth = getOption("width");

      if (getOption("closable")) {
        closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "lx-ext-modal-close";
        closeButton.setAttribute("aria-label", "Close");
        closeButton.style.position = "absolute";
        closeButton.style.top = "8px";
        closeButton.style.right = "8px";
        closeButton.style.width = "28px";
        closeButton.style.height = "28px";
        closeButton.style.background = "none";
        closeButton.style.border = "none";
        closeButton.style.fontSize = "18px";
        closeButton.style.color = "#888";
        closeButton.style.cursor = "pointer";
        closeButton.style.borderRadius = "4px";
        closeButton.style.display = "flex";
        closeButton.style.alignItems = "center";
        closeButton.style.justifyContent = "center";
        closeButton.style.zIndex = "1";
        closeButton.innerHTML = "\u00D7";
        closeButton.addEventListener("click", function () {
          self.hide();
          if (typeof getOption("onClose") === "function") {
            getOption("onClose")();
          }
        });
        dialogElement.appendChild(closeButton);
      }

      if (getOption("title")) {
        headerElement = document.createElement("div");
        headerElement.className = "lx-ext-modal-header";
        headerElement.style.padding = "18px 24px 14px";
        headerElement.style.borderBottom = "1px solid #e8e8e8";
        titleElement = document.createElement("h2");
        titleElement.className = "lx-ext-modal-title";
        titleElement.style.fontSize = "18px";
        titleElement.style.fontWeight = "600";
        titleElement.style.color = "#222";
        titleElement.style.margin = "0";
        titleElement.textContent = getOption("title");
        headerElement.appendChild(titleElement);
        dialogElement.appendChild(headerElement);
      }

      contentElement = document.createElement("div");
      contentElement.className = "lx-ext-modal-content";
      contentElement.style.padding = "20px 24px";
      contentElement.style.fontSize = "14px";
      contentElement.style.color = "#333";
      contentElement.style.lineHeight = "1.5";
      contentElement.style.overflowY = "auto";
      contentElement.style.maxHeight = "60vh";

      if (options.content) {
        setContent(options.content);
      }

      dialogElement.appendChild(contentElement);

      if (getOption("footer") !== false) {
        footerElement = document.createElement("div");
        footerElement.className = "lx-ext-modal-footer";
        footerElement.style.display = "flex";
        footerElement.style.justifyContent = "flex-end";
        footerElement.style.gap = "8px";
        footerElement.style.padding = "14px 24px";
        footerElement.style.borderTop = "1px solid #e8e8e8";

        var footerConfig = typeof options.footer === "object" ? options.footer : {};
        var showCancel = footerConfig.cancelText !== undefined || options.cancelText;
        var showConfirm = footerConfig.confirmText !== undefined || options.confirmText !== undefined || !options.cancelText;

        if (showCancel) {
          var cancelLabel = footerConfig.cancelText || options.cancelText || "Cancel";
          cancelButton = document.createElement("button");
          cancelButton.type = "button";
          cancelButton.className = "lx-ext-btn-cancel";
          cancelButton.style.padding = "8px 20px";
          cancelButton.style.fontSize = "14px";
          cancelButton.style.fontWeight = "500";
          cancelButton.style.background = "#f5f6fa";
          cancelButton.style.color = "#555";
          cancelButton.style.border = "1px solid #ddd";
          cancelButton.style.borderRadius = "4px";
          cancelButton.style.cursor = "pointer";
          cancelButton.textContent = cancelLabel;
          cancelButton.addEventListener("click", function () {
            var onCancel = footerConfig.onCancel || options.onCancel;
            if (typeof onCancel === "function") {
              onCancel();
            }
            self.hide();
          });
          footerElement.appendChild(cancelButton);
        }

        if (showConfirm) {
          var confirmLabel = footerConfig.confirmText || options.confirmText || "OK";
          confirmButton = document.createElement("button");
          confirmButton.type = "button";
          confirmButton.className = "lx-ext-btn-confirm";
          if (footerConfig.confirmClass || options.confirmClass) {
            confirmButton.className += " " + (footerConfig.confirmClass || options.confirmClass);
          }
          confirmButton.style.padding = "8px 20px";
          confirmButton.style.fontSize = "14px";
          confirmButton.style.fontWeight = "500";
          confirmButton.style.background = "#5c6ac4";
          confirmButton.style.color = "#fff";
          confirmButton.style.border = "none";
          confirmButton.style.borderRadius = "4px";
          confirmButton.style.cursor = "pointer";
          confirmButton.textContent = confirmLabel;
          confirmButton.addEventListener("click", function () {
            var onConfirm = footerConfig.onConfirm || options.onConfirm;
            var hide = true;
            if (typeof onConfirm === "function") {
              hide = onConfirm() !== false;
            }
            if (hide) {
              self.hide();
            }
          });
          footerElement.appendChild(confirmButton);
        }

        dialogElement.appendChild(footerElement);
      }

      overlay.appendChild(dialogElement);

      overlay.addEventListener("click", function (event) {
        if (event.target !== overlay) return;
        if (!getOption("closable")) return;
        self.hide();
        if (typeof getOption("onClose") === "function") {
          getOption("onClose")();
        }
      });
    }

    function setContent(newContent) {
      while (contentElement.firstChild) {
        contentElement.removeChild(contentElement.firstChild);
      }
      if (typeof newContent === "string") {
        contentElement.innerHTML = newContent;
      } else if (newContent && newContent.nodeType) {
        contentElement.appendChild(newContent);
      }
    }

    this.show = function () {
      if (destroyed) return;
      if (!dialogElement) build();
      overlay.classList.add("lx-ext-modal-visible");
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
    };

    this.hide = function () {
      if (destroyed) return;
      overlay.classList.remove("lx-ext-modal-visible");
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    };

    this.destroy = function () {
      if (destroyed) return;
      this.hide();
      removeOverlay();
      destroyed = true;
    };

    this.setTitle = function (title) {
      if (!titleElement) return;
      titleElement.textContent = title;
    };

    this.setContent = function (newContent) {
      if (!contentElement) return;
      setContent(newContent);
    };

    this.setConfirmText = function (text) {
      if (!confirmButton) return;
      confirmButton.textContent = text;
    };

    this.setCancelText = function (text) {
      if (!cancelButton) return;
      cancelButton.textContent = text;
    };

    this.setConfirmEnabled = function (enabled) {
      if (!confirmButton) return;
      confirmButton.disabled = !enabled;
    };

    this.getElement = function () {
      return dialogElement;
    };
  }

  return {
    create: function (options) {
      return new ModalInstance(options);
    },

    show: function (options) {
      var modal = new ModalInstance(options);
      modal.show();
      return modal;
    },
  };
})();
