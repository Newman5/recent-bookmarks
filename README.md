# Recent Bookmarks - Track & Review Your Bookmarks

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Available-orange)](https://addons.mozilla.org/en-US/firefox/addon/recent-bookmarks/)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Available-yellow)](https://chromewebstore.google.com/detail/recent-bookmarks/cigejfokaihfggneinjbihcfebeloifj)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Save → Review → Use**

Recent Bookmarks is a small, local-first browser extension that makes your existing bookmarks more useful.

You can bookmark pages normally and organize them with the folders already built into your browser. Recent Bookmarks gives you a simple way to return to what you've recently saved, filter it by date or folder, and export useful sets of bookmarks for whatever comes next.

The goal is not to replace the browser's bookmark system with another service, account, or database. It is to make bookmarks a more useful part of a research and knowledge workflow.

Your bookmark data stays in your browser. [Read the privacy policy](privacy.md).

## 🌟 Features

- 📚 View recently saved bookmarks with timestamps and folder context
- 🔍 Search recent bookmarks by title or URL
- 📅 Filter by date range
- 📁 Filter by one or more bookmark folders
- 🌳 Select a parent folder to include bookmarks from its descendants
- 📤 Export the current filtered set as JSON
- 📤 Export as Netscape Bookmark HTML for browser interoperability
- 🌙 Light and dark theme support
- 🔒 Local-first and privacy-focused — no cloud service or tracking
- 🌐 Works with Firefox and Chrome

This extension requests access to your bookmarks to display and filter your recent bookmarks. It also uses browser storage to save your settings and preferences. **No data is sent outside your browser**.

## 📥 Installation

### Firefox

Install from the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/recent-bookmarks/)

### Chrome / Edge

Install from [Chrome Web Store](https://chromewebstore.google.com/detail/cigejfokaihfggneinjbihcfebeloifj)

## 🚀 Quick Start

1. Save bookmarks normally using your browser
2. Organize them into bookmark folders when useful
3. Open Recent Bookmarks to review what you've recently saved
4. Narrow the list by date, folder, or search
5. Open bookmarks directly or export the filtered set as JSON or Bookmark HTML

**Save → Review → Use**

## 🛠️ Development

### Prerequisites

- Node.js 20+ and npm 9+
- Firefox or Chrome for testing

### Setup

```bash
# Clone the repository
git clone https://github.com/Newman5/recent-bookmarks.git
cd recent-bookmarks

# Install dependencies
npm install

# Run linter
npm run lint

# Testing Locally

## Firefox
1. Open about:debugging in Firefox:
1. Select This Firefox
1. Click Load Temporary Add1.on
1. Select manifest.json from the project directory

You can also run npm run start:firefox.

## Chrome
1. Open chrome://extensions:
1. Enable Developer mode
1. Click Load unpacked
1. Select the project directory
```

### Project Structure

```txt
recent-bookmarks/
├── background.js          # Background service worker
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── manifest.json         # Extension manifest
├── icons/                # Extension icons

```

## 🗺️ Roadmap

### v0.2 - Testing (Feb 2023)

- [x] Core bookmark viewing
- [x] Basic date filtering
- [x] Time-ago display
- [x] Firefox support

### v1.0 - MVP (Dec 2025)

- [x] Manifest V3 migration
- [x] Modern UI with dark mode
- [x] Search functionality
- [x] Cross-browser support (Chrome and Firefox)
- [x] Fixing the Favicon API call that reduces privacy

### v1.1 — Folder Context + Portable Bookmarks (Aug 2026)

- [x] Display bookmark folder context
- [x] Filter recent bookmarks by folder
- [x] Include descendant folders when filtering
- [x] Remember folder selections locally
- [x] Export filtered bookmarks as JSON
- [x] Export standard Netscape Bookmark HTML
- [x] Remove external favicon requests
- [x] Store extension preferences locally

### What's Next

Recent Bookmarks is exploring how the browser's native bookmark system can become a better starting point for research and knowledge workflows.

Possible directions include better interchange formats, tools that consume exported bookmark sets, and improvements suggested by people using the extension.

Ideas, experiments, and contributions are welcome. See [GitHub Issues](https://github.com/Newman5/recent-bookmarks/issues) and [GitHub Discussions](https://github.com/Newman5/recent-bookmarks/discussions).

## 🤝 Contributing

Contributions are welcome! Whether it's:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📝 Documentation improvements
- 🔧 Code contributions

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 💰 Support

This project is free and open source. If you find it useful, consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📣 Sharing with others

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

Based on:

- [Firefox WebExtensions Examples](https://github.com/mdn/webextensions-examples/tree/master/bookmark-it)
- MDN Web Extensions tutorials
- Community feedback and contributions

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/Newman5/recent-bookmarks/issues)

---

Built with ❤️ for people who love to learn and reflect
