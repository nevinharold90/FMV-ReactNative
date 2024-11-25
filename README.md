
# React Native Project Documentation

This project is built using React Native and the Expo framework. Below are the detailed instructions to set up, run, and understand the project.

---

## **Project Setup**

### **Prerequisites**
1. **Node.js** (v16 or later)
2. **npm** or **yarn** installed
3. Expo CLI installed globally:
   ```bash
   npm install -g expo-cli
   ```

---

### **Installation**
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

## **Available Scripts**

### **Start the Expo Development Server**
```bash
npm start
```

### **Run on Android Emulator/Device**
```bash
npm run android
```

### **Run on iOS Emulator (Mac only)**
```bash
npm run ios
```

### **Run on Web Browser**
```bash
npm run web
```

---

## **Project Structure**

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

## **Dependencies**
Below is a list of the dependencies used in this project:

1. **`@expo-google-fonts/poppins`**: Fonts from Google, specifically Poppins, tailored for Expo.
2. **`@react-native-async-storage/async-storage`**: For storing persistent key-value data locally.
3. **`@react-native-masked-view/masked-view`**: To mask views in React Native, often used with navigators.
4. **`@react-navigation/drawer`**: Drawer-based navigation for React Native.
5. **`@react-navigation/native`**: Core library for navigation in React Native.
6. **`@react-navigation/stack`**: For stack-based navigation.
7. **`axios`**: A library for making HTTP requests.
8. **`expo`**: The Expo framework, which provides a managed environment for React Native apps.
9. **`expo-app-loading`**: A component for showing a loading screen while your app's assets are loading.
10. **`expo-font`**: To manage fonts in your Expo app.
11. **`expo-image-picker`**: To select or take images with the device's camera or gallery.
12. **`expo-status-bar`**: A customizable status bar for your app.
13. **`nativewind`**: Tailwind CSS-like styling for React Native.
14. **`react`**: The core React library, version `18.3.1`.
15. **`react-native`**: The core React Native library, version `0.76.3`.
16. **`react-native-gesture-handler`**: Enables gesture-based interactions.
17. **`react-native-image-picker`**: Library to pick images from the device's gallery or camera.
18. **`react-native-reanimated`**: Animation library for complex interactions.
19. **`react-native-safe-area-context`**: Helps with handling safe area insets for devices with notches, etc.
20. **`react-native-screens`**: Native navigation screens for React Native.
21. **`react-native-vector-icons`**: Provides scalable vector icons for React Native.
22. **`tailwindcss`**: Utility-first CSS framework for styling.
23. **`expo-camera`**: Provides camera functionality in Expo projects.

---

## **Dev Dependencies**
1. **`@babel/core`**: Babel compiler for ES6+ syntax.
2. **`@react-native-community/cli`**: React Native CLI tools for development.
3. **`@types/react`**: TypeScript types for React.
4. **`typescript`**: TypeScript language.

---

## **Additional Configuration**


### **TailwindCSS**
The project uses **NativeWind**, a Tailwind CSS-like library for React Native. Configurations are located in:
- `https://www.youtube.com/watch?v=9SdmwQPblBI` <--- Link
- `tailwind.config.js`
- `nativewind-env.d.ts`




### **Image Picker**
The project includes image picker functionality using **expo-image-picker**.

---

## **Deployment**
To publish your project, build it for the desired platform:

1. **For Android:**
   ```bash
   expo build:android
   ```

2. **For iOS:**
   ```bash
   expo build:ios
   ```

3. **For Web:**
   ```bash
   expo build:web
   ```

Follow Expo's [official guide](https://docs.expo.dev) for detailed deployment instructions.

---

## **Contributing**
Feel free to submit issues or pull requests for improvements.

---

## **License**
This project is licensed under the MIT License.
