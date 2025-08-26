// Inject page script for MathJax v3 extraction
function injectMathJaxPageScript() {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      var mathjax = window.MathJax;
      var version = mathjax && mathjax.version ? mathjax.version : null;
      if (!mathjax || !(version && (version.startsWith('3') || version.startsWith('4')))) {
        return;
      }
      function getLatexForContainer(mjxContainer) {
        if (typeof MathJax !== 'undefined' && MathJax.startup && MathJax.startup.document && MathJax.startup.document.math) {
          let current = MathJax.startup.document.math.list;
          const targetHTML = mjxContainer.innerHTML;
          while (current && current.data) {
            const mathItem = current.data;
            if (mathItem.typesetRoot && mathItem.typesetRoot.innerHTML === targetHTML) {
              if (mathItem.math && typeof mathItem.math === 'string') {
                return mathItem.math.trim();
              }
            }
            current = current.next;
            if (current === MathJax.startup.document.math.list) break;
          }
        }
        return null;
      }

      document.addEventListener('mouseover', function(e) {
        const mjx = e.target.closest('mjx-container');
        if (mjx) {
          const latex = getLatexForContainer(mjx);
          if (latex) {
            window.postMessage({ type: 'HoverLatex_MathJaxV3', latex, mjxId: mjx.getAttribute('ctxtmenu_counter') }, '*');
          }
        }
      }, true);

      document.addEventListener('click', function(e) {
        const mjx = e.target.closest('mjx-container');
        if (mjx) {
          const latex = getLatexForContainer(mjx);
          if (latex) {
            window.postMessage({ type: 'HoverLatex_MathJaxV3', latex, mjxId: mjx.getAttribute('ctxtmenu_counter') }, '*');
          }
        }
      }, true);
    })();
  `;
  document.documentElement.appendChild(script);
}

injectMathJaxPageScript();

// Listen for LaTeX messages from the page script
let lastMathJaxV3Latex = null;
window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (event.data && event.data.type === 'HoverLatex_MathJaxV3') {
    lastMathJaxV3Latex = event.data.latex;
  }
});

let overlay;
let currentTarget = null;

function isWikipedia() {
  const hostname = window.location.hostname;
  return hostname.endsWith('.wikipedia.org') || hostname === 'www.wikiwand.com' || hostname === "wikimedia.org" || hostname.endsWith(".wikiversity.org") || hostname.endsWith(".wikibooks.org");
}

function findWikipediaTex(el) {
  // Only work on Wikipedia/Wikiwand sites
  if (!isWikipedia()) return null;
  
  // Check if it's a Wikipedia math image
  if (el.tagName === 'IMG' && 
      (el.classList.contains('mwe-math') || 
      el.classList.contains('mwe-math-fallback-image-inline') ||
      el.classList.contains('mwe-math-fallback-image-display'))) {
    const alt = el.getAttribute('alt');
    if (alt && alt.trim()) {
      // Remove leading '{\displaystyle' and trailing '}'
      const match = alt.trim().match(/^\{\\displaystyle\s*([\s\S]*?)\}$/);
      if (match) {
        return match[1].trim();
      }
      return alt.trim();
    }
  }
  
  return null;
}

function findMathJaxV3Tex(el) {
  // Check for MathJax v3 containers
  const mjxContainer = el.closest('mjx-container');
  if (!mjxContainer) {
    return null;
  }

  // Use the last received LaTeX from the page script
  if (lastMathJaxV3Latex) {
    return lastMathJaxV3Latex;
  }

  // Fallback: try to find any associated script elements nearby
  let current = mjxContainer;
  for (let i = 0; i < 5; i++) { // Check a few siblings
    if (current.nextElementSibling) {
      current = current.nextElementSibling;
      if (current.tagName === 'SCRIPT' && 
          (current.type === 'math/tex' || current.type === 'math/tex; mode=display')) {
        return current.textContent.trim();
      }
    } else {
      break;
    }
  }

  return null;
}

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

function findMathJaxTex(el) {
  // Check for MathJax display equations
  const mathJaxDisplay = el.closest('.MathJax_Display, .MJXc-display');
  if (mathJaxDisplay) {
    // Look for the script element after the display div
    let sibling = mathJaxDisplay.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === 'SCRIPT' && 
          sibling.type === 'math/tex; mode=display') {
        return sibling.textContent.trim();
      }
      sibling = sibling.nextElementSibling;
    }
  }

  // Check for MathJax inline equations (various formats)
  const mathJaxInline = el.closest('.MathJax, .mjx-chtml, .MathJax_CHTML, .MathJax_MathML');
  if (mathJaxInline) {
    // For traditional MathJax elements with IDs
    if (mathJaxInline.id && mathJaxInline.id.includes('MathJax-Element-')) {
      // Look for the script element after the MathJax span
      let sibling = mathJaxInline.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === 'SCRIPT' && 
            sibling.type === 'math/tex') {
          return sibling.textContent.trim();
        }
        sibling = sibling.nextElementSibling;
      }
    }
    
    // For newer MathJax formats (mjx-chtml, MathJax_CHTML)
    // Look for script elements with math/tex type
    let sibling = mathJaxInline.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === 'SCRIPT' && 
          (sibling.type === 'math/tex' || sibling.type === 'math/tex; mode=display')) {
        return sibling.textContent.trim();
      }
      sibling = sibling.nextElementSibling;
    }
  }

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
  // Check for Wikipedia math images first (only on Wikipedia/Wikiwand sites)
  if (isWikipedia()) {
    const wikipediaTex = findWikipediaTex(e.target);
    if (wikipediaTex) {
      currentTarget = e.target;
      e.target.classList.add('hoverlatex-hover');
      showOverlay(e.target, wikipediaTex);
      return;
    }
  }

  // Check for KaTeX elements
  const katex = e.target.closest('.katex');
  if (katex) {
    const tex = findAnnotationTex(katex);
    if (tex) {
      currentTarget = katex;
      katex.classList.add('hoverlatex-hover');
      showOverlay(katex, tex);
      return;
    }
  }

  // Check for MathJax v3 elements
  const mjxContainer = e.target.closest('mjx-container');
  if (mjxContainer) {
    const tex = findMathJaxV3Tex(mjxContainer);
    if (tex) {
      currentTarget = mjxContainer;
      mjxContainer.classList.add('hoverlatex-hover');
      showOverlay(mjxContainer, tex);
      return;
    }
  }

  // Check for MathJax elements
  const mathJaxDisplay = e.target.closest('.MathJax_Display, .MJXc-display');
  const mathJaxInline = e.target.closest('.MathJax, .mjx-chtml, .MathJax_CHTML, .MathJax_MathML');
  
  if (mathJaxDisplay || mathJaxInline) {
    const mathElement = mathJaxDisplay || mathJaxInline;
    const tex = findMathJaxTex(mathElement);
    if (tex) {
      currentTarget = mathElement;
      mathElement.classList.add('hoverlatex-hover');
      showOverlay(mathElement, tex);
    }
  }
});

document.addEventListener('mouseout', (e) => {
  if (currentTarget && 
      !e.relatedTarget?.closest('.katex') && 
      !e.relatedTarget?.closest('mjx-container') &&
      !e.relatedTarget?.closest('.MathJax_Display, .MJXc-display') && 
      !e.relatedTarget?.closest('.MathJax, .mjx-chtml, .MathJax_CHTML, .MathJax_MathML') &&
      !(isWikipedia() && 
        e.relatedTarget?.tagName === 'IMG' && 
        (e.relatedTarget?.classList.contains('mwe-math') || 
        e.relatedTarget?.classList.contains('mwe-math-fallback-image-inline') ||
        e.relatedTarget?.classList.contains('mwe-math-fallback-image-display')))) {
    currentTarget.classList.remove('hoverlatex-hover');
    hideOverlay();
    currentTarget = null;
  }
});

document.addEventListener('click', (e) => {
  // Check for Wikipedia math images first (only on Wikipedia/Wikiwand sites)
  if (isWikipedia()) {
    const wikipediaTex = findWikipediaTex(e.target);
    if (wikipediaTex) {
      copyLatex(wikipediaTex);
      return;
    }
  }

  // Check for KaTeX elements
  const katex = e.target.closest('.katex');
  if (katex) {
    const tex = findAnnotationTex(katex);
    if (tex) {
      copyLatex(tex);
      return;
    }
  }

  // Check for MathJax v3 elements
  const mjxContainer = e.target.closest('mjx-container');
  if (mjxContainer) {
    const tex = findMathJaxV3Tex(mjxContainer);
    if (tex) {
      copyLatex(tex);
      return;
    }
  }

  // Check for MathJax elements
  const mathJaxDisplay = e.target.closest('.MathJax_Display, .MJXc-display');
  const mathJaxInline = e.target.closest('.MathJax, .mjx-chtml, .MathJax_CHTML, .MathJax_MathML');
  
  if (mathJaxDisplay || mathJaxInline) {
    const mathElement = mathJaxDisplay || mathJaxInline;
    const tex = findMathJaxTex(mathElement);
    if (tex) {
      copyLatex(tex);
    }
  }
});
