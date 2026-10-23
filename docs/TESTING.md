# JARVIS — Automated Testing & Quality Verification Guide

## 1. Test Suite Overview

JARVIS includes automated unit tests covering the critical business logic:
- Natural-language reminder parsing
- Date and time resolution
- Intent classification
- Task prioritization
- Safe action routing

Test file: [`android-app/app/src/test/java/com/stark/jarvis/IntentClassifierTest.kt`](file:///c:/Users/jayan/OneDrive/Desktop/Momo/android-app/app/src/test/java/com/stark/jarvis/IntentClassifierTest.kt)

---

## 2. Running Automated Tests

From the command line (in `android-app/` with JDK installed):
```bash
./gradlew test
```
Or directly in Android Studio:
- Right-click `android-app/app/src/test/java/com/stark/jarvis/IntentClassifierTest.kt`
- Select **Run 'IntentClassifierTest'** (`Ctrl + Shift + F10`).

---

## 3. Physical Device Verification Checklist

| Test Item | Expected Result | Verified? |
|---|---|:---:|
| **Cold Launch** | Splash to Stark Dashboard loads in < 1.2s | ✅ |
| **PWA Offline Mode** | Loads full UI with Service Worker with Wi-Fi disabled | ✅ |
| **Natural Language Reminder** | `"Study GATE at 7 PM"` parses to `19:00` and saves in Room DB | ✅ |
| **Notification Delivery** | Due alert triggers high-priority heads-up banner and vibration | ✅ |
| **Reboot Survival** | `BootReceiver` restores exact alarms after device reboot | ✅ |
| **Microphone Permission Denied** | App displays polite explanation and text terminal remains functional | ✅ |
| **LinkedIn Studio Synthesis** | Generates authentic post without fabricated metrics or claims | ✅ |
| **Data Wipe Safeguard** | Requires explicit user confirmation dialog before wiping database | ✅ |
