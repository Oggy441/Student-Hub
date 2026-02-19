# Student Hub: Mobile App Development & Usage Guide

This guide explains how to modify the application, what can be customized, and its offline capabilities.

## 1. How to Change the Application
Since this is a hybrid app built with **React** and **Capacitor**, the development workflow follows three main steps:

### A. Modify the React Code (Web Layer)
Most changes (UI, themes, logic, schedules) happen in the `src/` directory:
- **UI & Layout**: Edit files in `src/components/`.
- **Logic & Functions**: Edit files in `src/utils/` or context files.
- **Styling**: Modify `.css` files throughout the project.

### B. Sync with Android
After changing the code, you must sync it to the Android project:
```powershell
# 1. Build the React app
npm run build

# 2. Copy the build to the Android folder
npx cap copy
```

### C. Build the APK
To generate a new APK or install it on your device:
```powershell
# In the root directory
cd android
.\gradlew.bat assembleDebug

# To install via ADB
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

---

## 2. What Can You Change?

| Component | Location | What you can do |
| :--- | :--- | :--- |
| **App Icon** | `android/app/src/main/res/` | Replace the `mipmap` icons with your design. |
| **App Name** | `android/app/src/main/res/values/strings.xml` | Change the `app_name` string. |
| **Schedule Widget** | `android/app/src/main/res/layout/widget_schedule.xml` | Change the native XML layout of the home screen widget. |
| **Primary Theme** | `src/index.css` | Modify the CSS variables for colors and fonts. |
| **Schedule Data** | `src/data/scheduleData.js` | Update the hardcoded classes and timings. |

---

## 3. Offline Capabilities
**Yes, the application can run offline**, but with some limitations based on its features:

### ✅ What works offline:
- **Core UI**: The app will load even without internet thanks to the **Service Worker (PWA)** caching.
- **Schedule Widget**: The widget reads from local `SharedPreferences`, so it always shows the last synced schedule, even if you lose internet.
- **Navigation**: You can move between pages that have already been loaded.

### ⚠️ What needs internet:
- **Login/Signup**: Authentication requires a connection to Firebase.
- **Firestore Updates**: Changing your profile or syncing new data to the cloud requires internet.
- **Real-time Sync**: The widget only updates when the app is open and fetches the latest data.

### 💡 Pro Tip:
To make the app **fully offline**, you would need to implement a local database (like SQLite or Ionic Storage) to save all your notes and grades locally before syncing them to the cloud.

---

## 4. Troubleshooting "White Screen"
If you see a white screen after an update:
1. **Clear Cache**: Uninstall the app and reinstall it.
2. **Force Sync**: Ensure you run `npm run build` followed by `npx cap sync` before building the APK.
3. **Check Logs**: Use `adb logcat` to see if there are any JavaScript errors.
