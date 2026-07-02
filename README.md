# 🔐 QuickShare

**Securely share files and text with optional password protection.**
QuickShare is a modern, lightweight web app that lets users share sensitive information and files easily with encryption and real-time updates — just generate a secure URL and optionally add a password!

🌐 [Live Project](https://locknsend.netlify.app)
📦 [GitHub Repository](https://github.com/hasnainali567/LocknSend)

---

## 🚀 Features

- 🔒 Password-protected sharing (AES-256 encryption)
- 📄 Share Text or 📁 Files
- ⚡ Real-time sync using Firebase Firestore
- 📎 Smart URL generation with copy functionality
- 🔗 Extracts and displays links from shared text
- 🌗 Dark/Light mode toggle
- 🧠 Clean UX & responsive design
- 🧾 LocalStorage caching for unsaved shareable URLs
- ⚠️ Connection-aware saving with offline detection

---

## 🛠️ Tech Stack

- **Frontend**: React, SCSS, Tailwind CSS (utility-first)
- **Backend/DB**: Firebase Firestore, Firebase Storage
- **Encryption**: AES-256 via `CryptoJS`
- **Icons & UI**: Ant Design, Lottie animations, React Icons

---

## 📷 Preview

![QuickShare Preview - Light](./assets/preview-light.png)
![QuickShare Preview - Dark](./assets/preview-dark.png)

---

## 📦 Installation

```bash
git clone https://github.com/hasnainali567/LocknSend.git
cd locknsend
npm install
npm run dev
```
