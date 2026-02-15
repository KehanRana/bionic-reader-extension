# Bionic Bold Reader

A Chrome extension that implements bionic reading technology to help you read faster and easier.

## Overview

Bionic Bold Reader bolds the first letters or characters of each word on web pages. This guide-like technique leverages your brain's natural reading patterns to improve reading speed and comprehension by up to 40% while reducing cognitive load.

## Features

- **Toggle on/off** - Enable or disable bionic formatting with a single click
- **Auto mode** - Intelligently bolds approximately 40-50% of each word based on word length
- **Manual control** - Choose how many characters to bold (1-4) to suit your preference
- **Smart processing** - Skips scripts, styles, code blocks, and user input fields
- **Live preview** - See how the formatting looks in the popup
- **Persistent settings** - Your preferences are saved automatically

## How to Install

### From Chrome Web Store
Coming soon!

### Manual Installation (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `src/` directory from this project
6. The extension will appear in your Chrome toolbar

## How to Use

1. Click the **Bionic Reader** icon in your Chrome toolbar
2. Toggle **"Enable on this page"** to activate bionic formatting
3. Adjust the **"Bold intensity"** slider:
   - **Auto** - Let the extension decide based on word length (recommended)
   - **1-4 chars** - Manually set the number of bold characters
4. Your settings are saved and apply to all pages

## How It Works

The extension uses a content script that:

1. Walks through all text nodes on a page
2. Identifies words (letters and numbers)
3. Calculates the optimal number of characters to bold
4. Wraps the bold portion in `<b>` tags
5. Intelligently skips:
   - Scripts and stylesheets
   - Code blocks and inputs
   - Content-editable fields
   - Mathematical formulas and SVG elements

### Auto Bold Calculation

| Word Length | Bold Characters |
|-------------|-----------------|
| 1-3 chars  | 1 char (100%)   |
| 4-6 chars  | 2 chars (~33%)  |
| 7-9 chars  | 3 chars (~33%)  |
| 10-13 chars | 4 chars (~31%)  |
| 14+ chars  | ~40% of word    |

## Project Structure

```
src/
├── manifest.json      # Extension configuration
├── content.js         # Main text processing script
├── popup.html         # Extension popup UI
├── popup.js           # Popup interactions and state
└── icons/             # Extension icons (16x16, 48x48, 128x128)
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome security standard)
- **Permissions**: `activeTab`, `storage`
- **Compatibility**: Works on all HTTP/HTTPS pages
- **Performance**: Optimized DOM processing to avoid page slowdowns

## Settings Storage

User preferences are stored in Chrome's local storage:

- `bionicEnabled` - Boolean, whether the extension is active
- `boldCount` - Number (1-4) or `'auto'` for the bold character count

## Limitations

- Does not work on restricted pages (chrome://, chrome-extension://)
- Does not format text inside images or embedded content
- Text that is already styled may not display as expected

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

Inspired by [bionic reading](https://www.bionic-reading.com/) - a technique designed to optimize the human reading experience.