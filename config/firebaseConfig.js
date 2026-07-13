import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiuH4Om2H3rgC-qbnSM74Osl59gSZkGpk",
  authDomain: "cv-builder-9435f.firebaseapp.com",
  projectId: "cv-builder-9435f",
  storageBucket: "cv-builder-9435f.firebasestorage.app",
  messagingSenderId: "928984143067",
  appId: "1:928984143067:android:3f3a029a96ebea473b68fe"
};

// Initialize Firebase safely for hot-reloading
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth properly for cross-platform persistence
let authInstance;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  // For React Native (iOS/Android), use AsyncStorage
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (error) {
    // Fallback if auth is already initialized during hot-reload
    authInstance = getAuth(app);
  }
}

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = authInstance;

export default app;
