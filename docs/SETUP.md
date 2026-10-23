# JARVIS — Complete Setup & Deployment Guide

## 1. System Requirements

### Android Development Environment
- **OS**: Windows 10/11, macOS, or Linux
- **IDE**: Android Studio (Hedgehog 2023.1.1 or newer recommended)
- **JDK**: Java Development Kit 17 (bundled with Android Studio)
- **Target Device**: Physical Android Phone or Emulator running **Android 8.0 (API 26) through Android 14 (API 34)**
- **RAM**: Minimum 8GB system RAM (16GB recommended if running emulator)

### Web Application / PWA Environment
- Any modern web browser with ECMAScript 2022 support (Google Chrome, Microsoft Edge, Brave, Safari)
- Python 3.8+ (for local HTTP preview) or any static file web server

---

## 2. Step-by-Step Android Studio Setup

1. **Open Project**:
   - Launch Android Studio.
   - Select **Open** and choose the `android-app` folder inside this repository:
     ```
     c:\Users\jayan\OneDrive\Desktop\Momo\android-app
     ```

2. **Gradle Sync**:
   - Android Studio will automatically identify `settings.gradle.kts` and sync the project dependencies via `gradle/libs.versions.toml`.
   - Ensure the Gradle JDK is set to **Embedded JDK 17** in `File -> Settings -> Build, Execution, Deployment -> Build Tools -> Gradle`.

3. **Running on Physical Device**:
   - Enable **Developer Options** on your phone (tap *Build Number* 7 times in *Settings -> About Phone*).
   - Turn on **USB Debugging**.
   - Connect your phone via USB.
   - Select your device in Android Studio's target device dropdown and click **Run 'app'** (`Shift + F10`).

4. **Generating a Release APK**:
   - In Android Studio, go to `Build -> Generate Signed Bundle / APK...`
   - Select **APK** -> **Next**.
   - Create a keystore or use debug signing.
   - Select **release** build variant and click **Finish**.
   - The resulting `.apk` will be output to `android-app/app/release/app-release.apk`.

---

## 3. Web PWA Setup

1. Start the local server:
   ```bash
   python -m http.server 8080 --directory web-pwa
   ```
2. Navigate to `http://localhost:8080`.
3. To test installation on an Android device:
   - Ensure the phone is connected to the same local Wi-Fi.
   - Find your computer's local IP address (e.g. `ipconfig` -> `192.168.1.X`).
   - Open Chrome on Android and visit `http://192.168.1.X:8080`.
   - Tap Chrome's menu (`⋮`) -> **"Install app"** or **"Add to Home Screen"**.
