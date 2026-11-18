import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

const assetPathPrefix = "/assets";

const assets = {
  switchThumb: `${assetPathPrefix}/6bce5.svg`,
  checkmark: `${assetPathPrefix}/fa743.svg`,
  selectedRadio: `${assetPathPrefix}/0909c.svg`,
  selectedRadioRing: `${assetPathPrefix}/834a7.svg`,
  radioRing: `${assetPathPrefix}/cb8e9.svg`,
};

type Theme = "light" | "dark" | "system";
type BasePage =
  | "home"
  | "equations"
  | "selection"
  | "appearance"
  | "delimiters"
  | "replacements"
  | "other";
type SettingsView = BasePage | "languages" | "languageEditor" | "advancedAppearance";
type CustomLanguage = { id: number; name: string; translations: Record<string, string> };
type Replacement = { id: number; source: string; replacement: string };

const basePages: BasePage[] = [
  "home",
  "equations",
  "selection",
  "appearance",
  "delimiters",
  "replacements",
  "other",
];

const translationFields = [
  { key: "clickToCopy", label: "Click to copy" },
  { key: "copied", label: "Copied" },
  { key: "copyAs", label: "Copy as..." },
] as const;

const delimiterGroups = [
  { key: "latexEquation", title: "Single Equation – LaTeX", defaults: ["", "", "", ""] },
  { key: "typstEquation", title: "Single Equation – Typst", defaults: ["$", "$", "$ ", " $"] },
  {
    key: "markdownSelection",
    title: "Selection – Markdown",
    defaults: ["\\(", "\\)", "\\[", "\\]"],
  },
  {
    key: "typstSelection",
    title: "Selection – Typst",
    defaults: ["$", "$", "$\\n", "\\n$"],
  },
] as const;

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 16 16"
      stroke="var(--icon-stroke)"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="var(--icon-stroke)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.711"
        d="M7.997 9.694a1.726 1.695 0 1 0 0-3.39a1.726 1.695 0 0 0 0 3.39m3.021-6.78l3.021 5.085l-3.021 5.085H4.976L1.955 7.999l3.021-5.085z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <g data-name="Layer 2">
        <rect width="24" height="24" opacity="0" />
        <path d="M16.24 22a1 1 0 0 1-1-1v-2.6a2.15 2.15 0 0 0-.54-1.66 1 1 0 0 1 .61-1.67C17.75 14.78 20 14 20 9.77a4 4 0 0 0-.67-2.22 2.75 2.75 0 0 1-.41-2.06 3.71 3.71 0 0 0 0-1.41 7.65 7.65 0 0 0-2.09 1.09 1 1 0 0 1-.84.15 10.15 10.15 0 0 0-5.52 0 1 1 0 0 1-.84-.15 7.4 7.4 0 0 0-2.11-1.09 3.52 3.52 0 0 0 0 1.41 2.84 2.84 0 0 1-.43 2.08 4.07 4.07 0 0 0-.67 2.23c0 3.89 1.88 4.93 4.7 5.29a1 1 0 0 1 .82.66 1 1 0 0 1-.21 1 2.06 2.06 0 0 0-.55 1.56V21a1 1 0 0 1-2 0v-.57a6 6 0 0 1-5.27-2.09 3.9 3.9 0 0 0-1.16-.88 1 1 0 1 1 .5-1.94 4.93 4.93 0 0 1 2 1.36c1 1 2 1.88 3.9 1.52a3.89 3.89 0 0 1 .23-1.58c-2.06-.52-5-2-5-7a6 6 0 0 1 1-3.33.85.85 0 0 0 .13-.62 5.69 5.69 0 0 1 .33-3.21 1 1 0 0 1 .63-.57c.34-.1 1.56-.3 3.87 1.2a12.16 12.16 0 0 1 5.69 0c2.31-1.5 3.53-1.31 3.86-1.2a1 1 0 0 1 .63.57 5.71 5.71 0 0 1 .33 3.22.75.75 0 0 0 .11.57 6 6 0 0 1 1 3.34c0 5.07-2.92 6.54-5 7a4.28 4.28 0 0 1 .22 1.67V21a1 1 0 0 1-.94 1z" />
      </g>
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 2.05S16 6 16 12m-5 9.95S8 18 8 12s3-9.95 3-9.95M2.63 15.5H12m-9.37-7h18.74"
        />
        <path
          d="M21.879 17.917c.494.304.463 1.043-.045 1.101l-2.567.291l-1.151 2.312c-.228.459-.933.234-1.05-.334l-1.255-6.116c-.099-.48.333-.782.75-.525z"
          clipRule="evenodd"
        />
      </g>
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  const path = direction === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "m6 3.5 4.5 4.5L6 12.5";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5v9m0 0L6.8 8.3M10 11.5l3.2-3.2M4 12.5v3h12v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 11.5v-9m0 0L6.8 5.7M10 2.5l3.2 3.2M4 12.5v3h12v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MouseIcon({ context = false }: { context?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="4" y="1.5" width="8" height="13" rx="4" stroke="currentColor" />
      <path d="M8 2v4" stroke="currentColor" strokeLinecap="round" />
      {context && <path d="M10.5 8.5h3m-3 2h3m-3 2h2" stroke="currentColor" />}
    </svg>
  );
}

