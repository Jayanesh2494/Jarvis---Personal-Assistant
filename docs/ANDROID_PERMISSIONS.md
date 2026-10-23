# Android Permissions & Battery Optimization Guide

## 1. Permission Matrix

| Permission | API Level | Purpose | Fallback / Behavior if Denied |
|---|---|---|---|
| `RECORD_AUDIO` | API 23+ | Voice assistant speech recognition via Android `SpeechRecognizer` | Text input remains 100% usable in terminal bar. |
| `POST_NOTIFICATIONS` | API 33+ (Android 13) | Delivers reminder notifications and alerts when tasks are due | Reminders still persist in Room database and display inside app dashboard. |
| `SCHEDULE_EXACT_ALARM` | API 31+ (Android 12) | Ensures reminders trigger at the exact scheduled second | Falls back to WorkManager deferred execution. |
| `RECEIVE_BOOT_COMPLETED` | All | Reschedules pending alarms from Room database after phone reboots | Reminders will trigger upon next manual app launch. |
| `BIND_NOTIFICATION_LISTENER_SERVICE` | All (Settings) | Captures incoming notifications for on-device tactical summaries | Summaries will indicate "Not Connected" without crashing. |

---

## 2. Battery Optimization (Doze Mode)

Modern Android versions aggressively suppress background execution to conserve battery.

To guarantee that your reminders and alerts fire reliably on Samsung, Xiaomi, Pixel, and OnePlus devices:
1. Go to **Settings -> Apps -> JARVIS**.
2. Tap **Battery**.
3. Select **"Unrestricted"** instead of "Optimized".
4. For MIUI/HyperOS devices, enable **Autostart** in app info.

---

## 3. Safe Consequential Action Enforcement & Direct Calling

JARVIS security architecture:
- **Web App / PWA (Browser)**: Triggers `tel:<phone_number>`. Modern mobile operating systems (Android/iOS) intentionally route this via `Intent.ACTION_DIAL` into the dialer pad with the number pre-filled. Android OS strictly prohibits web browsers from executing silent direct calls without user tap to protect against unauthorized toll charges.
- **Native Android App (APK)**: With `android.permission.CALL_PHONE` granted by the user, the app can invoke `Intent(Intent.ACTION_CALL, Uri.parse("tel:..."))` to place direct, zero-tap telephone calls immediately.
- **Emails**: Pre-fills the default email composer — requires user tap to send.
- **Data Deletion**: Protected by explicit confirmation dialogs before Room database wipes.
