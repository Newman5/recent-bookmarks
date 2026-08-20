# Recent Bookmarks - Track & Review Your Bookmarks

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Available-orange)](https://addons.mozilla.org/en-US/firefox/addon/recent-bookmarks/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Remember what you saved, reflect on what you learned.**

A modern, cross-browser extension that helps you track, organize, and review your recent bookmarks. Perfect for monthly reflection, research workflows, and staying organized. [Read the PRIVACY.md file](privacy.md)

## 🌟 Features

- 📚 View your recent bookmarks with timestamps
- 🔍 Fast, real-time search
- 📅 Filter by date range (last week, month, etc.)
- 🌙 Dark mode support
- ⚡ Lightning fast and lightweight
- 🔒 Privacy-focused (no cloud, no tracking)
- 🌐 Cross-browser compatible (Firefox, Chrome, Edge)

This extension requests access to your bookmarks to display and filter your recent bookmarks. It also uses browser storage to save your settings and preferences. **No data is sent outside your browser**.

## 📥 Installation

### Firefox

Install from the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/recent-bookmarks/)

### Chrome / Edge

Install from [Chrome Web Store](https://chromewebstore.google.com/detail/cigejfokaihfggneinjbihcfebeloifj)

## 🚀 Quick Start

1. Click the extension icon in your browser toolbar
2. See your recent bookmarks instantly
3. Search or filter to find what you need
4. Click any bookmark to open it

## 🛠️ Development

### Prerequisites

- Node.js 18+ and npm 9+
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

# Test in Firefox
npm run start:firefox

# Build for distribution
npm run package
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

### v0.2 - Current State

- [x] Core bookmark viewing
- [x] Basic date filtering
- [x] Time-ago display
- [x] Firefox support

### v1.0 - MVP (mostly done)

- [x] Manifest V3 migration
- [x] Modern UI with dark mode
- [x] Search functionality
- [x] Cross-browser support (Chrome and Firefox)
- [x] Fixing the Favicon API call that reduces privacy


## Next Release v1.1 — Folder Context + Portable Bookmarks

### Privacy

- [x] Remove external Google favicon requests
- [x] Move extension preferences from storage.sync to storage.local - see issue [#9](https://github.com/Newman5/recent-bookmarks/issues/9)

### Folder Context

- [x] Display bookmark folder paths - see Issue [#13](https://github.com/Newman5/recent-bookmarks/issues/13)
  - [x] Test with real bookmark folder hierarchies and evaluate display

- [x] Filter bookmarks by folder - see issue [#16](https://github.com/Newman5/recent-bookmarks/issues/16)
  - [x] Parent folders include bookmarks from descendant folders
  - [x] Remember selected folder filters locally

### Export

- [ ] Define a small JSON bookmark export schema
- [ ] Export the current filtered bookmark set as JSON
- [ ] Add one additional export/interchange format
  - Candidate: Netscape Bookmark HTML

### Release

- [ ] Firefox testing
- [ ] Chrome testing
- [ ] Run lint/build checks
- [ ] Update README with Save → Review → Use direction
- [ ] Update public roadmap
- [ ] Add open-source/contribution/community message
- [ ] Decide next version number
- [ ] Build release packages
- [ ] Publish Mozilla Add-ons update
- [ ] Publish Chrome Web Store update


### v2.0 - Premium Features (might be diverging in new roadmap)

- [ ] Advanced statistics
- [ ] Foldback privacy grey features - Favicon and Settings sync.
- [ ] Advanced analytics
- [ ] AI-powered categorization
- [ ] Team collaboration

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
- **Discussions**: [GitHub Discussions](https://github.com/Newman5/recent-bookmarks/discussions)

---

Built with ❤️ for people who love to learn and reflect
