// Bionic Bold Reader - Content Script
// Bolds the first N characters of each word based on word length

const BIONIC_CLASS = 'bionic-bold-applied';
const BOLD_SPAN_CLASS = 'bionic-bold';
let isEnabled = false;
let boldCount = 1; // number of chars to bold per word (can be 1 or more)

// Tags to skip - we don't want to alter scripts, styles, inputs, etc.
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT',
  'BUTTON', 'CODE', 'KBD', 'SAMP', 'VAR', 'SVG', 'MATH',
  'HEAD', 'LINK', 'META', 'TITLE'
]);

function getBoldLength(wordLength, boldCount) {
  if (boldCount === 'auto') {
    // Auto mode: bold ~40-50% of each word (like bionic reading)
    if (wordLength <= 3) return 1;
    if (wordLength <= 6) return 2;
    if (wordLength <= 9) return 3;
    if (wordLength <= 13) return 4;
    return Math.ceil(wordLength * 0.4);
  }
  return Math.min(parseInt(boldCount), wordLength);
}

function processTextNode(textNode) {
  const text = textNode.nodeValue;
  if (!text || !text.trim()) return null;

  // Split into words and spaces, preserving all whitespace/punctuation
  const parts = text.split(/(\s+)/);
  
  // Check if there are any actual words to process
  const hasWords = parts.some(part => /\S/.test(part) && part.length > 0);
  if (!hasWords) return null;

  const fragment = document.createDocumentFragment();
  let changed = false;

  for (const part of parts) {
    if (!part) continue;

    // If it's whitespace, add as text node
    if (/^\s+$/.test(part)) {
      fragment.appendChild(document.createTextNode(part));
      continue;
    }

    // It's a "word" (may contain punctuation)
    // Find the actual alphabetic/numeric start to bold
    const match = part.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9].*)$/);
    if (!match) {
      // No letters/numbers found, just add as is
      fragment.appendChild(document.createTextNode(part));
      continue;
    }

    const leadingPunct = match[1];  // punctuation before word (e.g. opening quote)
    const word = match[2];

    // Find length of word (letters/numbers only for calculation, but bold on actual chars)
    const letters = word.match(/[a-zA-Z0-9]+/);
    if (!letters || letters[0].length < 2) {
      // Single char or no letters, don't bold
      fragment.appendChild(document.createTextNode(part));
      continue;
    }

    const boldLen = getBoldLength(letters[0].length, boldCount);
    
    // Add leading punctuation
    if (leadingPunct) {
      fragment.appendChild(document.createTextNode(leadingPunct));
    }

    // Bold part
    const boldSpan = document.createElement('b');
    boldSpan.className = BOLD_SPAN_CLASS;
    boldSpan.textContent = word.slice(0, boldLen);
    fragment.appendChild(boldSpan);

    // Rest of word
    if (word.length > boldLen) {
      fragment.appendChild(document.createTextNode(word.slice(boldLen)));
    }

    changed = true;
  }

  return changed ? fragment : null;
}

function walkAndProcess(node) {
  // Skip unwanted tags
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (SKIP_TAGS.has(node.tagName)) return;
    if (node.isContentEditable) return;
    if (node.classList && node.classList.contains(BIONIC_CLASS)) return;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const replacement = processTextNode(node);
    if (replacement) {
      const wrapper = document.createElement('span');
      wrapper.className = BIONIC_CLASS;
      wrapper.appendChild(replacement);
      node.parentNode.replaceChild(wrapper, node);
    }
    return;
  }

  // Recurse through children (use array copy since we modify DOM)
  const children = Array.from(node.childNodes);
  for (const child of children) {
    walkAndProcess(child);
  }
}

function applyBionic() {
  if (document.body.dataset.bionicApplied === 'true') return;
  document.body.dataset.bionicApplied = 'true';
  walkAndProcess(document.body);
}

function removeBionic() {
  document.body.dataset.bionicApplied = 'false';
  // Find all bionic wrapper spans and unwrap them
  const spans = document.querySelectorAll(`.${BIONIC_CLASS}`);
  for (const span of spans) {
    const parent = span.parentNode;
    if (!parent) continue;
    // Replace span with its text content (reconstructed)
    const text = span.textContent;
    parent.replaceChild(document.createTextNode(text), span);
  }
  // Merge adjacent text nodes
  document.body.normalize();
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    isEnabled = message.enabled;
    boldCount = message.boldCount || 1;
    if (isEnabled) {
      applyBionic();
    } else {
      removeBionic();
    }
    sendResponse({ success: true });
  } else if (message.action === 'getStatus') {
    sendResponse({ enabled: isEnabled });
  } else if (message.action === 'updateSettings') {
    boldCount = message.boldCount || boldCount;
    if (isEnabled) {
      removeBionic();
      setTimeout(applyBionic, 50);
    }
    sendResponse({ success: true });
  }
  return true;
});

// On load, check saved state
chrome.storage.local.get(['bionicEnabled', 'boldCount'], (result) => {
  boldCount = result.boldCount || 'auto';
  if (result.bionicEnabled) {
    isEnabled = true;
    applyBionic();
  }
});
