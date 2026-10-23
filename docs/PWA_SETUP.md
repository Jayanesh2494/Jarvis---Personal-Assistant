# JARVIS PWA — Architecture & Setup Guide

## 1. Executive Summary

**JARVIS** is an on-device personal AI assistant built with a Stark Industries-inspired HUD design, zero cloud data leakage, and a modular architecture.

In accordance with the primary directive (*"first develop the web application and then convert into a PWA"*), JARVIS has been implemented as a high-performance, standalone web application that installs directly onto Android, Windows, and macOS devices as a Progressive Web App (PWA).

---

## 2. Technical Architecture

```
web-pwa/
├── css/
│   ├── style.css           # Stark Design System tokens, typography, HUD header, responsive dock
│   ├── dashboard.css       # Arc reactor animations, metric tiles, shortcuts grid
│   └── modules.css         # Voice Studio, Reminders cards, Tactical Planner timeline, LinkedIn Studio
├── js/
│   ├── memory.js           # LocalStorage vault (profile, goals, notes, reminders, export JSON)
│   ├── intentRouter.js     # Autonomous intent classifier & natural language parser
│   ├── voice.js            # Web Speech STT, SpeechSynthesis TTS, reactive visualizer
│   ├── reminders.js        # NL date/time parser, CRUD, snooze, scheduled notifications
│   ├── planner.js          # Algorithmic daily time-block allocator (GATE, Coding, Projects)
│   ├── linkedinStudio.js   # Content synthesizer, compliance validator, copy/save engine
│   ├── shortcuts.js        # System intents (dialler, email, calendar, camera, share sheet)
│   └── app.js              # PWA service worker registration, navigation, telemetry clock
├── icons/
│   ├── icon-192.svg        # 192x192 maskable PWA icon
│   └── icon-512.svg        # 512x512 high-resolution Arc Reactor icon
├── manifest.json           # Web App Manifest (standalone display, theme-color #00f2fe, shortcuts)
├── sw.js                   # Service Worker with Stale-While-Revalidate offline caching
└── index.html              # Semantic HTML5 HUD structure with 7 specialized modules
```

---

## 3. Core Modules & Features

### Module 1: Tactical Dashboard & HUD
- **Stark Arc Reactor**: Animated SVG core with pulsing energy aura and rotating kinetic rings.
- **Live Telemetry**: Real-time HUD system clock (HH:MM:SS) and date badge.
- **Tactical Metric Tiles**: Active task counter, dynamic completion rate (`OPTIMAL` / `IN PROGRESS`), recommended focus hours, and on-device privacy status.
- **Primary Directives**: Live synchronized priority list with one-tap completion.
- **Web Intent Shortcuts**: One-tap access to dialler (`tel:`), email (`mailto:`), Google Calendar, LinkedIn, Web Share API, and optical camera feed.

### Module 2: Neural Voice & Conversation Studio
- **Web Speech API Recognition (STT)**: Tap-to-speak interface without dummy delays. Directly transcribes speech to directives.
- **Speech Synthesis (TTS)**: Autonomous voice response with pitch and speed calibration knobs (0.7x to 1.5x) and a dedicated stop-speech button.
- **Sound Equalizer**: 16 reactive frequency equalizer bars that dance during listening and speaking.
- **Suggested Directives**: Quick-launch chips for common prompts (`"What do I need to do today?"`, `"Remind me to study GATE at 7 PM"`, `"Draft AWS LinkedIn post"`).

### Module 3: Reminders & Task Management
- **Natural Language Parsing**: Resolves statements like:
  - `"Remind me to study GATE at 7 PM"`
  - `"Submit project report tomorrow at 10 AM"`
  - `"Review system architecture tomorrow 2 PM"`
- **Full CRUD & Snooze**: Filter by All, Pending, Resolved, and High Priority. One-click +30 min snooze.
- **Background Alert Loop**: Monitors active alerts every 30 seconds and fires system notifications / vocal alerts when due.

### Module 4: Daily Tactical Planner
- **Algorithmic Allocation**: Configurable available hours (1 to 16) and primary focus area (`GATE Preparation`, `Software Architecture & Coding`, `AWS & Cloud Projects`, `Balanced`).
- **Time-Blocked Timeline**: Allocates morning deep-work blocks, cognitive resets, reminder integration, and evening synthesis.

### Module 5: LinkedIn Content Studio
- **Strategic Drafting**: Post synthesizer with category selectors (`Workshop Recap`, `Project Launch`, `Technical Breakdown`, `Learning Reflection`, `Achievement`).
- **Compliance & Quality Check**: Enforces hooks in the first 2 lines, structured key takeaways, clear call to actions, and authentic, non-fabricated metrics.
- **One-Tap Actions**: Copy to clipboard, save draft to Memory Vault, and direct launch to LinkedIn.

### Module 6: Personal Memory & Cognitive Vault
- **Identity & Goals**: Display name, primary career objective, and learning interests.
- **Privacy & Safety**: 100% on-device storage in `localStorage`. One-click JSON data export and permanent wipe safeguards.

---

## 4. How to Run Locally

1. Start a local HTTP server:
   ```bash
   python -m http.server 8080 --directory web-pwa
   ```
2. Open your browser:
   ```
   http://localhost:8080
   ```

---

## 5. Installing as a PWA on Android

1. Open Chrome on your Android device and navigate to your deployed HTTPS URL or local IP:
   ```
   http://<your-local-ip>:8080
   ```
2. Tap the browser menu (`⋮`) and select **"Add to Home Screen"** or **"Install App"**.
3. JARVIS will install as a standalone app with its own icon on your home screen and app drawer, running full-screen without browser address bars.
