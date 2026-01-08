// Background script (service worker) for context menu

// Create context menu on installation
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'copy-selection-as-markdown',
    title: 'Copy as Markdown (with LaTeX)',
    contexts: ['selection']
  });
  console.log('[HoverLatex] Context menu created');
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'copy-selection-as-markdown' && tab?.id) {
    console.log('[HoverLatex] Context menu clicked, tab ID:', tab.id);

    try {
      // Execute script to get the selection HTML
      const results = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // This function runs in the content script context
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) {
            return { ok: false, error: 'No selection' };
          }

          const container = document.createElement('div');
          for (let i = 0; i < selection.rangeCount; i++) {
            container.appendChild(selection.getRangeAt(i).cloneContents());
          }

          const html = container.innerHTML;
          console.log('[HoverLatex] Selection HTML:', html.substring(0, 200));

          // Return HTML to background script
          return { ok: true, html, text: selection.toString() };
        }
      });

      console.log('[HoverLatex] executeScript result:', results);

      if (results && results[0] && results[0].result) {
        const result = results[0].result;

        if (result.ok && result.html) {
          console.log('[HoverLatex] Got selection HTML, length:', result.html.length);

          // Send message to content script to convert HTML to Markdown
          const response = await browser.tabs.sendMessage(tab.id, {
            type: 'convertHtmlToMarkdown',
            html: result.html
          });

          console.log('[HoverLatex] Markdown conversion response:', response);

          if (response && response.ok) {
            console.log('[HoverLatex] Copy successful');
          } else {
            console.error('[HoverLatex] Copy failed:', response?.error);
          }
        } else {
          console.error('[HoverLatex] No selection or error:', result.error);
        }
      }
    } catch (error) {
      console.error('[HoverLatex] Error:', error);
      console.error('[HoverLatex] Error details:', JSON.stringify(error, null, 2));
    }
  }
});
