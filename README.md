<div align="center">
  <img src="public/logos/logo.png" alt="HackVault Logo" width="120" height="120">
  
  # HackVault
  
  ### Zero-Knowledge Password Manager Built with Security First
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
  
  [Live Demo](https://hackvault.vercel.app) · [Report Bug](https://github.com/yourusername/hackvault/issues) · [Request Feature](https://github.com/yourusername/hackvault/issues)
</div>

---

## 🔐 Features

- **🛡️ Zero-Knowledge Architecture** - Your master password never leaves your device
- **🔒 Military-Grade Encryption** - AES-256-GCM with PBKDF2 key derivation (600,000+ iterations)
- **⚡ Offline-First** - Works completely offline using IndexedDB
- **🌐 Browser Extension** - Chrome/Firefox extension with auto-fill support
- **🎨 Modern UI** - Clean, brutalist design with dark mode
- **📱 Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- **⌨️ Keyboard Shortcuts** - Power-user friendly with shortcuts
- **🔄 Import/Export** - Encrypted backup and restore functionality
- **🎲 Password Generator** - Strong password generation with customizable options
- **🔍 Smart Search** - Instant search across all passwords
- **📊 Analytics Dashboard** - Track your password security at a glance

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
    
        git clone https://github.com/yuvakrishnas/hackvault.git
        cd hackvault

2. **Install dependencies**

        npm install

3. **Run development server**

        npm run dev


4. **Open your browser**

        Navigate to http://localhost:3000

### Build for Production

        npm run build
        npm start


---

## 🧩 Browser Extension Setup

1. **Build the web app first** (required for syncing)
2. **Load the extension:**
   - Open Chrome: `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Sync passwords:**
   - Open HackVault web app
   - Login to your vault
   - Click "Sync Extension" button
   - Extension is now ready to use!

### Extension Features
- 🎯 Auto-detect login forms
- ⚡ One-click password fill
- 🔍 Search passwords from any page
- 🎨 Matches website styling

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn UI** - Accessible component library

### Security
- **Web Crypto API** - Native browser encryption
- **AES-256-GCM** - Authenticated encryption
- **PBKDF2** - Key derivation (600,000 iterations)
- **Salt per password** - Additional security layer

### Storage
- **IndexedDB** - Client-side encrypted storage
- **Dexie.js** - Modern IndexedDB wrapper
- **No backend** - True zero-knowledge architecture

### Extension
- **Manifest V3** - Modern Chrome extension API
- **Content Scripts** - Auto-fill functionality
- **Service Worker** - Background sync

---

## 📁 Project Structure

    hackvault/
    ├── app/ # Next.js app directory
    │ ├── globals.css # Global styles
    │ ├── layout.tsx # Root layout
    │ ├── page.tsx # Main page
    │ ├── loading.tsx # Loading state
    │ └── error.tsx # Error boundary
    ├── components/ # React components
    │ ├── auth/ # Authentication
    │ ├── vault/ # Password vault
    │ ├── ui/ # UI components
    │ └── ...
    ├── lib/ # Core libraries
    │ ├── crypto/ # Encryption utilities
    │ ├── storage/ # Database operations
    │ └── ...
    ├── extension/ # Browser extension
    │ ├── popup/ # Extension popup
    │ ├── content/ # Content scripts
    │ ├── background/ # Service worker
    │ └── manifest.json
    ├── public/ # Static assets
    │ ├── logos/ # Brand assets
    │ └── ...
    └── ...


---

## 🔒 Security Features

### Encryption
- **AES-256-GCM** encryption for all passwords
- **PBKDF2** with 600,000+ iterations for key derivation
- **Unique salt** for each password entry
- **Unique IV (Initialization Vector)** per encryption

### Zero-Knowledge
- Master password never transmitted
- All encryption happens client-side
- No server-side password storage
- No analytics or tracking

### Best Practices
- Content Security Policy (CSP)
- HTTPS enforcement
- XSS protection
- CSRF protection
- No third-party dependencies for crypto

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search |
| `Ctrl/Cmd + N` | Add new password |
| `Ctrl/Cmd + G` | Open password generator |
| `Esc` | Close dialogs |

---

## 🎯 Roadmap

- [x] Core password manager functionality
- [x] Browser extension
- [x] Dark mode
- [x] Export/Import
- [x] Password generator
- [ ] Password strength meter
- [ ] Breach detection
- [ ] Two-factor authentication
- [ ] Biometric unlock
- [ ] Browser sync
- [ ] Mobile apps (iOS/Android)
- [ ] Password sharing
- [ ] Team features

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built as part of the YSWS (Year of Shipping & Winning Streak) program at Hack Club
- Inspired by modern password managers with a focus on privacy
- Special thanks to the open-source community

---

## 📧 Contact

**Krishna Naveen** - [@yourusername](https://github.com/yourusername)

Project Link: [https://github.com/yourusername/hackvault](https://github.com/yourusername/hackvault)

---

## ⚠️ Disclaimer

This is a personal project built for educational purposes. While it implements industry-standard encryption, please use at your own risk. Always maintain backups of your passwords.

---

<div align="center">
  Made with ❤️ and lots of ☕ by Krishna Naveen
  
  ⭐ Star this repo if you find it useful!
</div>
