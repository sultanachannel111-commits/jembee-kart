// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * 🔥 IMPORTANT:
 * Replace the below values with your own Firebase project config.
 * Go to Firebase Console → Project Settings → General → Your Apps → Web App
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

/**
 * ✅ Prevent Firebase from initializing multiple times
 * (Important for Next.js hot reload & server/client rendering)
 */
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

/**
 * ✅ Export Firebase services
 */
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
