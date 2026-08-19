# VocaVision AI (Web & Android Application)

AI-powered intelligent mock interview and candidate performance analysis system. Both the Web application (React + Vite) and native Android application (Capacitor) share the same root workspace folder.

## 🚀 Live Demo & Online Reports

- **🌐 Live GitHub Pages Site**: [https://saimani433.github.io/AI-MOCKINTERVIEW/](https://saimani433.github.io/AI-MOCKINTERVIEW/)
- **📊 Appium E2E HTML Report**: [https://saimani433.github.io/AI-MOCKINTERVIEW/latest/execution-report.html](https://saimani433.github.io/AI-MOCKINTERVIEW/latest/execution-report.html)
- **📈 Comprehensive Excel Test Suite (2,400 Cases - 100% Pass Rate)**: [`e2e-tests/excel_reports/Master_Comprehensive_Test_Suite_2400.xlsx`](./e2e-tests/excel_reports/Master_Comprehensive_Test_Suite_2400.xlsx)


## Project Structure

```
├── android/               # Capacitor Native Android project
├── src/                   # React + TypeScript source code (Web & Android UI)
├── public/                # Web & App public assets
├── backend/               # Express + TypeScript API backend
├── capacitor.config.ts    # Capacitor configuration
├── vite.config.ts         # Vite build configuration
├── package.json           # Web & Android scripts & dependencies
└── index.html             # Application entry HTML
```

## Running the Application

### 1. Web & Android Application (Root Directory)

Install dependencies and start development server:

```bash
npm install
npm run dev
```

### 2. Android Commands

Sync web build with Android native app or open Android Studio:

```bash
# Build web app and sync to Android native project
npm run android:sync

# Open project in Android Studio
npm run android:open
```

### 3. Backend API Service

```bash
cd backend
npm install
npm run dev
```

### 4. Running Web & Mobile Tunnels

```bash
node start-tunnels.js
```
