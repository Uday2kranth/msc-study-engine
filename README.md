# 📚 M.Sc. Data Science - Study Engine

A cross-subject syllabus coordination and overlap analytics dashboard designed for Semester IV. This engine helps students analyze overlapping concepts across Cryptography, Data Mining, Sentiment Analysis, and Web Mining.

---

## 🚀 Key Features

* **Authorized Access Control**: Front-door router protecting dashboard contents using local session validation for 6 pre-registered users.
* **Vercel Serverless Logs (`/api/notify`)**: Secure integration with Gmail API (via OAuth2 and Nodemailer) to dispatch real-time alerts to the administrator's inbox:
  * `LOGIN`: Triggered immediately upon a successful authentication handshake.
  * `DURATION`: Measures active time spent on individual pages when a user switches tabs, minimizes their window, or exits.
* **Persistent Theme Engine**: Toggle between a dark mode and a sleek, high-contrast light mode.
* **Mobile Structuring Mockup**: Emulate how pages render inside standard 5.5" to 7" mobile viewports using a toggleable virtual bezel and camera notch.
* **Session Memory**: Theme settings and view layouts persist automatically across page reloads.

---

## 📂 Project Structure

```text
├── api/
│   └── notify.js                   # Vercel serverless function (Gmail SMTP OAuth2 pipeline)
├── scratch/
│   └── get-refresh-token.js        # [Local Only] CLI token generator for Google Cloud Desktop app auth
├── auth.js                         # Core client-side router, authentication, time trackers, & layout togglers
├── index.html                      # Homepage (Interconnectivity map dashboard)
├── login.html                      # Portal login entry page
├── crypto.html                     # Paper I: Cryptography dashboard
├── datamining.html                 # Paper II: Data Mining dashboard
├── sentiment.html                  # Paper III (A): Sentiment Analysis dashboard
├── webmining.html                  # Paper IV (B): Web Mining dashboard
├── questions.html                  # Exam Predictor Sets dashboard
├── style.css                       # Grid layouts, badges, and dark-theme style variables
├── package.json                    # Backend dependencies list (nodemailer)
├── .gitignore                      # Excluded files (local credentials files, scratch folder)
└── README.md                       # Documentation file (this file)
```

---

## 🛠️ Setup & Deployment Guide

### 1. Environment Configuration (on Vercel)
Add the following key-value pairs in Vercel's Environment Variables panel before deploying:

| Key | Description / Value |
| :--- | :--- |
| `GMAIL_USER` | The email address you authorized (sender & receiver). |
| `GMAIL_CLIENT_ID` | Your Google Cloud OAuth2 Client ID. |
| `GMAIL_CLIENT_SECRET` | Your Google Cloud OAuth2 Client Secret. |
| `GMAIL_REFRESH_TOKEN` | The permanent Refresh Token generated from your console client. |

### 2. User Accounts Configuration
Usernames and passwords are hardcoded inside [auth.js](file:///d:/a%20_sem%204%20record/SEM%20MIGFHT%20HELP%20FOR%20EXAM/PREPTIME_PROJECT/auth.js) at the top under `USER_REGISTRY`. Feel free to edit or add new profiles to that list.

### 3. Local Development
To test or generate a new Gmail persistent refresh token locally:
1. Run `node scratch/get-refresh-token.js`.
2. Follow the printed link to sign in, approve the permissions, copy the redirected code, and paste it back into your terminal.
