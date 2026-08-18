var DOMUtils = {
  waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector);
      if (existing) return resolve(existing);

      const observer = new MutationObserver((mutations, mutationObserver) => {
        const element = document.querySelector(selector);
        if (element) {
          mutationObserver.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for: ${selector}`));
      }, timeout);
    });
  },

  onElementAdded(parent, selector, callback) {
    const existing = parent.querySelectorAll(selector);
    existing.forEach(callback);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (node.matches?.(selector)) {
            callback(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll(selector).forEach(callback);
          }
        }
      }
    });

    observer.observe(parent, { childList: true, subtree: true });
    return observer;
  },

  injectStylesheet(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  },

  createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "className") element.className = value;
      else if (key === "textContent") element.textContent = value;
      else if (key === "innerHTML") element.innerHTML = value;
      else if (key.startsWith("on")) element.addEventListener(key.slice(2).toLowerCase(), value);
      else element.setAttribute(key, value);
    });
    children.forEach((child) => {
      if (typeof child === "string") element.appendChild(document.createTextNode(child));
      else element.appendChild(child);
    });
    return element;
  },

  isLeanIXPage() {
    return /leanix\.(net|com)/i.test(window.location.hostname);
  },

  getPageType() {
    const path = window.location.pathname;
    if (/\/factsheet\//.test(path)) return "factsheet";
    if (/\/inventory/.test(path)) return "inventory";
    if (/\/reports/.test(path)) return "reports";
    if (/\/dashboard/.test(path)) return "dashboard";
    if (/\/search/.test(path)) return "search";
    return "other";
  },

  showToast(message, duration) {
    duration = duration || 3000;
    var toast = document.createElement("div");
    toast.className = "lx-ext-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.add("lx-ext-toast-show");
    }, 10);

    setTimeout(function () {
      toast.classList.remove("lx-ext-toast-show");
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  },
};