function CursorIcon({ pointer = false }: { pointer?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {pointer ? (
        <path
          d="M5.5 7V3.5a1 1 0 0 1 2 0V6m0-1.5a1 1 0 0 1 2 0V6m0-1a1 1 0 0 1 2 0v1.5m0-1a1 1 0 0 1 2 0V10c0 2.5-1.7 4-4.2 4H8c-1.4 0-2.3-.8-3-1.8L3 9.5a1.1 1.1 0 0 1 1.7-1.4z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M3 2.5 12.5 8 8 9.2 6.5 13z"
          fill="currentColor"
          stroke="currentColor"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function RadioVisual({ checked }: { checked: boolean }) {
  return (
    <span className="radio-visual" aria-hidden="true">
      <img
        src={checked ? assets.selectedRadioRing : assets.radioRing}
        width="15"
        height="15"
        alt=""
      />
      {checked && (
        <img className="radio-dot" src={assets.selectedRadio} width="9" height="9" alt="" />
      )}
    </span>
  );
}

function RadioChoice({
  name,
  value,
  current,
  onChange,
  children,
}: {
  name: string;
  value: string;
  current: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const checked = value === current;
  return (
    <label className="choice">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <RadioVisual checked={checked} />
      <span>{children}</span>
    </label>
  );
}

function CheckboxChoice({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="choice">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="checkbox-visual" aria-hidden="true">
        {checked && <img src={assets.checkmark} width="12" height="12" alt="" />}
      </span>
      <span>{children}</span>
    </label>
  );
}

let nextReplacementId = 4;
let nextLanguageId = 3;

export default function App() {
  const [useTypst, setUseTypst] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState<SettingsView>("home");
  const importInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [systemIsDark, setSystemIsDark] = useState(false);

  const [overlayVisibility, setOverlayVisibility] = useState("show");
  const [copyMode, setCopyMode] = useState("click");
  const [copiedIndicator, setCopiedIndicator] = useState("copied");
  const [cursor, setCursor] = useState("pointer");
  const [hijackCopy, setHijackCopy] = useState(true);
  const [showCopyAs, setShowCopyAs] = useState(true);

  const [language, setLanguage] = useState("English");
  const [customLanguages, setCustomLanguages] = useState<CustomLanguage[]>([
    {
      id: 1,
      name: "French",
      translations: {
        clickToCopy: "Cliquer pour copier",
        copied: "Copié",
        copyAs: "Copier comme...",
      },
    },
    {
      id: 2,
      name: "Italian",
      translations: {
        clickToCopy: "Clicca per copiare",
        copied: "Copiato",
        copyAs: "Copia come...",
      },
    },
  ]);
  const [editingLanguageId, setEditingLanguageId] = useState<number | null>(null);
  const [languageNameDraft, setLanguageNameDraft] = useState("");
  const [translationIndex, setTranslationIndex] = useState(0);
  const [translationDrafts, setTranslationDrafts] = useState<Record<string, string>>({});

  const [backgroundColor, setBackgroundColor] = useState("#00dd00");
  const [sparklesType, setSparklesType] = useState("magic");
  const [sparklesColor, setSparklesColor] = useState("#00dd22");

  const initialDelimiters = Object.fromEntries(
    delimiterGroups.flatMap((group) =>
      group.defaults.map((value, index) => [`${group.key}-${index}`, value]),
    ),
  );
  const [delimiters, setDelimiters] = useState<Record<string, string>>(initialDelimiters);

  const [replacements, setReplacements] = useState<Replacement[]>([
    { id: 1, source: "\\displaystyle", replacement: "" },
    { id: 2, source: "\\mathrm", replacement: "\\text" },
    { id: 3, source: "\\operatorname", replacement: "\\text" },
  ]);
  const [listMarker, setListMarker] = useState("*");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemIsDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemIsDark);
  const basePageIndex = basePages.indexOf(view as BasePage);
  const activeLanguage = useMemo(
    () => customLanguages.find((item) => item.id === editingLanguageId),
    [customLanguages, editingLanguageId],
  );

  function openLanguageEditor(item?: CustomLanguage) {
    if (item) {
      setEditingLanguageId(item.id);
      setLanguageNameDraft(item.name);
      setTranslationDrafts(item.translations);
    } else {
      setEditingLanguageId(null);
      setLanguageNameDraft("");
      setTranslationDrafts({});
    }
    setTranslationIndex(0);
    setView("languageEditor");
  }

  function saveLanguage() {
    const name = languageNameDraft.trim() || "Custom language";
    if (editingLanguageId === null) {
      const newLanguage = { id: nextLanguageId++, name, translations: translationDrafts };
      setCustomLanguages((current) => [...current, newLanguage]);
      setLanguage(newLanguage.name);
    } else {
      setCustomLanguages((current) =>
        current.map((item) =>
          item.id === editingLanguageId ? { ...item, name, translations: translationDrafts } : item,
        ),
      );
      if (activeLanguage?.name === language) setLanguage(name);
    }
    setView("languages");
  }

  function addReplacement() {
    setReplacements((current) => [
      ...current,
      { id: nextReplacementId++, source: "", replacement: "" },
    ]);
  }

  function exportSettings() {
    const exportedSettings = {
      useTypst,
      overlayVisibility,
      copyMode,
      copiedIndicator,
      cursor,
      hijackCopy,
      showCopyAs,
      theme,
      language,
      customLanguages,
      backgroundColor,
      sparklesType,
      sparklesColor,
      delimiters,
      replacements,
      listMarker,
    };
    const blob = new Blob([JSON.stringify(exportedSettings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "copy-latex-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importSettings(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = JSON.parse(await file.text()) as Record<string, unknown>;
      if (typeof imported.useTypst === "boolean") setUseTypst(imported.useTypst);
      if (typeof imported.overlayVisibility === "string")
        setOverlayVisibility(imported.overlayVisibility);
      if (typeof imported.copyMode === "string") setCopyMode(imported.copyMode);
      if (typeof imported.copiedIndicator === "string")
        setCopiedIndicator(imported.copiedIndicator);
      if (typeof imported.cursor === "string") setCursor(imported.cursor);
      if (typeof imported.hijackCopy === "boolean") setHijackCopy(imported.hijackCopy);
      if (typeof imported.showCopyAs === "boolean") setShowCopyAs(imported.showCopyAs);
      if (imported.theme === "light" || imported.theme === "dark" || imported.theme === "system")
        setTheme(imported.theme);
      if (typeof imported.language === "string") setLanguage(imported.language);
      if (Array.isArray(imported.customLanguages))
        setCustomLanguages(imported.customLanguages as CustomLanguage[]);
      if (typeof imported.backgroundColor === "string")
        setBackgroundColor(imported.backgroundColor);
      if (typeof imported.sparklesType === "string") setSparklesType(imported.sparklesType);
      if (typeof imported.sparklesColor === "string") setSparklesColor(imported.sparklesColor);
      if (imported.delimiters && typeof imported.delimiters === "object")
        setDelimiters(imported.delimiters as Record<string, string>);
      if (Array.isArray(imported.replacements))
        setReplacements(imported.replacements as Replacement[]);
      if (typeof imported.listMarker === "string") setListMarker(imported.listMarker);
    } catch {
      // Leave the current settings untouched when the selected file is not valid JSON.
    } finally {
      event.target.value = "";
    }
  }

  function pageFooter(backOverride?: SettingsView) {
    const back =
      backOverride ??
      (basePageIndex > 0 ? (basePages[basePageIndex - 1] as SettingsView) : undefined);
    const next =
      backOverride === undefined && basePageIndex >= 0 && basePageIndex < basePages.length - 1
        ? (basePages[basePageIndex + 1] as SettingsView)
        : undefined;

    return (
      <nav className="page-navigation" aria-label="Settings pages">
        <div>
          {back ? (
            <button type="button" aria-label="Previous settings page" onClick={() => setView(back)}>
              <Chevron direction="left" />
            </button>
          ) : (
            <div className="external-links" aria-label="Project links">
              <GitHubIcon />
              <WebsiteIcon />
            </div>
          )}
        </div>
        {basePageIndex > 0 && (
          <span className="page-indicator">
            {basePageIndex}/{basePages.length - 1}
          </span>
        )}
        {next && (
          <button type="button" aria-label="Next settings page" onClick={() => setView(next)}>
            <Chevron direction="right" />
          </button>
        )}
      </nav>
    );
  }

  return (
    <main className={isDark ? "app-shell dark" : "app-shell"}>
      <section
        className={`settings-panel ${settingsOpen ? "settings-panel-expanded" : "settings-panel-collapsed"}`}
        aria-label="Copy LaTeX settings"
      >
        <h1>LaTeX or Typst?</h1>

        <div className="format-control">
          <span>LaTeX</span>
          <button
            className={`format-switch ${useTypst ? "typst-mode" : "latex-mode"}`}
            type="button"
            role="switch"
            aria-checked={useTypst}
            aria-label="Use Typst output"
            onClick={() => setUseTypst((current) => !current)}
          >
            <img
              className={useTypst ? "switch-thumb switch-thumb-right" : "switch-thumb"}
              src={assets.switchThumb}
              width="18"
              height="18"
              alt=""
            />
          </button>
          <span>Typst</span>
        </div>

        <button
          className="settings-icon"
          type="button"
          aria-expanded={settingsOpen}
          aria-controls="settings-controls"
          aria-label={settingsOpen ? "Collapse settings" : "Expand settings"}
          onClick={() => setSettingsOpen((current) => !current)}
        >
          <SettingsIcon />
        </button>

        {settingsOpen && (
          <div className="settings-controls" id="settings-controls">
            {view === "home" && (
              <div className="settings-page">
                <div className="page-scroll home-page">
                  <div className="transfer-actions">
                    <button type="button" onClick={() => importInputRef.current?.click()}>
                      <ImportIcon />
                      <span>Import settings</span>
                    </button>
                    <button type="button" onClick={exportSettings}>
                      <ExportIcon />
                      <span>Export settings</span>
                    </button>
                  </div>
                  <input
                    ref={importInputRef}
                    className="sr-only"
                    type="file"
                    accept="application/json,.json"
                    onChange={importSettings}
                  />
                  <p className="page-hint">
                    Use the arrows below to navigate between settings pages
                  </p>
                </div>
                {pageFooter()}
              </div>
            )}

            {view === "equations" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>EQUATIONS</h2>

                  <div className="setting-block">
                    <h3>
                      Overlay <span>(&quot;Click to copy&quot;)</span>
                    </h3>
                    <div className="choice-row">
                      <RadioChoice
                        name="overlay-visibility"
                        value="show"
                        current={overlayVisibility}
                        onChange={setOverlayVisibility}
                      >
                        Show
                      </RadioChoice>
                      <RadioChoice
                        name="overlay-visibility"
                        value="hide"
                        current={overlayVisibility}
                        onChange={setOverlayVisibility}
                      >
                        Hide
                      </RadioChoice>
                    </div>
                  </div>

                  {overlayVisibility === "hide" && (
                    <div className="nested-settings">
                      <h3>HIDE OPTIONS</h3>
                      <div className="setting-block">
                        <h4>Copy mode</h4>
                        <div className="choice-row">
                          <RadioChoice
                            name="copy-mode"
                            value="click"
                            current={copyMode}
                            onChange={setCopyMode}
                          >
                            <MouseIcon /> Click
                          </RadioChoice>
                          <RadioChoice
                            name="copy-mode"
                            value="context"
                            current={copyMode}
                            onChange={setCopyMode}
                          >
                            <MouseIcon context /> Right click
                          </RadioChoice>
                        </div>
                      </div>
                    </div>
                  )}

                  {overlayVisibility === "hide" && copyMode === "click" && (
                    <div className="nested-settings">
                      <h3>CLICK OPTIONS</h3>
                      <div className="setting-block">
                        <h4>Copied indicator</h4>
                        <div className="choice-stack">
                          <RadioChoice
                            name="indicator"
                            value="copied"
                            current={copiedIndicator}
                            onChange={setCopiedIndicator}
                          >
                            &quot;Copied ✓&quot; overlay
                          </RadioChoice>
                          <div className="choice-with-action">
                            <RadioChoice
                              name="indicator"
                              value="background"
                              current={copiedIndicator}
                              onChange={setCopiedIndicator}
                            >
                              Background color change
                            </RadioChoice>
                            <button
                              type="button"
                              aria-label="Configure background color"
                              onClick={() => setView("advancedAppearance")}
                            >
                              <SettingsIcon />
                            </button>
                          </div>
                          <div className="choice-with-action">
                            <RadioChoice
                              name="indicator"
                              value="sparkles"
                              current={copiedIndicator}
                              onChange={setCopiedIndicator}
                            >
                              Sparkles
                            </RadioChoice>
                            <button
                              type="button"
                              aria-label="Configure sparkles"
                              onClick={() => setView("advancedAppearance")}
                            >
                              <SettingsIcon />
                            </button>
                          </div>
                          <RadioChoice
                            name="indicator"
                            value="disabled"
                            current={copiedIndicator}
                            onChange={setCopiedIndicator}
                          >
                            Disabled
                          </RadioChoice>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="setting-block">
                    <h3>Cursor on hover</h3>
                    <div className="choice-row">
                      <RadioChoice
                        name="cursor"
                        value="arrow"
                        current={cursor}
                        onChange={setCursor}
                      >
                        <CursorIcon /> Arrow
                      </RadioChoice>
                      <RadioChoice
                        name="cursor"
                        value="pointer"
                        current={cursor}
                        onChange={setCursor}
                      >
                        <CursorIcon pointer /> Pointer
                      </RadioChoice>
                    </div>
                  </div>
                </div>
                {pageFooter()}
              </div>
            )}

            {view === "selection" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>SELECTION</h2>
                  <div className="choice-stack roomy">
                    <CheckboxChoice
                      checked={hijackCopy}
                      onChange={() => setHijackCopy((current) => !current)}
                    >
                      Hijack Ctrl+C to copy as Markdown/Typst
                    </CheckboxChoice>
                    <CheckboxChoice
                      checked={showCopyAs}
                      onChange={() => setShowCopyAs((current) => !current)}
                    >
                      Show &quot;Copy as...&quot; item
                    </CheckboxChoice>
                  </div>
                </div>
                {pageFooter()}
              </div>
            )}

            {view === "appearance" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>APPEARANCE</h2>
                  <div className="setting-block">
                    <h3>Theme</h3>
                    <div className="choice-row">
                      {(["light", "dark", "system"] as Theme[]).map((option) => (
                        <RadioChoice
                          key={option}
                          name="theme"
                          value={option}
                          current={theme}
                          onChange={(value) => setTheme(value as Theme)}
                        >
                          {option[0].toUpperCase() + option.slice(1)}
                        </RadioChoice>
                      ))}
                    </div>
                  </div>
                  <div className="setting-block">
                    <h3>Language</h3>
                    <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                      {[
                        "English",
                        "Spanish",
                        "Catalan",
                        ...customLanguages.map((item) => item.name),
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                    <button
                      className="text-link"
                      type="button"
                      onClick={() => setView("languages")}
                    >
                      Set custom language <Chevron direction="right" />
                    </button>
                  </div>
                  <div className="setting-block">
                    <h3>Advanced options</h3>
                    <button
                      className="text-link"
                      type="button"
                      onClick={() => setView("advancedAppearance")}
                    >
                      Custom indicator <Chevron direction="right" />
                    </button>
                  </div>
                </div>
                {pageFooter()}
              </div>
            )}

            {view === "languages" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>CUSTOM LANGUAGES</h2>
                  <div className="language-list">
                    {customLanguages.map((item) => (
                      <div className="language-row" key={item.id}>
                        <strong>{item.name}</strong>
                        <button type="button" onClick={() => openLanguageEditor(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomLanguages((current) =>
                              current.filter((languageItem) => languageItem.id !== item.id),
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => openLanguageEditor()}
                  >
                    + Add language
                  </button>
                </div>
                {pageFooter("appearance")}
              </div>
            )}

            {view === "languageEditor" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>
                    {editingLanguageId === null ? "NEW LANGUAGE" : languageNameDraft.toUpperCase()}
                  </h2>
                  <label className="field-label">
                    Language name
                    <input
                      value={languageNameDraft}
                      onChange={(event) => setLanguageNameDraft(event.target.value)}
                      placeholder="French"
                    />
                  </label>
                  <div className="translation-editor">
                    <span>{translationFields[translationIndex].label}</span>
                    <Chevron direction="right" />
                    <input
                      value={translationDrafts[translationFields[translationIndex].key] ?? ""}
                      onChange={(event) =>
                        setTranslationDrafts((current) => ({
                          ...current,
                          [translationFields[translationIndex].key]: event.target.value,
                        }))
                      }
                      placeholder="Cliquer pour copier"
                    />
                  </div>
                  <div className="editor-actions">
                    <button
                      type="button"
                      disabled={translationIndex === 0}
                      onClick={() => setTranslationIndex((current) => current - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={translationIndex === translationFields.length - 1}
                      onClick={() => setTranslationIndex((current) => current + 1)}
                    >
                      Next
                    </button>
                    <button className="primary-button" type="button" onClick={saveLanguage}>
                      Save
                    </button>
                  </div>
                </div>
                {pageFooter("languages")}
              </div>
            )}

            {view === "advancedAppearance" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>COPIED INDICATOR</h2>
                  <label className="field-label">
                    Background color
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(event) => setBackgroundColor(event.target.value)}
                    />
                  </label>
                  <div className="setting-block">
                    <h3>Sparkles type</h3>
                    <div className="choice-row">
                      <RadioChoice
                        name="sparkles-type"
                        value="magic"
                        current={sparklesType}
                        onChange={setSparklesType}
                      >
                        Magic
                      </RadioChoice>
                      <RadioChoice
                        name="sparkles-type"
                        value="math"
                        current={sparklesType}
                        onChange={setSparklesType}
                      >
                        Math symbols
                      </RadioChoice>
                    </div>
                  </div>
                  <label className="field-label">
                    Magic sparkles color
                    <input
                      type="color"
                      value={sparklesColor}
                      onChange={(event) => setSparklesColor(event.target.value)}
                    />
                  </label>
                </div>
                {pageFooter(view === "advancedAppearance" ? "appearance" : undefined)}
              </div>
            )}

            {view === "delimiters" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>CUSTOM DELIMITERS</h2>
                  {delimiterGroups.map((group) => (
                    <div className="delimiter-group" key={group.key}>
                      <h3>{group.title}</h3>
                      <div className="delimiter-headings">
                        <span>Inline</span>
                        <span>Display</span>
                      </div>
                      <div className="delimiter-grid">
                        {[0, 2, 1, 3].map((index) => (
                          <input
                            key={index}
                            aria-label={`${group.title} delimiter ${index + 1}`}
                            value={delimiters[`${group.key}-${index}`]}
                            placeholder="None"
                            onChange={(event) =>
                              setDelimiters((current) => ({
                                ...current,
                                [`${group.key}-${index}`]: event.target.value,
                              }))
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {pageFooter()}
              </div>
            )}

            {view === "replacements" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>CUSTOM LATEX REPLACEMENTS</h2>
                  <div className="replacement-list">
                    {replacements.map((rule) => (
                      <div className="replacement-row" key={rule.id}>
                        <input
                          value={rule.source}
                          aria-label="LaTeX source"
                          onChange={(event) =>
                            setReplacements((current) =>
                              current.map((item) =>
                                item.id === rule.id
                                  ? { ...item, source: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Chevron direction="right" />
                        <input
                          value={rule.replacement}
                          aria-label="LaTeX replacement"
                          onChange={(event) =>
                            setReplacements((current) =>
                              current.map((item) =>
                                item.id === rule.id
                                  ? { ...item, replacement: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <button
                          type="button"
                          aria-label="Delete replacement"
                          onClick={() =>
                            setReplacements((current) =>
                              current.filter((item) => item.id !== rule.id),
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="secondary-button" type="button" onClick={addReplacement}>
                    + Add
                  </button>
                </div>
                {pageFooter()}
              </div>
            )}

            {view === "other" && (
              <div className="settings-page">
                <div className="page-scroll">
                  <h2>OTHER</h2>
                  <div className="setting-block">
                    <h3>Markdown bulleted list marker</h3>
                    <div className="choice-row">
                      <RadioChoice
                        name="list-marker"
                        value="*"
                        current={listMarker}
                        onChange={setListMarker}
                      >
                        *
                      </RadioChoice>
                      <RadioChoice
                        name="list-marker"
                        value="-"
                        current={listMarker}
                        onChange={setListMarker}
                      >
                        -
                      </RadioChoice>
                    </div>
                  </div>
                </div>
                {pageFooter()}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
