# CopyLaTeX

A Firefox extension that lets you quickly copy LaTeX code (KaTeX or MathJax) from equations displayed on websites like ChatGPT, DeepSeek, or any blog using mathematical equations. It works simply by hovering over an equation and clicking to copy the LaTeX expression.

Version 1.1: Now it also works with with Wikipedia and Wikiwand images.

Version 1.2: Now it also works for MathJax v3 (when there is no LaTeX code in the HTML) via API.

Version 1.3: Dark mode enabled and replaced check emoji with SVG icon.

Version 1.4: New feature! Select text (that includes formulas), right click on it and a `Copy as Markdown (with LaTeX)` option will appear.

## How it works technically

1. **Content Script (`content.js`)**:
   -  **For KaTeX**
      - Automatically detects all `<span class="katex">` elements on the page.
      - Extracts the LaTeX code from `<annotation encoding="application/x-tex">`.
   - **For Gemini KaTeX**
     - Extracts LaTeX inside `data-math` attribute.
   - **For MathJax**
     - Extracts LaTeX inside `<script type="math/tex">` elements.
   - **For MathJax v3/v4**
      - Injects page script (`mathjax-api.js`) to extract LaTeX from `mjx-container` elements via MathJax's API. Only possible via API and inject script because no LaTeX code present in the generated HTML.
   - **For Wikipedia**
     - Extracts LaTeX from `alt` attributes of images.
   - **For all of them** 
   - Shows an overlay when hovering over the equation.
   - Allows clicking to copy the code to clipboard using `navigator.clipboard.writeText()`.
   - Uses an inline `<svg>` to avoid external file dependencies.

2. **CSS (`overlay.css`)**:
   - Overlay styling: white background, subtle border and shadow.
   - Large, readable text.
   - Centered over the KaTeX formula.
   - `pointer` cursor.

3. **Extension declaration `manifest.json`**:
   - Injects `content.js`, `overlay.css` and the other scripts.
   - Sets information and permissions of the extension.
4. **Background script `background.js`**:
   - Handles context menu (right click). Needed to display the "Copy as Markdown" option when right clicking the selected text.
5. **Selection script `selection-to-markdown.js`**:
   - A set of functions, workers and utilities to convert HTML to markdown while preserving our extracted LaTeX. Under the hood uses the `turndown.js` library and the `turndown-plugin-gfm.js` GitHub-flavored markdown plugin for converting HTML to Markdown.

## Example GIFs
#### KaTeX
<img src="assets/gif-demo-katex.gif" alt="Demo-KaTeX" width="800">

#### MathJax
<img src="assets/gif-demo-mathjax.gif" alt="Demo-MathJax" width="800">

#### Wikipedia images
<img src="assets/gif-demo-wikipedia.gif" alt="Demo-MathJax" width="800">

## Popular Sites Using MathJax/KaTeX
Generally any math, physics, or engineering-related blog or website. Some typical examples:
- KaTeX: ChatGPT, DeepSeek, Notion...
- MathJax: Stack Exchange, ProofWiki...

## Host premissions and speed
The javascript source code is extremely simple and available [here](https://github.com/Mapaor/copy-latex-firefox-extension/blob/main/content.js). It loads after everything and is blazingly fast.

However you can always customize in which hosts (websites) the extension loads or not:

<img src="assets/toggle-firefox.jpg" alt="Manage-extension-permissions" width="800">

This is done in "Firefox Settings > Extensions & Themes" (or simply search `about:addons`), clicking the extension and choosing the tab "Premissions and Data".

In case you turn off the "all sites" toggle option, you can also add manual sites that are not in the default list.

<img src="assets/manual-specific-site.jpg" alt="Manage-extension-permissions" width="800">

And now the custom site should appear as a new toggle in the "Permissions and data" tab.

## Links
- Firefox Add-on page: [https://addons.mozilla.org/en-US/firefox/addon/copy-latex](https://addons.mozilla.org/en-US/firefox/addon/copy-latex)
- GitHub Repo: [https://github.com/Mapaor/copy-latex-firefox-extension](https://github.com/Mapaor/copy-latex-firefox-extension)
- README as a website: [https://mapaor.github.io/copy-latex-firefox-extension/](https://mapaor.github.io/copy-latex-firefox-extension/)

## License

MIT License.

It is MIT Licensed so that anyone can customize it to their needs but please don't just copy-cat the code and publish it with a new name, it's weird. 

If you have an idea for a new feature open an issue and let me know! Also if you have the time to implement a feature you want it would be great if you made a pull request.

## Planned features:

- [X] **Text selection to Markdown**: Select some text that includes equations, right click and a new option "[Extension Icon] Copy as Markdown" appears.
- [ ] **Typst support**: 
  Pop up with a toggle between LaTeX and Typst
- [ ] **Custom  delimiters**: 
Chose between no delimiters (default), `$` and `$$`, `\(` and `\[`, always `$`, or always `$$`.

# Related
There is also a Chrome version of this extension: [https://github.com/Mapaor/copy-latex-chrome-extension](https://github.com/Mapaor/copy-latex-chrome-extension) 