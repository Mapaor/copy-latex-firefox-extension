document.addEventListener('DOMContentLoaded', async () => {
  const popupPanel = document.querySelector('.popup-panel');
  const configBtn = document.getElementById('configBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const formatToggle = document.getElementById('formatToggle');

  function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-system');
    document.body.classList.add(`theme-${theme}`);
  }

  function showPage(pageName) {
    for (const page of settingsPanel.querySelectorAll('[data-settings-page]')) {
      page.hidden = page.dataset.settingsPage !== pageName;
    }
  }

  // Each popup instance starts with settings closed; closing the browser popup
  // destroys this document, so no separate persisted open/closed state is needed.
  configBtn.addEventListener('click', () => {
    const isOpen = configBtn.getAttribute('aria-expanded') === 'true';
    configBtn.setAttribute('aria-expanded', String(!isOpen));
    configBtn.setAttribute('aria-label', isOpen ? 'Expand settings' : 'Collapse settings');
    popupPanel.classList.toggle('expanded', !isOpen);
    settingsPanel.hidden = isOpen;
  });

  settingsPanel.addEventListener('click', (event) => {
    const nextButton = event.target.closest('[data-page-next]');
    const previousButton = event.target.closest('[data-page-prev]');
    const targetPage = nextButton?.dataset.pageNext || previousButton?.dataset.pagePrev;
    if (targetPage) showPage(targetPage);
  });

  const preferences = await browser.storage.local.get([
    'outputFormat',
    'showOverlay',
    'showContextMenu',
    'overrideSelectionCopy',
    'themeMode',
  ]);

  formatToggle.checked = preferences.outputFormat === 'typst';
  formatToggle.addEventListener('change', async () => {
    await browser.storage.local.set({
      outputFormat: formatToggle.checked ? 'typst' : 'latex',
    });
  });

  const overlayModeOptions = document.querySelectorAll('input[name="overlayMode"]');
  const overlayMode = preferences.showOverlay === false ? 'context-menu' : 'show';
  for (const option of overlayModeOptions) {
    option.checked = option.value === overlayMode;
    option.addEventListener('change', async () => {
      if (!option.checked) return;
      await browser.storage.local.set({ showOverlay: option.value === 'show' });
    });
  }

  const contextMenuOption = document.getElementById('contextMenuOption');
  contextMenuOption.checked = preferences.showContextMenu === undefined
    ? true
    : !!preferences.showContextMenu;
  contextMenuOption.addEventListener('change', async () => {
    await browser.storage.local.set({ showContextMenu: contextMenuOption.checked });
  });

  const overrideSelectionCopyOption = document.getElementById('overrideSelectionCopyOption');
  overrideSelectionCopyOption.checked = preferences.overrideSelectionCopy === true;
  overrideSelectionCopyOption.addEventListener('change', async () => {
    await browser.storage.local.set({
      overrideSelectionCopy: overrideSelectionCopyOption.checked,
    });
  });

  const validThemes = ['light', 'dark', 'system'];
  const themeMode = validThemes.includes(preferences.themeMode)
    ? preferences.themeMode
    : 'system';
  const themeRadios = document.querySelectorAll('input[name="themeMode"]');
  for (const radio of themeRadios) {
    radio.checked = radio.value === themeMode;
    radio.addEventListener('change', async () => {
      if (!radio.checked) return;
      await browser.storage.local.set({ themeMode: radio.value });
      applyTheme(radio.value);
    });
  }
  applyTheme(themeMode);
});
