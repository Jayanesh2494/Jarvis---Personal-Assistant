# JARVIS — Personal AI Assistant for Android & Web PWA

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web%20PWA-00f2fe)](https://developer.android.com)
[![Architecture](https://img.shields.io/badge/Architecture-Kotlin%20Compose%20%2B%20Room%20%2B%20Vanilla%20PWA-0284c7)](#)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device%20Local-10b981)](#)

A production-oriented personal AI assistant inspired by Iron Man's JARVIS, engineered for Android (Kotlin + Jetpack Compose) and modern browsers as an installable Progressive Web App (PWA).

JARVIS prioritizes **100% on-device local execution**, privacy, natural-language voice interaction, daily tactical planning (GATE preparation & coding sprints), task reminders, and automated LinkedIn content synthesis.

---

## 1. Project Overview & Architecture

```
Momo/
├── android-app/                    # Native Android Studio Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/stark/jarvis/
│   │   │   │   ├── data/
│   │   │   │   │   ├── local/          # Room Database (Entities, DAOs, Migrations)
│   │   │   │   │   └── preferences/    # Jetpack DataStore (Profile, Voice params)
│   │   │   │   ├── domain/
│   │   │   │   │   ├── ai/             # MediaPipe GenAI / Gemma 2B & Rule Fallback
│   │   │   │   │   ├── intent/         # Regex Intent Classifier & Parser
│   │   │   │   │   └── model/          # Pure Domain Models
│   │   │   │   ├── service/            # AlarmScheduler, BootReceiver, Worker, NotificationListener
│   │   │   │   ├── ui/
│   │   │   │   │   ├── components/     # Animated Arc Reactor, HUD Header, Metric Cards
│   │   │   │   │   ├── navigation/     # NavHost & Stark NavigationBar
│   │   │   │   │   ├── screens/        # Dashboard, Voice, Reminders, Planner, LinkedIn, Vault, Core
│   │   │   │   │   └── theme/          # Stark Obsidian & Cyan Design System
│   │   │   │   ├── JarvisApplication.kt
│   │   │   │   └── MainActivity.kt     # SpeechRecognizer, TextToSpeech, Permissions
│   │   │   ├── res/                    # Colors, Themes, Strings, XML extraction rules
│   │   │   └── AndroidManifest.xml
│   │   └── src/test/                   # Unit Tests (IntentClassifier, NL Parser)
│   ├── gradle/                         # Version Catalog (libs.versions.toml) & Wrapper
│   ├── build.gradle.kts
│   └── settings.gradle.kts
│
├── web-pwa/                        # Standalone Web Application & Installable PWA
│   ├── css/                            # Stark HUD CSS tokens, Arc Reactor, Modules
│   ├── js/                             # IntentRouter, Voice STT/TTS, Reminders CRUD, Planner, LinkedIn
│   ├── icons/                          # 192x192 & 512x512 PWA icons
│   ├── manifest.json                   # Web App Manifest (Standalone, Cyan theme)
│   ├── sw.js                           # Stale-While-Revalidate Service Worker
│   └── index.html                      # Semantic HUD interface
│
└── docs/                           # Architecture, Setup, Permissions & Testing Guides
    ├── ARCHITECTURE.md
    ├── SETUP.md
    ├── PWA_SETUP.md
    ├── ANDROID_PERMISSIONS.md
    ├── LOCAL_AI_SETUP.md
    └── TESTING.md
```

---

## 2. Core Modules

| Module | Android Native Implementation | Web PWA Implementation |
|---|---|---|
| **Module 1: Dashboard** | Jetpack Compose + Kinetic `ArcReactor` Canvas | HTML5 Canvas / SVG rotating kinetic rings |
| **Module 2: Voice & STT/TTS** | Android `SpeechRecognizer` + `TextToSpeech` | Web Speech API STT + SpeechSynthesis TTS |
| **Module 3: Reminders & Tasks** | Room Database + `AlarmManager` exact alarms | `localStorage` + scheduled notification loop |
| **Module 4: Tactical Planner** | Algorithmic deep-work allocator | Time-blocked visual timeline |
| **Module 5: LinkedIn Studio** | Quality compliance check + Clipboard API | Post synthesizer + 1-tap copy/launch |
| **Module 6: Memory Vault** | Room SQLite + Jetpack DataStore | Local-first vault + JSON data export |
| **Module 7: Core & Security** | `NotificationListenerService` + System Intents | Web Intents (`tel:`, `mailto:`, camera) |

---

## 3. Quick Start

### Running the Web PWA
```bash
python -m http.server 8080 --directory web-pwa
```
Open `http://localhost:8080` in Chrome/Edge. On Android, tap **"Install App"** / **"Add to Home Screen"**.

### Building the Android App
Open the `android-app/` directory in **Android Studio Hedgehog / Iguana / Jellyfish**:
1. Connect an Android device with Developer Options & USB Debugging enabled (or launch an Emulator running API 26+).
2. Click **Run 'app'** (`Shift + F10`).
3. Grant Microphone and Notification permissions when prompted.

---

## 4. Documentation
- [Setup & Deployment Guide](file:///c:/Users/jayan/OneDrive/Desktop/Momo/docs/SETUP.md)
- [Architecture & Design System](file:///c:/Users/jayan/OneDrive/Desktop/Momo/docs/ARCHITECTURE.md)
- [Android Permissions & Battery Optimization](file:///c:/Users/jayan/OneDrive/Desktop/Momo/docs/ANDROID_PERMISSIONS.md)
- [On-Device AI Setup (MediaPipe / Gemma 2B)](file:///c:/Users/jayan/OneDrive/Desktop/Momo/docs/LOCAL_AI_SETUP.md)
- [Testing & Quality Verification](file:///c:/Users/jayan/OneDrive/Desktop/Momo/docs/TESTING.md)
