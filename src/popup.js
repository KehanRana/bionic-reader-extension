// Bionic Reader - Popup Script

const toggle = document.getElementById('enableToggle');
const boldCountSlider = document.getElementById('boldCount');
const boldCountLabel = document.getElementById('boldCountLabel');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const previewText = document.getElementById('previewText');

const BOLD_LABELS = ['Auto', '1 char', '2 chars', '3 chars', '4 chars'];
const BOLD_VALUES = ['auto', 1, 2, 3, 4];

function updatePreview(boldCount) {
  const words = ['Your', 'brain', 'reads', 'faster', 'when', 'bold', 'letters', 'guide', 'your', 'eyes'];
  
  function getBoldLen(wordLength, count) {
    if (count === 'auto' || count === 0) {
      if (wordLength <= 3) return 1;
      if (wordLength <= 6) return 2;
      if (wordLength <= 9) return 3;
      return Math.ceil(wordLength * 0.4);
    }
    return Math.min(parseInt(count), wordLength);
  }

  const html = words.map(word => {
    const len = getBoldLen(word.length, boldCount);
    return `<b>${word.slice(0, len)}</b>${word.slice(len)}`;
  }).join(' ');

  previewText.innerHTML = html + '.';
}

function setStatus(enabled) {
  if (enabled) {
    statusDot.classList.add('active');
    statusText.textContent = 'Active on this page';
  } else {
    statusDot.classList.remove('active');
    statusText.textContent = 'Inactive on this page';
  }
}

function getBoldValue() {
  const idx = parseInt(boldCountSlider.value);
  return BOLD_VALUES[idx];
}

function setBoldSlider(value) {
  const idx = BOLD_VALUES.indexOf(value);
  boldCountSlider.value = idx >= 0 ? idx : 0;
  boldCountLabel.textContent = BOLD_LABELS[idx >= 0 ? idx : 0];
}

// Send message to the active tab
function sendToTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        if (chrome.runtime.lastError) {
          // Content script might not be loaded on this page (e.g. chrome:// pages)
          console.log('Could not connect to content script:', chrome.runtime.lastError.message);
        }
      });
    }
  });
}

// Load saved state
chrome.storage.local.get(['bionicEnabled', 'boldCount'], (result) => {
  const enabled = result.bionicEnabled || false;
  const savedBold = result.boldCount !== undefined ? result.boldCount : 'auto';

  toggle.checked = enabled;
  setBoldSlider(savedBold);
  updatePreview(savedBold);
  setStatus(enabled);
});

// Toggle enable/disable
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  const boldCount = getBoldValue();

  chrome.storage.local.set({ bionicEnabled: enabled });
  setStatus(enabled);

  sendToTab({ action: 'toggle', enabled, boldCount });
});

// Bold count slider
boldCountSlider.addEventListener('input', () => {
  const idx = parseInt(boldCountSlider.value);
  boldCountLabel.textContent = BOLD_LABELS[idx];
  const boldCount = getBoldValue();
  updatePreview(boldCount);

  chrome.storage.local.set({ boldCount });

  if (toggle.checked) {
    sendToTab({ action: 'updateSettings', boldCount });
  }
});
