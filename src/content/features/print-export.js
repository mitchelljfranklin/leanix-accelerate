window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  const EXCEL_COLUMN_WIDTHS = { field: 30, value: 50, detail: 30 };
  const PRINT_WINDOW_WIDTH = 800;
  const PRINT_WINDOW_HEIGHT = 600;
  const PRINT_DELAY_MS = 500;
  const DEFAULT_MAX_COLUMNS = 2;

  function getTextContent(element) {
    const clone = element.cloneNode(true);
    const badges = clone.querySelectorAll("lx-badge, .wrapper");
    badges.forEach(function (badge) {
      badge.remove();
    });
    return clone.textContent.trim();
  }

  function getRichTextContent(editorBlock) {
    const richEditor = editorBlock.querySelector("lx-rich-text-editor");
    if (!richEditor) return null;
    const proseMirror = richEditor.querySelector(".ProseMirror");
    if (!proseMirror) return null;
    const clone = proseMirror.cloneNode(true);
    clone.removeAttribute("contenteditable");
    clone.removeAttribute("role");
    clone.removeAttribute("translate");
    return clone;
  }

  function extractSections(root) {
    const sections = [];

    function processEditorBlock(block) {
      const titleEl = block.querySelector(".formTitle");
      if (!titleEl) return;
      const titleText = titleEl.textContent.trim();

      const placeholder = block.querySelector(":scope > span.emptyPlaceholder");
      if (placeholder) {
        sections.push({ title: titleText, content: "—", type: "text" });
        return;
      }

      const richContent = getRichTextContent(block);
      if (richContent) {
        const text = richContent.textContent.trim();
        sections.push({ title: titleText, content: text, type: "text", html: richContent.outerHTML });
      } else {
        sections.push({ title: titleText, content: "", type: "text" });
      }
    }

    function processDate(dateEl) {
      const titleEl = dateEl.querySelector(".formTitle");
      const valueEl = dateEl.querySelector("p");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const value = valueEl ? valueEl.textContent.trim() : "";
      sections.push({ title: title, content: value, type: "date" });
    }

    function processFactSheetList(listEl) {
      const titleEl = listEl.querySelector(".formTitle");
      const title = titleEl ? titleEl.textContent.trim() : "";

      const placeholder = listEl.querySelector(".emptyPlaceholder");
      if (placeholder) {
        sections.push({ title: title, content: "—", type: "list" });
        return;
      }

      const rows = listEl.querySelectorAll("tr.factSheetItem");
      if (!rows.length) {
        sections.push({ title: title, content: "", type: "list" });
        return;
      }

      const items = [];
      rows.forEach(function (row) {
        const labelCell = row.querySelector("td:first-child");
        const nameCell = row.querySelector("td:last-child");
        if (labelCell && nameCell) {
          items.push({
            label: getTextContent(labelCell),
            name: getTextContent(nameCell),
          });
        }
      });
      sections.push({ title: title, items: items, type: "list" });
    }

    function processUsersList(usersEl) {
      const titleEl = usersEl.querySelector(".formTitle");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const usersContainer = usersEl.querySelector(".selectedUsers");
      const placeholder = usersEl.querySelector(".emptyPlaceholder");

      if (placeholder || !usersContainer || !usersContainer.children.length) {
        sections.push({ title: title, content: "—", type: "users" });
        return;
      }

      const users = [];
      const userItems = usersContainer.querySelectorAll(".selectedUser");
      userItems.forEach(function (item) {
        const nameSpan = item.querySelector("lx-documents-list-creator > div.userContainer > span");
        const name = nameSpan ? nameSpan.textContent.trim() : "Unknown";
        users.push(name);
      });
      sections.push({ title: title, users: users, type: "users" });
    }

    Array.from(root.children).forEach(function (child) {
      const tag = child.tagName.toLowerCase();

      if (tag === "div" && child.classList.contains("editorBlock")) {
        processEditorBlock(child);
      } else if (tag === "lx-document-date-select") {
        processDate(child);
      } else if (tag === "lx-document-fact-sheet-list") {
        processFactSheetList(child);
      } else if (tag === "lx-document-users-list") {
        processUsersList(child);
      }
    });

    return sections;
  }

  function buildPrintHtml(root) {
    let bodyHtml = "";

    function processEditorBlock(block) {
      const titleEl = block.querySelector(".formTitle");
      if (!titleEl) return "";
      const titleText = titleEl.textContent.trim();

      const placeholder = block.querySelector(":scope > span.emptyPlaceholder");
      if (placeholder) {
        return `<div class="section"><div class="section-title">${titleText}</div><div class="empty">—</div></div>`;
      }

      const richContent = getRichTextContent(block);
      if (richContent) {
        return `<div class="section"><div class="section-title">${titleText}</div>${richContent.outerHTML}</div>`;
      }
      return `<div class="section"><div class="section-title">${titleText}</div></div>`;
    }

    function processDate(dateEl) {
      const titleEl = dateEl.querySelector(".formTitle");
      const valueEl = dateEl.querySelector("p");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const value = valueEl ? valueEl.textContent.trim() : "";
      return `<div class="section"><div class="section-title">${title}</div><p>${value}</p></div>`;
    }

    function processFactSheetList(listEl) {
      const titleEl = listEl.querySelector(".formTitle");
      const title = titleEl ? titleEl.textContent.trim() : "";

      const placeholder = listEl.querySelector(".emptyPlaceholder");
      if (placeholder) {
        return `<div class="section"><div class="section-title">${title}</div><div class="empty">—</div></div>`;
      }

      const rows = listEl.querySelectorAll("tr.factSheetItem");
      if (!rows.length) {
        return `<div class="section"><div class="section-title">${title}</div></div>`;
      }

      let tableHtml = '<table class="data-table"><tbody>';
      rows.forEach(function (row) {
        const labelCell = row.querySelector("td:first-child");
        const nameCell = row.querySelector("td:last-child");
        if (labelCell && nameCell) {
          tableHtml += `<tr><td>${labelCell.cloneNode(true).outerHTML}</td><td>${nameCell.cloneNode(true).outerHTML}</td></tr>`;
        }
      });
      tableHtml += "</tbody></table>";
      return `<div class="section"><div class="section-title">${title}</div>${tableHtml}</div>`;
    }

    function processUsersList(usersEl) {
      const titleEl = usersEl.querySelector(".formTitle");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const usersContainer = usersEl.querySelector(".selectedUsers");
      const placeholder = usersEl.querySelector(".emptyPlaceholder");

      if (placeholder || !usersContainer || !usersContainer.children.length) {
        return `<div class="section"><div class="section-title">${title}</div><div class="empty">—</div></div>`;
      }

      let usersHtml = '<div class="users-list">';
      const userItems = usersContainer.querySelectorAll(".selectedUser");
      userItems.forEach(function (item) {
        const avatarImg = item.querySelector("img.avatarImage");
        const nameSpan = item.querySelector("lx-documents-list-creator > div.userContainer > span");
        const name = nameSpan ? nameSpan.textContent.trim() : "";
        if (avatarImg) {
          usersHtml += `<div class="user-chip">${avatarImg.outerHTML}<span>${name}</span></div>`;
        } else {
          usersHtml += `<div class="user-chip"><span>${name || "Unknown"}</span></div>`;
        }
      });
      usersHtml += "</div>";
      return `<div class="section"><div class="section-title">${title}</div>${usersHtml}</div>`;
    }

    Array.from(root.children).forEach(function (child) {
      const tag = child.tagName.toLowerCase();

      if (tag === "div" && child.classList.contains("editorBlock")) {
        bodyHtml += processEditorBlock(child);
      } else if (tag === "lx-document-date-select") {
        bodyHtml += processDate(child);
      } else if (tag === "lx-document-fact-sheet-list") {
        bodyHtml += processFactSheetList(child);
      } else if (tag === "lx-document-users-list") {
        bodyHtml += processUsersList(child);
      }
    });

    return bodyHtml;
  }

  const PRINT_STYLES = `
    body { font-family: Arial, sans-serif; color: #000; padding: 20px; margin: 0; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: bold; margin: 0 0 4px 0; border-bottom: 1px solid #555; padding-bottom: 4px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .data-table td, .data-table th { border: 1px solid #333; padding: 6px; vertical-align: top; }
    .data-table p, .ProseMirror p { margin: 4px 0; }
    .empty { color: #999; font-style: italic; }
    .users-list { display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0; }
    .user-chip { display: flex; align-items: center; gap: 6px; }
    .avatarImage { width: 32px; height: 32px; border-radius: 50%; }
    .factSheetLink { color: #0f7eb5; text-decoration: none; }
    .ProseMirror table { border-collapse: collapse; width: 100%; }
    .ProseMirror td, .ProseMirror th { border: 1px solid #333; padding: 6px; }
  `;

  window.__leanixFeatures__.printExport = {
    init: function (DOM, settings) {
      let intersectionObserver = null;

      const observeForm = function (formEl) {
        if (intersectionObserver) intersectionObserver.disconnect();
        intersectionObserver = new IntersectionObserver(function (entries) {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              window.__leanixFeatures__.printExport.addExportButton(DOM);
            }
          }
        });
        intersectionObserver.observe(formEl);
      };

      const existing = document.querySelector("lx-document-fields-form");
      if (existing) observeForm(existing);

      const mutObserver = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.matches && node.matches("lx-document-fields-form")) {
              observeForm(node);
              return;
            }
            if (node.querySelectorAll) {
              const form = node.querySelector("lx-document-fields-form");
              if (form) { observeForm(form); return; }
            }
          }
        }
      });
      mutObserver.observe(document.body, { childList: true, subtree: true });
    },

    addExportButton: function (DOM) {
      var header = document.querySelector(".headerUpdates");
      if (!header || document.getElementById("lx-ext-print-btn")) return;

      var container = DOM.createElement("div", {
        id: "lx-ext-print-container",
        className: "lx-ext-container-inline",
      });

      var button = DOM.createElement(
        "button",
        {
          id: "lx-ext-print-btn",
          className: "lx-ext-btn-inline",
        },
        ["Export"]
      );

      var menu = DOM.createElement("div", {
        id: "lx-ext-print-menu",
        className: "lx-ext-menu lx-ext-menu-down",
      });

      var menuOpen = false;

      var closeMenu = function () {
        menu.style.display = "none";
        menuOpen = false;
      };

      var openMenu = function () {
        menu.style.display = "block";
        menuOpen = true;
      };

      document.addEventListener("click", function (event) {
        if (!menuOpen) return;
        if (!container.contains(event.target)) {
          closeMenu();
        }
      });

      var printExport = window.__leanixFeatures__.printExport;
      var printOption = createMenuOption("Export to Print", function () {
        closeMenu();
        printExport.exportPrint();
      });

      var excelOption = createMenuOption("Export to Excel", function () {
        closeMenu();
        printExport.exportExcel();
      });

      menu.appendChild(printOption);
      menu.appendChild(excelOption);

      button.addEventListener("click", function () {
        if (menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      container.appendChild(button);
      container.appendChild(menu);

      const closeBtn = header.querySelector('button[aria-label="Close"]');
      if (closeBtn) {
        header.insertBefore(container, closeBtn);
      } else {
        header.appendChild(container);
      }
    },

    exportExcel: function () {
      DOMUtils.showToast("Preparing Excel download\u2026");
      const root = document.querySelector("lx-document-fields-form");
      if (!root) {
        alert("Could not find the document fields form on the page.");
        return;
      }

      const sections = extractSections(root);

      let maxCols = DEFAULT_MAX_COLUMNS;
      sections.forEach(function (section) {
        if (section.type === "list" && section.items && section.items.length > 0) {
          maxCols = Math.max(maxCols, DEFAULT_MAX_COLUMNS + 1);
        }
      });

      const rows = [["Field", "Value", "Detail"]];
      sections.forEach(function (section) {
        if (section.type === "list" && section.items) {
          rows.push([section.title, "", ""]);
          rows.push(["", "Label", "Name"]);
          section.items.forEach(function (item) {
            rows.push(["", item.label, item.name]);
          });
          rows.push(["", "", ""]);
        } else if (section.type === "users" && section.users) {
          rows.push([section.title, section.users.join(", "), ""]);
        } else {
          rows.push([section.title, section.content || "", ""]);
        }
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(rows);

      worksheet["!cols"] = [
        { wch: EXCEL_COLUMN_WIDTHS.field },
        { wch: EXCEL_COLUMN_WIDTHS.value },
        { wch: EXCEL_COLUMN_WIDTHS.detail },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Document");

      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `document-export-${Date.now()}.xlsx`;
      downloadLink.click();
      URL.revokeObjectURL(url);
    },

    exportPrint: function () {
      DOMUtils.showToast("Opening print dialog\u2026", 2000);
      const root = document.querySelector("lx-document-fields-form");
      if (!root) {
        alert("Could not find the document fields form on the page.");
        return;
      }

      const bodyHtml = buildPrintHtml(root);

      const docHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Exported Document</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

      const printWindow = window.open("", "_blank", `width=${PRINT_WINDOW_WIDTH},height=${PRINT_WINDOW_HEIGHT}`);
      if (!printWindow) {
        alert("Popup blocked! Please allow popups for this site and try again.");
        return;
      }
      printWindow.document.write(docHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(function () {
        printWindow.print();
      }, PRINT_DELAY_MS);
    },

    extractDocumentData: function () {
      const root = document.querySelector("lx-document-fields-form");
      if (!root) return null;
      return extractSections(root);
    },
  };

  function createMenuOption(label, onClick) {
    const element = document.createElement("div");
    element.textContent = label;
    element.className = "lx-ext-menu-item";
    element.addEventListener("click", onClick);
    return element;
  }
})();
