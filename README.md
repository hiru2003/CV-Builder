# CV Builder 📝

A premium, cross-platform mobile application built with **React Native** and **Expo** that helps users create professional, high-impact CVs/resumes. The app leverages AI to automatically generate summaries and refine experience points.

---

## 🚀 Key Features

* **AI-Powered Generation**: Instantly generate high-quality CV summaries and professional, actionable experience bullet points using the Google Gemini API.
* **Templates**: Select from beautifully designed templates (Jonathan, Mariana, Richard).
* **Multi-Platform Support**: Works on Android, iOS, and Web.
* **Authentication & Storage**: Fully integrated with Firebase for user authentication and data persistence.
* **PDF Export**: Generate, preview, and share high-quality PDF copies of your CV.

---

## 🛠️ Setup & Running Instructions

### Prerequisites
* Ensure you have [Node.js](https://nodejs.org/) installed.
* Install the **Expo Go** app on your iOS/Android device, or set up simulators (Android Studio / Xcode).

### 1. Install Dependencies
In the root directory, run:
```bash
npm install
```

### 2. Configure Environment Variables
Create or update a `.env` file in the root directory and add your Google Gemini API key:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Application
To launch the Expo development server, run:
```bash
npx expo start
```

Use the terminal interactive commands to open the application:
* Press **`a`** for Android Emulator/device.
* Press **`i`** for iOS Simulator/device.
* Press **`w`** to run on Web.
