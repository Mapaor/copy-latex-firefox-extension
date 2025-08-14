# CopyLaTeX

A Firefox extension that lets you quickly copy LaTeX code (KaTeX or MathJax) from equations displayed on websites like ChatGPT, DeepSeek, or any blog using mathematical equations. It works simply by hovering over an equation and clicking to copy the LaTeX expression.

## How it works technically

1. **Content Script (`content.js`)**:
   - Automatically detects all `<span class="katex">` elements on the page.
   - Extracts the LaTeX code from `<annotation encoding="application/x-tex">`.
   - Shows an overlay when hovering over the equation.
   - Allows clicking to copy the code to clipboard using `navigator.clipboard.writeText()`.
   - Uses an inline `<svg>` to avoid external file dependencies.

2. **CSS (`overlay.css`)**:
   - Overlay styling: white background, subtle border and shadow.
   - Large, readable text.
   - Centered over the KaTeX formula.
   - `pointer` cursor.

3. **Extension declaration `manifest.json`**:
   - Injects `content.js` and `overlay.css`.

## Example GIFs
#### KaTeX
<img src="gif-demo-katex.gif" alt="Demo-KaTeX" width="800">

#### MathJax
<img src="gif-demo-mathjax.gif" alt="Demo-MathJax" width="800"

## Popular Sites Using MathJax/KaTeX
Generally any math, physics, or engineering-related blog or website. Some typical examples:
- KaTeX: ChatGPT, DeepSeek, Notion...
- MathJax: GitHub, Stack Exchange, ProofWiki...

## Links
- Firefox Addon page: _Pending_
- GitHub Repo: [https://github.com/Mapaor/copy-latex-firefox-extension](https://github.com/Mapaor/copy-latex-firefox-extension)
- README as a website: [https://mapaor.github.io/copy-latex-firefox-extension/](https://mapaor.github.io/copy-latex-firefox-extension/)

# Related
A Chrome version is still pending development.