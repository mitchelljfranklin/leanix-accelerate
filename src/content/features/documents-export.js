window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  window.__leanixFeatures__.documentsExport = {
    init: function (DOM, settings) {
      let intersectionObserver = null;

      const observeHeader = function (headerEl) {
        if (!/\/documents\//.test(window.location.pathname)) return;
        if (intersectionObserver) intersectionObserver.disconnect();
        intersectionObserver = new IntersectionObserver(function (entries) {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              window.__leanixFeatures__.documentsExport.addExportButton(DOM);
            }
          }
        });
        intersectionObserver.observe(headerEl);
      };

      const existing = document.querySelector("[data-testid='header-title']");
      if (existing) observeHeader(existing);

      const mutObserver = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.matches && node.matches("[data-testid='header-title']")) {
              observeHeader(node);
              return;
            }
            if (node.querySelectorAll) {
              const headerTitle = node.querySelector("[data-testid='header-title']");
              if (headerTitle) { observeHeader(headerTitle); return; }
            }
          }
        }
      });
      mutObserver.observe(document.body, { childList: true, subtree: true });
    },

    addExportButton: function (DOM) {
      var headerTitle = document.querySelector('[data-testid="header-title"]');
      if (!headerTitle || document.getElementById("lx-ext-documents-export-btn")) return;

      var buttonRow = headerTitle.closest(".tw-flex.tw-min-h-xxl");
      if (!buttonRow) return;

      var actionsContainer = buttonRow.querySelector(".tw-flex.tw-gap-xs.tw-text-nowrap");
      if (!actionsContainer) return;

      var container = DOM.createElement("div", {
        id: "lx-ext-documents-export-container",
        className: "lx-ext-container-inline",
      });

      var button = DOM.createElement(
        "button",
        {
          id: "lx-ext-documents-export-btn",
          className: "lx-ext-btn-inline",
        },
        ["\u2B07 Export"]
      );

      var menu = DOM.createElement("div", {
        id: "lx-ext-documents-export-menu",
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

      var exportModule = window.__leanixFeatures__.documentsExport;

      var excelOption = createMenuOption("\u2B07 Export to Excel", function () {
        closeMenu();
        exportModule.exportToExcel();
      });

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

      actionsContainer.insertBefore(container, actionsContainer.firstChild);
    },

    exportToExcel: function () {
      DOMUtils.showToast("Preparing Excel download\u2026");
      const table = document.querySelector("table.table-hover");
      if (!table) {
        alert("Could not find the documents table on the page.");
        return;
      }

      const buildAndDownload = function () {
        const headerCells = table.querySelectorAll("thead th");
        const headers = [];
        headerCells.forEach(function (th) {
          const text = th.textContent.trim();
          if (text) headers.push(text);
        });

        const dataRows = [];
        const bodyRows = table.querySelectorAll("tbody tr.documentsItem");
        bodyRows.forEach(function (row) {
          const rowData = [];

          const idCell = row.querySelector(".displayIdColumn");
          rowData.push(idCell ? idCell.textContent.trim() : "");

          const titleLink = row.querySelector(".titleColumn a");
          rowData.push(titleLink ? titleLink.textContent.trim() : "");

          const statusBadge = row.querySelector(".statusColumn lx-badge span");
          rowData.push(statusBadge ? statusBadge.textContent.trim() : "");

          const creatorSpan = row.querySelector(".ownerColumn lx-documents-list-creator span");
          rowData.push(creatorSpan ? creatorSpan.textContent.trim() : "");

          const dateSpan = row.querySelector(".lastUpdatedColumn span");
          rowData.push(dateSpan ? dateSpan.textContent.trim() : "");

          dataRows.push(rowData);
        });

        const rows = [];
        if (headers.length > 0) {
          rows.push(headers);
        } else {
          rows.push(["ID", "Title", "Status", "Creator", "Last Updated"]);
        }
        dataRows.forEach(function (dataRow) {
          rows.push(dataRow);
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(rows);

        worksheet["!cols"] = [
          { wch: 14 },
          { wch: 60 },
          { wch: 12 },
          { wch: 22 },
          { wch: 14 },
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "documents-export-" + Date.now() + ".xlsx";
        downloadLink.click();
        URL.revokeObjectURL(url);
      };

      const scrollContainer = findScrollContainer(table.parentElement);
      if (scrollContainer) {
        const originalScrollTop = scrollContainer.scrollTop;
        scrollUntilAllRowsLoaded(scrollContainer, table, function () {
          buildAndDownload();
          scrollContainer.scrollTop = originalScrollTop;
        });
      } else {
        buildAndDownload();
      }
    },
  };

  function findScrollContainer(startElement) {
    var current = startElement;
    while (current && current !== document.body) {
      if (current.scrollHeight > current.clientHeight) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function scrollUntilAllRowsLoaded(scrollContainer, table, callback) {
    var previousCount = -1;
    var stableTicks = 0;

    function tick() {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;

      var currentCount = table.querySelectorAll("tbody tr.documentsItem").length;
      if (currentCount === previousCount) {
        stableTicks += 1;
      } else {
        previousCount = currentCount;
        stableTicks = 0;
      }

      if (stableTicks >= 3) {
        callback();
      } else {
        setTimeout(tick, 250);
      }
    }

    tick();
  }

  function createMenuOption(label, onClick) {
    const element = document.createElement("div");
    element.textContent = label;
    element.className = "lx-ext-menu-item";
    element.addEventListener("click", onClick);
    return element;
  }
})();
