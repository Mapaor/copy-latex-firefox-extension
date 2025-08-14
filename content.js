console.log("[HoverLatex] content script loaded (Firefox)");

let overlay;
let currentTarget = null;

function findAnnotationTex(el) {
  const katexEl = el.closest('.katex');
  if (!katexEl) return null;

  const ann = katexEl.querySelector('.katex-mathml annotation[encoding="application/x-tex"]');
  if (ann && ann.textContent.trim()) {
    return ann.textContent.trim();
  }

  const dataLatex =
    katexEl.getAttribute('data-tex') ||
    katexEl.getAttribute('data-latex') ||
    katexEl.getAttribute('aria-label');
  if (dataLatex && dataLatex.trim()) return dataLatex.trim();

  return null;
}

function createOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'hoverlatex-overlay';

  // Contingut HTML amb SVG i text
  overlay.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" 
         viewBox="0 0 24 24" fill="none" stroke="currentColor" 
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4
               a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    <span>Click to copy</span>
  `;

  document.body.appendChild(overlay);
}

function showOverlay(target, tex) {
  if (!overlay) createOverlay();

  overlay.dataset.tex = tex;
  const rect = target.getBoundingClientRect();
  const overlayWidth = overlay.offsetWidth;
  const top = rect.top + window.scrollY - overlay.offsetHeight - 8;
  const left = rect.left + window.scrollX + (rect.width / 2) - (overlayWidth / 2);

  overlay.style.top = `${top}px`;
  overlay.style.left = `${left}px`;

  overlay.classList.add('visible');
}

function hideOverlay() {
  if (overlay) {
    overlay.classList.remove('visible');
  }
}

function copyLatex(tex) {
  navigator.clipboard.writeText(tex).then(() => {
    overlay.classList.add('copied');
    overlay.querySelector('span').textContent = 'Copied! ✅';
    setTimeout(() => {
      overlay.classList.remove('copied');
      overlay.querySelector('span').textContent = 'Click to copy';
    }, 1500);
  }).catch(err => {
    console.error("[HoverLatex] Clipboard error:", err);
  });
}

document.addEventListener('mouseover', (e) => {
  const katex = e.target.closest('.katex');
  if (!katex) return;

  const tex = findAnnotationTex(katex);
  if (tex) {
    currentTarget = katex;
    katex.classList.add('hoverlatex-hover');
    showOverlay(katex, tex);
  }
});

document.addEventListener('mouseout', (e) => {
  if (currentTarget && !e.relatedTarget?.closest('.katex')) {
    currentTarget.classList.remove('hoverlatex-hover');
    hideOverlay();
    currentTarget = null;
  }
});

document.addEventListener('click', (e) => {
  const katex = e.target.closest('.katex');
  if (katex) {
    const tex = findAnnotationTex(katex);
    if (tex) {
      copyLatex(tex);
    }
  }
});
