# Selenium and Appium Live Video Testing Suite

This folder contains automated testing scripts for both the **VocaVision AI React Web Application** (using Selenium) and the **Capacitor Android Mobile Application** (using Appium), with built-in mechanisms for video capture.

---

## 🛠️ Environment Prerequisites

### 1. Common Requirements
- **Python 3.x**
- **FFmpeg**: Required for Appium video encoding. Ensure it's in your system's PATH.

### 2. Selenium Web Setup
- **Google Chrome** installed.
- **Chrome Webdriver** (matched to your Chrome version).

### 3. Appium Mobile Setup
- **Node.js** (to run the Appium server).
- **Appium Server**:
  ```bash
  npm install -g appium
  ```
- **UIAutomator2 Driver**:
  ```bash
  appium driver install uiautomator2
  ```
- **Android SDK & Studio** with an active Android Virtual Device (AVD) running.

---

## 📥 Installation

Navigate to this directory and install Python package dependencies:

```bash
pip install -r requirements.txt
```

---

## 🖥️ 1. Web Testing (Selenium)

The web test script performs real-time screen capture frame-by-frame from Selenium webdriver screenshots and renders them into a high-quality MP4 file.

### Running the Web Test:
1. Ensure your React web app is running locally:
   ```bash
   cd frontend
   npm run dev -- --host 127.0.0.1 --port 5188
   ```
2. Execute the Selenium script:
   ```bash
   python selenium_web_test.py
   ```
3. After the test runs, check the folder for:
   - `selenium_test_record.mp4` (the video of the testing actions).
   - `landing_page_screenshot.png`.

---

## 📱 2. Mobile Testing (Appium)

The mobile test script uses Appium's native `start_recording_screen()` to command the Android Emulator to capture the entire system screen, then decodes it to an MP4 video.

### Running the Mobile Test:
1. Start the Appium Server:
   ```bash
   appium
   ```
2. Ensure your Android Emulator is running and the Capacitor Android project is built:
   ```bash
   cd frontend
   npm run android:sync
   ```
3. Execute the Appium script:
   ```bash
   python appium_mobile_test.py
   ```
4. After the test runs, check the folder for:
   - `appium_test_record.mp4` (the video of the testing session).
   - `mobile_test_step.png`.

---

## 📺 Real-Time Live Video Streaming/Viewing

If you want to view the tests executing in **real-time** on headless environments or stream them live to a UI or browser:

### 1. Mobile Live Previewing (via scrcpy)
To see your Appium tests running in real-time, use **scrcpy** (Screen Copy). It streams the device screen to your computer with ultra-low latency:
- Install `scrcpy` (e.g. `choco install scrcpy` or `brew install scrcpy`).
- Run `scrcpy` in terminal while tests are active.

### 2. Selenium Grid / VNC Live Streaming
If running in a Docker container or remote server, use **Selenoid** or **Selenium Grid (VNC-enabled)**:
- Start Selenoid/Selenium Grid Docker container with VNC.
- Connect your Webdriver to the Grid hub URL.
- Open the VNC viewer or browser-based dashboard (e.g., port 4444) to watch the live browser automation.
