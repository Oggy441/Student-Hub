# Student App

A simple web and mobile app to help manage student life - keeping track of notes, schedules, and grades (still working on this part!).

It's built with React 19 and Vite, uses Firebase for auth, and has some AI features baked in using Groq and Gemini. Also wraps into an Android app using Capacitor.

## Features

*   **Notes:** Write and organize your study notes. Supports PDF reading too.
*   **Schedule:** Keep track of your classes and deadlines.
*   **Grades:** (WIP) Track your GPA and assignments.
*   **Auth:** Simple email/password login powered by Firebase.
*   **Cross-platform:** Works in the browser and as a native Android app.

## Tech Stack

*   Frontend: React 19, React Router, Vite
*   Backend/Auth: Firebase
*   AI stuff: Groq, Google Gemini
*   Mobile: Capacitor (Android)
*   Misc: pdf.js for rendering PDFs

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then you can start the dev server:

```bash
npm run dev
```

## Other Commands

*   `npm run build`: Build for production.
*   `npm run build-android`: Build the Android APK (make sure you have Android Studio set up).
*   `npm run lint`: Run ESLint to catch errors.

## TODOs

*   Finish the Grades page (currently commented out in routing)
*   Maybe add iOS support later?
