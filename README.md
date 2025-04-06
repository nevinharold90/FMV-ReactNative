# 📱 React Native Project Documentation

This project is built using **React Native** and the **Expo framework**. Below are detailed instructions to set up, run, and understand the project.

---

## 🚀 Project Setup

### ✅ Prerequisites

Make sure you have the following installed:

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

Install Expo CLI globally:

```bash
npm install -g expo-cli
```

---

### 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-folder>
```

2. Install dependencies:

```bash
npm install
```

---

## 🧪 Available Scripts

- **Start Expo Dev Server**:
  ```bash
  npm start
  ```

- **Run on Android**:
  ```bash
  npm run android
  ```

- **Run on iOS (Mac only)**:
  ```bash
  npm run ios
  ```

- **Run on Web**:
  ```bash
  npm run web
  ```

---

## 🗂️ Project Structure

```
.
├── src/                     # Main application source code
├── node_modules/            # Installed dependencies
├── .expo/                   # Expo project configuration
├── .gitignore               # Files to ignore in Git
├── App.tsx                  # Main entry point for the app
├── app.json                 # Application configuration
├── package.json             # Project metadata and scripts
├── tsconfig.json            # TypeScript configuration
└── tailwind.config.js       # TailwindCSS configuration
```

---

## 📚 Dependencies

### Runtime

- `@expo-google-fonts/poppins`
- `@react-native-async-storage/async-storage`
- `@react-native-masked-view/masked-view`
- `@react-navigation/drawer`
- `@react-navigation/native`
- `@react-navigation/stack`
- `axios`
- `expo`
- `expo-app-loading`
- `expo-font`
- `expo-image-picker`
- `expo-status-bar`
- `expo-camera`
- `nativewind`
- `react` (v18.3.1)
- `react-native` (v0.76.3)
- `react-native-gesture-handler`
- `react-native-image-picker`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-vector-icons`
- `tailwindcss`

### Development

- `@babel/core`
- `@react-native-community/cli`
- `@types/react`
- `typescript`

---

## ⚙️ Additional Configuration

### 💨 TailwindCSS with NativeWind

Tailwind-like styling is enabled using **NativeWind**.

- `tailwind.config.js`
- `nativewind-env.d.ts`

📺 [Video Guide](https://www.youtube.com/watch?v=9SdmwQPblBI)

---

### 🖼️ Image Picker

Image picker functionality is implemented using `expo-image-picker`.

---

## 🚚 Deployment

Use Expo CLI to build for each platform:

- **Android**:
  ```bash
  expo build:android
  ```

- **iOS**:
  ```bash
  expo build:ios
  ```

- **Web**:
  ```bash
  expo build:web
  ```

📘 Refer to the [Expo Documentation](https://docs.expo.dev) for more info.

---

## 🤝 Contributing

Feel free to submit issues or pull requests for improvements.

---

## 📝 License

This project is licensed under the **MIT License**.
